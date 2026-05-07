import prisma from "../config/prisma.js";

// Create a custom field definition for a project
export const createFieldDefinition = async (req, res) => {
    try {
        const { projectId, name, type, options } = req.body;
        const { userId } = await req.auth();

        // Check if user is team lead
        const project = await prisma.project.findUnique({
            where: { id: projectId }
        });

        if (!project || project.team_lead !== userId) {
            return res.status(403).json({ message: "Only project lead can manage custom fields" });
        }

        const field = await prisma.customFieldDefinition.create({
            data: {
                projectId,
                name,
                type,
                options: options || null
            }
        });

        res.json({ field, message: "Custom field created successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.code || error.message });
    }
};

// Update a custom field value for a specific task
export const updateFieldValue = async (req, res) => {
    try {
        const { taskId, definitionId, value } = req.body;
        const { userId } = await req.auth();

        const fieldValue = await prisma.customFieldValue.upsert({
            where: {
                taskId_definitionId: {
                    taskId,
                    definitionId
                }
            },
            update: { value: String(value) },
            create: {
                taskId,
                definitionId,
                value: String(value)
            }
        });

        res.json({ fieldValue, message: "Field value updated" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.code || error.message });
    }
};

// Delete a custom field definition
export const deleteFieldDefinition = async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = await req.auth();

        const field = await prisma.customFieldDefinition.findUnique({
            where: { id },
            include: { project: true }
        });

        if (!field || field.project.team_lead !== userId) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        await prisma.customFieldDefinition.delete({
            where: { id }
        });

        res.json({ message: "Custom field deleted" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.code || error.message });
    }
};
