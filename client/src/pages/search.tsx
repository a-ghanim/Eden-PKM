import { motion } from "framer-motion";
import { SearchInterface } from "@/components/SearchInterface";

export default function SearchPage() {
  return (
    <div className="p-6 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <div>
          <h1 className="font-serif text-3xl tracking-tight mb-2">Search</h1>
          <p className="text-muted-foreground text-sm">
            Find anything in your knowledge base
          </p>
        </div>
        <SearchInterface />
      </motion.div>
    </div>
  );
}
