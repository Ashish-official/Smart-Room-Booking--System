import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import axiosInstance from '../api/axiosClient';
import { type Booking, type FetchBookingsParams, type PaginatedBookingResponse, type CreateBookingRequest } from '../types/boking';

interface BookingState {
  bookings: Booking[];
  selectedRoom: 'Red' | 'Blue' | 'Yellow';
  totalCount: number;
  currentPage: number;
  pageSize: number;
  isLoading: boolean;
  error: string | null;
}

const initialState: BookingState = {
  bookings: [],
  selectedRoom: 'Red',
  totalCount: 0,
  currentPage: 1,
  pageSize: 5, 
  isLoading: false,
  error: null,
};

// Asynchronous action thunk for server-side paginated queries
export const fetchBookings = createAsyncThunk(
  'bookings/fetchBookings',
  async (params: FetchBookingsParams, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get<PaginatedBookingResponse>('/bookings', {
        params: {
          room: params.room,
          page: params.page,
          limit: params.limit,
        },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to sync booking data.');
    }
  }
);

// Asynchronous action thunk for submitting new reservations
export const addNewBooking = createAsyncThunk(
  'bookings/addNewBooking',
  async (bookingData: CreateBookingRequest, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post<Booking>('/bookings', bookingData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to save reservation profile.');
    }
  }
);

const bookingSlice = createSlice({
  name: 'bookings',
  initialState,
  reducers: {
    setRoom: (state, action: PayloadAction<'Red' | 'Blue' | 'Yellow'>) => {
      state.selectedRoom = action.payload;
      state.currentPage = 1; // Reset to page 1 when switching target room
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Bookings Processing
      .addCase(fetchBookings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBookings.fulfilled, (state, action: PayloadAction<PaginatedBookingResponse>) => {
        state.isLoading = false;
        state.bookings = action.payload.data;
        state.totalCount = action.payload.total;
      })
      .addCase(fetchBookings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Add New Booking Processing
      .addCase(addNewBooking.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(addNewBooking.fulfilled, (state) => {
        state.isLoading = false;
        state.currentPage = 1; // Direct redirection reset sequence anchor
      })
      .addCase(addNewBooking.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setRoom, setPage } = bookingSlice.actions;
export default bookingSlice.reducer;
