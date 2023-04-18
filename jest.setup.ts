/* eslint-disable */
import { PrismaClient } from "@prisma/client";
import { closeServer } from "./src/server";

let prisma;
beforeAll(() => {
  prisma = new PrismaClient();
});

const prismaFunctions = {
  count: jest.fn(),
  create: jest.fn(),
  createMany: jest.fn(),
  delete: jest.fn(),
  deleteMany: jest.fn(),
  findFirst: jest.fn(),
  findMany: jest.fn(),
  findUnique: jest.fn(),
  update: jest.fn(),
  updateMany: jest.fn(),
  upsert: jest.fn(),
  aggregate: jest.fn(),
  groupBy: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();

  jest.mock("./src/prisma", () => ({
    prismaClient: jest.fn().mockImplementation(() => ({
      user: prismaFunctions,
    })),
  }));
});

afterEach(async () => {
  await closeServer();
});

afterAll(async () => {
  await prisma.$disconnect();
});
