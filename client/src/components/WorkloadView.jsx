import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Users, AlertCircle, CheckCircle2 } from "lucide-react";

export default function WorkloadView({ tasks, members }) {
    const workloadData = useMemo(() => {
        // Initialize data for all project members
        const dataMap = {};
        members.forEach(member => {
            dataMap[member.user.id] = {
                name: member.user.name,
                image: member.user.image,
                total: 0,
                completed: 0,
                inProgress: 0,
                overdue: 0
            };
        });

        // Populate with task data
        tasks.forEach(task => {
            if (task.assigneeId && dataMap[task.assigneeId]) {
                dataMap[task.assigneeId].total += 1;
                if (task.status === "DONE") {
                    dataMap[task.assigneeId].completed += 1;
                } else {
                    dataMap[task.assigneeId].inProgress += 1;
                    if (task.due_date && new Date(task.due_date) < new Date()) {
                        dataMap[task.assigneeId].overdue += 1;
                    }
                }
            }
        });

        return Object.values(dataMap).sort((a, b) => b.total - a.total);
    }, [tasks, members]);

    const COLORS = ["#4573d2", "#10b981", "#f59e0b", "#ef4444"];

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-zinc-950/50 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <div className="flex items-center gap-3 text-blue-500 mb-2">
                        <Users className="size-5" />
                        <span className="text-xs font-bold uppercase tracking-wider">Active Members</span>
                    </div>
                    <p className="text-3xl font-bold">{workloadData.filter(d => d.total > 0).length}</p>
                </div>
                <div className="bg-white dark:bg-zinc-950/50 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <div className="flex items-center gap-3 text-amber-500 mb-2">
                        <AlertCircle className="size-5" />
                        <span className="text-xs font-bold uppercase tracking-wider">High Workload (>5 tasks)</span>
                    </div>
                    <p className="text-3xl font-bold">{workloadData.filter(d => d.inProgress > 5).length}</p>
                </div>
                <div className="bg-white dark:bg-zinc-950/50 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <div className="flex items-center gap-3 text-emerald-500 mb-2">
                        <CheckCircle2 className="size-5" />
                        <span className="text-xs font-bold uppercase tracking-wider">Available (0 tasks)</span>
                    </div>
                    <p className="text-3xl font-bold">{workloadData.filter(d => d.total === 0).length}</p>
                </div>
            </div>

            {/* Chart Section */}
            <div className="bg-white dark:bg-zinc-950/50 p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 mb-8">Tasks per Member</h3>
                <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={workloadData} layout="vertical" margin={{ left: 40, right: 40 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#27272a" />
                            <XAxis type="number" hide />
                            <YAxis 
                                dataKey="name" 
                                type="category" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fill: '#71717a', fontSize: 12 }}
                                width={100}
                            />
                            <Tooltip 
                                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '12px' }}
                                itemStyle={{ fontSize: '12px' }}
                            />
                            <Bar dataKey="inProgress" name="In Progress" stackId="a" fill="#4573d2" radius={[0, 0, 0, 0]} barSize={20} />
                            <Bar dataKey="completed" name="Completed" stackId="a" fill="#10b981" radius={[0, 4, 4, 0]} barSize={20} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Detailed Table */}
            <div className="bg-white dark:bg-zinc-950/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
                <table className="w-full text-left text-sm">
                    <thead className="bg-zinc-50 dark:bg-zinc-900/50 text-[10px] uppercase font-bold tracking-wider text-zinc-400">
                        <tr>
                            <th className="px-6 py-4">Team Member</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">In Progress</th>
                            <th className="px-6 py-4">Overdue</th>
                            <th className="px-6 py-4">Completed</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                        {workloadData.map((member) => (
                            <tr key={member.name} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-colors">
                                <td className="px-6 py-4 flex items-center gap-3">
                                    <img src={member.image} className="size-8 rounded-full border border-zinc-200 dark:border-zinc-700" alt="" />
                                    <span className="font-medium">{member.name}</span>
                                </td>
                                <td className="px-6 py-4">
                                    {member.inProgress > 5 ? (
                                        <span className="px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-[10px] font-bold uppercase">At Capacity</span>
                                    ) : (
                                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase">Healthy</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 font-semibold">{member.inProgress}</td>
                                <td className="px-6 py-4 text-red-500 font-semibold">{member.overdue}</td>
                                <td className="px-6 py-4 text-zinc-400">{member.completed}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
