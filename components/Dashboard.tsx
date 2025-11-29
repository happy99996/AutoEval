import React, { useState } from 'react';
import { VehicleData, AnalysisResult } from '../types';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { 
  Check, ArrowUpRight, Plus, Minus, Image as ImageIcon, Loader2, X
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

  const isGeneralAnalysis = vehicle.price === 0;

  // Monochromatic Palette
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
  
  // Minimalist Gauge
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (relScore / 100) * circumference;

  return (
    <div className="space-y-16 animate-slide-up pb-20">
      
      {/* 1. Hero Identity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
         <div className="space-y-6">
            <div className="inline-flex items-center gap-3">
               <span className="px-3 py-1 rounded-full border border-zinc-800 text-[10px] font-bold uppercase tracking-widest text-zinc-400">{vehicle.year}</span>
               <span className="px-3 py-1 rounded-full border border-zinc-800 text-[10px] font-bold uppercase tracking-widest text-zinc-400">{vehicle.fuelType}</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-display font-bold text-white tracking-tighter leading-[0.9]">
              {vehicle.make}<br/>
              <span className="text-zinc-600">{vehicle.model}</span>
            </h1>
            <p className="text-zinc-400 text-lg max-w-md font-light leading-relaxed">
               {analysis.reasoningAnalysis.split('.')[0]}. {analysis.reasoningAnalysis.split('.')[1]}.
            </p>
         </div>

         {/* Vehicle Image - Minimal & Clean */}
         <div className="relative aspect-video rounded-3xl overflow-hidden bg-zinc-900/50">
            {analysis.vehicleImageUrl && !imageError ? (
               <img 
                 src={analysis.vehicleImageUrl} 
                 alt="Vehicle" 
                 className="w-full h-full object-cover transition-transform duration-1000 hover:scale-105"
                 onError={() => setImageError(true)}
               />
            ) : (
               <div className="w-full h-full flex flex-col items-center justify-center text-zinc-700">
                  <ImageIcon size={48} strokeWidth={1} />
               </div>
            )}
         </div>
      </div>

      {/* 2. Primary Metrics - Clean Typography */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 border-y border-zinc-900 py-12">
         {/* Reliability Gauge */}
         <div className="flex flex-col items-start gap-4">
            <div className="relative w-16 h-16">
               <svg className="w-full h-full transform -rotate-90">
                  <circle cx="32" cy="32" r={radius} stroke="#27272a" strokeWidth="4" fill="transparent" />
                  <circle 
                     cx="32" cy="32" r={radius} 
                     stroke="white" 
                     strokeWidth="4" 
                     fill="transparent" 
                     strokeDasharray={circumference} 
                     strokeDashoffset={strokeDashoffset} 
                     strokeLinecap="round"
                     className="transition-all duration-1000 ease-out"
                  />
               </svg>
               <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-bold">{relScore}</span>
               </div>
            </div>
            <div>
               <div className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Reliability</div>
               <div className="text-white text-lg font-medium">{analysis.reliabilityScore?.rating || 'N/A'}</div>
            </div>
         </div>

         <MinimalStat label="Est. Market Value" value={analysis.depreciationData?.[0]?.value ? `${vehicle.currency} ${analysis.depreciationData[0].value.toLocaleString()}` : 'N/A'} />
         <MinimalStat label="Annual Maintenance" value={analysis.maintenanceCost} />
         <MinimalStat label="Combined Efficiency" value={analysis.fuelEfficiency?.combined || 'N/A'} />
      </div>

      {/* 3. Data Visualization Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
         
         {/* Depreciation - Ultra Minimal Chart */}
         <div className="lg:col-span-2 space-y-8">
            <h3 className="text-2xl font-display font-bold text-white">Value Projection</h3>
            <div className="matte-card rounded-3xl p-8 h-[300px] relative overflow-hidden group">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analysis.depreciationData} margin={{ top: 20, right: 20, left: 20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#fff" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#fff" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="year" stroke="#333" tick={{fontSize: 10, fill: '#666'}} tickLine={false} axisLine={false} dy={10} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#09090b', border: '1px solid #333', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                      itemStyle={{ color: '#fff' }}
                      cursor={{ stroke: '#333', strokeWidth: 1, strokeDasharray: '4 4' }}
                    />
                    <Area type="monotone" dataKey="value" stroke="#fff" strokeWidth={1.5} fill="url(#chartGradient)" />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
         </div>

         {/* Maintenance Cost Breakdown */}
         <div className="space-y-8">
            <h3 className="text-2xl font-display font-bold text-white">Cost Structure</h3>
            <div className="matte-card rounded-3xl p-8 h-[300px] flex items-center justify-center relative">
               <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analysis.maintenanceCostBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="costPercentage"
                      stroke="none"
                    >
                      {analysis.maintenanceCostBreakdown?.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#09090b', border: 'none', borderRadius: '4px', fontSize: '12px' }} itemStyle={{color: '#fff'}} />
                  </PieChart>
               </ResponsiveContainer>
               <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                   <div className="text-center">
                       <div className="text-xs text-zinc-500 uppercase tracking-widest">Total</div>
                       <div className="text-white font-bold">{analysis.maintenanceCost}</div>
                   </div>
               </div>
            </div>
         </div>
      </div>

      {/* 4. Insights & Issues */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
         {/* Pros/Cons */}
         <div className="space-y-6">
            <h3 className="text-2xl font-display font-bold text-white">Verdict</h3>
            <div className="space-y-4">
               {analysis.pros?.map((pro, i) => (
                  <div key={`pro-${i}`} className="flex items-start gap-4 group">
                     <div className="w-5 h-5 rounded-full border border-zinc-800 flex items-center justify-center mt-1 group-hover:bg-white group-hover:border-white transition-colors">
                        <Plus size={10} className="text-zinc-500 group-hover:text-black" />
                     </div>
                     <p className="text-sm text-zinc-300 font-light leading-relaxed">{pro}</p>
                  </div>
               ))}
               <div className="h-px bg-zinc-900 my-4"></div>
               {analysis.cons?.map((con, i) => (
                  <div key={`con-${i}`} className="flex items-start gap-4 group">
                     <div className="w-5 h-5 rounded-full border border-zinc-800 flex items-center justify-center mt-1 group-hover:bg-zinc-800 transition-colors">
                        <Minus size={10} className="text-zinc-500" />
                     </div>
                     <p className="text-sm text-zinc-400 font-light leading-relaxed">{con}</p>
                  </div>
               ))}
            </div>
         </div>

         {/* Interactive Issues */}
         <div className="space-y-6">
            <h3 className="text-2xl font-display font-bold text-white">Common Issues</h3>
            <div className="divide-y divide-zinc-900">
               {analysis.commonIssues?.map((issue, i) => (
                  <button 
                     key={i}
                     onClick={() => handleFetchIssueDetails(issue.issue, i)}
                     disabled={loadingIssueId === i}
                     className="w-full text-left py-4 group flex items-center justify-between hover:pl-2 transition-all"
                  >
                     <div>
                        <div className="text-white font-medium mb-1 group-hover:text-white transition-colors">{issue.issue}</div>
                        <div className="text-xs text-zinc-500 font-mono">{issue.estimatedRepairCost}</div>
                     </div>
                     {loadingIssueId === i ? <Loader2 size={16} className="animate-spin text-zinc-600"/> : <ArrowUpRight size={16} className="text-zinc-700 group-hover:text-white transition-colors"/>}
                  </button>
               ))}
            </div>
         </div>
      </div>

      {/* 5. Listings */}
      {analysis.similarListings && analysis.similarListings.length > 0 && (
        <div className="border-t border-zinc-900 pt-12">
           <h3 className="text-lg font-bold text-white mb-6 uppercase tracking-widest text-[10px]">Market References</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {analysis.similarListings.map((listing, i) => (
                 <a key={i} href={listing.url} target="_blank" rel="noreferrer" className="matte-card p-6 rounded-2xl block group hover:border-zinc-700 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                       <span className="text-[10px] text-zinc-500 uppercase tracking-widest">{listing.source}</span>
                       <ArrowUpRight size={14} className="text-zinc-600 group-hover:text-white transition-colors"/>
                    </div>
                    <div className="text-white font-medium mb-1">{listing.description}</div>
                    <div className="text-zinc-400 text-sm">{listing.price}</div>
                 </a>
              ))}
           </div>
        </div>
      )}

      {/* Details Modal - Clean */}
      {selectedIssue && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/90 backdrop-blur-md transition-opacity" onClick={() => setSelectedIssue(null)}></div>
            <div className="bg-[#0a0a0a] border border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto relative animate-fade-in shadow-2xl">
               <div className="p-6 sticky top-0 bg-[#0a0a0a]/95 backdrop-blur z-10 flex justify-between items-center border-b border-zinc-900">
                  <h3 className="text-lg font-bold text-white">{selectedIssue.title}</h3>
                  <button onClick={() => setSelectedIssue(null)} className="text-zinc-500 hover:text-white transition-colors">
                     <X size={20} />
                  </button>
               </div>
               <div className="p-8">
                  <div className="prose prose-invert prose-zinc max-w-none prose-p:font-light prose-headings:font-medium">
                     <div className="whitespace-pre-wrap text-zinc-300 leading-relaxed text-sm">
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

// Ultra Minimal Stat
const MinimalStat: React.FC<{label: string, value: string}> = ({label, value}) => (
   <div className="flex flex-col gap-1">
      <div className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">{label}</div>
      <div className="text-white text-3xl font-light tracking-tight">{value}</div>
   </div>
);

export default Dashboard;