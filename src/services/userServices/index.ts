import { compareSync, hash } from "bcryptjs";
import { sign } from "jsonwebtoken";
import prismaClient from "@/prisma";
import { UserProps } from "@/services/userServices/userService.interface";

class UserService {
  async authenticate({ email, password }: UserProps) {
    const userResponse = await prismaClient.user.findFirst({
      where: {
        email,
      },
    });

    if (!userResponse) {
      return { error: "Wrong login or password!" };
    }

    const passwordMatch = compareSync(password, userResponse.hashedPassword);

    if (!passwordMatch) {
      return { error: "Wrong login or password!" };
    }

    if (!userResponse.active) {
      return { error: "This user was blocked by the system administrator!" };
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
          login: user.email,
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
          login: user.email,
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

  async refreshToken(user: UserProps) {
    const accessToken = sign(
      {
        user,
      },
      process.env.HASH,
      {
        subject: user.id,
        expiresIn: "1h",
      }
    );

    const refreshToken = sign(
      {
        user,
      },
      process.env.HASH,
      {
        subject: user.id,
        expiresIn: "7d",
      }
    );

    return { accessToken, refreshToken, user };
  }

  async update({ id, name, password }: UserProps) {
    const user = await prismaClient.user.findFirst({
      where: {
        id,
      },
    });

    if (password === "") {
      password = user.hashedPassword;
    } else {
      password = await hash(password, 8);
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
