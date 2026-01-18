import { motion } from "framer-motion";
import { CollectionsView } from "@/components/CollectionsView";

export default function CollectionsPage() {
  return (
    <div className="p-6 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <div>
          <h1 className="font-serif text-3xl tracking-tight mb-2">Collections</h1>
          <p className="text-muted-foreground text-sm">
            Content automatically organized by topic
          </p>
        </div>
        <CollectionsView />
      </motion.div>
    </div>
  );
}
