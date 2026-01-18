import { useMemo, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, Globe } from "lucide-react";
import { useEden } from "@/lib/store";
import type { SavedItem } from "@shared/schema";

interface NodePosition {
  id: string;
  x: number;
  y: number;
  item: SavedItem;
}

interface Connection {
  source: string;
  target: string;
  sharedTags: string[];
}

const nodeColors = [
  "hsl(160, 50%, 45%)",
  "hsl(200, 70%, 50%)",
  "hsl(280, 60%, 55%)",
  "hsl(45, 85%, 55%)",
  "hsl(340, 70%, 55%)",
  "hsl(30, 80%, 55%)",
];

export function KnowledgeGraph() {
  const { items, setSelectedItem } = useEden();
  const [hoveredNode, setHoveredNode] = useState<SavedItem | null>(null);
  const [hoveredPosition, setHoveredPosition] = useState({ x: 0, y: 0 });

  const { nodes, connections } = useMemo(() => {
    if (items.length === 0) return { nodes: [], connections: [] };

    const nodePositions: NodePosition[] = [];
    const conns: Connection[] = [];

    const width = 100;
    const height = 100;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.35;

    items.forEach((item, index) => {
      const angle = (index / items.length) * 2 * Math.PI - Math.PI / 2;
      const jitterX = (Math.random() - 0.5) * 8;
      const jitterY = (Math.random() - 0.5) * 8;
      
      nodePositions.push({
        id: item.id,
        x: centerX + Math.cos(angle) * radius + jitterX,
        y: centerY + Math.sin(angle) * radius + jitterY,
        item,
      });
    });

    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        const itemA = items[i];
        const itemB = items[j];
        const sharedTags = itemA.tags.filter((tag) => itemB.tags.includes(tag));
        
        if (sharedTags.length > 0) {
          conns.push({
            source: itemA.id,
            target: itemB.id,
            sharedTags,
          });
        }
      }
    }

    return { nodes: nodePositions, connections: conns };
  }, [items]);

  const getNodeColor = useCallback((item: SavedItem) => {
    const primaryTag = item.tags[0] || "";
    const hash = primaryTag.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return nodeColors[hash % nodeColors.length];
  }, []);

  const handleNodeHover = (node: NodePosition, e: React.MouseEvent) => {
    setHoveredNode(node.item);
    setHoveredPosition({ x: e.clientX, y: e.clientY });
  };

  if (items.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-24 text-center"
      >
        <div className="relative mb-8">
          <div className="w-32 h-32 sphere-3d opacity-30" />
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-12 h-12 text-foreground/20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="3" />
              <circle cx="5" cy="6" r="2" />
              <circle cx="19" cy="6" r="2" />
              <circle cx="5" cy="18" r="2" />
              <circle cx="19" cy="18" r="2" />
              <line x1="12" y1="9" x2="12" y2="3" />
              <line x1="9.5" y1="13.5" x2="6.5" y2="16.5" />
              <line x1="14.5" y1="13.5" x2="17.5" y2="16.5" />
            </svg>
          </div>
        </div>
        <h3 className="font-serif text-2xl mb-3">Your knowledge graph awaits</h3>
        <p className="text-muted-foreground max-w-sm">
          Start saving content to visualize how your ideas connect.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl tracking-tight mb-1">Knowledge Graph</h1>
          <p className="text-sm text-muted-foreground">
            {items.length} items with {connections.length} connections
          </p>
        </div>
      </div>

      <div className="relative h-[600px] rounded-2xl overflow-hidden bg-card/50 border border-border/30">
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
          <defs>
            {nodes.map((node) => (
              <radialGradient key={`glow-${node.id}`} id={`glow-${node.id}`}>
                <stop offset="0%" stopColor={getNodeColor(node.item)} stopOpacity="0.3" />
                <stop offset="100%" stopColor={getNodeColor(node.item)} stopOpacity="0" />
              </radialGradient>
            ))}
          </defs>

          {connections.map((conn, index) => {
            const sourceNode = nodes.find((n) => n.id === conn.source);
            const targetNode = nodes.find((n) => n.id === conn.target);
            if (!sourceNode || !targetNode) return null;

            return (
              <motion.line
                key={`${conn.source}-${conn.target}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.15 + conn.sharedTags.length * 0.1 }}
                transition={{ delay: 0.5 + index * 0.02 }}
                x1={sourceNode.x}
                y1={sourceNode.y}
                x2={targetNode.x}
                y2={targetNode.y}
                stroke="currentColor"
                strokeWidth={0.15 + conn.sharedTags.length * 0.1}
                className="text-foreground"
              />
            );
          })}

          {nodes.map((node, index) => {
            const color = getNodeColor(node.item);
            const isHovered = hoveredNode?.id === node.id;
            const nodeSize = 2.5 + (node.item.tags.length * 0.3);

            return (
              <g key={node.id}>
                <motion.circle
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 0.4 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                  cx={node.x}
                  cy={node.y}
                  r={nodeSize * 2}
                  fill={`url(#glow-${node.id})`}
                />
                <motion.circle
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ 
                    scale: isHovered ? 1.3 : 1, 
                    opacity: 1 
                  }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                  cx={node.x}
                  cy={node.y}
                  r={nodeSize}
                  fill={color}
                  stroke={isHovered ? "white" : color}
                  strokeWidth={isHovered ? 0.3 : 0.15}
                  className="cursor-pointer"
                  style={{ filter: `drop-shadow(0 0 2px ${color})` }}
                  onMouseEnter={(e) => handleNodeHover(node, e as unknown as React.MouseEvent)}
                  onMouseLeave={() => setHoveredNode(null)}
                  onClick={() => setSelectedItem(node.item)}
                />
                <motion.text
                  initial={{ opacity: 0 }}
                  animate={{ opacity: isHovered ? 1 : 0.7 }}
                  transition={{ delay: index * 0.05 + 0.2 }}
                  x={node.x}
                  y={node.y + nodeSize + 2}
                  textAnchor="middle"
                  className="fill-foreground pointer-events-none select-none"
                  style={{ fontSize: "2px", fontWeight: isHovered ? 600 : 400 }}
                >
                  {node.item.title.length > 20 
                    ? node.item.title.substring(0, 18) + "..." 
                    : node.item.title}
                </motion.text>
              </g>
            );
          })}
        </svg>

        <div className="absolute bottom-4 left-4 glass rounded-xl px-4 py-3">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-accent" />
              <span>Item node</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-px bg-foreground/30" />
              <span>Shared tags</span>
            </div>
          </div>
        </div>

        <div className="absolute top-4 right-4 glass rounded-xl px-4 py-2">
          <span className="text-xs text-muted-foreground">Hover to preview, click to open</span>
        </div>
      </div>

      <AnimatePresence>
        {hoveredNode && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="fixed z-50 glass rounded-2xl p-4 w-80 border border-border/50 shadow-xl"
            style={{
              left: Math.min(hoveredPosition.x + 20, window.innerWidth - 340),
              top: Math.min(hoveredPosition.y - 20, window.innerHeight - 250),
            }}
          >
            <div className="flex items-start gap-3 mb-3">
              {hoveredNode.favicon ? (
                <img src={hoveredNode.favicon} alt="" className="w-8 h-8 rounded-lg mt-0.5" />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                  <Globe className="w-4 h-4 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm leading-snug line-clamp-2">{hoveredNode.title}</h3>
                <p className="text-xs text-muted-foreground truncate mt-0.5">{hoveredNode.url}</p>
              </div>
            </div>

            {hoveredNode.summary && (
              <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                {hoveredNode.summary}
              </p>
            )}

            <div className="flex flex-wrap gap-1.5 mb-3">
              {hoveredNode.tags.slice(0, 4).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 text-[10px] rounded-full bg-accent/20 text-accent-foreground"
                >
                  {tag}
                </span>
              ))}
              {hoveredNode.tags.length > 4 && (
                <span className="px-2 py-0.5 text-[10px] rounded-full bg-muted text-muted-foreground">
                  +{hoveredNode.tags.length - 4}
                </span>
              )}
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground capitalize">{hoveredNode.intent.replace("_", " ")}</span>
              <div className="flex items-center gap-1 text-accent">
                <ExternalLink className="w-3 h-3" />
                <span>Click to view</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
