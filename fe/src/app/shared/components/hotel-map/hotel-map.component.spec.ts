import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HotelMapComponent } from './hotel-map.component';
import { Hotel } from '../../../core/models/hotel.model';

function makeHotel(overrides: Partial<Hotel> & { hotelId: string }): Hotel {
  return {
    name: 'Test Hotel',
    address: { line1: '1 Main St', city: 'Testville', state: 'TS', postalCode: '00000', countryCode: 'US' },
    coordinates: { latitude: 0, longitude: 0 },
    starRating: 4,
    locationScore: 4,
    guestRating: 4.5,
    description: 'A hotel.',
    benefits: [],
    price: { currency: 'USD', base: 100, total: 120 },
    status: 'AVAILABLE',
    ...overrides,
  };
}

describe('HotelMapComponent', () => {
  function createComponent(hotels: Hotel[]): ComponentFixture<HotelMapComponent> {
    TestBed.configureTestingModule({ imports: [HotelMapComponent] });
    const fixture = TestBed.createComponent(HotelMapComponent);
    fixture.componentRef.setInput('hotels', hotels);
    fixture.detectChanges();
    return fixture;
  }

  function mockViewportRect(
    fixture: ComponentFixture<HotelMapComponent>,
    rect: Partial<DOMRect> = {},
  ): HTMLElement {
    const el = fixture.nativeElement.querySelector('.map-viewport') as HTMLElement;
    spyOn(el, 'getBoundingClientRect').and.returnValue({
      x: 0,
      y: 0,
      top: 0,
      left: 0,
      right: 400,
      bottom: 300,
      width: 400,
      height: 300,
      toJSON: () => ({}),
      ...rect,
    } as DOMRect);
    return el;
  }

  it('shows an empty state and no pins when there are no hotels', () => {
    const fixture = createComponent([]);
    expect(fixture.componentInstance.pins().length).toBe(0);
    expect(fixture.nativeElement.querySelector('.map-empty')).toBeTruthy();
  });

  it('positions a single hotel using the fallback span', () => {
    const fixture = createComponent([
      makeHotel({ hotelId: 'A', coordinates: { latitude: 10, longitude: 20 } }),
    ]);
    const [pin] = fixture.componentInstance.pins();

    expect(pin.x).toBeCloseTo(12);
    expect(pin.y).toBeCloseTo(88);
  });

  it('spreads pins across the padded range based on lat/lon bounds', () => {
    const fixture = createComponent([
      makeHotel({ hotelId: 'A', coordinates: { latitude: 0, longitude: 0 } }),
      makeHotel({ hotelId: 'B', coordinates: { latitude: 10, longitude: 10 } }),
    ]);
    const pins = fixture.componentInstance.pins();
    const a = pins.find((p) => p.hotel.hotelId === 'A')!;
    const b = pins.find((p) => p.hotel.hotelId === 'B')!;

    // B is further north (higher latitude), which should render higher up (smaller y).
    expect(b.y).toBeLessThan(a.y);
    expect(b.x).toBeGreaterThan(a.x);
    expect(a.x).toBeCloseTo(12);
    expect(a.y).toBeCloseTo(88);
    expect(b.x).toBeCloseTo(88);
    expect(b.y).toBeCloseTo(12);
  });

  it('emits hotelSelected when a pin is selected without dragging', () => {
    const fixture = createComponent([makeHotel({ hotelId: 'A' })]);
    const page = fixture.componentInstance;
    const emitted: string[] = [];
    page.hotelSelected.subscribe((id) => emitted.push(id));

    page.select('A');

    expect(emitted).toEqual(['A']);
  });

  it('starts at the minimum zoom and will not zoom out further', () => {
    const fixture = createComponent([]);
    const page = fixture.componentInstance;

    expect(page.zoom()).toBe(1);
    expect(page.canZoomOut()).toBeFalse();

    page.zoomOut();

    expect(page.zoom()).toBe(1);
  });

  it('zooms in up to the maximum and then stops', () => {
    const fixture = createComponent([]);
    mockViewportRect(fixture);
    const page = fixture.componentInstance;

    for (let i = 0; i < 20; i++) {
      page.zoomIn();
    }

    expect(page.zoom()).toBe(5);
    expect(page.canZoomIn()).toBeFalse();
  });

  it('resetView restores the default zoom and pan', () => {
    const fixture = createComponent([]);
    mockViewportRect(fixture);
    const page = fixture.componentInstance;
    page.zoomIn();
    page.zoomIn();

    page.resetView();

    expect(page.zoom()).toBe(1);
    expect(page.panX()).toBe(0);
    expect(page.panY()).toBe(0);
  });

  it('zooming with the wheel zooms in and keeps the pan within bounds', () => {
    const fixture = createComponent([]);
    mockViewportRect(fixture, { width: 400, height: 300, left: 0, top: 0 });
    const page = fixture.componentInstance;

    const event = new WheelEvent('wheel', { deltaY: -500, clientX: 300, clientY: 200 });
    spyOn(event, 'preventDefault');
    page.onWheel(event);

    expect(event.preventDefault).toHaveBeenCalled();
    expect(page.zoom()).toBeGreaterThan(1);
    expect(page.panX()).toBeLessThanOrEqual(0);
    expect(page.panY()).toBeLessThanOrEqual(0);
  });

  it('zooming out with the wheel does not go below the minimum', () => {
    const fixture = createComponent([]);
    mockViewportRect(fixture, { width: 400, height: 300, left: 0, top: 0 });
    const page = fixture.componentInstance;

    const event = new WheelEvent('wheel', { deltaY: 500, clientX: 300, clientY: 200 });
    page.onWheel(event);

    expect(page.zoom()).toBe(1);
    expect(page.panX()).toBe(0);
    expect(page.panY()).toBe(0);
  });

  it('pans by dragging once zoomed in, and clamps at the edges', () => {
    const fixture = createComponent([]);
    mockViewportRect(fixture, { width: 400, height: 300, left: 0, top: 0 });
    const page = fixture.componentInstance;
    page.zoomIn(); // zoom = 1.5, so there is room to pan.

    const target = document.createElement('div');
    spyOn(target, 'setPointerCapture');
    const down = new PointerEvent('pointerdown', { pointerId: 1, clientX: 100, clientY: 100, button: 0 });
    Object.defineProperty(down, 'target', { value: target });
    page.onPointerDown(down);

    expect(page.isPanning()).toBeTrue();

    page.onPointerMove(new PointerEvent('pointermove', { pointerId: 1, clientX: -1000, clientY: -1000 }));

    // Dragging far past the edge should clamp, never leaving a gap in the viewport.
    expect(page.panX()).toBe(400 - 400 * 1.5);
    expect(page.panY()).toBe(300 - 300 * 1.5);

    page.onPointerUp(new PointerEvent('pointerup', { pointerId: 1 }));
    expect(page.isPanning()).toBeFalse();
  });

  it('ignores pointer moves from a different pointer than the one that started the drag', () => {
    const fixture = createComponent([]);
    mockViewportRect(fixture, { width: 400, height: 300, left: 0, top: 0 });
    const page = fixture.componentInstance;
    page.zoomIn();
    const panXBeforeMove = page.panX();
    const panYBeforeMove = page.panY();

    const target = document.createElement('div');
    spyOn(target, 'setPointerCapture');
    const down = new PointerEvent('pointerdown', { pointerId: 1, clientX: 100, clientY: 100, button: 0 });
    Object.defineProperty(down, 'target', { value: target });
    page.onPointerDown(down);

    page.onPointerMove(new PointerEvent('pointermove', { pointerId: 2, clientX: 0, clientY: 0 }));

    expect(page.panX()).toBe(panXBeforeMove);
    expect(page.panY()).toBe(panYBeforeMove);
  });

  it('suppresses the click that follows a drag-to-pan gesture', () => {
    const fixture = createComponent([makeHotel({ hotelId: 'A' })]);
    mockViewportRect(fixture, { width: 400, height: 300, left: 0, top: 0 });
    const page = fixture.componentInstance;
    page.zoomIn();

    const target = document.createElement('div');
    spyOn(target, 'setPointerCapture');
    const down = new PointerEvent('pointerdown', { pointerId: 1, clientX: 100, clientY: 100, button: 0 });
    Object.defineProperty(down, 'target', { value: target });
    page.onPointerDown(down);
    page.onPointerMove(new PointerEvent('pointermove', { pointerId: 1, clientX: 50, clientY: 50 }));

    const emitted: string[] = [];
    page.hotelSelected.subscribe((id) => emitted.push(id));
    page.select('A');

    expect(emitted).toEqual([]);
  });

  it('does not suppress a click when the pointer barely moved', () => {
    const fixture = createComponent([makeHotel({ hotelId: 'A' })]);
    mockViewportRect(fixture, { width: 400, height: 300, left: 0, top: 0 });
    const page = fixture.componentInstance;
    page.zoomIn();

    const target = document.createElement('div');
    spyOn(target, 'setPointerCapture');
    const down = new PointerEvent('pointerdown', { pointerId: 1, clientX: 100, clientY: 100, button: 0 });
    Object.defineProperty(down, 'target', { value: target });
    page.onPointerDown(down);
    page.onPointerMove(new PointerEvent('pointermove', { pointerId: 1, clientX: 101, clientY: 100 }));

    const emitted: string[] = [];
    page.hotelSelected.subscribe((id) => emitted.push(id));
    page.select('A');

    expect(emitted).toEqual(['A']);
  });

  it('ignores non-primary pointer button presses', () => {
    const fixture = createComponent([]);
    mockViewportRect(fixture, { width: 400, height: 300, left: 0, top: 0 });
    const page = fixture.componentInstance;

    const down = new PointerEvent('pointerdown', { pointerId: 1, clientX: 100, clientY: 100, button: 2 });
    page.onPointerDown(down);

    expect(page.isPanning()).toBeFalse();
  });
});
