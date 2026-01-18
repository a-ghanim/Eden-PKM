import { motion } from "framer-motion";
import { CollectionsView } from "@/components/CollectionsView";

export default function CollectionsPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h1 className="font-serif text-display-xs mb-2">Collections</h1>
        <p className="text-muted-foreground">
          Your content automatically organized by topic and theme
        </p>
      </div>
      <CollectionsView />
    </motion.div>
  );
}
