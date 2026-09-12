import { Injectable, inject, signal } from '@angular/core';
import { HotelPreferences, PreferenceQuality, REQUIRED_PREFERENCE_COUNT } from '../models/preferences.model';
import { AuthService } from './auth.service';

const STORAGE_PREFIX = 'hotelapp.preferences.';

export interface SetPreferencesResult {
  success: boolean;
  error?: string;
}

/**
 * Client-side, per-user preference storage for the hotel recommender.
 * Preferences aren't required by anything on the backend, so they live
 * entirely in localStorage keyed by the signed-in user's email.
 */
@Injectable({ providedIn: 'root' })
export class PreferencesService {
  private readonly authService = inject(AuthService);

  private readonly preferencesSignal = signal<HotelPreferences | null>(this.readForCurrentUser());

  readonly preferences = this.preferencesSignal.asReadonly();

  setPreferences(selected: PreferenceQuality[]): SetPreferencesResult {
    const uniqueCount = new Set(selected).size;
    if (uniqueCount !== selected.length || selected.length !== REQUIRED_PREFERENCE_COUNT) {
      return { success: false, error: `Choose exactly ${REQUIRED_PREFERENCE_COUNT} qualities.` };
    }

    const key = this.storageKey();
    if (!key) {
      return { success: false, error: 'You must be signed in.' };
    }

    const preferences: HotelPreferences = { selected: [...selected] };
    this.preferencesSignal.set(preferences);
    localStorage.setItem(key, JSON.stringify(preferences));
    return { success: true };
  }

  /** Re-reads localStorage for whoever is currently signed in — call after login/logout. */
  refreshForCurrentUser(): void {
    this.preferencesSignal.set(this.readForCurrentUser());
  }

  private storageKey(): string | null {
    const email = this.authService.currentUser()?.email;
    return email ? `${STORAGE_PREFIX}${email}` : null;
  }

  private readForCurrentUser(): HotelPreferences | null {
    const key = this.storageKey();
    if (!key) {
      return null;
    }
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as HotelPreferences) : null;
    } catch {
      return null;
    }
  }
}
