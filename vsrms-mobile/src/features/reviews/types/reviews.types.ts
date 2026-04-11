export interface Review {
  _id: string;
  workshopId: string;
  userId: string | { _id: string; fullName?: string; email: string };
  rating: number;
  comment: string;
  createdAt?: string;
  updatedAt?: string;
}
