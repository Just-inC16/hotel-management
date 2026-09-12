import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HotelService } from '../../core/services/hotel.service';
import { HotelMapComponent } from '../../shared/components/hotel-map/hotel-map.component';

type SortOption = 'rating-desc' | 'price-asc' | 'price-desc';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule, FormsModule, HotelMapComponent],
  templateUrl: './dashboard.page.html',
  styleUrl: './dashboard.page.scss',
})
export class DashboardPage implements OnInit {
  private readonly hotelService = inject(HotelService);
  private readonly router = inject(Router);

  readonly hotels = this.hotelService.hotels;
  readonly cities = this.hotelService.cities;

  readonly searchTerm = signal('');
  readonly cityFilter = signal('all');
  readonly minStars = signal(0);
  readonly sortBy = signal<SortOption>('rating-desc');
  readonly selectedHotelId = signal<string | null>(null);

  readonly filteredHotels = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const city = this.cityFilter();
    const minStars = this.minStars();

    const filtered = this.hotels().filter((hotel) => {
      const matchesTerm =
        term.length === 0 ||
        hotel.name.toLowerCase().includes(term) ||
        hotel.address.city.toLowerCase().includes(term) ||
        hotel.address.state.toLowerCase().includes(term);
      const matchesCity = city === 'all' || hotel.address.city === city;
      const matchesStars = hotel.starRating >= minStars;

      return matchesTerm && matchesCity && matchesStars;
    });

    const sorted = [...filtered];
    switch (this.sortBy()) {
      case 'price-asc':
        sorted.sort((a, b) => a.price.total - b.price.total);
        break;
      case 'price-desc':
        sorted.sort((a, b) => b.price.total - a.price.total);
        break;
      case 'rating-desc':
      default:
        sorted.sort((a, b) => b.guestRating - a.guestRating);
        break;
    }

    return sorted;
  });

  ngOnInit(): void {
    this.hotelService.loadHotels().subscribe();
  }

  onMapSelect(hotelId: string): void {
    this.selectedHotelId.set(hotelId);
  }

  viewHotel(hotelId: string): void {
    void this.router.navigate(['/hotels', hotelId]);
  }

  resetFilters(): void {
    this.searchTerm.set('');
    this.cityFilter.set('all');
    this.minStars.set(0);
    this.sortBy.set('rating-desc');
  }
}
