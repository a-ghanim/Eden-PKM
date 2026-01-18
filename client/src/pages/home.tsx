import { useMemo } from "react";
import { motion } from "framer-motion";
import { Plus, Sparkles, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEden } from "@/lib/store";
import { SavedItemCard } from "@/components/SavedItemCard";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Link } from "wouter";

export default function HomePage() {
  const { items, setIsCapturing, setIsChatOpen } = useEden();

  const tagBasedSections = useMemo(() => {
    const tagCounts: Record<string, typeof items> = {};
    
    items.forEach((item) => {
      item.tags.forEach((tag) => {
        if (!tagCounts[tag]) {
          tagCounts[tag] = [];
        }
        if (!tagCounts[tag].find(i => i.id === item.id)) {
          tagCounts[tag].push(item);
        }
      });
    });

    const sortedTags = Object.entries(tagCounts)
      .filter(([, tagItems]) => tagItems.length >= 2)
      .sort((a, b) => b[1].length - a[1].length)
      .slice(0, 4);

    return sortedTags;
  }, [items]);

  const topPicks = items.slice(0, 3);
  const recentItems = items.slice(0, 6);

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto text-center"
        >
          <div className="relative mb-12">
            <h1 className="font-serif text-6xl md:text-7xl leading-none tracking-tight">
              Your second
              <br />
              <span className="text-accent">brain.</span>
            </h1>
          </div>

          <p className="text-lg text-muted-foreground mb-10 max-w-md mx-auto">
            Eden captures, organizes, and resurfaces knowledge from across the web. Start by saving your first URL.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              size="lg" 
              onClick={() => setIsCapturing(true)} 
              className="h-12 px-6 rounded-xl bg-accent hover:bg-accent/90"
              data-testid="button-empty-capture"
            >
              <Plus className="w-5 h-5 mr-2" />
              Capture your first URL
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              onClick={() => setIsChatOpen(true)}
              className="h-12 px-6 rounded-xl"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Ask Eden anything
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="p-4 md:p-6 space-y-8">
        {topPicks.length > 0 && (
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-lg font-medium text-foreground">Top Picks</h2>
              <div className="flex gap-2 overflow-x-auto">
                {tagBasedSections.slice(0, 3).map(([tag]) => (
                  <button
                    key={tag}
                    className="px-3 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {topPicks.map((item) => (
                <SavedItemCard key={item.id} item={item} variant="matter" />
              ))}
            </div>
          </motion.section>
        )}

        {tagBasedSections.map(([tag, tagItems], sectionIndex) => (
          <motion.section
            key={tag}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + sectionIndex * 0.05 }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-medium text-foreground">{tag}</h2>
                <span className="text-xs text-muted-foreground">·</span>
                <span className="text-xs text-muted-foreground">{tagItems.length}</span>
              </div>
              <Button variant="ghost" size="sm" className="text-muted-foreground h-7 px-2">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
            <ScrollArea className="w-full">
              <div className="flex gap-3 pb-4">
                {tagItems.slice(0, 6).map((item) => (
                  <SavedItemCard 
                    key={item.id} 
                    item={item} 
                    variant="matter-scroll"
                    className="flex-shrink-0"
                  />
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </motion.section>
        ))}

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-medium text-foreground">Recent</h2>
              <span className="text-xs text-muted-foreground">·</span>
              <span className="text-xs text-muted-foreground">{recentItems.length}</span>
            </div>
            <Link href="/search">
              <Button variant="ghost" size="sm" className="text-muted-foreground h-7 px-2">
                View all <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {recentItems.map((item) => (
              <SavedItemCard key={item.id} item={item} variant="matter-grid" />
            ))}
          </div>
        </motion.section>
      </div>
    </div>
  );
}
