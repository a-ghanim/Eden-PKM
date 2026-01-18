import { motion } from "framer-motion";
import { ExternalLink, MoreHorizontal, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { SavedItem } from "@shared/schema";
import { useEden } from "@/lib/store";

interface SavedItemCardProps {
  item: SavedItem;
  variant?: "default" | "compact" | "featured" | "wide";
  className?: string;
}

export function SavedItemCard({ item, variant = "default", className = "" }: SavedItemCardProps) {
  const { setSelectedItem, deleteItem } = useEden();

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
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
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`group cursor-pointer ${className}`}
        onClick={handleClick}
        data-testid={`card-item-${item.id}`}
      >
        <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors">
          {item.favicon && (
            <img src={item.favicon} alt="" className="w-5 h-5 rounded" />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{item.title}</p>
            <p className="text-xs text-muted-foreground">{item.domain}</p>
          </div>
          <span className="tag-pill-muted text-[10px]">
            {item.tags[0] || "Saved"}
          </span>
        </div>
      </motion.div>
    );
  }

  if (variant === "featured") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className={`bento-featured ${className}`}
      >
        <div
          className="bento-card group cursor-pointer h-full card-hover-lift"
          onClick={handleClick}
          data-testid={`card-item-featured-${item.id}`}
        >
          {item.imageUrl && (
            <div className="relative h-full min-h-[280px]">
              <img
                src={item.imageUrl}
                alt=""
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 card-image-overlay" />
              <div className="absolute inset-0 p-6 flex flex-col justify-end">
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  {item.tags.slice(0, 3).map((tag, i) => (
                    <span key={tag} className={i === 0 ? "tag-pill text-[10px]" : "tag-pill-muted text-[10px]"}>
                      {tag}
                    </span>
                  ))}
                </div>
                <h3 className="font-serif text-2xl leading-tight text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-white/70 line-clamp-2 mb-3">
                  {item.summary}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/60 flex items-center gap-2">
                    {item.domain}
                  </span>
                  <span className="text-xs text-white/60">
                    {formatDate(item.savedAt)}
                  </span>
                </div>
              </div>
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="secondary" size="icon" className="h-8 w-8 glass">
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
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  if (variant === "wide") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bento-wide ${className}`}
      >
        <div
          className="bento-card group cursor-pointer h-full card-hover-lift overflow-hidden"
          onClick={handleClick}
          data-testid={`card-item-wide-${item.id}`}
        >
          <div className="flex h-full">
            {item.imageUrl && (
              <div className="relative w-1/3 min-w-[160px]">
                <img
                  src={item.imageUrl}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="flex-1 p-5 flex flex-col">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                {item.tags.slice(0, 2).map((tag, i) => (
                  <span key={tag} className={i === 0 ? "tag-pill text-[10px]" : "tag-pill-muted text-[10px]"}>
                    {tag}
                  </span>
                ))}
              </div>
              <h3 className="font-serif text-xl leading-tight mb-2">
                {item.title}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2 flex-grow">
                {item.summary}
              </p>
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/50">
                <span className="text-xs text-muted-foreground">{item.domain}</span>
                <span className="text-xs text-muted-foreground">·</span>
                <span className="text-xs text-muted-foreground">{formatDate(item.savedAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={className}
    >
      <div
        className="bento-card group cursor-pointer h-full card-hover-lift"
        onClick={handleClick}
        data-testid={`card-item-${item.id}`}
      >
        {item.imageUrl && (
          <div className="relative h-32 overflow-hidden">
            <img
              src={item.imageUrl}
              alt=""
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
          </div>
        )}
        <div className="p-4">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            {item.tags.slice(0, 2).map((tag, i) => (
              <span key={tag} className={i === 0 ? "tag-pill text-[10px]" : "tag-pill-muted text-[10px]"}>
                {tag}
              </span>
            ))}
          </div>
          <h3 className="font-medium text-sm leading-snug line-clamp-2 mb-2">
            {item.title}
          </h3>
          <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
            {item.summary}
          </p>
          <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-2 border-t border-border/30">
            <span className="flex items-center gap-1.5">
              {item.favicon && (
                <img src={item.favicon} alt="" className="w-3 h-3 rounded" />
              )}
              {item.domain}
            </span>
            <span>{formatDate(item.savedAt)}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
