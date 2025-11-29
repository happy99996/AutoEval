import React, { useState } from 'react';
import { VehicleData, AnalysisResult } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { 
  Check, TrendingDown, Clock, Fuel, ArrowUpRight, Wrench, PieChart as PieChartIcon, Image as ImageIcon, ShieldCheck,
  ChevronRight, X, Loader2, AlertTriangle
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

  // Colors for minimal look
  const CHART_COLOR = "#fff"; // White stroke
  const PIE_COLORS = ['#fff', '#a1a1aa', '#52525b', '#27272a', '#18181b']; // Monochromatic scale

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
  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (relScore / 100) * circumference;

  return (
    <div className="space-y-6 animate-slide-up">
      
      {/* 1. Header Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {/* Car Identity */}
         <div className="md:col-span-2 matte-card rounded-3xl p-8 flex flex-col justify-between relative overflow-hidden">
            <div className="relative z-10">
               <div className="text-secondary text-xs font-bold uppercase tracking-widest mb-2">{vehicle.year} Model Analysis</div>
               <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-4 tracking-tighter">
                 {vehicle.make} <span className="text-zinc-400">{vehicle.model}</span>
               </h2>
               <div className="flex gap-4">
                  <span className="bg-zinc-800 text-zinc-300 px-3 py-1 rounded-full text-xs font-medium border border-zinc-700">{vehicle.fuelType}</span>
                  {isGeneralAnalysis && <span className="bg-zinc-800 text-zinc-300 px-3 py-1 rounded-full text-xs font-medium border border-zinc-700">Market Evaluation</span>}
               </div>
            </div>
            
            {/* Abstract Background Decoration */}
            <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-gradient-to-l from-zinc-800/20 to-transparent pointer-events-none"></div>
         </div>

         {/* Vehicle Image */}
         <div className="matte-card rounded-3xl overflow-hidden relative group h-64 md:h-auto">
            {analysis.vehicleImageUrl && !imageError ? (
               <img 
                 src={analysis.vehicleImageUrl} 
                 alt="Vehicle" 
                 className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100"
                 onError={() => setImageError(true)}
               />
            ) : (
               <div className="w-full h-full flex flex-col items-center justify-center text-zinc-600 bg-zinc-900">
                  <ImageIcon size={32} strokeWidth={1} className="mb-2"/>
                  <span className="text-xs uppercase tracking-wider">No Image</span>
               </div>
            )}
            {/* Gradient Overlay for text readability if needed later */}
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent"></div>
         </div>
      </div>

      {/* 2. Key Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         {/* Reliability Score */}
         <div className="matte-card rounded-2xl p-6 flex flex-col items-center justify-center relative">
            <div className="relative w-20 h-20 mb-3">
               <svg className="w-full h-full transform -rotate-90">
                  <circle cx="40" cy="40" r={radius} stroke="#27272a" strokeWidth="6" fill="transparent" />
                  <circle 
                     cx="40" cy="40" r={radius} 
                     stroke="white" 
                     strokeWidth="6" 
                     fill="transparent" 
                     strokeDasharray={circumference} 
                     strokeDashoffset={strokeDashoffset} 
                     strokeLinecap="round"
                     className="transition-all duration-1000 ease-out"
                  />
               </svg>
               <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold">{relScore}</span>
               </div>
            </div>
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Reliability</span>
         </div>

         <StatCard label="Estimated Value" value={analysis.depreciationData?.[0]?.value ? `${vehicle.currency} ${analysis.depreciationData[0].value.toLocaleString()}` : 'N/A'} sub="Current Market Avg" />
         <StatCard label="Annual Maint." value={analysis.maintenanceCost} sub="Estimated Cost" />
         <StatCard label="Fair Range" value={`${(analysis.priceRange?.min || 0)/1000}k - ${(analysis.priceRange?.max || 0)/1000}k`} sub="Low - High" />
      </div>

      {/* 3. Deep Analysis Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Charts & Data */}
        <div className="lg:col-span-2 space-y-6">
           
           {/* Depreciation Chart */}
           <div className="matte-card rounded-3xl p-8">
              <div className="flex items-center justify-between mb-8">
                 <h3 className="text-xl font-display font-bold">Value Projection</h3>
                 <div className="flex gap-4">
                    <div className="text-right">
                       <div className="text-[10px] text-zinc-500 uppercase font-bold">5 Year Loss</div>
                       <div className="text-sm font-medium text-white">
                         -{vehicle.currency} {analysis.depreciationData.length > 1 ? (analysis.depreciationData[0].value - analysis.depreciationData[analysis.depreciationData.length - 1].value).toLocaleString() : 0}
                       </div>
                    </div>
                 </div>
              </div>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analysis.depreciationData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#fff" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#fff" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                    <XAxis dataKey="year" stroke="#52525b" tick={{fontSize: 12}} tickLine={false} axisLine={false} dy={10} />
                    <YAxis stroke="#52525b" tick={{fontSize: 12}} tickLine={false} axisLine={false} tickFormatter={(val) => `${val/1000}k`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px', color: '#fff' }}
                      itemStyle={{ color: '#fff' }}
                      cursor={{ stroke: '#52525b', strokeWidth: 1 }}
                    />
                    <Area type="monotone" dataKey="value" stroke="#fff" strokeWidth={2} fill="url(#chartGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
           </div>

           {/* Maintenance Section */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Cost Breakdown */}
              <div className="matte-card rounded-3xl p-8">
                 <h3 className="text-lg font-display font-bold mb-6 flex items-center gap-2">
                    <PieChartIcon size={18} className="text-zinc-500"/> Cost Distribution
                 </h3>
                 <div className="h-[200px] relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={analysis.maintenanceCostBreakdown}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={70}
                          paddingAngle={2}
                          dataKey="costPercentage"
                          nameKey="component"
                          stroke="none"
                        >
                          {analysis.maintenanceCostBreakdown?.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#18181b', border: 'none', borderRadius: '8px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                    {/* Center Label */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                       <span className="text-xs font-bold text-zinc-500">Annual</span>
                    </div>
                 </div>
              </div>

              {/* Schedule */}
              <div className="matte-card rounded-3xl p-8 overflow-hidden">
                 <h3 className="text-lg font-display font-bold mb-6 flex items-center gap-2">
                    <Clock size={18} className="text-zinc-500"/> Roadmap
                 </h3>
                 <div className="relative space-y-6 pl-4 border-l border-zinc-800">
                    {analysis.maintenanceSchedule?.slice(0, 3).map((item, i) => (
                      <div key={i} className="relative">
                         <div className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-zinc-600 border-2 border-surface"></div>
                         <div className="text-xs font-bold text-zinc-400 mb-0.5">{item.interval}</div>
                         <div className="text-sm font-medium text-white">{item.task}</div>
                         <div className="text-xs text-zinc-600 mt-1">{item.estimatedCost}</div>
                      </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>

        {/* Right: Insights & Issues */}
        <div className="space-y-6">
           
           {/* Expert Verdict */}
           <div className="matte-card rounded-3xl p-8 bg-zinc-900">
              <h3 className="text-lg font-display font-bold mb-4">Expert Analysis</h3>
              <p className="text-sm text-zinc-400 leading-relaxed mb-6">
                 {analysis.reasoningAnalysis}
              </p>
              
              <div className="space-y-3">
                 <div className="flex items-center gap-3 text-sm text-zinc-300">
                    <Check size={16} className="text-white flex-shrink-0" />
                    <span>{analysis.pros?.[0]}</span>
                 </div>
                 <div className="flex items-center gap-3 text-sm text-zinc-300">
                    <Check size={16} className="text-white flex-shrink-0" />
                    <span>{analysis.pros?.[1]}</span>
                 </div>
                 <div className="flex items-center gap-3 text-sm text-zinc-300">
                    <AlertTriangle size={16} className="text-zinc-500 flex-shrink-0" />
                    <span>{analysis.cons?.[0]}</span>
                 </div>
              </div>
           </div>

           {/* Common Issues Interactive List */}
           <div className="matte-card rounded-3xl p-6">
              <h3 className="text-lg font-display font-bold mb-4 flex items-center gap-2">
                 <Wrench size={18} className="text-zinc-500"/> Common Issues
              </h3>
              <div className="space-y-2">
                 {analysis.commonIssues?.map((issue, i) => (
                    <button 
                       key={i}
                       onClick={() => handleFetchIssueDetails(issue.issue, i)}
                       disabled={loadingIssueId === i}
                       className="w-full text-left bg-background hover:bg-zinc-800 border border-zinc-800 rounded-xl p-4 transition-all group"
                    >
                       <div className="flex justify-between items-center mb-1">
                          <span className="font-semibold text-sm text-white">{issue.issue}</span>
                          {loadingIssueId === i ? <Loader2 size={14} className="animate-spin text-zinc-500"/> : <ChevronRight size={14} className="text-zinc-600 group-hover:text-white transition-colors"/>}
                       </div>
                       <p className="text-xs text-zinc-500 truncate">{issue.description}</p>
                    </button>
                 ))}
              </div>
           </div>

           {/* Fuel Compact */}
           <div className="matte-card rounded-3xl p-6">
              <h3 className="text-lg font-display font-bold mb-4 flex items-center gap-2">
                 <Fuel size={18} className="text-zinc-500"/> Efficiency
              </h3>
              <div className="flex justify-between items-center">
                 <div className="text-center">
                    <div className="text-2xl font-bold text-white">{analysis.fuelEfficiency?.combined || '-'}</div>
                    <div className="text-[10px] text-zinc-500 uppercase font-bold">Combined</div>
                 </div>
                 <div className="h-8 w-px bg-zinc-800"></div>
                 <div className="text-center">
                    <div className="text-2xl font-bold text-zinc-400">{analysis.fuelEfficiency?.highway || '-'}</div>
                    <div className="text-[10px] text-zinc-500 uppercase font-bold">Highway</div>
                 </div>
              </div>
              <div className="mt-4 text-xs text-center text-zinc-500 bg-zinc-800/50 py-2 rounded-lg">
                 {analysis.fuelEfficiency?.verdict}
              </div>
           </div>

        </div>
      </div>

      {/* 4. Similar Listings Table (Clean) */}
      {analysis.similarListings && analysis.similarListings.length > 0 && (
        <div className="matte-card rounded-3xl p-8">
           <h3 className="text-lg font-display font-bold mb-6">Market Listings</h3>
           <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                 <thead>
                    <tr className="border-b border-zinc-800">
                       <th className="py-3 px-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Vehicle</th>
                       <th className="py-3 px-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Price</th>
                       <th className="py-3 px-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Source</th>
                       <th className="py-3 px-4 text-xs font-bold text-zinc-500 uppercase tracking-wider text-right">Action</th>
                    </tr>
                 </thead>
                 <tbody className="text-sm">
                    {analysis.similarListings.map((listing, i) => (
                       <tr key={i} className="group hover:bg-zinc-800/50 transition-colors border-b border-zinc-800 last:border-0">
                          <td className="py-4 px-4 font-medium text-zinc-300 group-hover:text-white transition-colors">{listing.description}</td>
                          <td className="py-4 px-4 text-zinc-400">{listing.price}</td>
                          <td className="py-4 px-4 text-zinc-500">{listing.source}</td>
                          <td className="py-4 px-4 text-right">
                             {listing.url ? (
                                <a href={listing.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-white text-xs font-bold border border-zinc-700 px-3 py-1.5 rounded-lg hover:bg-white hover:text-black transition-all">
                                   View <ArrowUpRight size={12} />
                                </a>
                             ) : <span className="text-zinc-600">-</span>}
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>
      )}

      {/* Modal for Details */}
      {selectedIssue && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" onClick={() => setSelectedIssue(null)}></div>
            <div className="bg-surface border border-zinc-700 rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-y-auto relative shadow-2xl animate-fade-in flex flex-col">
               <div className="p-6 border-b border-zinc-800 flex justify-between items-center sticky top-0 bg-surface/95 backdrop-blur z-10">
                  <div>
                     <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Issue Deep Dive</div>
                     <h3 className="text-xl font-display font-bold text-white">{selectedIssue.title}</h3>
                  </div>
                  <button onClick={() => setSelectedIssue(null)} className="text-zinc-500 hover:text-white transition-colors">
                     <X size={24} />
                  </button>
               </div>
               <div className="p-8">
                  <div className="prose prose-invert prose-zinc max-w-none">
                     <div className="whitespace-pre-wrap font-sans text-zinc-300 leading-relaxed">
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

// Minimal Stat Card
const StatCard: React.FC<{label: string, value: string, sub: string}> = ({label, value, sub}) => (
   <div className="matte-card rounded-2xl p-6 flex flex-col justify-center">
      <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">{label}</span>
      <span className="text-xl md:text-2xl font-bold text-white mb-1 truncate">{value}</span>
      <span className="text-[10px] text-zinc-600">{sub}</span>
   </div>
);

export default Dashboard;