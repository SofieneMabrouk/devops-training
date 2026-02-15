import request from "supertest";
import app from "../app";

// Mock Prisma
jest.mock("../db", () => ({
  __esModule: true,
  default: {
    message: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
  },
}));

// Mock RabbitMQ producer
jest.mock("../queue/producer", () => ({
  publishUserPrompts: jest.fn().mockResolvedValue(undefined),
}));

import db from "../db";
import { publishUserPrompts } from "../queue/producer";

const mockedDb = db as jest.Mocked<typeof db>;
const mockedPublish = publishUserPrompts as jest.MockedFunction<
  typeof publishUserPrompts
>;

describe("API Routes", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /", () => {
    it("should return hello message", async () => {
      const res = await request(app).get("/");

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ message: "Hello from Express!" });
    });
  });

  describe("GET /health", () => {
    it("should return OK status", async () => {
      const res = await request(app).get("/health");

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ message: "OK" });
    });
  });

  describe("GET /api/v1/messages", () => {
    it("should return all messages", async () => {
      const mockMessages = [
        { id: 1, content: "Hello", createdAt: new Date().toISOString() },
        { id: 2, content: "World", createdAt: new Date().toISOString() },
      ];

      (mockedDb.message.findMany as jest.Mock).mockResolvedValue(mockMessages);

      const res = await request(app).get("/api/v1/messages");

      expect(res.status).toBe(200);
      expect(res.body.data).toEqual(mockMessages);
      expect(res.body.message).toBe("Messages fetched successfully");
      expect(mockedDb.message.findMany).toHaveBeenCalledTimes(1);
    });

    it("should return 404 when no messages found", async () => {
      (mockedDb.message.findMany as jest.Mock).mockResolvedValue(null);

      const res = await request(app).get("/api/v1/messages");

      expect(res.status).toBe(404);
      expect(res.body.message).toBe("No messages found");
    });
  });

  describe("POST /api/v1/messages", () => {
    it("should create a new message and publish to queue", async () => {
      const newMessage = {
        id: 1,
        content: "Test message",
        createdAt: new Date().toISOString(),
      };

      (mockedDb.message.create as jest.Mock).mockResolvedValue(newMessage);

      const res = await request(app)
        .post("/api/v1/messages")
        .send({ content: "Test message" });

      expect(res.status).toBe(200);
      expect(res.body.data).toEqual(newMessage);
      expect(res.body.message).toBe(
        "Message created successfully & published to Core Queue"
      );
      expect(mockedDb.message.create).toHaveBeenCalledWith({
        data: { content: "Test message" },
      });
      expect(mockedPublish).toHaveBeenCalledWith("Test message");
    });

    it("should return 400 when message creation fails", async () => {
      (mockedDb.message.create as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .post("/api/v1/messages")
        .send({ content: "Fail message" });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Failed to create message");
    });
  });
});
