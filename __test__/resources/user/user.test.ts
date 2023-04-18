import { User } from "@prisma/client";
import prismaClient from "../../../src/prisma";
import request from "supertest";
import { app } from "../../../src/server";
import { verify } from "jsonwebtoken";
import { AuthPayloadProps } from "../../../src/middlewares/onlyAuth/onlyAuth.interface";

const user = {
  id: "61794aa019f2084592d12809",
  createdAt: "2021-10-27T12:48:32.112Z",
  updatedAt: "2023-04-16T20:27:47.612Z",
  name: "John Doe",
  email: "test@test.com",
  hashedPassword:
    "$2a$08$.LV9EDmqTypIyitGZmtKlu0BadLdFzantxfKd3jB.WTW6iBy7fJsu",
  admin: true,
  active: true,
  role: "USER",
} as unknown as User;

describe("User Resource", () => {
  test("should authenticate user", async () => {
    jest.spyOn(prismaClient.user, "findFirst").mockResolvedValueOnce(user);
    const response = await request(app).post("/user/authenticate").send({
      email: "test@test.com",
      password: "123",
    });

    const jwtDecode = verify(
      response.body.accessToken,
      process.env.HASH
    ) as AuthPayloadProps;

    expect(jwtDecode.sub).toEqual(user.id);
    expect(jwtDecode.user).toStrictEqual({
      name: user.name,
      email: user.email,
      admin: user.admin,
    });
  });

  test("should not authenticate user with wrong credentials or admin block", async () => {
    jest.spyOn(prismaClient.user, "findFirst").mockResolvedValueOnce(user);
    const responseWrongPassword = await request(app)
      .post("/user/authenticate")
      .send({
        email: "test@test.com",
        password: "1234",
      });

    expect(JSON.parse(responseWrongPassword.text)).toStrictEqual({
      error: "Wrong login or password!",
    });
    expect(responseWrongPassword.status).toEqual(401);

    const responseWrongEmail = await request(app)
      .post("/user/authenticate")
      .send({
        email: "test1@test.com",
        password: "123",
      });

    expect(JSON.parse(responseWrongEmail.text)).toStrictEqual({
      error: "Wrong login or password!",
    });
    expect(responseWrongEmail.status).toEqual(401);

    jest
      .spyOn(prismaClient.user, "findFirst")
      .mockResolvedValueOnce({ ...user, active: false });

    const responseAdminBlock = await request(app)
      .post("/user/authenticate")
      .send({
        email: "test@test.com",
        password: "123",
      });

    expect(JSON.parse(responseAdminBlock.text)).toStrictEqual({
      error: "This user was blocked by the system administrator!",
    });
    expect(responseAdminBlock.status).toEqual(401);
  });

  test("should renew access token if it is valid", async () => {
    jest.spyOn(prismaClient.user, "findFirst").mockResolvedValueOnce(user);
    const authResponse = await request(app).post("/user/authenticate").send({
      email: "test@test.com",
      password: "123",
    });

    const successResponse = await request(app).post("/user/token").send({
      refreshToken: authResponse.body.refreshToken,
    });

    const jwtDecode = verify(
      successResponse.body.accessToken,
      process.env.HASH
    ) as AuthPayloadProps;

    expect(jwtDecode.sub).toEqual(user.id);
    expect(jwtDecode.user).toStrictEqual({
      name: user.name,
      email: user.email,
      admin: user.admin,
    });

    const errorResponse = await request(app).post("/user/token").send({
      refreshToken: "wrongToken",
    });

    expect(errorResponse.status).toEqual(401);
    expect(JSON.parse(errorResponse.text)).toEqual({
      error: "jwt malformed",
    });
  });

  test("should update user only with password", async () => {
    jest.spyOn(prismaClient.user, "findFirst").mockResolvedValueOnce(user);
    jest.spyOn(prismaClient.user, "update").mockResolvedValueOnce(user);

    const responseWithPassword = await request(app).post("/user/update").send({
      id: "61794aa019f2084592d12809",
      name: "123",
      password: "123",
      password2: "123",
    });

    expect(responseWithPassword.body).toEqual(user);

    const responseWithoutPassword = await request(app)
      .post("/user/update")
      .send({
        id: "61794aa019f2084592d12809",
        user_id: "61794aa019f2084592d12809",
        name: "123",
        password: "",
        password2: "",
      });

    expect(JSON.parse(responseWithoutPassword.text)).toStrictEqual({
      error: "Wrong password!",
    });
    expect(responseWithoutPassword.status).toEqual(401);

    const responseUnmatchPassword = await request(app)
      .post("/user/update")
      .send({
        id: "61794aa019f2084592d12809",
        user_id: "61794aa019f2084592d12809",
        name: "123",
        password: "123",
        password2: "1234",
      });

    expect(JSON.parse(responseUnmatchPassword.text)).toStrictEqual({
      error: "The passwords dont match!",
    });
    expect(responseUnmatchPassword.status).toEqual(401);
  });
});
