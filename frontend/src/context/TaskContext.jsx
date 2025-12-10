import { createContext, useContext, useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import { SocketContext } from "./SocketContext";
import { AuthContext } from "./AuthContext";

export const TaskContext = createContext(null);

export const TaskProvider = ({ children }) => {
  const socket = useContext(SocketContext);
  const { user } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchTasks = async (params = {}) => {
    setLoading(true);
    const { data } = await axiosClient.get("/tasks", { params });
    setTasks(data);
    setLoading(false);
  };

  useEffect(() => {
    if (!user) {
      setTasks([]);
      setLoading(false);
      return;
    }
    fetchTasks();
  }, [user]);

  useEffect(() => {
    if (!socket) return;
    const onCreated = (task) =>
      setTasks((prev) => {
        const exists = prev.some((t) => t._id === task._id);
        return exists
          ? prev.map((t) => (t._id === task._id ? task : t))
          : [task, ...prev];
      });
    const onUpdated = (task) =>
      setTasks((prev) => prev.map((t) => (t._id === task._id ? task : t)));
    const onDeleted = ({ id }) =>
      setTasks((prev) => prev.filter((t) => t._id !== id));
    const onComment = (task) =>
      setTasks((prev) => prev.map((t) => (t._id === task._id ? task : t)));

    socket.on("task:created", onCreated);
    socket.on("task:updated", onUpdated);
    socket.on("task:deleted", onDeleted);
    socket.on("task:comment_added", onComment);

    return () => {
      socket.off("task:created", onCreated);
      socket.off("task:updated", onUpdated);
      socket.off("task:deleted", onDeleted);
      socket.off("task:comment_added", onComment);
    };
  }, [socket]);

  return (
    <TaskContext.Provider value={{ tasks, fetchTasks, loading, setTasks }}>
      {children}
    </TaskContext.Provider>
  );
};
