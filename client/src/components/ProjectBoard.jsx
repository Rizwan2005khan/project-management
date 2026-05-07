import { useState, useEffect } from "react";
import { 
  DndContext, 
  DragOverlay, 
  closestCorners, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  defaultDropAnimationSideEffects
} from "@dnd-kit/core";
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy 
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useDispatch } from "react-redux";
import { updateTask } from "../features/workspaceSlice";
import api from "../configs/api";
import { useAuth } from "@clerk/clerk-react";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { Bug, CalendarIcon, GitCommit, MessageSquare, Square, Zap, MoreVertical, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

const typeIcons = {
  BUG: { icon: Bug, color: "text-red-500" },
  FEATURE: { icon: Zap, color: "text-blue-500" },
  TASK: { icon: Square, color: "text-green-500" },
  IMPROVEMENT: { icon: GitCommit, color: "text-purple-500" },
  OTHER: { icon: MessageSquare, color: "text-amber-500" },
};

const priorityColors = {
  LOW: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  MEDIUM: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
  HIGH: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
};

// --- Sortable Task Item ---
const SortableTask = ({ task, onClick }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const { icon: Icon, color } = typeIcons[task.type] || {};

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onClick(task.id)}
      className="group bg-white dark:bg-zinc-800/50 p-4 rounded-xl border border-zinc-200 dark:border-zinc-700/50 shadow-sm hover:shadow-md hover:border-primary/30 transition-all cursor-grab active:cursor-grabbing mb-3 animate-fade-in"
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          {Icon && <Icon className={`size-3.5 ${color}`} />}
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">{task.type}</span>
        </div>
        <button className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-opacity">
          <MoreVertical className="size-3.5 text-zinc-400" />
        </button>
      </div>
      
      <h4 className="text-sm font-medium text-zinc-800 dark:text-zinc-200 mb-3 line-clamp-2">
        {task.title}
      </h4>

      <div className="flex items-center justify-between mt-auto">
        <div className="flex items-center gap-2">
          {task.assignee?.image ? (
            <img src={task.assignee.image} className="size-6 rounded-full border border-zinc-200 dark:border-zinc-700" alt="avatar" />
          ) : (
            <div className="size-6 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-[10px]">?</div>
          )}
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${priorityColors[task.priority]}`}>
            {task.priority}
          </span>
        </div>
        
        <div className="flex items-center gap-1 text-[10px] text-zinc-500">
          <CalendarIcon className="size-3" />
          {format(new Date(task.due_date), "MMM d")}
        </div>
      </div>
    </div>
  );
};

// --- Board Column ---
const BoardColumn = ({ title, status, tasks, onAddTask, onTaskClick }) => {
  return (
    <div className="flex flex-col w-80 min-w-[20rem] h-full bg-zinc-100/50 dark:bg-zinc-900/20 rounded-2xl p-3 border border-zinc-200/50 dark:border-zinc-800/50">
      <div className="flex items-center justify-between px-2 mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 capitalize">
            {title}
          </h3>
          <span className="flex items-center justify-center size-5 text-[10px] font-bold bg-zinc-200 dark:bg-zinc-800 text-zinc-500 rounded-full">
            {tasks.length}
          </span>
        </div>
        <button 
          onClick={onAddTask}
          className="p-1 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500 transition-colors"
        >
          <Plus className="size-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-4">
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <SortableTask key={task.id} task={task} onClick={onTaskClick} />
          ))}
        </SortableContext>
        
        {tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
            <p className="text-xs text-zinc-400">No tasks here</p>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Main Board Component ---
export default function ProjectBoard({ tasks, onAddTask, onTaskClick }) {
  const { getToken } = useAuth();
  const dispatch = useDispatch();
  const [activeTask, setActiveTask] = useState(null);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const columns = [
    { id: "TODO", title: "To Do" },
    { id: "IN_PROGRESS", title: "In Progress" },
    { id: "DONE", title: "Done" },
  ];

  const handleDragStart = (event) => {
    const { active } = event;
    const task = tasks.find((t) => t.id === active.id);
    setActiveTask(task);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    // Check if we dropped onto a column or a task
    let newStatus = overId;
    if (!columns.find(c => c.id === overId)) {
        // Dropped over a task, get that task's status
        const overTask = tasks.find(t => t.id === overId);
        newStatus = overTask?.status;
    }

    const task = tasks.find((t) => t.id === activeId);
    
    if (task && task.status !== newStatus) {
      try {
        const token = await getToken();
        await api.put(`/api/tasks/${activeId}`, { status: newStatus }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const updatedTask = { ...task, status: newStatus };
        dispatch(updateTask(updatedTask));
        toast.success(`Task moved to ${newStatus.replace('_', ' ')}`);
      } catch (error) {
        toast.error("Failed to move task");
      }
    }
  };

  return (
    <div className="h-[calc(100vh-250px)] overflow-x-auto no-scrollbar">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-6 h-full pb-4">
          {columns.map((col) => (
            <BoardColumn
              key={col.id}
              title={col.title}
              status={col.id}
              tasks={tasks.filter((t) => t.status === col.id)}
              onAddTask={() => onAddTask(col.id)}
              onTaskClick={onTaskClick}
            />
          ))}
        </div>

        <DragOverlay dropAnimation={{
          sideEffects: defaultDropAnimationSideEffects({
            styles: {
              active: {
                opacity: '0.5',
              },
            },
          }),
        }}>
          {activeTask ? <SortableTask task={activeTask} onClick={onTaskClick} /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
