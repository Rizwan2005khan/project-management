import prisma from "../config/prisma.js";
import { inngest } from "../inngest/index.js";
import { logActivity } from "../utils/activityLogger.js";


// create task
export const createTask = async (req, res) => {
    try {
        const { userId } = await req.auth();
        const { projectId, title, description, type, status, priority, assigneeId, due_date, parentId } = req.body;

        const origin = req.get('origin')

        // check if user has admin role for project
        const project = await prisma.project.findUnique({
            where: {id: projectId},
            include: {members: {include: {user: true}}}
        })
        if(!project){
            return res.status(404).json({ message: "Project not found"});
        } else if (project.team_lead !== userId){
            return res.status(403).json({ message: "You don't have admin privileges for this project"})
        } else if(assigneeId && !project.members.find((member) => member.user.id === assigneeId)){
            return res.status(403).json({ message: "assignee is not a member of the project / workspace"})
        }

        const task = await prisma.task.create({
            data: {
                projectId,
                title,
                description,
                priority,
                assigneeId,
                status,
                type,
                due_date: new Date(due_date),
                parentId: parentId || null
            }
        })

        const taskWithAssignee = await prisma.task.findUnique({
            where: {id: task.id},
            include: { assignee: true}
        })

        await inngest.send({
            name: "app/task.assigned",
            data: {
                taskId: task.id, origin
            }
        })

        await logActivity({
            type: "TASK_CREATED",
            content: `created task "${task.title}"`,
            userId,
            projectId: task.projectId,
            workspaceId: project.workspaceId
        });
        
        res.json({ task: taskWithAssignee, message: "Task created successfully"})
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: error.code || error.message});
    }
}

// update task
export const updateTask = async (req, res) => {
    try {
        const task = await prisma.task.findUnique({
            where: {id: req.params.id}
        })

        if(!task){
            return res.status(404).json({ message: "Task not found"})
        }
        const { userId } = await req.auth();

        const project = await prisma.project.findUnique({
            where: {id: task.projectId},
            include: {members: {include: {user: true}}}
        })
        if(!project){
            return res.status(404).json({ message: "Project not found"});
        } else if (project.team_lead !== userId){
            return res.status(403).json({ message: "You don't have admin privileges for this project"})
        } 

        const updatedTask = await prisma.task.update({
            where: {id: req.params.id},
            data: req.body
        })

        // Trigger automations via Inngest
        await inngest.send({
            name: "app/task.updated",
            data: { 
                taskId: req.params.id, 
                changedFields: req.body, 
                oldTask: task 
            }
        });

        // Log if status changed
        if (req.body.status && req.body.status !== task.status) {
            await logActivity({
                type: "STATUS_CHANGED",
                content: `changed status of "${task.title}" to ${req.body.status}`,
                userId,
                projectId: task.projectId,
                workspaceId: project.workspaceId
            });
        }

        res.json({ task: updatedTask, message: "Task updated successfully"})
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: error.code || error.message});
    }
}

// delete task
export const deleteTask = async (req, res) => {
    try {
        const { userId } = await req.auth();
        const { tasksIds } = req.body;
        const tasks = await prisma.task.findMany({
            where: {id: {in: tasksIds}}
        })

        if(tasks.length === 0){
            return res.status(404).json({ message: "Task not found"})
        }

        const project = await prisma.project.findUnique({
            where: {id: tasks[0].projectId},
            include: {members: {include: {user: true}}}
        })
        if(!project){
            return res.status(404).json({ message: "Project not found"});
        } else if (project.team_lead !== userId){
            return res.status(403).json({ message: "You don't have admin privileges for this project"})
        } 

        await prisma.task.deleteMany({
            where: {id: {in: tasksIds}}
        })

        res.json({message:"Task deleted successfully"})
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: error.code || error.message});
    }
}

// Add dependency
export const addDependency = async (req, res) => {
    try {
        const { taskId, dependencyId } = req.body;
        const { userId } = await req.auth();

        if (taskId === dependencyId) {
            return res.status(400).json({ message: "A task cannot depend on itself" });
        }

        const updatedTask = await prisma.task.update({
            where: { id: taskId },
            data: {
                dependsOn: {
                    connect: { id: dependencyId }
                }
            },
            include: { dependsOn: true, project: true }
        });

        await logActivity({
            type: "DEPENDENCY_ADDED",
            content: `added dependency to "${updatedTask.title}"`,
            userId,
            projectId: updatedTask.projectId,
            workspaceId: updatedTask.project.workspaceId
        });

        res.json({ task: updatedTask, message: "Dependency added successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.code || error.message });
    }
};

// Remove dependency
export const removeDependency = async (req, res) => {
    try {
        const { taskId, dependencyId } = req.body;
        const { userId } = await req.auth();

        const updatedTask = await prisma.task.update({
            where: { id: taskId },
            data: {
                dependsOn: {
                    disconnect: { id: dependencyId }
                }
            },
            include: { dependsOn: true }
        });

        res.json({ task: updatedTask, message: "Dependency removed successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.code || error.message });
    }
};