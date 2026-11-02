import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { createApp } from "../app";
import { User } from "../models/User";
import { Category } from "../models/Category";
import { Product } from "../models/Product";
import { hashPassword } from "../utils/hash";

describe("Review ownership", () => {
  let mongo: MongoMemoryServer;
  const app = createApp();
  let productId = "";
  let reviewA = "";
  let tokenA = "";
  let tokenB = "";

  beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    await mongoose.connect(mongo.getUri());
    const pass = await hashPassword("Customer@123");
    await User.create([
      { name: "A", email: "a@test.local", password: pass, role: "CUSTOMER" },
      { name: "B", email: "b@test.local", password: pass, role: "CUSTOMER" },
    ]);
    const cat = await Category.create({ name: "Cat", slug: "cat", isActive: true });
    const product = await Product.create({
      name: "Milk",
      description: "Fresh",
      price: 10000,
      image: "",
      category: cat._id,
      sku: "MILK-1",
      stock: 10,
      isActive: true,
    });
    productId = product.id;
    tokenA = (await request(app).post("/api/auth/login").send({ email: "a@test.local", password: "Customer@123" }))
      .body.data.accessToken;
    tokenB = (await request(app).post("/api/auth/login").send({ email: "b@test.local", password: "Customer@123" }))
      .body.data.accessToken;
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongo.stop();
  });

  it("lets customer A create a review", async () => {
    const res = await request(app)
      .post("/api/reviews")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ productId, rating: 5, comment: "Great" });
    expect(res.status).toBe(201);
    reviewA = res.body.data._id;
  });

  it("blocks a second review from the same customer on the same product", async () => {
    const res = await request(app)
      .post("/api/reviews")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ productId, rating: 4, comment: "Again" });
    expect(res.status).toBe(409);
  });

  it("blocks customer B from editing customer A's review", async () => {
    const res = await request(app)
      .patch(`/api/reviews/${reviewA}`)
      .set("Authorization", `Bearer ${tokenB}`)
      .send({ comment: "Hacked" });
    expect(res.status).toBe(403);
  });

  it("blocks customer B from reading customer A's review by id", async () => {
    const res = await request(app).get(`/api/reviews/${reviewA}`).set("Authorization", `Bearer ${tokenB}`);
    expect(res.status).toBe(403);
  });
});
