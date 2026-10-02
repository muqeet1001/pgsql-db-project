import { Router } from "express";
import { query } from "../config/db.js";

const router = Router();

router.get("/", async (_req, res, next) => {
  try {
    const result = await query("SELECT NOW() AS now");
    res.json({
      status: "ok",
      database: "connected",
      now: result[0]?.now,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
