import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink, Clock, BookmarkPlus, Share2, Highlighter, MessageSquare, BookOpen, Video, GraduationCap, Wrench, FileText, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useEden } from "@/lib/store";
import { SavedItemCard } from "./SavedItemCard";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface EnrichmentSuggestion {
  title: string;
  description: string;
  type: "article" | "video" | "book" | "course" | "tool" | "research";
  source: string;
}

function EnrichmentCard({ suggestion }: { suggestion: EnrichmentSuggestion }) {
  const getIcon = () => {
    switch (suggestion.type) {
      case "book": return <BookOpen className="w-4 h-4" />;
      case "video": return <Video className="w-4 h-4" />;
      case "course": return <GraduationCap className="w-4 h-4" />;
      case "tool": return <Wrench className="w-4 h-4" />;
      case "research": return <FileText className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getTypeColor = () => {
    switch (suggestion.type) {
      case "book": return "bg-amber-500/10 text-amber-600 dark:text-amber-400";
      case "video": return "bg-red-500/10 text-red-600 dark:text-red-400";
      case "course": return "bg-blue-500/10 text-blue-600 dark:text-blue-400";
      case "tool": return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
      case "research": return "bg-purple-500/10 text-purple-600 dark:text-purple-400";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="group p-4 rounded-xl border border-border/50 hover:border-border hover:bg-muted/30 transition-all duration-200 cursor-pointer"
      data-testid={`enrichment-card-${suggestion.title.slice(0, 20).replace(/\s+/g, "-").toLowerCase()}`}
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${getTypeColor()}`}>
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm leading-tight mb-1">{suggestion.title}</h4>
          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{suggestion.description}</p>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
              {suggestion.type}
            </Badge>
            <span className="text-[10px] text-muted-foreground">{suggestion.source}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function ReaderMode() {
  const { selectedItem, setSelectedItem, items, updateItem } = useEden();

  const { data: enrichmentData, isLoading: isLoadingEnrichment } = useQuery({
    queryKey: ["/api/enrichment", selectedItem?.id],
    queryFn: async () => {
      if (!selectedItem) return { suggestions: [] };
      const response = await apiRequest("POST", "/api/enrichment", {
        title: selectedItem.title,
        summary: selectedItem.summary,
        tags: selectedItem.tags,
        concepts: selectedItem.concepts,
      });
      return response.json();
    },
    enabled: !!selectedItem,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  if (!selectedItem) return null;

  // First try to find connected items or items with shared tags
  const connectedItems = items.filter((item) => 
    item.id !== selectedItem.id && 
    (selectedItem.connections.includes(item.id) ||
     item.tags.some((tag) => selectedItem.tags.includes(tag)))
  );
  
  // If no connections found, fall back to showing other items
  const relatedItems = connectedItems.length > 0 
    ? connectedItems.slice(0, 6)
    : items.filter((item) => item.id !== selectedItem.id).slice(0, 6);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const estimateReadTime = (content: string) => {
    const words = content.split(/\s+/).length;
    const minutes = Math.ceil(words / 200);
    return `${minutes} min read`;
  };

  const handleClose = () => {
    setSelectedItem(null);
  };

  const handleOpenExternal = () => {
    window.open(selectedItem.url, "_blank");
  };

  const handleMarkRead = () => {
    updateItem(selectedItem.id, { isRead: true, readingProgress: 100 });
  };

  const enrichmentSuggestions: EnrichmentSuggestion[] = enrichmentData?.suggestions || [];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-background"
      >
        <div className="h-full flex flex-col">
          <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b">
            <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                data-testid="button-reader-close"
              >
                <X className="w-5 h-5" />
              </Button>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={handleOpenExternal}>
                  <ExternalLink className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Highlighter className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <MessageSquare className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Share2 className="w-4 h-4" />
                </Button>
                {!selectedItem.isRead && (
                  <Button variant="outline" size="sm" onClick={handleMarkRead}>
                    <BookmarkPlus className="w-4 h-4 mr-2" />
                    Mark as read
                  </Button>
                )}
              </div>
            </div>
          </header>

          <ScrollArea className="flex-1">
            <div className="max-w-4xl mx-auto px-6 py-8">
              <article className="space-y-8">
                <header className="space-y-6">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {selectedItem.favicon && (
                      <img src={selectedItem.favicon} alt="" className="w-4 h-4 rounded" />
                    )}
                    <span>{selectedItem.domain}</span>
                    <span>•</span>
                    <span>{formatDate(selectedItem.savedAt)}</span>
                  </div>

                  <h1 className="font-serif text-display-sm font-medium leading-tight">
                    {selectedItem.title}
                  </h1>

                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {estimateReadTime(selectedItem.content)}
                    </div>
                    <Separator orientation="vertical" className="h-4" />
                    <div className="flex items-center gap-2 flex-wrap">
                      {selectedItem.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </header>

                {selectedItem.imageUrl && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="rounded-xl overflow-hidden"
                  >
                    <img
                      src={selectedItem.imageUrl}
                      alt=""
                      className="w-full h-auto"
                    />
                  </motion.div>
                )}

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="p-6 rounded-xl bg-primary/5 border border-primary/10"
                >
                  <h3 className="text-sm font-medium text-primary mb-2">AI Analysis</h3>
                  <p className="text-foreground leading-relaxed">
                    {selectedItem.summary}
                  </p>
                  
                  {selectedItem.concepts.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-primary/10">
                      <h4 className="text-xs font-medium text-muted-foreground mb-2">Key Concepts</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedItem.concepts.map((concept) => (
                          <Badge key={concept} variant="outline">
                            {concept}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              </article>

              {/* Enrichment Section - External Resources */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-8"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <h2 className="text-lg font-semibold">Enrichment</h2>
                </div>
                {isLoadingEnrichment ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="p-4 rounded-xl border border-border/50">
                        <div className="flex items-start gap-3">
                          <Skeleton className="w-8 h-8 rounded-lg" />
                          <div className="flex-1">
                            <Skeleton className="h-4 w-3/4 mb-2" />
                            <Skeleton className="h-3 w-full mb-2" />
                            <Skeleton className="h-3 w-1/3" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : enrichmentSuggestions.length > 0 ? (
                  <div className="space-y-3">
                    {enrichmentSuggestions.map((suggestion, index) => (
                      <EnrichmentCard key={index} suggestion={suggestion} />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No enrichment suggestions available</p>
                )}
              </motion.section>

              {/* Eden Items Section */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="mt-8"
              >
                <h2 className="text-lg font-semibold mb-4">In Your Eden</h2>
                {relatedItems.length > 0 ? (
                  <div className="space-y-2">
                    {relatedItems.map((item) => (
                      <SavedItemCard key={item.id} item={item} variant="compact" />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No related items in your collection</p>
                )}
              </motion.section>
            </div>
          </ScrollArea>

          {selectedItem.readingProgress > 0 && selectedItem.readingProgress < 100 && (
            <div className="fixed bottom-0 left-0 right-0 h-1 bg-muted">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${selectedItem.readingProgress}%` }}
                className="h-full bg-primary"
              />
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
