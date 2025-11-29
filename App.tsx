import React, { useState } from 'react';
import { VehicleData, AnalysisResult } from './types';
import VehicleInput from './components/VehicleInput';
import Dashboard from './components/Dashboard';
import ChatBot from './components/ChatBot';
import { fetchMarketAnalysis, fetchDeepReasoning } from './services/geminiService';
import { LayoutDashboard, Sparkles, AlertCircle } from 'lucide-react';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [vehicle, setVehicle] = useState<VehicleData | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

  const handleAnalyze = async (data: VehicleData) => {
    setIsLoading(true);
    setLoadingMessage('Scanning market data & history...');
    setVehicle(data);
    setAnalysis(null);

    try {
      // Step 1: Market Data
      const marketData = await fetchMarketAnalysis(data);
      
      // Step 2: Reasoning
      setLoadingMessage('Analyzing reliability & common issues...');
      const deepAnalysis = await fetchDeepReasoning(data, marketData.text, marketData.sources);

      // Step 3: Compilation
      setLoadingMessage('Generating maintenance roadmap & charts...');
      
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
    <div className="min-h-screen bg-surface text-gray-100 pb-20 relative">
      
      {/* Subtle Background Gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-900/10 via-surface to-surface pointer-events-none z-0"></div>

      {/* Clean Navbar */}
      <header className="border-b border-white/5 bg-surface/80 backdrop-blur-md sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
             <div className="p-2 bg-primary/10 rounded-lg">
                <LayoutDashboard className="text-primary" size={24} />
             </div>
             <div>
                <h1 className="text-xl font-display font-bold text-white tracking-wide">
                  AutoEval
                </h1>
             </div>
          </div>
          {isLoading && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full text-xs text-gray-400">
               <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
               Processing
            </div>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 md:px-6 py-8 relative z-10">
        
        {/* Intro */}
        <div className="max-w-4xl mx-auto mb-10">
          {!analysis && !isLoading && (
            <div className="text-center mb-10 animate-fade-in pt-10">
              <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
                Smart Vehicle Analysis
              </h2>
              <p className="text-secondary text-lg max-w-xl mx-auto">
                Get instant value estimations, maintenance forecasts, and hidden reliability issues using AI.
              </p>
            </div>
          )}
          
          <VehicleInput onAnalyze={handleAnalyze} isLoading={isLoading} />
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="max-w-2xl mx-auto mt-20 text-center animate-fade-in">
             <div className="w-16 h-16 mx-auto mb-6 border-4 border-card rounded-full border-t-primary animate-spin"></div>
             <h3 className="text-2xl font-display text-white mb-2">Analyzing Vehicle DNA</h3>
             <p className="text-secondary text-lg transition-all duration-300 animate-pulse">{loadingMessage}</p>
          </div>
        )}

        {/* Dashboard */}
        {vehicle && analysis && !isLoading && (
           <Dashboard vehicle={vehicle} analysis={analysis} />
        )}

      </main>

      <ChatBot />
    </div>
  );
};

export default App;