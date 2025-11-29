import React, { useState } from 'react';
import { VehicleData, AnalysisResult } from '../types';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { 
  ArrowUpRight, Plus, Minus, Image as ImageIcon, Loader2, X
} from 'lucide-react';
import { fetchIssueDetails } from '../services/geminiService';

interface Props {
  vehicle: VehicleData;
  analysis: AnalysisResult;
}

const Dashboard: React.FC<Props> = ({ vehicle, analysis }) => {
  const [imageError, setImageError] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<{title: string, content: string} | null>(null);
  const [loadingIssueId, setLoadingIssueId] = useState<number | null>(null);

  const PIE_COLORS = ['#ffffff', '#52525b', '#27272a', '#18181b']; 

  const handleFetchIssueDetails = async (issueTitle: string, index: number) => {
    setLoadingIssueId(index);
    try {
      const details = await fetchIssueDetails(vehicle, issueTitle);
      setSelectedIssue({ title: issueTitle, content: details });
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingIssueId(null);
    }
  };

  const relScore = analysis.reliabilityScore?.score || 0;
  
  // Minimalist Gauge Calculation
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (relScore / 100) * circumference;

  return (
    <div className="space-y-24 animate-slide-up pb-20">
      
      {/* 1. Hero Identity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-end">
         <div className="space-y-8">
            <div className="flex items-center gap-4">
               <div className="h-px w-8 bg-zinc-700"></div>
               <span className="text-xs font-medium text-zinc-500 uppercase tracking-[0.2em]">{vehicle.year} — {vehicle.fuelType}</span>
            </div>
            <h1 className="text-7xl md:text-9xl font-display font-light text-white tracking-tighter leading-[0.85]">
              {vehicle.make}<br/>
              <span className="text-zinc-600 font-extralight">{vehicle.model}</span>
            </h1>
            <p className="text-zinc-400 text-lg md:text-xl font-light leading-relaxed max-w-lg">
               {analysis.reasoningAnalysis.split('.')[0]}. {analysis.reasoningAnalysis.split('.')[1]}.
            </p>
         </div>

         {/* Vehicle Image - Unboxed */}
         <div className="relative aspect-[16/9] lg:aspect-[4/3] rounded-sm overflow-hidden bg-zinc-900/20 grayscale hover:grayscale-0 transition-all duration-1000">
            {analysis.vehicleImageUrl && !imageError ? (
               <img 
                 src={analysis.vehicleImageUrl} 
                 alt="Vehicle" 
                 className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity duration-700"
                 onError={() => setImageError(true)}
               />
            ) : (
               <div className="w-full h-full flex items-center justify-center text-zinc-800">
                  <ImageIcon size={64} strokeWidth={0.5} />
               </div>
            )}
         </div>
      </div>

      {/* 2. Key Performance Indicators - Typographic */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 border-t border-zinc-900 pt-12">
         {/* Reliability Gauge - Clean */}
         <div className="flex flex-col justify-between h-32">
            <div className="text-[10px] uppercase font-bold tracking-widest text-zinc-600">Reliability Index</div>
            <div className="relative w-20 h-20">
               <svg className="w-full h-full transform -rotate-90">
                  <circle cx="40" cy="40" r={radius} stroke="#18181b" strokeWidth="2" fill="transparent" />
                  <circle 
                     cx="40" cy="40" r={radius} 
                     stroke="white" 
                     strokeWidth="2" 
                     fill="transparent" 
                     strokeDasharray={circumference} 
                     strokeDashoffset={strokeDashoffset} 
                     strokeLinecap="square"
                     className="transition-all duration-1000 ease-out"
                  />
               </svg>
               <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-light tracking-tighter">{relScore}</span>
               </div>
            </div>
         </div>

         <MinimalStat label="Market Valuation" value={analysis.depreciationData?.[0]?.value ? `${vehicle.currency} ${analysis.depreciationData[0].value.toLocaleString()}` : '—'} />
         <MinimalStat label="Annual Upkeep" value={analysis.maintenanceCost} />
         <MinimalStat label="Fuel Efficiency" value={analysis.fuelEfficiency?.combined || '—'} />
      </div>

      {/* 3. Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-24">
         
         {/* Depreciation - Sparkline Style */}
         <div className="lg:col-span-2 space-y-8">
            <h3 className="text-3xl font-display font-light text-white tracking-tight">Depreciation</h3>
            <div className="h-[400px] w-full relative">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analysis.depreciationData} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#fff" stopOpacity={0.1}/>
                        <stop offset="100%" stopColor="#fff" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis 
                        dataKey="year" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fontSize: 12, fill: '#52525b', fontFamily: 'Inter'}} 
                        dy={20}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#000', border: 'none', color: '#fff', fontSize: '12px' }}
                      cursor={{ stroke: '#333', strokeWidth: 1 }}
                    />
                    <Area type="monotone" dataKey="value" stroke="#fff" strokeWidth={1} fill="url(#chartGradient)" />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
         </div>

         {/* Maintenance Breakdown - Donut */}
         <div className="space-y-8 flex flex-col justify-between">
            <h3 className="text-3xl font-display font-light text-white tracking-tight">Cost Split</h3>
            <div className="h-[300px] relative">
               <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analysis.maintenanceCostBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="costPercentage"
                      stroke="none"
                      cornerRadius={0}
                    >
                      {analysis.maintenanceCostBreakdown?.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#000', border: 'none', borderRadius: '0px', fontSize: '12px' }} itemStyle={{color: '#fff'}} />
                  </PieChart>
               </ResponsiveContainer>
               <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                   <div className="text-3xl font-light text-white">{analysis.maintenanceCostBreakdown?.[0]?.costPercentage || 0}%</div>
                   <div className="text-[10px] text-zinc-500 uppercase tracking-widest mt-2">Primary Cost</div>
               </div>
            </div>
         </div>
      </div>

      {/* 4. Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24 border-t border-zinc-900 pt-12">
         {/* Verdict */}
         <div className="space-y-8">
            <h3 className="text-2xl font-display font-light text-white tracking-tight">Verdict</h3>
            <div className="space-y-6">
               {analysis.pros?.map((pro, i) => (
                  <div key={`pro-${i}`} className="flex gap-4 items-baseline">
                     <Plus size={12} className="text-zinc-500 shrink-0" />
                     <p className="text-base text-zinc-300 font-light leading-relaxed">{pro}</p>
                  </div>
               ))}
               <div className="w-12 h-px bg-zinc-800 my-6"></div>
               {analysis.cons?.map((con, i) => (
                  <div key={`con-${i}`} className="flex gap-4 items-baseline">
                     <Minus size={12} className="text-zinc-600 shrink-0" />
                     <p className="text-base text-zinc-500 font-light leading-relaxed">{con}</p>
                  </div>
               ))}
            </div>
         </div>

         {/* Common Issues */}
         <div className="space-y-8">
            <h3 className="text-2xl font-display font-light text-white tracking-tight">Technical Advisory</h3>
            <div className="space-y-0">
               {analysis.commonIssues?.map((issue, i) => (
                  <button 
                     key={i}
                     onClick={() => handleFetchIssueDetails(issue.issue, i)}
                     disabled={loadingIssueId === i}
                     className="w-full text-left py-6 border-b border-zinc-900 group flex items-center justify-between hover:px-4 transition-all duration-300"
                  >
                     <div className="pr-4">
                        <div className="text-white text-lg font-light mb-1 group-hover:text-white transition-colors">{issue.issue}</div>
                        <div className="text-xs text-zinc-600 font-mono tracking-wide">{issue.estimatedRepairCost}</div>
                     </div>
                     {loadingIssueId === i ? <Loader2 size={18} className="animate-spin text-white"/> : <ArrowUpRight size={18} className="text-zinc-700 group-hover:text-white transition-colors"/>}
                  </button>
               ))}
            </div>
         </div>
      </div>

      {/* 5. Listings */}
      {analysis.similarListings && analysis.similarListings.length > 0 && (
        <div className="pt-12">
           <h3 className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-8">Market Context</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {analysis.similarListings.map((listing, i) => (
                 <a key={i} href={listing.url} target="_blank" rel="noreferrer" className="block p-6 border border-zinc-900 hover:border-zinc-700 hover:bg-white/[0.01] transition-all group">
                    <div className="flex justify-between items-start mb-6">
                       <span className="text-[10px] text-zinc-600 uppercase tracking-widest group-hover:text-zinc-400">{listing.source}</span>
                       <ArrowUpRight size={14} className="text-zinc-800 group-hover:text-white transition-colors"/>
                    </div>
                    <div className="text-white text-lg font-light mb-2">{listing.description}</div>
                    <div className="text-zinc-500 text-sm font-mono">{listing.price}</div>
                 </a>
              ))}
           </div>
        </div>
      )}

      {/* Minimal Modal */}
      {selectedIssue && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-[#050505]/95 backdrop-blur-sm transition-opacity" onClick={() => setSelectedIssue(null)}></div>
            <div className="bg-[#0a0a0a] border border-zinc-800 w-full max-w-2xl max-h-[85vh] overflow-y-auto relative animate-fade-in">
               <div className="p-8 sticky top-0 bg-[#0a0a0a] z-10 flex justify-between items-center border-b border-zinc-900">
                  <h3 className="text-xl font-light text-white tracking-tight">{selectedIssue.title}</h3>
                  <button onClick={() => setSelectedIssue(null)} className="text-zinc-500 hover:text-white transition-colors">
                     <X size={24} strokeWidth={1} />
                  </button>
               </div>
               <div className="p-8 md:p-12">
                  <div className="prose prose-invert prose-zinc max-w-none">
                     <div className="whitespace-pre-wrap text-zinc-300 font-light leading-loose text-base">
                        {selectedIssue.content}
                     </div>
                  </div>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};

// Component: Minimal Stat
const MinimalStat: React.FC<{label: string, value: string}> = ({label, value}) => (
   <div className="flex flex-col justify-between h-32 border-l border-zinc-900 pl-6 lg:pl-12">
      <div className="text-[10px] uppercase font-bold tracking-widest text-zinc-600">{label}</div>
      <div className="text-white text-3xl lg:text-4xl font-light tracking-tighter">{value}</div>
   </div>
);

export default Dashboard;