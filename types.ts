export interface VehicleData {
  make: string;
  model: string;
  year: number;
  mileage: number; // in km
  price: number; // in user currency
  currency: string;
  fuelType: string;
}

export interface GroundingSource {
  uri: string;
  title: string;
}

export interface MaintenanceItem {
  interval: string;
  task: string;
  estimatedCost: string;
}

export interface CommonIssue {
  issue: string;
  description: string;
  estimatedRepairCost: string;
}

export interface SimilarListing {
  description: string;
  price: string;
  source: string;
  url?: string;
}

export interface MaintenanceCostBreakdown {
  component: string;
  costPercentage: number;
}

export interface ReliabilityScore {
  score: number; // 0-100
  rating: string; // e.g. "Excellent", "Average"
  details: string; // Brief explanation
}

export interface AnalysisResult {
  searchSummary: string;
  reasoningAnalysis: string;
  sources: GroundingSource[];
  priceRange: { min: number; max: number };
  depreciationData: { year: string; value: number }[];
  commonIssues: CommonIssue[];
  pros: string[];
  cons: string[];
  maintenanceCost: string;
  maintenanceSchedule: MaintenanceItem[];
  maintenanceCostBreakdown?: MaintenanceCostBreakdown[];
  fuelEfficiency?: {
    city: string;
    highway: string;
    combined: string;
    averageCombined: string; // e.g. "8.5 L/100km" for class average
    verdict: string;
  };
  similarListings?: SimilarListing[];
  vehicleImageUrl?: string;
  reliabilityScore?: ReliabilityScore;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  isThinking?: boolean;
}