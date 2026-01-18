import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ZAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useEden } from "@/lib/store";

interface GraphNode {
  id: string;
  name: string;
  type: "item" | "concept" | "tag";
  x: number;
  y: number;
  size: number;
  color: string;
  connections: number;
}

const typeColors = {
  item: "hsl(153, 24%, 46%)",
  concept: "hsl(30, 80%, 60%)",
  tag: "hsl(215, 60%, 55%)",
};

export function KnowledgeGraph() {
  const { items, concepts, setSelectedItem } = useEden();

  const graphData = useMemo(() => {
    const nodes: GraphNode[] = [];
    const conceptMap = new Map<string, { count: number; items: string[] }>();
    const tagMap = new Map<string, { count: number; items: string[] }>();

    items.forEach((item) => {
      item.concepts.forEach((concept) => {
        const existing = conceptMap.get(concept) || { count: 0, items: [] };
        existing.count += 1;
        existing.items.push(item.id);
        conceptMap.set(concept, existing);
      });

      item.tags.forEach((tag) => {
        const existing = tagMap.get(tag) || { count: 0, items: [] };
        existing.count += 1;
        existing.items.push(item.id);
        tagMap.set(tag, existing);
      });
    });

    const centerX = 50;
    const centerY = 50;

    items.forEach((item, index) => {
      const angle = (index / items.length) * 2 * Math.PI;
      const radius = 30 + Math.random() * 15;
      nodes.push({
        id: item.id,
        name: item.title.slice(0, 30) + (item.title.length > 30 ? "..." : ""),
        type: "item",
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
        size: 60 + (item.connections.length * 10),
        color: typeColors.item,
        connections: item.connections.length + item.concepts.length + item.tags.length,
      });
    });

    Array.from(conceptMap.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 15)
      .forEach(([concept, data], index) => {
        const angle = (index / 15) * 2 * Math.PI + Math.PI / 4;
        const radius = 15 + Math.random() * 10;
        nodes.push({
          id: `concept-${concept}`,
          name: concept,
          type: "concept",
          x: centerX + Math.cos(angle) * radius,
          y: centerY + Math.sin(angle) * radius,
          size: 40 + data.count * 15,
          color: typeColors.concept,
          connections: data.count,
        });
      });

    Array.from(tagMap.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 10)
      .forEach(([tag, data], index) => {
        const angle = (index / 10) * 2 * Math.PI - Math.PI / 4;
        const radius = 20 + Math.random() * 12;
        nodes.push({
          id: `tag-${tag}`,
          name: tag,
          type: "tag",
          x: centerX + Math.cos(angle) * radius,
          y: centerY + Math.sin(angle) * radius,
          size: 30 + data.count * 12,
          color: typeColors.tag,
          connections: data.count,
        });
      });

    return nodes;
  }, [items]);

  const stats = useMemo(() => {
    const uniqueConcepts = new Set<string>();
    const uniqueTags = new Set<string>();
    let totalConnections = 0;

    items.forEach((item) => {
      item.concepts.forEach((c) => uniqueConcepts.add(c));
      item.tags.forEach((t) => uniqueTags.add(t));
      totalConnections += item.connections.length;
    });

    return {
      items: items.length,
      concepts: uniqueConcepts.size,
      tags: uniqueTags.size,
      connections: totalConnections,
    };
  }, [items]);

  const handleNodeClick = (data: GraphNode) => {
    if (data.type === "item") {
      const item = items.find((i) => i.id === data.id);
      if (item) setSelectedItem(item);
    }
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as GraphNode;
      return (
        <div className="bg-popover border rounded-lg shadow-lg p-3 max-w-xs">
          <p className="font-medium text-sm">{data.name}</p>
          <div className="flex items-center gap-2 mt-1">
            <Badge
              variant="outline"
              className="text-2xs capitalize"
              style={{ borderColor: data.color, color: data.color }}
            >
              {data.type}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {data.connections} connections
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  if (items.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-16 text-center"
      >
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
        <h3 className="text-lg font-semibold mb-2">No knowledge graph yet</h3>
        <p className="text-muted-foreground max-w-sm">
          Start saving content to see how your knowledge connects and clusters.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-primary">{stats.items}</div>
            <p className="text-xs text-muted-foreground">Saved Items</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold" style={{ color: typeColors.concept }}>
              {stats.concepts}
            </div>
            <p className="text-xs text-muted-foreground">Concepts</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold" style={{ color: typeColors.tag }}>
              {stats.tags}
            </div>
            <p className="text-xs text-muted-foreground">Tags</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{stats.connections}</div>
            <p className="text-xs text-muted-foreground">Connections</p>
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-4">
            Knowledge Graph
            <div className="flex items-center gap-3 ml-auto text-xs font-normal">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: typeColors.item }} />
                <span className="text-muted-foreground">Items</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: typeColors.concept }} />
                <span className="text-muted-foreground">Concepts</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: typeColors.tag }} />
                <span className="text-muted-foreground">Tags</span>
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[500px] w-full dotted-grid rounded-lg">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <XAxis type="number" dataKey="x" domain={[0, 100]} hide />
                <YAxis type="number" dataKey="y" domain={[0, 100]} hide />
                <ZAxis type="number" dataKey="size" range={[40, 400]} />
                <Tooltip content={<CustomTooltip />} />
                <Scatter
                  data={graphData}
                  onClick={(data) => handleNodeClick(data)}
                  style={{ cursor: "pointer" }}
                >
                  {graphData.map((node, index) => (
                    <Cell
                      key={node.id}
                      fill={node.color}
                      fillOpacity={0.7}
                      stroke={node.color}
                      strokeWidth={2}
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
