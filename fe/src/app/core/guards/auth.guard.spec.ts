import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree, provideRouter } from '@angular/router';
import { environment } from '../../../environments/environment';
import { UserProfile } from '../models/user.model';
import { authGuard } from './auth.guard';
import { AuthService, SESSION_STORAGE_KEY } from '../services/auth.service';

const customersUrl = `${environment.apiBaseUrl}/customer/api/v1/customers`;

function seedSession(): void {
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
  };
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(profile));
}

describe('authGuard', () => {
  let router: Router;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    router = TestBed.inject(Router);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  function runGuard(url: string) {
    return TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, { url } as RouterStateSnapshot),
    );
  }

  it('allows navigation when logged in', () => {
    // Seed the session before AuthService is first injected, since its
    // currentUser signal is only read from localStorage at construction time.
    seedSession();

    expect(runGuard('/profile')).toBeTrue();
  });

  it('allows navigation immediately after a successful sign-in', () => {
    const authService = TestBed.inject(AuthService);
    authService.login('jane@example.com', 'secret123').subscribe();
    httpMock
      .expectOne(`${customersUrl}/signin`)
      .flush({ id: 1, firstName: 'Jane', lastName: 'Doe', email: 'jane@example.com', token: 'tok-1' });

    expect(runGuard('/profile')).toBeTrue();
  });

  it('redirects to /login with the attempted url when logged out', () => {
    const result = runGuard('/profile') as UrlTree;

    expect(result instanceof UrlTree).toBeTrue();
    expect(router.serializeUrl(result)).toBe('/login?redirect=%2Fprofile');
  });
});
