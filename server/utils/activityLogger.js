import prisma from "../config/prisma.js";

export const logActivity = async ({ type, content, userId, projectId, workspaceId }) => {
    try {
        await prisma.activity.create({
            data: {
                type,
                content,
                userId,
                projectId,
                workspaceId
            }
        });
    } catch (error) {
        console.error("Failed to log activity:", error);
    }
};
