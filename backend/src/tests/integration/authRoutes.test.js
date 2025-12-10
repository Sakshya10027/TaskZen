import request from "supertest";
import express from "express";
import authRoutes from "../../routes/authRoutes.js";

const app = express();
app.use(express.json());
app.use("/auth", authRoutes);

describe("Auth routes", () => {
  it("rejects invalid register", async () => {
    const res = await request(app).post("/auth/register").send({
      name: "",
      email: "not-email",
      password: "123"
    });
    expect(res.statusCode).toBe(422);
  });
});
