import { query } from "../config/db.js";

export async function createTodo(req, res, next) {
  try {
    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({ message: "title is required" });
    }

    const todos = await query(
      `INSERT INTO todos (user_id, title, description)
       VALUES ($1, $2, $3)
       RETURNING todo_id AS id, user_id, title, description, is_completed, created_at, updated_at`,
      [req.user.id, title, description || null]
    );

    res.status(201).json({
      message: "Todo created",
      todo: todos[0],
    });
  } catch (error) {
    next(error);
  }
}

export async function getTodos(req, res, next) {
  try {
    const todos = await query(
      `SELECT todo_id AS id, user_id, title, description, is_completed, created_at, updated_at
       FROM todos
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [req.user.id]
    );

    res.json({ todos });
  } catch (error) {
    next(error);
  }
}

export async function getTodo(req, res, next) {
  try {
    const todos = await query(
      `SELECT todo_id AS id, user_id, title, description, is_completed, created_at, updated_at
       FROM todos
       WHERE todo_id = $1 AND user_id = $2`,
      [req.params.id, req.user.id]
    );

    if (!todos[0]) {
      return res.status(404).json({ message: "Todo not found" });
    }

    res.json({ todo: todos[0] });
  } catch (error) {
    next(error);
  }
}

export async function updateTodo(req, res, next) {
  try {
    const { title, description, is_completed } = req.body;

    const todos = await query(
      `UPDATE todos
       SET
         title = COALESCE($1, title),
         description = COALESCE($2, description),
         is_completed = COALESCE($3, is_completed),
         updated_at = CURRENT_TIMESTAMP
       WHERE todo_id = $4 AND user_id = $5
       RETURNING todo_id AS id, user_id, title, description, is_completed, created_at, updated_at`,
      [title ?? null, description ?? null, is_completed ?? null, req.params.id, req.user.id]
    );

    if (!todos[0]) {
      return res.status(404).json({ message: "Todo not found" });
    }

    res.json({
      message: "Todo updated",
      todo: todos[0],
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteTodo(req, res, next) {
  try {
    const todos = await query(
      `DELETE FROM todos
       WHERE todo_id = $1 AND user_id = $2
       RETURNING todo_id AS id`,
      [req.params.id, req.user.id]
    );

    if (!todos[0]) {
      return res.status(404).json({ message: "Todo not found" });
    }

    res.json({ message: "Todo deleted" });
  } catch (error) {
    next(error);
  }
}
