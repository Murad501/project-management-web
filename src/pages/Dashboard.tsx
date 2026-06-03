import { useEffect, useState } from "react";
import api from "../api";
import Badge from "../components/Badge";
import {
  FiBriefcase,
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
  FiLayers,
  FiUserCheck,
  FiActivity,
} from "react-icons/fi";
import toast from "react-hot-toast";

interface KPIs {
  totalProjects: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
}

interface TasksByPriority {
  high: number;
  medium: number;
  low: number;
}

interface TaskStatusDistribution {
  todo: number;
  inProgress: number;
  completed: number;
}

interface MemberWorkload {
  userId: string;
  userName: string;
  totalTasks: number;
  pendingTasks: number;
  completedTasks: number;
}

interface ActivityLog {
  _id: string;
  projectId: string;
  message?: string;
  details?: string;
  timestamp: string;
  userId?: {
    name: string;
    email: string;
    role: string;
  };
}

interface DashboardData {
  kpis: KPIs;
  tasksByPriority: TasksByPriority;
  taskStatusDistribution: TaskStatusDistribution;
  memberWorkload: MemberWorkload[];
  recentActivities: ActivityLog[];
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await api.get("/dashboard");
        setData(response.data.data);
      } catch (error) {
        console.error("Dashboard fetch error", error);
        toast.error("Failed to load dashboard data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        {/* Welcome banner skeleton */}
        <div className="bg-surface/50 border border-border-main p-6 rounded-2xl h-24 bg-surface" />

        {/* KPI Grid skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-surface border border-border-main p-5 rounded-2xl flex items-center justify-between h-24 bg-surface" />
          ))}
        </div>

        {/* Charts/Lists grid skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-surface border border-border-main p-6 rounded-2xl h-64 bg-surface" />
          ))}
        </div>

        {/* Recent logs skeleton */}
        <div className="bg-surface border border-border-main p-6 rounded-2xl h-80 bg-surface" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-10 bg-surface border border-border-main rounded-xl">
        <p className="text-text-muted">No stats available.</p>
      </div>
    );
  }

  const { kpis, tasksByPriority, taskStatusDistribution, memberWorkload, recentActivities } = data;

  const kpiCards = [
    {
      title: "Total Projects",
      value: kpis.totalProjects,
      icon: FiBriefcase,
      color: "text-brand bg-brand/10 border-brand/20",
    },
    {
      title: "Total Tasks",
      value: kpis.totalTasks,
      icon: FiLayers,
      color: "text-sky-500 bg-sky-500/10 border-sky-500/20",
    },
    {
      title: "Completed Tasks",
      value: kpis.completedTasks,
      icon: FiCheckCircle,
      color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    },
    {
      title: "Pending Tasks",
      value: kpis.pendingTasks,
      icon: FiClock,
      color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    },
    {
      title: "Overdue Tasks",
      value: kpis.overdueTasks,
      icon: FiAlertCircle,
      color: "text-red-500 bg-red-500/10 border-red-500/20",
    },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome banner */}
      <div className="bg-surface/50 border border-border-main p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="font-heading font-extrabold text-2xl text-text-main">
            Dashboard Overview
          </h3>
          <p className="text-text-muted text-sm mt-1">
            Real-time telemetry and status reports of all system operations.
          </p>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        {kpiCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="bg-surface border border-border-main p-5 rounded-2xl flex items-center justify-between shadow-sm shadow-black/5 hover:border-brand/40 transition-all duration-200"
            >
              <div className="space-y-1">
                <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                  {card.title}
                </span>
                <p className="text-3xl font-extrabold text-text-main font-heading">
                  {card.value}
                </p>
              </div>
              <div className={`p-3.5 rounded-xl border ${card.color}`}>
                <Icon className="h-6 w-6" />
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Task Priority Distribution Card */}
        <div className="bg-surface border border-border-main p-6 rounded-2xl space-y-6 shadow-sm shadow-black/5">
          <h4 className="font-heading font-bold text-lg text-text-main">
            Tasks by Priority
          </h4>
          <div className="space-y-4">
            {/* High Priority */}
            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="font-medium text-text-muted flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-500" /> High Priority
                </span>
                <span className="font-bold text-text-main">{tasksByPriority.high}</span>
              </div>
              <div className="h-2 w-full bg-border-main rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-500 rounded-full transition-all duration-500"
                  style={{
                    width: `${
                      kpis.totalTasks > 0 ? (tasksByPriority.high / kpis.totalTasks) * 100 : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            {/* Medium Priority */}
            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="font-medium text-text-muted flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> Medium Priority
                </span>
                <span className="font-bold text-text-main">{tasksByPriority.medium}</span>
              </div>
              <div className="h-2 w-full bg-border-main rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-500"
                  style={{
                    width: `${
                      kpis.totalTasks > 0
                        ? (tasksByPriority.medium / kpis.totalTasks) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            {/* Low Priority */}
            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="font-medium text-text-muted flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-indigo-500" /> Low Priority
                </span>
                <span className="font-bold text-text-main">{tasksByPriority.low}</span>
              </div>
              <div className="h-2 w-full bg-border-main rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                  style={{
                    width: `${
                      kpis.totalTasks > 0 ? (tasksByPriority.low / kpis.totalTasks) * 100 : 0
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Task Status Distribution Card */}
        <div className="bg-surface border border-border-main p-6 rounded-2xl space-y-6 shadow-sm shadow-black/5">
          <h4 className="font-heading font-bold text-lg text-text-main">
            Tasks by Status
          </h4>
          <div className="space-y-4">
            {/* TO DO */}
            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="font-medium text-text-muted flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-slate-400" /> To Do
                </span>
                <span className="font-bold text-text-main">{taskStatusDistribution.todo}</span>
              </div>
              <div className="h-2 w-full bg-border-main rounded-full overflow-hidden">
                <div
                  className="h-full bg-slate-400 rounded-full transition-all duration-500"
                  style={{
                    width: `${
                      kpis.totalTasks > 0
                        ? (taskStatusDistribution.todo / kpis.totalTasks) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            {/* IN PROGRESS */}
            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="font-medium text-text-muted flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-brand" /> In Progress
                </span>
                <span className="font-bold text-text-main">
                  {taskStatusDistribution.inProgress}
                </span>
              </div>
              <div className="h-2 w-full bg-border-main rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand rounded-full transition-all duration-500"
                  style={{
                    width: `${
                      kpis.totalTasks > 0
                        ? (taskStatusDistribution.inProgress / kpis.totalTasks) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            {/* COMPLETED */}
            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="font-medium text-text-muted flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Completed
                </span>
                <span className="font-bold text-text-main">
                  {taskStatusDistribution.completed}
                </span>
              </div>
              <div className="h-2 w-full bg-border-main rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{
                    width: `${
                      kpis.totalTasks > 0
                        ? (taskStatusDistribution.completed / kpis.totalTasks) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Member Workload Card */}
        <div className="bg-surface border border-border-main p-6 rounded-2xl space-y-4 shadow-sm shadow-black/5 overflow-hidden flex flex-col">
          <h4 className="font-heading font-bold text-lg text-text-main flex items-center gap-2">
            <FiUserCheck className="h-5 w-5 text-brand" /> Member Workload
          </h4>
          <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 max-h-[14rem]">
            {memberWorkload.length === 0 ? (
              <p className="text-text-muted text-xs text-center py-6">No workload assigned yet.</p>
            ) : (
              memberWorkload.map((member, idx) => {
                const completionPercentage =
                  member.totalTasks > 0
                    ? Math.round((member.completedTasks / member.totalTasks) * 100)
                    : 0;

                return (
                  <div key={idx} className="space-y-1.5 bg-canvas/30 border border-border-main/50 p-3 rounded-xl">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-text-main">{member.userName}</span>
                      <span className="text-text-muted">
                        {member.completedTasks}/{member.totalTasks} Tasks ({completionPercentage}%)
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-border-main rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand transition-all duration-500"
                        style={{ width: `${completionPercentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Recent Activities Section */}
      <div className="bg-surface border border-border-main p-6 rounded-2xl space-y-6 shadow-sm shadow-black/5">
        <h4 className="font-heading font-bold text-lg text-text-main flex items-center gap-2">
          <FiActivity className="h-5 w-5 text-brand" /> Recent Operations Log
        </h4>
        <div className="relative border-l border-border-main pl-4 ml-2 space-y-6">
          {recentActivities.length === 0 ? (
            <p className="text-text-muted text-sm py-4">No recent activity logs.</p>
          ) : (
            recentActivities.map((log) => (
              <div key={log._id} className="relative group">
                {/* Timeline node */}
                <div className="absolute -left-[21px] top-1 h-3 w-3 rounded-full border-2 border-brand bg-surface group-hover:bg-brand transition-colors duration-200" />
                <div className="space-y-1">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                    <p className="text-sm font-semibold text-text-main">
                      {log.message || log.details || "System event occurred"}
                    </p>
                    <span className="text-xs text-text-muted">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>
                  {log.userId && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-text-muted">Triggered by:</span>
                      <span className="text-xs font-bold text-text-main">
                        {log.userId.name}
                      </span>
                      <Badge variant="neutral" className="scale-75 origin-left">
                        {log.userId.role}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
