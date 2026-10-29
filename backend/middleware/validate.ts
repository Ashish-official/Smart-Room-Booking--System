import { type Request, type Response, type NextFunction } from "express";
import { type ZodObject, ZodError } from "zod"; 

export const validate = (schema: ZodObject) => {

  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          status: "fail",
          message: "Validation schema rules broken",
          errors:
            error.errors?.map((err) => ({
              path: err.path.join("."), 
              message: err.message,
            })) || [],
        });
        return;
      }

      res.status(500).json({
        status: "error",
        message:
          "An internal parsing exception occurred during verification checks.",
      });
      return;
    }
  };
};
