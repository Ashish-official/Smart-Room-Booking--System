import { Schema, model, Document } from "mongoose";

export type RoomColor = "Red" | "Blue" | "Yellow";

export interface IBooking {
  roomName: RoomColor;
  bookedBy: string;
  startTime: Date;
  endTime: Date;
  purpose?: string;
}

export interface IBookingDocument extends IBooking, Document {}

const ALLOWED_ROOMS: RoomColor[] = ["Red", "Blue", "Yellow"];

const BookingSchema = new Schema<IBookingDocument>(
  {
    roomName: {
      type: String,
      required: [true, "Room name is required"],
      enum: ALLOWED_ROOMS,
    },
    bookedBy: {
      type: String,
      required: [true, "User identity is required"],
      trim: true,
    },
    startTime: {
      type: Date,
      required: [true, "Start time is required"],
    },
    endTime: {
      type: Date,
      required: [true, "End time is required"],
    },
  },
  { timestamps: true },
);

export const Booking = model<IBookingDocument>("Booking", BookingSchema);
