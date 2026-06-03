import { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import api from "../api";
import Button from "../components/Button";
import Input from "../components/Input";
import Modal from "../components/Modal";
import Badge from "../components/Badge";
import ThemeToggle from "../components/ThemeToggle";
import { FiMail, FiShield, FiSliders, FiPlusCircle, FiActivity } from "react-icons/fi";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";

interface ManagerFormValues {
  name: string;
  email: string;
  password: string;
}

export default function Profile() {
  const user = useSelector((state: RootState) => state.auth.user);
  const themeMode = useSelector((state: RootState) => state.theme.mode);

  // Manager Creation Modal (Admin only)
  const [isManagerModalOpen, setIsManagerModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ManagerFormValues>({
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const isAdmin = user?.role === "admin";

  const handleCreateManager = async (data: ManagerFormValues) => {
    setIsSubmitting(true);
    try {
      await api.post("/user/create-manager", data);
      toast.success("Project Manager created successfully!");
      setIsManagerModalOpen(false);
      reset();
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to create manager");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Title Header */}
      <div>
        <h3 className="font-heading font-extrabold text-2xl text-text-main">My Settings & Profile</h3>
        <p className="text-text-muted text-sm mt-0.5">Manage your personal settings and configuration details.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* User Card */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-surface border border-border-main p-6 md:p-8 rounded-2xl shadow-sm flex flex-col sm:flex-row items-center gap-6">
            <div className="h-20 w-20 rounded-full bg-brand/10 text-brand border border-brand/20 flex items-center justify-center font-bold text-3xl font-heading shadow-md">
              {user.name.charAt(0).toUpperCase()}
            </div>

            <div className="space-y-3.5 text-center sm:text-left flex-1 min-w-0">
              <div className="space-y-1">
                <h4 className="font-heading font-extrabold text-xl md:text-2xl text-text-main truncate">
                  {user.name}
                </h4>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <Badge variant={user.role === "admin" ? "brand" : user.role === "project_manager" ? "info" : "neutral"}>
                    {user.role}
                  </Badge>
                  <span className="text-xs text-text-muted font-mono font-bold">ID: {user.id || user._id}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-border-main/60 flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-4 text-sm text-text-muted">
                <span className="flex items-center gap-1.5 truncate max-w-full">
                  <FiMail className="text-brand shrink-0" />
                  <span className="truncate">{user.email}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <FiShield className="text-brand shrink-0" />
                  <span className="capitalize">{user.role.replace("_", " ")} Role Authority</span>
                </span>
              </div>
            </div>
          </div>

          {/* Preferences Card */}
          <div className="bg-surface border border-border-main p-6 md:p-8 rounded-2xl shadow-sm space-y-6">
            <h4 className="font-heading font-bold text-lg text-text-main flex items-center gap-2 pb-3 border-b border-border-main">
              <FiSliders className="h-5 w-5 text-brand" /> Interface Settings
            </h4>
            <div className="flex items-center justify-between text-sm">
              <div className="space-y-1">
                <p className="font-bold text-text-main">Theme Mode Preference</p>
                <p className="text-xs text-text-muted">Toggle between crisp light theme and ergonomic dark theme.</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-text-muted capitalize">Current: {themeMode}</span>
                <ThemeToggle />
              </div>
            </div>
          </div>
        </div>

        {/* Administration Sidebar (Visible to Admin roles) */}
        <div className="space-y-6">
          {isAdmin ? (
            <div className="bg-surface border border-border-main p-6 rounded-2xl shadow-sm space-y-4">
              <h4 className="font-heading font-bold text-md text-text-main flex items-center gap-2 pb-2 border-b border-border-main">
                <FiShield className="h-5 w-5 text-brand" /> Administrative Actions
              </h4>
              <p className="text-xs text-text-muted leading-relaxed">
                As a system administrator, you have access to specialized user creation tools. You can create Project Managers to delegate project planning and task assignments.
              </p>
              <Button
                onClick={() => setIsManagerModalOpen(true)}
                className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-bold shadow-md cursor-pointer"
              >
                <FiPlusCircle className="h-4.5 w-4.5" />
                <span>Create Project Manager</span>
              </Button>
            </div>
          ) : (
            <div className="bg-surface border border-border-main p-6 rounded-2xl shadow-sm space-y-3.5">
              <h4 className="font-heading font-bold text-md text-text-main flex items-center gap-2">
                <FiActivity className="h-5 w-5 text-brand" /> Role Permissions
              </h4>
              <p className="text-xs text-text-muted leading-relaxed">
                Your account is assigned the <strong className="text-text-main capitalize">{user.role}</strong> role in the workspace.
              </p>
              <ul className="space-y-1.5 text-xs text-text-muted list-disc list-inside">
                <li>View dashboard telemetry</li>
                <li>Browse active projects</li>
                <li>Create & update task comments</li>
                <li>Advance task statuses</li>
              </ul>
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={isManagerModalOpen}
        onClose={() => {
          setIsManagerModalOpen(false);
          reset();
        }}
        title="Create Project Manager"
      >
        <form onSubmit={handleSubmit(handleCreateManager)} className="space-y-4">
          <Input
            label="Full Name"
            placeholder="Manager Name"
            {...register("name", {
              required: "Full Name is required",
            })}
            error={errors.name?.message}
          />
          <Input
            label="Email Address"
            type="email"
            placeholder="manager@company.com"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /\S+@\S+\.\S+/,
                message: "Invalid email format",
              },
            })}
            error={errors.email?.message}
          />
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            {...register("password", {
              required: "Password is required",
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters",
              },
            })}
            error={errors.password?.message}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsManagerModalOpen(false);
                reset();
              }}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Create Manager Account
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
