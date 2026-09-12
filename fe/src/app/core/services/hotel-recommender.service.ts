import { Injectable } from '@angular/core';
import { Hotel } from '../models/hotel.model';
import { HotelPreferences, PreferenceQuality } from '../models/preferences.model';

export interface ScoreBreakdown {
  stars: number;
  location: number;
  pricing: number;
  amenities: number;
}

export interface RankedHotel {
  hotel: Hotel;
  totalScore: number;
  breakdown: ScoreBreakdown;
}

const WEIGHT_PER_SELECTED_QUALITY = 1 / 3;

/**
 * A deterministic, explainable "simple AI agent": a rule-based weighted
 * multi-criteria scorer, not an LLM/ML call — every ranking can be
 * reconstructed from the per-dimension breakdown it returns.
 */
@Injectable({ providedIn: 'root' })
export class HotelRecommenderService {
  rank(hotels: Hotel[], preferences: HotelPreferences): RankedHotel[] {
    if (hotels.length === 0) {
      return [];
    }

    const selected = new Set<PreferenceQuality>(preferences.selected);
    const prices = hotels.map((hotel) => hotel.price.total);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const maxBenefits = Math.max(...hotels.map((hotel) => hotel.benefits.length));

    const ranked = hotels.map((hotel): RankedHotel => {
      const breakdown: ScoreBreakdown = {
        stars: hotel.starRating / 5,
        location: hotel.locationScore / 5,
        pricing: maxPrice === minPrice ? 1 : (maxPrice - hotel.price.total) / (maxPrice - minPrice),
        amenities: maxBenefits === 0 ? 0 : hotel.benefits.length / maxBenefits,
      };

      const totalScore =
        (selected.has('stars') ? WEIGHT_PER_SELECTED_QUALITY * breakdown.stars : 0) +
        (selected.has('location') ? WEIGHT_PER_SELECTED_QUALITY * breakdown.location : 0) +
        (selected.has('pricing') ? WEIGHT_PER_SELECTED_QUALITY * breakdown.pricing : 0) +
        (selected.has('amenities') ? WEIGHT_PER_SELECTED_QUALITY * breakdown.amenities : 0);

      return { hotel, totalScore, breakdown };
    });

    return ranked.sort((a, b) => {
      if (b.totalScore !== a.totalScore) {
        return b.totalScore - a.totalScore;
      }
      if (b.hotel.guestRating !== a.hotel.guestRating) {
        return b.hotel.guestRating - a.hotel.guestRating;
      }
      return a.hotel.hotelId.localeCompare(b.hotel.hotelId);
    });
  }

  top(hotels: Hotel[], preferences: HotelPreferences, count: 1 | 5 | 10): RankedHotel[] {
    return this.rank(hotels, preferences).slice(0, count);
  }
}
