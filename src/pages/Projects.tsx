import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import api from "../api";
import Button from "../components/Button";
import Input from "../components/Input";
import TextArea from "../components/TextArea";
import Modal from "../components/Modal";
import { useForm } from "react-hook-form";
import {
  FiPlus,
  FiSearch,
  FiEdit,
  FiTrash2,
  FiArrowRight,
  FiCalendar,
} from "react-icons/fi";
import Swal from "sweetalert2";
import toast from "react-hot-toast";

interface Project {
  _id: string;
  id: string;
  name: string;
  description: string;
  deadline: string;
  status: "ACTIVE" | "COMPLETED" | "ON_HOLD";
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export default function Projects() {
  const user = useSelector((state: RootState) => state.auth.user);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [deadlineStatus, setDeadlineStatus] = useState("");
  const [sortBy, setSortBy] = useState("latestCreated");

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Form structures
  interface ProjectFormValues {
    name: string;
    description: string;
    deadline: string;
    status: "ACTIVE" | "COMPLETED" | "ON_HOLD";
  }

  // Create Project Form
  const {
    register: registerCreate,
    handleSubmit: handleSubmitCreate,
    reset: resetCreate,
    formState: { errors: errorsCreate },
  } = useForm<ProjectFormValues>({
    defaultValues: {
      name: "",
      description: "",
      deadline: "",
      status: "ACTIVE",
    },
  });

  // Edit Project Form
  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    reset: resetEdit,
    formState: { errors: errorsEdit },
  } = useForm<ProjectFormValues>({
    defaultValues: {
      name: "",
      description: "",
      deadline: "",
      status: "ACTIVE",
    },
  });


