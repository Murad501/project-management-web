import { useEffect, useState } from "react";
import api from "../api";
import Badge from "../components/Badge";
import Button from "../components/Button";
import { FiClock, FiLayers, FiUser } from "react-icons/fi";
import toast from "react-hot-toast";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface ActivityLog {
  _id: string;
  projectId?: string;
  details?: string;
  message?: string; 
  timestamp: string;
  userId?: User;
}

export default function ActivityLogs() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterUser, setFilterUser] = useState("");

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/activity-logs");
      setLogs(response.data.data);
    } catch (error) {
      console.error("Fetch logs error", error);
      toast.error("Failed to load operations logs");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    if (!filterUser) return true;
    return log.userId?.name.toLowerCase().includes(filterUser.toLowerCase()) || false;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      
      <div>
        <h3 className="font-heading font-extrabold text-2xl text-text-main">Audit Trails & Activity Logs</h3>
        <p className="text-text-muted text-sm mt-0.5">
          View system-wide operation triggers and event logs.
        </p>
      </div>

      
      <div className="bg-surface border border-border-main p-4 rounded-2xl flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3 w-full max-w-sm">
          <FiUser className="text-text-muted/60 shrink-0" />
          <input
            type="text"
            placeholder="Filter by operator name..."
            value={filterUser}
            onChange={(e) => setFilterUser(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-canvas border border-border-main rounded-lg text-text-main focus:outline-none focus:ring-2 focus:ring-brand/45 transition-all"
          />
        </div>
        <Button variant="outline" size="sm" onClick={fetchLogs} className="cursor-pointer">
          Refresh
        </Button>
      </div>

      
      {isLoading ? (
        <div className="bg-surface border border-border-main p-6 md:p-8 rounded-2xl shadow-sm space-y-8 animate-pulse">
          <div className="relative border-l border-border-main pl-6 ml-2 space-y-8">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="relative space-y-2">
                <div className="absolute -left-[31px] top-1.5 h-4.5 w-4.5 rounded-full border-2 border-border-main bg-canvas" />
                <div className="flex justify-between items-center">
                  <div className="h-4 w-2/3 bg-canvas rounded-lg" />
                  <div className="h-3.5 w-24 bg-canvas rounded-lg" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-4.5 w-20 bg-canvas rounded-lg" />
                  <div className="h-4.5 w-24 bg-canvas rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="text-center py-16 bg-surface border border-border-main rounded-2xl">
          <p className="text-text-muted">No activity logs found.</p>
        </div>
      ) : (
        <div className="bg-surface border border-border-main p-6 md:p-8 rounded-2xl shadow-sm space-y-6">
          <div className="relative border-l border-border-main pl-6 ml-2 space-y-8">
            {filteredLogs.map((log) => {
              const displayMessage = log.message || log.details || "System event occurred";
              const dateObj = new Date(log.timestamp);

              return (
                <div key={log._id} className="relative group">
                  
                  <div className="absolute -left-[31px] top-1.5 h-4.5 w-4.5 rounded-full border-2 border-brand bg-surface flex items-center justify-center group-hover:bg-brand transition-all duration-200">
                    <div className="h-1.5 w-1.5 bg-brand rounded-full group-hover:bg-surface" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5">
                      <p className="text-sm font-bold text-text-main tracking-tight leading-snug">
                        {displayMessage}
                      </p>
                      <span className="text-xs text-text-muted flex items-center gap-1 shrink-0 font-medium">
                        <FiClock className="h-3.5 w-3.5" />
                        {dateObj.toLocaleDateString()} {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs">
                      {log.userId && (
                        <div className="flex items-center gap-1.5">
                          <FiUser className="h-3.5 w-3.5 text-text-muted" />
                          <span className="font-bold text-text-muted">Triggered by:</span>
                          <span className="text-text-main font-bold">{log.userId.name}</span>
                          <Badge
                            variant={
                              log.userId.role === "admin"
                                ? "brand"
                                : log.userId.role === "project_manager"
                                ? "info"
                                : "neutral"
                            }
                            className="scale-75 origin-left"
                          >
                            {log.userId.role}
                          </Badge>
                        </div>
                      )}

                      {log.projectId && (
                        <div className="flex items-center gap-1">
                          <FiLayers className="h-3.5 w-3.5 text-text-muted" />
                          <span className="font-bold text-text-muted">Scope Project:</span>
                          <span className="text-brand font-mono font-bold scale-90">{log.projectId.slice(-6)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
