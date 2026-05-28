import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

interface Hotel {
  id: number;
  name: string;
  location: string;
  rooms: number;
  status: 'Open' | 'Full' | 'Maintenance';
}

@Component({
  selector: 'hotel-management-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './hotel-management.page.html',
  styleUrls: ['./hotel-management.page.scss'],
})
export class HotelManagementPage {
  hotels: Hotel[] = [
    {
      id: 1,
      name: 'Lakeview Retreat',
      location: 'Mountain Valley',
      rooms: 42,
      status: 'Open',
    },
    {
      id: 2,
      name: 'Urban Oasis',
      location: 'City Center',
      rooms: 128,
      status: 'Full',
    },
  ];

  nextId = 3;

  newHotel: Partial<Hotel> = {
    name: '',
    location: '',
    rooms: 0,
    status: 'Open',
  };

  statuses: Hotel['status'][] = ['Open', 'Full', 'Maintenance'];

  addHotel(): void {
    if (
      !this.newHotel.name?.trim() ||
      !this.newHotel.location?.trim() ||
      !this.newHotel.rooms
    ) {
      return;
    }

    this.hotels = [
      ...this.hotels,
      {
        id: this.nextId++,
        name: this.newHotel.name.trim(),
        location: this.newHotel.location.trim(),
        rooms: this.newHotel.rooms,
        status: this.newHotel.status as Hotel['status'],
      },
    ];

    this.resetForm();
  }

  deleteHotel(hotelId: number): void {
    this.hotels = this.hotels.filter((hotel) => hotel.id !== hotelId);
  }

  resetForm(): void {
    this.newHotel = {
      name: '',
      location: '',
      rooms: 0,
      status: 'Open',
    };
  }
}
