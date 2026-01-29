import { Toaster } from "@/components/ui/sonner";
import { VlyToolbar } from "../vly-toolbar-readonly.tsx";
import { InstrumentationProvider } from "@/instrumentation.tsx";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import { StrictMode, useEffect, lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider, useLocation } from "react-router";
import "./index.css";
import "./types/global.d.ts";

// Lazy load route components for better code splitting
const Landing = lazy(() => import("./pages/Landing.tsx"));
const AuthPage = lazy(() => import("./pages/Auth.tsx"));
const Dashboard = lazy(() => import("./pages/Dashboard.tsx"));
const Admin = lazy(() => import("./pages/Admin.tsx"));
const ChairmanRoom = lazy(() => import("./pages/ChairmanRoom.tsx"));
const DirectorRoom = lazy(() => import("./pages/DirectorRoom.tsx"));
const HODCSERoom = lazy(() => import("./pages/HODCSERoom.tsx"));
const HOD1YearRoom = lazy(() => import("./pages/HOD1YearRoom.tsx"));
const Classroom = lazy(() => import("./pages/Classroom.tsx"));
const ClassroomDetails = lazy(() => import("./pages/ClassroomDetails.tsx"));
const EmptyClassrooms = lazy(() => import("./pages/EmptyClassrooms.tsx"));
const EmptyClassroomsDetails = lazy(() => import("./pages/EmptyClassroomsDetails.tsx"));
const ExamMode = lazy(() => import("./pages/ExamMode.tsx"));
const InactiveCameras = lazy(() => import("./pages/InactiveCameras.tsx"));
const Auditorium = lazy(() => import("./pages/Auditorium.tsx"));
const Settings = lazy(() => import("./pages/Settings.tsx"));
const Logs = lazy(() => import("./pages/Logs.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));

// Simple loading fallback for route transitions
function RouteLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="animate-pulse text-primary font-mono text-xl">LOADING SYSTEM...</div>
    </div>
  );
}

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

function RouteSyncer() {
  const location = useLocation();
  useEffect(() => {
    window.parent.postMessage(
      { type: "iframe-route-change", path: location.pathname },
      "*",
    );
  }, [location.pathname]);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.data?.type === "navigate") {
        if (event.data.direction === "back") window.history.back();
        if (event.data.direction === "forward") window.history.forward();
      }
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return null;
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <Landing />,
  },
  {
    path: "/dashboard",
    element: <Dashboard />,
  },
  {
    path: "/admin",
    element: <Admin />,
  },
  {
    path: "/chairman-room",
    element: <ChairmanRoom />,
  },
  {
    path: "/director-room",
    element: <DirectorRoom />,
  },
  {
    path: "/hod-cse-room",
    element: <HODCSERoom />,
  },
  {
    path: "/hod-1year-room",
    element: <HOD1YearRoom />,
  },
  {
    path: "/classroom",
    element: <Classroom />,
  },
  {
    path: "/classroom/:yearId",
    element: <ClassroomDetails />,
  },
  {
    path: "/empty-classrooms",
    element: <EmptyClassrooms />,
  },
  {
    path: "/empty-classrooms/:yearId",
    element: <EmptyClassroomsDetails />,
  },
  {
    path: "/exam-mode",
    element: <ExamMode />,
  },
  {
    path: "/inactive-cameras",
    element: <InactiveCameras />,
  },
  {
    path: "/auditorium",
    element: <Auditorium />,
  },
  {
    path: "/settings",
    element: <Settings />,
  },
  {
    path: "/logs",
    element: <Logs />,
  },
  {
    path: "/auth",
    element: <AuthPage redirectAfterAuth="/dashboard" />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <VlyToolbar />
    <InstrumentationProvider>
      <ConvexAuthProvider client={convex}>
        <RouterProvider router={router} />
        <Toaster />
      </ConvexAuthProvider>
    </InstrumentationProvider>
  </StrictMode>,
);
