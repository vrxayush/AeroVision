import { ModernButton, ModernCard, ModernText } from "@/components/Modern";
import { ArrowLeft, Siren, Terminal, FileWarning, ShieldAlert } from "lucide-react";
import { useNavigate } from "react-router";
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
import { toast } from "sonner";

export default function ExamMode() {
  const navigate = useNavigate();
  const [sshCode, setSshCode] = useState("");

  const handleCodeSubmit = () => {
    if (!sshCode) {
      toast.error("Please enter a valid SSH code");
      return;
    }
    toast.success("SSH Code verified. Exam protocols active.");
    setSshCode("");
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden selection:bg-destructive/20 p-8">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-destructive/5 rounded-full blur-3xl animate-pulse" />

      <div className="relative z-10 max-w-4xl mx-auto flex flex-col gap-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <ModernButton onClick={() => navigate(-1)} variant="ghost" size="sm" className="rounded-full w-10 h-10 p-0 hover:bg-destructive/10">
            <ArrowLeft className="h-5 w-5" />
          </ModernButton>
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight flex items-center gap-2">
              <Siren className="w-8 h-8 text-destructive" />
              <ModernText text="Exam Mode Control" />
            </h1>
            <p className="text-muted-foreground">Active Proctoring & Security Protocols</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Write Code Button */}
            <Dialog>
                <DialogTrigger asChild>
                    <ModernCard className="p-8 flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-destructive/50 transition-all group text-center">
                        <div className="p-4 rounded-full bg-destructive/10 group-hover:scale-110 transition-transform">
                            <Terminal className="w-8 h-8 text-destructive" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold">Write Code</h3>
                            <p className="text-sm text-muted-foreground">Enter SSH Security Key</p>
                        </div>
                    </ModernCard>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Enter Security Code</DialogTitle>
                        <DialogDescription>
                            Please enter the authorized SSH key to modify exam protocols.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <Input 
                            placeholder="ssh-rsa AAAAB3..." 
                            value={sshCode}
                            onChange={(e) => setSshCode(e.target.value)}
                            className="font-mono text-xs"
                        />
                        <ModernButton onClick={handleCodeSubmit} className="w-full">
                            Verify Code
                        </ModernButton>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Cheating Record Button */}
            <Dialog>
                <DialogTrigger asChild>
                    <ModernCard className="p-8 flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-orange-500/50 transition-all group text-center">
                        <div className="p-4 rounded-full bg-orange-500/10 group-hover:scale-110 transition-transform">
                            <FileWarning className="w-8 h-8 text-orange-500" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold">Cheating Record</h3>
                            <p className="text-sm text-muted-foreground">View Detected Incidents</p>
                        </div>
                    </ModernCard>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Cheating Incidents Log</DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col items-center justify-center py-8 text-center space-y-2">
                        <ShieldAlert className="w-12 h-12 text-muted-foreground/20" />
                        <p className="text-muted-foreground font-medium">No data to be found</p>
                    </div>
                </DialogContent>
            </Dialog>
        </div>

        {/* Main Page Status Text */}
        <ModernCard className="p-12 flex flex-col items-center justify-center text-center min-h-[300px]">
            <div className="p-6 bg-secondary/50 rounded-full mb-4 animate-pulse">
                <Siren className="w-12 h-12 text-muted-foreground/50" />
            </div>
            <h2 className="text-2xl font-bold text-muted-foreground/50">No data is too be shown now</h2>
        </ModernCard>
      </div>
    </div>
  );
}
