import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link2, Loader2, BookOpen, Archive, Star, Clock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useEden } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { IntentType } from "@shared/schema";

const intentOptions: { value: IntentType; label: string; icon: typeof BookOpen; description: string }[] = [
  { value: "read_later", label: "Read Later", icon: BookOpen, description: "Save to read when you have time" },
  { value: "reference", label: "Reference", icon: Archive, description: "Keep as permanent reference" },
  { value: "inspiration", label: "Inspiration", icon: Star, description: "Creative ideas and inspiration" },
  { value: "tutorial", label: "Tutorial", icon: Clock, description: "Guides and how-to content" },
];

export function CaptureModal() {
  const { isCapturing, setIsCapturing, addItem } = useEden();
  const { toast } = useToast();
  const [url, setUrl] = useState("");
  const [intent, setIntent] = useState<IntentType>("read_later");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setIsLoading(true);
    try {
      const response = await apiRequest("POST", "/api/items/capture", { url, intent });
      const item = await response.json();
      addItem(item);
      toast({
        title: "Saved to Eden",
        description: `"${item.title}" has been captured.`,
      });
      setUrl("");
      setIntent("read_later");
      setIsCapturing(false);
    } catch (error) {
      toast({
        title: "Capture failed",
        description: error instanceof Error ? error.message : "Failed to capture URL",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setIsCapturing(false);
      setUrl("");
      setIntent("read_later");
    }
  };

  return (
    <Dialog open={isCapturing} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md glass border-border/50">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">
            Capture
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="url" className="text-xs text-muted-foreground uppercase tracking-wider">
              URL
            </Label>
            <div className="relative">
              <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="url"
                type="url"
                placeholder="https://..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="pl-10 h-11 rounded-xl bg-muted/50 border-border/50"
                disabled={isLoading}
                autoFocus
                data-testid="input-capture-url"
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">
              Intent
            </Label>
            <RadioGroup
              value={intent}
              onValueChange={(value) => setIntent(value as IntentType)}
              className="grid grid-cols-2 gap-2"
            >
              {intentOptions.map((option) => (
                <motion.div
                  key={option.value}
                  whileTap={{ scale: 0.98 }}
                >
                  <Label
                    htmlFor={option.value}
                    className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${
                      intent === option.value
                        ? "border-accent bg-accent/10"
                        : "border-border/50 hover:border-border bg-muted/30"
                    }`}
                  >
                    <RadioGroupItem
                      value={option.value}
                      id={option.value}
                      className="sr-only"
                    />
                    <option.icon className={`w-4 h-4 ${
                      intent === option.value ? "text-accent" : "text-muted-foreground"
                    }`} />
                    <span className={`text-sm ${
                      intent === option.value ? "text-accent font-medium" : ""
                    }`}>
                      {option.label}
                    </span>
                  </Label>
                </motion.div>
              ))}
            </RadioGroup>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1 rounded-xl"
              data-testid="button-capture-cancel"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!url.trim() || isLoading}
              className="flex-1 rounded-xl bg-accent hover:bg-accent/90"
              data-testid="button-capture-submit"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                "Capture"
              )}
            </Button>
          </div>
        </form>

        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 glass flex items-center justify-center rounded-xl"
            >
              <div className="text-center space-y-4">
                <div className="relative w-16 h-16 mx-auto">
                  <div className="absolute inset-0 sphere-3d animate-pulse" />
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 rounded-full border-2 border-accent border-t-transparent"
                  />
                </div>
                <div className="space-y-1">
                  <p className="font-serif text-lg">Analyzing...</p>
                  <p className="text-sm text-muted-foreground">
                    Extracting content and finding connections
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
