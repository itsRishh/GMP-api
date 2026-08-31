export type IPOCategory = "mainboard" | "sme" | "all";

export interface IPO {
  id: number;
  sourceId?: string;
  category?: IPOCategory;
  name: string;
  url: string;
  gmp: string;
  trend: string;
  rating: string;
  sub: string;
  price: string;
  ipoSize: string;
  lot: string;
  open: string;
  close: string;
  boaDate: string;
  listing: string;
  updatedOn: string;
  anchor: string;
  priceBand: string;
  estimatedListing: string;
  listingGain: string;
  ipoDate: string;
  status: string;
  lastUpdated: string;
  createdAt?: number;
  updatedAt?: number;
  isActive?: boolean;
}

export interface IPOGroupedResponse {
  all: IPO[];
  mainboard: IPO[];
  sme: IPO[];
  lastUpdated?: string;
}

export interface IPOApiResponse {
  success: boolean;
  count: number;
  data: IPO[] | IPOGroupedResponse;
  lastUpdated?: string;
}