export interface IPO {
  id: number;
  name: string;
  url: string;
  gmp: string;
  trend: string;
  priceBand: string;
  estimatedListing: string;
  listingGain: string;
  ipoDate: string;
  status: string;
  lastUpdated: string;
}

export interface IPOApiResponse {
  success: boolean;
  count: number;
  data: IPO[];
}