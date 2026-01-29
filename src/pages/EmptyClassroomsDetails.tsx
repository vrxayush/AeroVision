import { ModernButton, ModernCard, ModernText } from "@/components/Modern";
import { ArrowLeft, Video, User, Phone, Calendar, MapPin, Clock, GraduationCap } from "lucide-react";
import { useNavigate, useParams } from "react-router";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { toast } from "sonner";

export default function EmptyClassroomsDetails() {
  const navigate = useNavigate();
  const { yearId } = useParams();

  // Configuration based on requirements
  const getYearConfig = (id: string | undefined) => {
    switch (id) {
      case '1': return { count: 5, label: "1st Year Block" };
      case '2': return { count: 3, label: "2nd Year Block" };
      case '3': return { count: 8, label: "3rd Year Block" };
      case '4': return { count: 2, label: "4th Year Block" };
      default: return { count: 5, label: "Unknown Block" };
    }
  };

  const config = getYearConfig(yearId);

  // Generate classrooms based on year and count
  // Logic: 1st digit = Year, 2nd digit = Floor
  const generateClassrooms = (year: string, count: number) => {
    const rooms = [];
    for (let i = 0; i < count; i++) {
      // Distribute floors: 0 (Ground), 1 (1st), 2 (2nd)
      const floor = i % 3; 
      // Construct ID: Year + Floor + Sequence (2 digits)
      // e.g., Year 1, Floor 0, Index 0 -> 1001
      const sequence = String(i + 1).padStart(2, '0');
      const id = parseInt(`${year}${floor}${sequence}`);
      
      rooms.push({
        id,
        floor,
        incharge: "Dr. Anjali Sharma",
        phone: "+91 98765 43210",
        currentLecture: "Lecture 4 (Free)",
        professor: "N/A",
        nextLecture: "Physics - Prof. H.C. Verma",
        time: "11:30 AM - 12:30 PM"
      });
    }
    return rooms;
  };

  const classrooms = generateClassrooms(yearId || '1', config.count);

  const getFloorLabel = (floor: number) => {
    if (floor === 0) return "Ground Floor";
    if (floor === 1) return "1st Floor";
    if (floor === 2) return "2nd Floor";
    return `${floor}th Floor`;
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden selection:bg-primary/20 p-4 md:p-8">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-3xl animate-pulse" />

      <div className="relative z-10 max-w-4xl mx-auto flex flex-col gap-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <ModernButton onClick={() => navigate(-1)} variant="ghost" size="sm" className="rounded-full w-10 h-10 p-0 hover:bg-primary/10">
            <ArrowLeft className="h-5 w-5" />
          </ModernButton>
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight flex items-center gap-2">
              <ModernText text={`Empty Classrooms - ${config.label}`} />
            </h1>
            <p className="text-muted-foreground">
              Showing {config.count} available rooms
            </p>
          </div>
        </div>

        {/* Accordion List */}
        <ModernCard className="p-6 bg-card/50 backdrop-blur-sm">
          <Accordion type="single" collapsible className="w-full space-y-4">
            {classrooms.map((room) => (
              <AccordionItem key={room.id} value={`item-${room.id}`} className="border border-border/50 rounded-xl px-4 bg-background/50 overflow-hidden">
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex items-center gap-4 w-full text-left">
                    <div className="p-2 bg-green-500/10 rounded-lg text-green-500">
                      <Video className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-bold text-foreground">Room {room.id}</h3>
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-secondary rounded-full text-muted-foreground uppercase border border-border">
                          {getFloorLabel(room.floor)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        Live Surveillance Active
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4 pt-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-border/50 pt-4">
                    {/* Left: CCTV Placeholder */}
                    <div className="rounded-lg overflow-hidden border border-border bg-black aspect-video flex items-center justify-center relative group">
                        <div className="text-center">
                            <Video className="w-8 h-8 text-white/20 mx-auto mb-2 group-hover:text-primary transition-colors" />
                            <p className="text-white/40 font-mono text-xs">CCTV FEED • CAM-{room.id}</p>
                        </div>
                        <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-red-500/20 text-red-500 text-[10px] font-bold rounded border border-red-500/20">
                            REC
                        </div>
                    </div>

                    {/* Right: Details */}
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                            <User className="w-3 h-3" /> In-Charge
                          </div>
                          <div className="font-medium text-sm">{room.incharge}</div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <Phone className="w-3 h-3" /> {room.phone}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Current Status
                          </div>
                          <div className="font-bold text-green-500 text-sm">{room.currentLecture}</div>
                        </div>
                      </div>

                      <div className="p-3 rounded-lg bg-secondary/30 border border-border/50 space-y-2">
                        <div className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                          <GraduationCap className="w-3 h-3" /> Next Lecture
                        </div>
                        <div className="font-medium text-sm">{room.nextLecture}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {room.time}
                        </div>
                      </div>

                      <ModernButton 
                        className="w-full h-9 text-xs" 
                        variant="outline"
                        onClick={() => toast.info(`Opening timetable for Room ${room.id}`)}
                      >
                        <Calendar className="w-3 h-3 mr-2" />
                        View Full Timetable
                      </ModernButton>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </ModernCard>
      </div>
    </div>
  );
}
