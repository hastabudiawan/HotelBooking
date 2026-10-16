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