import { motion } from "framer-motion";

export function CaptureIllustration() {
  const cards = [
    { x: 20, y: 10, rotation: -8, delay: 0, colorVar: "--accent" },
    { x: 50, y: 25, rotation: 5, delay: 0.2, colorVar: "--primary" },
    { x: 30, y: 45, rotation: -3, delay: 0.4, colorVar: "--accent" },
  ];

  return (
    <div className="relative w-full h-48 overflow-hidden">
      {cards.map((card, i) => (
        <motion.div
          key={i}
          className="absolute w-24 h-16 rounded-lg border border-border/50 backdrop-blur-sm"
          style={{
            left: `${card.x}%`,
            top: `${card.y}%`,
            background: `linear-gradient(135deg, hsl(var(${card.colorVar}) / 0.2), hsl(var(${card.colorVar}) / 0.05))`,
          }}
          initial={{ opacity: 0, y: 40, rotate: card.rotation }}
          animate={{ 
            opacity: [0, 1, 1, 0],
            y: [40, 0, -10, -40],
            rotate: card.rotation,
          }}
          transition={{
            duration: 3,
            delay: card.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <div className="p-2">
            <div className="w-full h-2 rounded bg-foreground/10 mb-1.5" />
            <div className="w-3/4 h-2 rounded bg-foreground/10" />
          </div>
        </motion.div>
      ))}
      
      <motion.div
        className="absolute bottom-4 left-1/2 -translate-x-1/2 w-16 h-16 rounded-2xl bg-accent/20 border border-accent/30 flex items-center justify-center"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 rounded-lg border-2 border-dashed border-accent/50"
        />
      </motion.div>
    </div>
  );
}

export function AIAnalysisIllustration() {
  const neurons = [
    { cx: 25, cy: 20, r: 6 },
    { cx: 75, cy: 25, r: 5 },
    { cx: 50, cy: 50, r: 8 },
    { cx: 20, cy: 70, r: 5 },
    { cx: 80, cy: 75, r: 6 },
  ];
  
  const connections = [
    { from: 0, to: 2 },
    { from: 1, to: 2 },
    { from: 2, to: 3 },
    { from: 2, to: 4 },
    { from: 0, to: 3 },
    { from: 1, to: 4 },
  ];

  return (
    <div className="relative w-full h-32">
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
        {connections.map((conn, i) => (
          <motion.line
            key={i}
            x1={neurons[conn.from].cx}
            y1={neurons[conn.from].cy}
            x2={neurons[conn.to].cx}
            y2={neurons[conn.to].cy}
            stroke="hsl(var(--primary))"
            strokeWidth="1"
            strokeOpacity="0.3"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, delay: i * 0.1, repeat: Infinity, repeatType: "reverse", repeatDelay: 2 }}
          />
        ))}
        
        {neurons.map((neuron, i) => (
          <motion.circle
            key={i}
            cx={neuron.cx}
            cy={neuron.cy}
            r={neuron.r}
            fill="hsl(var(--primary))"
            fillOpacity="0.2"
            stroke="hsl(var(--primary))"
            strokeWidth="1.5"
            initial={{ scale: 0.8, opacity: 0.5 }}
            animate={{ scale: [0.8, 1.1, 0.8], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, delay: i * 0.2, repeat: Infinity }}
          />
        ))}
        
        <motion.circle
          cx="50"
          cy="50"
          r="3"
          fill="hsl(var(--primary))"
          animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      </svg>
    </div>
  );
}

