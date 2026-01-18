import { motion } from "framer-motion";
import { SearchInterface } from "@/components/SearchInterface";

export default function SearchPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h1 className="font-serif text-display-xs mb-2">Search</h1>
        <p className="text-muted-foreground">
          Find anything in your knowledge base using natural language
        </p>
      </div>
      <SearchInterface />
    </motion.div>
  );
}
