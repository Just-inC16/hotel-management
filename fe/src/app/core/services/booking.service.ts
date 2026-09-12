import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Booking } from '../models/booking.model';
import { ApiConfigService } from './api-config.service';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class BookingService {
  private readonly http = inject(HttpClient);
  private readonly apiConfig = inject(ApiConfigService);
  private readonly authService = inject(AuthService);

  private get reservationsUrl(): string {
    return `${this.apiConfig.apiBaseUrl}/reservation/api/v1/reservations`;
  }

  /**
   * Creates a reservation via the orchestrated `reserveHotel` flow (checks
   * room availability, charges payment, sends a notification). The backend
   * responds with the resulting notification, not the reservation record —
   * callers should treat a successful response as confirmation, not a
   * booking DTO.
   */
  createReservation(hotelId: string, startDate: string, endDate: string): Observable<unknown> {
    const customerId = this.authService.currentUser()?.id;
    return this.http.post(`${this.reservationsUrl}/reserveHotel`, {
      customerId,
      hotelId: Number(hotelId),
      startDate,
      endDate,
    });
  }

  getMyBookings(): Observable<Booking[]> {
    const customerId = this.authService.currentUser()?.id;
    return this.http.get<Booking[]>(`${this.reservationsUrl}/customer/${customerId}`);
  }
}
