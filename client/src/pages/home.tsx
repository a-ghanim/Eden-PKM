import { useMemo } from "react";
import { motion } from "framer-motion";
import { Plus, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEden } from "@/lib/store";
import { SavedItemCard } from "@/components/SavedItemCard";
import { Link } from "wouter";

export default function HomePage() {
  const { items, setIsCapturing, setIsChatOpen } = useEden();

  const categorizedItems = useMemo(() => {
    const byIntent: Record<string, typeof items> = {
      read_later: [],
      reference: [],
      inspiration: [],
      tutorial: [],
    };
    
    items.forEach((item) => {
      if (byIntent[item.intent]) {
        byIntent[item.intent].push(item);
      }
    });

    return byIntent;
  }, [items]);

  const featuredItem = items[0];
  const recentItems = items.slice(1, 7);

  if (items.length === 0) {
    return (
      <div className="min-h-screen dotted-grid-subtle flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto text-center"
        >
          <div className="relative mb-12">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 sphere-3d opacity-20 animate-pulse-glow" />
            <h1 className="font-serif text-6xl md:text-7xl leading-none tracking-tight reveal-up">
              Your second
              <br />
              <span className="text-gradient-accent">brain.</span>
            </h1>
          </div>

          <p className="text-lg text-muted-foreground mb-10 reveal-up reveal-up-delay-1 max-w-md mx-auto">
            Eden captures, organizes, and resurfaces knowledge from across the web. Start by saving your first URL.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 reveal-up reveal-up-delay-2">
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

          <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
            <div className="w-20 h-20 sphere-glass animate-float opacity-30" />
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="p-6 md:p-8 space-y-12">
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-3xl tracking-tight">Recent</h2>
            <Link href="/search">
              <Button variant="ghost" size="sm" className="text-muted-foreground gap-1">
                View all <ArrowRight className="w-3 h-3" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" style={{
            gridAutoRows: "minmax(180px, auto)",
          }}>
            {featuredItem && (
              <SavedItemCard item={featuredItem} variant="featured" />
            )}
            {recentItems.slice(0, 4).map((item, index) => (
              <SavedItemCard 
                key={item.id} 
                item={item} 
                variant={index === 0 ? "wide" : "default"}
              />
            ))}
          </div>
        </motion.section>

        {categorizedItems.read_later.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-serif text-2xl tracking-tight">Read Later</h2>
              <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
                {categorizedItems.read_later.length} items
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {categorizedItems.read_later.slice(0, 4).map((item) => (
                <SavedItemCard key={item.id} item={item} />
              ))}
            </div>
          </motion.section>
        )}

        {categorizedItems.inspiration.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-serif text-2xl tracking-tight">Inspiration</h2>
              <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
                {categorizedItems.inspiration.length} items
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {categorizedItems.inspiration.slice(0, 4).map((item) => (
                <SavedItemCard key={item.id} item={item} />
              ))}
            </div>
          </motion.section>
        )}

        {categorizedItems.tutorial.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-serif text-2xl tracking-tight">Tutorials</h2>
              <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
                {categorizedItems.tutorial.length} items
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {categorizedItems.tutorial.slice(0, 4).map((item) => (
                <SavedItemCard key={item.id} item={item} />
              ))}
            </div>
          </motion.section>
        )}

        {categorizedItems.reference.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-serif text-2xl tracking-tight">Reference</h2>
              <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
                {categorizedItems.reference.length} items
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {categorizedItems.reference.slice(0, 4).map((item) => (
                <SavedItemCard key={item.id} item={item} />
              ))}
            </div>
          </motion.section>
        )}
      </div>

      <footer className="mt-20 p-8 border-t border-border/30">
        <div className="text-center">
          <h2 className="font-serif text-8xl md:text-[12rem] tracking-tighter text-muted-foreground/10 select-none">
            eden
          </h2>
        </div>
      </footer>
    </div>
  );
}
