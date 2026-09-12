export interface HotelAddress {
  line1: string;
  city: string;
  state: string;
  postalCode: string;
  countryCode: string;
}

export interface HotelCoordinates {
  latitude: number;
  longitude: number;
}

export interface HotelPrice {
  currency: string;
  base: number;
  total: number;
}

export type HotelStatus = 'AVAILABLE' | 'BOOKED' | 'READY' | 'NOT_READY';

export interface Hotel {
  hotelId: string;
  name: string;
  address: HotelAddress;
  coordinates: HotelCoordinates;
  starRating: number;
  /** 1-5 curated score powering the recommender's "location" dimension. */
  locationScore: number;
  guestRating: number;
  description: string;
  benefits: string[];
  price: HotelPrice;
  status: HotelStatus;
}
