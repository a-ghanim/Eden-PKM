import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link2, Loader2, CheckCircle2, XCircle, Upload } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { useEden } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { IntentType, SavedItem } from "@shared/schema";

interface BatchResult {
  url: string;
  success: boolean;
  item?: SavedItem;
  error?: string;
}

interface BatchResponse {
  total: number;
  successful: number;
  failed: number;
  results: BatchResult[];
}

const intentOptions: { value: IntentType; label: string }[] = [
  { value: "read_later", label: "Read Later" },
  { value: "reference", label: "Reference" },
  { value: "inspiration", label: "Inspiration" },
  { value: "tutorial", label: "Tutorial" },
];

export function BatchImportModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { addItem } = useEden();
  const { toast } = useToast();
  const [urlsText, setUrlsText] = useState("");
  const [intent, setIntent] = useState<IntentType>("read_later");
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<BatchResult[] | null>(null);

  const urls = urlsText
    .split("\n")
    .map((url) => url.trim())
    .filter((url) => url.length > 0 && url.startsWith("http"));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (urls.length === 0) return;

    setIsLoading(true);
    setProgress(0);
    setResults(null);

    const progressInterval = setInterval(() => {
      setProgress((prev) => Math.min(prev + 5, 90));
    }, 500);

    try {
      const response = await apiRequest("POST", "/api/items/batch", { urls, intent });
      const data: BatchResponse = await response.json();

      setProgress(100);
      setResults(data.results);

      data.results.forEach((result) => {
        if (result.success && result.item) {
          addItem(result.item);
        }
      });

      queryClient.invalidateQueries({ queryKey: ["/api/items"] });

      toast({
        title: "Batch import complete",
        description: `${data.successful} of ${data.total} URLs imported successfully.`,
      });
    } catch (error) {
      toast({
        title: "Import failed",
        description: error instanceof Error ? error.message : "Batch import failed",
        variant: "destructive",
      });
    } finally {
      clearInterval(progressInterval);
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onOpenChange(false);
      setUrlsText("");
      setIntent("read_later");
      setResults(null);
      setProgress(0);
    }
  };

  const handleReset = () => {
    setResults(null);
    setUrlsText("");
    setProgress(0);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg glass border-border/50">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Batch Import
          </DialogTitle>
          <DialogDescription>
            Paste multiple URLs (one per line) to import them all at once.
          </DialogDescription>
        </DialogHeader>

        {!results ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                URLs ({urls.length} detected)
              </Label>
              <Textarea
                placeholder={"https://example.com/article1\nhttps://example.com/article2\nhttps://example.com/article3"}
                value={urlsText}
                onChange={(e) => setUrlsText(e.target.value)}
                className="h-40 rounded-xl bg-muted/50 border-border/50 font-mono text-sm resize-none"
                disabled={isLoading}
                data-testid="textarea-batch-urls"
              />
              <p className="text-xs text-muted-foreground">
                Maximum 20 URLs per batch. Only valid URLs starting with http:// or https:// will be imported.
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                Default Intent
              </Label>
              <RadioGroup
                value={intent}
                onValueChange={(value) => setIntent(value as IntentType)}
                className="flex flex-wrap gap-2"
              >
                {intentOptions.map((option) => (
                  <Label
                    key={option.value}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full border cursor-pointer transition-all text-sm ${
                      intent === option.value
                        ? "border-accent bg-accent/10 text-accent"
                        : "border-border/50 hover:border-border bg-muted/30"
                    }`}
                  >
                    <RadioGroupItem
                      value={option.value}
                      className="sr-only"
                    />
                    {option.label}
                  </Label>
                ))}
              </RadioGroup>
            </div>

            {isLoading && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Importing...</span>
                  <span className="text-muted-foreground">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
                className="flex-1 rounded-xl"
                data-testid="button-batch-cancel"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={urls.length === 0 || urls.length > 20 || isLoading}
                className="flex-1 rounded-xl bg-accent hover:bg-accent/90"
                data-testid="button-batch-submit"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Import {urls.length} URL{urls.length !== 1 ? "s" : ""}
                  </>
                )}
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30">
              <div className="text-center flex-1">
                <div className="text-2xl font-serif text-green-500">
                  {results.filter((r) => r.success).length}
                </div>
                <div className="text-xs text-muted-foreground">Imported</div>
              </div>
              <div className="w-px h-10 bg-border/50" />
              <div className="text-center flex-1">
                <div className="text-2xl font-serif text-red-500">
                  {results.filter((r) => !r.success).length}
                </div>
                <div className="text-xs text-muted-foreground">Failed</div>
              </div>
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2">
              {results.map((result, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`flex items-start gap-3 p-3 rounded-xl border ${
                    result.success
                      ? "border-green-500/20 bg-green-500/5"
                      : "border-red-500/20 bg-red-500/5"
                  }`}
                >
                  {result.success ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm truncate">
                      {result.item?.title || result.url}
                    </p>
                    {result.error && (
                      <p className="text-xs text-red-400 mt-0.5">{result.error}</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={handleReset}
                className="flex-1 rounded-xl"
                data-testid="button-batch-more"
              >
                Import More
              </Button>
              <Button
                onClick={handleClose}
                className="flex-1 rounded-xl bg-accent hover:bg-accent/90"
                data-testid="button-batch-done"
              >
                Done
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
