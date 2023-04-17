import { compareSync, hash } from "bcryptjs";
import { sign, verify } from "jsonwebtoken";
import {
  AuthRequestProps, UpdateUserRequestProps
} from "./userService.interface";
import prismaClient from "../../prisma";
import { AuthPayloadProps } from "../../middlewares/onlyAuth/onlyAuth.interface";

class UserService {
  async authenticate({
    email,
    password
  }: AuthRequestProps) {
    const userResponse = await prismaClient.user.findFirst({
      where: {
        email,
      },
    });

    if (!userResponse) {
      throw new Error("Wrong login or password!");
    }

    const passwordMatch = compareSync(password, userResponse.hashedPassword);

    if (!passwordMatch) {
      throw new Error("Wrong login or password!");
    }

    if (!userResponse.active) {
      throw new Error("This user was blocked by the system administrator!");
    }

    const user = {
      id: userResponse.id,
      name: userResponse.name,
      email: userResponse.email,
      admin: userResponse.admin,
      active: userResponse.active,
    };

    const accessToken = sign(
      {
        user: {
          name: user.name,
          email: user.email,
          admin: user.admin,
        },
      },
      process.env.HASH,
      {
        subject: user.id,
        expiresIn: "1h",
      }
    );

    const refreshToken = sign(
      {
        user: {
          name: user.name,
          email: user.email,
          admin: user.admin,
        },
      },
      process.env.HASH,
      {
        subject: user.id,
        expiresIn: "7d",
      }
    );

    return { accessToken, refreshToken, user };
  }

  async refreshToken(refreshToken: string) {
    const { sub, user } = verify(
      refreshToken,
      process.env.HASH
    ) as AuthPayloadProps;

    const accessToken = sign(
      {
        user: {
          name: user.name,
          email: user.email,
          admin: user.admin,
        },
      },
      process.env.HASH,
      {
        subject: sub,
        expiresIn: "1h",
      }
    );

    return { accessToken };
  }

  async update({ id, name, password }: UpdateUserRequestProps) {
    const user = await prismaClient.user.findFirst({
      where: {
        id,
      },
    });

    if (password === "") {
      throw new Error("Wrong password!")
    }

    const userUpdate = await prismaClient.user.update({
      where: {
        id,
      },
      data: {
        name,
        hashedPassword: password,
      },
    });
    return userUpdate;
  }
}

export { UserService };
