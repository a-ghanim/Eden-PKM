import { useState, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { Upload, FileText, File, X, CheckCircle, AlertCircle } from "lucide-react";
import type { SavedItem } from "@shared/schema";

interface FileUploadResult {
  fileName: string;
  success: boolean;
  item?: SavedItem;
  error?: string;
}

interface UploadResponse {
  total: number;
  successful: number;
  failed: number;
  results: FileUploadResult[];
}

interface FileUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const acceptedTypes = ".html,.htm,.pdf,.txt,.md,.doc,.docx";

export function FileUploadModal({ open, onOpenChange }: FileUploadModalProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<FileUploadResult[] | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();

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
    setProgress(0);
    setResults(null);

    const progressInterval = setInterval(() => {
      setProgress((prev) => Math.min(prev + 5, 90));
    }, 500);

    try {
      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));

      const response = await fetch("/api/items/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Upload failed");
      }

      const data: UploadResponse = await response.json();

      setProgress(100);
      setResults(data.results);

      queryClient.invalidateQueries({ queryKey: ["/api/items"] });

      toast({
        title: "Upload complete",
        description: `${data.successful} of ${data.total} files imported successfully.`,
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "File upload failed",
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
      setFiles([]);
      setResults(null);
      setProgress(0);
    }
  };

  const getFileIcon = (fileName: string) => {
    if (/\.pdf$/i.test(fileName)) return <FileText className="w-4 h-4 text-red-400" />;
    if (/\.(html|htm)$/i.test(fileName)) return <FileText className="w-4 h-4 text-orange-400" />;
    if (/\.(doc|docx)$/i.test(fileName)) return <FileText className="w-4 h-4 text-blue-400" />;
    return <File className="w-4 h-4 text-muted-foreground" />;
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg bg-card/95 backdrop-blur-xl border-border/50">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">Upload Files</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Upload HTML, PDF, TXT, MD, or DOC files to add to your knowledge base.
          </DialogDescription>
        </DialogHeader>

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

          {files.length > 0 && (
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
                  {!isLoading && (
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
                  )}
                </div>
              ))}
            </div>
          )}

          {isLoading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Processing files...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {results && (
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {results.map((result, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-2 p-2 rounded-lg text-sm ${
                    result.success ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
                  }`}
                >
                  {result.success ? (
                    <CheckCircle className="w-4 h-4 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0" />
                  )}
                  <span className="truncate">{result.fileName}</span>
                  {result.error && (
                    <span className="text-xs truncate">- {result.error}</span>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1"
              data-testid="button-upload-cancel"
            >
              {results ? "Close" : "Cancel"}
            </Button>
            {!results && (
              <Button
                type="submit"
                disabled={files.length === 0 || isLoading}
                className="flex-1 bg-accent hover:bg-accent/90"
                data-testid="button-upload-submit"
              >
                {isLoading ? "Uploading..." : `Upload ${files.length} File${files.length !== 1 ? "s" : ""}`}
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
