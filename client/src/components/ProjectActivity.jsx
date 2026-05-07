import { useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import api from "../configs/api";
import { formatDistanceToNow } from "date-fns";
import { Loader2, Zap, Tag, UserPlus, Link } from "lucide-react";

const activityIcons = {
    TASK_CREATED: { icon: Tag, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20" },
    STATUS_CHANGED: { icon: Zap, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-900/20" },
    DEPENDENCY_ADDED: { icon: Link, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-900/20" },
    MEMBER_ADDED: { icon: UserPlus, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
};

export default function ProjectActivity({ workspaceId, projectId }) {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const { getToken } = useAuth();

    useEffect(() => {
        const fetchActivities = async () => {
            try {
                const token = await getToken();
                const { data } = await api.get(`/api/workspaces/activities/${workspaceId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                // Filter by project if projectId is provided
                const filtered = projectId 
                    ? data.activities.filter(a => a.projectId === projectId)
                    : data.activities;
                    
                setActivities(filtered);
            } catch (error) {
                console.error("Error fetching activities", error);
            } finally {
                setLoading(false);
            }
        };

        fetchActivities();
    }, [workspaceId, projectId]);

    if (loading) return (
        <div className="flex items-center justify-center py-20">
            <Loader2 className="size-6 text-blue-500 animate-spin" />
        </div>
    );

    if (activities.length === 0) return (
        <div className="text-center py-20 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-800">
            <p className="text-sm text-zinc-500 italic">No activity yet.</p>
        </div>
    );

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            {activities.map((activity, index) => {
                const config = activityIcons[activity.type] || activityIcons.TASK_CREATED;
                const Icon = config.icon;

                return (
                    <div key={activity.id} className="relative flex gap-4 group">
                        {/* Timeline Line */}
                        {index !== activities.length - 1 && (
                            <div className="absolute left-4 top-8 bottom-0 w-[2px] bg-zinc-100 dark:bg-zinc-800" />
                        )}

                        {/* Icon */}
                        <div className={`relative z-10 size-8 rounded-full flex items-center justify-center shrink-0 ${config.bg}`}>
                            <Icon className={`size-4 ${config.color}`} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 pt-1">
                            <div className="flex items-center gap-2 mb-1">
                                <img src={activity.user?.image} className="size-5 rounded-full" alt="" />
                                <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                                    {activity.user?.name}
                                </span>
                                <span className="text-xs text-zinc-500">
                                    {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                                </span>
                            </div>
                            <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                {activity.content}
                            </p>
                            {activity.project && !projectId && (
                                <span className="inline-block mt-2 px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-[10px] font-medium text-zinc-500">
                                    in {activity.project.name}
                                </span>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
