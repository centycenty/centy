import { create } from 'zustand';
import { BookingState, Booking, BookingForm } from '../types';

interface BookingStore extends BookingState {
  setBookings: (bookings: Booking[]) => void;
  setCurrentBooking: (booking: Booking | null) => void;
  setLoading: (loading: boolean) => void;
  createBooking: (bookingData: BookingForm) => Promise<boolean>;
  updateBookingStatus: (bookingId: string, status: string) => Promise<boolean>;
  fetchBookings: (userId: string) => Promise<void>;
  fetchBookingById: (bookingId: string) => Promise<void>;
}

export const useBookingStore = create<BookingStore>((set, get) => ({
  bookings: [],
  currentBooking: null,
  isLoading: false,

  setBookings: (bookings) => set({ bookings }),
  setCurrentBooking: (currentBooking) => set({ currentBooking }),
  setLoading: (isLoading) => set({ isLoading }),

  createBooking: async (bookingData: BookingForm) => {
    try {
      set({ isLoading: true });
      
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData),
      });

      if (response.ok) {
        const newBooking = await response.json();
        const currentBookings = get().bookings;
        set({ bookings: [newBooking, ...currentBookings] });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Create booking error:', error);
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  updateBookingStatus: async (bookingId: string, status: string) => {
    try {
      set({ isLoading: true });
      
      const response = await fetch(`/api/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        const updatedBooking = await response.json();
        const currentBookings = get().bookings;
        const updatedBookings = currentBookings.map(booking =>
          booking.id === bookingId ? updatedBooking : booking
        );
        set({ bookings: updatedBookings });
        
        if (get().currentBooking?.id === bookingId) {
          set({ currentBooking: updatedBooking });
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error('Update booking status error:', error);
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  fetchBookings: async (userId: string) => {
    try {
      set({ isLoading: true });
      
      const response = await fetch(`/api/bookings/user/${userId}`);
      
      if (response.ok) {
        const bookings = await response.json();
        set({ bookings });
      }
    } catch (error) {
      console.error('Fetch bookings error:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchBookingById: async (bookingId: string) => {
    try {
      set({ isLoading: true });
      
      const response = await fetch(`/api/bookings/${bookingId}`);
      
      if (response.ok) {
        const booking = await response.json();
        set({ currentBooking: booking });
      }
    } catch (error) {
      console.error('Fetch booking error:', error);
    } finally {
      set({ isLoading: false });
    }
  },
}));