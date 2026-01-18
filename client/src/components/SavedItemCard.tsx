import { motion } from "framer-motion";
import { ExternalLink, Clock, BookOpen, Archive, Star, MoreHorizontal, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { SavedItem } from "@shared/schema";
import { useEden } from "@/lib/store";

const intentIcons = {
  read_later: BookOpen,
  reference: Archive,
  inspiration: Star,
  tutorial: Clock,
};

const intentColors = {
  read_later: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  reference: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  inspiration: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  tutorial: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
};

interface SavedItemCardProps {
  item: SavedItem;
  variant?: "default" | "compact" | "featured";
}

export function SavedItemCard({ item, variant = "default" }: SavedItemCardProps) {
  const { setSelectedItem, deleteItem } = useEden();
  const IntentIcon = intentIcons[item.intent];

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const handleClick = () => {
    setSelectedItem(item);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteItem(item.id);
  };

  const handleOpenExternal = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(item.url, "_blank");
  };

  if (variant === "compact") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <Card
          className="group cursor-pointer hover-elevate active-elevate-2 transition-all duration-200"
          onClick={handleClick}
          data-testid={`card-item-${item.id}`}
        >
          <CardContent className="p-3 flex items-center gap-3">
            {item.favicon && (
              <img src={item.favicon} alt="" className="w-4 h-4 rounded" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{item.title}</p>
              <p className="text-xs text-muted-foreground truncate">{item.domain}</p>
            </div>
            <Badge variant="secondary" className={`text-2xs ${intentColors[item.intent]}`}>
              <IntentIcon className="w-3 h-3" />
            </Badge>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (variant === "featured") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="col-span-2 row-span-2"
      >
        <Card
          className="group cursor-pointer hover-elevate active-elevate-2 h-full overflow-hidden transition-all duration-200"
          onClick={handleClick}
          data-testid={`card-item-featured-${item.id}`}
        >
          {item.imageUrl && (
            <div className="relative h-48 overflow-hidden">
              <img
                src={item.imageUrl}
                alt=""
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3">
                <Badge className={`${intentColors[item.intent]}`}>
                  <IntentIcon className="w-3 h-3 mr-1" />
                  {item.intent.replace("_", " ")}
                </Badge>
              </div>
            </div>
          )}
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-semibold text-lg leading-tight line-clamp-2">
                {item.title}
              </h3>
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="icon" className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleOpenExternal}>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open original
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
              {item.summary}
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              {item.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="outline" className="text-2xs">
                  {tag}
                </Badge>
              ))}
            </div>
            <div className="flex items-center justify-between mt-3 pt-3 border-t">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                {item.favicon && (
                  <img src={item.favicon} alt="" className="w-3 h-3 rounded" />
                )}
                {item.domain}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatDate(item.savedAt)}
              </span>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className="group cursor-pointer hover-elevate active-elevate-2 transition-all duration-200 h-full"
        onClick={handleClick}
        data-testid={`card-item-${item.id}`}
      >
        <CardContent className="p-4 flex flex-col h-full">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-2 min-w-0">
              {item.favicon && (
                <img src={item.favicon} alt="" className="w-4 h-4 rounded shrink-0" />
              )}
              <span className="text-xs text-muted-foreground truncate">
                {item.domain}
              </span>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="icon" className="shrink-0 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreHorizontal className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleOpenExternal}>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open original
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <h3 className="font-medium text-sm leading-snug line-clamp-2 mb-2 flex-grow-0">
            {item.title}
          </h3>

          <p className="text-xs text-muted-foreground line-clamp-2 mb-3 flex-grow">
            {item.summary}
          </p>

          <div className="flex items-center gap-1.5 flex-wrap mb-3">
            {item.tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="outline" className="text-2xs px-1.5 py-0">
                {tag}
              </Badge>
            ))}
            {item.tags.length > 2 && (
              <span className="text-2xs text-muted-foreground">
                +{item.tags.length - 2}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between pt-2 border-t mt-auto">
            <Badge variant="secondary" className={`text-2xs ${intentColors[item.intent]}`}>
              <IntentIcon className="w-3 h-3 mr-1" />
              {item.intent.replace("_", " ")}
            </Badge>
            <span className="text-2xs text-muted-foreground">
              {formatDate(item.savedAt)}
            </span>
          </div>

          {item.readingProgress > 0 && item.readingProgress < 100 && (
            <div className="mt-2 h-1 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${item.readingProgress}%` }}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
