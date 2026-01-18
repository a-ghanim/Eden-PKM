import { useEffect, useRef, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, Globe, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import * as d3 from "d3";
import { useEden } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/ThemeProvider";
import type { SavedItem } from "@shared/schema";

interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  item: SavedItem;
  color: string;
  size: number;
}

interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  source: string | GraphNode;
  target: string | GraphNode;
  strength: number;
}

const tagColors: Record<string, string> = {};
const colorPalette = [
  "#6b8a7a",
  "#7c9eb2",
  "#b8a9c9",
  "#d4a574",
  "#9db4ab",
  "#c9a9a9",
  "#a9c9c4",
  "#c4b896",
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
  const { theme } = useTheme();
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredNode, setHoveredNode] = useState<SavedItem | null>(null);
  const [hoveredPosition, setHoveredPosition] = useState({ x: 0, y: 0 });
  const [transform, setTransform] = useState<d3.ZoomTransform>(d3.zoomIdentity);
  
  // Theme-aware colors
  const isDark = theme === "dark";
  const colors = {
    background: isDark ? "hsl(0, 0%, 3%)" : "hsl(40, 20%, 96%)",
    gridDot: isDark ? "hsl(0, 0%, 15%)" : "hsl(40, 10%, 80%)",
    linkStroke: isDark ? "hsl(0, 0%, 35%)" : "hsl(40, 10%, 70%)",
    labelText: isDark ? "hsl(0, 0%, 60%)" : "hsl(40, 10%, 35%)",
    hoverStroke: isDark ? "white" : "hsl(40, 10%, 20%)",
  };

  const { nodes, links } = useMemo(() => {
    if (items.length === 0) return { nodes: [], links: [] };

    const graphNodes: GraphNode[] = items.map((item) => {
      const primaryTag = item.tags[0] || "default";
      const connectionCount = items.filter((other) =>
        other.id !== item.id && other.tags.some((t) => item.tags.includes(t))
      ).length;

      return {
        id: item.id,
        item,
        color: getTagColor(primaryTag),
        size: 6 + Math.min(connectionCount * 2, 12),
      };
    });

    const graphLinks: GraphLink[] = [];
    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        const sharedTags = items[i].tags.filter((tag) => items[j].tags.includes(tag));
        if (sharedTags.length > 0) {
          graphLinks.push({
            source: items[i].id,
            target: items[j].id,
            strength: sharedTags.length,
          });
        }
      }
    }

    return { nodes: graphNodes, links: graphLinks };
  }, [items]);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || nodes.length === 0) return;

    const svg = d3.select(svgRef.current);
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    svg.selectAll("*").remove();

    const g = svg.append("g");

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.2, 4])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
        setTransform(event.transform);
      });

    svg.call(zoom);

    const simulation = d3.forceSimulation<GraphNode>(nodes)
      .force("link", d3.forceLink<GraphNode, GraphLink>(links)
        .id((d) => d.id)
        .distance(80)
        .strength((d) => 0.3 + (d.strength as number) * 0.2))
      .force("charge", d3.forceManyBody()
        .strength(-150)
        .distanceMax(300))
      .force("center", d3.forceCenter(width / 2, height / 2)
        .strength(0.1))
      .force("collide", d3.forceCollide<GraphNode>()
        .radius((d) => d.size + 20)
        .strength(0.8));

    const link = g.append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke", colors.linkStroke)
      .attr("stroke-opacity", (d) => 0.3 + (d.strength as number) * 0.15)
      .attr("stroke-width", (d) => 0.5 + (d.strength as number) * 0.5);

    const drag = d3.drag<SVGGElement, GraphNode>()
      .on("start", (event, d) => {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on("drag", (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on("end", (event, d) => {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      });

    const nodeGroup = g.append("g")
      .attr("class", "nodes")
      .selectAll<SVGGElement, GraphNode>("g")
      .data(nodes)
      .join("g")
      .attr("cursor", "pointer")
      .call(drag);

    nodeGroup.append("circle")
      .attr("r", (d) => d.size * 1.8)
      .attr("fill", (d) => d.color)
      .attr("opacity", 0.15);

    nodeGroup.append("circle")
      .attr("r", (d) => d.size)
      .attr("fill", (d) => d.color)
      .attr("stroke", (d) => d.color)
      .attr("stroke-width", 2)
      .attr("stroke-opacity", 0.5);

    nodeGroup.append("text")
      .text((d) => d.item.title.length > 20 ? d.item.title.substring(0, 18) + "..." : d.item.title)
      .attr("text-anchor", "middle")
      .attr("dy", (d) => d.size + 14)
      .attr("fill", colors.labelText)
      .attr("font-size", "10px")
      .attr("font-family", "Inter, sans-serif")
      .attr("pointer-events", "none");

    nodeGroup
      .on("mouseenter", function (event, d) {
        d3.select(this).select("circle:nth-child(2)")
          .transition()
          .duration(150)
          .attr("r", d.size * 1.3)
          .attr("stroke", colors.hoverStroke)
          .attr("stroke-width", 2);

        link
          .attr("stroke-opacity", (l) => {
            const source = typeof l.source === "object" ? l.source.id : l.source;
            const target = typeof l.target === "object" ? l.target.id : l.target;
            return source === d.id || target === d.id ? 0.8 : 0.1;
          })
          .attr("stroke", (l) => {
            const source = typeof l.source === "object" ? l.source.id : l.source;
            const target = typeof l.target === "object" ? l.target.id : l.target;
            return source === d.id || target === d.id ? d.color : colors.linkStroke;
          });

        setHoveredNode(d.item);
        setHoveredPosition({ x: event.clientX, y: event.clientY });
      })
      .on("mouseleave", function (_, d) {
        d3.select(this).select("circle:nth-child(2)")
          .transition()
          .duration(150)
          .attr("r", d.size)
          .attr("stroke", d.color)
          .attr("stroke-width", 2);

        link
          .attr("stroke-opacity", (l) => 0.3 + (l.strength as number) * 0.15)
          .attr("stroke", colors.linkStroke);

        setHoveredNode(null);
      })
      .on("click", (_, d) => {
        setSelectedItem(d.item);
      });

    simulation.on("tick", () => {
      link
        .attr("x1", (d) => (d.source as GraphNode).x!)
        .attr("y1", (d) => (d.source as GraphNode).y!)
        .attr("x2", (d) => (d.target as GraphNode).x!)
        .attr("y2", (d) => (d.target as GraphNode).y!);

      nodeGroup.attr("transform", (d) => `translate(${d.x},${d.y})`);
    });

    simulation.alpha(1).restart();

    return () => {
      simulation.stop();
    };
  }, [nodes, links, setSelectedItem, colors.linkStroke, colors.labelText, colors.hoverStroke]);

  const handleZoom = (direction: "in" | "out" | "reset") => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    const zoom = d3.zoom<SVGSVGElement, unknown>();

    if (direction === "reset") {
      svg.transition().duration(300).call(zoom.transform, d3.zoomIdentity);
    } else {
      const scale = direction === "in" ? 1.3 : 0.7;
      svg.transition().duration(300).call(zoom.scaleBy, scale);
    }
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
            {items.length} nodes, {links.length} connections — drag nodes to rearrange
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => handleZoom("out")}
            className="h-8 w-8"
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => handleZoom("in")}
            className="h-8 w-8"
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => handleZoom("reset")}
            className="h-8 w-8"
          >
            <Maximize2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div
        ref={containerRef}
        className="relative h-[600px] rounded-2xl overflow-hidden border border-border/20"
        style={{ backgroundColor: colors.background }}
      >
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, ${colors.gridDot} 1px, transparent 0)`,
            backgroundSize: "20px 20px",
          }}
        />

        <svg
          ref={svgRef}
          className="absolute inset-0 w-full h-full"
          style={{ cursor: "grab" }}
        />

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

        <div className="absolute bottom-4 right-4 glass rounded-xl px-3 py-1.5">
          <span className="text-xs text-muted-foreground">
            {Math.round(transform.k * 100)}%
          </span>
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
              <span className="text-muted-foreground">{hoveredNode.domain}</span>
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
