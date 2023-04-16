import { Request } from "express";
import { UserProps } from "@/services/userServices/userService.interface";

export interface PayloadProps extends Request {
  sub: string;
  user: UserProps;
}
