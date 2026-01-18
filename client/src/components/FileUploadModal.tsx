import { useState, useCallback, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { useEden } from "@/lib/store";
import { Upload, FileText, File, X, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import type { SavedItem } from "@shared/schema";

interface StreamResult {
  title: string;
  success: boolean;
  item?: SavedItem;
  error?: string;
}

interface FileUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const acceptedTypes = ".html,.htm,.pdf,.txt,.md,.doc,.docx";

export function FileUploadModal({ open, onOpenChange }: FileUploadModalProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState({ success: 0, failed: 0, total: 0 });
  const [streamResults, setStreamResults] = useState<StreamResult[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const { toast } = useToast();
  const { addItem } = useEden();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files).filter((file) =>
      /\.(html|htm|pdf|txt|md|doc|docx)$/i.test(file.name)
    );
    if (droppedFiles.length > 0) {
      setFiles((prev) => [...prev, ...droppedFiles].slice(0, 10));
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...selectedFiles].slice(0, 10));
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0) return;

    setIsLoading(true);
    setProgress({ success: 0, failed: 0, total: 0 });
    setStreamResults([]);
    setIsComplete(false);

    abortRef.current = new AbortController();

    try {
      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));

      const response = await fetch("/api/items/upload/stream", {
        method: "POST",
        body: formData,
        signal: abortRef.current.signal,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
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
                setStreamResults(prev => [...prev, { title: data.item.title, success: true, item: data.item }]);
                setProgress(data.progress);
              } else if (data.type === "error" && data.url) {
                setStreamResults(prev => [...prev, { title: data.url, success: false, error: data.message }]);
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
        title: "Upload complete",
        description: `${progress.success} items imported successfully.`,
      });
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return;
      }
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "File upload failed",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsComplete(true);
    }
  };

  const handleClose = () => {
    if (isLoading && abortRef.current) {
      abortRef.current.abort();
    }
    onOpenChange(false);
    setFiles([]);
    setStreamResults([]);
    setProgress({ success: 0, failed: 0, total: 0 });
    setIsComplete(false);
  };

  const handleReset = () => {
    setFiles([]);
    setStreamResults([]);
    setProgress({ success: 0, failed: 0, total: 0 });
    setIsComplete(false);
  };

  const getFileIcon = (fileName: string) => {
    if (/\.pdf$/i.test(fileName)) return <FileText className="w-4 h-4 text-red-400" />;
    if (/\.(html|htm)$/i.test(fileName)) return <FileText className="w-4 h-4 text-orange-400" />;
    if (/\.(doc|docx)$/i.test(fileName)) return <FileText className="w-4 h-4 text-blue-400" />;
    return <File className="w-4 h-4 text-muted-foreground" />;
  };

  const progressPercent = progress.total > 0 
    ? ((progress.success + progress.failed) / progress.total) * 100 
    : 0;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg bg-card/95 backdrop-blur-xl border-border/50">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">Upload Files</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Upload HTML, PDF, TXT, MD, or DOC files to add to your knowledge base.
          </DialogDescription>
        </DialogHeader>

        {!isComplete ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                isDragging
                  ? "border-accent bg-accent/10"
                  : "border-border/50 hover:border-border"
              }`}
              data-testid="dropzone-file-upload"
            >
              <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-2">
                Drag and drop files here, or
              </p>
              <label>
                <input
                  type="file"
                  multiple
                  accept={acceptedTypes}
                  onChange={handleFileSelect}
                  className="hidden"
                  data-testid="input-file-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault();
                    (e.currentTarget.previousElementSibling as HTMLInputElement)?.click();
                  }}
                  data-testid="button-browse-files"
                >
                  Browse Files
                </Button>
              </label>
              <p className="text-xs text-muted-foreground mt-2">
                Up to 10 files (HTML, PDF, TXT, MD, DOC)
              </p>
            </div>

            {files.length > 0 && !isLoading && (
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {files.map((file, index) => (
                  <div
                    key={`${file.name}-${index}`}
                    className="flex items-center justify-between gap-2 p-2 rounded-lg bg-muted/30"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {getFileIcon(file.name)}
                      <span className="text-sm truncate">{file.name}</span>
                      <span className="text-xs text-muted-foreground">
                        ({(file.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 shrink-0"
                      onClick={() => removeFile(index)}
                      data-testid={`button-remove-file-${index}`}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {isLoading && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Importing... {progress.success + progress.failed} / {progress.total}
                  </span>
                  <span className="text-muted-foreground">{Math.round(progressPercent)}%</span>
                </div>
                <Progress value={progressPercent} className="h-2" />
                
                {streamResults.length > 0 && (
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {streamResults.slice(-5).map((result, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex items-center gap-2 text-xs p-2 rounded-lg ${
                          result.success ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
                        }`}
                      >
                        {result.success ? (
                          <CheckCircle className="w-3 h-3 shrink-0" />
                        ) : (
                          <AlertCircle className="w-3 h-3 shrink-0" />
                        )}
                        <span className="truncate">{result.title}</span>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1"
                data-testid="button-upload-cancel"
              >
                {isLoading ? "Stop" : "Cancel"}
              </Button>
              <Button
                type="submit"
                disabled={files.length === 0 || isLoading}
                className="flex-1 bg-accent hover:bg-accent/90"
                data-testid="button-upload-submit"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  `Upload ${files.length} File${files.length !== 1 ? "s" : ""}`
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
              {streamResults.map((result, i) => (
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
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm truncate">{result.title}</p>
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
                data-testid="button-upload-more"
              >
                Upload More
              </Button>
              <Button
                onClick={handleClose}
                className="flex-1 rounded-xl bg-accent hover:bg-accent/90"
                data-testid="button-upload-done"
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
