import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Plus, Settings, BarChart3, Calendar, FileStack, Zap, Activity, Users, Image } from "lucide-react";
import ProjectAnalytics from "../components/ProjectAnalytics";
import ProjectSettings from "../components/ProjectSettings";
import CreateTaskDialog from "../components/CreateTaskDialog";
import ProjectCalendar from "../components/ProjectCalendar";
import ProjectTasks from "../components/ProjectTasks";
import ProjectBoard from "../components/ProjectBoard";
import ProjectActivity from "../components/ProjectActivity";
import WorkloadView from "../components/WorkloadView";
import ProjectGallery from "../components/ProjectGallery";
import TaskDetailsSheet from "../components/TaskDetailsSheet";

export default function ProjectDetail() {

    const [searchParams, setSearchParams] = useSearchParams();
    const tab = searchParams.get('tab');
    const id = searchParams.get('id');

    const navigate = useNavigate();
    const projects = useSelector((state) => state?.workspace?.currentWorkspace?.projects || []);

    const [project, setProject] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [showCreateTask, setShowCreateTask] = useState(false);
    const [activeTab, setActiveTab] = useState(tab || "tasks");
    const [selectedTaskId, setSelectedTaskId] = useState(null);

    useEffect(() => {
        if (tab) setActiveTab(tab);
    }, [tab]);

    useEffect(() => {
        if (projects && projects.length > 0) {
            const proj = projects.find((p) => p.id === id);
            setProject(proj);
            setTasks(proj?.tasks || []);
        }
    }, [id, projects]);

    const statusColors = {
        PLANNING: "bg-zinc-200 text-zinc-900 dark:bg-zinc-600 dark:text-zinc-200",
        ACTIVE: "bg-emerald-200 text-emerald-900 dark:bg-emerald-500 dark:text-emerald-900",
        ON_HOLD: "bg-amber-200 text-amber-900 dark:bg-amber-500 dark:text-amber-900",
        COMPLETED: "bg-blue-200 text-blue-900 dark:bg-blue-500 dark:text-blue-900",
        CANCELLED: "bg-red-200 text-red-900 dark:bg-red-500 dark:text-red-900",
    };

    if (!project) {
        return (
            <div className="p-6 text-center text-zinc-900 dark:text-zinc-200">
                <p className="text-3xl md:text-5xl mt-40 mb-10">Project not found</p>
                <button onClick={() => navigate('/projects')} className="mt-4 px-4 py-2 rounded bg-zinc-200 text-zinc-900 hover:bg-zinc-300 dark:bg-zinc-700 dark:text-white dark:hover:bg-zinc-600" >
                    Back to Projects
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-5 max-w-6xl mx-auto text-zinc-900 dark:text-white">
            {/* Header */}
            <div className="flex max-md:flex-col gap-4 flex-wrap items-start justify-between max-w-6xl">
                <div className="flex items-center gap-4">
                    <button className="p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400" onClick={() => navigate('/projects')}>
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div className="flex items-center gap-3">
                        <h1 className="text-xl font-medium">{project.name} <span className="text-red-500 text-xs">(V2)</span></h1>
                        <span className={`px-2 py-1 rounded text-xs capitalize ${statusColors[project.status]}`} >
                            {project.status.replace("_", " ")}
                        </span>
                    </div>
                </div>
                <button onClick={() => setShowCreateTask(true)} className="flex items-center gap-2 px-5 py-2 text-sm rounded bg-gradient-to-br from-blue-500 to-blue-600 text-white" >
                    <Plus className="size-4" />
                    New Task
                </button>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-2 sm:flex flex-wrap gap-6">
                {[
                    { label: "Total Tasks", value: tasks.length, color: "text-zinc-900 dark:text-white" },
                    { label: "Completed", value: tasks.filter((t) => t.status === "DONE").length, color: "text-emerald-700 dark:text-emerald-400" },
                    { label: "In Progress", value: tasks.filter((t) => t.status === "IN_PROGRESS" || t.status === "TODO").length, color: "text-amber-700 dark:text-amber-400" },
                    { label: "Team Members", value: project.members?.length || 0, color: "text-blue-700 dark:text-blue-400" },
                ].map((card, idx) => (
                    <div key={idx} className=" dark:bg-gradient-to-br dark:from-zinc-800/70 dark:to-zinc-900/50 border border-zinc-200 dark:border-zinc-800 flex justify-between sm:min-w-60 p-4 py-2.5 rounded">
                        <div>
                            <div className="text-sm text-zinc-600 dark:text-zinc-400">{card.label}</div>
                            <div className={`text-2xl font-bold ${card.color}`}>{card.value}</div>
                        </div>
                        <Zap className={`size-4 ${card.color}`} />
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div>
                <div className="inline-flex flex-wrap p-1 gap-1 bg-zinc-100/50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 rounded-xl glass-effect">
                    {[
                        { key: "tasks", label: "List", icon: FileStack },
                        { key: "board", label: "Board", icon: Zap },
                        { key: "calendar", label: "Calendar", icon: Calendar },
                        { key: "activity", label: "Activity", icon: Activity },
                        { key: "workload", label: "Workload", icon: Users },
                        { key: "gallery", label: "Gallery", icon: Image },
                        { key: "analytics", label: "Analytics", icon: BarChart3 },
                        { key: "settings", label: "Settings", icon: Settings },
                    ].map((tabItem) => (
                        <button key={tabItem.key} onClick={() => { setActiveTab(tabItem.key); setSearchParams({ id: id, tab: tabItem.key }) }} className={`flex items-center gap-2 px-4 py-1.5 text-xs font-medium rounded-lg transition-all ${activeTab === tabItem.key ? "bg-white dark:bg-zinc-700 text-primary shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-600" : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-zinc-800/50"}`} >
                            <tabItem.icon className="size-3.5" />
                            {tabItem.label}
                        </button>
                    ))}
                </div>

                <div className="mt-6">
                    {activeTab === "tasks" && (
                        <div className=" dark:bg-zinc-900/40 rounded max-w-6xl">
                            <ProjectTasks project={project} tasks={tasks} onTaskClick={(taskId) => setSelectedTaskId(taskId)} />
                        </div>
                    )}
                    {activeTab === "board" && (
                        <div className="rounded max-w-6xl">
                            <ProjectBoard tasks={tasks} onAddTask={() => setShowCreateTask(true)} onTaskClick={(taskId) => setSelectedTaskId(taskId)} />
                        </div>
                    )}
                    {activeTab === "activity" && (
                        <div className=" dark:bg-zinc-900/40 rounded max-w-6xl">
                            <ProjectActivity workspaceId={project.workspaceId} projectId={project.id} />
                        </div>
                    )}
                    {activeTab === "workload" && (
                        <div className="rounded max-w-6xl">
                            <WorkloadView tasks={tasks} members={project.members} />
                        </div>
                    )}
                    {activeTab === "gallery" && (
                        <div className="rounded max-w-6xl">
                            <ProjectGallery tasks={tasks} />
                        </div>
                    )}
                    {activeTab === "analytics" && (
                        <div className=" dark:bg-zinc-900/40 rounded max-w-6xl">
                            <ProjectAnalytics tasks={tasks} project={project} />
                        </div>
                    )}
                    {activeTab === "calendar" && (
                        <div className=" dark:bg-zinc-900/40 rounded max-w-6xl">
                            <ProjectCalendar tasks={tasks} />
                        </div>
                    )}
                    {activeTab === "settings" && (
                        <div className=" dark:bg-zinc-900/40 rounded max-w-6xl">
                            <ProjectSettings project={project} />
                        </div>
                    )}
                </div>
            </div>

            {/* Create Task Modal */}
            {showCreateTask && <CreateTaskDialog showCreateTask={showCreateTask} setShowCreateTask={setShowCreateTask} projectId={id} />}

            {/* Task Details Side Panel */}
            <TaskDetailsSheet 
                taskId={selectedTaskId} 
                projectId={id} 
                onClose={() => setSelectedTaskId(null)} 
            />
        </div>
    );
}
