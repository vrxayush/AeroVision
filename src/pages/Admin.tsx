import { ModernButton, ModernCard, ModernText } from "@/components/Modern";
import { ArrowLeft, Building2, GraduationCap, Lock, ShieldCheck, UserCog, Video, Wifi } from "lucide-react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function Admin() {
  const navigate = useNavigate();

  const rooms = [
    { id: "chairman", label: "Chairman Room", icon: Building2, status: "Secure", color: "text-purple-500", bg: "bg-purple-500/10" },
    { id: "director", label: "Director Room", icon: UserCog, status: "Monitoring", color: "text-blue-500", bg: "bg-blue-500/10" },
    { id: "hod-cse", label: "HOD CSE Room", icon: GraduationCap, status: "Active", color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { id: "hod-1yr", label: "HOD 1st Year Room", icon: GraduationCap, status: "Active", color: "text-orange-500", bg: "bg-orange-500/10" },
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
    <div className="min-h-screen bg-background relative overflow-hidden selection:bg-primary/20">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl animate-pulse" />
      
      <div className="relative z-10 p-8 max-w-6xl mx-auto flex flex-col gap-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <ModernButton onClick={() => navigate(-1)} variant="ghost" size="sm" className="rounded-full w-10 h-10 p-0 hover:bg-primary/10">
              <ArrowLeft className="h-5 w-5" />
            </ModernButton>
            <div>
              <h1 className="text-3xl font-bold text-foreground tracking-tight flex items-center gap-2">
                <ShieldCheck className="w-8 h-8 text-primary" />
                <ModernText text="Admin Control Center" />
              </h1>
              <p className="text-muted-foreground">Restricted access surveillance terminals</p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-secondary/50 rounded-full border border-border backdrop-blur-sm">
            <Wifi className="w-4 h-4 text-green-500" />
            <span className="text-xs font-mono text-muted-foreground">SECURE CONNECTION ESTABLISHED</span>
          </div>
        </motion.div>

        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {rooms.map((room) => (
            <motion.div key={room.id} variants={item}>
              <ModernCard className="group relative overflow-hidden p-6 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
                <div className="flex items-start justify-between mb-6">
                  <div className={`p-4 rounded-2xl ${room.bg} group-hover:scale-110 transition-transform duration-300`}>
                    <room.icon className={`w-8 h-8 ${room.color}`} />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">{room.status}</span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-foreground">{room.label}</h3>
                    <p className="text-sm text-muted-foreground">High security zone monitoring</p>
                  </div>
                  
                  <ModernButton 
                    className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                    variant="outline"
                    onClick={() => {
                      if (room.id === 'chairman') {
                        navigate('/chairman-room');
                      } else if (room.id === 'director') {
                        navigate('/director-room');
                      } else if (room.id === 'hod-cse') {
                        navigate('/hod-cse-room');
                      } else if (room.id === 'hod-1yr') {
                        navigate('/hod-1year-room');
                      } else {
                        toast(`Connecting to ${room.label} secure feed...`);
                      }
                    }}
                  >
                    <Video className="w-4 h-4 mr-2" />
                    Access Feed
                    <Lock className="w-3 h-3 ml-auto opacity-50" />
                  </ModernButton>
                </div>

                {/* Decorative background gradient */}
                <div className={`absolute -right-10 -bottom-10 w-32 h-32 ${room.bg} rounded-full blur-3xl opacity-0 group-hover:opacity-50 transition-opacity duration-500`} />
              </ModernCard>
            </motion.div>
          ))}
        </motion.div>

        {/* Additional Info Section */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-4 p-4 rounded-lg bg-secondary/30 border border-border/50 text-center"
        >
          <p className="text-xs text-muted-foreground font-mono">
            AUTHORIZED PERSONNEL ONLY • ACCESS LOGS ARE RECORDED • ID: ADMIN-8829
          </p>
        </motion.div>
      </div>
    </div>
  );
}
