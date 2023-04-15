import { NextFunction, Request, Response } from "express";
import { verify } from "jsonwebtoken";
import prismaClient from "../prisma";

interface IPayload {
  sub: string;
}

interface IAdmin {
  admin?: boolean
  error?: string
}

export function onlyAuth(request: Request, response: Response, next: NextFunction) {
  if (!request.headers.authorization) {
    return response.status(401).json({ error: 'Access authorized only for authenticated users!' })
  }

  const authToken = request.headers.authorization.replace('Bearer ', '')

  try {
    const { sub } = verify(authToken, process.env.HASH) as IPayload
    request.id = sub
  } catch (error) {
    return response.status(401).json({ error: 'Access authorized only for authenticated users!' })
  }

  return next()
}

export async function onlyAdmin(request: Request, response: Response, next: NextFunction) {
  const authToken = request.headers.authorization.replace('Bearer ', '')

  const { sub } = verify(authToken, process.env.HASH) as IPayload

  const user = await prismaClient.user.findFirst({
    where: {
      id: sub
    }
  })

  if (!user.admin) {
    return response.status(401).json({ error: 'Access authorized only for admins!' })
  }

  return next()
}
