import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import { TOKEN_STORAGE_KEY } from '../interceptors/auth.interceptor';

const customersUrl = `${environment.apiBaseUrl}/customer/api/v1/customers`;

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('starts logged out', () => {
    expect(service.isLoggedIn()).toBeFalse();
    expect(service.currentUser()).toBeNull();
  });

  it('registers a new account and logs the user in', () => {
    let result: { success: boolean; error?: string } | undefined;
    service
      .register({ email: 'Jane@Example.com', password: 'secret123', firstName: 'Jane', lastName: 'Doe' })
      .subscribe((r) => (result = r));

    const req = httpMock.expectOne(`${customersUrl}/signup`);
    expect(req.request.body).toEqual({
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'Jane@Example.com',
      password: 'secret123',
      role: 'customer',
    });
    req.flush({ id: 1, firstName: 'Jane', lastName: 'Doe', email: 'jane@example.com', token: 'tok-1' });

    expect(result?.success).toBeTrue();
    expect(service.isLoggedIn()).toBeTrue();
    expect(service.currentUser()?.email).toEqual('jane@example.com');
    expect(localStorage.getItem(TOKEN_STORAGE_KEY)).toBe('tok-1');
  });

  it('surfaces a server error when registering a duplicate email', () => {
    let result: { success: boolean; error?: string } | undefined;
    service
      .register({ email: 'jane@example.com', password: 'secret123', firstName: 'Jane', lastName: 'Doe' })
      .subscribe((r) => (result = r));

    httpMock
      .expectOne(`${customersUrl}/signup`)
      .flush({ error: 'An account with that email already exists.' }, { status: 409, statusText: 'Conflict' });

    expect(result?.success).toBeFalse();
    expect(result?.error).toContain('already exists');
    expect(service.isLoggedIn()).toBeFalse();
  });

  it('logs in with correct credentials', () => {
    let result: { success: boolean; error?: string } | undefined;
    service.login('jane@example.com', 'secret123').subscribe((r) => (result = r));

    const req = httpMock.expectOne(`${customersUrl}/signin`);
    expect(req.request.body).toEqual({ email: 'jane@example.com', password: 'secret123' });
    req.flush({ id: 1, firstName: 'Jane', lastName: 'Doe', email: 'jane@example.com', token: 'tok-1' });

    expect(result?.success).toBeTrue();
    expect(service.isLoggedIn()).toBeTrue();
  });

  it('rejects an incorrect login and surfaces a fallback error message', () => {
    let result: { success: boolean; error?: string } | undefined;
    service.login('jane@example.com', 'wrong-password').subscribe((r) => (result = r));

    httpMock.expectOne(`${customersUrl}/signin`).flush(null, { status: 401, statusText: 'Unauthorized' });

    expect(result?.success).toBeFalse();
    expect(result?.error).toContain('Incorrect email or password');
    expect(service.isLoggedIn()).toBeFalse();
  });

  it('updates the profile for the logged in user', () => {
    service
      .register({ email: 'jane@example.com', password: 'secret123', firstName: 'Jane', lastName: 'Doe' })
      .subscribe();
    httpMock
      .expectOne(`${customersUrl}/signup`)
      .flush({ id: 1, firstName: 'Jane', lastName: 'Doe', email: 'jane@example.com', token: 'tok-1' });

    let result: { success: boolean; error?: string } | undefined;
    service
      .updateProfile({
        firstName: 'Janet',
        lastName: 'Doe',
        phone: '555-1234',
        paymentCardholderName: 'Janet Doe',
        paymentCardBrand: 'VISA',
        paymentLast4: '4242',
        paymentExpiry: '01/30',
      })
      .subscribe((r) => (result = r));

    const patchReq = httpMock.expectOne(`${customersUrl}/1`);
    expect(patchReq.request.method).toBe('PATCH');
    patchReq.flush({
      id: 1,
      firstName: 'Janet',
      lastName: 'Doe',
      email: 'jane@example.com',
      phone: '555-1234',
      paymentCardholderName: 'Janet Doe',
      paymentCardBrand: 'VISA',
      paymentLast4: '4242',
      paymentExpiry: '01/30',
    });

    expect(result?.success).toBeTrue();
    expect(service.currentUser()?.firstName).toEqual('Janet');
    expect(service.currentUser()?.phone).toEqual('555-1234');
    expect(service.currentUser()?.paymentLast4).toEqual('4242');
  });

  it('refuses to update a profile when logged out', () => {
    let result: { success: boolean; error?: string } | undefined;
    service
      .updateProfile({
        firstName: 'Janet',
        lastName: 'Doe',
        phone: '',
        paymentCardholderName: '',
        paymentCardBrand: '',
        paymentLast4: '',
        paymentExpiry: '',
      })
      .subscribe((r) => (result = r));

    expect(result?.success).toBeFalse();
    httpMock.expectNone(() => true);
  });

  it('logs out and clears the current user and stored token', () => {
    service
      .register({ email: 'jane@example.com', password: 'secret123', firstName: 'Jane', lastName: 'Doe' })
      .subscribe();
    httpMock
      .expectOne(`${customersUrl}/signup`)
      .flush({ id: 1, firstName: 'Jane', lastName: 'Doe', email: 'jane@example.com', token: 'tok-1' });

    service.logout();

    expect(service.isLoggedIn()).toBeFalse();
    expect(service.currentUser()).toBeNull();
    expect(localStorage.getItem(TOKEN_STORAGE_KEY)).toBeNull();
  });
});
