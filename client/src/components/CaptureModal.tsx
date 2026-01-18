import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Link2, Loader2, Sparkles, BookOpen, Archive, Star, Clock } from "lucide-react";
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
  { value: "reference", label: "Reference", icon: Archive, description: "Keep as permanent reference material" },
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
        description: `"${item.title}" has been captured and analyzed.`,
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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            Capture to Eden
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="url" className="text-sm font-medium">
              URL to capture
            </Label>
            <div className="relative">
              <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="url"
                type="url"
                placeholder="https://example.com/article"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="pl-10"
                disabled={isLoading}
                autoFocus
                data-testid="input-capture-url"
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium">What type of content is this?</Label>
            <RadioGroup
              value={intent}
              onValueChange={(value) => setIntent(value as IntentType)}
              className="grid grid-cols-2 gap-3"
            >
              {intentOptions.map((option) => (
                <motion.div
                  key={option.value}
                  whileTap={{ scale: 0.98 }}
                >
                  <Label
                    htmlFor={option.value}
                    className={`flex flex-col gap-1 p-3 rounded-lg border cursor-pointer transition-all ${
                      intent === option.value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <RadioGroupItem
                      value={option.value}
                      id={option.value}
                      className="sr-only"
                    />
                    <div className="flex items-center gap-2">
                      <option.icon className={`w-4 h-4 ${
                        intent === option.value ? "text-primary" : "text-muted-foreground"
                      }`} />
                      <span className={`text-sm font-medium ${
                        intent === option.value ? "text-primary" : ""
                      }`}>
                        {option.label}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {option.description}
                    </span>
                  </Label>
                </motion.div>
              ))}
            </RadioGroup>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              data-testid="button-capture-cancel"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!url.trim() || isLoading}
              data-testid="button-capture-submit"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Capture
                </>
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
              className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center rounded-lg"
            >
              <div className="text-center space-y-3">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-12 h-12 mx-auto rounded-full border-2 border-primary border-t-transparent"
                />
                <div className="space-y-1">
                  <p className="font-medium">Eden is analyzing...</p>
                  <p className="text-sm text-muted-foreground">
                    Extracting content, generating summary, and finding connections
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
