import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { UserProfile } from '../models/user.model';
import { AuthService, SESSION_STORAGE_KEY } from './auth.service';
import { PreferencesService } from './preferences.service';

const customersUrl = `${environment.apiBaseUrl}/customer/api/v1/customers`;

function seedSession(overrides: Partial<UserProfile> = {}): void {
  const profile: UserProfile = {
    id: 1,
    email: 'jane@example.com',
    firstName: 'Jane',
    lastName: 'Doe',
    phone: '',
    paymentCardholderName: '',
    paymentCardBrand: '',
    paymentLast4: '',
    paymentExpiry: '',
    token: 'tok-1',
    ...overrides,
  };
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(profile));
}

describe('PreferencesService', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
  });

  it('starts with no preferences when signed out', () => {
    const service = TestBed.inject(PreferencesService);
    expect(service.preferences()).toBeNull();
  });

  it('starts with no preferences for a signed-in user who has none saved', () => {
    seedSession();
    const service = TestBed.inject(PreferencesService);
    expect(service.preferences()).toBeNull();
  });

  it('rejects setting preferences when signed out', () => {
    const service = TestBed.inject(PreferencesService);
    const result = service.setPreferences(['stars', 'location', 'pricing']);

    expect(result.success).toBeFalse();
    expect(service.preferences()).toBeNull();
  });

  it('rejects fewer than 3 selections', () => {
    seedSession();
    const service = TestBed.inject(PreferencesService);
    const result = service.setPreferences(['stars', 'location']);

    expect(result.success).toBeFalse();
    expect(result.error).toContain('exactly 3');
  });

  it('rejects more than 3 selections', () => {
    seedSession();
    const service = TestBed.inject(PreferencesService);
    const result = service.setPreferences(['stars', 'location', 'pricing', 'amenities']);

    expect(result.success).toBeFalse();
  });

  it('rejects duplicate selections', () => {
    seedSession();
    const service = TestBed.inject(PreferencesService);
    const result = service.setPreferences(['stars', 'stars', 'pricing']);

    expect(result.success).toBeFalse();
  });

  it('saves exactly 3 selections and persists them per signed-in user', () => {
    seedSession({ email: 'jane@example.com' });
    const service = TestBed.inject(PreferencesService);

    const result = service.setPreferences(['stars', 'location', 'pricing']);

    expect(result.success).toBeTrue();
    expect(service.preferences()?.selected).toEqual(['stars', 'location', 'pricing']);
    expect(localStorage.getItem('hotelapp.preferences.jane@example.com')).toContain('stars');
  });

  it('refreshForCurrentUser re-reads preferences for whoever is now signed in', () => {
    seedSession({ email: 'jane@example.com' });
    const service = TestBed.inject(PreferencesService);
    service.setPreferences(['stars', 'location', 'pricing']);

    // Switch the signed-in user via a real login (not a raw storage write) so
    // AuthService's currentUser signal — which PreferencesService reads from
    // on refresh — actually changes.
    const authService = TestBed.inject(AuthService);
    const httpMock = TestBed.inject(HttpTestingController);
    authService.logout();
    authService.login('bob@example.com', 'secret123').subscribe();
    httpMock
      .expectOne(`${customersUrl}/signin`)
      .flush({ id: 2, firstName: 'Bob', lastName: 'Lee', email: 'bob@example.com', token: 'tok-2' });

    service.refreshForCurrentUser();

    expect(service.preferences()).toBeNull();
  });
});
