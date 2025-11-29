import { GoogleGenAI } from "@google/genai";
import { VehicleData, AnalysisResult, GroundingSource } from "../types";

// Initialize the client
// API Key is strictly from process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Uses gemini-2.5-flash with Google Search to get current market data and facts.
 */
export const fetchMarketAnalysis = async (vehicle: VehicleData): Promise<{ text: string; sources: GroundingSource[] }> => {
  try {
    const isGeneral = vehicle.price === 0 && vehicle.mileage === 0;
    
    const context = isGeneral 
        ? `Analyze the general reliability and market value of the ${vehicle.year} ${vehicle.make} ${vehicle.model} (${vehicle.fuelType}).`
        : `Analyze this vehicle: ${vehicle.year} ${vehicle.make} ${vehicle.model} with ${vehicle.mileage} km listed for ${vehicle.price} ${vehicle.currency}.`;

    const prompt = `
      ${context}
      
      Please search for:
      1. Current market price range for this specific model and year.
      2. Common defects and reported failures (engine, transmission, electronics) for this specific generation.
      3. Annual maintenance cost estimates.
      4. Fuel consumption averages.
      5. Competitor comparisons.
      
      Return a concise summary of facts.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        temperature: 0.3,
      },
    });

    // Extract grounding metadata if available
    const sources: GroundingSource[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    
    if (chunks) {
      chunks.forEach((chunk: any) => {
        if (chunk.web?.uri) {
          sources.push({
            uri: chunk.web.uri,
            title: chunk.web.title || 'Source',
          });
        }
      });
    }

    return {
      text: response.text || "Could not retrieve market data.",
      sources: sources,
    };
  } catch (error) {
    console.error("Market Analysis Error:", error);
    throw error;
  }
};

/**
 * Uses gemini-3-pro-preview with Thinking Budget for deep evaluation and strategy.
 * This function also tries to extract structured JSON from the text response for charts.
 */
export const fetchDeepReasoning = async (vehicle: VehicleData, marketContext: string, sources: GroundingSource[] = []): Promise<Partial<AnalysisResult>> => {
  try {
    const isGeneral = vehicle.price === 0;

    const prompt = `
      CONTEXT:
      Vehicle: ${vehicle.year} ${vehicle.make} ${vehicle.model} (${vehicle.fuelType}).
      ${isGeneral ? "Note: This is a general model analysis. User did not provide specific mileage or price." : `Mileage: ${vehicle.mileage} km, Price: ${vehicle.price} ${vehicle.currency}.`}
      Market Data Analysis: ${marketContext}
      Market Data Sources (URLs): ${JSON.stringify(sources)}

      TASK:
      Act as a senior automotive engineer and financial analyst. 
      Perform a deep reasoning analysis.
      
      1. Analyze the reliability and common issues. Calculate a "Reliability Score" (0-100) based on the frequency and severity of issues for this model year.
      2. Calculate a theoretical depreciation curve for the next 5 years. ${isGeneral ? "Since no specific price is provided, use the current average market value as the starting point (Year Current)." : ""}
      3. Provide a maintenance roadmap with estimated costs. Break down the costs by component percentage.
      4. Estimate fuel consumption (L/100km or MPG) and compare with category average.
      5. Identify specific common technical issues, explain them briefly, and estimate repair costs.
      6. Extract similar vehicle listings mentioned in the market data or construct them based on the sources provided. Match descriptions to the provided Source URLs if possible.
      7. Provide a URL for a representative image of this vehicle model (exterior side or front view).

      OUTPUT FORMAT:
      Return a JSON object with this EXACT structure (do not wrap in markdown code blocks if possible, or I will strip them):
      {
        "reasoningAnalysis": "Detailed 3 paragraph analysis text focusing on reliability, driving experience, and value retention...",
        "reliabilityScore": {
            "score": number,
            "rating": "string (e.g. Above Average)",
            "details": "string (e.g. Robust engine but prone to electrical glitches)"
        },
        "priceRange": { "min": number, "max": number },
        "depreciationData": [
          { "year": "Current", "value": number },
          { "year": "+1 Year", "value": number },
          { "year": "+2 Years", "value": number },
          { "year": "+3 Years", "value": number },
          { "year": "+4 Years", "value": number },
          { "year": "+5 Years", "value": number }
        ],
        "commonIssues": [
          { 
            "issue": "Name of issue (e.g. Timing Chain)", 
            "description": "Brief explanation of the failure.", 
            "estimatedRepairCost": "Cost estimate string (e.g. 1500 EUR)" 
          }
        ],
        "pros": ["pro 1", "pro 2"],
        "cons": ["con 1", "con 2"],
        "maintenanceCost": "Estimated annual cost string (e.g. 800 EUR)",
        "maintenanceSchedule": [
           { "interval": "e.g. Every 10k km", "task": "Oil change", "estimatedCost": "150 EUR" },
           { "interval": "e.g. 60k km", "task": "Brake pads", "estimatedCost": "300 EUR" }
        ],
        "maintenanceCostBreakdown": [
           { "component": "Tires", "costPercentage": 25 },
           { "component": "Brakes", "costPercentage": 15 },
           { "component": "Fluids/Filters", "costPercentage": 20 },
           { "component": "Unscheduled Repairs", "costPercentage": 40 }
        ],
        "fuelEfficiency": {
            "city": "string (e.g. 12L/100km)",
            "highway": "string (e.g. 8L/100km)",
            "combined": "string (e.g. 10L/100km)",
            "averageCombined": "string (e.g. 11L/100km)", 
            "verdict": "string comparison (e.g. '15% better than average SUV')"
        },
        "similarListings": [
            { "description": "e.g. 2018 BMW 320i", "price": "e.g. 24000 EUR", "source": "e.g. Autotrader", "url": "url from sources if available" }
        ],
        "vehicleImageUrl": "A public URL for a high-quality image of this vehicle model (exterior side or front view). If none found, leave empty."
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 32768 }, // Max thinking for Pro
        responseMimeType: "application/json", 
      },
    });

    if (response.text) {
        try {
            const cleanText = response.text.replace(/```json\n?|```/g, '').trim();
            return JSON.parse(cleanText);
        } catch (e) {
            console.error("Failed to parse JSON from reasoning model", e);
            throw new Error("Analysis failed format check.");
        }
    }
    return {};

  } catch (error) {
    console.error("Deep Reasoning Error:", error);
    throw error;
  }
};

/**
 * Fetches detailed repair information for a specific issue.
 */
export const fetchIssueDetails = async (vehicle: VehicleData, issue: string): Promise<string> => {
  try {
    const prompt = `
      Act as a senior master mechanic.
      Vehicle: ${vehicle.year} ${vehicle.make} ${vehicle.model} (${vehicle.fuelType})
      Problem: ${issue}

      Provide a technical deep-dive on this specific issue.
      Include:
      1. Root Cause Analysis (Technical explanation)
      2. Typical Symptoms to look for
      3. Repair Strategy (Summary of steps & parts often required)
      4. DIY Feasibility (Easy/Medium/Hard) and special tools needed
      
      Format with clear Markdown headers. Keep it concise but helpful.
    `;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    return response.text || "Details unavailable.";
  } catch (error) {
    console.error("Issue details fetch failed", error);
    return "Unable to retrieve detailed repair information at this moment.";
  }
};

/**
 * Chat bot instance
 */
export const createChatSession = () => {
    return ai.chats.create({
        model: 'gemini-3-pro-preview',
        config: {
            systemInstruction: "You are AutoEval AI, an expert automotive consultant. You analyze cars based on user input. Be concise, technical but accessible, and helpful.",
        }
    });
};