import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Zap, AlertCircle, CheckCircle2, TrendingUp, Users, Calendar, ArrowRight } from "lucide-react";

export default function Portfolios() {
    const navigate = useNavigate();
    const currentWorkspace = useSelector((state) => state?.workspace?.currentWorkspace || null);
    const projects = currentWorkspace?.projects || [];

    const healthConfig = {
        ON_TRACK: { label: "On Track", color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/20", icon: CheckCircle2 },
        AT_RISK: { label: "At Risk", color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-900/20", icon: AlertCircle },
        OFF_TRACK: { label: "Off Track", color: "text-red-500", bg: "bg-red-50 dark:bg-red-900/20", icon: TrendingUp },
    };

    if (!currentWorkspace) return null;

    return (
        <div className="max-w-7xl mx-auto space-y-10 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-zinc-900 to-zinc-500 dark:from-white dark:to-zinc-500 bg-clip-text text-transparent mb-1">
                        Project Portfolios
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm">
                        High-level overview of all active initiatives in {currentWorkspace.name}.
                    </p>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => {
                    const health = healthConfig[project.health] || healthConfig.ON_TRACK;
                    const HealthIcon = health.icon;
                    const completedTasks = project.tasks.filter(t => t.status === "DONE").length;
                    const totalTasks = project.tasks.length;
                    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

                    return (
                        <div 
                            key={project.id} 
                            onClick={() => navigate(`/projectsDetail?id=${project.id}`)}
                            className="group relative bg-white dark:bg-zinc-950/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 hover:shadow-xl hover:shadow-blue-500/5 transition-all cursor-pointer overflow-hidden"
                        >
                            {/* Health Indicator */}
                            <div className={`absolute top-0 right-0 px-4 py-1 rounded-bl-xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 ${health.bg} ${health.color}`}>
                                <HealthIcon className="size-3" />
                                {health.label}
                            </div>

                            <div className="space-y-6 pt-4">
                                <div>
                                    <h3 className="text-lg font-bold group-hover:text-blue-500 transition-colors">{project.name}</h3>
                                    <p className="text-xs text-zinc-500 line-clamp-2 mt-1">{project.description || "No description provided."}</p>
                                </div>

                                {/* Progress */}
                                <div className="space-y-2">
                                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                                        <span>Progress</span>
                                        <span className="text-zinc-900 dark:text-zinc-100">{progress}%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-900 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-blue-500 transition-all duration-1000" 
                                            style={{ width: `${progress}%` }} 
                                        />
                                    </div>
                                </div>

                                {/* Meta */}
                                <div className="grid grid-cols-2 gap-4 py-4 border-y border-zinc-100 dark:border-zinc-800/50">
                                    <div className="flex items-center gap-2">
                                        <Users className="size-4 text-zinc-400" />
                                        <div>
                                            <p className="text-[10px] text-zinc-400 uppercase font-bold">Team</p>
                                            <p className="text-xs font-semibold">{project.members?.length || 0} Members</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="size-4 text-zinc-400" />
                                        <div>
                                            <p className="text-[10px] text-zinc-400 uppercase font-bold">Deadline</p>
                                            <p className="text-xs font-semibold">
                                                {project.end_date ? format(new Date(project.end_date), "MMM d, yyyy") : "No Date"}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex -space-x-2">
                                        {project.members?.slice(0, 3).map((m, i) => (
                                            <img key={i} src={m.user.image} className="size-6 rounded-full border-2 border-white dark:border-zinc-950 shadow-sm" alt="" />
                                        ))}
                                        {project.members?.length > 3 && (
                                            <div className="size-6 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-[8px] font-bold border-2 border-white dark:border-zinc-950">
                                                +{project.members.length - 3}
                                            </div>
                                        )}
                                    </div>
                                    <button className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 group-hover:bg-blue-500 group-hover:text-white transition-all">
                                        <ArrowRight className="size-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {/* Create Project CTA */}
                <div 
                    className="flex flex-col items-center justify-center bg-zinc-50/50 dark:bg-zinc-900/20 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 hover:border-blue-500/50 transition-all cursor-pointer group"
                >
                    <div className="size-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Zap className="size-6 text-zinc-400 group-hover:text-blue-500" />
                    </div>
                    <p className="font-bold text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">Add to Portfolio</p>
                    <p className="text-xs text-zinc-400 mt-1">Start a new initiative</p>
                </div>
            </div>
        </div>
    );
}
