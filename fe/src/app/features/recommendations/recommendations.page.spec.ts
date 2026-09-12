/// <reference types="jasmine" />

import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { UserProfile } from '../../core/models/user.model';
import { SESSION_STORAGE_KEY } from '../../core/services/auth.service';
import { RecommendationsPage } from './recommendations.page';

const hotelsUrl = `${environment.apiBaseUrl}/hotelmanagement/api/v1/hotelManagements`;
const USER_EMAIL = 'jane@example.com';

const mockHotelDtos = [
  {
    id: 1,
    name: 'Top Pick',
    status: 'AVAILABLE',
    amount: 100,
    address: { line1: '1', city: 'New York', state: 'NY', postalCode: '10001', countryCode: 'US' },
    coordinates: { latitude: 0, longitude: 0 },
    starRating: 5,
    locationScore: 5,
    guestRating: 4.9,
    benefits: ['a', 'b'],
  },
  {
    id: 2,
    name: 'Middle Pick',
    status: 'AVAILABLE',
    amount: 150,
    address: { line1: '2', city: 'Boston', state: 'MA', postalCode: '02101', countryCode: 'US' },
    coordinates: { latitude: 0, longitude: 0 },
    starRating: 4,
    locationScore: 3,
    guestRating: 4.5,
    benefits: ['a'],
  },
  {
    id: 3,
    name: 'Budget Pick',
    status: 'AVAILABLE',
    amount: 200,
    address: { line1: '3', city: 'Chicago', state: 'IL', postalCode: '60601', countryCode: 'US' },
    coordinates: { latitude: 0, longitude: 0 },
    starRating: 3,
    locationScore: 1,
    guestRating: 4.0,
    benefits: [],
  },
];

function seedSession(): void {
  const profile: UserProfile = {
    id: 1,
    email: USER_EMAIL,
    firstName: 'Jane',
    lastName: 'Doe',
    phone: '',
    paymentCardholderName: '',
    paymentCardBrand: '',
    paymentLast4: '',
    paymentExpiry: '',
    token: 'tok-1',
  };
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(profile));
}

function seedPreferences(): void {
  localStorage.setItem(
    `hotelapp.preferences.${USER_EMAIL}`,
    JSON.stringify({ selected: ['stars', 'pricing', 'amenities'] }),
  );
}

describe('RecommendationsPage', () => {
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [RecommendationsPage],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('prompts to set preferences when the user has none saved', () => {
    seedSession();
    const fixture = TestBed.createComponent(RecommendationsPage);
    fixture.detectChanges();
    httpMock.expectOne(hotelsUrl).flush(mockHotelDtos);

    expect(fixture.componentInstance.preferences()).toBeNull();
    expect(fixture.componentInstance.recommendations()).toEqual([]);
  });

  it('ranks hotels by the recommender once preferences and hotels are loaded, defaulting to Top 5', () => {
    seedSession();
    seedPreferences();
    const fixture = TestBed.createComponent(RecommendationsPage);
    fixture.detectChanges();
    httpMock.expectOne(hotelsUrl).flush(mockHotelDtos);

    const results = fixture.componentInstance.recommendations();
    expect(results.map((r) => r.hotel.hotelId)).toEqual(['1', '2', '3']);
    expect(fixture.componentInstance.topCount()).toBe(5);
  });

  it('setTopCount narrows the results to the requested count', () => {
    seedSession();
    seedPreferences();
    const fixture = TestBed.createComponent(RecommendationsPage);
    fixture.detectChanges();
    httpMock.expectOne(hotelsUrl).flush(mockHotelDtos);

    fixture.componentInstance.setTopCount(1);

    expect(fixture.componentInstance.recommendations().map((r) => r.hotel.hotelId)).toEqual(['1']);
  });
});
