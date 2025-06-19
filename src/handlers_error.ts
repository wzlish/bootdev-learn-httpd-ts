import Express from "express";

abstract class CustomError extends Error {
  httpCode: number;
  constructor(message: string, httpCode: number) {
    super(message);
    this.httpCode = httpCode;
  }
}

export class BadRequestError extends CustomError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class UnauthorizedError extends CustomError {
  constructor(message: string) {
    super(message, 401);
  }
}

export class ForbiddenError extends CustomError {
  constructor(message: string) {
    super(message, 403);
  }
}

export class NotFoundError extends CustomError {
  constructor(message: string) {
    super(message, 404);
  }
}

export function handlerErrors(
  err: Error,
  _: Express.Request,
  res: Express.Response,
  __: Express.NextFunction,
) {
  if (err instanceof CustomError) {
    res.status(err.httpCode).json({ error: err.message });
    return;
  }
  res.status(500).json({
    error: "Something went wrong on our end",
  });
}
