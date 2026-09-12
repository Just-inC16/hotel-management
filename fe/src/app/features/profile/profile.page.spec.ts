import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { environment } from '../../../environments/environment';
import { UserProfile } from '../../core/models/user.model';
import { SESSION_STORAGE_KEY } from '../../core/services/auth.service';
import { ProfilePage } from './profile.page';

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

describe('ProfilePage', () => {
  let router: Router;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    seedSession();
    TestBed.configureTestingModule({
      imports: [ProfilePage],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    router = TestBed.inject(Router);
    httpMock = TestBed.inject(HttpTestingController);
    spyOn(router, 'navigateByUrl').and.resolveTo(true);
  });

  afterEach(() => {
    httpMock.verify();
  });

  function createComponent() {
    const fixture = TestBed.createComponent(ProfilePage);
    fixture.detectChanges();
    return fixture;
  }

  it('initializes its fields from the signed-in user', () => {
    const fixture = createComponent();
    const page = fixture.componentInstance;

    expect(page.firstName).toBe('Jane');
    expect(page.lastName).toBe('Doe');
    expect(page.phone).toBe('');
    expect(page.selectedQualities).toEqual([]);
  });

  it('saves changes to the auth service and shows a temporary confirmation', fakeAsync(() => {
    const fixture = createComponent();
    const page = fixture.componentInstance;
    page.firstName = 'Janet';
    page.phone = '555-1234';
    page.paymentCardholderName = 'Janet Doe';
    page.paymentCardBrand = 'VISA';
    page.paymentLast4 = '4242';
    page.paymentExpiry = '01/30';

    page.save();

    const req = httpMock.expectOne(`${customersUrl}/1`);
    expect(req.request.method).toBe('PATCH');
    req.flush({
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

    expect(page.savedMessage()).toBeTrue();

    tick(2500);

    expect(page.savedMessage()).toBeFalse();
  }));

  it('surfaces an error when saving the profile fails', () => {
    const fixture = createComponent();
    const page = fixture.componentInstance;

    page.save();
    httpMock.expectOne(`${customersUrl}/1`).flush(null, { status: 400, statusText: 'Bad Request' });

    expect(page.saveError()).toContain('Could not update your profile');
    expect(page.savedMessage()).toBeFalse();
  });

  it('toggles preference qualities and reports the exactly-3 rule', () => {
    const fixture = createComponent();
    const page = fixture.componentInstance;

    page.toggleQuality('stars');
    page.toggleQuality('location');
    expect(page.selectedQualities).toEqual(['stars', 'location']);

    page.savePreferences();
    expect(page.preferencesError()).toContain('exactly 3');
    expect(page.preferencesSaved()).toBeFalse();
  });

  it('saves preferences once exactly 3 qualities are selected', fakeAsync(() => {
    const fixture = createComponent();
    const page = fixture.componentInstance;

    page.toggleQuality('stars');
    page.toggleQuality('location');
    page.toggleQuality('pricing');
    page.savePreferences();

    expect(page.preferencesSaved()).toBeTrue();
    expect(page.preferencesError()).toBeNull();

    tick(2500);
    expect(page.preferencesSaved()).toBeFalse();
  }));

  it('unselecting a quality removes it from the selection', () => {
    const fixture = createComponent();
    const page = fixture.componentInstance;

    page.toggleQuality('stars');
    page.toggleQuality('stars');

    expect(page.selectedQualities).toEqual([]);
    expect(page.isSelected('stars')).toBeFalse();
  });

  it('logs out and navigates to the login page', () => {
    const fixture = createComponent();

    fixture.componentInstance.logout();

    expect(router.navigateByUrl).toHaveBeenCalledWith('/login');
  });
});
