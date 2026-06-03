import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import { toggleTheme } from "../store/themeSlice";
import { FiSun, FiMoon } from "react-icons/fi";
import { useEffect } from "react";

export default function ThemeToggle() {
  const dispatch = useDispatch();
  const mode = useSelector((state: RootState) => state.theme.mode);

  useEffect(() => {
    const root = window.document.documentElement;
    if (mode === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [mode]);

  return (
    <button
      onClick={() => dispatch(toggleTheme())}
      className="relative inline-flex h-9 w-16 items-center rounded-full bg-border-main transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 dark:focus:ring-offset-canvas cursor-pointer"
      aria-label="Toggle Theme"
    >
      <span className="sr-only">Toggle theme</span>
      <div
        className={`${
          mode === "dark" ? "translate-x-8" : "translate-x-1"
        } flex h-7 w-7 items-center justify-center rounded-full bg-brand text-white shadow-md transition-transform duration-300`}
      >
        {mode === "dark" ? (
          <FiMoon className="h-4 w-4" />
        ) : (
          <FiSun className="h-4 w-4" />
        )}
      </div>
    </button>
  );
}
