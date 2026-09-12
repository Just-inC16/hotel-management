import { CommonModule } from '@angular/common';
import { Component, ElementRef, computed, input, output, signal, viewChild } from '@angular/core';
import { Hotel } from '../../../core/models/hotel.model';

interface HotelPin {
  hotel: Hotel;
  x: number;
  y: number;
}

const PADDING_PERCENT = 12;
const RANGE_PERCENT = 100 - PADDING_PERCENT * 2;

const MIN_ZOOM = 1;
const MAX_ZOOM = 5;
const ZOOM_STEP = 0.5;
const WHEEL_ZOOM_SENSITIVITY = 0.0015;

@Component({
  selector: 'app-hotel-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hotel-map.component.html',
  styleUrl: './hotel-map.component.scss',
})
export class HotelMapComponent {
  readonly hotels = input.required<Hotel[]>();
  readonly selectedHotelId = input<string | null>(null);

  readonly hotelSelected = output<string>();

  private readonly viewport = viewChild.required<ElementRef<HTMLElement>>('viewport');

  readonly zoom = signal(MIN_ZOOM);
  readonly panX = signal(0);
  readonly panY = signal(0);
  readonly isPanning = signal(false);

  private dragPointerId: number | null = null;
  private dragStartX = 0;
  private dragStartY = 0;
  private panStartX = 0;
  private panStartY = 0;
  private dragMoved = false;

  readonly canZoomIn = computed(() => this.zoom() < MAX_ZOOM);
  readonly canZoomOut = computed(() => this.zoom() > MIN_ZOOM);

  readonly contentStyle = computed(() => ({
    transform: `translate(${this.panX()}px, ${this.panY()}px) scale(${this.zoom()})`,
  }));

  readonly pins = computed<HotelPin[]>(() => {
    const hotels = this.hotels();
    if (hotels.length === 0) {
      return [];
    }

    const lats = hotels.map((hotel) => hotel.coordinates.latitude);
    const lons = hotels.map((hotel) => hotel.coordinates.longitude);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLon = Math.min(...lons);
    const maxLon = Math.max(...lons);

    const latSpan = maxLat - minLat || 1;
    const lonSpan = maxLon - minLon || 1;

    return hotels.map((hotel) => {
      const xRatio = (hotel.coordinates.longitude - minLon) / lonSpan;
      const yRatio = (hotel.coordinates.latitude - minLat) / latSpan;

      return {
        hotel,
        x: PADDING_PERCENT + xRatio * RANGE_PERCENT,
        // Latitude increases northward, but screen y increases downward.
        y: PADDING_PERCENT + (1 - yRatio) * RANGE_PERCENT,
      };
    });
  });

  select(hotelId: string): void {
    if (this.dragMoved) {
      // Suppress the click that follows a drag-to-pan gesture.
      return;
    }
    this.hotelSelected.emit(hotelId);
  }

  zoomIn(): void {
    this.applyZoom(this.zoom() + ZOOM_STEP);
  }

  zoomOut(): void {
    this.applyZoom(this.zoom() - ZOOM_STEP);
  }

  resetView(): void {
    this.zoom.set(MIN_ZOOM);
    this.panX.set(0);
    this.panY.set(0);
  }

  onWheel(event: WheelEvent): void {
    event.preventDefault();
    const rect = this.viewport().nativeElement.getBoundingClientRect();
    const pointerX = event.clientX - rect.left;
    const pointerY = event.clientY - rect.top;
    const factor = Math.exp(-event.deltaY * WHEEL_ZOOM_SENSITIVITY);
    this.applyZoom(this.zoom() * factor, pointerX, pointerY);
  }

  onPointerDown(event: PointerEvent): void {
    if (event.button !== 0) {
      return;
    }
    this.dragPointerId = event.pointerId;
    this.dragStartX = event.clientX;
    this.dragStartY = event.clientY;
    this.panStartX = this.panX();
    this.panStartY = this.panY();
    this.dragMoved = false;
    this.isPanning.set(true);
    (event.target as HTMLElement).setPointerCapture(event.pointerId);
  }

  onPointerMove(event: PointerEvent): void {
    if (this.dragPointerId === null || event.pointerId !== this.dragPointerId) {
      return;
    }
    const dx = event.clientX - this.dragStartX;
    const dy = event.clientY - this.dragStartY;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      this.dragMoved = true;
    }
    this.setPan(this.panStartX + dx, this.panStartY + dy);
  }

  onPointerUp(event: PointerEvent): void {
    if (this.dragPointerId !== event.pointerId) {
      return;
    }
    this.dragPointerId = null;
    this.isPanning.set(false);
  }

  private applyZoom(nextZoom: number, pointerX?: number, pointerY?: number): void {
    const clampedZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, nextZoom));
    const prevZoom = this.zoom();
    if (clampedZoom === prevZoom) {
      return;
    }

    const rect = this.viewport().nativeElement.getBoundingClientRect();
    const anchorX = pointerX ?? rect.width / 2;
    const anchorY = pointerY ?? rect.height / 2;

    // Keep the point under the anchor stationary on screen while zooming.
    const contentX = (anchorX - this.panX()) / prevZoom;
    const contentY = (anchorY - this.panY()) / prevZoom;

    this.zoom.set(clampedZoom);
    this.setPan(anchorX - contentX * clampedZoom, anchorY - contentY * clampedZoom, rect);
  }

  private setPan(nextX: number, nextY: number, rect?: DOMRect): void {
    const bounds = rect ?? this.viewport().nativeElement.getBoundingClientRect();
    const zoom = this.zoom();
    const scaledWidth = bounds.width * zoom;
    const scaledHeight = bounds.height * zoom;

    const minX = Math.min(0, bounds.width - scaledWidth);
    const minY = Math.min(0, bounds.height - scaledHeight);

    this.panX.set(Math.min(0, Math.max(minX, nextX)));
    this.panY.set(Math.min(0, Math.max(minY, nextY)));
  }
}
