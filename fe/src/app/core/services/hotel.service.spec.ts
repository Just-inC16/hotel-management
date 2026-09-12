import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { HotelService } from './hotel.service';

const hotelsUrl = `${environment.apiBaseUrl}/hotelmanagement/api/v1/hotelManagements`;

const mockDtos = [
  {
    id: 101,
    name: 'The Plaza Hotel',
    status: 'AVAILABLE',
    amount: 712.5,
    currency: 'USD',
    address: { line1: '768 5th Ave', city: 'New York', state: 'NY', postalCode: '10019', countryCode: 'US' },
    coordinates: { latitude: 40.7645, longitude: -73.9742 },
    starRating: 5,
    locationScore: 5,
    guestRating: 4.7,
    description: 'Luxury hotel near Central Park.',
    benefits: ['Central Park access'],
  },
  {
    id: 202,
    name: 'The Beverly Hills Hotel',
    status: 'AVAILABLE',
    amount: 975,
    currency: 'USD',
    address: { line1: '9641 Sunset Blvd', city: 'Beverly Hills', state: 'CA', postalCode: '90210', countryCode: 'US' },
    coordinates: { latitude: 34.081, longitude: -118.4137 },
    starRating: 5,
    locationScore: 4,
    guestRating: 4.8,
    description: 'Iconic luxury hotel.',
    benefits: ['Luxury spa'],
  },
];

describe('HotelService', () => {
  let service: HotelService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(HotelService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('loads hotels from the hotelManagement backend and exposes them as a signal', () => {
    service.loadHotels().subscribe();

    const req = httpMock.expectOne(hotelsUrl);
    req.flush(mockDtos);

    expect(service.hotels().length).toBe(2);
    expect(service.cities()).toEqual(['Beverly Hills', 'New York']);
    expect(service.hotels()[0].hotelId).toBe('101');
    expect(service.hotels()[0].price.total).toBe(712.5);
  });

  it('fills in sensible defaults when the backend omits optional fields', () => {
    service.loadHotels().subscribe();

    httpMock.expectOne(hotelsUrl).flush([{ id: 5, name: 'Bare Bones Inn', status: 'AVAILABLE', amount: 100 }]);

    const [hotel] = service.hotels();
    expect(hotel.address.city).toBe('');
    expect(hotel.benefits).toEqual([]);
    expect(hotel.starRating).toBe(0);
    expect(hotel.locationScore).toBe(0);
  });

  it('caches the request so repeated calls do not re-fetch', () => {
    service.loadHotels().subscribe();
    httpMock.expectOne(hotelsUrl).flush(mockDtos);

    service.loadHotels().subscribe();
    httpMock.expectNone(hotelsUrl);
    expect(service.hotels().length).toBe(2);
  });

  it('looks up a hotel by id', () => {
    service.loadHotels().subscribe();
    httpMock.expectOne(hotelsUrl).flush(mockDtos);

    expect(service.getHotelById('202')?.name).toEqual('The Beverly Hills Hotel');
    expect(service.getHotelById('missing')).toBeUndefined();
  });
});
