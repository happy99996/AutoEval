import React, { useState } from 'react';
import { VehicleData, AnalysisResult } from './types';
import VehicleInput from './components/VehicleInput';
import Dashboard from './components/Dashboard';
import ChatBot from './components/ChatBot';
import { fetchMarketAnalysis, fetchDeepReasoning } from './services/geminiService';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [vehicle, setVehicle] = useState<VehicleData | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

  const handleAnalyze = async (data: VehicleData) => {
    setIsLoading(true);
    setLoadingMessage('Scanning market data...');
    setVehicle(data);
    setAnalysis(null);

    try {
      const marketData = await fetchMarketAnalysis(data);
      setLoadingMessage('Processing deep analysis...');
      
      const deepAnalysis = await fetchDeepReasoning(data, marketData.text, marketData.sources);
      setLoadingMessage('Finalizing report...');

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
    <div className="min-h-screen text-zinc-100 flex flex-col selection:bg-white selection:text-black">
      
      {/* Ultra Minimal Header */}
      <header className="fixed top-0 left-0 w-full z-50 py-6 pointer-events-none">
        <div className="container mx-auto px-6 flex justify-between items-center">
          <div className="pointer-events-auto">
             <h1 className="text-xl font-display font-bold tracking-tighter text-white">
               Auto<span className="text-zinc-600">Eval</span>
             </h1>
          </div>
          {isLoading && (
            <div className="text-xs font-mono text-zinc-500 animate-pulse bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm border border-zinc-800">
               {loadingMessage}
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 md:px-6 pt-32 pb-12">
        
        {/* Input Area */}
        <div className={`transition-all duration-1000 ease-out ${analysis ? 'mb-24 opacity-0 h-0 overflow-hidden pointer-events-none' : 'min-h-[60vh] flex flex-col justify-center opacity-100'}`}>
          <div className="max-w-4xl mx-auto w-full space-y-12">
             <div className="space-y-4">
                <h2 className="text-5xl md:text-7xl font-display font-bold tracking-tighter text-white leading-none">
                   Vehicle<br/>Intelligence.
                </h2>
                <p className="text-zinc-500 text-lg md:text-xl max-w-lg font-light">
                   AI-driven analysis of reliability, depreciation, and hidden costs for any automobile.
                </p>
             </div>
             <VehicleInput onAnalyze={handleAnalyze} isLoading={isLoading} />
          </div>
        </div>

        {/* Loading State */}
        {isLoading && !analysis && (
          <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-0">
             <div className="w-64 h-1 bg-zinc-900 overflow-hidden">
                <div className="h-full bg-white animate-progress origin-left w-full"></div>
             </div>
          </div>
        )}

        {/* Results */}
        {vehicle && analysis && !isLoading && (
           <Dashboard vehicle={vehicle} analysis={analysis} />
        )}

      </main>

      <ChatBot />
    </div>
  );
};

export default App;