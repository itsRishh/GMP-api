export interface IPO {
  id: number;
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
}

export interface IPOApiResponse {
  success: boolean;
  data: IPO[];
}