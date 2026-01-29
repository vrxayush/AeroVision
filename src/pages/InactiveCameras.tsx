import { ModernButton, ModernCard, ModernText } from "@/components/Modern";
import { ArrowLeft, CameraOff, MapPin, Calendar, Clock, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";

export default function InactiveCameras() {
  const navigate = useNavigate();

  const inactiveCameras = [
    { id: "CAM-01", location: "Classroom 4103", lastActive: "2025-10-26 14:30:00" },
    { id: "CAM-04", location: "Classroom 3213", lastActive: "2025-10-25 09:15:00" },
    { id: "CAM-07", location: "Classroom 4201", lastActive: "2025-10-27 08:00:00" },
    { id: "CAM-12", location: "Classroom 1105", lastActive: "2025-10-24 16:45:00" },
    { id: "CAM-15", location: "Corridor A", lastActive: "2025-10-26 11:20:00" },
    { id: "CAM-22", location: "Computer Lab 3", lastActive: "2025-10-23 13:10:00" },
    { id: "CAM-28", location: "Library Entrance", lastActive: "2025-10-27 10:05:00" },
  ];

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
    <div className="min-h-screen bg-background relative overflow-hidden selection:bg-orange-500/20 p-8">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-orange-500/5 rounded-full blur-3xl animate-pulse" />

      <div className="relative z-10 max-w-5xl mx-auto flex flex-col gap-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <ModernButton onClick={() => navigate(-1)} variant="ghost" size="sm" className="rounded-full w-10 h-10 p-0 hover:bg-orange-500/10">
            <ArrowLeft className="h-5 w-5" />
          </ModernButton>
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight flex items-center gap-2">
              <CameraOff className="w-8 h-8 text-orange-500" />
              <ModernText text="Inactive Cameras" />
            </h1>
            <p className="text-muted-foreground">System Maintenance & Status Report</p>
          </div>
        </div>

        {/* Summary Card */}
        <ModernCard className="p-6 border-orange-500/20 bg-orange-500/5">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-500/10 rounded-full">
                    <AlertTriangle className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-foreground">Attention Required</h3>
                    <p className="text-sm text-muted-foreground">
                        <span className="font-bold text-orange-500">{inactiveCameras.length} cameras</span> are currently offline and require maintenance.
                    </p>
                </div>
            </div>
        </ModernCard>

        {/* Camera List */}
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {inactiveCameras.map((cam) => (
            <motion.div key={cam.id} variants={item}>
              <ModernCard className="p-4 hover:border-orange-500/30 transition-all group">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground group-hover:text-orange-500 transition-colors">
                            <CameraOff className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-foreground">{cam.id}</h3>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <MapPin className="w-3 h-3" />
                                {cam.location}
                            </div>
                        </div>
                    </div>
                    <div className="px-2 py-1 rounded text-[10px] font-bold bg-orange-500/10 text-orange-500 border border-orange-500/20 uppercase tracking-wider">
                        OFFLINE
                    </div>
                </div>
                
                <div className="pt-4 border-t border-border/50 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground text-xs">Last Active:</span>
                    <div className="flex items-center gap-2 font-mono text-xs text-foreground/80">
                        <Calendar className="w-3 h-3" />
                        {cam.lastActive.split(' ')[0]}
                        <Clock className="w-3 h-3 ml-1" />
                        {cam.lastActive.split(' ')[1]}
                    </div>
                </div>
              </ModernCard>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
