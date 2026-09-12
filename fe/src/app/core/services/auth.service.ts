import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { UserProfile } from '../models/user.model';
import { ApiConfigService } from './api-config.service';
import { TOKEN_STORAGE_KEY } from '../interceptors/auth.interceptor';

export const SESSION_STORAGE_KEY = 'hotelapp.session';

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export type ProfileUpdate = Pick<
  UserProfile,
  'firstName' | 'lastName' | 'phone' | 'paymentCardholderName' | 'paymentCardBrand' | 'paymentLast4' | 'paymentExpiry'
>;

export interface AuthResult {
  success: boolean;
  error?: string;
}

interface AuthResponseDto {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  token: string;
}

interface CustomerResponseDto {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  paymentCardholderName?: string;
  paymentCardBrand?: string;
  paymentLast4?: string;
  paymentExpiry?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiConfig = inject(ApiConfigService);

  private readonly currentUserSignal = signal<UserProfile | null>(this.readSession());

  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isLoggedIn = computed(() => this.currentUserSignal() !== null);

  private get customersUrl(): string {
    return `${this.apiConfig.apiBaseUrl}/customer/api/v1/customers`;
  }

  login(email: string, password: string): Observable<AuthResult> {
    return this.http
      .post<AuthResponseDto>(`${this.customersUrl}/signin`, {
        email: email.trim(),
        password,
      })
      .pipe(
        tap((response) => this.setSession(response)),
        map(() => ({ success: true })),
        catchError((err: HttpErrorResponse) =>
          of({ success: false, error: this.extractError(err, 'Incorrect email or password.') }),
        ),
      );
  }

  register(request: RegisterRequest): Observable<AuthResult> {
    return this.http
      .post<AuthResponseDto>(`${this.customersUrl}/signup`, {
        firstName: request.firstName.trim(),
        lastName: request.lastName.trim(),
        email: request.email.trim(),
        password: request.password,
        role: 'customer',
      })
      .pipe(
        tap((response) => this.setSession(response)),
        map(() => ({ success: true })),
        catchError((err: HttpErrorResponse) =>
          of({ success: false, error: this.extractError(err, 'Could not create your account.') }),
        ),
      );
  }

  logout(): void {
    this.currentUserSignal.set(null);
    localStorage.removeItem(SESSION_STORAGE_KEY);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  }

  updateProfile(update: ProfileUpdate): Observable<AuthResult> {
    const current = this.currentUserSignal();
    if (!current) {
      return of({ success: false, error: 'You must be signed in.' });
    }

    return this.http.patch<CustomerResponseDto>(`${this.customersUrl}/${current.id}`, update).pipe(
      tap((response) => {
        const merged: UserProfile = { ...current, ...this.toProfileUpdate(response) };
        this.currentUserSignal.set(merged);
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(merged));
      }),
      map(() => ({ success: true })),
      catchError((err: HttpErrorResponse) =>
        of({ success: false, error: this.extractError(err, 'Could not update your profile.') }),
      ),
    );
  }

  private setSession(response: AuthResponseDto): void {
    const profile: UserProfile = {
      id: response.id,
      email: response.email,
      firstName: response.firstName,
      lastName: response.lastName,
      phone: '',
      paymentCardholderName: '',
      paymentCardBrand: '',
      paymentLast4: '',
      paymentExpiry: '',
      token: response.token,
    };
    this.currentUserSignal.set(profile);
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(profile));
    localStorage.setItem(TOKEN_STORAGE_KEY, response.token);
  }

  private toProfileUpdate(dto: CustomerResponseDto): Partial<UserProfile> {
    return {
      id: dto.id,
      email: dto.email,
      firstName: dto.firstName,
      lastName: dto.lastName,
      phone: dto.phone ?? '',
      paymentCardholderName: dto.paymentCardholderName ?? '',
      paymentCardBrand: dto.paymentCardBrand ?? '',
      paymentLast4: dto.paymentLast4 ?? '',
      paymentExpiry: dto.paymentExpiry ?? '',
    };
  }

  private extractError(err: HttpErrorResponse, fallback: string): string {
    const body: unknown = err.error;
    if (body && typeof body === 'object' && 'error' in body) {
      const message = (body as { error?: unknown }).error;
      if (typeof message === 'string' && message.length > 0) {
        return message;
      }
    }
    return fallback;
  }

  private readSession(): UserProfile | null {
    try {
      const raw = localStorage.getItem(SESSION_STORAGE_KEY);
      return raw ? (JSON.parse(raw) as UserProfile) : null;
    } catch {
      return null;
    }
  }
}
