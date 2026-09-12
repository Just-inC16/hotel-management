import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { PreferencesService } from '../../core/services/preferences.service';
import { PREFERENCE_QUALITIES, PreferenceQuality, REQUIRED_PREFERENCE_COUNT } from '../../core/models/preferences.model';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.page.html',
  styleUrl: './profile.page.scss',
})
export class ProfilePage implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly preferencesService = inject(PreferencesService);
  private readonly router = inject(Router);

  readonly user = this.authService.currentUser;
  readonly savedMessage = signal(false);
  readonly saveError = signal<string | null>(null);

  readonly qualities = PREFERENCE_QUALITIES;
  readonly requiredPreferenceCount = REQUIRED_PREFERENCE_COUNT;
  readonly preferencesSaved = signal(false);
  readonly preferencesError = signal<string | null>(null);

  firstName = this.user()?.firstName ?? '';
  lastName = this.user()?.lastName ?? '';
  phone = this.user()?.phone ?? '';
  paymentCardholderName = this.user()?.paymentCardholderName ?? '';
  paymentCardBrand = this.user()?.paymentCardBrand ?? '';
  paymentLast4 = this.user()?.paymentLast4 ?? '';
  paymentExpiry = this.user()?.paymentExpiry ?? '';

  selectedQualities: PreferenceQuality[] = [];

  ngOnInit(): void {
    this.preferencesService.refreshForCurrentUser();
    this.selectedQualities = [...(this.preferencesService.preferences()?.selected ?? [])];
  }

  isSelected(quality: PreferenceQuality): boolean {
    return this.selectedQualities.includes(quality);
  }

  toggleQuality(quality: PreferenceQuality): void {
    this.selectedQualities = this.isSelected(quality)
      ? this.selectedQualities.filter((q) => q !== quality)
      : [...this.selectedQualities, quality];
  }

  save(): void {
    this.saveError.set(null);
    this.authService
      .updateProfile({
        firstName: this.firstName,
        lastName: this.lastName,
        phone: this.phone,
        paymentCardholderName: this.paymentCardholderName,
        paymentCardBrand: this.paymentCardBrand,
        paymentLast4: this.paymentLast4,
        paymentExpiry: this.paymentExpiry,
      })
      .subscribe((result) => {
        if (!result.success) {
          this.saveError.set(result.error ?? 'Could not save your profile.');
          return;
        }
        this.savedMessage.set(true);
        setTimeout(() => this.savedMessage.set(false), 2500);
      });
  }

  savePreferences(): void {
    this.preferencesError.set(null);
    const result = this.preferencesService.setPreferences(this.selectedQualities);

    if (!result.success) {
      this.preferencesError.set(result.error ?? 'Could not save preferences.');
      return;
    }

    this.preferencesSaved.set(true);
    setTimeout(() => this.preferencesSaved.set(false), 2500);
  }

  logout(): void {
    this.authService.logout();
    void this.router.navigateByUrl('/login');
  }
}
