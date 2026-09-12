import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { UserProfile } from '../models/user.model';
import { SESSION_STORAGE_KEY } from './auth.service';
import { BookingService } from './booking.service';

const reservationsUrl = `${environment.apiBaseUrl}/reservation/api/v1/reservations`;

function seedSession(): void {
  const profile: UserProfile = {
    id: 7,
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

describe('BookingService', () => {
  let service: BookingService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    seedSession();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(BookingService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('posts a reserveHotel request with the signed-in customer id', () => {
    service.createReservation('101', '2026-01-01', '2026-01-05').subscribe();

    const req = httpMock.expectOne(`${reservationsUrl}/reserveHotel`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      customerId: 7,
      hotelId: 101,
      startDate: '2026-01-01',
      endDate: '2026-01-05',
    });
    req.flush({ entity: 'Reservation', message: 'Successful booking of hotel room' });
  });

  it('gets bookings for the signed-in customer', () => {
    const bookings = [{ id: 1, customerId: 7, hotelId: 101, startDate: '2026-01-01', endDate: '2026-01-05' }];

    service.getMyBookings().subscribe((result) => {
      expect(result).toEqual(bookings);
    });

    const req = httpMock.expectOne(`${reservationsUrl}/customer/7`);
    expect(req.request.method).toBe('GET');
    req.flush(bookings);
  });
});
