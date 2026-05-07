import express from "express";
import { addMember, getUserWorkspaces, getWorkspaceActivities } from "../controllers/workspaceController.js";

const workspaceRouter = express.Router()

workspaceRouter.get('/', getUserWorkspaces);
workspaceRouter.post('/add-member', addMember);
workspaceRouter.get('/activities/:workspaceId', getWorkspaceActivities);

export default workspaceRouter;