import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: [
        "task_created",
        "task_assigned",
        "task_updated",
        "task_completed",
        "task_deleted",
        "comment_added",
        "task_overdue"
      ],
      required: true
    },
    task: { type: mongoose.Schema.Types.ObjectId, ref: "Task" },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
    metadata: { type: Object }
  },
  { timestamps: true }
);

export const Notification = mongoose.model("Notification", notificationSchema);
