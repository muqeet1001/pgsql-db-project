import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  createTodo,
  deleteTodo,
  getTodo,
  getTodos,
  updateTodo,
} from "../controllers/todo.controller.js";

const router = Router();

router.use(requireAuth);

router.post("/", createTodo);
router.get("/", getTodos);
router.get("/:id", getTodo);
router.patch("/:id", updateTodo);
router.delete("/:id", deleteTodo);

export default router;
