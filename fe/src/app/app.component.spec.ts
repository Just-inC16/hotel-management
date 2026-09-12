import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app.component';
import { routes } from './app.routes';
import { SESSION_STORAGE_KEY } from './core/services/auth.service';
import { UserProfile } from './core/models/user.model';

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

describe('AppComponent', () => {
  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [provideRouter(routes), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have the 'Hotel Booking' title`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('Hotel Booking');
  });

  it('should render the brand name and a login link when signed out', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.brand')?.textContent).toContain('Hotel Booking');
    expect(compiled.querySelector('.login-link')).toBeTruthy();
    expect(compiled.querySelector('.user-icon-button')).toBeFalsy();
    expect(compiled.querySelector('a[href="/bookings"]')).toBeFalsy();
  });

  it('shows a user-icon profile button and Bookings/For You links when signed in', () => {
    seedSession();
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    const profileButton = compiled.querySelector('.user-icon-button');
    expect(profileButton).toBeTruthy();
    expect(profileButton?.getAttribute('aria-label')).toBe('Profile for Jane');
    expect(compiled.querySelector('a[href="/bookings"]')).toBeTruthy();
    expect(compiled.querySelector('a[href="/recommendations"]')).toBeTruthy();
    expect(compiled.querySelector('.login-link')).toBeFalsy();
  });

  it('logs out and returns to a signed-out nav when the user icon area logout button is clicked', () => {
    seedSession();
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();

    fixture.componentInstance.logout();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.user-icon-button')).toBeFalsy();
    expect(compiled.querySelector('.login-link')).toBeTruthy();
  });
});