export function ConnectionsIllustration() {
  const nodes = [
    { cx: 15, cy: 30, color: "accent" },
    { cx: 40, cy: 15, color: "primary" },
    { cx: 70, cy: 25, color: "accent" },
    { cx: 30, cy: 55, color: "primary" },
    { cx: 60, cy: 60, color: "accent" },
    { cx: 85, cy: 50, color: "primary" },
    { cx: 50, cy: 85, color: "accent" },
  ];

  return (
    <div className="relative w-full h-32">
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
        {nodes.map((node, i) =>
          nodes.slice(i + 1).map((target, j) => {
            const distance = Math.sqrt(
              Math.pow(target.cx - node.cx, 2) + Math.pow(target.cy - node.cy, 2)
            );
            if (distance < 45) {
              return (
                <motion.line
                  key={`${i}-${j}`}
                  x1={node.cx}
                  y1={node.cy}
                  x2={target.cx}
                  y2={target.cy}
                  stroke="hsl(var(--foreground))"
                  strokeWidth="0.5"
                  strokeOpacity="0.2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 0.4, 0] }}
                  transition={{
                    duration: 3,
                    delay: (i + j) * 0.3,
                    repeat: Infinity,
                  }}
                />
              );
            }
            return null;
          })
        )}
        
        {nodes.map((node, i) => (
          <motion.g key={i}>
            <motion.circle
              cx={node.cx}
              cy={node.cy}
              r="5"
              fill={`hsl(var(--${node.color}))`}
              fillOpacity="0.15"
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 2, delay: i * 0.15, repeat: Infinity }}
            />
            <motion.circle
              cx={node.cx}
              cy={node.cy}
              r="3"
              fill={`hsl(var(--${node.color}))`}
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 1.5, delay: i * 0.1, repeat: Infinity }}
            />
          </motion.g>
        ))}
      </svg>
    </div>
  );
}

export function CollectionsIllustration() {
  const folders = [
    { x: 10, color: "accent", delay: 0 },
    { x: 38, color: "primary", delay: 0.15 },
    { x: 66, color: "accent", delay: 0.3 },
  ];

  const floatingItems = [
    { x: 25, delay: 0, targetFolder: 0 },
    { x: 50, delay: 0.5, targetFolder: 1 },
    { x: 75, delay: 1, targetFolder: 2 },
  ];

  return (
    <div className="relative w-full h-32 overflow-hidden">
      {folders.map((folder, i) => (
        <motion.div
          key={i}
          className="absolute bottom-2 w-[26%] h-12 rounded-lg border"
          style={{
            left: `${folder.x}%`,
            background: `linear-gradient(to top, hsl(var(--${folder.color}) / 0.15), transparent)`,
            borderColor: `hsl(var(--${folder.color}) / 0.3)`,
          }}
          animate={{ y: [0, -2, 0] }}
          transition={{ duration: 2, delay: folder.delay, repeat: Infinity }}
        >
          <div
            className="absolute -top-2 left-0 w-8 h-3 rounded-t-md"
            style={{ background: `hsl(var(--${folder.color}) / 0.3)` }}
          />
        </motion.div>
      ))}
      
      {floatingItems.map((item, i) => (
        <motion.div
          key={i}
          className="absolute w-6 h-4 rounded bg-foreground/20 border border-foreground/10"
          style={{ left: `${item.x}%` }}
          initial={{ top: "-10%", opacity: 0 }}
          animate={{
            top: ["0%", "60%"],
            opacity: [0, 1, 1, 0],
            x: [(item.targetFolder - 1) * 5, 0],
          }}
          transition={{
            duration: 2.5,
            delay: item.delay,
            repeat: Infinity,
            repeatDelay: 1,
          }}
        />
      ))}
    </div>
  );
}

