import { useMemo } from "react";
import { motion } from "framer-motion";
import { Sparkles, TrendingUp, Clock, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useEden } from "@/lib/store";
import { SavedItemCard } from "@/components/SavedItemCard";

export default function HomePage() {
  const { items, setIsCapturing, setIsChatOpen } = useEden();

  const stats = useMemo(() => {
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    const weekMs = 7 * dayMs;

    return {
      total: items.length,
      thisWeek: items.filter((item) => now - item.savedAt < weekMs).length,
      unread: items.filter((item) => !item.isRead).length,
      connections: items.reduce((acc, item) => acc + item.connections.length, 0),
    };
  }, [items]);

  const featuredItem = items[0];
  const recentItems = items.slice(1, 7);

  const recommendations = useMemo(() => {
    return items
      .filter((item) => !item.isRead && item.intent === "read_later")
      .slice(0, 3);
  }, [items]);

  if (items.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4"
      >
        <div className="dotted-grid rounded-3xl p-12 max-w-2xl mx-auto">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: "spring" }}
            className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-primary/10 flex items-center justify-center"
          >
            <Sparkles className="w-10 h-10 text-primary" />
          </motion.div>

          <h1 className="font-serif text-display-sm mb-4">
            Welcome to <span className="text-gradient">Eden</span>
          </h1>

          <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
            Your second brain that learns what matters to you. Start by saving your first URL.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" onClick={() => setIsCapturing(true)} data-testid="button-empty-capture">
              <Sparkles className="w-4 h-4 mr-2" />
              Capture your first URL
            </Button>
            <Button variant="outline" size="lg" onClick={() => setIsChatOpen(true)}>
              Ask Eden anything
            </Button>
          </div>

          <div className="mt-12 grid grid-cols-3 gap-4 text-left">
            <div className="p-4 rounded-xl bg-card/50 border">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                <TrendingUp className="w-4 h-4 text-primary" />
              </div>
              <h3 className="font-medium text-sm mb-1">Smart Organization</h3>
              <p className="text-xs text-muted-foreground">
                AI auto-tags and categorizes everything
              </p>
            </div>
            <div className="p-4 rounded-xl bg-card/50 border">
              <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center mb-2">
                <Clock className="w-4 h-4 text-accent-foreground" />
              </div>
              <h3 className="font-medium text-sm mb-1">Context Aware</h3>
              <p className="text-xs text-muted-foreground">
                Surfaces content when you need it
              </p>
            </div>
            <div className="p-4 rounded-xl bg-card/50 border">
              <div className="w-8 h-8 rounded-lg bg-chart-3/20 flex items-center justify-center mb-2">
                <Star className="w-4 h-4 text-chart-3" />
              </div>
              <h3 className="font-medium text-sm mb-1">Knowledge Graph</h3>
              <p className="text-xs text-muted-foreground">
                See how your saves connect
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardContent className="pt-4">
              <div className="text-3xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">Total Saves</p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <Card>
            <CardContent className="pt-4">
              <div className="text-3xl font-bold text-primary">{stats.thisWeek}</div>
              <p className="text-xs text-muted-foreground">This Week</p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardContent className="pt-4">
              <div className="text-3xl font-bold text-chart-2">{stats.unread}</div>
              <p className="text-xs text-muted-foreground">Unread</p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card>
            <CardContent className="pt-4">
              <div className="text-3xl font-bold text-chart-3">{stats.connections}</div>
              <p className="text-xs text-muted-foreground">Connections</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {recommendations.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Recommended for You</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recommendations.map((item) => (
              <SavedItemCard key={item.id} item={item} />
            ))}
          </div>
        </motion.section>
      )}

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <h2 className="text-lg font-semibold mb-4">Recent Saves</h2>
        <div className="grid gap-4" style={{
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gridAutoRows: "minmax(200px, auto)",
        }}>
          {featuredItem && (
            <SavedItemCard item={featuredItem} variant="featured" />
          )}
          {recentItems.map((item) => (
            <SavedItemCard key={item.id} item={item} />
          ))}
        </div>
      </motion.section>
    </div>
  );
}
