import { ModernButton, ModernCard, ModernText } from "@/components/Modern";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { AlertTriangle, BookOpen, Camera, Shield, Users, Settings, FileText, DoorOpen, Siren, Presentation, CameraOff, Activity, Clock, Lock, Key } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function Dashboard() {
  const navigate = useNavigate();
  const stats = useQuery(api.aerovision.getDashboardStats);
  const seed = useMutation(api.aerovision.seedData);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [passkey, setPasskey] = useState("");

  const handleAdminAccess = () => {
    if (passkey === "admin") {
      toast.success("Access Granted: Welcome Admin");
      setIsAdminOpen(false);
      navigate("/admin");
      setPasskey("");
    } else {
      toast.error("Access Denied: Invalid Passkey");
      setPasskey("");
    }
  };

  useEffect(() => {
    seed();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, [seed]);

  if (!stats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="flex flex-col items-center gap-4 relative z-10">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-muted-foreground font-medium animate-pulse tracking-widest uppercase text-sm">Initializing System...</span>
        </div>
      </div>
    );
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden selection:bg-primary/20">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-3xl animate-pulse delay-700" />

      <div className="relative z-10 p-4 md:p-8 max-w-7xl mx-auto flex flex-col gap-8">
        {/* Header */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-border/50 backdrop-blur-sm"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground text-sm font-mono mb-1">
              <Clock className="w-3 h-3" />
              {currentTime.toLocaleTimeString()}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              <ModernText text="Shri Shankaracharya Technical Campus" />
            </h1>
            <p className="text-muted-foreground flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              Campus Surveillance Dashboard
            </p>
          </div>
          <div className="flex items-center gap-3 px-4 py-2 bg-green-500/5 border border-green-500/20 rounded-full backdrop-blur-md shadow-sm">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
            </span>
            <span className="text-sm font-medium text-green-600 dark:text-green-400 tracking-wide">SYSTEM ONLINE</span>
          </div>
        </motion.header>

        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-8"
        >
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Active CCTV */}
            <motion.div variants={item}>
              <ModernCard className="p-6 flex flex-col justify-between gap-4 hover:border-primary/30 transition-colors group bg-card/50 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-primary/10 rounded-xl group-hover:scale-110 transition-transform duration-300">
                    <Camera className="w-6 h-6 text-primary" />
                  </div>
                  <span className="text-[10px] font-bold tracking-wider px-2 py-1 bg-primary/5 text-primary rounded-full border border-primary/10">LIVE FEED</span>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Active Cameras</h3>
                  <p className="text-4xl font-bold text-foreground mt-2 tracking-tight">{stats.activeCCTVCount}</p>
                </div>
              </ModernCard>
            </motion.div>

            {/* Exam Mode */}
            <motion.div variants={item}>
              <ModernCard className={`p-6 flex flex-col justify-between gap-4 border-l-4 transition-all duration-300 bg-card/50 backdrop-blur-sm ${stats.examMode ? "border-l-destructive shadow-[0_0_20px_-10px_var(--color-destructive)]" : "border-l-transparent hover:border-l-primary/50"}`}>
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-xl transition-transform duration-300 group-hover:scale-110 ${stats.examMode ? "bg-destructive/10" : "bg-primary/10"}`}>
                    <Shield className={`w-6 h-6 ${stats.examMode ? "text-destructive" : "text-primary"}`} />
                  </div>
                  {stats.examMode && (
                    <span className="text-[10px] font-bold tracking-wider px-2 py-1 bg-destructive/10 text-destructive rounded-full border border-destructive/10 animate-pulse">ACTIVE</span>
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Exam Mode</h3>
                  <p className={`text-4xl font-bold mt-2 tracking-tight ${stats.examMode ? "text-destructive" : "text-foreground"}`}>
                    {stats.examMode ? "1" : "0"}
                  </p>
                </div>
              </ModernCard>
            </motion.div>

            {/* Empty Classroom */}
            <motion.div variants={item}>
              <ModernCard className="p-6 flex flex-col justify-between gap-4 hover:border-blue-500/30 transition-colors group bg-card/50 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-blue-500/10 rounded-xl group-hover:scale-110 transition-transform duration-300">
                    <BookOpen className="w-6 h-6 text-blue-500" />
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Empty Classrooms</h3>
                  <p className="text-4xl font-bold text-foreground mt-2 tracking-tight">{stats.emptyClassroomCount}</p>
                </div>
              </ModernCard>
            </motion.div>

            {/* Inactive CCTV */}
            <motion.div variants={item}>
              <ModernCard className="p-6 flex flex-col justify-between gap-4 hover:border-orange-500/30 transition-colors group bg-card/50 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-orange-500/10 rounded-xl group-hover:scale-110 transition-transform duration-300">
                    <AlertTriangle className="w-6 h-6 text-orange-500" />
                  </div>
                  <span className="text-[10px] font-bold tracking-wider px-2 py-1 bg-orange-500/10 text-orange-600 rounded-full border border-orange-500/20">ATTENTION</span>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Inactive Cameras</h3>
                  <p className="text-4xl font-bold text-foreground mt-2 tracking-tight">{stats.inactiveCCTVCount}</p>
                </div>
              </ModernCard>
            </motion.div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground/80 tracking-tight flex items-center gap-2">
              <div className="w-1 h-6 bg-primary rounded-full" />
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Admin Mode", icon: Shield, path: "/admin", desc: "System Control", color: "hover:border-destructive/50 hover:bg-destructive/5", iconColor: "text-destructive" },
                { label: "Classrooms", icon: Users, path: "/classroom", desc: "View Occupancy", color: "hover:border-primary/50 hover:bg-primary/5", iconColor: "text-primary" },
                { label: "Empty Classrooms", icon: DoorOpen, path: "/empty-classrooms", desc: "Find Space", color: "hover:border-blue-400/50 hover:bg-blue-400/5", iconColor: "text-blue-400" },
                { label: "Exam Mode", icon: Siren, path: "/exam-mode", desc: "Toggle Protocols", color: "hover:border-destructive/50 hover:bg-destructive/5", iconColor: "text-destructive" },
                { label: "Auditorium", icon: Presentation, path: "/auditorium", desc: "Live Events", color: "hover:border-purple-500/50 hover:bg-purple-500/5", iconColor: "text-purple-500" },
                { label: "Inactive Cameras", icon: CameraOff, path: "/inactive-cameras", desc: "Maintenance", color: "hover:border-orange-500/50 hover:bg-orange-500/5", iconColor: "text-orange-500" },
                { label: "Settings", icon: Settings, path: "/settings", desc: "Configuration", color: "hover:border-foreground/50 hover:bg-secondary/50", iconColor: "text-foreground" },
                { label: "System Logs", icon: FileText, path: "/logs", desc: "Activity History", color: "hover:border-foreground/50 hover:bg-secondary/50", iconColor: "text-foreground" },
              ].map((btn, idx) => (
                <motion.div key={idx} variants={item} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <ModernButton 
                    onClick={() => {
                      if (btn.path === "/admin") {
                        setIsAdminOpen(true);
                      } else {
                        navigate(btn.path);
                      }
                    }} 
                    variant="outline"
                    className={`h-auto w-full p-4 flex items-center justify-between group relative overflow-hidden border-muted-foreground/20 transition-all duration-300 ${btn.color}`}
                  >
                    <div className="flex items-center gap-4 z-10">
                      <div className={`p-2.5 rounded-xl bg-secondary/50 group-hover:bg-background shadow-sm transition-all duration-300 group-hover:scale-110`}>
                        <btn.icon className={`w-5 h-5 ${btn.iconColor}`} />
                      </div>
                      <div className="text-left">
                        <div className="font-semibold text-sm text-foreground">{btn.label}</div>
                        <div className="text-xs text-muted-foreground font-normal">{btn.desc}</div>
                      </div>
                    </div>
                    {/* Subtle background gradient on hover */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                  </ModernButton>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Admin Security Dialog */}
      <Dialog open={isAdminOpen} onOpenChange={setIsAdminOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Shield className="w-5 h-5" />
              Security Clearance Required
            </DialogTitle>
            <DialogDescription>
              This area is restricted to authorized personnel only. Please enter your administrator passkey to continue.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="passkey">Administrator Passkey</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="passkey"
                  type="password"
                  placeholder="Enter secure passkey..."
                  className="pl-9 font-mono"
                  value={passkey}
                  onChange={(e) => setPasskey(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAdminAccess()}
                  autoFocus
                />
              </div>
            </div>
            <ModernButton className="w-full bg-destructive hover:bg-destructive/90 text-destructive-foreground" onClick={handleAdminAccess}>
              <Key className="w-4 h-4 mr-2" />
              Verify Identity
            </ModernButton>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
