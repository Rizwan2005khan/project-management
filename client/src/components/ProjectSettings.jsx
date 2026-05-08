import { format } from "date-fns";
import { Plus, Save, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import AddProjectMember from "./AddProjectMember";
import { useDispatch } from "react-redux";
import { useAuth } from "@clerk/clerk-react";
import toast from "react-hot-toast";
import api from "../configs/api";
import { fetchWorkspaces } from "../features/workspaceSlice";

export default function ProjectSettings({ project }) {

    const dispatch = useDispatch()
    const {getToken} = useAuth()
    const [formData, setFormData] = useState({
        name: "New Website Launch",
        description: "Initial launch for new web platform.",
        status: "PLANNING",
        priority: "MEDIUM",
        start_date: "2025-09-10",
        end_date: "2025-10-15",
        progress: 30,
    });

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true)
        toast.loading("Saving...")
        try {
            const {data} = await api.put('/api/projects', formData, {headers: {Authorization: `Bearer ${await getToken()}`}})
            setIsDialogOpen(false)
            dispatch(fetchWorkspaces({getToken}))
            toast.dismissAll();
            toast.success(data.message)
        } catch (error) {
            toast.dismissAll();
            toast.error(error?.response?.data?.message || error.message)
        }finally{
            setIsSubmitting(false)
        }
    };

    useEffect(() => {
        if (project) setFormData(project);
    }, [project]);

    const inputClasses = "w-full px-3 py-2 rounded mt-2 border text-sm dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-300";

    const cardClasses = "rounded-lg border p-6 not-dark:bg-white dark:bg-gradient-to-br dark:from-zinc-800/70 dark:to-zinc-900/50 border-zinc-300 dark:border-zinc-800";

    const labelClasses = "text-sm text-zinc-600 dark:text-zinc-400";

    return (
        <div className="grid lg:grid-cols-2 gap-8">
            {/* Project Details */}
            <div className={cardClasses}>
                <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-300 mb-4">Project Details</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name */}
                    <div className="space-y-2">
                        <label className={labelClasses}>Project Name</label>
                        <input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className={inputClasses} required />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <label className={labelClasses}>Description</label>
                        <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className={inputClasses + " h-24"} />
                    </div>

                    {/* Status & Priority */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className={labelClasses}>Status</label>
                            <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className={inputClasses} >
                                <option value="PLANNING">Planning</option>
                                <option value="ACTIVE">Active</option>
                                <option value="ON_HOLD">On Hold</option>
                                <option value="COMPLETED">Completed</option>
                                <option value="CANCELLED">Cancelled</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className={labelClasses}>Priority</label>
                            <select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })} className={inputClasses} >
                                <option value="LOW">Low</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HIGH">High</option>
                            </select>
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className="space-y-4 grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className={labelClasses}>Start Date</label>
                            <input type="date" value={format(formData.start_date, "yyyy-MM-dd")} onChange={(e) => setFormData({ ...formData, start_date: new Date(e.target.value) })} className={inputClasses} />
                        </div>
                        <div className="space-y-2">
                            <label className={labelClasses}>End Date</label>
                            <input type="date" value={format(formData.end_date, "yyyy-MM-dd")} onChange={(e) => setFormData({ ...formData, end_date: new Date(e.target.value) })} className={inputClasses} />
                        </div>
                    </div>

                    {/* Progress */}
                    <div className="space-y-2">
                        <label className={labelClasses}>Progress: {formData.progress}%</label>
                        <input type="range" min="0" max="100" step="5" value={formData.progress} onChange={(e) => setFormData({ ...formData, progress: Number(e.target.value) })} className="w-full accent-blue-500 dark:accent-blue-400" />
                    </div>

                    {/* Save Button */}
                    <button type="submit" disabled={isSubmitting} className="ml-auto flex items-center text-sm justify-center gap-2 bg-gradient-to-br from-blue-500 to-blue-600 text-white px-4 py-2 rounded" >
                        <Save className="size-4" /> {isSubmitting ? "Saving..." : "Save Changes"}
                    </button>
                </form>
            </div>

            {/* Custom Fields Management */}
            <div className="space-y-6">
                <div className={cardClasses}>
                    <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-300 mb-4">Custom Fields</h2>
                    
                    <div className="space-y-4 mb-6">
                        {project.customFields?.map((field) => (
                            <div key={field.id} className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800">
                                <div>
                                    <p className="text-sm font-semibold">{field.name}</p>
                                    <p className="text-[10px] text-zinc-500 uppercase tracking-wider">{field.type}</p>
                                </div>
                                <button 
                                    onClick={async () => {
                                        if (confirm("Delete this field? All task values will be lost.")) {
                                            const token = await getToken();
                                            await api.delete(`/api/custom-fields/definition/${field.id}`, {
                                                headers: { Authorization: `Bearer ${token}` }
                                            });
                                            dispatch(fetchWorkspaces({ getToken }));
                                            toast.success("Field deleted");
                                        }
                                    }}
                                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                >
                                    <Plus className="size-4 rotate-45" />
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30">
                        <h3 className="text-sm font-semibold mb-3">Add New Field</h3>
                        <div className="space-y-3">
                            <input 
                                id="new-field-name"
                                placeholder="Field Name (e.g. Budget)" 
                                className={inputClasses} 
                            />
                            <select id="new-field-type" className={inputClasses}>
                                <option value="TEXT">Text</option>
                                <option value="NUMBER">Number</option>
                                <option value="DROPDOWN">Dropdown</option>
                                <option value="DATE">Date</option>
                            </select>
                            <button 
                                onClick={async () => {
                                    const name = document.getElementById("new-field-name").value;
                                    const type = document.getElementById("new-field-type").value;
                                    if (!name) return toast.error("Name is required");
                                    
                                    const token = await getToken();
                                    await api.post(`/api/custom-fields/definition`, 
                                        { projectId: project.id, name, type },
                                        { headers: { Authorization: `Bearer ${token}` } }
                                    );
                                    document.getElementById("new-field-name").value = "";
                                    dispatch(fetchWorkspaces({ getToken }));
                                    toast.success("Field added");
                                }}
                                className="w-full py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
                            >
                                Create Field
                            </button>
                        </div>
                    </div>
                </div>

                {/* Automations Management */}
                <div className={cardClasses}>
                    <div className="flex items-center gap-2 mb-4">
                        <Zap className="size-5 text-amber-500" />
                        <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-300">Automations</h2>
                    </div>
                    
                    <div className="space-y-4 mb-6">
                        {project.automations?.map((auto) => (
                            <div key={auto.id} className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 group relative">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-sm font-bold">{auto.name}</p>
                                        <div className="mt-2 space-y-1 text-xs text-zinc-500">
                                            <p><span className="text-zinc-400 font-medium">When:</span> Status is <span className="text-blue-500 font-bold">{auto.triggerValue}</span></p>
                                            <p><span className="text-zinc-400 font-medium">Then:</span> {auto.actionType === 'AUTO_ASSIGN' ? 'Assign to' : 'Set Priority to'} <span className="text-amber-500 font-bold">{auto.actionValue}</span></p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={async () => {
                                            if (confirm("Delete this automation?")) {
                                                const token = await getToken();
                                                await api.delete(`/api/automations/${auto.id}`, {
                                                    headers: { Authorization: `Bearer ${token}` }
                                                });
                                                dispatch(fetchWorkspaces({ getToken }));
                                                toast.success("Automation deleted");
                                            }
                                        }}
                                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                    >
                                        <Plus className="size-4 rotate-45" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30">
                        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                            <Plus className="size-4" /> Create Rule
                        </h3>
                        <div className="space-y-3">
                            <input 
                                id="auto-name"
                                placeholder="Rule Name (e.g. Auto-Assign Done)" 
                                className={inputClasses} 
                            />
                            <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-zinc-500 uppercase">When Status is</label>
                                    <select id="auto-trigger-value" className={inputClasses}>
                                        <option value="TODO">To Do</option>
                                        <option value="IN_PROGRESS">In Progress</option>
                                        <option value="DONE">Done</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-zinc-500 uppercase">Action</label>
                                    <select id="auto-action-type" className={inputClasses}>
                                        <option value="AUTO_ASSIGN">Auto-Assign</option>
                                        <option value="SET_PRIORITY">Set Priority</option>
                                    </select>
                                </div>
                            </div>
                            <input 
                                id="auto-action-value"
                                placeholder="User ID or Priority (LOW/MEDIUM/HIGH)" 
                                className={inputClasses} 
                            />
                            <button 
                                onClick={async () => {
                                    const name = document.getElementById("auto-name").value;
                                    const triggerValue = document.getElementById("auto-trigger-value").value;
                                    const actionType = document.getElementById("auto-action-type").value;
                                    const actionValue = document.getElementById("auto-action-value").value;
                                    
                                    if (!name || !actionValue) return toast.error("All fields are required");
                                    
                                    const token = await getToken();
                                    await api.post(`/api/automations`, 
                                        { projectId: project.id, name, triggerType: "STATUS_CHANGE", triggerValue, actionType, actionValue },
                                        { headers: { Authorization: `Bearer ${token}` } }
                                    );
                                    document.getElementById("auto-name").value = "";
                                    document.getElementById("auto-action-value").value = "";
                                    dispatch(fetchWorkspaces({ getToken }));
                                    toast.success("Automation rule added");
                                }}
                                className="w-full py-2 bg-amber-500 text-white rounded-lg text-sm font-semibold hover:bg-amber-600 transition-colors"
                            >
                                Activate Rule
                            </button>
                        </div>
                    </div>
                </div>

                <div className={cardClasses}>
                    <div className="flex items-center justify-between gap-4">
                        <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-300 mb-4">
                            Team Members <span className="text-sm text-zinc-600 dark:text-zinc-400">({project.members.length})</span>
                        </h2>
                        <button type="button" onClick={() => setIsDialogOpen(true)} className="p-2 rounded-lg border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800" >
                            <Plus className="size-4 text-zinc-900 dark:text-zinc-300" />
                        </button>
                    </div>

                    {/* Member List */}
                    {project.members.length > 0 && (
                        <div className="space-y-2 mt-2 max-h-32 overflow-y-auto">
                            {project.members.map((member, index) => (
                                <div key={index} className="flex items-center justify-between px-3 py-2 rounded dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-300" >
                                    <span> {member?.user?.email || "Unknown"} </span>
                                    {project.team_lead === member.user.id && <span className="px-2 py-0.5 rounded-xs ring ring-zinc-200 dark:ring-zinc-600">Team Lead</span>}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <AddProjectMember isDialogOpen={isDialogOpen} setIsDialogOpen={setIsDialogOpen} />
        </div>
    );
}
