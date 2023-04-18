import { NextFunction, Response } from "express";
import { verify } from "jsonwebtoken";
import { AuthPayloadProps } from "@/middlewares/onlyAuth/onlyAuth.interface";

export function onlyAuth(
  request: AuthPayloadProps,
  response: Response,
  next: NextFunction
) {
  if (!request.headers.authorization) {
    return response
      .status(401)
      .json({ error: "Access authorized only for authenticated users!" });
  }

  const authToken = request.headers.authorization.replace("Bearer ", "");

  try {
    const { sub, user } = verify(
      authToken,
      process.env.HASH
    ) as AuthPayloadProps;
    request.id = sub;
    request.user = user;
  } catch (error) {
    return response
      .status(401)
      .json({ error: "Access authorized only for authenticated users!" });
  }

  return next();
}
