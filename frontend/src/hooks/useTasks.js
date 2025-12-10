import { useContext } from "react";
import { TaskContext } from "../context/TaskContext";

export const useTasks = () => useContext(TaskContext);
