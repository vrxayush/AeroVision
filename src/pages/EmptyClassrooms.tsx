import { ModernButton, ModernCard } from "@/components/Modern";
import { ArrowLeft, DoorOpen, ChevronRight, School } from "lucide-react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

export default function EmptyClassrooms() {
  const navigate = useNavigate();

  const years = [
    { year: 1, label: "1st Year Block", count: 5, color: "text-blue-500", bg: "bg-blue-500/10" },
    { year: 2, label: "2nd Year Block", count: 3, color: "text-purple-500", bg: "bg-purple-500/10" },
    { year: 3, label: "3rd Year Block", count: 8, color: "text-pink-500", bg: "bg-pink-500/10" },
    { year: 4, label: "4th Year Block", count: 2, color: "text-orange-500", bg: "bg-orange-500/10" },
  ];

  return (
    <div className="min-h-screen p-8 flex flex-col gap-8 max-w-6xl mx-auto bg-background">
      <div className="flex items-center gap-4">
        <ModernButton onClick={() => navigate(-1)} variant="ghost" size="sm" className="rounded-full w-10 h-10 p-0">
          <ArrowLeft className="h-5 w-5" />
        </ModernButton>
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            Empty Classrooms
          </h1>
          <p className="text-muted-foreground">Real-time availability of study spaces</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-4">
        {years.map((item) => (
          <ModernCard 
            key={item.year} 
            className="group cursor-pointer hover:-translate-y-1 hover:shadow-lg transition-all duration-300 overflow-hidden" 
            onClick={() => navigate(`/empty-classrooms/${item.year}`)}
          >
            <div className="p-6 space-y-6">
              <div className="flex justify-between items-start">
                <div className={`p-3 rounded-xl ${item.bg}`}>
                  <DoorOpen className={`w-6 h-6 ${item.color}`} />
                </div>
                <span className="text-xs font-medium px-2 py-1 bg-secondary rounded-md text-muted-foreground">
                  Available
                </span>
              </div>
              
              <div>
                <h2 className="text-2xl font-bold text-foreground">{item.label}</h2>
                <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                  <School className="w-4 h-4" />
                  <span className="text-sm">
                    <span className="font-semibold text-foreground">{item.count}</span> Rooms Empty
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <div className="flex items-center justify-between text-sm font-medium text-primary group-hover:translate-x-1 transition-transform">
                  View Details
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </ModernCard>
        ))}
      </div>
    </div>
  );
}
