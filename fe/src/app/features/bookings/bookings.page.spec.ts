import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { UserProfile } from '../../core/models/user.model';
import { SESSION_STORAGE_KEY } from '../../core/services/auth.service';
import { BookingsPage } from './bookings.page';

const hotelsUrl = `${environment.apiBaseUrl}/hotelmanagement/api/v1/hotelManagements`;
const bookingsUrl = `${environment.apiBaseUrl}/reservation/api/v1/reservations/customer/3`;

const mockHotelDtos = [
  {
    id: 101,
    name: 'The Plaza Hotel',
    status: 'AVAILABLE',
    amount: 712.5,
    currency: 'USD',
    address: { line1: '1', city: 'New York', state: 'NY', postalCode: '10019', countryCode: 'US' },
    coordinates: { latitude: 40.7645, longitude: -73.9742 },
    starRating: 5,
    locationScore: 5,
    guestRating: 4.7,
    description: 'Luxury hotel near Central Park.',
    benefits: [],
  },
];

function seedSession(): void {
  const profile: UserProfile = {
    id: 3,
    email: 'jane@example.com',
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

describe('BookingsPage', () => {
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    seedSession();
    TestBed.configureTestingModule({
      imports: [BookingsPage],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('shows a loading state, then the joined booking + hotel details', () => {
    const fixture = TestBed.createComponent(BookingsPage);
    fixture.detectChanges();
    expect(fixture.componentInstance.loading()).toBeTrue();

    httpMock.expectOne(hotelsUrl).flush(mockHotelDtos);
    httpMock
      .expectOne(bookingsUrl)
      .flush([{ id: 1, customerId: 3, hotelId: 101, startDate: '2026-01-01', endDate: '2026-01-05' }]);

    expect(fixture.componentInstance.loading()).toBeFalse();
    const [first] = fixture.componentInstance.bookingsWithHotels();
    expect(first.hotel?.name).toBe('The Plaza Hotel');
    expect(first.booking.startDate).toBe('2026-01-01');
  });

  it('shows an empty list when the customer has no bookings', () => {
    const fixture = TestBed.createComponent(BookingsPage);
    fixture.detectChanges();

    httpMock.expectOne(hotelsUrl).flush(mockHotelDtos);
    httpMock.expectOne(bookingsUrl).flush([]);

    expect(fixture.componentInstance.bookingsWithHotels()).toEqual([]);
  });

  it('sets loadError when the bookings request fails', () => {
    const fixture = TestBed.createComponent(BookingsPage);
    fixture.detectChanges();

    httpMock.expectOne(hotelsUrl).flush(mockHotelDtos);
    httpMock.expectOne(bookingsUrl).flush(null, { status: 500, statusText: 'Server Error' });

    expect(fixture.componentInstance.loading()).toBeFalse();
    expect(fixture.componentInstance.loadError()).toBeTrue();
  });

  it('falls back to a hotel id label when the hotel is not found', () => {
    const fixture = TestBed.createComponent(BookingsPage);
    fixture.detectChanges();

    httpMock.expectOne(hotelsUrl).flush(mockHotelDtos);
    httpMock
      .expectOne(bookingsUrl)
      .flush([{ id: 2, customerId: 3, hotelId: 999, startDate: '2026-01-01', endDate: '2026-01-05' }]);

    const [first] = fixture.componentInstance.bookingsWithHotels();
    expect(first.hotel).toBeUndefined();
  });
});
