// GET /api/room-types dan /api/room-types/{slug}
export type RoomTypeDto = {
  id: number;
  name: string;
  slug: string;
  description: string;
  basePrice: number;
  capacity: number;
  imageUrl: string | null;
};

// GET /api/rooms/available
export type AvailableRoomTypeDto = {
  roomTypeId: number;
  name: string;
  slug: string;
  description: string;
  pricePerNight: number;
  capacity: number;
  imageUrl: string | null;
  availableRooms: number;
  nights: number;
  totalPrice: number;
};

export type BookingStatus =
  | "Pending"
  | "Confirmed"
  | "CheckedIn"
  | "CheckedOut"
  | "Expired"
  | "Cancelled"
  | "NoShow";

export type PaymentStatus = "Pending" | "Paid" | "Failed" | "Refunded";

export type PaymentMethod = "Transfer" | "QRIS" | "Kartu";

export type BookingDto = {
  id: number;
  bookingCode: string;
  roomId: number;
  roomNumber: string;
  roomTypeName: string;
  roomTypeSlug: string;
  checkIn: string; // yyyy-MM-dd
  checkOut: string; // yyyy-MM-dd
  guestCount: number;
  totalPrice: number;
  status: BookingStatus;
  expiresAt: string | null; // UTC, berakhiran Z
  createdAt: string;
  nights: number;
};

export type PaymentDto = {
  id: number;
  bookingId: number;
  amount: number;
  method: string;
  status: PaymentStatus;
  paidAt: string | null;
};

export type PaymentResultDto = {
  payment: PaymentDto;
  booking: BookingDto;
};

export type RoomStatus = "Available" | "Occupied" | "Cleaning" | "Maintenance";

export type StaffBookingDto = {
  id: number;
  bookingCode: string;
  guestName: string;
  guestEmail: string;
  roomId: number;
  roomNumber: string;
  roomTypeName: string;
  checkIn: string;
  checkOut: string;
  guestCount: number;
  totalPrice: number;
  status: BookingStatus;
  isPaid: boolean;
  expiresAt: string | null;
  createdAt: string;
  nights: number;
};

export type AdminRoomDto = {
  id: number;
  roomNumber: string;
  roomTypeId: number;
  roomTypeName: string;
  status: RoomStatus;
};

export type UserProfileDto = {
  id: number;
  fullName: string;
  email: string;
  roles: string[];
};

export type OccupancyDayDto = {
  date: string; // yyyy-MM-dd
  roomsSold: number;
  totalRooms: number;
  occupancyRate: number; // persen, 0 sampai 100
  revenue: number;
};

export type OccupancyReportDto = {
  from: string;
  to: string;
  totalRooms: number;
  roomNightsSold: number;
  roomNightsAvailable: number;
  occupancyRate: number;
  revenue: number;
  days: OccupancyDayDto[];
};