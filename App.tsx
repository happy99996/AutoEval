import React, { useState } from 'react';
import { VehicleData, AnalysisResult } from './types';
import VehicleInput from './components/VehicleInput';
import Dashboard from './components/Dashboard';
import ChatBot from './components/ChatBot';
import { fetchMarketAnalysis, fetchDeepReasoning } from './services/geminiService';
import { Activity } from 'lucide-react';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [vehicle, setVehicle] = useState<VehicleData | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

  const handleAnalyze = async (data: VehicleData) => {
    setIsLoading(true);
    setLoadingMessage('Initializing market scan...');
    setVehicle(data);
    setAnalysis(null);

    try {
      // Step 1: Market Data
      const marketData = await fetchMarketAnalysis(data);
      setLoadingMessage('Synthesizing reliability data...');
      
      // Step 2: Reasoning
      const deepAnalysis = await fetchDeepReasoning(data, marketData.text, marketData.sources);
      setLoadingMessage('Finalizing detailed report...');

      const result: AnalysisResult = {
        searchSummary: marketData.text,
        sources: marketData.sources,
        reasoningAnalysis: deepAnalysis.reasoningAnalysis || "Analysis incomplete.",
        priceRange: deepAnalysis.priceRange || { min: 0, max: 0 },
        depreciationData: deepAnalysis.depreciationData || [],
        commonIssues: deepAnalysis.commonIssues || [],
        pros: deepAnalysis.pros || [],
        cons: deepAnalysis.cons || [],
        maintenanceCost: deepAnalysis.maintenanceCost || "Not available",
        maintenanceSchedule: deepAnalysis.maintenanceSchedule || [],
        maintenanceCostBreakdown: deepAnalysis.maintenanceCostBreakdown || [],
        fuelEfficiency: deepAnalysis.fuelEfficiency,
        similarListings: deepAnalysis.similarListings || [],
        reliabilityScore: deepAnalysis.reliabilityScore,
        vehicleImageUrl: deepAnalysis.vehicleImageUrl
      };

      setAnalysis(result);
    } catch (error) {
      console.error("Full Analysis Failed", error);
      alert("Analysis interrupted. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-zinc-100 flex flex-col">
      
      {/* Minimal Header */}
      <header className="border-b border-zinc-800 bg-background/80 backdrop-blur-lg sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-white text-black rounded-lg flex items-center justify-center">
                <Activity size={18} strokeWidth={3} />
             </div>
             <h1 className="text-lg font-display font-bold tracking-tight">
               AutoEval<span className="text-zinc-500 font-normal">.AI</span>
             </h1>
          </div>
          {isLoading && (
            <div className="hidden md:flex items-center gap-3 text-xs font-medium text-zinc-400">
               <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
               {loadingMessage}
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 md:px-6 py-12 relative">
        
        {/* Hero / Input Section */}
        <div className={`transition-all duration-700 ease-out ${analysis ? 'mb-12' : 'min-h-[60vh] flex flex-col justify-center'}`}>
          {!analysis && !isLoading && (
            <div className="text-center mb-12 animate-fade-in">
              <h2 className="text-4xl md:text-6xl font-display font-bold mb-6 tracking-tight">
                Evaluate any vehicle.
              </h2>
              <p className="text-secondary text-lg max-w-lg mx-auto leading-relaxed">
                AI-powered insights on reliability, value projection, and hidden maintenance costs.
              </p>
            </div>
          )}
          
          <div className="max-w-4xl mx-auto w-full">
            <VehicleInput onAnalyze={handleAnalyze} isLoading={isLoading} />
          </div>
        </div>

        {/* Loading Indicator */}
        {isLoading && !analysis && (
          <div className="max-w-md mx-auto text-center mt-12 animate-fade-in">
             <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden mb-4">
                <div className="h-full bg-white animate-progress origin-left w-1/2"></div>
             </div>
             <p className="text-zinc-400 text-sm animate-pulse">{loadingMessage}</p>
          </div>
        )}

        {/* Dashboard Results */}
        {vehicle && analysis && !isLoading && (
           <Dashboard vehicle={vehicle} analysis={analysis} />
        )}

      </main>

      <ChatBot />
    </div>
  );
};

export default App;