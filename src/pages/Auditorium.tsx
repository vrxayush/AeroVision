import { ModernButton, ModernCard } from "@/components/Modern";
import { ArrowLeft, Presentation, Users, Video, Volume2 } from "lucide-react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

export default function Auditorium() {
  const navigate = useNavigate();

  const feeds = [
    { id: 1, name: "Main Stage", status: "active", viewers: 12 },
    { id: 2, name: "Audience Left", status: "active", viewers: 8 },
    { id: 3, name: "Audience Right", status: "active", viewers: 5 },
    { id: 4, name: "Entrance Lobby", status: "idle", viewers: 0 },
  ];

  return (
    <div className="min-h-screen p-8 flex flex-col gap-8 max-w-6xl mx-auto bg-background">
      <div className="flex items-center gap-4">
        <ModernButton onClick={() => navigate(-1)} variant="ghost" size="sm" className="rounded-full w-10 h-10 p-0">
          <ArrowLeft className="h-5 w-5" />
        </ModernButton>
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            Auditorium Control
          </h1>
          <p className="text-muted-foreground">Live feeds and environment management</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {feeds.map((feed) => (
          <ModernCard key={feed.id} className="overflow-hidden group">
            <div className="aspect-video bg-black/90 relative flex items-center justify-center">
              <Video className="w-12 h-12 text-muted-foreground/20 group-hover:text-primary/50 transition-colors" />
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${feed.status === 'active' ? 'bg-red-500 animate-pulse' : 'bg-yellow-500'}`} />
                <span className="text-xs font-mono text-white/80 uppercase">{feed.status}</span>
              </div>
              <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm px-2 py-1 rounded text-xs text-white/80 font-mono">
                CAM-0{feed.id}
              </div>
            </div>
            <div className="p-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-foreground">{feed.name}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="w-3 h-3" />
                  {feed.viewers} Monitoring
                </div>
              </div>
              <ModernButton size="sm" variant="outline" onClick={() => toast(`Accessing ${feed.name} feed...`)}>
                View Fullscreen
              </ModernButton>
            </div>
          </ModernCard>
        ))}
      </div>

      <ModernCard className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-primary/10 rounded-xl">
            <Volume2 className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Audio System</h2>
            <p className="text-sm text-muted-foreground">Master volume and zone control</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {['Main Speakers', 'Stage Monitors', 'Lobby Ambience'].map((zone) => (
                <div key={zone} className="p-4 rounded-lg bg-secondary/50 border border-border flex items-center justify-between">
                    <span className="font-medium">{zone}</span>
                    <div className="h-2 w-24 bg-primary/20 rounded-full overflow-hidden">
                        <div className="h-full w-[70%] bg-primary rounded-full" />
                    </div>
                </div>
            ))}
        </div>
      </ModernCard>
    </div>
  );
}
