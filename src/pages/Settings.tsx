import { ModernButton, ModernCard } from "@/components/Modern";
import { ArrowLeft, Bell, Moon, Shield, Volume2, Wifi } from "lucide-react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

export default function Settings() {
  const navigate = useNavigate();

  const settings = [
    { icon: Bell, title: "Notifications", desc: "Manage alert preferences", active: true },
    { icon: Shield, title: "Security Level", desc: "High security enabled", active: true },
    { icon: Wifi, title: "Network Status", desc: "Connected to Campus_Secure", active: true },
    { icon: Moon, title: "Dark Mode", desc: "System default", active: false },
    { icon: Volume2, title: "Sound Alerts", desc: "Enabled for critical events", active: true },
  ];

  return (
    <div className="min-h-screen p-8 flex flex-col gap-8 max-w-4xl mx-auto bg-background">
      <div className="flex items-center gap-4">
        <ModernButton onClick={() => navigate(-1)} variant="ghost" size="sm" className="rounded-full w-10 h-10 p-0">
          <ArrowLeft className="h-5 w-5" />
        </ModernButton>
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            System Settings
          </h1>
          <p className="text-muted-foreground">Configure system parameters and preferences</p>
        </div>
      </div>

      <div className="grid gap-4">
        {settings.map((item, index) => (
          <ModernCard key={index} className="p-6 flex items-center justify-between group hover:border-primary/50 transition-colors">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${item.active ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"}`}>
                <item.icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-foreground">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${item.active ? "bg-green-500" : "bg-secondary-foreground/20"}`} />
              <ModernButton 
                variant="outline" 
                size="sm"
                onClick={() => toast(`Configuring ${item.title}...`)}
              >
                Configure
              </ModernButton>
            </div>
          </ModernCard>
        ))}
      </div>
    </div>
  );
}
