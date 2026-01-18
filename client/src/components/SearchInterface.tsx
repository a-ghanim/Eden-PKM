import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, X, SlidersHorizontal, Calendar, Tag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useEden } from "@/lib/store";
import { SavedItemCard } from "./SavedItemCard";
import type { IntentType } from "@shared/schema";

const intentLabels: Record<IntentType, string> = {
  read_later: "Read Later",
  reference: "Reference",
  inspiration: "Inspiration",
  tutorial: "Tutorial",
};

export function SearchInterface() {
  const { items, searchQuery, setSearchQuery, selectedIntent, setSelectedIntent, selectedTags, setSelectedTags } = useEden();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [dateFilter, setDateFilter] = useState<"all" | "today" | "week" | "month">("all");

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    items.forEach((item) => item.tags.forEach((tag) => tagSet.add(tag)));
    return Array.from(tagSet).sort();
  }, [items]);

  const filteredItems = useMemo(() => {
    let filtered = items;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          item.summary.toLowerCase().includes(query) ||
          item.content.toLowerCase().includes(query) ||
          item.tags.some((tag) => tag.toLowerCase().includes(query)) ||
          item.concepts.some((concept) => concept.toLowerCase().includes(query))
      );
    }

    if (selectedIntent) {
      filtered = filtered.filter((item) => item.intent === selectedIntent);
    }

    if (selectedTags.length > 0) {
      filtered = filtered.filter((item) =>
        selectedTags.some((tag) => item.tags.includes(tag))
      );
    }

    if (dateFilter !== "all") {
      const now = Date.now();
      const dayMs = 24 * 60 * 60 * 1000;
      filtered = filtered.filter((item) => {
        const age = now - item.savedAt;
        switch (dateFilter) {
          case "today":
            return age < dayMs;
          case "week":
            return age < 7 * dayMs;
          case "month":
            return age < 30 * dayMs;
          default:
            return true;
        }
      });
    }

    return filtered;
  }, [items, searchQuery, selectedIntent, selectedTags, dateFilter]);

  const handleTagToggle = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedIntent(null);
    setSelectedTags([]);
    setDateFilter("all");
  };

  const hasActiveFilters = searchQuery || selectedIntent || selectedTags.length > 0 || dateFilter !== "all";
  const activeFilterCount = [selectedIntent, ...selectedTags, dateFilter !== "all" ? dateFilter : null].filter(Boolean).length;

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search your knowledge..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 pr-12 h-12 text-base rounded-xl bg-muted/50 border-border/50 focus:bg-muted/70"
            data-testid="input-search"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2"
              onClick={() => setSearchQuery("")}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 rounded-xl">
                <SlidersHorizontal className="w-4 h-4" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="ml-1 w-5 h-5 rounded-full bg-accent text-accent-foreground text-xs flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 glass border-border/50" align="start">
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Calendar className="w-3 h-3" />
                    Date
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {(["all", "today", "week", "month"] as const).map((filter) => (
                      <Button
                        key={filter}
                        variant={dateFilter === filter ? "default" : "outline"}
                        size="sm"
                        onClick={() => setDateFilter(filter)}
                        className="rounded-lg"
                      >
                        {filter === "all" ? "All" : filter === "today" ? "Today" : filter === "week" ? "Week" : "Month"}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Intent</h4>
                  <div className="flex flex-wrap gap-2">
                    {(Object.keys(intentLabels) as IntentType[]).map((intent) => (
                      <Button
                        key={intent}
                        variant={selectedIntent === intent ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedIntent(selectedIntent === intent ? null : intent)}
                        className="rounded-lg"
                      >
                        {intentLabels[intent]}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Tag className="w-3 h-3" />
                    Tags
                  </h4>
                  <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto scrollbar-thin">
                    {allTags.map((tag) => (
                      <Button
                        key={tag}
                        variant={selectedTags.includes(tag) ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleTagToggle(tag)}
                        className="text-xs rounded-lg"
                      >
                        {tag}
                      </Button>
                    ))}
                  </div>
                </div>

                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" className="w-full" onClick={clearFilters}>
                    Clear all
                  </Button>
                )}
              </div>
            </PopoverContent>
          </Popover>

          {selectedIntent && (
            <span className="tag-pill-muted flex items-center gap-1">
              {intentLabels[selectedIntent as IntentType]}
              <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedIntent(null)} />
            </span>
          )}

          {selectedTags.map((tag) => (
            <span key={tag} className="tag-pill-muted flex items-center gap-1">
              {tag}
              <X className="w-3 h-3 cursor-pointer" onClick={() => handleTagToggle(tag)} />
            </span>
          ))}
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        {filteredItems.length} {filteredItems.length === 1 ? "result" : "results"}
      </p>

      {filteredItems.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="w-20 h-20 sphere-glass opacity-50 mb-6" />
          <h3 className="font-serif text-xl mb-2">No results</h3>
          <p className="text-muted-foreground text-sm max-w-sm">
            Try adjusting your search or filters
          </p>
        </motion.div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
            >
              <SavedItemCard item={item} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
