
export interface Booking {
  id: string;
  room: 'Red' | 'Blue' | 'Yellow';
  date: string;     
  startTime: string; 
  endTime: string;   
  email: string;
}

export interface FetchBookingsParams {
  room: 'Red' | 'Blue' | 'Yellow';
  page: number;
  limit: number;
}

export interface PaginatedBookingResponse {
  data: Booking[];
  total: number;   
  page: number;
  limit: number;
}

export interface CreateBookingRequest {
  room: 'Red' | 'Blue' | 'Yellow';
  date: string;
  startTime: string;
  endTime: string;
  email: string;
}
