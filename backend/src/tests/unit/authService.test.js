import { jest } from "@jest/globals";

jest.unstable_mockModule("../../models/User.js", () => ({
  User: {
    findOne: jest.fn(),
    create: jest.fn()
  }
}));

const { registerUser } = await import("../../services/authService.js");
const { User } = await import("../../models/User.js");

describe("authService - registerUser", () => {
  it("throws if email exists", async () => {
    User.findOne.mockResolvedValue({ _id: "1" });
    await expect(
      registerUser({ name: "A", email: "a@test.com", password: "123456" })
    ).rejects.toThrow("Email already in use");
  });
});
