import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setCredentials } from "../store/authSlice";
import api from "../api";
import Input from "../components/Input";
import Button from "../components/Button";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";

interface LoginFormValues {
  email: string;
  password: string;
}

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"manual" | "demo">("manual");
  const [selectedRole, setSelectedRole] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Login | Project Manager";
  }, []);

  const {
    register,
    handleSubmit,
    setValue,
    clearErrors,
    formState: { errors },
  } = useForm<LoginFormValues>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleTabChange = (tab: "manual" | "demo") => {
    setActiveTab(tab);
    setSelectedRole("");
    setValue("email", "");
    setValue("password", "");
    clearErrors();
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const role = e.target.value;
    setSelectedRole(role);
    if (role === "admin") {
      setValue("email", "admin@demo.com");
      setValue("password", "admin@demo.com");
    } else if (role === "project_manager") {
      setValue("email", "manager@demo.com");
      setValue("password", "manager@demo.com");
    } else if (role === "member") {
      setValue("email", "member@demo.com");
      setValue("password", "member@demo.com");
    } else {
      setValue("email", "");
      setValue("password", "");
    }
  };

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      const response = await api.post("/auth/login", data);
      const { user, token } = response.data.data;
      dispatch(setCredentials({ user, token }));
      toast.success("Welcome back!");
      navigate("/");
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      const msg =
        err.response?.data?.message || "Invalid credentials. Please try again.";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-screen flex items-center justify-center bg-canvas p-4 overflow-hidden">
      {/* Decorative gradient glowing bubbles for rich aesthetics */}
      <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] rounded-full bg-brand/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40rem] h-[40rem] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md z-10">
        {/* Branding header */}
        <div className="text-center mb-8">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand text-white font-bold text-2xl shadow-xl shadow-brand/35 mb-4">
            P
          </div>
          <h1 className="font-heading font-extrabold text-3xl tracking-tight text-text-main">
            Welcome Back
          </h1>
          <p className="text-text-muted mt-2 text-sm">
            Sign in to manage your team projects and tasks
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-surface/80 backdrop-blur-md border border-border-main p-8 rounded-2xl shadow-xl shadow-black/5">
          {/* Tab Switcher */}
          <div className="flex bg-canvas p-1 rounded-xl border border-border-main mb-6">
            <button
              type="button"
              onClick={() => handleTabChange("manual")}
              className={`flex-1 py-2 rounded-lg text-xs font-bold tracking-wider uppercase transition-all duration-200 cursor-pointer ${
                activeTab === "manual"
                  ? "bg-surface text-brand shadow-sm"
                  : "text-text-muted hover:text-text-main"
              }`}
            >
              Manual Login
            </button>
            <button
              type="button"
              onClick={() => handleTabChange("demo")}
              className={`flex-1 py-2 rounded-lg text-xs font-bold tracking-wider uppercase transition-all duration-200 cursor-pointer ${
                activeTab === "demo"
                  ? "bg-surface text-brand shadow-sm"
                  : "text-text-muted hover:text-text-main"
              }`}
            >
              Demo Access
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {activeTab === "manual" ? (
              <>
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="name@company.com"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /\S+@\S+\.\S+/,
                      message: "Invalid email format",
                    },
                  })}
                  error={errors.email?.message}
                  autoComplete="email"
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
                  autoComplete="current-password"
                />
              </>
            ) : (
              <>
                <div className="flex flex-col gap-1.5 text-left">
                  <label className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                    Select Demo Role
                  </label>
                  <select
                    value={selectedRole}
                    onChange={handleRoleChange}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-border-main bg-surface text-text-main text-sm focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand cursor-pointer"
                  >
                    <option value="">-- Choose a Role --</option>
                    <option value="admin">Admin</option>
                    <option value="project_manager">Project Manager</option>
                    <option value="member">Member</option>
                  </select>
                </div>

                {selectedRole && (
                  <div className="space-y-4 pt-1">
                    <Input
                      label="Demo Email Address"
                      type="email"
                      disabled
                      {...register("email")}
                    />

                    <Input
                      label="Demo Password"
                      type="password"
                      disabled
                      {...register("password")}
                    />
                  </div>
                )}
              </>
            )}

            <Button
              type="submit"
              className="w-full py-3 mt-2 text-sm font-semibold cursor-pointer"
              isLoading={isLoading}
              disabled={activeTab === "demo" && !selectedRole}
            >
              Sign In
            </Button>
          </form>

          {/* Direct link to register */}
          <div className="mt-6 text-center text-xs text-text-muted">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-bold text-brand hover:underline transition-colors"
            >
              Create free account
            </Link>
          </div>
        </div>

        {/* Guest credentials helper card for easy grading/testing */}
        <div className="mt-6 bg-surface/50 border border-dashed border-border-main p-4 rounded-xl text-xs text-text-muted">
          <p className="font-bold text-text-main mb-1.5">
            💡 Seeded Demo Accounts:
          </p>
          <ul className="space-y-1 list-disc list-inside">
            <li>
              Admin:{" "}
              <code className="px-1 py-0.5 bg-canvas rounded font-mono">
                admin@demo.com
              </code>{" "}
              / password:{" "}
              <code className="px-1 py-0.5 bg-canvas rounded font-mono">
                admin@demo.com
              </code>
            </li>
            <li>
              Project Manager:{" "}
              <code className="px-1 py-0.5 bg-canvas rounded font-mono">
                manager@demo.com
              </code>{" "}
              / password:{" "}
              <code className="px-1 py-0.5 bg-canvas rounded font-mono">
                manager@demo.com
              </code>
            </li>
            <li>
              Member:{" "}
              <code className="px-1 py-0.5 bg-canvas rounded font-mono">
                member@demo.com
              </code>{" "}
              / password:{" "}
              <code className="px-1 py-0.5 bg-canvas rounded font-mono">
                member@demo.com
              </code>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
