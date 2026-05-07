import express from "express";
import { createAutomation, deleteAutomation } from "../controllers/automationController.js";

const automationRouter = express.Router();

automationRouter.post("/", createAutomation);
automationRouter.delete("/:id", deleteAutomation);

export default automationRouter;
