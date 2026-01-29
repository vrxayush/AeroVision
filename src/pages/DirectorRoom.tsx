import { ModernButton, ModernCard, ModernText } from "@/components/Modern";
import { ArrowLeft, UserCog, Clock, Monitor, Globe, Lock, History, AlertCircle, Key, Copy } from "lucide-react";
import { useNavigate } from "react-router";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";
import { toast } from "sonner";

export default function DirectorRoom() {
  const navigate = useNavigate();
  const [sshCode, setSshCode] = useState("");

  const generateNewCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    let result = "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQC";
    for (let i = 0; i < 64; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    result += "= director@aerowatch";
    setSshCode(result);
  };

  // Mock Data for Logs - Director Specific
  const entryLogs = [
    { id: 1, entry: "08:45:00 AM", exit: "12:00:00 PM", date: "2025-10-27" },
    { id: 2, entry: "01:00:00 PM", exit: "05:30:00 PM", date: "2025-10-27" },
    { id: 3, entry: "09:00:00 AM", exit: "06:00:00 PM", date: "2025-10-26" },
  ];

  const accessLogs = [
    { id: 1, ip: "192.168.1.50", device: "Director's iMac", time: "08:50:12 AM", user: "Director", browser: "Safari 17" },
    { id: 2, ip: "192.168.1.51", device: "Secretary Station", time: "09:15:00 AM", user: "Secretary", browser: "Chrome 118" },
    { id: 3, ip: "10.0.0.15", device: "Security Admin PC", time: "10:30:45 AM", user: "Head of Security", browser: "Firefox 119" },
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden selection:bg-blue-500/20 p-8">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-3xl animate-pulse" />

      <div className="relative z-10 max-w-6xl mx-auto flex flex-col gap-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <ModernButton onClick={() => navigate(-1)} variant="ghost" size="sm" className="rounded-full w-10 h-10 p-0 hover:bg-blue-500/10">
              <ArrowLeft className="h-5 w-5" />
            </ModernButton>
            <div>
              <h1 className="text-3xl font-bold text-foreground tracking-tight flex items-center gap-2">
                <UserCog className="w-8 h-8 text-blue-500" />
                <ModernText text="Director Room Surveillance" />
              </h1>
              <p className="text-muted-foreground">Administrative Control & Monitoring</p>
            </div>
          </div>

          <Dialog>
            <DialogTrigger asChild>
                <ModernButton 
                    variant="outline" 
                    className="gap-2 border-blue-500/50 text-blue-500 hover:bg-blue-500/10"
                    onClick={generateNewCode}
                >
                    <Key className="w-4 h-4" />
                    Encrypt Code
                </ModernButton>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Key className="w-5 h-5 text-blue-500" />
                        Generated SSH Key
                    </DialogTitle>
                    <DialogDescription>
                        Use this key for encrypted remote access. Do not share this code.
                    </DialogDescription>
                </DialogHeader>
                <div className="p-4 bg-secondary/50 rounded-lg border border-border break-all font-mono text-xs text-muted-foreground relative group">
                    {sshCode}
                </div>
                <div className="flex justify-end gap-2 mt-2">
                    <ModernButton size="sm" onClick={() => {
                         navigator.clipboard.writeText(sshCode);
                         toast.success("SSH Code copied to clipboard");
                    }}>
                        <Copy className="w-3 h-3 mr-2" />
                        Copy Code
                    </ModernButton>
                </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: CCTV Feed (Takes up 2 columns) */}
          <div className="lg:col-span-2 space-y-6">
            <ModernCard className="overflow-hidden border-blue-500/20 shadow-lg shadow-blue-500/5">
              <div className="aspect-video bg-black relative flex items-center justify-center group">
                {/* Placeholder for CCTV */}
                <div className="text-center space-y-4">
                    <div className="w-20 h-20 rounded-full border-2 border-white/10 flex items-center justify-center mx-auto animate-pulse">
                        <div className="w-16 h-16 rounded-full bg-white/5" />
                    </div>
                    <h2 className="text-2xl font-mono font-bold text-white/80 tracking-widest">CCTV FOOTAGE</h2>
                    <p className="text-white/40 text-sm font-mono">LIVE FEED • CAM-02 • DIRECTOR OFFICE</p>
                </div>

                {/* Overlay UI */}
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>
                  <span className="text-xs font-mono text-red-500 font-bold bg-black/50 px-2 py-1 rounded backdrop-blur-sm">LIVE</span>
                </div>
                <div className="absolute bottom-4 right-4 text-xs font-mono text-white/50 bg-black/50 px-2 py-1 rounded backdrop-blur-sm">
                    1920x1080 • 60FPS
                </div>
              </div>
            </ModernCard>

            {/* Room Details */}
             <ModernCard className="p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-blue-500" />
                    Room Status Details
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 rounded-lg bg-secondary/50 border border-border/50">
                        <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Occupancy</div>
                        <div className="font-bold text-lg">Occupied</div>
                    </div>
                    <div className="p-4 rounded-lg bg-secondary/50 border border-border/50">
                        <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Temperature</div>
                        <div className="font-bold text-lg">22°C</div>
                    </div>
                    <div className="p-4 rounded-lg bg-secondary/50 border border-border/50">
                        <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Lighting</div>
                        <div className="font-bold text-lg">On</div>
                    </div>
                    <div className="p-4 rounded-lg bg-secondary/50 border border-border/50">
                        <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Last Cleaned</div>
                        <div className="font-bold text-lg">07:30 AM</div>
                    </div>
                </div>
            </ModernCard>
          </div>

          {/* Right Column: Controls & Logs */}
          <div className="space-y-6">
            <ModernCard className="p-6 h-full flex flex-col">
                <div className="mb-6">
                    <h3 className="text-xl font-bold mb-2">Security Controls</h3>
                    <p className="text-sm text-muted-foreground">Manage access and view history.</p>
                </div>

                <div className="space-y-4 flex-1">
                    <Dialog>
                        <DialogTrigger asChild>
                            <ModernButton className="w-full h-14 text-lg justify-between group" variant="outline">
                                <span className="flex items-center gap-3">
                                    <History className="w-5 h-5 text-blue-500" />
                                    Security Logs
                                </span>
                                <div className="bg-blue-500/10 text-blue-500 px-2 py-1 rounded text-xs font-bold group-hover:bg-blue-500 group-hover:text-white transition-colors">
                                    VIEW
                                </div>
                            </ModernButton>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                    <UserCog className="w-6 h-6 text-blue-500" />
                                    Director Office Access Logs
                                </DialogTitle>
                                <DialogDescription>
                                    Detailed records of physical entry and digital access.
                                </DialogDescription>
                            </DialogHeader>
                            
                            <Tabs defaultValue="entry" className="w-full flex-1 flex flex-col overflow-hidden">
                                <TabsList className="grid w-full grid-cols-2 mb-4">
                                    <TabsTrigger value="entry">Physical Access</TabsTrigger>
                                    <TabsTrigger value="access">Website Access</TabsTrigger>
                                </TabsList>
                                
                                <TabsContent value="entry" className="flex-1 overflow-hidden">
                                    <ScrollArea className="h-[400px] pr-4">
                                        <div className="space-y-4">
                                            {entryLogs.map((log) => (
                                                <div key={log.id} className="flex items-center gap-4 p-4 rounded-lg border border-border bg-card/50 hover:bg-accent/50 transition-colors">
                                                    <div className="w-16 h-16 rounded-lg bg-secondary flex items-center justify-center text-xs font-bold text-muted-foreground border border-border shrink-0">
                                                        Image
                                                    </div>
                                                    <div className="flex-1 grid grid-cols-2 gap-x-4 gap-y-1">
                                                        <div className="col-span-2 text-sm font-bold text-foreground mb-1">{log.date}</div>
                                                        <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
                                                            <Clock className="w-3 h-3 text-green-500" /> 
                                                            In: {log.entry}
                                                        </div>
                                                        <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
                                                            <Clock className="w-3 h-3 text-red-500" /> 
                                                            Out: {log.exit}
                                                        </div>
                                                    </div>
                                                    <ModernButton size="sm" variant="outline" className="shrink-0">
                                                        Show Face
                                                    </ModernButton>
                                                </div>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                </TabsContent>
                                
                                <TabsContent value="access" className="flex-1 overflow-hidden">
                                    <ScrollArea className="h-[400px] pr-4">
                                        <div className="space-y-4">
                                            {accessLogs.map((log) => (
                                                <div key={log.id} className="flex flex-col gap-2 p-4 rounded-lg border border-border bg-card/50 hover:bg-accent/50 transition-colors">
                                                    <div className="flex justify-between items-start">
                                                        <div className="flex items-center gap-2">
                                                            <Monitor className="w-4 h-4 text-blue-500" />
                                                            <h4 className="font-bold text-foreground">{log.device}</h4>
                                                        </div>
                                                        <span className="text-xs font-mono text-muted-foreground">{log.time}</span>
                                                    </div>
                                                    
                                                    <div className="grid grid-cols-2 gap-2 mt-1">
                                                        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary/50 px-2 py-1.5 rounded">
                                                            <Lock className="w-3 h-3" />
                                                            IP: {log.ip}
                                                        </div>
                                                        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary/50 px-2 py-1.5 rounded">
                                                            <Globe className="w-3 h-3" />
                                                            {log.browser}
                                                        </div>
                                                    </div>
                                                    <div className="text-xs text-blue-500 font-medium px-1">
                                                        User: {log.user}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                </TabsContent>
                            </Tabs>
                        </DialogContent>
                    </Dialog>

                    <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20 mt-auto">
                        <h4 className="text-sm font-bold text-yellow-600 dark:text-yellow-500 mb-1 flex items-center gap-2">
                            <Lock className="w-3 h-3" />
                            Restricted Access
                        </h4>
                        <p className="text-xs text-muted-foreground">
                            This feed is encrypted and logged. Unauthorized access is a punishable offense.
                        </p>
                    </div>
                </div>
            </ModernCard>
          </div>
        </div>
      </div>
    </div>
  );
}
