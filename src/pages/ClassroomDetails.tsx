import { ModernButton, ModernCard, ModernText } from "@/components/Modern";
import { ArrowLeft, Video, User, Users, Calendar, Clock, GraduationCap, BookOpen, Key, Zap, Shield, Power, Copy, Lightbulb, Fan, Tv, FileText } from "lucide-react";
import { useNavigate, useParams } from "react-router";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useState } from "react";

// Component for individual classroom item to handle independent state
const ClassroomItem = ({ room, getFloorLabel }: { room: any, getFloorLabel: (f: number) => string }) => {
  const [sshCode, setSshCode] = useState("");
  const [examKey, setExamKey] = useState("");
  const [lights, setLights] = useState(true);
  const [fans, setFans] = useState(true);
  const [projector, setProjector] = useState(false);

  const generateCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    let result = "ssh-rsa ";
    for (let i = 0; i < 24; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    result += ` room.${room.id}@aerowatch`;
    setSshCode(result);
  };

  const handleExamMode = () => {
    if (!examKey) {
      toast.error("Please enter an SSH code");
      return;
    }
    toast.success("Verifying credentials...");
    setTimeout(() => {
      toast.success(`Exam Mode Activated for Room ${room.id}`);
      setExamKey("");
    }, 1000);
  };

  return (
    <AccordionItem value={`item-${room.id}`} className="border border-border/50 rounded-xl px-4 bg-background/50 overflow-hidden">
      <AccordionTrigger className="hover:no-underline py-4">
        <div className="flex items-center gap-4 w-full text-left">
          <div className="p-2 bg-primary/10 rounded-lg text-primary">
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
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              Live Class • {room.subject}
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
              <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/60 text-white/80 text-[10px] font-mono rounded">
                  {room.attendance}
              </div>
          </div>

          {/* Right: Details */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                  <User className="w-3 h-3" /> Professor
                </div>
                <div className="font-medium text-sm">{room.professor}</div>
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <BookOpen className="w-3 h-3" /> {room.subject}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Status
                </div>
                <div className="font-bold text-primary text-sm">{room.status}</div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-secondary/30 border border-border/50 space-y-2">
              <div className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <GraduationCap className="w-3 h-3" /> Next Lecture
              </div>
              <div className="font-medium text-sm">{room.nextLecture}</div>
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" /> {room.nextLectureTime}
              </div>
            </div>

            {/* Control Buttons Grid */}
            <div className="grid grid-cols-2 gap-2">
              {/* 1. Encrypt / SSH Button */}
              <Dialog>
                <DialogTrigger asChild>
                  <ModernButton 
                      className="w-full h-9 text-xs" 
                      variant="outline"
                      onClick={generateCode}
                  >
                      <Key className="w-3 h-3 mr-2 text-orange-500" />
                      Generate SSH
                  </ModernButton>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Key className="w-5 h-5 text-orange-500" />
                      Room {room.id} Secure Key
                    </DialogTitle>
                    <DialogDescription>
                      Generated SSH key for secure remote access.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="p-4 bg-secondary/50 rounded-lg border border-border break-all font-mono text-xs text-muted-foreground relative">
                    {sshCode}
                  </div>
                  <ModernButton size="sm" onClick={() => {
                    navigator.clipboard.writeText(sshCode);
                    toast.success("Copied to clipboard");
                  }}>
                    <Copy className="w-3 h-3 mr-2" /> Copy Key
                  </ModernButton>
                </DialogContent>
              </Dialog>

              {/* 2. Exam Mode Button */}
              <Dialog>
                <DialogTrigger asChild>
                  <ModernButton 
                      className="w-full h-9 text-xs" 
                      variant="outline"
                  >
                      <Shield className="w-3 h-3 mr-2 text-red-500" />
                      Exam Mode
                  </ModernButton>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-red-500" />
                      Activate Exam Mode
                    </DialogTitle>
                    <DialogDescription>
                      Enter authorized SSH code to convert Room {room.id} to Exam Mode.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-2">
                    <div className="space-y-2">
                      <Label>SSH Authorization Code</Label>
                      <Input 
                        placeholder="ssh-rsa..." 
                        value={examKey}
                        onChange={(e) => setExamKey(e.target.value)}
                        type="password"
                        className="font-mono text-xs"
                      />
                    </div>
                    <ModernButton className="w-full" onClick={handleExamMode}>
                      Activate Protocol
                    </ModernButton>
                  </div>
                </DialogContent>
              </Dialog>

              {/* 3. Electricity Button */}
              <Dialog>
                <DialogTrigger asChild>
                  <ModernButton 
                      className="w-full h-9 text-xs" 
                      variant="outline"
                  >
                      <Zap className="w-3 h-3 mr-2 text-yellow-500" />
                      Power Usage
                  </ModernButton>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-yellow-500" />
                      Electricity Consumption
                    </DialogTitle>
                    <DialogDescription>
                      Monthly power usage statistics for Room {room.id}.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-4 py-2">
                    <div className="p-4 rounded-lg bg-secondary/50 border border-border text-center">
                      <div className="text-2xl font-bold text-foreground">450</div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wider">kWh Used</div>
                    </div>
                    <div className="p-4 rounded-lg bg-secondary/50 border border-border text-center">
                      <div className="text-2xl font-bold text-green-500">$54.00</div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wider">Est. Cost</div>
                    </div>
                    <div className="col-span-2 p-4 rounded-lg bg-secondary/50 border border-border flex justify-between items-center">
                      <span className="text-sm font-medium">Peak Usage Time</span>
                      <span className="text-sm font-mono text-muted-foreground">11:00 AM - 02:00 PM</span>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              {/* 4. Controls Button */}
              <Dialog>
                <DialogTrigger asChild>
                  <ModernButton 
                      className="w-full h-9 text-xs" 
                      variant="outline"
                  >
                      <Power className="w-3 h-3 mr-2 text-blue-500" />
                      Room Controls
                  </ModernButton>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Power className="w-5 h-5 text-blue-500" />
                      Room Automation
                    </DialogTitle>
                    <DialogDescription>
                      Control lighting and appliances for Room {room.id}.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6 py-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-yellow-500/10 text-yellow-500">
                          <Lightbulb className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-medium text-sm">Main Lights</div>
                          <div className="text-xs text-muted-foreground">Ceiling LEDs</div>
                        </div>
                      </div>
                      <Switch checked={lights} onCheckedChange={setLights} />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-blue-500/10 text-blue-500">
                          <Fan className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-medium text-sm">Ceiling Fans</div>
                          <div className="text-xs text-muted-foreground">All Units</div>
                        </div>
                      </div>
                      <Switch checked={fans} onCheckedChange={setFans} />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-purple-500/10 text-purple-500">
                          <Tv className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-medium text-sm">Projector</div>
                          <div className="text-xs text-muted-foreground">Smart Board</div>
                        </div>
                      </div>
                      <Switch checked={projector} onCheckedChange={setProjector} />
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              {/* 5. Timetable Button */}
              <Dialog>
                <DialogTrigger asChild>
                  <ModernButton 
                      className="w-full h-9 text-xs" 
                      variant="outline"
                  >
                      <Calendar className="w-3 h-3 mr-2 text-green-500" />
                      Timetable
                  </ModernButton>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-green-500" />
                      Class Timetable
                    </DialogTitle>
                    <DialogDescription>
                      Daily schedule for Room {room.id}.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-2 py-2">
                    {["10:00 AM - Physics", "11:00 AM - Chemistry", "12:00 PM - Lunch", "01:00 PM - PPS", "02:00 PM - EM", "03:00 PM - Library"].map((slot, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border/50">
                        <span className="text-sm font-medium">{slot.split(" - ")[1]}</span>
                        <span className="text-xs font-mono text-muted-foreground">{slot.split(" - ")[0]}</span>
                      </div>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>

              {/* 6. Attendance Button */}
              <Dialog>
                <DialogTrigger asChild>
                  <ModernButton 
                      className="w-full h-9 text-xs" 
                      variant="outline"
                  >
                      <Users className="w-3 h-3 mr-2 text-indigo-500" />
                      Attendance
                  </ModernButton>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-indigo-500" />
                      Student Attendance
                    </DialogTitle>
                    <DialogDescription>
                      Current occupancy details for Room {room.id}.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-2">
                    <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 border border-border">
                      <div>
                        <div className="text-2xl font-bold text-foreground">{room.attendance.split("/")[0]}</div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wider">Present</div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-muted-foreground">{room.attendance.split("/")[1].split(" ")[0]}</div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wider">Total</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs uppercase text-muted-foreground">Recent Entries</Label>
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                            S{i}
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium">Student {i}</div>
                            <div className="text-xs text-muted-foreground">ID: 202500{i}</div>
                          </div>
                          <div className="text-xs font-mono text-green-500">Present</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export default function ClassroomDetails() {
  const navigate = useNavigate();
  const { yearId } = useParams();

  // Configuration based on requirements
  const getYearConfig = (id: string | undefined) => {
    switch (id) {
      case '1': return { count: 24, label: "1st Year Block" };
      case '2': return { count: 18, label: "2nd Year Block" };
      case '3': return { count: 32, label: "3rd Year Block" };
      case '4': return { count: 28, label: "4th Year Block" };
      default: return { count: 10, label: "Unknown Block" };
    }
  };

  const config = getYearConfig(yearId);

  // Generate classrooms based on year and count
  // Logic: 1st digit = Year, 2nd digit = Floor
  const generateClassrooms = (year: string, count: number) => {
    const rooms = [];
    const subjects = ["Physics", "Chemistry", "PPS", "EM"];
    const times = [
      "10:00 AM - 11:00 AM",
      "11:00 AM - 12:00 PM",
      "01:00 PM - 02:00 PM",
      "02:00 PM - 03:00 PM",
      "03:00 PM - 04:00 PM"
    ];

    const getNextTime = (current: string) => {
      if (current.startsWith("10:00")) return "11:00 AM - 12:00 PM";
      if (current.startsWith("11:00")) return "12:00 PM - 01:00 PM";
      if (current.startsWith("01:00")) return "02:00 PM - 03:00 PM";
      if (current.startsWith("02:00")) return "03:00 PM - 04:00 PM";
      return "Day End";
    };

    for (let i = 0; i < count; i++) {
      // Distribute floors: 0 (Ground), 1 (1st), 2 (2nd)
      const floor = i % 3; 
      // Construct ID: Year + Floor + Sequence (2 digits)
      const sequence = String(i + 1).padStart(2, '0');
      const id = parseInt(`${year}${floor}${sequence}`);
      
      // Randomly assign subject and time
      const subject = subjects[i % subjects.length];
      const time = times[i % times.length];
      const nextTime = getNextTime(time);
      
      // Calculate next lecture based on current subject index
      const nextSubject = subjects[(i + 1) % subjects.length];

      rooms.push({
        id,
        floor,
        subject: subject,
        professor: "Dr. R.K. Gupta",
        attendance: "54/60 Present",
        status: "Lecture in Progress",
        nextLecture: nextSubject,
        time: time,
        nextLectureTime: nextTime
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
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl animate-pulse" />

      <div className="relative z-10 max-w-4xl mx-auto flex flex-col gap-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <ModernButton onClick={() => navigate(-1)} variant="ghost" size="sm" className="rounded-full w-10 h-10 p-0 hover:bg-primary/10">
            <ArrowLeft className="h-5 w-5" />
          </ModernButton>
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight flex items-center gap-2">
              <ModernText text={`Active Classes - ${config.label}`} />
            </h1>
            <p className="text-muted-foreground">
              Monitoring {config.count} active lectures
            </p>
          </div>
        </div>

        {/* Accordion List */}
        <ModernCard className="p-6 bg-card/50 backdrop-blur-sm">
          <Accordion type="single" collapsible className="w-full space-y-4">
            {classrooms.map((room) => (
              <ClassroomItem key={room.id} room={room} getFloorLabel={getFloorLabel} />
            ))}
          </Accordion>
        </ModernCard>
      </div>
    </div>
  );
}
