import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap, provideRouter } from '@angular/router';
import { environment } from '../../../environments/environment';
import { LoginPage } from './login.page';

const customersUrl = `${environment.apiBaseUrl}/customer/api/v1/customers`;

describe('LoginPage', () => {
  let router: Router;
  let httpMock: HttpTestingController;

  function createComponent(redirect?: string) {
    TestBed.configureTestingModule({
      imports: [LoginPage],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParamMap: convertToParamMap(redirect ? { redirect } : {}),
            },
          },
        },
      ],
    });
    router = TestBed.inject(Router);
    httpMock = TestBed.inject(HttpTestingController);
    spyOn(router, 'navigateByUrl').and.resolveTo(true);
    const fixture = TestBed.createComponent(LoginPage);
    fixture.detectChanges();
    return fixture;
  }

  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('defaults to sign-in mode', () => {
    const fixture = createComponent();
    expect(fixture.componentInstance.mode()).toBe('sign-in');
  });

  it('switches modes and clears any error message', () => {
    const fixture = createComponent();
    const page = fixture.componentInstance;
    page.errorMessage.set('boom');

    page.setMode('create-account');

    expect(page.mode()).toBe('create-account');
    expect(page.errorMessage()).toBeNull();
  });

  it('shows an error when sign-in fails and does not navigate', () => {
    const fixture = createComponent();
    const page = fixture.componentInstance;
    page.email = 'nope@example.com';
    page.password = 'whatever';

    page.submit();
    httpMock.expectOne(`${customersUrl}/signin`).flush(null, { status: 401, statusText: 'Unauthorized' });

    expect(page.errorMessage()).toContain('Incorrect email or password');
    expect(page.submitting()).toBeFalse();
    expect(router.navigateByUrl).not.toHaveBeenCalled();
  });

  it('registers, logs in, and redirects to the requested url on success', () => {
    const fixture = createComponent('/hotels/NYC001');
    const page = fixture.componentInstance;
    page.setMode('create-account');
    page.firstName = 'Jane';
    page.lastName = 'Doe';
    page.email = 'jane@example.com';
    page.password = 'secret123';

    page.submit();
    httpMock
      .expectOne(`${customersUrl}/signup`)
      .flush({ id: 1, firstName: 'Jane', lastName: 'Doe', email: 'jane@example.com', token: 'tok-1' });

    expect(page.errorMessage()).toBeNull();
    expect(router.navigateByUrl).toHaveBeenCalledWith('/hotels/NYC001');
  });

  it('redirects to /dashboard by default after a successful sign-in', () => {
    const fixture = createComponent();
    const page = fixture.componentInstance;

    page.email = 'jane@example.com';
    page.password = 'secret123';
    page.submit();
    httpMock
      .expectOne(`${customersUrl}/signin`)
      .flush({ id: 1, firstName: 'Jane', lastName: 'Doe', email: 'jane@example.com', token: 'tok-1' });

    expect(router.navigateByUrl).toHaveBeenCalledWith('/dashboard');
  });

  it('surfaces a server error when registering an email that is already in use', () => {
    const fixture = createComponent();
    const page = fixture.componentInstance;

    page.setMode('create-account');
    page.firstName = 'Jane';
    page.lastName = 'Doe';
    page.email = 'jane@example.com';
    page.password = 'another-password';
    page.submit();

    httpMock
      .expectOne(`${customersUrl}/signup`)
      .flush({ error: 'An account with that email already exists.' }, { status: 409, statusText: 'Conflict' });

    expect(page.errorMessage()).toContain('already exists');
    expect(router.navigateByUrl).not.toHaveBeenCalled();
  });
});
