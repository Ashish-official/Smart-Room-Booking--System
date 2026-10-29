import mongoose from "mongoose";

export const connectDB = async (): Promise<void> => {
  try {
    const connString = process.env.MONGODB_URI;

    if (!connString) {
      throw new Error(
        "MONGODB_URI is not defined in the environment variables.",
      );
    }

    const conn = await mongoose.connect(connString);
    console.log(
      `[database]: MongoDB Connected successfully to: ${conn.connection.host}`,
    );
  } catch (error) {
    console.error(`[database]: Connection error: ${(error as Error).message}`);
    process.exit(1); 
  }
};
