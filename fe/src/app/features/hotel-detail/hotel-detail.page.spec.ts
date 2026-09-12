import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap, provideRouter } from '@angular/router';
import { environment } from '../../../environments/environment';
import { HotelDetailPage } from './hotel-detail.page';
import { SESSION_STORAGE_KEY } from '../../core/services/auth.service';
import { UserProfile } from '../../core/models/user.model';

const hotelsUrl = `${environment.apiBaseUrl}/hotelmanagement/api/v1/hotelManagements`;
const reserveUrl = `${environment.apiBaseUrl}/reservation/api/v1/reservations/reserveHotel`;

const mockDtos = [
  {
    id: 1,
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
    benefits: ['Central Park access'],
  },
];

function seedSession(): void {
  const profile: UserProfile = {
    id: 9,
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

describe('HotelDetailPage', () => {
  let httpMock: HttpTestingController;
  let router: Router;

  function createComponent(hotelId = '1') {
    TestBed.configureTestingModule({
      imports: [HotelDetailPage],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({ id: hotelId }) } },
        },
      ],
    });
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    const fixture = TestBed.createComponent(HotelDetailPage);
    fixture.detectChanges();
    httpMock.expectOne(hotelsUrl).flush(mockDtos);
    fixture.detectChanges();
    return fixture;
  }

  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('resolves the hotel from the route id once hotels have loaded', () => {
    const fixture = createComponent('1');
    expect(fixture.componentInstance.hotel()?.name).toBe('The Plaza Hotel');
    expect(fixture.componentInstance.mapHotels()).toEqual([fixture.componentInstance.hotel()!]);
  });

  it('leaves the hotel undefined when the id does not match any hotel', () => {
    const fixture = createComponent('missing');
    expect(fixture.componentInstance.hotel()).toBeUndefined();
    expect(fixture.componentInstance.mapHotels()).toEqual([]);
  });

  it('redirects to login with a return url when booking while signed out', () => {
    const fixture = createComponent('1');
    spyOn(router, 'navigate');

    fixture.componentInstance.book();

    expect(router.navigate).toHaveBeenCalledWith(['/login'], {
      queryParams: { redirect: '/hotels/1' },
    });
    expect(fixture.componentInstance.bookingConfirmed()).toBeFalse();
  });

  it('requires both dates before booking', () => {
    seedSession();
    const fixture = createComponent('1');

    fixture.componentInstance.book();

    expect(fixture.componentInstance.bookingError()).toContain('check-in and check-out');
    httpMock.expectNone(reserveUrl);
  });

  it('rejects a check-out date on or before the check-in date', () => {
    seedSession();
    const fixture = createComponent('1');
    fixture.componentInstance.startDate = '2026-02-10';
    fixture.componentInstance.endDate = '2026-02-10';

    fixture.componentInstance.book();

    expect(fixture.componentInstance.bookingError()).toContain('after the check-in date');
    httpMock.expectNone(reserveUrl);
  });

  it('confirms the booking when signed in with valid dates', () => {
    seedSession();
    const fixture = createComponent('1');
    fixture.componentInstance.startDate = '2026-02-10';
    fixture.componentInstance.endDate = '2026-02-12';

    fixture.componentInstance.book();

    const req = httpMock.expectOne(reserveUrl);
    expect(req.request.body).toEqual({
      customerId: 9,
      hotelId: 1,
      startDate: '2026-02-10',
      endDate: '2026-02-12',
    });
    req.flush({ entity: 'Reservation', message: 'Successful booking of hotel room' });

    expect(fixture.componentInstance.bookingConfirmed()).toBeTrue();
    expect(fixture.componentInstance.isBooking()).toBeFalse();
  });

  it('surfaces an error when the reservation request fails', () => {
    seedSession();
    const fixture = createComponent('1');
    fixture.componentInstance.startDate = '2026-02-10';
    fixture.componentInstance.endDate = '2026-02-12';

    fixture.componentInstance.book();

    httpMock.expectOne(reserveUrl).flush(null, { status: 409, statusText: 'Conflict' });

    expect(fixture.componentInstance.bookingConfirmed()).toBeFalse();
    expect(fixture.componentInstance.bookingError()).toContain('Something went wrong');
    expect(fixture.componentInstance.isBooking()).toBeFalse();
  });
});
