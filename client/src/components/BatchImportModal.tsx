import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Loader2, CheckCircle2, XCircle, Upload } from "lucide-react";
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
import { Progress } from "@/components/ui/progress";
import { useEden } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import type { SavedItem } from "@shared/schema";

interface StreamResult {
  url: string;
  success: boolean;
  item?: SavedItem;
  error?: string;
}

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
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState({ success: 0, failed: 0, total: 0 });
  const [results, setResults] = useState<StreamResult[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const urls = urlsText
    .split("\n")
    .map((url) => url.trim())
    .filter((url) => url.length > 0 && url.startsWith("http"));

  const handleStreamImport = useCallback(async () => {
    if (urls.length === 0) return;

    setIsLoading(true);
    setProgress({ success: 0, failed: 0, total: urls.length });
    setResults([]);
    setIsComplete(false);

    abortRef.current = new AbortController();

    try {
      const response = await fetch("/api/items/batch/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ urls }),
        signal: abortRef.current.signal,
      });

      if (!response.ok) {
        throw new Error("Stream request failed");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No reader available");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.type === "start") {
                setProgress({ success: 0, failed: 0, total: data.total });
              } else if (data.type === "item" && data.item) {
                addItem(data.item);
                setResults(prev => [...prev, { url: data.item.url, success: true, item: data.item }]);
                setProgress(data.progress);
              } else if (data.type === "connections" && data.item) {
                addItem(data.item);
              } else if (data.type === "error" && data.url) {
                setResults(prev => [...prev, { url: data.url, success: false, error: data.message }]);
                setProgress(data.progress);
              } else if (data.type === "complete") {
                setProgress({ success: data.success, failed: data.failed, total: data.total });
                setIsComplete(true);
              }
            } catch {
              // Ignore parse errors
            }
          }
        }
      }

      queryClient.invalidateQueries({ queryKey: ["/api/items"] });

      toast({
        title: "Import complete",
        description: `${progress.success} URLs imported successfully.`,
      });
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return;
      }
      toast({
        title: "Import failed",
        description: error instanceof Error ? error.message : "Stream import failed",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsComplete(true);
    }
  }, [urls, addItem, toast, progress.success]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleStreamImport();
  };

  const handleClose = () => {
    if (isLoading && abortRef.current) {
      abortRef.current.abort();
    }
    onOpenChange(false);
    setUrlsText("");
    setResults([]);
    setProgress({ success: 0, failed: 0, total: 0 });
    setIsComplete(false);
  };

  const handleReset = () => {
    setResults([]);
    setUrlsText("");
    setProgress({ success: 0, failed: 0, total: 0 });
    setIsComplete(false);
  };

  const progressPercent = progress.total > 0 
    ? ((progress.success + progress.failed) / progress.total) * 100 
    : 0;

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

        {!isComplete ? (
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
                Up to 50 URLs per batch. URLs are processed concurrently for speed.
              </p>
            </div>

            {isLoading && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Importing... {progress.success + progress.failed} / {progress.total}
                  </span>
                  <span className="text-muted-foreground">{Math.round(progressPercent)}%</span>
                </div>
                <Progress value={progressPercent} className="h-2" />
                
                {results.length > 0 && (
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {results.slice(-5).map((result, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex items-center gap-2 text-xs p-2 rounded-lg ${
                          result.success ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
                        }`}
                      >
                        {result.success ? (
                          <CheckCircle2 className="w-3 h-3 shrink-0" />
                        ) : (
                          <XCircle className="w-3 h-3 shrink-0" />
                        )}
                        <span className="truncate">{result.item?.title || result.url}</span>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1 rounded-xl"
                data-testid="button-batch-cancel"
              >
                {isLoading ? "Stop" : "Cancel"}
              </Button>
              <Button
                type="submit"
                disabled={urls.length === 0 || urls.length > 50 || isLoading}
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
                  {progress.success}
                </div>
                <div className="text-xs text-muted-foreground">Imported</div>
              </div>
              <div className="w-px h-10 bg-border/50" />
              <div className="text-center flex-1">
                <div className="text-2xl font-serif text-red-500">
                  {progress.failed}
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
                  transition={{ delay: i * 0.02 }}
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
