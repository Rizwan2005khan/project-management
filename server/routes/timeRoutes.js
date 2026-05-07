import express from "express";
import { startTimeEntry, stopTimeEntry, getTaskTimeLogs } from "../controllers/timeController.js";

const timeRouter = express.Router();

timeRouter.post("/start", startTimeEntry);
timeRouter.post("/stop", stopTimeEntry);
timeRouter.get("/task/:taskId", getTaskTimeLogs);

export default timeRouter;
