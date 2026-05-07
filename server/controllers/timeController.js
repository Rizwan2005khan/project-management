import prisma from "../config/prisma.js";

// Start a new timer for a task
export const startTimeEntry = async (req, res) => {
    try {
        const { taskId } = req.body;
        const { userId } = await req.auth();

        // Check if there's an active timer for this user
        const activeEntry = await prisma.timeEntry.findFirst({
            where: {
                userId,
                endTime: null
            }
        });

        if (activeEntry) {
            return res.status(400).json({ message: "You already have an active timer running. Stop it first." });
        }

        const timeEntry = await prisma.timeEntry.create({
            data: {
                taskId,
                userId,
                startTime: new Date()
            }
        });

        res.json({ timeEntry, message: "Timer started" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

// Stop an active timer
export const stopTimeEntry = async (req, res) => {
    try {
        const { userId } = await req.auth();

        const activeEntry = await prisma.timeEntry.findFirst({
            where: {
                userId,
                endTime: null
            }
        });

        if (!activeEntry) {
            return res.status(400).json({ message: "No active timer found" });
        }

        const endTime = new Date();
        const duration = Math.round((endTime - new Date(activeEntry.startTime)) / 1000); // duration in seconds

        const updatedEntry = await prisma.timeEntry.update({
            where: { id: activeEntry.id },
            data: {
                endTime,
                duration
            }
        });

        res.json({ timeEntry: updatedEntry, message: "Timer stopped" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

// Get time logs for a task
export const getTaskTimeLogs = async (req, res) => {
    try {
        const { taskId } = req.params;

        const logs = await prisma.timeEntry.findMany({
            where: { taskId },
            include: { user: true },
            orderBy: { startTime: 'desc' }
        });

        res.json({ logs });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};
