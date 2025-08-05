// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  profileImage?: string;
  type: 'customer' | 'worker';
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Worker Types
export interface Worker extends User {
  type: 'worker';
  category: WorkerCategory;
  skills: string[];
  experience: number;
  certifications?: string[];
  availability: AvailabilityStatus;
  rating: number;
  reviewCount: number;
  hourlyRate?: number;
  location: Location;
  portfolio?: PortfolioItem[];
  guarantor?: GuarantorInfo;
  idVerification?: IdVerification;
}

export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  completedAt: Date;
}

export interface GuarantorInfo {
  name: string;
  phone: string;
  relationship: string;
  idNumber?: string;
}

export interface IdVerification {
  idType: 'national_id' | 'drivers_license' | 'passport';
  idNumber: string;
  idImageUrl: string;
  status: 'pending' | 'verified' | 'rejected';
  verifiedAt?: Date;
}

// Booking Types
export interface Booking {
  id: string;
  customerId: string;
  workerId: string;
  category: WorkerCategory;
  title: string;
  description: string;
  scheduledDate: Date;
  scheduledTime: string;
  location: Location;
  status: BookingStatus;
  price?: number;
  images?: string[];
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  review?: Review;
}

export interface Review {
  id: string;
  bookingId: string;
  customerId: string;
  workerId: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

// Location Types
export interface Location {
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  state: string;
  country: string;
}

// Chat Types
export interface ChatMessage {
  id: string;
  bookingId: string;
  senderId: string;
  receiverId: string;
  message: string;
  type: 'text' | 'image' | 'location';
  timestamp: Date;
  isRead: boolean;
}

export interface ChatRoom {
  id: string;
  bookingId: string;
  participants: string[];
  lastMessage?: ChatMessage;
  updatedAt: Date;
}

// Enums
export type WorkerCategory = 
  | 'electrician'
  | 'plumber'
  | 'carpenter'
  | 'ac_technician'
  | 'tailor'
  | 'mechanic'
  | 'painter'
  | 'cleaner'
  | 'gardener'
  | 'security'
  | 'other';

export type AvailabilityStatus = 'available' | 'busy' | 'not_taking_jobs';

export type BookingStatus = 
  | 'pending'
  | 'accepted'
  | 'rejected'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

// Navigation Types
export type RootStackParamList = {
  Splash: undefined;
  Auth: undefined;
  CustomerHome: undefined;
  WorkerHome: undefined;
  Profile: undefined;
  Search: undefined;
  WorkerDetail: { workerId: string };
  BookingDetail: { bookingId: string };
  Chat: { bookingId: string; receiverId: string };
  Map: undefined;
};

export type CustomerTabParamList = {
  Home: undefined;
  Search: undefined;
  Bookings: undefined;
  Profile: undefined;
};

export type WorkerTabParamList = {
  Home: undefined;
  Bookings: undefined;
  Profile: undefined;
  Earnings: undefined;
};

// API Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Store Types
export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface BookingState {
  bookings: Booking[];
  currentBooking: Booking | null;
  isLoading: boolean;
}

export interface WorkerState {
  workers: Worker[];
  currentWorker: Worker | null;
  isLoading: boolean;
  searchResults: Worker[];
}

// Theme Types
export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  error: string;
  success: string;
  warning: string;
}

export interface Theme {
  colors: ThemeColors;
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  typography: {
    h1: object;
    h2: object;
    h3: object;
    body: object;
    caption: object;
  };
}

// Notification Types
export interface NotificationData {
  type: 'booking_request' | 'booking_update' | 'message' | 'review';
  bookingId?: string;
  senderId?: string;
  title: string;
  body: string;
}

// Form Types
export interface LoginForm {
  phone: string;
  otp?: string;
}

export interface WorkerRegistrationForm {
  name: string;
  phone: string;
  email: string;
  category: WorkerCategory;
  skills: string[];
  experience: number;
  hourlyRate: number;
  location: Location;
}

export interface BookingForm {
  workerId: string;
  title: string;
  description: string;
  scheduledDate: Date;
  scheduledTime: string;
  location: Location;
  images?: string[];
}