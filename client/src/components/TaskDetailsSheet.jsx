import { useState, useEffect } from "react";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { X, Calendar, MessageCircle, User, Tag, AlertCircle, Send, CheckSquare, ListPlus, Link, Link2Off, Search, Zap, Timer, Play, Square as StopIcon, Plus, Image, Download } from "lucide-react";
import { useAuth, useUser } from "@clerk/clerk-react";
import api from "../configs/api";
import CreateTaskDialog from "./CreateTaskDialog";
import { updateTask, fetchWorkspaces } from "../features/workspaceSlice";
import { useDispatch } from "react-redux";
import ReactMarkdown from "react-markdown";

export default function TaskDetailsSheet({ taskId, projectId, onClose }) {
  const { user } = useUser();
  const { getToken } = useAuth();
  const dispatch = useDispatch();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [showCreateSubtask, setShowCreateSubtask] = useState(false);
  const [showDepSearch, setShowDepSearch] = useState(false);
  const [depQuery, setDepQuery] = useState("");
  const [timeLogs, setTimeLogs] = useState([]);
  const [activeTimer, setActiveTimer] = useState(null);

  const { currentWorkspace } = useSelector((state) => state.workspace);

  // Reactive task fetching from Redux
  const project = currentWorkspace?.projects.find((p) => p.id === projectId);
  const task = project?.tasks.find((t) => t.id === taskId);

  const fetchTaskDetails = async () => {
    if (!taskId) return;
    setLoading(true);
    await Promise.all([fetchComments(), fetchTimeLogs()]);
    setLoading(false);
  };

  const fetchTimeLogs = async () => {
    try {
      const token = await getToken();
      const { data } = await api.get(`/api/time/task/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTimeLogs(data.logs || []);
      // Check if any log is currently active (no endTime)
      const active = data.logs?.find(log => !log.endTime && log.userId === user.id);
      setActiveTimer(active);
    } catch (error) {
      console.error("Error fetching time logs", error);
    }
  };

  const handleStartTimer = async () => {
    try {
      const token = await getToken();
      const { data } = await api.post(`/api/time/start`, { taskId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setActiveTimer(data.timeEntry);
      setTimeLogs(prev => [data.timeEntry, ...prev]);
      toast.success("Timer started");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to start timer");
    }
  };

  const handleStopTimer = async () => {
    try {
      const token = await getToken();
      const { data } = await api.post(`/api/time/stop`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setActiveTimer(null);
      await fetchTimeLogs(); // Refresh logs to get final duration
      toast.success("Timer stopped");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to stop timer");
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return "0s";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? h + 'h ' : ''}${m > 0 ? m + 'm ' : ''}${s}s`;
  };

  const totalTime = timeLogs.reduce((acc, log) => acc + (log.duration || 0), 0);

  const fetchComments = async () => {
    try {
      const token = await getToken();
      const { data } = await api.get(`/api/comments/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setComments(data.comments || []);
    } catch (error) {
      console.error("Error fetching comments", error);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      const token = await getToken();
      const { data } = await api.post(`/api/comments`, 
        { taskId: task.id, content: newComment }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComments((prev) => [...prev, data.comment]);
      setNewComment("");
      toast.success("Comment added");
    } catch (error) {
      toast.error("Failed to add comment");
    }
  };

  const handleAddDependency = async (dependencyId) => {
    try {
      const token = await getToken();
      const { data } = await api.post(`/api/tasks/add-dependency`, 
        { taskId: task.id, dependencyId }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      dispatch(updateTask(data.task));
      setShowDepSearch(false);
      setDepQuery("");
      toast.success("Dependency added");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to add dependency");
    }
  };

  const handleRemoveDependency = async (dependencyId) => {
    try {
      const token = await getToken();
      const { data } = await api.post(`/api/tasks/remove-dependency`, 
        { taskId: task.id, dependencyId }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      dispatch(updateTask(data.task));
      toast.success("Dependency removed");
    } catch (error) {
      toast.error("Failed to remove dependency");
    }
  };

  const otherTasks = project?.tasks.filter(t => t.id !== taskId && !task?.dependsOn?.find(d => d.id === t.id)) || [];
  const filteredOtherTasks = otherTasks.filter(t => t.title.toLowerCase().includes(depQuery.toLowerCase()));

  useEffect(() => {
    fetchTaskDetails();
  }, [taskId]);

  return (
    <div className={`fixed inset-0 z-50 flex justify-end transition-opacity duration-300 ${taskId ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity duration-300 ${taskId ? 'opacity-100' : 'opacity-0'}`} 
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className={`relative w-full max-w-xl bg-white dark:bg-zinc-900 shadow-2xl h-full flex flex-col transform transition-transform duration-500 ease-in-out ${taskId ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              Task Details
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="size-5 text-zinc-500" />
          </button>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : task ? (
          <div className="flex-1 overflow-y-auto no-scrollbar">
            <div className="p-6 space-y-8">
              {/* Title & Status */}
              <section>
                <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
                  {task.title}
                </h2>
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    <Tag className="size-3.5" />
                    {task.status}
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-xs font-medium text-blue-600 dark:text-blue-400">
                    <AlertCircle className="size-3.5" />
                    {task.type}
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-900/20 text-xs font-medium text-amber-600 dark:text-amber-400">
                    <Zap className="size-3.5" />
                    {task.priority}
                  </div>
                </div>
              </section>

              {/* Meta Info Grid */}
              <section className="grid grid-cols-2 gap-6 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Assignee</label>
                  <div className="flex items-center gap-2">
                    <img src={task.assignee?.image} className="size-6 rounded-full" alt="" />
                    <span className="text-sm font-medium">{task.assignee?.name || "Unassigned"}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Due Date</label>
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Calendar className="size-4 text-zinc-400" />
                    {format(new Date(task.due_date), "MMM d, yyyy")}
                  </div>
                </div>
              </section>

              {/* Time Tracking */}
              <section className="p-4 rounded-xl bg-zinc-900 text-white shadow-xl shadow-blue-500/10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${activeTimer ? 'bg-blue-500 animate-pulse' : 'bg-zinc-800'}`}>
                      <Timer className="size-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Time Tracking</p>
                      <p className="text-lg font-bold">{formatDuration(totalTime)} <span className="text-xs font-normal text-zinc-500">total</span></p>
                    </div>
                  </div>
                  
                  {activeTimer ? (
                    <button 
                      onClick={handleStopTimer}
                      className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg text-sm font-bold transition-all"
                    >
                      <StopIcon className="size-4 fill-current" />
                      STOP
                    </button>
                  ) : (
                    <button 
                      onClick={handleStartTimer}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-sm font-bold transition-all shadow-lg shadow-blue-500/20"
                    >
                      <Play className="size-4 fill-current" />
                      START
                    </button>
                  )}
                </div>

                {timeLogs.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-zinc-800 space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Recent Logs</p>
                    {timeLogs.slice(0, 2).map(log => (
                      <div key={log.id} className="flex justify-between items-center text-xs">
                        <div className="flex items-center gap-2">
                          <img src={log.user?.image} className="size-4 rounded-full" alt="" />
                          <span className="text-zinc-400">{log.user?.name}</span>
                        </div>
                        <span className="font-medium">{log.duration ? formatDuration(log.duration) : 'Running...'}</span>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Description */}
              <section className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Description</label>
                <div className="prose prose-sm dark:prose-invert max-w-none text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed bg-zinc-50/50 dark:bg-zinc-800/20 p-4 rounded-xl">
                  <ReactMarkdown>
                    {task.description || "No description provided."}
                  </ReactMarkdown>
                </div>
              </section>

              {/* Custom Fields */}
              {project?.customFields?.length > 0 && (
                <section className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2">
                    <ListPlus className="size-4 text-zinc-400" />
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Custom Fields</label>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    {project.customFields.map((field) => {
                      const valueObj = task.customFieldValues?.find(v => v.definitionId === field.id);
                      return (
                        <div key={field.id} className="flex items-center justify-between group">
                          <label className="text-xs font-medium text-zinc-500">{field.name}</label>
                          <div className="w-1/2">
                            {field.type === 'TEXT' || field.type === 'NUMBER' ? (
                              <input 
                                type={field.type === 'NUMBER' ? 'number' : 'text'}
                                defaultValue={valueObj?.value || ""}
                                onBlur={async (e) => {
                                  const token = await getToken();
                                  await api.post(`/api/custom-fields/value`, 
                                    { taskId: task.id, definitionId: field.id, value: e.target.value },
                                    { headers: { Authorization: `Bearer ${token}` } }
                                  );
                                  dispatch(fetchWorkspaces({ getToken }));
                                  toast.success(`${field.name} updated`);
                                }}
                                className="w-full bg-transparent border-none text-right text-xs font-semibold focus:ring-0 placeholder:text-zinc-300"
                                placeholder={`Set ${field.name}...`}
                              />
                            ) : field.type === 'DATE' ? (
                              <input 
                                type="date"
                                defaultValue={valueObj?.value || ""}
                                onChange={async (e) => {
                                  const token = await getToken();
                                  await api.post(`/api/custom-fields/value`, 
                                    { taskId: task.id, definitionId: field.id, value: e.target.value },
                                    { headers: { Authorization: `Bearer ${token}` } }
                                  );
                                  dispatch(fetchWorkspaces({ getToken }));
                                  toast.success(`${field.name} updated`);
                                }}
                                className="w-full bg-transparent border-none text-right text-xs font-semibold focus:ring-0"
                              />
                            ) : (
                              <span className="text-xs text-zinc-400 italic">Dropdown coming soon...</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* Subtasks */}
              <section className="space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2">
                  <div className="flex items-center gap-2">
                    <CheckSquare className="size-4 text-zinc-400" />
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Subtasks</label>
                  </div>
                  <button 
                    onClick={() => setShowCreateSubtask(true)}
                    className="flex items-center gap-1 text-[10px] font-bold text-primary hover:underline"
                  >
                    <ListPlus className="size-3" />
                    ADD
                  </button>
                </div>

                <div className="space-y-2">
                  {task.subtasks && task.subtasks.length > 0 ? (
                    task.subtasks.map((subtask) => (
                      <div key={subtask.id} className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 hover:border-primary/30 transition-colors">
                        <div className={`size-2 rounded-full ${subtask.status === 'DONE' ? 'bg-success' : 'bg-zinc-300'}`} />
                        <span className={`text-sm flex-1 ${subtask.status === 'DONE' ? 'line-through text-zinc-400' : ''}`}>
                          {subtask.title}
                        </span>
                        <div className="flex items-center gap-2">
                          <img src={subtask.assignee?.image} className="size-4 rounded-full" alt="" />
                          <span className="text-[10px] text-zinc-500 uppercase">{subtask.priority}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-zinc-400 italic text-center py-2">No subtasks yet.</p>
                  )}
                </div>
              </section>

              {/* Dependencies */}
              <section className="space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2">
                  <div className="flex items-center gap-2">
                    <Link className="size-4 text-zinc-400" />
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Dependencies</label>
                  </div>
                  <button 
                    onClick={() => setShowDepSearch(!showDepSearch)}
                    className="flex items-center gap-1 text-[10px] font-bold text-primary hover:underline"
                  >
                    <ListPlus className="size-3" />
                    LINK TASK
                  </button>
                </div>

                {showDepSearch && (
                  <div className="space-y-2 animate-fade-in">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-zinc-400" />
                      <input 
                        type="text"
                        value={depQuery}
                        onChange={(e) => setDepQuery(e.target.value)}
                        placeholder="Search tasks to link..."
                        className="w-full bg-zinc-100 dark:bg-zinc-800 border-none rounded-lg py-2 pl-9 pr-4 text-xs focus:ring-2 focus:ring-primary/20"
                        autoFocus
                      />
                    </div>
                    {depQuery && (
                      <div className="max-h-40 overflow-y-auto bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-xl">
                        {filteredOtherTasks.length > 0 ? (
                          filteredOtherTasks.map(t => (
                            <button 
                              key={t.id}
                              onClick={() => handleAddDependency(t.id)}
                              className="w-full text-left px-4 py-2 text-xs hover:bg-zinc-50 dark:hover:bg-zinc-800 flex justify-between items-center group"
                            >
                              <span>{t.title}</span>
                              <Link className="size-3 opacity-0 group-hover:opacity-100 text-primary" />
                            </button>
                          ))
                        ) : (
                          <div className="px-4 py-2 text-xs text-zinc-500 italic">No tasks found</div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  {task.dependsOn && task.dependsOn.length > 0 ? (
                    task.dependsOn.map((dep) => (
                      <div key={dep.id} className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 group transition-all">
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-0.5">Blocked by</p>
                          <p className="text-sm font-medium truncate">{dep.title}</p>
                        </div>
                        <button 
                          onClick={() => handleRemoveDependency(dep.id)}
                          className="p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-all"
                          title="Remove dependency"
                        >
                          <Link2Off className="size-4" />
                        </button>
                      </div>
                    ))
                  ) : !showDepSearch && (
                    <p className="text-xs text-zinc-400 italic text-center py-2">This task has no dependencies.</p>
                  )}
                </div>
              </section>

              {/* Attachments & Rich Media */}
              <section className="space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2">
                  <div className="flex items-center gap-2">
                    <Image className="size-4 text-zinc-400" />
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Attachments</label>
                  </div>
                  <button 
                    onClick={() => {
                        const url = prompt("Enter Image/Video URL (Mock Upload):");
                        if (url) {
                            toast.success("Attachment linked successfully!");
                            // In a real app, this would be an API call to save the attachment record.
                        }
                    }}
                    className="flex items-center gap-1 text-[10px] font-bold text-primary hover:underline"
                  >
                    <Plus className="size-3" />
                    UPLOAD
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {task.attachments?.map((att) => (
                    <div key={att.id} className="group relative aspect-video rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-zinc-100 dark:bg-zinc-900">
                        {att.type === 'IMAGE' ? (
                            <img src={att.url} className="w-full h-full object-cover" alt="" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <Video className="size-6 text-zinc-500" />
                            </div>
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white">
                                <Download className="size-4" />
                            </button>
                        </div>
                    </div>
                  ))}
                  {(!task.attachments || task.attachments.length === 0) && (
                    <div className="col-span-2 py-4 flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-800/20 border-2 border-dashed border-zinc-100 dark:border-zinc-800 rounded-2xl">
                        <Image className="size-6 text-zinc-300 mb-2" />
                        <p className="text-[10px] text-zinc-400 uppercase tracking-widest">No screenshots yet</p>
                    </div>
                  )}
                </div>
              </section>

              {/* Discussion */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2">
                  <MessageCircle className="size-4 text-zinc-400" />
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Discussion</label>
                </div>

                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                      <img src={comment.user.image} className="size-8 rounded-full shadow-sm" alt="" />
                      <div className="flex-1 space-y-1">
                        <div className="flex items-baseline justify-between">
                          <span className="text-xs font-bold">{comment.user.name}</span>
                          <span className="text-[10px] text-zinc-400">{format(new Date(comment.createdAt), "MMM d, HH:mm")}</span>
                        </div>
                        <div className="prose prose-sm dark:prose-invert max-w-none text-sm text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800/60 p-3 rounded-2xl rounded-tl-none">
                          <ReactMarkdown>
                            {comment.content}
                          </ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* New Comment Input */}
                <div className="mt-6 flex gap-2 items-start bg-white dark:bg-zinc-900 sticky bottom-0 py-4 border-t border-zinc-200 dark:border-zinc-800">
                  <img src={user?.imageUrl} className="size-8 rounded-full" alt="" />
                  <div className="flex-1 relative">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Ask a question or post an update..."
                      className="w-full bg-zinc-100 dark:bg-zinc-800 border-none rounded-xl p-3 pr-12 text-sm focus:ring-2 focus:ring-primary/20 resize-none no-scrollbar"
                      rows={2}
                    />
                    <button 
                      onClick={handleAddComment}
                      disabled={!newComment.trim()}
                      className="absolute right-2 bottom-2 p-2 rounded-lg bg-primary text-white disabled:opacity-50 disabled:grayscale transition-all hover:scale-105 active:scale-95"
                    >
                      <Send className="size-4" />
                    </button>
                  </div>
                </div>
              </section>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-zinc-500">
            <AlertCircle className="size-12 mb-2 opacity-20" />
            <p>{taskId ? "Task not found" : "Select a task to view details"}</p>
          </div>
        )}
      </div>

      {showCreateSubtask && (
        <CreateTaskDialog 
          showCreateTask={showCreateSubtask}
          setShowCreateTask={setShowCreateSubtask}
          projectId={projectId}
          parentId={taskId}
        />
      )}
    </div>
  );
}
