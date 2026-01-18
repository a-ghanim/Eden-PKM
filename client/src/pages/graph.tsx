import { motion } from "framer-motion";
import { KnowledgeGraph } from "@/components/KnowledgeGraph";

export default function GraphPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h1 className="font-serif text-display-xs mb-2">Knowledge Graph</h1>
        <p className="text-muted-foreground">
          Visualize connections between your saved content
        </p>
      </div>
      <KnowledgeGraph />
    </motion.div>
  );
}
