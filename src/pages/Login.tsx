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
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Login | Project Manager";
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

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
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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

            <Button
              type="submit"
              className="w-full py-3 mt-2 text-sm font-semibold cursor-pointer"
              isLoading={isLoading}
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
            💡 Demo Accounts available (after seeding):
          </p>
          <ul className="space-y-1 list-disc list-inside">
            <li>
              Admin:{" "}
              <code className="px-1 py-0.5 bg-canvas rounded font-mono">
                admin@admin.com
              </code>{" "}
              / password:{" "}
              <code className="px-1 py-0.5 bg-canvas rounded font-mono">
                123456
              </code>
            </li>
            <li>
              PM:{" "}
              <code className="px-1 py-0.5 bg-canvas rounded font-mono">
                pm@pm.com
              </code>{" "}
              / password:{" "}
              <code className="px-1 py-0.5 bg-canvas rounded font-mono">
                123456
              </code>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
