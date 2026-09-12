import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HotelPreferences } from '../../core/models/preferences.model';
import { HotelRecommenderService, RankedHotel } from '../../core/services/hotel-recommender.service';
import { HotelService } from '../../core/services/hotel.service';
import { PreferencesService } from '../../core/services/preferences.service';

type TopCount = 1 | 5 | 10;

@Component({
  selector: 'app-recommendations-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './recommendations.page.html',
  styleUrl: './recommendations.page.scss',
})
export class RecommendationsPage implements OnInit {
  private readonly hotelService = inject(HotelService);
  private readonly preferencesService = inject(PreferencesService);
  private readonly recommenderService = inject(HotelRecommenderService);

  readonly topCountOptions: TopCount[] = [1, 5, 10];

  readonly loading = signal(true);
  readonly topCount = signal<TopCount>(5);

  readonly preferences = computed<HotelPreferences | null>(() => this.preferencesService.preferences());

  readonly recommendations = computed<RankedHotel[]>(() => {
    const preferences = this.preferences();
    if (!preferences) {
      return [];
    }
    return this.recommenderService.top(this.hotelService.hotels(), preferences, this.topCount());
  });

  ngOnInit(): void {
    this.preferencesService.refreshForCurrentUser();
    this.hotelService.loadHotels().subscribe(() => this.loading.set(false));
  }

  setTopCount(count: TopCount): void {
    this.topCount.set(count);
  }
}