export function SearchIllustration() {
  return (
    <div className="relative w-full h-32 flex items-center justify-center">
      <motion.div
        className="absolute w-20 h-20 rounded-full border border-accent/20"
        animate={{ scale: [1, 2, 2], opacity: [0.5, 0, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      <motion.div
        className="absolute w-20 h-20 rounded-full border border-accent/20"
        animate={{ scale: [1, 2, 2], opacity: [0.5, 0, 0] }}
        transition={{ duration: 2, delay: 0.5, repeat: Infinity }}
      />
      <motion.div
        className="absolute w-20 h-20 rounded-full border border-accent/20"
        animate={{ scale: [1, 2, 2], opacity: [0.5, 0, 0] }}
        transition={{ duration: 2, delay: 1, repeat: Infinity }}
      />
      
      <motion.div
        className="relative z-10 w-10 h-10 rounded-full bg-accent/20 border-2 border-accent/40 flex items-center justify-center"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 1, repeat: Infinity }}
      >
        <motion.div
          className="absolute w-3 h-0.5 bg-accent/60 rounded-full"
          style={{ right: "-8px", bottom: "2px", rotate: "45deg" }}
        />
      </motion.div>
      
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full bg-primary/60"
          style={{
            left: `${30 + i * 20}%`,
            top: `${25 + (i % 2) * 30}%`,
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: [0, 1, 0], scale: [0, 1, 0] }}
          transition={{
            duration: 2,
            delay: 0.8 + i * 0.3,
            repeat: Infinity,
          }}
        />
      ))}
    </div>
  );
}

export function KnowledgeGraphIllustration() {
  const nodes = [
    { cx: 50, cy: 50, r: 10, color: "primary", label: "" },
    { cx: 25, cy: 30, r: 6, color: "accent", label: "" },
    { cx: 75, cy: 25, r: 7, color: "accent", label: "" },
    { cx: 20, cy: 65, r: 5, color: "primary", label: "" },
    { cx: 80, cy: 60, r: 6, color: "accent", label: "" },
    { cx: 45, cy: 80, r: 5, color: "primary", label: "" },
    { cx: 65, cy: 75, r: 4, color: "accent", label: "" },
    { cx: 35, cy: 45, r: 4, color: "accent", label: "" },
    { cx: 65, cy: 40, r: 5, color: "primary", label: "" },
  ];

  const edges = [
    [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6], [0, 7], [0, 8],
    [1, 3], [2, 4], [5, 6], [7, 1], [8, 2], [3, 5], [4, 6],
  ];

  return (
    <div className="relative w-full h-40">
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        
        {edges.map(([from, to], i) => (
          <motion.line
            key={i}
            x1={nodes[from].cx}
            y1={nodes[from].cy}
            x2={nodes[to].cx}
            y2={nodes[to].cy}
            stroke="hsl(var(--foreground))"
            strokeWidth="0.5"
            strokeOpacity="0.15"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: [0, 1] }}
            transition={{
              duration: 2,
              delay: i * 0.1,
              repeat: Infinity,
              repeatType: "reverse",
              repeatDelay: 3,
            }}
          />
        ))}
        
        {edges.map(([from, to], i) => (
          <motion.circle
            key={`particle-${i}`}
            r="1.5"
            fill={`hsl(var(--${nodes[from].color}))`}
            filter="url(#glow)"
            initial={{ opacity: 0 }}
            animate={{
              cx: [nodes[from].cx, nodes[to].cx],
              cy: [nodes[from].cy, nodes[to].cy],
              opacity: [0, 1, 1, 0],
            }}
            transition={{
              duration: 1.5,
              delay: 2 + i * 0.2,
              repeat: Infinity,
              repeatDelay: 4,
            }}
          />
        ))}
        
        {nodes.map((node, i) => (
          <motion.g key={i}>
            <motion.circle
              cx={node.cx}
              cy={node.cy}
              r={node.r * 1.5}
              fill={`hsl(var(--${node.color}))`}
              fillOpacity="0.1"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 3, delay: i * 0.2, repeat: Infinity }}
            />
            <motion.circle
              cx={node.cx}
              cy={node.cy}
              r={node.r}
              fill={`hsl(var(--${node.color}))`}
              fillOpacity="0.25"
              stroke={`hsl(var(--${node.color}))`}
              strokeWidth="1"
              strokeOpacity="0.5"
              animate={{ 
                scale: i === 0 ? [1, 1.1, 1] : 1,
                fillOpacity: [0.2, 0.35, 0.2] 
              }}
              transition={{ duration: 2, delay: i * 0.1, repeat: Infinity }}
            />
          </motion.g>
        ))}
      </svg>
    </div>
  );
}
