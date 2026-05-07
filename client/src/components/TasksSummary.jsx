import { useEffect, useState } from "react";
import { ArrowRight, CheckCircle2, Clock, AlertCircle, ChevronRight } from "lucide-react";
import { useSelector } from "react-redux";
import { useUser } from "@clerk/clerk-react";
import { format } from "date-fns";

export default function TasksSummary() {
    const { currentWorkspace } = useSelector((state) => state.workspace);
    const { user } = useUser();
    const [tasks, setTasks] = useState([]);

    useEffect(() => {
        if (currentWorkspace) {
            const allTasks = currentWorkspace.projects.flatMap((project) => project.tasks);
            setTasks(allTasks);
        }
    }, [currentWorkspace]);

    const myTasks = tasks.filter(t => t.assigneeId === user?.id && t.status !== 'DONE');
    const upcomingTasks = myTasks
        .filter(t => t.due_date && new Date(t.due_date) >= new Date())
        .sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
    
    const overdueCount = myTasks.filter(t => t.due_date && new Date(t.due_date) < new Date()).length;

    return (
        <div className="space-y-6">
            {/* My Tasks Header Widget */}
            <div className="bg-white dark:bg-zinc-950/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400">My Tasks</h3>
                    <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold px-2.5 py-0.5 rounded-full">
                        {myTasks.length} Total
                    </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                        <div className="flex items-center gap-2 text-amber-500 mb-1">
                            <Clock className="size-4" />
                            <span className="text-[10px] font-bold uppercase">In Progress</span>
                        </div>
                        <p className="text-2xl font-bold">{myTasks.filter(t => t.status === 'IN_PROGRESS').length}</p>
                    </div>
                    <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                        <div className="flex items-center gap-2 text-red-500 mb-1">
                            <AlertCircle className="size-4" />
                            <span className="text-[10px] font-bold uppercase">Overdue</span>
                        </div>
                        <p className="text-2xl font-bold">{overdueCount}</p>
                    </div>
                </div>

                <div className="space-y-3">
                    <h4 className="text-xs font-semibold text-zinc-500 mb-2">Upcoming Deadlines</h4>
                    {upcomingTasks.length > 0 ? (
                        upcomingTasks.slice(0, 4).map((task) => (
                            <div key={task.id} className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all cursor-pointer group">
                                <div className="size-8 rounded-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center shrink-0">
                                    <CheckCircle2 className="size-4 text-zinc-300 group-hover:text-blue-500 transition-colors" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate group-hover:text-blue-500 transition-colors">{task.title}</p>
                                    <p className="text-[10px] text-zinc-500">Due {format(new Date(task.due_date), "MMM d")}</p>
                                </div>
                                <ChevronRight className="size-4 text-zinc-300 opacity-0 group-hover:opacity-100 transition-all" />
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-6 border-2 border-dashed border-zinc-100 dark:border-zinc-800 rounded-2xl">
                            <p className="text-xs text-zinc-400 italic">No upcoming tasks</p>
                        </div>
                    )}
                </div>

                <button className="w-full mt-6 py-2 text-xs font-bold text-zinc-400 hover:text-blue-500 transition-colors flex items-center justify-center gap-2">
                    View My Task List <ArrowRight className="size-3" />
                </button>
            </div>

            {/* Quick Tips / Health Widget */}
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-6 text-white shadow-xl shadow-blue-500/20">
                <h4 className="font-bold mb-2">Pro Tip</h4>
                <p className="text-sm text-blue-50/80 leading-relaxed">
                    Use the **Board View** in your projects to visualize your workflow and move tasks easily between statuses.
                </p>
                <div className="mt-4 flex -space-x-2">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="size-6 rounded-full border-2 border-blue-600 bg-blue-400 flex items-center justify-center text-[8px] font-bold">
                            U{i}
                        </div>
                    ))}
                    <div className="size-6 rounded-full border-2 border-blue-600 bg-zinc-800 flex items-center justify-center text-[8px] font-bold">
                        +5
                    </div>
                </div>
            </div>
        </div>
    );
}
