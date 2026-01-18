import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink, Clock, BookmarkPlus, Share2, Highlighter, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useEden } from "@/lib/store";
import { SavedItemCard } from "./SavedItemCard";

export function ReaderMode() {
  const { selectedItem, setSelectedItem, items, updateItem } = useEden();

  if (!selectedItem) return null;

  const relatedItems = items
    .filter((item) => 
      item.id !== selectedItem.id && 
      (selectedItem.connections.includes(item.id) ||
       item.tags.some((tag) => selectedItem.tags.includes(tag)))
    )
    .slice(0, 3);

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

              {relatedItems.length > 0 && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mt-8"
                >
                  <h2 className="text-lg font-semibold mb-4">Related in Eden</h2>
                  <div className="space-y-3">
                    {relatedItems.map((item) => (
                      <SavedItemCard key={item.id} item={item} variant="compact" />
                    ))}
                  </div>
                </motion.section>
              )}
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
