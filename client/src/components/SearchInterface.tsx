import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, Filter, X, SlidersHorizontal, Calendar, Tag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search your knowledge base... (try 'React performance' or 'that article about startups')"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 pr-12 h-14 text-lg glassmorphism"
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
              <Button variant="outline" size="sm" className="gap-2">
                <SlidersHorizontal className="w-4 h-4" />
                Filters
                {hasActiveFilters && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                    {[selectedIntent, ...selectedTags, dateFilter !== "all" ? dateFilter : null].filter(Boolean).length}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="start">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Date saved
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {(["all", "today", "week", "month"] as const).map((filter) => (
                      <Button
                        key={filter}
                        variant={dateFilter === filter ? "default" : "outline"}
                        size="sm"
                        onClick={() => setDateFilter(filter)}
                      >
                        {filter === "all" ? "All time" : filter === "today" ? "Today" : filter === "week" ? "This week" : "This month"}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-sm mb-2">Intent</h4>
                  <div className="flex flex-wrap gap-2">
                    {(Object.keys(intentLabels) as IntentType[]).map((intent) => (
                      <Button
                        key={intent}
                        variant={selectedIntent === intent ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedIntent(selectedIntent === intent ? null : intent)}
                      >
                        {intentLabels[intent]}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    Tags
                  </h4>
                  <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                    {allTags.map((tag) => (
                      <Button
                        key={tag}
                        variant={selectedTags.includes(tag) ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleTagToggle(tag)}
                        className="text-xs"
                      >
                        {tag}
                      </Button>
                    ))}
                  </div>
                </div>

                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" className="w-full" onClick={clearFilters}>
                    Clear all filters
                  </Button>
                )}
              </div>
            </PopoverContent>
          </Popover>

          {selectedIntent && (
            <Badge variant="secondary" className="gap-1">
              {intentLabels[selectedIntent as IntentType]}
              <X
                className="w-3 h-3 cursor-pointer"
                onClick={() => setSelectedIntent(null)}
              />
            </Badge>
          )}

          {selectedTags.map((tag) => (
            <Badge key={tag} variant="secondary" className="gap-1">
              {tag}
              <X
                className="w-3 h-3 cursor-pointer"
                onClick={() => handleTagToggle(tag)}
              />
            </Badge>
          ))}

          {dateFilter !== "all" && (
            <Badge variant="secondary" className="gap-1">
              {dateFilter === "today" ? "Today" : dateFilter === "week" ? "This week" : "This month"}
              <X
                className="w-3 h-3 cursor-pointer"
                onClick={() => setDateFilter("all")}
              />
            </Badge>
          )}
        </div>
      </div>

      <div className="text-sm text-muted-foreground">
        {filteredItems.length === 0 ? (
          <span>No results found</span>
        ) : (
          <span>
            {filteredItems.length} {filteredItems.length === 1 ? "result" : "results"}
          </span>
        )}
      </div>

      {filteredItems.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-16 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <Search className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No matching saves</h3>
          <p className="text-muted-foreground max-w-sm">
            Try adjusting your search or filters to find what you're looking for.
          </p>
        </motion.div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <SavedItemCard item={item} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
