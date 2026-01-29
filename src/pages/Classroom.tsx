import { ModernButton, ModernCard, ModernText } from "@/components/Modern";
import { ArrowLeft, GraduationCap, Users, ChevronRight, Camera, Shield, Key } from "lucide-react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function Classroom() {
  const navigate = useNavigate();
  const [sshCode, setSshCode] = useState("");

  const handleVerify = () => {
    if (!sshCode) {
      toast.error("Please enter an SSH code");
      return;
    }
    toast.success("Verifying SSH Access...");
    setTimeout(() => {
      toast.error("Access Denied: Invalid Credentials");
      setSshCode("");
    }, 1000);
  };

  const cctvStats = [
    { year: 1, label: "1st Year", count: 24, color: "text-blue-500", bg: "bg-blue-500/10" },
    { year: 2, label: "2nd Year", count: 18, color: "text-purple-500", bg: "bg-purple-500/10" },
    { year: 3, label: "3rd Year", count: 32, color: "text-pink-500", bg: "bg-pink-500/10" },
    { year: 4, label: "4th Year", count: 28, color: "text-orange-500", bg: "bg-orange-500/10" },
  ];

  const examStats = [
    { year: 1, label: "1st Year Exams", count: 0, color: "text-red-500", bg: "bg-red-500/10" },
    { year: 2, label: "2nd Year Exams", count: 0, color: "text-indigo-500", bg: "bg-indigo-500/10" },
    { year: 3, label: "3rd Year Exams", count: 0, color: "text-cyan-500", bg: "bg-cyan-500/10" },
    { year: 4, label: "4th Year Exams", count: 0, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  ];

  return (
    <div className="min-h-screen p-8 flex flex-col gap-8 max-w-6xl mx-auto bg-background">
      {/* Header */}
      <div className="flex items-center gap-4">
        <ModernButton onClick={() => navigate(-1)} variant="ghost" size="sm" className="rounded-full w-10 h-10 p-0">
          <ArrowLeft className="h-5 w-5" />
        </ModernButton>
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            Classroom Monitoring
          </h1>
          <p className="text-muted-foreground">Real-time surveillance and exam status</p>
        </div>
      </div>

      {/* CCTV Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
          <Camera className="w-5 h-5 text-primary" />
          Active CCTV Feeds
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cctvStats.map((item) => (
            <ModernCard 
              key={item.year} 
              className="group cursor-pointer hover:-translate-y-1 hover:shadow-lg transition-all duration-300 overflow-hidden" 
              onClick={() => navigate(`/classroom/${item.year}`)}
            >
              <div className="p-6 space-y-6">
                <div className="flex justify-between items-start">
                  <div className={`p-3 rounded-xl ${item.bg}`}>
                    <Camera className={`w-6 h-6 ${item.color}`} />
                  </div>
                  <span className="text-xs font-medium px-2 py-1 bg-secondary rounded-md text-muted-foreground">
                    Live
                  </span>
                </div>
                
                <div>
                  <h2 className="text-2xl font-bold text-foreground">{item.label}</h2>
                  <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-sm">
                      <span className="font-semibold text-foreground">{item.count}</span> Active CCTVs
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <div className="flex items-center justify-between text-sm font-medium text-primary group-hover:translate-x-1 transition-transform">
                    View Feed
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </ModernCard>
          ))}
        </div>
      </div>

      {/* Exam Mode Section */}
      <div className="space-y-4 pt-4 border-t border-border/50">
        <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
          <Shield className="w-5 h-5 text-red-500" />
          Exam Mode
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {examStats.map((item) => (
            <Dialog key={item.year}>
              <DialogTrigger asChild>
                <ModernCard 
                  className="group cursor-pointer hover:-translate-y-1 hover:shadow-lg transition-all duration-300 overflow-hidden" 
                >
                  <div className="p-6 space-y-6">
                    <div className="flex justify-between items-start">
                      <div className={`p-3 rounded-xl ${item.bg}`}>
                        <GraduationCap className={`w-6 h-6 ${item.color}`} />
                      </div>
                      <span className="text-xs font-medium px-2 py-1 bg-secondary rounded-md text-muted-foreground">
                        Restricted
                      </span>
                    </div>
                    
                    <div>
                      <h2 className="text-2xl font-bold text-foreground">{item.label}</h2>
                      <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                        <Shield className="w-4 h-4" />
                        <span className="text-sm">
                          <span className="font-semibold text-foreground">{item.count}</span> Active Halls
                        </span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-border">
                      <div className="flex items-center justify-between text-sm font-medium text-primary group-hover:translate-x-1 transition-transform">
                        Enter Access Code
                        <Key className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </ModernCard>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-red-500" />
                    Restricted Exam Access
                  </DialogTitle>
                  <DialogDescription>
                    Enter the encrypted SSH code to access {item.label} surveillance.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Input 
                      placeholder="ssh-rsa AAAAB3NzaC1yc2E..." 
                      value={sshCode}
                      onChange={(e) => setSshCode(e.target.value)}
                      type="password"
                      className="font-mono text-xs"
                    />
                  </div>
                  <ModernButton className="w-full" onClick={handleVerify}>
                    <Key className="w-4 h-4 mr-2" />
                    Verify & Access
                  </ModernButton>
                </div>
              </DialogContent>
            </Dialog>
          ))}
        </div>
      </div>
    </div>
  );
}
