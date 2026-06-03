import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import Input from "../components/Input";
import Button from "../components/Button";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";

interface RegisterFormValues {
  name: string;
  email: string;
  password: string;
}

export default function Register() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Register | Project Manager";
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    try {
      await api.post("/auth/signup", data);
      toast.success("Account created! Please sign in.");
      navigate("/login");
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      const msg =
        err.response?.data?.message || "Registration failed. Try again.";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-screen flex items-center justify-center bg-canvas p-4 overflow-hidden">
      {/* Decorative gradient glowing bubbles */}
      <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] rounded-full bg-brand/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40rem] h-[40rem] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md z-10">
        <div className="text-center mb-8">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand text-white font-bold text-2xl shadow-xl shadow-brand/35 mb-4">
            P
          </div>
          <h1 className="font-heading font-extrabold text-3xl tracking-tight text-text-main">
            Create Account
          </h1>
          <p className="text-text-muted mt-2 text-sm">
            Sign up to collaborate and manage projects effectively
          </p>
        </div>

        <div className="bg-surface/80 backdrop-blur-md border border-border-main p-8 rounded-2xl shadow-xl shadow-black/5">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="Full Name"
              type="text"
              placeholder="John Doe"
              {...register("name", {
                required: "Full Name is required",
              })}
              error={errors.name?.message}
              autoComplete="name"
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="john@example.com"
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
              autoComplete="new-password"
            />

            <Button
              type="submit"
              className="w-full py-3 mt-2 text-sm font-semibold cursor-pointer"
              isLoading={isLoading}
            >
              Sign Up
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-text-muted">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-bold text-brand hover:underline transition-colors"
            >
              Sign in here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
