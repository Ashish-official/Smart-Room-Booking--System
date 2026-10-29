import { z } from "zod";

export const createBookingSchema = z.object({
  body: z
    .object({
      roomName: z.enum(["Red", "Blue", "Yellow"], {
        invalid_type_error: "Room must be either 'Red', 'Blue', or 'Yellow'",
        required_error: "Room name is required",
      }),
      bookedBy: z.string().min(1, "Booked by name is required").trim(),
      startTime: z
        .string()
        .datetime({
          message: "Invalid start time format. Use a valid ISO string.",
        })
        .transform((val) => new Date(val)),
      endTime: z
        .string()
        .datetime({
          message: "Invalid end time format. Use a valid ISO string.",
        })
        .transform((val) => new Date(val)),
    })
    .refine((data) => data.endTime.getTime() > data.startTime.getTime(), {
      message: "End time must be strictly after the start time.",
      path: ["endTime"],
    }),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>["body"];
