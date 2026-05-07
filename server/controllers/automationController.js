import prisma from "../config/prisma.js";

// Create a new automation
export const createAutomation = async (req, res) => {
    try {
        const { projectId, name, triggerType, triggerValue, actionType, actionValue } = req.body;
        const { userId } = await req.auth();

        // Check permissions
        const project = await prisma.project.findUnique({ where: { id: projectId } });
        if (project.team_lead !== userId) {
            return res.status(403).json({ message: "Only project leads can create automations" });
        }

        const automation = await prisma.automation.create({
            data: {
                projectId,
                name,
                triggerType,
                triggerValue,
                actionType,
                actionValue
            }
        });

        res.json({ automation, message: "Automation created successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete an automation
export const deleteAutomation = async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = await req.auth();

        const automation = await prisma.automation.findUnique({
            where: { id },
            include: { project: true }
        });

        if (automation.project.team_lead !== userId) {
            return res.status(403).json({ message: "Only project leads can delete automations" });
        }

        await prisma.automation.delete({ where: { id } });
        res.json({ message: "Automation deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
