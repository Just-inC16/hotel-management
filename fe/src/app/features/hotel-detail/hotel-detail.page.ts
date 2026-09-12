import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { BookingService } from '../../core/services/booking.service';
import { HotelService } from '../../core/services/hotel.service';
import { HotelMapComponent } from '../../shared/components/hotel-map/hotel-map.component';

@Component({
  selector: 'app-hotel-detail-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, HotelMapComponent],
  templateUrl: './hotel-detail.page.html',
  styleUrl: './hotel-detail.page.scss',
})
export class HotelDetailPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly hotelService = inject(HotelService);
  private readonly authService = inject(AuthService);
  private readonly bookingService = inject(BookingService);

  readonly hotelId = signal(this.route.snapshot.paramMap.get('id') ?? '');
  readonly loaded = signal(false);
  readonly bookingConfirmed = signal(false);
  readonly bookingError = signal<string | null>(null);
  readonly isBooking = signal(false);

  startDate = '';
  endDate = '';

  readonly hotel = computed(() => {
    if (!this.loaded()) {
      return undefined;
    }
    return this.hotelService.getHotelById(this.hotelId());
  });

  readonly mapHotels = computed(() => (this.hotel() ? [this.hotel()!] : []));

  ngOnInit(): void {
    this.hotelService.loadHotels().subscribe(() => this.loaded.set(true));
  }

  book(): void {
    this.bookingError.set(null);

    if (!this.authService.isLoggedIn()) {
      void this.router.navigate(['/login'], {
        queryParams: { redirect: `/hotels/${this.hotelId()}` },
      });
      return;
    }

    if (!this.startDate || !this.endDate) {
      this.bookingError.set('Choose a check-in and check-out date.');
      return;
    }

    if (this.startDate >= this.endDate) {
      this.bookingError.set('Check-out date must be after the check-in date.');
      return;
    }

    this.isBooking.set(true);
    this.bookingService.createReservation(this.hotelId(), this.startDate, this.endDate).subscribe({
      next: () => {
        this.isBooking.set(false);
        this.bookingConfirmed.set(true);
      },
      error: () => {
        this.isBooking.set(false);
        this.bookingError.set('Something went wrong booking this hotel. Please try again.');
      },
    });
  }
}
