import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, map, shareReplay, tap } from 'rxjs';
import { Hotel, HotelAddress, HotelCoordinates, HotelStatus } from '../models/hotel.model';
import { ApiConfigService } from './api-config.service';

interface HotelManagementDto {
  id: number;
  name: string;
  status: HotelStatus;
  amount: number;
  currency?: string;
  address?: HotelAddress;
  coordinates?: HotelCoordinates;
  starRating?: number;
  locationScore?: number;
  guestRating?: number;
  description?: string;
  benefits?: string[];
}

@Injectable({ providedIn: 'root' })
export class HotelService {
  private readonly http = inject(HttpClient);
  private readonly apiConfig = inject(ApiConfigService);

  private readonly hotelsSignal = signal<Hotel[]>([]);
  private loadRequest$: Observable<Hotel[]> | null = null;

  readonly hotels = this.hotelsSignal.asReadonly();

  readonly cities = computed(() => {
    const unique = new Set(this.hotelsSignal().map((hotel) => hotel.address.city));
    return Array.from(unique).sort();
  });

  loadHotels(): Observable<Hotel[]> {
    if (!this.loadRequest$) {
      this.loadRequest$ = this.http
        .get<HotelManagementDto[]>(`${this.apiConfig.apiBaseUrl}/hotelmanagement/api/v1/hotelManagements`)
        .pipe(
          map((dtos) => dtos.map((dto) => this.toHotel(dto))),
          tap((hotels) => this.hotelsSignal.set(hotels)),
          shareReplay(1),
        );
    }
    return this.loadRequest$;
  }

  getHotelById(hotelId: string): Hotel | undefined {
    return this.hotelsSignal().find((hotel) => hotel.hotelId === hotelId);
  }

  private toHotel(dto: HotelManagementDto): Hotel {
    return {
      hotelId: String(dto.id),
      name: dto.name,
      address: dto.address ?? { line1: '', city: '', state: '', postalCode: '', countryCode: '' },
      coordinates: dto.coordinates ?? { latitude: 0, longitude: 0 },
      starRating: dto.starRating ?? 0,
      locationScore: dto.locationScore ?? 0,
      guestRating: dto.guestRating ?? 0,
      description: dto.description ?? '',
      benefits: dto.benefits ?? [],
      price: {
        currency: dto.currency ?? 'USD',
        base: dto.amount,
        total: dto.amount,
      },
      status: dto.status,
    };
  }
}
