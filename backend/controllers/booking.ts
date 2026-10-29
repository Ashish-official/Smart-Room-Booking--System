import { type Request, type Response } from "express";
import { Booking } from "../models/booking.models.js";
import { type CreateBookingInput } from "../validation/booking.validation.js";

interface FetchBookingsQuery {
  room?: "Red" | "Blue" | "Yellow";
  page?: string;
  limit?: string;
}
export const getPaginatedBookings = async (
  req: Request<{}, {}, {}, FetchBookingsQuery>,
  res: Response,
): Promise<void> => {
  try {
    const roomName = req.query.room || "Red";
    const page = parseInt(req.query.page || "1", 10);
    const limit = parseInt(req.query.limit || "5", 10);

    if (page < 1 || limit < 1) {
      res.status(400).json({
        status: "fail",
        message: "Page and limit parameters must be positive integers.",
      });
      return;
    }

    const [aggregationResult] = await Booking.aggregate([
      { $match: { roomName: roomName } },
      { $sort: { startTime: 1 } },
      {
        $facet: {
          metadata: [{ $count: "total" }],
          dataRecords: [{ $skip: (page - 1) * limit }, { $limit: limit }],
        },
      },
    ]);

    const totalCount = aggregationResult?.metadata?.[0]?.total || 0;
    const rawRecords = aggregationResult?.dataRecords || [];

    const normalizedData = rawRecords.map((doc: any) => {
      const startIso =
        doc.startTime instanceof Date
          ? doc.startTime.toISOString()
          : new Date(doc.startTime).toISOString();
      const endIso =
        doc.endTime instanceof Date
          ? doc.endTime.toISOString()
          : new Date(doc.endTime).toISOString();

      const datePart = startIso.split("T")[0];
      const startTimePart = startIso.split("T")[1].substring(0, 5);
      const endTimePart = endIso.split("T")[1].substring(0, 5);

      return {
        id: doc._id.toString(),
        room: doc.roomName,
        date: doc.date || datePart,
        startTime: startTimePart,
        endTime: endTimePart,
        email: doc.bookedBy || doc.email || "organizer@company.com",
      };
    });

    res.status(200).json({
      status: "success",
      data: normalizedData,
      total: totalCount,
      page: page,
      limit: limit,
    });
  } catch (error) {
    console.error("💥 Booking pagination query error:", error);
    res.status(500).json({
      status: "error",
      message:
        "An internal server error occurred while retrieving paginated bookings.",
    });
  }
};

export const createNewBooking = async (
  req: Request<{}, {}, CreateBookingInput>,
  res: Response,
): Promise<void> => {
  try {
    const { roomName, startTime, endTime } = req.body;
    const conflictingBooking = await Booking.findOne({
      roomName: roomName,
      startTime: { $lt: endTime },
      endTime: { $gt: startTime },
    });

    if (conflictingBooking) {
      res.status(409).json({
        status: "fail",
        message: `Room is unavailable from ${startTime} to ${endTime}.`,
        conflict: {
          bookedBy: conflictingBooking.bookedBy,
          startTime: conflictingBooking.startTime,
          endTime: conflictingBooking.endTime,
        },
      });
      return;
    }

    const newBooking = await Booking.create(req.body);

    res.status(201).json({
      status: "success",
      data: newBooking,
    });
  } catch (error) {
    console.error("Booking creation error:", error);
    res.status(500).json({
      status: "error",
      message:
        "An internal server error occurred while processing your booking.",
    });
  }
};
