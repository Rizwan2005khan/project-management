import express from "express";
import { addDependency, createTask, deleteTask, removeDependency, updateTask } from "../controllers/taskController.js";

const taskRouter = express.Router();

taskRouter.post('/', createTask)
taskRouter.put('/:id', updateTask)
taskRouter.post('/delete', deleteTask)
taskRouter.post('/add-dependency', addDependency)
taskRouter.post('/remove-dependency', removeDependency)

export default taskRouter;