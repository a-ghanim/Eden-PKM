import { useMemo, useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, Globe } from "lucide-react";
import { useEden } from "@/lib/store";
import type { SavedItem } from "@shared/schema";

interface GraphNode {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  item: SavedItem;
  color: string;
  size: number;
}

interface Connection {
  source: string;
  target: string;
  strength: number;
}

const tagColors: Record<string, string> = {};
const colorPalette = [
  "#6b8a7a", // sage
  "#7c9eb2", // steel blue
  "#b8a9c9", // lavender
  "#d4a574", // tan
  "#9db4ab", // mint
  "#c9a9a9", // dusty rose
  "#a9c9c4", // teal
  "#c4b896", // olive
];

function getTagColor(tag: string): string {
  if (!tagColors[tag]) {
    const index = Object.keys(tagColors).length % colorPalette.length;
    tagColors[tag] = colorPalette[index];
  }
  return tagColors[tag];
}

export function KnowledgeGraph() {
  const { items, setSelectedItem } = useEden();
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [hoveredNode, setHoveredNode] = useState<SavedItem | null>(null);
  const [hoveredPosition, setHoveredPosition] = useState({ x: 0, y: 0 });
  const animationRef = useRef<number>();
  const containerRef = useRef<HTMLDivElement>(null);

  const connections = useMemo(() => {
    const conns: Connection[] = [];
    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        const sharedTags = items[i].tags.filter((tag) => items[j].tags.includes(tag));
        if (sharedTags.length > 0) {
          conns.push({
            source: items[i].id,
            target: items[j].id,
            strength: sharedTags.length,
          });
        }
      }
    }
    return conns;
  }, [items]);

  useEffect(() => {
    if (items.length === 0) return;

    const width = 800;
    const height = 600;
    const centerX = width / 2;
    const centerY = height / 2;

    const initialNodes: GraphNode[] = items.map((item, i) => {
      const angle = (i / items.length) * 2 * Math.PI;
      const radius = 150 + Math.random() * 100;
      const primaryTag = item.tags[0] || "default";
      
      return {
        id: item.id,
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
        vx: 0,
        vy: 0,
        item,
        color: getTagColor(primaryTag),
        size: 8 + item.tags.length * 2 + item.connections.length,
      };
    });

    setNodes(initialNodes);

    let iteration = 0;
    const maxIterations = 300;

    const simulate = () => {
      if (iteration >= maxIterations) return;

      setNodes((prevNodes) => {
        const newNodes = prevNodes.map((node) => ({ ...node }));

        newNodes.forEach((node) => {
          const dx = centerX - node.x;
          const dy = centerY - node.y;
          node.vx += dx * 0.001;
          node.vy += dy * 0.001;
        });

        for (let i = 0; i < newNodes.length; i++) {
          for (let j = i + 1; j < newNodes.length; j++) {
            const dx = newNodes[j].x - newNodes[i].x;
            const dy = newNodes[j].y - newNodes[i].y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const minDist = 60;

            if (dist < minDist) {
              const force = (minDist - dist) / dist * 0.5;
              const fx = dx * force;
              const fy = dy * force;
              newNodes[i].vx -= fx;
              newNodes[i].vy -= fy;
              newNodes[j].vx += fx;
              newNodes[j].vy += fy;
            }
          }
        }

        connections.forEach((conn) => {
          const source = newNodes.find((n) => n.id === conn.source);
          const target = newNodes.find((n) => n.id === conn.target);
          if (source && target) {
            const dx = target.x - source.x;
            const dy = target.y - source.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const idealDist = 100 - conn.strength * 15;
            const force = (dist - idealDist) / dist * 0.02 * conn.strength;
            const fx = dx * force;
            const fy = dy * force;
            source.vx += fx;
            source.vy += fy;
            target.vx -= fx;
            target.vy -= fy;
          }
        });

        newNodes.forEach((node) => {
          node.vx *= 0.85;
          node.vy *= 0.85;
          node.x += node.vx;
          node.y += node.vy;
          node.x = Math.max(50, Math.min(width - 50, node.x));
          node.y = Math.max(50, Math.min(height - 50, node.y));
        });

        return newNodes;
      });

      iteration++;
      animationRef.current = requestAnimationFrame(simulate);
    };

    animationRef.current = requestAnimationFrame(simulate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [items, connections]);

  const handleNodeHover = (node: GraphNode, e: React.MouseEvent) => {
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

  const uniqueTags = Array.from(new Set(items.flatMap((item) => item.tags))).slice(0, 6);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl tracking-tight mb-1">Knowledge Graph</h1>
          <p className="text-sm text-muted-foreground">
            {items.length} nodes, {connections.length} connections
          </p>
        </div>
      </div>

      <div 
        ref={containerRef}
        className="relative h-[600px] rounded-2xl overflow-hidden bg-[hsl(0_0%_6%)] border border-border/20"
      >
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, hsl(0 0% 20%) 1px, transparent 0)`,
            backgroundSize: '24px 24px',
          }}
        />

        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 600">
          {connections.map((conn) => {
            const source = nodes.find((n) => n.id === conn.source);
            const target = nodes.find((n) => n.id === conn.target);
            if (!source || !target) return null;

            return (
              <line
                key={`${conn.source}-${conn.target}`}
                x1={source.x}
                y1={source.y}
                x2={target.x}
                y2={target.y}
                stroke="hsl(0 0% 40%)"
                strokeWidth={0.5 + conn.strength * 0.5}
                strokeOpacity={0.3 + conn.strength * 0.1}
              />
            );
          })}

          {nodes.map((node) => {
            const isHovered = hoveredNode?.id === node.id;
            const isConnectedToHovered = hoveredNode && connections.some(
              (c) => (c.source === hoveredNode.id && c.target === node.id) ||
                     (c.target === hoveredNode.id && c.source === node.id)
            );

            return (
              <g key={node.id}>
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={node.size * 2.5}
                  fill={node.color}
                  opacity={0.15}
                />
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={node.size}
                  fill={node.color}
                  stroke={isHovered ? "white" : node.color}
                  strokeWidth={isHovered ? 2 : 1}
                  opacity={isHovered || isConnectedToHovered ? 1 : 0.85}
                  className="cursor-pointer transition-all duration-150"
                  style={{ 
                    filter: isHovered ? `drop-shadow(0 0 8px ${node.color})` : 'none',
                    transform: isHovered ? 'scale(1.2)' : 'scale(1)',
                    transformOrigin: `${node.x}px ${node.y}px`,
                  }}
                  onMouseEnter={(e) => handleNodeHover(node, e as unknown as React.MouseEvent)}
                  onMouseLeave={() => setHoveredNode(null)}
                  onClick={() => setSelectedItem(node.item)}
                />
                <text
                  x={node.x}
                  y={node.y + node.size + 14}
                  textAnchor="middle"
                  fill="hsl(0 0% 70%)"
                  fontSize="10"
                  opacity={isHovered ? 1 : 0.6}
                  className="pointer-events-none select-none"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  {node.item.title.length > 25 
                    ? node.item.title.substring(0, 22) + "..." 
                    : node.item.title}
                </text>
              </g>
            );
          })}
        </svg>

        <div className="absolute bottom-4 left-4 glass rounded-xl px-4 py-3">
          <div className="flex flex-wrap items-center gap-3">
            {uniqueTags.map((tag) => (
              <div key={tag} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: getTagColor(tag) }}
                />
                <span className="text-xs text-muted-foreground">{tag}</span>
              </div>
            ))}
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
                  className="px-2 py-0.5 text-[10px] rounded-full"
                  style={{ backgroundColor: `${getTagColor(tag)}30`, color: getTagColor(tag) }}
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
