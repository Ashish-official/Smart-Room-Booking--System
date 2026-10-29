import express, {
  type Application,
  type Request,
  type Response,
  type NextFunction,
} from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import bookingRouter from "../routes/booking.routes.js";
import { errorHandler } from "../middleware/ErrorMiddlewar.js";
import { AppError } from "../utils/appError.js";
import cors from "cors";

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/room-bookings";

app.use(express.json());
app.use(cors());

app.use("/api", bookingRouter);

app.all("*", (req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(errorHandler);

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("📦 [database]: Connected to MongoDB.");
    app.listen(PORT, () => {
      console.log(`⚡ [server]: Live at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ [database]: Connection failed:", err);
    process.exit(1);
  });
