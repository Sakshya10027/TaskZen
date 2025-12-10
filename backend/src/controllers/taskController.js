import {
  listTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  addCommentToTask,
} from "../services/taskService.js";

export const getTasks = async (req, res, next) => {
  try {
    const tasks = await listTasks(req.query, req.user);
    res.json(tasks);
  } catch (err) {
    next(err);
  }
};

export const getTask = async (req, res, next) => {
  try {
    const task = await getTaskById(req.params.id, req.user);
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json(task);
  } catch (err) {
    next(err);
  }
};

export const createTaskHandler = async (req, res, next) => {
  try {
    const task = await createTask(req.body, req.user);
    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
};

export const updateTaskHandler = async (req, res, next) => {
  try {
    const task = await updateTask(req.params.id, req.body, req.user);
    res.json(task);
  } catch (err) {
    next(err);
  }
};

export const deleteTaskHandler = async (req, res, next) => {
  try {
    await deleteTask(req.params.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};

export const addCommentHandler = async (req, res, next) => {
  try {
    const task = await addCommentToTask(req.params.id, req.body, req.user);
    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
};
