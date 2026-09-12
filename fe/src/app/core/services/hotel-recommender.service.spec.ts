import { Hotel } from '../models/hotel.model';
import { HotelPreferences } from '../models/preferences.model';
import { HotelRecommenderService } from './hotel-recommender.service';

function makeHotel(overrides: Partial<Hotel> & { hotelId: string }): Hotel {
  return {
    name: 'Test Hotel',
    address: { line1: '1 Main St', city: 'Testville', state: 'TS', postalCode: '00000', countryCode: 'US' },
    coordinates: { latitude: 0, longitude: 0 },
    starRating: 3,
    locationScore: 3,
    guestRating: 4,
    description: 'A hotel.',
    benefits: [],
    price: { currency: 'USD', base: 100, total: 100 },
    status: 'AVAILABLE',
    ...overrides,
  };
}

describe('HotelRecommenderService', () => {
  let service: HotelRecommenderService;

  const hotelA = makeHotel({
    hotelId: 'A',
    starRating: 5,
    locationScore: 5,
    price: { currency: 'USD', base: 100, total: 100 },
    benefits: ['pool', 'spa'],
    guestRating: 4.5,
  });
  const hotelB = makeHotel({
    hotelId: 'B',
    starRating: 3,
    locationScore: 1,
    price: { currency: 'USD', base: 200, total: 200 },
    benefits: ['pool'],
    guestRating: 4.0,
  });
  const hotelC = makeHotel({
    hotelId: 'C',
    starRating: 4,
    locationScore: 3,
    price: { currency: 'USD', base: 150, total: 150 },
    benefits: [],
    guestRating: 4.5,
  });

  beforeEach(() => {
    service = new HotelRecommenderService();
  });

  it('returns an empty list when there are no hotels', () => {
    expect(service.rank([], { selected: ['stars', 'pricing', 'amenities'] })).toEqual([]);
  });

  it('computes an exact per-dimension breakdown and total score for a known preference set', () => {
    const preferences: HotelPreferences = { selected: ['stars', 'pricing', 'amenities'] };
    const ranked = service.rank([hotelA, hotelB, hotelC], preferences);
    const byId = Object.fromEntries(ranked.map((r) => [r.hotel.hotelId, r]));

    expect(byId['A'].breakdown).toEqual({ stars: 1, location: 1, pricing: 1, amenities: 1 });
    expect(byId['A'].totalScore).toBeCloseTo(1, 5);

    expect(byId['B'].breakdown.stars).toBeCloseTo(0.6, 5);
    expect(byId['B'].breakdown.pricing).toBeCloseTo(0, 5);
    expect(byId['B'].breakdown.amenities).toBeCloseTo(0.5, 5);
    expect(byId['B'].totalScore).toBeCloseTo((0.6 + 0 + 0.5) / 3, 5);

    expect(byId['C'].breakdown.stars).toBeCloseTo(0.8, 5);
    expect(byId['C'].breakdown.pricing).toBeCloseTo(0.5, 5);
    expect(byId['C'].breakdown.amenities).toBeCloseTo(0, 5);
    expect(byId['C'].totalScore).toBeCloseTo((0.8 + 0.5 + 0) / 3, 5);

    expect(ranked.map((r) => r.hotel.hotelId)).toEqual(['A', 'C', 'B']);
  });

  it('gives unselected dimensions zero weight', () => {
    const preferences: HotelPreferences = { selected: ['location', 'pricing', 'amenities'] };
    const ranked = service.rank([hotelA], preferences);

    // starRating differs across hotelA/B/C but is not selected, so it must not influence the score.
    expect(ranked[0].totalScore).toBeCloseTo((1 + 1 + 1) / 3, 5);
  });

  it('breaks ties by guest rating, then by hotelId', () => {
    const tiedByScore = makeHotel({
      hotelId: 'Z',
      starRating: 5,
      locationScore: 5,
      price: { currency: 'USD', base: 100, total: 100 },
      benefits: ['pool', 'spa'],
      guestRating: 4.9,
    });
    const preferences: HotelPreferences = { selected: ['stars', 'location', 'amenities'] };

    const ranked = service.rank([hotelA, tiedByScore], preferences);

    expect(ranked[0].totalScore).toBeCloseTo(ranked[1].totalScore, 5);
    expect(ranked.map((r) => r.hotel.hotelId)).toEqual(['Z', 'A']);
  });

  it('falls back to hotelId ascending when score and guest rating both tie', () => {
    const twin = makeHotel({
      hotelId: 'Z',
      starRating: hotelA.starRating,
      locationScore: hotelA.locationScore,
      price: hotelA.price,
      benefits: hotelA.benefits,
      guestRating: hotelA.guestRating,
    });
    const preferences: HotelPreferences = { selected: ['stars', 'location', 'amenities'] };

    const ranked = service.rank([twin, hotelA], preferences);

    expect(ranked.map((r) => r.hotel.hotelId)).toEqual(['A', 'Z']);
  });

  it('does not divide by zero when every hotel has the same price', () => {
    const samePrice = makeHotel({ hotelId: 'D', price: { currency: 'USD', base: 100, total: 100 } });
    const alsoSamePrice = makeHotel({ hotelId: 'E', price: { currency: 'USD', base: 100, total: 100 } });
    const preferences: HotelPreferences = { selected: ['pricing', 'stars', 'location'] };

    const ranked = service.rank([samePrice, alsoSamePrice], preferences);

    expect(ranked.every((r) => r.breakdown.pricing === 1)).toBeTrue();
    expect(ranked.every((r) => Number.isFinite(r.totalScore))).toBeTrue();
  });

  it('does not divide by zero when no hotel has any benefits', () => {
    const noBenefits = makeHotel({ hotelId: 'D', benefits: [] });
    const preferences: HotelPreferences = { selected: ['amenities', 'stars', 'location'] };

    const ranked = service.rank([noBenefits], preferences);

    expect(ranked[0].breakdown.amenities).toBe(0);
    expect(Number.isFinite(ranked[0].totalScore)).toBeTrue();
  });

  it('top() slices the ranked list to the requested count', () => {
    const hotels = [hotelA, hotelB, hotelC];
    const preferences: HotelPreferences = { selected: ['stars', 'pricing', 'amenities'] };

    expect(service.top(hotels, preferences, 1).map((r) => r.hotel.hotelId)).toEqual(['A']);
    expect(service.top(hotels, preferences, 5).map((r) => r.hotel.hotelId)).toEqual(['A', 'C', 'B']);
  });
});
