import { Request } from "express";
import { UpdateUserRequestProps } from "@/services/userServices/userService.interface";

export interface AuthPayloadProps extends Request {
  sub: string;
  user: UpdateUserRequestProps;
}

export interface RefreshTokenProps extends Request {
  refreshToken: string;
}
