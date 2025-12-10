import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

export const initSockets = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("No token"));
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      const user = await User.findById(decoded.sub);
      if (!user) return next(new Error("User not found"));
      socket.user = { id: user._id.toString(), role: user.role };
      next();
    } catch (err) {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.user.id;
    socket.join(userId);
    console.log("User connected:", userId);

    socket.on("disconnect", () => {
      console.log("User disconnected:", userId);
    });
  });
};
