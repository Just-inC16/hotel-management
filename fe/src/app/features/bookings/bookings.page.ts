import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Booking } from '../../core/models/booking.model';
import { Hotel } from '../../core/models/hotel.model';
import { BookingService } from '../../core/services/booking.service';
import { HotelService } from '../../core/services/hotel.service';

export interface BookingWithHotel {
  booking: Booking;
  hotel: Hotel | undefined;
}

@Component({
  selector: 'app-bookings-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './bookings.page.html',
  styleUrl: './bookings.page.scss',
})
export class BookingsPage implements OnInit {
  private readonly bookingService = inject(BookingService);
  private readonly hotelService = inject(HotelService);

  readonly loading = signal(true);
  readonly loadError = signal(false);
  readonly bookings = signal<Booking[]>([]);

  readonly bookingsWithHotels = computed<BookingWithHotel[]>(() =>
    this.bookings().map((booking) => ({
      booking,
      hotel: this.hotelService.getHotelById(String(booking.hotelId)),
    })),
  );

  ngOnInit(): void {
    forkJoin([this.hotelService.loadHotels(), this.bookingService.getMyBookings()]).subscribe({
      next: ([, bookings]) => {
        this.bookings.set(bookings);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.loadError.set(true);
      },
    });
  }
}
