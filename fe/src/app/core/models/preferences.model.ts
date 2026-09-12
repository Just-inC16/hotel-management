export type PreferenceQuality = 'stars' | 'location' | 'pricing' | 'amenities';

export const PREFERENCE_QUALITIES: PreferenceQuality[] = ['stars', 'location', 'pricing', 'amenities'];

export const REQUIRED_PREFERENCE_COUNT = 3;

export interface HotelPreferences {
  selected: PreferenceQuality[];
}
