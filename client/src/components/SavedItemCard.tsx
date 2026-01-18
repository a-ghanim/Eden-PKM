import { motion } from "framer-motion";
import { ExternalLink, MoreHorizontal, Trash2, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { SavedItem } from "@shared/schema";
import { useEden } from "@/lib/store";
import { useTheme } from "@/components/ThemeProvider";

interface SavedItemCardProps {
  item: SavedItem;
  variant?: "default" | "compact" | "featured" | "wide" | "matter" | "matter-scroll" | "matter-grid";
  className?: string;
}

export function SavedItemCard({ item, variant = "default", className = "" }: SavedItemCardProps) {
  const { setSelectedItem, deleteItem } = useEden();
  const { theme } = useTheme();
  const isDark = theme === "dark";

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

  // Beautiful gradient backgrounds for items without images
  const getPlaceholderGradient = (id: number | string) => {
    const gradients = [
      "from-violet-600/80 via-purple-500/70 to-fuchsia-500/80",
      "from-cyan-600/80 via-teal-500/70 to-emerald-500/80",
      "from-orange-500/80 via-amber-500/70 to-yellow-500/80",
      "from-rose-600/80 via-pink-500/70 to-fuchsia-500/80",
      "from-blue-600/80 via-indigo-500/70 to-violet-500/80",
      "from-emerald-600/80 via-green-500/70 to-teal-500/80",
    ];
    // Hash the ID to get a consistent index
    const numericId = typeof id === 'string' 
      ? id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
      : id;
    return gradients[Math.abs(numericId) % gradients.length];
  };

  if (variant === "matter") {
    // Light mode: Clean card with image on top, content below
    if (!isDark) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          className={`group cursor-pointer ${className}`}
          onClick={handleClick}
          data-testid={`card-item-matter-${item.id}`}
        >
          <div className="relative rounded-2xl overflow-hidden h-[280px] bg-card shadow-md shadow-black/5 ring-1 ring-border/50 transition-all duration-300 group-hover:shadow-lg group-hover:ring-border">
            {/* Image section - top portion */}
            <div className="relative h-[160px] overflow-hidden">
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt=""
                  className="w-full h-full object-cover transition-all duration-500 ease-out group-hover:scale-[1.02]"
                />
              ) : (
                <div className={`w-full h-full bg-gradient-to-br ${getPlaceholderGradient(item.id)}`}>
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15),transparent_50%)]" />
                </div>
              )}
              {/* Domain pill */}
              <div className="absolute top-2.5 left-2.5">
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-sm border border-black/5 shadow-sm">
                  {item.favicon ? (
                    <img src={item.favicon} alt="" className="w-3 h-3 rounded-sm" />
                  ) : (
                    <Globe className="w-3 h-3 text-muted-foreground" />
                  )}
                  <span className="text-[10px] text-foreground/80 font-medium">
                    {item.domain}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Content section - bottom portion */}
            <div className="p-4 h-[120px] flex flex-col">
              <h3 className="font-semibold text-foreground text-[15px] leading-[1.35] line-clamp-2 mb-2 tracking-tight">
                {item.title}
              </h3>
              <p className="text-[13px] text-muted-foreground line-clamp-2 leading-relaxed flex-1">
                {item.summary}
              </p>
            </div>
            
            {/* Hover actions */}
            <div className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-all duration-200">
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button variant="secondary" size="icon" className="h-7 w-7 bg-white/90 hover:bg-white border border-black/5 shadow-sm">
                    <MoreHorizontal className="w-3.5 h-3.5 text-foreground/70" />
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
    
    // Dark mode: Overlay style with gradient
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        className={`group cursor-pointer ${className}`}
        onClick={handleClick}
        data-testid={`card-item-matter-${item.id}`}
      >
        <div className="relative rounded-2xl overflow-hidden h-[280px] shadow-lg shadow-black/30 ring-1 ring-white/5 transition-all duration-300 group-hover:shadow-xl group-hover:shadow-black/40 group-hover:ring-white/20">
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt=""
              className="w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-[1.03]"
            />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${getPlaceholderGradient(item.id)}`}>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15),transparent_50%)]" />
              <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/40 to-transparent" />
            </div>
          )}
          {/* Multi-layer gradient overlay for depth */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/30" />
          
          {/* Domain pill with glass effect */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10">
              {item.favicon ? (
                <img src={item.favicon} alt="" className="w-3.5 h-3.5 rounded-sm" />
              ) : (
                <Globe className="w-3 h-3 text-white/70" />
              )}
              <span className="text-[11px] text-white/90 font-medium tracking-wide">
                {item.domain}
              </span>
            </div>
          </div>
          
          {/* Content with improved typography */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="font-semibold text-white text-[15px] leading-[1.35] line-clamp-2 mb-2 tracking-tight" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
              {item.title}
            </h3>
            <p className="text-[13px] text-white/75 line-clamp-2 leading-relaxed" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}>
              {item.summary}
            </p>
          </div>
          
          {/* Hover actions with glass effect */}
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-1 group-hover:translate-y-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="secondary" size="icon" className="h-8 w-8 bg-black/40 backdrop-blur-md hover:bg-black/60 border border-white/10 shadow-lg">
                  <MoreHorizontal className="w-4 h-4 text-white" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="backdrop-blur-xl">
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
    // Light mode: Card style
    if (!isDark) {
      return (
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
          className={`group cursor-pointer w-[220px] ${className}`}
          onClick={handleClick}
          data-testid={`card-item-scroll-${item.id}`}
        >
          <div className="rounded-2xl overflow-hidden h-[180px] bg-card shadow-sm shadow-black/5 ring-1 ring-border/50 transition-all duration-300 group-hover:shadow-md group-hover:ring-border">
            <div className="relative h-[100px] overflow-hidden">
              {item.imageUrl ? (
                <img src={item.imageUrl} alt="" className="w-full h-full object-cover transition-all duration-500 group-hover:scale-[1.02]" />
              ) : (
                <div className={`w-full h-full bg-gradient-to-br ${getPlaceholderGradient(item.id)}`} />
              )}
              <div className="absolute top-2 left-2">
                <div className="px-1.5 py-0.5 rounded-full bg-white/90 backdrop-blur-sm border border-black/5 shadow-sm">
                  <span className="text-[9px] text-foreground/80 font-medium">{item.domain}</span>
                </div>
              </div>
            </div>
            <div className="p-3">
              <h3 className="font-semibold text-foreground text-[12px] leading-snug line-clamp-2 tracking-tight">{item.title}</h3>
            </div>
          </div>
        </motion.div>
      );
    }
    
    // Dark mode: Overlay style
    return (
      <motion.div
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
        className={`group cursor-pointer w-[260px] ${className}`}
        onClick={handleClick}
        data-testid={`card-item-scroll-${item.id}`}
      >
        <div className="relative rounded-2xl overflow-hidden h-[180px] shadow-md shadow-black/25 ring-1 ring-white/5 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-black/35 group-hover:ring-white/15">
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt=""
              className="w-full h-full object-cover transition-all duration-500 ease-out group-hover:scale-[1.02]"
            />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${getPlaceholderGradient(item.id)}`}>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.12),transparent_50%)]" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
          <div className="absolute top-2.5 left-2.5">
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/35 backdrop-blur-sm border border-white/10">
              <span className="text-[10px] text-white/85 font-medium tracking-wide">{item.domain}</span>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <h3 className="font-semibold text-white text-[13px] leading-snug line-clamp-2 tracking-tight" style={{ textShadow: '0 1px 6px rgba(0,0,0,0.5)' }}>{item.title}</h3>
          </div>
        </div>
      </motion.div>
    );
  }

  if (variant === "matter-grid") {
    // Light mode: Card style
    if (!isDark) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          className={`group cursor-pointer ${className}`}
          onClick={handleClick}
          data-testid={`card-item-grid-${item.id}`}
        >
          <div className="rounded-2xl overflow-hidden bg-card shadow-sm shadow-black/5 ring-1 ring-border/50 transition-all duration-300 group-hover:shadow-md group-hover:ring-border">
            <div className="relative aspect-[16/10] overflow-hidden">
              {item.imageUrl ? (
                <img src={item.imageUrl} alt="" className="w-full h-full object-cover transition-all duration-500 group-hover:scale-[1.02]" />
              ) : (
                <div className={`w-full h-full bg-gradient-to-br ${getPlaceholderGradient(item.id)}`} />
              )}
              <div className="absolute top-2 left-2">
                <div className="px-1.5 py-0.5 rounded-full bg-white/90 backdrop-blur-sm border border-black/5 shadow-sm">
                  <span className="text-[8px] text-foreground/80 font-medium">{item.domain}</span>
                </div>
              </div>
            </div>
            <div className="p-2.5">
              <h3 className="font-semibold text-foreground text-[11px] leading-snug line-clamp-2 tracking-tight">{item.title}</h3>
            </div>
          </div>
        </motion.div>
      );
    }
    
    // Dark mode: Overlay style
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
        className={`group cursor-pointer ${className}`}
        onClick={handleClick}
        data-testid={`card-item-grid-${item.id}`}
      >
        <div className="relative rounded-2xl overflow-hidden aspect-[4/3] shadow-md shadow-black/25 ring-1 ring-white/5 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-black/35 group-hover:ring-white/15">
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt=""
              className="w-full h-full object-cover transition-all duration-500 ease-out group-hover:scale-[1.02]"
            />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${getPlaceholderGradient(item.id)}`}>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.12),transparent_50%)]" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
          <div className="absolute top-2 left-2">
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-black/35 backdrop-blur-sm border border-white/10">
              <span className="text-[9px] text-white/85 font-medium tracking-wide">{item.domain}</span>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-2.5">
            <h3 className="font-semibold text-white text-xs leading-snug line-clamp-2 tracking-tight" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>{item.title}</h3>
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
        transition={{ duration: 0.25 }}
        className={`group cursor-pointer ${className}`}
        onClick={handleClick}
        data-testid={`card-item-${item.id}`}
      >
        <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-all duration-200 border border-transparent hover:border-border/30">
          <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-muted/50 ring-1 ring-border/20">
            {item.imageUrl ? (
              <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
            ) : item.favicon ? (
              <div className="w-full h-full flex items-center justify-center">
                <img src={item.favicon} alt="" className="w-5 h-5" />
              </div>
            ) : (
              <div className={`w-full h-full bg-gradient-to-br ${getPlaceholderGradient(item.id)}`} />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate tracking-tight">{item.title}</p>
            <p className="text-xs text-muted-foreground">{item.domain}</p>
          </div>
          <span className="text-[10px] text-muted-foreground bg-muted/80 px-2.5 py-1 rounded-full font-medium">
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
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className={className}
      >
        <div
          className="group cursor-pointer rounded-2xl overflow-hidden h-full shadow-xl shadow-black/15 dark:shadow-black/40 ring-1 ring-white/10 dark:ring-white/5 transition-all duration-300 group-hover:shadow-2xl group-hover:ring-white/20"
          onClick={handleClick}
          data-testid={`card-item-featured-${item.id}`}
        >
          <div className="relative h-full min-h-[280px]">
            {item.imageUrl ? (
              <img
                src={item.imageUrl}
                alt=""
                className="w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-[1.02]"
              />
            ) : (
              <div className={`w-full h-full bg-gradient-to-br ${getPlaceholderGradient(item.id)}`}>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15),transparent_50%)]" />
              </div>
            )}
            {/* Multi-layer gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/30" />
            
            <div className="absolute inset-0 p-6 flex flex-col justify-end">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 w-fit mb-3">
                {item.favicon ? (
                  <img src={item.favicon} alt="" className="w-3.5 h-3.5 rounded-sm" />
                ) : (
                  <Globe className="w-3 h-3 text-white/70" />
                )}
                <span className="text-[11px] text-white/90 font-medium tracking-wide">{item.domain}</span>
              </div>
              <h3 className="font-semibold text-2xl leading-tight text-white mb-3 tracking-tight" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
                {item.title}
              </h3>
              <p className="text-sm text-white/80 line-clamp-2 leading-relaxed" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}>
                {item.summary}
              </p>
            </div>
            
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-1 group-hover:translate-y-0">
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button variant="secondary" size="icon" className="h-9 w-9 bg-black/40 backdrop-blur-md hover:bg-black/60 border border-white/10 shadow-lg">
                    <MoreHorizontal className="w-4 h-4 text-white" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="backdrop-blur-xl">
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
        </div>
      </motion.div>
    );
  }

  if (variant === "wide") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
        className={className}
      >
        <div
          className="group cursor-pointer rounded-2xl overflow-hidden bg-card/80 backdrop-blur-sm border border-border/30 h-full shadow-sm shadow-black/5 dark:shadow-black/20 ring-1 ring-white/5 transition-all duration-300 group-hover:shadow-md group-hover:border-border/50 group-hover:ring-white/10"
          onClick={handleClick}
          data-testid={`card-item-wide-${item.id}`}
        >
          <div className="flex h-full">
            <div className="relative w-1/3 min-w-[160px] overflow-hidden">
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt=""
                  className="w-full h-full object-cover transition-all duration-500 ease-out group-hover:scale-[1.03]"
                />
              ) : (
                <div className={`w-full h-full bg-gradient-to-br ${getPlaceholderGradient(item.id)}`}>
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.12),transparent_50%)]" />
                </div>
              )}
            </div>
            <div className="flex-1 p-5 flex flex-col">
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-muted/60 w-fit mb-2">
                {item.favicon && <img src={item.favicon} alt="" className="w-3 h-3 rounded-sm" />}
                <span className="text-[10px] text-muted-foreground font-medium">{item.domain}</span>
              </div>
              <h3 className="font-semibold text-lg leading-tight mb-2 tracking-tight">
                {item.title}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2 flex-grow leading-relaxed">
                {item.summary}
              </p>
              <span className="text-xs text-muted-foreground/70 mt-3">
                {formatDate(item.savedAt)}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Default variant - Card style with image on top
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}
    >
      <div
        className="group cursor-pointer rounded-2xl overflow-hidden bg-card/80 backdrop-blur-sm border border-border/30 h-full shadow-sm shadow-black/5 dark:shadow-black/20 ring-1 ring-white/5 transition-all duration-300 group-hover:shadow-md group-hover:border-border/50 group-hover:ring-white/10"
        onClick={handleClick}
        data-testid={`card-item-${item.id}`}
      >
        <div className="relative h-36 overflow-hidden">
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt=""
              className="w-full h-full object-cover transition-all duration-500 ease-out group-hover:scale-[1.03]"
            />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${getPlaceholderGradient(item.id)}`}>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.12),transparent_50%)]" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
          
          {/* Domain pill on image */}
          <div className="absolute top-2.5 left-2.5">
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-sm border border-white/10">
              <span className="text-[9px] text-white/90 font-medium tracking-wide">{item.domain}</span>
            </div>
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-sm leading-snug line-clamp-2 mb-2 tracking-tight">
            {item.title}
          </h3>
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {item.summary}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
