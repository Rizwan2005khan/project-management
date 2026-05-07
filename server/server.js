import express from "express";
import 'dotenv/config';
import cors from 'cors'
import { clerkMiddleware } from "@clerk/express"
import { serve } from "inngest/express";
import { inngest, functions } from "./inngest/index.js"
import workspaceRouter from "./routes/workspaceRoutes.js";
import { protect } from "./middleware/authMiddleware.js";
import projectRouter from "./routes/projectRoutes.js";
import taskRouter from "./routes/taskRoutes.js";
import commentRouter from "./routes/commentRoutes.js";
import customFieldRouter from "./routes/customFieldRoutes.js";
import timeRouter from "./routes/timeRoutes.js";
import automationRouter from "./routes/automationRoutes.js";

const app = express()

app.use(express.json())
app.use(cors())

app.use(clerkMiddleware())

app.get('/', (req, res) => res.send('Server is live!'))

app.use("/api/inngest", serve({ client: inngest, functions }));

//Routes
app.use("/api/workspaces",protect, workspaceRouter)
app.use("/api/projects", protect, projectRouter)
app.use("/api/tasks", protect, taskRouter)
app.use("/api/comments", protect, commentRouter)
app.use("/api/custom-fields", protect, customFieldRouter)
app.use("/api/time", protect, timeRouter)
app.use("/api/automations", protect, automationRouter)

const PORT = process.env.PORT || 5000

app.listen(PORT, () => console.log(`Server running on port ${PORT}`))