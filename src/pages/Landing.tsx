import { ModernButton, ModernText } from "@/components/Modern";
import { motion } from "framer-motion";
import { useNavigate } from "react-router";
import { Shield, Camera, BarChart3, Lock, Zap, Globe } from "lucide-react";

export default function Landing() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Camera,
      title: "Real-time Surveillance",
      desc: "24/7 active monitoring of campus premises with instant feed access."
    },
    {
      icon: Shield,
      title: "AI Exam Proctoring",
      desc: "Automated exam mode with intelligent behavior detection systems."
    },
    {
      icon: BarChart3,
      title: "Smart Analytics",
      desc: "Data-driven insights on classroom occupancy and resource usage."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-background selection:bg-primary/20">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-3xl animate-pulse delay-1000" />

      {/* Navbar / Header */}
      <header className="relative z-10 w-full max-w-7xl mx-auto p-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                <Globe className="w-5 h-5 text-primary" />
            </div>
            <span className="font-bold text-xl tracking-tight">AeroVision</span>
        </div>
        <div className="flex items-center gap-4 text-sm font-medium text-muted-foreground">
            <span className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                System Online
            </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center relative z-10 px-4 py-12 md:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center space-y-8 max-w-5xl mx-auto"
        >
          <div className="space-y-6">
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary/50 border border-border backdrop-blur-sm"
            >
              <Zap className="w-3 h-3 text-yellow-500 fill-yellow-500" />
              <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">Next Gen Campus Security</span>
            </motion.div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter text-foreground leading-[1.1]">
              The Future of <br />
              <ModernText text="Campus Safety" gradient />
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground font-light tracking-wide max-w-2xl mx-auto leading-relaxed">
              A comprehensive surveillance ecosystem designed for modern educational institutions. 
              Monitor, manage, and secure your campus with intelligent insights.
            </p>
          </div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="pt-4"
          >
            <ModernButton 
              onClick={() => navigate("/dashboard")}
              size="lg"
              className="text-lg px-10 py-7 rounded-full shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all"
            >
              Launch Dashboard
            </ModernButton>
          </motion.div>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 max-w-6xl w-full px-4">
            {features.map((feature, index) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + (index * 0.1) }}
                    className="group p-6 rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm hover:bg-card hover:border-primary/20 transition-all duration-300 hover:-translate-y-1"
                >
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                        <feature.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-foreground">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                        {feature.desc}
                    </p>
                </motion.div>
            ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-8 text-center text-sm text-muted-foreground/40 font-mono">
        <div className="flex items-center justify-center gap-4">
            <span className="flex items-center gap-1.5">
                <Lock className="w-3 h-3" />
                End-to-End Encrypted
            </span>
            <span>•</span>
            <span>v1.0.0 Stable</span>
        </div>
      </footer>
    </div>
  );
}