  const isManagerOrAdmin = user?.role === "admin" || user?.role === "project_manager";

  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/projects", {
        params: {
          search,
          status,
          deadlineStatus,
          sortBy,
          page,
          limit: 6,
        },
      });
      setProjects(response.data.data || []);
      setTotalPages(
        response.data.meta
          ? Math.ceil(response.data.meta.total / response.data.meta.limit)
          : 1
      );
    } catch (error) {
      console.error("Projects load error", error);
      toast.error("Failed to load projects");
    } finally {
      setIsLoading(false);
    }
  }, [search, status, deadlineStatus, sortBy, page]);

  // Since we want this to update whenever filters or paging change, and fetchProjects changes on dependency updates
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProjects();
  }, [fetchProjects]);

  const handleCreate = async (data: ProjectFormValues) => {
    setIsCreateOpen(false);
    resetCreate();
    try {
      await api.post("/projects", {
        ...data,
        deadline: new Date(data.deadline),
      });
      toast.success("Project created successfully!");
      fetchProjects();
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to create project");
      fetchProjects();
    }
  };

  const openEditModal = (project: Project) => {
    setSelectedProject(project);
    const d = new Date(project.deadline);
    const dateFormatted = d.toISOString().slice(0, 16);
    resetEdit({
      name: project.name,
      description: project.description,
      deadline: dateFormatted,
      status: project.status,
    });
    setIsEditOpen(true);
  };

  const handleUpdate = async (data: ProjectFormValues) => {
    if (!selectedProject) return;

    setIsEditOpen(false);
    setSelectedProject(null);
    resetEdit();

    const prevProjects = [...projects];
    setProjects((prev) =>
      prev.map((p) =>
        p._id === selectedProject._id
          ? {
              ...p,
              name: data.name,
              description: data.description,
              deadline: new Date(data.deadline).toISOString(),
              status: data.status,
            }
          : p
      )
    );

    try {
      await api.put(`/projects/${selectedProject._id}`, {
        ...data,
        deadline: new Date(data.deadline),
      });
      toast.success("Project updated successfully!");
      fetchProjects();
    } catch (error) {
      setProjects(prevProjects);
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to update project");
    }
  };

  const handleDelete = (projectId: string, projectName: string) => {
    Swal.fire({
      title: "Delete Project?",
      text: `Are you sure you want to delete "${projectName}"? This will permanently delete all tasks, comments, and members!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete everything",
    }).then(async (result) => {
      if (result.isConfirmed) {
        const prevProjects = [...projects];
        setProjects((prev) => prev.filter((p) => p._id !== projectId));
        try {
          await api.delete(`/projects/${projectId}`);
          toast.success("Project deleted successfully");
          fetchProjects();
        } catch (error) {
          setProjects(prevProjects);
          const err = error as { response?: { data?: { message?: string } } };
          toast.error(err.response?.data?.message || "Failed to delete project");
        }
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Title & Add Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="font-heading font-extrabold text-2xl text-text-main">Projects Directory</h3>
          <p className="text-text-muted text-sm mt-0.5">Manage and track your active workspace projects.</p>
        </div>
        {isManagerOrAdmin && (
          <Button onClick={() => setIsCreateOpen(true)} className="flex items-center gap-2 cursor-pointer shadow-md">
            <FiPlus className="h-5 w-5" />
            <span>Create Project</span>
          </Button>
        )}
      </div>

      {/* Filters Bar */}
      <div className="bg-surface border border-border-main p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-xs">
          <FiSearch className="absolute left-3 top-3.5 h-4 w-4 text-text-muted/60" />
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-border-main bg-canvas text-text-main text-sm focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand transition-all"
          />
        </div>

        <div className="flex flex-wrap gap-3 w-full md:w-auto items-center justify-end">
          {/* Status Filter */}
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-3.5 py-2.5 rounded-lg border border-border-main bg-canvas text-text-main text-sm focus:outline-none focus:ring-2 focus:ring-brand/40 cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="COMPLETED">Completed</option>
            <option value="ON_HOLD">On Hold</option>
          </select>

          {/* Deadline Filter */}
          <select
            value={deadlineStatus}
            onChange={(e) => setDeadlineStatus(e.target.value)}
            className="px-3.5 py-2.5 rounded-lg border border-border-main bg-canvas text-text-main text-sm focus:outline-none focus:ring-2 focus:ring-brand/40 cursor-pointer"
          >
            <option value="">All Deadlines</option>
            <option value="upcoming">Upcoming</option>
            <option value="overdue">Overdue</option>
          </select>

          {/* Sort Filter */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3.5 py-2.5 rounded-lg border border-border-main bg-canvas text-text-main text-sm focus:outline-none focus:ring-2 focus:ring-brand/40 cursor-pointer"
          >
            <option value="latestCreated">Latest Created</option>
            <option value="recentlyUpdated">Recently Updated</option>
            <option value="nearestDeadline">Nearest Deadline</option>
          </select>
        </div>
      </div>

      {/* Projects Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-surface border border-border-main p-6 rounded-2xl space-y-6 animate-pulse">
              <div className="flex justify-between items-center">
                <div className="h-4 w-20 bg-canvas rounded-lg" />
                <div className="h-4 w-12 bg-canvas rounded-lg" />
              </div>
              <div className="space-y-2">
                <div className="h-6 w-3/4 bg-canvas rounded-lg" />
                <div className="h-4 w-full bg-canvas rounded-lg" />
                <div className="h-4 w-5/6 bg-canvas rounded-lg" />
              </div>
              <div className="pt-4 border-t border-border-main/50 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-canvas" />
                  <div className="h-3 w-16 bg-canvas rounded-lg" />
                </div>
                <div className="h-4 w-24 bg-canvas rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-16 bg-surface border border-border-main rounded-2xl">
          <p className="text-text-muted">No projects found matching the criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => {
            const isOverdue = new Date(project.deadline) < new Date() && project.status !== "COMPLETED";

            return (
              <div
                key={project._id}
                className={`group flex flex-col justify-between bg-surface border-y border-r border-l-4 p-6 rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative overflow-hidden ${
                  project.status === "COMPLETED"
                    ? "border-l-emerald-500 border-border-main/60"
                    : project.status === "ON_HOLD"
                    ? "border-l-amber-500 border-border-main/60"
                    : isOverdue
                    ? "border-l-red-500 border-border-main/60"
                    : "border-l-brand border-border-main/60"
                }`}
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${
                        project.status === "COMPLETED"
                          ? "bg-emerald-500"
                          : project.status === "ON_HOLD"
                          ? "bg-amber-500"
                          : isOverdue
                          ? "bg-red-500"
                          : "bg-brand"
                      }`} />
                      <span className="text-xs font-bold text-text-muted capitalize">
                        {project.status.toLowerCase().replace("_", " ")}
                      </span>
                    </div>

                    {isManagerOrAdmin && (
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEditModal(project)}
                          className="p-1.5 rounded-lg text-text-muted hover:bg-canvas hover:text-text-main transition-colors cursor-pointer"
                          title="Edit Project"
                        >
                          <FiEdit className="h-4 w-4" />
                        </button>
                        {user?.role === "admin" && (
                          <button
                            onClick={() => handleDelete(project._id, project.name)}
                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                            title="Delete Project"
                          >
                            <FiTrash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 className="font-heading font-bold text-lg text-text-main leading-snug group-hover:text-brand transition-colors text-left">
                      {project.name}
                    </h4>
                    <p className="text-text-muted text-xs line-clamp-2 mt-1.5 text-left leading-relaxed">
                      {project.description || "No description provided."}
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-border-main/50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-brand/10 text-brand flex items-center justify-center font-bold text-[10px] ring-1 ring-brand/20">
                      {project.createdBy?.name?.charAt(0).toUpperCase() || "A"}
                    </div>
                    <div className="text-left">
                      <p className="text-[10px] text-text-muted leading-none">Created by</p>
                      <p className="text-xs font-bold text-text-main leading-tight truncate max-w-[100px]">{project.createdBy?.name || "Admin"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-xs text-text-muted font-medium">
                      <FiCalendar className="h-4 w-4 text-brand" />
                      <span className={isOverdue ? "text-red-500 font-bold" : ""}>
                        {new Date(project.deadline).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>

                    <Link
                      to={`/projects/${project._id}`}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-brand/10 text-brand hover:bg-brand hover:text-white transition-all duration-200 text-xs font-extrabold"
                    >
                      <span>Board</span>
                      <FiArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-4">
          <Button
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            size="sm"
          >
            Previous
          </Button>
          <span className="text-xs text-text-muted">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            disabled={page === totalPages}
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            size="sm"
          >
            Next
          </Button>
        </div>
      )}

      {/* Create Project Modal */}
      <Modal isOpen={isCreateOpen} onClose={() => { setIsCreateOpen(false); resetCreate(); }} title="Create New Project">
        <form onSubmit={handleSubmitCreate(handleCreate)} className="space-y-4">
          <Input
            label="Project Name"
            placeholder="e.g. Website Redesign"
            {...registerCreate("name", { required: "Project name is required" })}
            error={errorsCreate.name?.message}
          />
          <TextArea
            label="Description"
            placeholder="Outline project milestones and goals..."
            {...registerCreate("description")}
            error={errorsCreate.description?.message}
            rows={4}
          />
          <Input
            label="Deadline Date"
            type="datetime-local"
            {...registerCreate("deadline", { required: "Deadline is required" })}
            error={errorsCreate.deadline?.message}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => { setIsCreateOpen(false); resetCreate(); }}>
              Cancel
            </Button>
            <Button type="submit">
              Create Project
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Project Modal */}
      <Modal isOpen={isEditOpen} onClose={() => { setIsEditOpen(false); resetEdit(); }} title="Edit Project Details">
        <form onSubmit={handleSubmitEdit(handleUpdate)} className="space-y-4">
          <Input
            label="Project Name"
            {...registerEdit("name", { required: "Project name is required" })}
            error={errorsEdit.name?.message}
          />
          <TextArea
            label="Description"
            {...registerEdit("description")}
            error={errorsEdit.description?.message}
            rows={4}
          />
          <Input
            label="Deadline Date"
            type="datetime-local"
            {...registerEdit("deadline", { required: "Deadline is required" })}
            error={errorsEdit.deadline?.message}
          />
          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              Project Status
            </label>
            <select
              {...registerEdit("status", { required: "Status is required" })}
              className="w-full px-3.5 py-2.5 rounded-lg border border-border-main bg-surface text-text-main text-sm focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand"
            >
              <option value="ACTIVE">Active</option>
              <option value="COMPLETED">Completed</option>
              <option value="ON_HOLD">On Hold</option>
            </select>
            {errorsEdit.status?.message && (
              <span className="text-xs text-red-500">{errorsEdit.status.message}</span>
            )}
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => { setIsEditOpen(false); resetEdit(); }}>
              Cancel
            </Button>
            <Button type="submit">
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
