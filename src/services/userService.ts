import { compare, compareSync, hash } from "bcryptjs";
import { sign, verify } from "jsonwebtoken";
import prismaClient from "../prisma";

interface IUser {
  id?: string;
  name?: string;
  email?: string;
  password?: string;
  admin?: boolean;
}

class UserService {
  async authenticate({ email, password }: IUser) {
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

    const token = sign(
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

    return { token, user };
  }

  async update({ id, name, password }: IUser) {
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
