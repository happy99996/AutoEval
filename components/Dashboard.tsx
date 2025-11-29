import React, { useState } from 'react';
import { VehicleData, AnalysisResult } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { 
  AlertCircle, Check, TrendingDown, Activity, 
  Clock, Fuel, ArrowUpRight, Wrench, PieChart as PieChartIcon, Image as ImageIcon, ShieldCheck,
  ChevronRight, X, Loader2
} from 'lucide-react';
import { fetchIssueDetails } from '../services/geminiService';

interface Props {
  vehicle: VehicleData;
  analysis: AnalysisResult;
}

const Dashboard: React.FC<Props> = ({ vehicle, analysis }) => {
  const [imageError, setImageError] = useState(false);
  
  // Issue Details Modal State
  const [selectedIssue, setSelectedIssue] = useState<{title: string, content: string} | null>(null);
  const [loadingIssueId, setLoadingIssueId] = useState<number | null>(null);

  const isGeneralAnalysis = vehicle.price === 0;

  // Calculated Metrics
  const pricePerKm = !isGeneralAnalysis && vehicle.mileage > 0 
    ? (vehicle.price / vehicle.mileage).toFixed(2) 
    : 'N/A';
  
  const estimatedCostEfficiency = !isGeneralAnalysis && vehicle.price > 0 && analysis.priceRange
    ? ((1 - (vehicle.price - analysis.priceRange.min) / (analysis.priceRange.max - analysis.priceRange.min)) * 100).toFixed(0)
    : null;

  // Fuel comparison logic
  const parseFuel = (str?: string) => parseFloat((str || '0').replace(/[^0-9.]/g, '')) || 0;
  const combinedVal = parseFuel(analysis.fuelEfficiency?.combined);
  const averageVal = parseFuel(analysis.fuelEfficiency?.averageCombined);
  
  // Simple heuristic: if unit is L/100km (contains 'L'), lower is better. If MPG, higher is better.
  const isLiters = (analysis.fuelEfficiency?.combined || '').includes('L');
  const maxVal = Math.max(combinedVal, averageVal) * 1.5; // Scale for bar chart
  const vehiclePercent = maxVal > 0 ? (combinedVal / maxVal) * 100 : 0;
  const averagePercent = maxVal > 0 ? (averageVal / maxVal) * 100 : 0;

  // Colors for Pie Chart
  const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'];
  
  // Reliability Score Color
  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10b981'; // Success
    if (score >= 60) return '#3b82f6'; // Primary
    if (score >= 40) return '#f59e0b'; // Warning
    return '#ef4444'; // Danger
  };
  
  const relScore = analysis.reliabilityScore?.score || 0;
  const scoreColor = getScoreColor(relScore);

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

  return (
    <div className="space-y-8 animate-slide-up">
      
      {/* Header Summary & Image */}
      <div className="flex flex-col md:flex-row gap-6 border-b border-white/5 pb-8">
        
        {/* Vehicle Image or Placeholder */}
        <div className="w-full md:w-1/3 aspect-video relative rounded-2xl overflow-hidden bg-card border border-white/5 shadow-xl">
           {analysis.vehicleImageUrl && !imageError ? (
             <img 
               src={analysis.vehicleImageUrl} 
               alt={`${vehicle.make} ${vehicle.model}`} 
               className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
               onError={() => setImageError(true)}
             />
           ) : (
             <div className="w-full h-full flex flex-col items-center justify-center text-secondary bg-gradient-to-br from-card to-surface">
                <ImageIcon size={48} className="mb-2 opacity-50"/>
                <span className="text-xs uppercase tracking-widest font-semibold">Image Unavailable</span>
             </div>
           )}
           <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-2xl pointer-events-none"></div>
        </div>

        {/* Title and Key Stats */}
        <div className="flex-1 flex flex-col justify-end">
          <div>
            <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-2 tracking-tight">
              {vehicle.make} {vehicle.model}
            </h2>
            <div className="flex flex-wrap items-center gap-4 text-gray-400 text-sm mb-6">
               <span className="bg-white/5 px-3 py-1 rounded-full border border-white/5">{vehicle.year}</span>
               <span className="flex items-center gap-1.5"><Fuel size={14} className="text-primary"/> {vehicle.fuelType}</span>
               {vehicle.mileage > 0 && <span className="flex items-center gap-1.5"><Clock size={14} className="text-primary"/> {vehicle.mileage.toLocaleString()} km</span>}
            </div>
          </div>
          
          {/* Only show "Deal Verdict" if we have a price */}
          {!isGeneralAnalysis && estimatedCostEfficiency && (
            <div className="mt-auto">
               <div className="text-xs text-secondary uppercase tracking-wider mb-1 font-bold">Market Analysis Verdict</div>
               <div className="text-3xl font-bold text-white flex items-center gap-3">
                 {Number(estimatedCostEfficiency) > 60 ? (
                   <>
                    <span className="text-success">Good Value</span>
                    <Check size={28} className="text-success bg-success/10 p-1 rounded-full"/>
                   </>
                 ) : (
                   <>
                    <span className="text-warning">Overpriced</span>
                    <AlertCircle size={28} className="text-warning bg-warning/10 p-1 rounded-full"/>
                   </>
                 )}
               </div>
            </div>
          )}
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* New Reliability Score Card */}
        <div className="glass-card rounded-xl p-5 hover:bg-white/5 transition-colors relative overflow-hidden group">
            <div className="flex justify-between items-start z-10 relative">
               <div>
                  <div className="text-secondary text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1">
                     <ShieldCheck size={14} className="text-white"/> Reliability
                  </div>
                  <div className="text-xs text-gray-400 max-w-[80%]">{analysis.reliabilityScore?.rating || 'Calculating...'}</div>
               </div>
               
               {/* Radial Score Indicator */}
               <div className="relative w-12 h-12 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                     <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-white/10" />
                     <circle 
                        cx="24" cy="24" r="20" 
                        stroke={scoreColor} 
                        strokeWidth="4" 
                        fill="transparent" 
                        strokeDasharray={125.6} 
                        strokeDashoffset={125.6 - (125.6 * relScore) / 100} 
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out"
                     />
                  </svg>
                  <span className="absolute text-xs font-bold text-white">{relScore}</span>
               </div>
            </div>
            <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent w-full opacity-50"></div>
        </div>

        {/* Dynamic Metric 2 */}
        {isGeneralAnalysis ? (
           <StatCard 
             label="Market Avg" 
             value={analysis.depreciationData?.[0]?.value ? `${vehicle.currency} ${analysis.depreciationData[0].value.toLocaleString()}` : 'N/A'} 
             subtext="Current Estimated Value"
           />
        ) : (
          <StatCard 
            label="Price / KM" 
            value={`${vehicle.currency} ${pricePerKm}`} 
            subtext="Cost efficiency"
          />
        )}

        {/* Dynamic Metric 3 */}
        <StatCard 
          label="Est. Maint / Year" 
          value={analysis.maintenanceCost} 
          subtext="Annual upkeep"
        />

        {/* Dynamic Metric 4 - Consolidating Range */}
        <StatCard 
          label="Fair Price Range" 
          value={`${analysis.priceRange?.min.toLocaleString()} - ${analysis.priceRange?.max.toLocaleString()}`} 
          subtext={`${vehicle.currency} Estimated Market`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Depreciation Chart */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-6 relative overflow-hidden group">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 z-10 relative">
            <div>
               <h3 className="font-display font-semibold text-lg text-white flex items-center gap-2">
                 <TrendingDown className="text-primary" size={20} />
                 Value Projection (5 Years)
               </h3>
               <p className="text-sm text-secondary">Estimated depreciation based on market trends</p>
            </div>

            {analysis.depreciationData && analysis.depreciationData.length > 1 && (
              <div className="flex items-center gap-4 bg-surface/40 backdrop-blur-sm p-3 rounded-xl border border-white/5 shadow-lg">
                 <div>
                    <div className="text-[10px] text-secondary uppercase tracking-wider font-bold">Total Loss</div>
                    <div className="text-danger font-bold text-lg">
                      {vehicle.currency} {(analysis.depreciationData[0].value - analysis.depreciationData[analysis.depreciationData.length - 1].value).toLocaleString()}
                    </div>
                 </div>
                 <div className="w-px h-8 bg-white/10"></div>
                 <div>
                    <div className="text-[10px] text-secondary uppercase tracking-wider font-bold">Retention</div>
                    <div className="text-white font-bold text-lg">
                      {Math.round((analysis.depreciationData[analysis.depreciationData.length - 1].value / analysis.depreciationData[0].value) * 100)}%
                    </div>
                 </div>
              </div>
            )}
          </div>
          
          <div className="h-[300px] w-full relative z-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analysis.depreciationData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.2} />
                <XAxis 
                    dataKey="year" 
                    stroke="#64748b" 
                    tick={{fontSize: 12, fill: '#64748b'}} 
                    tickLine={false}
                    axisLine={false}
                    dy={10}
                />
                <YAxis 
                    stroke="#64748b" 
                    tick={{fontSize: 12, fill: '#64748b'}} 
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value / 1000}k`}
                />
                <Tooltip 
                  cursor={{ stroke: '#3b82f6', strokeWidth: 1, strokeDasharray: '4 4' }}
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-card/90 backdrop-blur-md border border-white/10 p-4 rounded-xl shadow-2xl">
                          <p className="text-secondary text-xs uppercase font-bold mb-1">{label}</p>
                          <div className="flex items-baseline gap-1">
                             <span className="text-primary font-bold text-xl">
                               {vehicle.currency} {Number(payload[0].value).toLocaleString()}
                             </span>
                             <span className="text-xs text-gray-400">est.</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#3b82f6" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                  activeDot={{ r: 6, strokeWidth: 0, fill: '#fff' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Diagnostics (Pros/Cons) */}
        <div className="glass-card rounded-2xl p-6 flex flex-col gap-6">
           <div>
              <h3 className="font-display font-semibold text-lg text-white mb-4 flex items-center gap-2">
                <Check className="text-success" size={18} /> Positives
              </h3>
              <ul className="space-y-3">
                {analysis.pros?.slice(0, 3).map((pro, i) => (
                  <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-success rounded-full mt-1.5 flex-shrink-0"></span>
                    {pro}
                  </li>
                ))}
              </ul>
           </div>
           
           <div className="border-t border-white/5 pt-6">
              <h3 className="font-display font-semibold text-lg text-white mb-4 flex items-center gap-2">
                <AlertCircle className="text-danger" size={18} /> Considerations
              </h3>
              <ul className="space-y-3">
                {analysis.cons?.slice(0, 3).map((con, i) => (
                  <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-danger rounded-full mt-1.5 flex-shrink-0"></span>
                    {con}
                  </li>
                ))}
              </ul>
           </div>
        </div>
      </div>

      {/* Main Analysis Text */}
      <div className="glass-card rounded-2xl p-8">
        <div className="flex justify-between items-start mb-4">
           <h3 className="font-display font-semibold text-lg text-white">Detailed Analysis</h3>
           {analysis.reliabilityScore && (
              <span className="text-xs text-secondary bg-white/5 px-2 py-1 rounded">
                 Reliability Factor: <span style={{color: scoreColor}} className="font-bold">{analysis.reliabilityScore.details}</span>
              </span>
           )}
        </div>
        <div className="prose prose-invert prose-sm max-w-none text-gray-300 leading-relaxed">
          {analysis.reasoningAnalysis}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Common Issues List */}
        <div className="space-y-4">
           <h3 className="font-display font-semibold text-lg text-white mb-2 flex items-center gap-2">
             <Wrench size={18} className="text-warning"/> Common Issues
           </h3>
           <div className="space-y-3">
             {analysis.commonIssues?.map((issue, i) => (
               <div key={i} className="bg-card rounded-xl p-5 border border-white/5 hover:border-white/10 transition-colors">
                 <div className="flex justify-between items-start mb-2">
                    <span className="font-semibold text-white">{issue.issue}</span>
                    <span className="text-xs font-mono bg-white/5 px-2 py-1 rounded text-secondary">
                      ~ {issue.estimatedRepairCost}
                    </span>
                 </div>
                 <p className="text-sm text-secondary mb-4">{issue.description}</p>
                 <button 
                    onClick={() => handleFetchIssueDetails(issue.issue, i)}
                    disabled={loadingIssueId === i}
                    className="text-xs flex items-center gap-1 text-primary hover:text-blue-400 font-medium transition-colors disabled:opacity-50"
                 >
                    {loadingIssueId === i ? (
                        <>
                          <Loader2 size={12} className="animate-spin" />
                          Analyzing...
                        </>
                    ) : (
                        <>
                          View Repair Details <ChevronRight size={12} />
                        </>
                    )}
                 </button>
               </div>
             ))}
           </div>
        </div>

        {/* Maintenance Timeline & Cost Breakdown */}
        <div className="space-y-6">
           {/* Schedule */}
           <div>
             <h3 className="font-display font-semibold text-lg text-white mb-2 flex items-center gap-2">
               <Clock size={18} className="text-primary"/> Maintenance Schedule
             </h3>
             <div className="bg-card rounded-xl p-6 border border-white/5 relative">
                <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-white/5"></div>
                <div className="space-y-6 relative">
                   {analysis.maintenanceSchedule?.map((item, i) => (
                     <div key={i} className="flex items-start gap-4 ml-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-primary mt-1.5 ring-4 ring-card z-10"></div>
                        <div className="flex-1">
                           <div className="flex justify-between items-center mb-1">
                              <span className="text-xs font-bold text-primary uppercase tracking-wide">{item.interval}</span>
                              <span className="text-xs text-secondary">{item.estimatedCost}</span>
                           </div>
                           <p className="text-sm text-gray-200">{item.task}</p>
                        </div>
                     </div>
                   ))}
                </div>
             </div>
           </div>

           {/* Cost Breakdown Pie Chart */}
           {analysis.maintenanceCostBreakdown && analysis.maintenanceCostBreakdown.length > 0 && (
             <div>
               <h3 className="font-display font-semibold text-lg text-white mb-2 flex items-center gap-2">
                 <PieChartIcon size={18} className="text-accent"/> Annual Cost Breakdown
               </h3>
               <div className="bg-card rounded-xl p-4 border border-white/5 h-[300px]">
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analysis.maintenanceCostBreakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="costPercentage"
                        nameKey="component"
                      >
                        {analysis.maintenanceCostBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} stroke="rgba(0,0,0,0.1)" />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff', borderRadius: '8px' }}
                        itemStyle={{ color: '#fff' }}
                        formatter={(value: number) => [`${value}%`, 'Cost']}
                      />
                      <Legend 
                        layout="vertical" 
                        verticalAlign="middle" 
                        align="right"
                        iconType="circle"
                        iconSize={8}
                        wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }}
                      />
                    </PieChart>
                 </ResponsiveContainer>
               </div>
             </div>
           )}
        </div>

      </div>

      {/* Similar Listings & Fuel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2">
            <h3 className="font-display font-semibold text-lg text-white mb-4">Similar Listings</h3>
            <div className="glass-card rounded-xl overflow-hidden min-h-[200px] flex flex-col justify-center">
               {analysis.similarListings && analysis.similarListings.length > 0 ? (
                 <div className="overflow-x-auto w-full">
                   <table className="w-full text-left">
                      <thead>
                        <tr className="bg-white/5 text-xs text-secondary uppercase tracking-wider">
                          <th className="p-4 font-medium">Description</th>
                          <th className="p-4 font-medium">Price</th>
                          <th className="p-4 font-medium">Source</th>
                          <th className="p-4 font-medium text-right">Link</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm divide-y divide-white/5">
                        {analysis.similarListings.map((listing, i) => (
                          <tr key={i} className="hover:bg-white/5 transition-colors">
                            <td className="p-4 text-gray-200 font-medium">{listing.description}</td>
                            <td className="p-4 text-secondary whitespace-nowrap">{listing.price}</td>
                            <td className="p-4 text-secondary whitespace-nowrap">{listing.source}</td>
                            <td className="p-4 text-right">
                               {listing.url && (
                                 <a href={listing.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary hover:text-blue-400">
                                   View <ArrowUpRight size={14} />
                                 </a>
                               )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                   </table>
                 </div>
               ) : (
                 <div className="flex flex-col items-center justify-center p-8 text-secondary">
                    <p className="text-sm">No specific similar listings found in the market data.</p>
                 </div>
               )}
            </div>
         </div>

         <div>
           <h3 className="font-display font-semibold text-lg text-white mb-4">Fuel Economy</h3>
           <div className="glass-card rounded-xl p-6 space-y-5">
              {analysis.fuelEfficiency ? (
                <>
                   {/* Combined Comparison Visual */}
                   <div className="mb-6 pb-6 border-b border-white/5">
                      <div className="flex justify-between items-end mb-2">
                         <span className="text-xs text-secondary uppercase tracking-wider">vs Category Avg</span>
                         <span className="text-sm text-white font-medium">{analysis.fuelEfficiency.combined}</span>
                      </div>
                      <div className="relative h-2 bg-white/5 rounded-full overflow-hidden mb-1">
                         {/* Average Marker */}
                         <div 
                           className="absolute top-0 bottom-0 w-0.5 bg-gray-400 z-10" 
                           style={{left: `${averagePercent}%`}}
                           title={`Average: ${analysis.fuelEfficiency.averageCombined}`}
                         ></div>
                         {/* Vehicle Bar */}
                         <div 
                           className={`h-full rounded-full transition-all duration-1000 ${
                             (isLiters ? combinedVal < averageVal : combinedVal > averageVal) ? 'bg-success' : 'bg-warning'
                           }`} 
                           style={{width: `${vehiclePercent}%`}}
                         ></div>
                      </div>
                      <div className="flex justify-between text-[10px] text-gray-500">
                        <span>Better</span>
                        <span>Avg: {analysis.fuelEfficiency.averageCombined}</span>
                        <span>Worse</span>
                      </div>
                   </div>

                   <FuelMetric label="City" value={analysis.fuelEfficiency.city} />
                   <FuelMetric label="Highway" value={analysis.fuelEfficiency.highway} />
                   
                   <div className="pt-2">
                      <p className="text-sm text-secondary italic">"{analysis.fuelEfficiency.verdict}"</p>
                   </div>
                </>
              ) : (
                <p className="text-secondary text-sm">Data unavailable</p>
              )}
           </div>
         </div>
      </div>

      {/* Sources Footer */}
      {analysis.sources && analysis.sources.length > 0 && (
        <div className="pt-8 border-t border-white/5">
           <p className="text-xs text-secondary mb-2 uppercase tracking-wider">Data Sources</p>
           <div className="flex flex-wrap gap-3">
             {analysis.sources.map((source, i) => (
                <a key={i} href={source.uri} target="_blank" rel="noreferrer" className="text-xs text-primary bg-primary/10 px-2 py-1 rounded hover:bg-primary/20 transition-colors">
                   {source.title}
                </a>
             ))}
           </div>
        </div>
      )}

      {/* Repair Details Modal */}
      {selectedIssue && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedIssue(null)}></div>
            <div className="bg-surface border border-white/10 rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto relative shadow-2xl animate-fade-in flex flex-col">
               <div className="p-6 border-b border-white/5 flex justify-between items-center sticky top-0 bg-surface/95 backdrop-blur z-10">
                  <h3 className="text-xl font-display font-bold text-white flex items-center gap-2">
                     <Wrench size={20} className="text-primary"/>
                     Repair Intelligence: <span className="text-primary">{selectedIssue.title}</span>
                  </h3>
                  <button onClick={() => setSelectedIssue(null)} className="text-secondary hover:text-white transition-colors">
                     <X size={24} />
                  </button>
               </div>
               <div className="p-6">
                  <div className="prose prose-invert prose-sm max-w-none">
                     <div className="whitespace-pre-wrap font-sans text-gray-300 leading-relaxed">
                        {selectedIssue.content}
                     </div>
                  </div>
               </div>
               <div className="p-6 border-t border-white/5 bg-surface/95 backdrop-blur sticky bottom-0">
                  <button 
                     onClick={() => setSelectedIssue(null)}
                     className="w-full bg-white/5 hover:bg-white/10 text-white font-medium py-3 rounded-xl transition-colors"
                  >
                     Close Analysis
                  </button>
               </div>
            </div>
         </div>
      )}

    </div>
  );
};

// Helper Components
const StatCard: React.FC<{label: string, value: string, subtext: string}> = ({label, value, subtext}) => (
  <div className="glass-card rounded-xl p-5 hover:bg-white/5 transition-colors flex flex-col justify-between">
     <div>
       <div className="text-secondary text-xs font-bold uppercase tracking-wider mb-2">{label}</div>
       <div className="text-xl md:text-2xl font-display font-bold text-white mb-1 truncate">{value}</div>
     </div>
     <div className="text-xs text-gray-500 mt-2">{subtext}</div>
  </div>
);

// Simplified Fuel Metric without hardcoded bar
const FuelMetric: React.FC<{label: string, value: string}> = ({label, value}) => (
   <div className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
      <span className="text-secondary text-sm">{label}</span>
      <span className="text-white font-medium text-sm">{value}</span>
   </div>
);

export default Dashboard;