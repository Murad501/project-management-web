import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import api from "../api";
import Button from "../components/Button";
import Input from "../components/Input";
import TextArea from "../components/TextArea";
import Modal from "../components/Modal";
import Badge from "../components/Badge";
import {
  FiPlus,
  FiCalendar,
  FiEdit,
  FiTrash2,
  FiMessageSquare,
  FiUserPlus,
  FiUserMinus,
  FiClock,
  FiArrowLeft,
  FiInfo,
  FiPlay,
  FiCheck,
} from "react-icons/fi";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";

let tempIdCounter = 0;

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface Project {
  _id: string;
  name: string;
  description: string;
  deadline: string;
  previousDeadlines: string[];
  status: string;
  createdBy: User;
  createdAt: string;
}

interface Task {
  _id: string;
  title: string;
  description: string;
  assignedMember: string | User | null; 
  dueDate: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  status: "TODO" | "IN_PROGRESS" | "COMPLETED";
}

interface Comment {
  _id: string;
  content: string;
  userId: User;
  createdAt: string;
}

export default function ProjectDetails() {
  const { id } = useParams<{ id: string }>();
  const user = useSelector((state: RootState) => state.auth.user);

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<User[]>([]);
  const [allSystemUsers, setAllSystemUsers] = useState<User[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isEditTaskOpen, setIsEditTaskOpen] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isTaskDetailOpen, setIsTaskDetailOpen] = useState(false);

  
  const [isSubmittingMember, setIsSubmittingMember] = useState(false);
  const [isSubmittingTask, setIsSubmittingTask] = useState(false);
  const [isSubmittingTaskEdit, setIsSubmittingTaskEdit] = useState(false);

  
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);

  
  interface TaskFormValues {
    title: string;
    description: string;
    assignedMember: string;
    dueDate: string;
    priority: "HIGH" | "MEDIUM" | "LOW";
    status: "TODO" | "IN_PROGRESS" | "COMPLETED";
  }

  interface AddMemberFormValues {
    userId: string;
  }

  interface AddCommentFormValues {
    content: string;
  }

  
  const {
    register: registerCreateTask,
    handleSubmit: handleSubmitCreateTask,
    reset: resetCreateTask,
    formState: { errors: errorsCreateTask },
  } = useForm<TaskFormValues>({
    defaultValues: {
      title: "",
      description: "",
      assignedMember: "",
      dueDate: "",
      priority: "MEDIUM",
      status: "TODO",
    },
  });

  
  const {
    register: registerEditTask,
    handleSubmit: handleSubmitEditTask,
    reset: resetEditTask,
    formState: { errors: errorsEditTask },
  } = useForm<TaskFormValues>({
    defaultValues: {
      title: "",
      description: "",
      assignedMember: "",
      dueDate: "",
      priority: "MEDIUM",
      status: "TODO",
    },
  });

  
  const {
    register: registerAddMember,
    handleSubmit: handleSubmitAddMember,
    reset: resetAddMember,
    formState: { errors: errorsAddMember },
  } = useForm<AddMemberFormValues>({
    defaultValues: {
      userId: "",
    },
  });

  
  const {
    register: registerAddComment,
    handleSubmit: handleSubmitAddComment,
    reset: resetAddComment,
  } = useForm<AddCommentFormValues>({
    defaultValues: {
      content: "",
    },
  });

  const isManagerOrAdmin =
    user?.role === "admin" || user?.role === "project_manager";

  const fetchProjectDetails = async () => {
    try {
      const projectRes = await api.get(`/projects/${id}`);
      setProject(projectRes.data.data);

      const tasksRes = await api.get(`/projects/${id}/tasks`);
      setTasks(tasksRes.data.data.data || []);

      const membersRes = await api.get(`/projects/${id}/members`);
      setMembers(membersRes.data.data.data);
    } catch {
      console.error("Failed to load project details");
      toast.error("Failed to load project details");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const response = await api.get("/user");
      setAllSystemUsers(response.data.data);
    } catch {
      console.error("Failed to fetch all users");
    }
  };

  useEffect(() => {
    
    fetchProjectDetails();
    if (isManagerOrAdmin) {
      fetchAllUsers();
    }
    
  }, [id]);

  useEffect(() => {
    if (project?.name) {
      document.title = `${project.name} | Project Manager`;
    }
  }, [project?.name]);

  
  const fetchComments = async (taskId: string) => {
    try {
      const response = await api.get(
        `/projects/${id}/tasks/${taskId}/comments`,
      );
      setComments(response.data.data);
    } catch {
      console.error("Failed to load comments");
    }
  };

  const openTaskDetail = (task: Task) => {
    setActiveTask(task);
    setComments([]);
    setIsTaskDetailOpen(true);
    fetchComments(task._id);
  };

  const handleAddComment = async (data: AddCommentFormValues) => {
    if (!activeTask || !data.content.trim()) return;

    const newCommentContent = data.content;
    resetAddComment();

    
    const prevComments = [...comments];
    const tempComment: Comment = {
      _id: `temp-comment-${++tempIdCounter}`,
      content: newCommentContent,
      createdAt: new Date().toISOString(),
      userId: {
        _id: user?._id || "",
        name: user?.name || "Me",
        email: user?.email || "",
        role: user?.role || "",
      },
    };
    setComments((prev) => [...prev, tempComment]);

    try {
      await api.post(`/projects/${id}/tasks/${activeTask._id}/comments`, {
        content: newCommentContent,
      });
      fetchComments(activeTask._id);
    } catch {
      setComments(prevComments);
      toast.error("Failed to add comment");
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!activeTask) return;
    const prevComments = [...comments];
    setComments((prev) => prev.filter((c) => c._id !== commentId));

    try {
      await api.delete(
        `/projects/${id}/tasks/${activeTask._id}/comments/${commentId}`,
      );
    } catch {
      setComments(prevComments);
      toast.error("Failed to delete comment");
    }
  };

  const handleCreateTask = async (data: TaskFormValues) => {
    setIsSubmittingTask(true);
    try {
      await api.post(`/projects/${id}/tasks`, {
        title: data.title,
        description: data.description,
        assignedMember: data.assignedMember || null,
        dueDate: new Date(data.dueDate),
        priority: data.priority,
        status: "TODO",
      });
      toast.success("Task created successfully");
      setIsTaskModalOpen(false);
      resetCreateTask();
      await fetchProjectDetails();
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to create task");
    } finally {
      setIsSubmittingTask(false);
    }
  };

  const openEditTaskModal = (task: Task, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveTask(task);
    const memberId =
      task.assignedMember && typeof task.assignedMember === "object"
        ? (task.assignedMember as User)._id
        : (task.assignedMember as string) || "";

    const d = new Date(task.dueDate);
    resetEditTask({
      title: task.title,
      description: task.description,
      assignedMember: memberId,
      dueDate: d.toISOString().slice(0, 16),
      priority: task.priority,
      status: task.status,
    });
    setIsEditTaskOpen(true);
  };

  const handleUpdateTask = async (data: TaskFormValues) => {
    if (!activeTask) return;

    setIsSubmittingTaskEdit(true);

    const prevTasks = [...tasks];
    setTasks((prev) =>
      prev.map((t) => {
        if (t._id === activeTask._id) {
          const selectedMemberObj = members.find((m) => m._id === data.assignedMember) || null;
          return {
            ...t,
            title: data.title,
            description: data.description,
            assignedMember: selectedMemberObj,
            dueDate: new Date(data.dueDate).toISOString(),
            priority: data.priority,
            status: data.status,
          };
        }
        return t;
      })
    );

    try {
      await api.put(`/projects/${id}/tasks/${activeTask._id}`, {
        title: data.title,
        description: data.description,
        assignedMember: data.assignedMember || null,
        dueDate: new Date(data.dueDate),
        priority: data.priority,
        status: data.status,
      });
      toast.success("Task updated successfully");
      setIsEditTaskOpen(false);
      resetEditTask();
      await fetchProjectDetails();
    } catch (error) {
      setTasks(prevTasks);
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to update task");
    } finally {
      setIsSubmittingTaskEdit(false);
    }
  };

  const handleStatusChange = async (task: Task, newStatus: Task["status"]) => {
    const prevTasks = [...tasks];
    setTasks((prev) =>
      prev.map((t) => (t._id === task._id ? { ...t, status: newStatus } : t))
    );

    try {
      const memberId =
        task.assignedMember && typeof task.assignedMember === "object"
          ? (task.assignedMember as User)._id
          : (task.assignedMember as string) || null;

      await api.put(`/projects/${id}/tasks/${task._id}`, {
        title: task.title,
        description: task.description,
        assignedMember: memberId,
        dueDate: task.dueDate,
        priority: task.priority,
        status: newStatus,
      });
      fetchProjectDetails();
    } catch {
      setTasks(prevTasks);
      toast.error("Failed to update task status");
    }
  };

  const handleDeleteTask = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    Swal.fire({
      title: "Delete Task?",
      text: "Are you sure you want to delete this task? This action is permanent.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete task",
    }).then(async (result) => {
      if (result.isConfirmed) {
        const prevTasks = [...tasks];
        setTasks((prev) => prev.filter((t) => t._id !== taskId));
        try {
          await api.delete(`/projects/${id}/tasks/${taskId}`);
          toast.success("Task deleted");
          fetchProjectDetails();
        } catch {
          setTasks(prevTasks);
          toast.error("Failed to delete task");
        }
      }
    });
  };

  const handleAddMember = async (data: AddMemberFormValues) => {
    setIsSubmittingMember(true);
    try {
      await api.post(`/projects/${id}/members`, { userId: data.userId });
      toast.success("Team member added to project!");
      setIsAddMemberOpen(false);
      resetAddMember();
      await fetchProjectDetails();
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to add team member");
    } finally {
      setIsSubmittingMember(false);
    }
  };

  const handleRemoveMember = (userId: string, memberName: string) => {
    Swal.fire({
      title: "Remove Team Member?",
      text: `Are you sure you want to remove ${memberName} from this project?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Remove",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.delete(`/projects/${id}/members/${userId}`);
          toast.success("Member removed from project");
          fetchProjectDetails();
        } catch (error) {
          const err = error as { response?: { data?: { message?: string } } };
          toast.error(err.response?.data?.message || "Failed to remove member");
        }
      }
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        
        <div className="bg-surface border border-border-main p-6 rounded-2xl space-y-6">
          <div className="space-y-3">
            <div className="h-7 w-1/3 bg-canvas rounded-lg" />
            <div className="h-4 w-2/3 bg-canvas rounded-lg" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-24 bg-canvas rounded-lg" />
            <div className="flex gap-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-8 w-24 bg-canvas rounded-full" />
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-4 w-32 bg-canvas rounded-lg" />
            <div className="h-2 w-full bg-canvas rounded-full" />
          </div>
        </div>

        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
          {[...Array(4)].map((_, colIdx) => (
            <div key={colIdx} className="bg-surface/50 border border-border-main/50 p-4 rounded-2xl space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-border-main/40">
                <div className="h-5 w-24 bg-canvas rounded-lg" />
                <div className="h-5 w-5 bg-canvas rounded-lg" />
              </div>
              {[...Array(colIdx === 0 ? 2 : 1)].map((_, cardIdx) => (
                <div key={cardIdx} className="bg-surface border border-border-main p-4 rounded-xl space-y-3">
                  <div className="h-4 w-12 bg-canvas rounded-md" />
                  <div className="h-5 w-full bg-canvas rounded-md" />
                  <div className="h-3 w-5/6 bg-canvas rounded-md" />
                  <div className="pt-2 flex justify-between items-center">
                    <div className="h-5 w-12 bg-canvas rounded-md" />
                    <div className="h-5 w-5 rounded-full bg-canvas" />
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-16 bg-surface border border-border-main rounded-2xl">
        <p className="text-text-muted">Project not found or access denied.</p>
        <Link
          to="/projects"
          className="text-brand font-bold inline-flex items-center gap-1 mt-4"
        >
          <FiArrowLeft /> Back to projects
        </Link>
      </div>
    );
  }

  
  const todoTasks = tasks.filter((t) => t.status === "TODO");
  const inProgressTasks = tasks.filter((t) => t.status === "IN_PROGRESS");
  const completedTasks = tasks.filter((t) => t.status === "COMPLETED");

  const completionPercentage = tasks.length
    ? Math.round((completedTasks.length / tasks.length) * 100)
    : 0;

  const getMemberName = (assigned: Task["assignedMember"]) => {
    if (!assigned) return "Unassigned";
    if (typeof assigned === "object") return assigned.name;
    
    const found = members.find((m) => m._id === assigned);
    return found ? found.name : "Unassigned";
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      
      <div>
        <Link
          to="/projects"
          className="inline-flex items-center gap-2 text-sm font-semibold text-text-muted hover:text-brand transition-colors cursor-pointer"
        >
          <FiArrowLeft className="h-4 w-4" />
          <span>Back to Projects Directory</span>
        </Link>
      </div>

      
      <div className="bg-surface border border-border-main p-6 md:p-8 rounded-2xl shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h3 className="font-heading font-extrabold text-2xl md:text-3xl text-text-main">
                {project.name}
              </h3>
              <Badge
                variant={
                  project.status === "COMPLETED"
                    ? "success"
                    : project.status === "ON_HOLD"
                      ? "warning"
                      : "brand"
                }
              >
                {project.status}
              </Badge>
            </div>
            <p className="text-text-muted text-sm max-w-3xl leading-relaxed">
              {project.description || "No project description provided."}
            </p>
          </div>

          <div className="bg-canvas border border-border-main p-4 rounded-xl space-y-2 text-sm">
            <div className="flex items-center gap-2 text-text-muted">
              <FiCalendar className="h-4.5 w-4.5 text-brand" />
              <span>Project Deadline:</span>
              <strong className="text-text-main">
                {new Date(project.deadline).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </strong>
            </div>
            <div className="text-xs text-text-muted">
              Created by:{" "}
              <span className="font-bold text-text-main">
                {project.createdBy?.name || "Admin"}
              </span>
            </div>
          </div>
        </div>

        
        <div className="space-y-4.5 pt-4.5 border-t border-border-main/50 text-left">
          
          <div className="space-y-2.5">
            <div className="flex justify-between items-center">
              <span className="font-bold text-text-muted uppercase tracking-wider text-[10px]">
                Team Members ({members.length})
              </span>
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              {members.map((member) => {
                const name = member.name;
                const getAvatarBg = (n: string) => {
                  const charCode = n.charCodeAt(0) || 0;
                  const colors = [
                    "bg-brand/10 text-brand border-brand/20",
                    "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
                    "bg-amber-500/10 text-amber-500 border-amber-500/20",
                    "bg-rose-500/10 text-rose-500 border-rose-500/20",
                    "bg-sky-500/10 text-sky-500 border-sky-500/20",
                    "bg-violet-500/10 text-violet-500 border-violet-500/20",
                  ];
                  return colors[charCode % colors.length];
                };
                return (
                  <div
                    key={member._id}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold ${getAvatarBg(name)} transition-all duration-200 hover:-translate-y-0.5`}
                  >
                    <span className="h-2 w-2 rounded-full bg-current opacity-70" />
                    <span>{name}</span>
                    <span className="text-[10px] opacity-60 capitalize font-normal">
                      ({member.role})
                    </span>
                    {isManagerOrAdmin &&
                      member._id !== project.createdBy?._id && (
                        <button
                          onClick={() => handleRemoveMember(member._id, name)}
                          className="ml-1 text-red-500 hover:text-red-700 hover:bg-red-500/10 rounded-full p-0.5 transition-colors cursor-pointer"
                          title="Remove Member"
                        >
                          <FiUserMinus className="h-3.5 w-3.5" />
                        </button>
                      )}
                  </div>
                );
              })}
              {isManagerOrAdmin && (
                <button
                  onClick={() => setIsAddMemberOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-dashed border-border-main hover:border-brand hover:text-brand text-xs font-semibold text-text-muted transition-colors cursor-pointer"
                >
                  <FiUserPlus className="h-3.5 w-3.5" />
                  <span>Add Member</span>
                </button>
              )}
            </div>
          </div>

          
          <div className="space-y-2 pt-2 border-t border-border-main/30">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-text-muted uppercase tracking-wider text-[10px]">
                Project Completion Progress
              </span>
              <span className="font-extrabold text-brand text-sm">
                {completionPercentage}% ({completedTasks.length}/{tasks.length}{" "}
                Tasks)
              </span>
            </div>
            <div className="w-full bg-canvas rounded-full h-3 overflow-hidden border border-border-main/50">
              <div
                className="bg-brand h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
        </div>

        
        {project.previousDeadlines && project.previousDeadlines.length > 0 && (
          <div className="bg-canvas/40 border border-border-main p-4 rounded-xl space-y-3">
            <p className="text-xs font-bold text-text-main uppercase tracking-wider flex items-center gap-1.5">
              <FiInfo className="h-4 w-4 text-brand" /> Schedule Rescheduling
              Log
            </p>
            <div className="flex flex-wrap gap-2 text-xs">
              {project.previousDeadlines.map((dateStr, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-1.5 px-2.5 py-1 bg-surface border border-border-main rounded-md text-text-muted"
                >
                  <span className="line-through">
                    {new Date(dateStr).toLocaleDateString()}
                  </span>
                  <span>→</span>
                  {idx === project.previousDeadlines.length - 1 ? (
                    <span className="text-brand font-bold">
                      {new Date(project.deadline).toLocaleDateString()}
                    </span>
                  ) : (
                    <span>
                      {new Date(
                        project.previousDeadlines[idx + 1],
                      ).toLocaleDateString()}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h4 className="font-heading font-extrabold text-xl text-text-main">
            Project Work Board
          </h4>
          {isManagerOrAdmin && (
            <Button
              onClick={() => setIsTaskModalOpen(true)}
              className="flex items-center gap-2 shadow-md"
            >
              <FiPlus className="h-4 w-4" />
              <span>New Task</span>
            </Button>
          )}
        </div>

        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
          
          <div className="bg-canvas border border-border-main p-4 rounded-2xl flex flex-col space-y-4 h-fit">
            <div className="flex items-center justify-between border-b border-border-main pb-2">
              <span className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-slate-400" /> To Do
              </span>
              <Badge variant="neutral">{todoTasks.length}</Badge>
            </div>

            <div className="space-y-3 mt-2">
              {todoTasks.map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  onClick={() => openTaskDetail(task)}
                  onEdit={(e) => openEditTaskModal(task, e)}
                  onDelete={(e) => handleDeleteTask(task._id, e)}
                  onMove={(status) => handleStatusChange(task, status)}
                  isManagerOrAdmin={isManagerOrAdmin}
                  getMemberName={getMemberName}
                />
              ))}
            </div>
          </div>

          
          <div className="bg-canvas border border-border-main p-4 rounded-2xl flex flex-col space-y-4 h-fit">
            <div className="flex items-center justify-between border-b border-border-main pb-2">
              <span className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-brand" /> In Progress
              </span>
              <Badge variant="brand">{inProgressTasks.length}</Badge>
            </div>

            <div className="space-y-3 mt-2">
              {inProgressTasks.map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  onClick={() => openTaskDetail(task)}
                  onEdit={(e) => openEditTaskModal(task, e)}
                  onDelete={(e) => handleDeleteTask(task._id, e)}
                  onMove={(status) => handleStatusChange(task, status)}
                  isManagerOrAdmin={isManagerOrAdmin}
                  getMemberName={getMemberName}
                />
              ))}
            </div>
          </div>

          
          <div className="bg-canvas border border-border-main p-4 rounded-2xl flex flex-col space-y-4 h-fit">
            <div className="flex items-center justify-between border-b border-border-main pb-2">
              <span className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />{" "}
                Completed
              </span>
              <Badge variant="success">{completedTasks.length}</Badge>
            </div>

            <div className="space-y-3 mt-2">
              {completedTasks.map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  onClick={() => openTaskDetail(task)}
                  onEdit={(e) => openEditTaskModal(task, e)}
                  onDelete={(e) => handleDeleteTask(task._id, e)}
                  onMove={(status) => handleStatusChange(task, status)}
                  isManagerOrAdmin={isManagerOrAdmin}
                  getMemberName={getMemberName}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      
      <Modal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          resetCreateTask();
        }}
        title="Create New Task"
      >
        <form
          onSubmit={handleSubmitCreateTask(handleCreateTask)}
          className="space-y-4"
        >
          <Input
            label="Task Title"
            placeholder="e.g. Implement Oauth"
            {...registerCreateTask("title", {
              required: "Task title is required",
            })}
            error={errorsCreateTask.title?.message}
          />
          <TextArea
            label="Description"
            placeholder="Describe the task specifications..."
            {...registerCreateTask("description")}
            error={errorsCreateTask.description?.message}
            rows={3}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                Assignee
              </label>
              <select
                {...registerCreateTask("assignedMember")}
                className="w-full px-3.5 py-2.5 rounded-lg border border-border-main bg-surface text-text-main text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
              >
                <option value="">Unassigned</option>
                {members.map((member) => (
                  <option key={member._id} value={member._id}>
                    {member.name} ({member.role})
                  </option>
                ))}
              </select>
            </div>
            <Input
              label="Due Date"
              type="datetime-local"
              {...registerCreateTask("dueDate", {
                required: "Due date is required",
              })}
              error={errorsCreateTask.dueDate?.message}
            />
          </div>
          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              Priority Level
            </label>
            <select
              {...registerCreateTask("priority", {
                required: "Priority level is required",
              })}
              className="w-full px-3.5 py-2.5 rounded-lg border border-border-main bg-surface text-text-main text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
            >
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmittingTask}
              onClick={() => {
                setIsTaskModalOpen(false);
                resetCreateTask();
              }}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmittingTask}>
              Create Task
            </Button>
          </div>
        </form>
      </Modal>

      
      <Modal
        isOpen={isEditTaskOpen}
        onClose={() => {
          setIsEditTaskOpen(false);
          resetEditTask();
        }}
        title="Edit Task Details"
      >
        <form
          onSubmit={handleSubmitEditTask(handleUpdateTask)}
          className="space-y-4"
        >
          <Input
            label="Task Title"
            {...registerEditTask("title", {
              required: "Task title is required",
            })}
            error={errorsEditTask.title?.message}
          />
          <TextArea
            label="Description"
            {...registerEditTask("description")}
            error={errorsEditTask.description?.message}
            rows={3}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                Assignee
              </label>
              <select
                {...registerEditTask("assignedMember")}
                className="w-full px-3.5 py-2.5 rounded-lg border border-border-main bg-surface text-text-main text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
              >
                <option value="">Unassigned</option>
                {members.map((member) => (
                  <option key={member._id} value={member._id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>
            <Input
              label="Due Date"
              type="datetime-local"
              {...registerEditTask("dueDate", {
                required: "Due date is required",
              })}
              error={errorsEditTask.dueDate?.message}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                Priority Level
              </label>
              <select
                {...registerEditTask("priority", {
                  required: "Priority level is required",
                })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-border-main bg-surface text-text-main text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
              >
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                Task Status
              </label>
              <select
                {...registerEditTask("status", {
                  required: "Status is required",
                })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-border-main bg-surface text-text-main text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
              >
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmittingTaskEdit}
              onClick={() => {
                setIsEditTaskOpen(false);
                resetEditTask();
              }}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmittingTaskEdit}>
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      
      <Modal
        isOpen={isAddMemberOpen}
        onClose={() => {
          setIsAddMemberOpen(false);
          resetAddMember();
        }}
        title="Add Team Member"
      >
        <form
          onSubmit={handleSubmitAddMember(handleAddMember)}
          className="space-y-4"
        >
          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              Select User
            </label>
            <select
              {...registerAddMember("userId", {
                required: "Please select a user",
              })}
              disabled={isSubmittingMember}
              className="w-full px-3.5 py-2.5 rounded-lg border border-border-main bg-surface text-text-main text-sm focus:outline-none focus:ring-2 focus:ring-brand/40 cursor-pointer disabled:opacity-50"
            >
              <option value="">-- Choose User --</option>
              {allSystemUsers
                .filter((u) => !members.some((m) => m._id === u._id))
                .map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.name} ({u.email}) - {u.role}
                  </option>
                ))}
            </select>
            {errorsAddMember.userId?.message && (
              <span className="text-xs text-red-500">
                {errorsAddMember.userId.message}
              </span>
            )}
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmittingMember}
              onClick={() => {
                setIsAddMemberOpen(false);
                resetAddMember();
              }}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmittingMember}>
              Add to Project
            </Button>
          </div>
        </form>
      </Modal>

      
      <Modal
        isOpen={isTaskDetailOpen}
        onClose={() => {
          setIsTaskDetailOpen(false);
          setActiveTask(null);
          resetAddComment();
        }}
        title="Task Operations & Activity"
      >
        {activeTask && (
          <div className="space-y-6">
            
            <div className="bg-canvas border border-border-main p-4 rounded-xl space-y-3.5 text-sm">
              <h4 className="font-heading font-extrabold text-lg text-text-main leading-tight">
                {activeTask.title}
              </h4>
              <p className="text-text-muted leading-relaxed text-xs">
                {activeTask.description || "No description provided."}
              </p>
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border-main/50 text-xs">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-text-muted">
                    Assignee
                  </span>
                  <p className="font-bold text-text-main">
                    {getMemberName(activeTask.assignedMember)}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-text-muted">
                    Due Date
                  </span>
                  <p className="font-bold text-text-main">
                    {new Date(activeTask.dueDate).toLocaleString()}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-text-muted">
                    Priority
                  </span>
                  <div>
                    <Badge
                      variant={
                        activeTask.priority === "HIGH"
                          ? "danger"
                          : activeTask.priority === "MEDIUM"
                            ? "warning"
                            : "neutral"
                      }
                    >
                      {activeTask.priority}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-text-muted">
                    Status
                  </span>
                  <div>
                    <Badge
                      variant={
                        activeTask.status === "COMPLETED"
                          ? "success"
                          : activeTask.status === "IN_PROGRESS"
                            ? "brand"
                            : "neutral"
                      }
                    >
                      {activeTask.status.replace("_", " ")}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            
            <div className="space-y-4">
              <h5 className="font-heading font-bold text-sm text-text-main flex items-center gap-2 pb-2 border-b border-border-main">
                <FiMessageSquare className="h-4.5 w-4.5 text-brand" /> Comments
                & Discussions ({comments.length})
              </h5>

              
              <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                {comments.length === 0 ? (
                  <p className="text-xs text-text-muted text-center py-4">
                    No comments posted yet.
                  </p>
                ) : (
                  comments.map((comment) => (
                    <div
                      key={comment._id}
                      className="bg-canvas border border-border-main/50 p-3 rounded-lg flex justify-between items-start gap-2 text-xs"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-text-main">
                            {comment.userId?.name || "Deleted User"}
                          </span>
                          <span className="text-[10px] text-text-muted">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-text-main leading-normal break-words">
                          {comment.content}
                        </p>
                      </div>

                      {user &&
                        comment.userId &&
                        user.email === comment.userId.email && (
                          <button
                            onClick={() => handleDeleteComment(comment._id)}
                            className="p-1 text-red-500 hover:bg-red-500/10 rounded transition-colors shrink-0 cursor-pointer"
                            title="Delete Comment"
                          >
                            <FiTrash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                    </div>
                  ))
                )}
              </div>

              
              <form
                onSubmit={handleSubmitAddComment(handleAddComment)}
                className="flex gap-2"
              >
                <input
                  type="text"
                  placeholder="Ask a question or provide progress update..."
                  {...registerAddComment("content", { required: true })}
                  className="flex-1 px-3 py-2 text-xs rounded-lg border border-border-main bg-canvas text-text-main placeholder-text-muted/60 focus:outline-none focus:ring-1 focus:ring-brand"
                />
                <Button
                  type="submit"
                  size="sm"
                  className="cursor-pointer"
                >
                  Send
                </Button>
              </form>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}


interface TaskCardProps {
  task: Task;
  onClick: () => void;
  onEdit: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
  onMove: (status: Task["status"]) => void;
  isManagerOrAdmin: boolean;
  getMemberName: (assigned: Task["assignedMember"]) => string;
}

function TaskCard({
  task,
  onClick,
  onEdit,
  onDelete,
  onMove,
  isManagerOrAdmin,
  getMemberName,
}: TaskCardProps) {
  const isOverdue =
    new Date(task.dueDate) < new Date() && task.status !== "COMPLETED";
  const name = getMemberName(task.assignedMember);

  const getAvatarBg = (userName: string) => {
    const charCode = userName.charCodeAt(0) || 0;
    const colors = [
      "bg-brand/10 text-brand border-brand/20",
      "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
      "bg-amber-500/10 text-amber-500 border-amber-500/20",
      "bg-rose-500/10 text-rose-500 border-rose-500/20",
      "bg-sky-500/10 text-sky-500 border-sky-500/20",
      "bg-violet-500/10 text-violet-500 border-violet-500/20",
    ];
    return colors[charCode % colors.length];
  };

  return (
    <div
      onClick={onClick}
      className={`bg-surface border border-border-main border-l-4 ${
        task.priority === "HIGH"
          ? "border-l-red-500 hover:border-l-red-400"
          : task.priority === "MEDIUM"
            ? "border-l-amber-500 hover:border-l-amber-400"
            : "border-l-sky-500 hover:border-l-sky-400"
      } p-4.5 rounded-xl shadow-sm hover:shadow-md hover:border-brand/35 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer space-y-3.5 group`}
    >
      <div className="flex justify-between items-center">
        <Badge
          variant={
            task.priority === "HIGH"
              ? "danger"
              : task.priority === "MEDIUM"
                ? "warning"
                : "info"
          }
          className="scale-90 origin-left uppercase tracking-wider font-extrabold"
        >
          {task.priority}
        </Badge>

        {isManagerOrAdmin && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={onEdit}
              className="p-1 rounded-md text-text-muted hover:bg-canvas hover:text-text-main transition-colors cursor-pointer"
              title="Edit Task"
            >
              <FiEdit className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={onDelete}
              className="p-1 rounded-md text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
              title="Delete Task"
            >
              <FiTrash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      <div className="space-y-1.5 text-left">
        <h5 className="font-bold text-sm text-text-main leading-snug break-words group-hover:text-brand transition-colors">
          {task.title}
        </h5>
        <p className="text-text-muted text-xs line-clamp-2 leading-relaxed">
          {task.description || "No description provided."}
        </p>
      </div>

      <div className="pt-3 border-t border-border-main/50 flex flex-col gap-2.5">
        <div className="flex justify-between items-center text-[10px] text-text-muted">
          <div className="flex items-center gap-1.5 truncate max-w-[65%]">
            <div
              className={`h-5 w-5 rounded-full border flex items-center justify-center font-extrabold text-[9px] ${getAvatarBg(name)}`}
            >
              {name.charAt(0).toUpperCase()}
            </div>
            <span className="truncate font-semibold text-text-main">
              {name}
            </span>
          </div>

          <span
            className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-canvas border border-border-main/50 ${isOverdue ? "text-red-500 font-bold border-red-500/25 bg-red-500/5 animate-pulse" : ""}`}
          >
            <FiClock className="h-3 w-3" />
            {new Date(task.dueDate).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>

        
        <div
          className="flex justify-end gap-1.5 pt-1"
          onClick={(e) => e.stopPropagation()}
        >
          {task.status !== "TODO" && (
            <button
              onClick={() => onMove("TODO")}
              className="px-2.5 py-1 text-[9px] font-bold border border-border-main bg-canvas hover:bg-surface rounded-full text-text-muted hover:text-text-main flex items-center gap-1 transition-all duration-200 cursor-pointer"
            >
              <FiArrowLeft className="h-2.5 w-2.5" /> To Do
            </button>
          )}
          {task.status !== "IN_PROGRESS" && (
            <button
              onClick={() => onMove("IN_PROGRESS")}
              className="px-2.5 py-1 text-[9px] font-bold border border-brand/20 bg-brand/5 text-brand hover:bg-brand/10 hover:border-brand/40 rounded-full flex items-center gap-1 transition-all duration-200 cursor-pointer"
            >
              <FiPlay className="h-2.5 w-2.5" /> Start
            </button>
          )}
          {task.status !== "COMPLETED" && (
            <button
              onClick={() => onMove("COMPLETED")}
              className="px-2.5 py-1 text-[9px] font-bold border border-emerald-500/20 bg-emerald-500/5 text-emerald-500 hover:bg-emerald-500/10 hover:border-emerald-500/40 rounded-full flex items-center gap-1 transition-all duration-200 cursor-pointer"
            >
              <FiCheck className="h-2.5 w-2.5" /> Finish
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
