import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

type LoginMode = 'sign-in' | 'create-account';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.page.html',
  styleUrl: './login.page.scss',
})
export class LoginPage {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly mode = signal<LoginMode>('sign-in');
  readonly errorMessage = signal<string | null>(null);
  readonly submitting = signal(false);

  email = '';
  password = '';
  firstName = '';
  lastName = '';

  setMode(mode: LoginMode): void {
    this.mode.set(mode);
    this.errorMessage.set(null);
  }

  submit(): void {
    this.errorMessage.set(null);
    this.submitting.set(true);

    const result$ =
      this.mode() === 'sign-in'
        ? this.authService.login(this.email, this.password)
        : this.authService.register({
            email: this.email,
            password: this.password,
            firstName: this.firstName,
            lastName: this.lastName,
          });

    result$.subscribe((result) => {
      this.submitting.set(false);

      if (!result.success) {
        this.errorMessage.set(result.error ?? 'Something went wrong.');
        return;
      }

      const redirect = this.route.snapshot.queryParamMap.get('redirect') ?? '/dashboard';
      void this.router.navigateByUrl(redirect);
    });
  }
}
