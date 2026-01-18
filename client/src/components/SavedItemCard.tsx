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
  variant?: "default" | "compact" | "featured" | "wide" | "matter" | "matter-scroll" | "matter-grid";
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

  if (variant === "matter") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`group cursor-pointer ${className}`}
        onClick={handleClick}
        data-testid={`card-item-matter-${item.id}`}
      >
        <div className="relative rounded-xl overflow-hidden bg-card/50 h-[280px]">
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt=""
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 dark:from-accent/20 dark:to-accent/5" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20" />
          <div className="absolute top-3 left-3 flex items-center gap-2">
            <span className="text-[11px] text-white/90 font-medium drop-shadow-sm">
              {item.domain}
            </span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="font-medium text-white text-sm leading-snug line-clamp-2 mb-2 drop-shadow-sm">
              {item.title}
            </h3>
            <p className="text-xs text-white/80 line-clamp-2 drop-shadow-sm">
              {item.summary}
            </p>
          </div>
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="secondary" size="icon" className="h-7 w-7 bg-black/50 hover:bg-black/70 border-0">
                  <MoreHorizontal className="w-3.5 h-3.5 text-white" />
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
      </motion.div>
    );
  }

  if (variant === "matter-scroll") {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`group cursor-pointer w-[240px] ${className}`}
        onClick={handleClick}
        data-testid={`card-item-scroll-${item.id}`}
      >
        <div className="relative rounded-xl overflow-hidden bg-card/50 h-[200px]">
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt=""
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 dark:from-accent/20 dark:to-accent/5" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />
          <div className="absolute top-2.5 left-2.5">
            <span className="text-[10px] text-white/80 drop-shadow-sm">
              {item.domain}
            </span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <h3 className="font-medium text-white text-[13px] leading-snug line-clamp-2 drop-shadow-sm">
              {item.title}
            </h3>
          </div>
        </div>
      </motion.div>
    );
  }

  if (variant === "matter-grid") {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`group cursor-pointer ${className}`}
        onClick={handleClick}
        data-testid={`card-item-grid-${item.id}`}
      >
        <div className="relative rounded-xl overflow-hidden bg-card/50 aspect-[4/3]">
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt=""
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 dark:from-accent/20 dark:to-accent/5" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />
          <div className="absolute top-2 left-2">
            <span className="text-[10px] text-white/80 drop-shadow-sm">
              {item.domain}
            </span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-2.5">
            <h3 className="font-medium text-white text-xs leading-snug line-clamp-2 drop-shadow-sm">
              {item.title}
            </h3>
          </div>
        </div>
      </motion.div>
    );
  }

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
          <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
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
        className={className}
      >
        <div
          className="group cursor-pointer rounded-xl overflow-hidden bg-card border border-border/50 h-full"
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
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              <div className="absolute inset-0 p-6 flex flex-col justify-end">
                <span className="text-xs text-white/70 mb-2">{item.domain}</span>
                <h3 className="font-serif text-2xl leading-tight text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-white/70 line-clamp-2">
                  {item.summary}
                </p>
              </div>
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="secondary" size="icon" className="h-8 w-8 bg-black/50">
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
        className={className}
      >
        <div
          className="group cursor-pointer rounded-xl overflow-hidden bg-card border border-border/50 h-full"
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
              <span className="text-xs text-muted-foreground mb-2">{item.domain}</span>
              <h3 className="font-serif text-xl leading-tight mb-2">
                {item.title}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2 flex-grow">
                {item.summary}
              </p>
              <span className="text-xs text-muted-foreground mt-3">
                {formatDate(item.savedAt)}
              </span>
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
        className="group cursor-pointer rounded-xl overflow-hidden bg-card border border-border/50 h-full"
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
          <span className="text-[10px] text-muted-foreground">{item.domain}</span>
          <h3 className="font-medium text-sm leading-snug line-clamp-2 mt-1 mb-2">
            {item.title}
          </h3>
          <p className="text-xs text-muted-foreground line-clamp-2">
            {item.summary}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
