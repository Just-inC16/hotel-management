import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { environment } from '../../../environments/environment';
import { DashboardPage } from './dashboard.page';

const hotelsUrl = `${environment.apiBaseUrl}/hotelmanagement/api/v1/hotelManagements`;

function makeHotelDto(overrides: Record<string, unknown> & { id: number }) {
  return {
    name: 'Test Hotel',
    status: 'AVAILABLE',
    address: { line1: '1 Main St', city: 'Testville', state: 'TS', postalCode: '00000', countryCode: 'US' },
    coordinates: { latitude: 0, longitude: 0 },
    starRating: 4,
    locationScore: 4,
    guestRating: 4.5,
    description: 'A hotel.',
    benefits: [],
    amount: 120,
    currency: 'USD',
    ...overrides,
  };
}

const mockDtos = [
  makeHotelDto({
    id: 1,
    name: 'The Plaza Hotel',
    address: { line1: '1', city: 'New York', state: 'NY', postalCode: '10019', countryCode: 'US' },
    starRating: 5,
    guestRating: 4.7,
    amount: 700,
  }),
  makeHotelDto({
    id: 2,
    name: 'The Beverly Hills Hotel',
    address: { line1: '2', city: 'Beverly Hills', state: 'CA', postalCode: '90210', countryCode: 'US' },
    starRating: 5,
    guestRating: 4.9,
    amount: 950,
  }),
  makeHotelDto({
    id: 3,
    name: 'Budget Inn Chicago',
    address: { line1: '3', city: 'Chicago', state: 'IL', postalCode: '60601', countryCode: 'US' },
    starRating: 3,
    guestRating: 3.9,
    amount: 150,
  }),
];

describe('DashboardPage', () => {
  let httpMock: HttpTestingController;
  let router: Router;

  function createComponent() {
    TestBed.configureTestingModule({
      imports: [DashboardPage],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    const fixture = TestBed.createComponent(DashboardPage);
    fixture.detectChanges();
    httpMock.expectOne(hotelsUrl).flush(mockDtos);
    fixture.detectChanges();
    return fixture;
  }

  afterEach(() => {
    httpMock.verify();
  });

  it('loads and lists all hotels sorted by rating by default', () => {
    const fixture = createComponent();
    const ids = fixture.componentInstance.filteredHotels().map((hotel) => hotel.hotelId);
    expect(ids).toEqual(['2', '1', '3']);
  });

  it('filters by search term across name, city, and state', () => {
    const fixture = createComponent();
    const page = fixture.componentInstance;

    page.searchTerm.set('chicago');

    expect(page.filteredHotels().map((h) => h.hotelId)).toEqual(['3']);
  });

  it('filters by city', () => {
    const fixture = createComponent();
    const page = fixture.componentInstance;

    page.cityFilter.set('New York');

    expect(page.filteredHotels().map((h) => h.hotelId)).toEqual(['1']);
  });

  it('filters by minimum star rating', () => {
    const fixture = createComponent();
    const page = fixture.componentInstance;

    page.minStars.set(5);

    expect(page.filteredHotels().map((h) => h.hotelId).sort()).toEqual(['1', '2']);
  });

  it('sorts by price ascending and descending', () => {
    const fixture = createComponent();
    const page = fixture.componentInstance;

    page.sortBy.set('price-asc');
    expect(page.filteredHotels().map((h) => h.hotelId)).toEqual(['3', '1', '2']);

    page.sortBy.set('price-desc');
    expect(page.filteredHotels().map((h) => h.hotelId)).toEqual(['2', '1', '3']);
  });

  it('resetFilters clears every filter back to its default', () => {
    const fixture = createComponent();
    const page = fixture.componentInstance;
    page.searchTerm.set('chicago');
    page.cityFilter.set('Chicago');
    page.minStars.set(5);
    page.sortBy.set('price-asc');

    page.resetFilters();

    expect(page.searchTerm()).toBe('');
    expect(page.cityFilter()).toBe('all');
    expect(page.minStars()).toBe(0);
    expect(page.sortBy()).toBe('rating-desc');
  });

  it('onMapSelect sets the selected hotel id', () => {
    const fixture = createComponent();
    const page = fixture.componentInstance;

    page.onMapSelect('3');

    expect(page.selectedHotelId()).toBe('3');
  });

  it('viewHotel navigates to the hotel detail route', () => {
    const fixture = createComponent();
    spyOn(router, 'navigate');

    fixture.componentInstance.viewHotel('3');

    expect(router.navigate).toHaveBeenCalledWith(['/hotels', '3']);
  });
});
