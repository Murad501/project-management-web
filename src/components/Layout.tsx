import { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../store";
import { logout } from "../store/authSlice";
import ThemeToggle from "./ThemeToggle";

import {
  FiGrid,
  FiBriefcase,
  FiActivity,
  FiUser,
  FiLogOut,
  FiMenu,
  FiX,
  FiChevronRight,
  FiClock,
} from "react-icons/fi";
import Swal from "sweetalert2";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const user = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [currentTime, setCurrentTime] = useState("");

  
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString(undefined, {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        }),
      );
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  
  useEffect(() => {
    let title = "Project Manager";
    if (location.pathname === "/") {
      title = "Dashboard | Project Manager";
    } else if (location.pathname === "/projects") {
      title = "Projects Directory | Project Manager";
    } else if (location.pathname === "/activity-logs") {
      title = "Activity Logs | Project Manager";
    } else if (location.pathname === "/profile") {
      title = "My Profile | Project Manager";
    } else if (location.pathname.startsWith("/projects/")) {
      title = "Project Workspace | Project Manager";
    }
    document.title = title;
  }, [location.pathname]);

  const handleLogout = () => {
    Swal.fire({
      title: "Logout",
      text: "Are you sure you want to log out?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#4F46E5",
      cancelButtonColor: "#ef4444",
      confirmButtonText: "Yes, logout",
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(logout());
        navigate("/login");
      }
    });
  };

  const navItems = [
    { name: "Dashboard", path: "/", icon: FiGrid },
    { name: "Projects", path: "/projects", icon: FiBriefcase },
    { name: "Activity Logs", path: "/activity-logs", icon: FiActivity },
    { name: "My Profile", path: "/profile", icon: FiUser },
  ];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-canvas text-text-main">
      
      <aside className="hidden md:flex flex-col w-64 bg-surface border-r border-border-main shrink-0 h-full">
        
        <div className="flex items-center gap-3 px-6 h-16 border-b border-border-main shrink-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-white font-bold text-lg shadow-lg shadow-brand/20">
            P
          </div>
          <div>
            <h1 className="font-heading font-bold text-sm leading-tight tracking-tight text-text-main">
              Project Manager
            </h1>

          </div>
        </div>

        
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.path === "/"
                ? location.pathname === "/"
                : location.pathname.startsWith(item.path);

            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 group cursor-pointer ${
                    isActive
                      ? "bg-brand text-white shadow-md shadow-brand/10"
                      : "text-text-muted hover:bg-canvas hover:text-text-main"
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5 shrink-0" />
                  <span>{item.name}</span>
                </div>
                <FiChevronRight
                  className={`h-4 w-4 opacity-0 transition-all duration-200 group-hover:opacity-100 ${
                    isActive ? "text-white opacity-100" : "text-text-muted"
                  }`}
                />
              </NavLink>
            );
          })}
        </nav>


      </aside>

      
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col w-64 bg-surface border-r border-border-main transition-transform duration-300 md:hidden h-full ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-6 h-16 border-b border-border-main shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-white font-bold text-lg shadow-lg shadow-brand/20">
              P
            </div>
            <div>
              <h1 className="font-heading font-bold text-sm leading-tight tracking-tight text-text-main">
                Project Manager
              </h1>
              <span className="text-[9px] font-semibold text-brand tracking-widest uppercase block -mt-0.5">
                Enterprise
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsMobileOpen(false)}
            className="p-1 rounded-full text-text-muted hover:bg-canvas hover:text-text-main transition-colors"
          >
            <FiX className="h-6 w-6" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={() => setIsMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-200 cursor-pointer ${
                    isActive
                      ? "bg-brand text-white"
                      : "text-text-muted hover:bg-canvas hover:text-text-main"
                  }`
                }
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>


      </aside>

      
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        
        <header className="flex h-16 items-center justify-between border-b border-border-main bg-surface px-6 shrink-0 z-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="p-1 rounded-lg text-text-muted hover:bg-canvas hover:text-text-main transition-colors md:hidden"
            >
              <FiMenu className="h-6 w-6" />
            </button>
            <div className="font-mono font-bold text-xs md:text-sm text-brand bg-brand/5 border border-brand/10 px-3 py-1.5 rounded-xl shadow-inner flex items-center gap-2">
              <FiClock className="h-3.5 w-3.5 text-brand animate-pulse" />
              <span>{currentTime}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            {user && (
              <div className="flex items-center gap-3 pl-4 border-l border-border-main">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-brand/10 text-brand flex items-center justify-center font-bold text-xs border border-brand/20 shadow-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-xs font-bold text-text-main leading-none">
                      {user.name}
                    </p>
                    <span className="text-[9px] text-text-muted capitalize block mt-0.5 font-medium">
                      {user.role}
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-text-muted hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                  title="Logout"
                >
                  <FiLogOut className="h-4.5 w-4.5" />
                </button>
              </div>
            )}
          </div>
        </header>

        
        <main className="flex-1 overflow-y-auto bg-canvas p-6 md:p-8">
          <div className="max-w-7xl mx-auto space-y-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
