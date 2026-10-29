import { Router } from "express";
import { validate } from "../middleware/validate.js";
import { createBookingSchema } from "../validation/booking.validation.js";
import {
  getPaginatedBookings,
  createNewBooking,
} from "../controllers/booking.js";

const router = Router();

router.get("/bookings", getPaginatedBookings);

router.post("/bookings", validate(createBookingSchema), createNewBooking);

export default router;
