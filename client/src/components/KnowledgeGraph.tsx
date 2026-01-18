import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useEden } from "@/lib/store";
import type { SavedItem } from "@shared/schema";

interface GraphNode {
  id: string;
  name: string;
  type: "item" | "cluster";
  x: number;
  y: number;
  z: number;
  size: number;
  color: string;
  items?: SavedItem[];
  tag?: string;
}

interface Cluster {
  name: string;
  items: SavedItem[];
  color: string;
}

const clusterColors = [
  "hsl(160, 50%, 42%)",
  "hsl(200, 70%, 50%)",
  "hsl(280, 60%, 55%)",
  "hsl(45, 85%, 50%)",
  "hsl(340, 70%, 55%)",
  "hsl(120, 45%, 45%)",
  "hsl(30, 80%, 55%)",
];

export function KnowledgeGraph() {
  const { items, setSelectedItem } = useEden();
  const [hoveredCluster, setHoveredCluster] = useState<Cluster | null>(null);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });

  const clusters = useMemo(() => {
    const tagCounts = new Map<string, SavedItem[]>();
    
    items.forEach((item) => {
      item.tags.forEach((tag) => {
        const existing = tagCounts.get(tag) || [];
        existing.push(item);
        tagCounts.set(tag, existing);
      });
    });

    return Array.from(tagCounts.entries())
      .filter(([_, items]) => items.length >= 1)
      .sort((a, b) => b[1].length - a[1].length)
      .slice(0, 7)
      .map(([name, items], index) => ({
        name,
        items,
        color: clusterColors[index % clusterColors.length],
      }));
  }, [items]);

  const graphNodes = useMemo(() => {
    const nodes: GraphNode[] = [];
    const centerX = 50;
    const centerY = 50;

    clusters.forEach((cluster, clusterIndex) => {
      const clusterAngle = (clusterIndex / clusters.length) * 2 * Math.PI;
      const clusterRadius = 25 + (cluster.items.length * 2);
      const clusterX = centerX + Math.cos(clusterAngle) * 30;
      const clusterY = centerY + Math.sin(clusterAngle) * 25;

      nodes.push({
        id: `cluster-${cluster.name}`,
        name: cluster.name,
        type: "cluster",
        x: clusterX,
        y: clusterY,
        z: 0.8 + Math.random() * 0.4,
        size: clusterRadius,
        color: cluster.color,
        items: cluster.items,
        tag: cluster.name,
      });

      cluster.items.forEach((item, itemIndex) => {
        const itemAngle = (itemIndex / cluster.items.length) * 2 * Math.PI;
        const itemRadius = clusterRadius * 0.4;
        nodes.push({
          id: item.id,
          name: item.title,
          type: "item",
          x: clusterX + Math.cos(itemAngle) * itemRadius,
          y: clusterY + Math.sin(itemAngle) * itemRadius,
          z: 0.5 + Math.random() * 0.5,
          size: 8 + item.connections.length * 2,
          color: cluster.color,
        });
      });
    });

    return nodes;
  }, [clusters]);

  const handleClusterHover = (cluster: Cluster, e: React.MouseEvent) => {
    setHoveredCluster(cluster);
    setPopupPosition({ x: e.clientX, y: e.clientY });
  };

  const handleItemClick = (nodeId: string) => {
    const item = items.find((i) => i.id === nodeId);
    if (item) setSelectedItem(item);
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
          Start saving content to visualize how your ideas connect and cluster.
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
            {items.length} items clustered by {clusters.length} tags
          </p>
        </div>
      </div>

      <div className="relative h-[600px] rounded-2xl overflow-hidden dotted-grid-subtle border border-border/30">
        <svg className="absolute inset-0 w-full h-full">
          <defs>
            <filter id="goo">
              <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur" />
              <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9" result="goo" />
            </filter>
            {clusters.map((cluster, i) => (
              <radialGradient key={cluster.name} id={`grad-${i}`} cx="30%" cy="30%">
                <stop offset="0%" stopColor={cluster.color} stopOpacity="0.6" />
                <stop offset="70%" stopColor={cluster.color} stopOpacity="0.2" />
                <stop offset="100%" stopColor={cluster.color} stopOpacity="0.05" />
              </radialGradient>
            ))}
          </defs>

          {graphNodes
            .filter((n) => n.type === "cluster")
            .map((node, index) => {
              const cluster = clusters.find((c) => c.name === node.tag);
              return (
                <g key={node.id}>
                  <motion.ellipse
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    cx={`${node.x}%`}
                    cy={`${node.y}%`}
                    rx={node.size * 1.8}
                    ry={node.size * 1.4}
                    fill={`url(#grad-${index})`}
                    className="liquid-boundary cursor-pointer"
                    style={{ transformOrigin: `${node.x}% ${node.y}%` }}
                    onMouseEnter={(e) => cluster && handleClusterHover(cluster, e as unknown as React.MouseEvent)}
                    onMouseLeave={() => setHoveredCluster(null)}
                  />
                  <motion.text
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.1 + 0.3 }}
                    x={`${node.x}%`}
                    y={`${node.y + node.size * 0.5}%`}
                    textAnchor="middle"
                    className="fill-foreground text-xs font-medium pointer-events-none"
                    style={{ fontSize: "11px" }}
                  >
                    {node.name}
                  </motion.text>
                </g>
              );
            })}

          {graphNodes
            .filter((n) => n.type === "item")
            .map((node, index) => (
              <motion.circle
                key={node.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: node.z, opacity: 0.8 }}
                transition={{ delay: 0.3 + index * 0.02, duration: 0.3 }}
                cx={`${node.x}%`}
                cy={`${node.y}%`}
                r={node.size}
                fill={node.color}
                stroke={node.color}
                strokeWidth="1"
                className="cursor-pointer hover:opacity-100 transition-opacity"
                style={{ filter: `drop-shadow(0 0 ${node.size}px ${node.color}40)` }}
                onClick={() => handleItemClick(node.id)}
              />
            ))}
        </svg>

        <div className="absolute bottom-4 left-4 flex items-center gap-4 glass rounded-xl px-4 py-3">
          {clusters.slice(0, 5).map((cluster) => (
            <div key={cluster.name} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: cluster.color }}
              />
              <span className="text-xs text-muted-foreground">{cluster.name}</span>
            </div>
          ))}
        </div>

        <div className="absolute top-4 right-4 flex gap-2">
          <div className="glass rounded-xl px-4 py-2">
            <span className="text-xs text-muted-foreground">Click nodes to view details</span>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {hoveredCluster && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed z-50 glass rounded-2xl p-4 min-w-[280px] max-w-sm border border-border/50"
            style={{
              left: Math.min(popupPosition.x + 20, window.innerWidth - 320),
              top: Math.min(popupPosition.y - 100, window.innerHeight - 300),
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: hoveredCluster.color }}
                />
                <h3 className="font-serif text-lg">{hoveredCluster.name}</h3>
              </div>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                {hoveredCluster.items.length} items
              </span>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin">
              {hoveredCluster.items.slice(0, 5).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => setSelectedItem(item)}
                >
                  {item.favicon && (
                    <img src={item.favicon} alt="" className="w-4 h-4 rounded" />
                  )}
                  <span className="text-sm truncate flex-1">{item.title}</span>
                </div>
              ))}
              {hoveredCluster.items.length > 5 && (
                <p className="text-xs text-muted-foreground text-center py-1">
                  +{hoveredCluster.items.length - 5} more
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
