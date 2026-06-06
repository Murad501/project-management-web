import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { Toaster } from "react-hot-toast";
import { store, persistor } from "./store";
import { PrivateRoute, PublicRoute } from "./components/RouteGuards";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import ProjectDetails from "./pages/ProjectDetails";
import ActivityLogs from "./pages/ActivityLogs";
import Profile from "./pages/Profile";

function AppContent() {
  return (
    <Routes>
      
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      
      <Route element={<PrivateRoute />}>
        <Route
          path="/"
          element={
            <Layout>
              <Dashboard />
            </Layout>
          }
        />
        <Route
          path="/projects"
          element={
            <Layout>
              <Projects />
            </Layout>
          }
        />
        <Route
          path="/projects/:id"
          element={
            <Layout>
              <ProjectDetails />
            </Layout>
          }
        />
        <Route
          path="/activity-logs"
          element={
            <Layout>
              <ActivityLogs />
            </Layout>
          }
        />
        <Route
          path="/profile"
          element={
            <Layout>
              <Profile />
            </Layout>
          }
        />
      </Route>

      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <BrowserRouter>
          <AppContent />
          <Toaster
            position="top-right"
            toastOptions={{
              className: "font-sans text-xs border border-border-main bg-surface text-text-main",
              duration: 3500,
              style: {
                background: "var(--surface-bg)",
                color: "var(--text-primary)",
                border: "1px solid var(--border-color)",
              },
            }}
          />
        </BrowserRouter>
      </PersistGate>
    </Provider>
  );
}
