import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { createApp } from "../app";
import { User } from "../models/User";
import { hashPassword } from "../utils/hash";

describe("Auth & RBAC", () => {
  let mongo: MongoMemoryServer;
  const app = createApp();

  beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    await mongoose.connect(mongo.getUri());
    await User.create({
      name: "Admin",
      email: "admin@test.local",
      password: await hashPassword("Admin@123"),
      role: "ADMIN",
    });
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongo.stop();
  });

  it("registers a customer and does not return password", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Alice",
      email: "alice@test.local",
      password: "Customer@123",
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.role).toBe("CUSTOMER");
    expect(res.body.data.user.password).toBeUndefined();
    expect(res.body.data.accessToken).toBeDefined();
  });

  it("rejects customer access to admin dashboard", async () => {
    const login = await request(app).post("/api/auth/login").send({
      email: "alice@test.local",
      password: "Customer@123",
    });
    const token = login.body.data.accessToken;
    const res = await request(app).get("/api/dashboard").set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  it("allows admin dashboard", async () => {
    const login = await request(app).post("/api/auth/login").send({
      email: "admin@test.local",
      password: "Admin@123",
    });
    const token = login.body.data.accessToken;
    const res = await request(app).get("/api/dashboard").set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.totalReviews).toBeDefined();
  });
});
