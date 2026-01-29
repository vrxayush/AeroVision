import { ModernButton, ModernCard } from "@/components/Modern";
import { ArrowLeft, AlertTriangle, CheckCircle, Info, Clock } from "lucide-react";
import { useNavigate } from "react-router";

export default function Logs() {
  const navigate = useNavigate();

  const logs = [
    { type: "info", message: "System startup sequence initiated", time: "08:00:00 AM", icon: Info, color: "text-blue-500" },
    { type: "success", message: "All CCTV cameras connected successfully", time: "08:00:05 AM", icon: CheckCircle, color: "text-green-500" },
    { type: "warning", message: "Motion detected in Corridor B (North Wing)", time: "09:15:22 AM", icon: AlertTriangle, color: "text-orange-500" },
    { type: "info", message: "Scheduled database backup completed", time: "10:00:00 AM", icon: Info, color: "text-blue-500" },
    { type: "warning", message: "High latency detected on Cam-04", time: "10:45:11 AM", icon: AlertTriangle, color: "text-orange-500" },
    { type: "success", message: "Exam Mode activated by Admin", time: "11:00:00 AM", icon: CheckCircle, color: "text-green-500" },
  ];

  return (
    <div className="min-h-screen p-8 flex flex-col gap-8 max-w-5xl mx-auto bg-background">
      <div className="flex items-center gap-4">
        <ModernButton onClick={() => navigate(-1)} variant="ghost" size="sm" className="rounded-full w-10 h-10 p-0">
          <ArrowLeft className="h-5 w-5" />
        </ModernButton>
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            System Logs
          </h1>
          <p className="text-muted-foreground">Real-time system activity and alerts</p>
        </div>
      </div>

      <ModernCard className="overflow-hidden">
        <div className="divide-y divide-border">
          {logs.map((log, index) => (
            <div key={index} className="p-4 flex items-center gap-4 hover:bg-secondary/50 transition-colors">
              <div className={`p-2 rounded-lg bg-secondary/50 ${log.color}`}>
                <log.icon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">{log.message}</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground font-mono">
                <Clock className="w-3 h-3" />
                {log.time}
              </div>
            </div>
          ))}
        </div>
      </ModernCard>
    </div>
  );
}
