import { motion } from "framer-motion";

export function CaptureIllustration() {
  const cards = [
    { x: 10, y: 5, rotation: -12, delay: 0, colorVar: "--accent" },
    { x: 55, y: 15, rotation: 8, delay: 0.3, colorVar: "--primary" },
    { x: 25, y: 35, rotation: -5, delay: 0.6, colorVar: "--accent" },
    { x: 65, y: 50, rotation: 10, delay: 0.9, colorVar: "--primary" },
  ];

  return (
    <div className="relative w-full h-full min-h-[200px] overflow-hidden">
      {cards.map((card, i) => (
        <motion.div
          key={i}
          className="absolute w-32 h-20 rounded-xl border border-border/50 backdrop-blur-sm"
          style={{
            left: `${card.x}%`,
            top: `${card.y}%`,
            background: `linear-gradient(135deg, hsl(var(${card.colorVar}) / 0.25), hsl(var(${card.colorVar}) / 0.08))`,
          }}
          initial={{ opacity: 0, y: 60, rotate: card.rotation }}
          animate={{ 
            opacity: [0, 1, 1, 0],
            y: [60, 0, -15, -60],
            rotate: card.rotation,
          }}
          transition={{
            duration: 4,
            delay: card.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <div className="p-3">
            <div className="w-full h-2.5 rounded bg-foreground/15 mb-2" />
            <div className="w-3/4 h-2.5 rounded bg-foreground/10" />
          </div>
        </motion.div>
      ))}
      
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 w-20 h-20 rounded-2xl bg-accent/25 border border-accent/40 flex items-center justify-center"
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 2.5, repeat: Infinity }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="w-10 h-10 rounded-lg border-2 border-dashed border-accent/60"
        />
      </motion.div>
    </div>
  );
}

export function AIAnalysisIllustration() {
  const neurons = [
    { cx: 20, cy: 15, r: 8 },
    { cx: 80, cy: 20, r: 7 },
    { cx: 50, cy: 50, r: 12 },
    { cx: 15, cy: 75, r: 7 },
    { cx: 85, cy: 80, r: 8 },
    { cx: 35, cy: 30, r: 5 },
    { cx: 65, cy: 70, r: 6 },
  ];
  
  const connections = [
    { from: 0, to: 2 },
    { from: 1, to: 2 },
    { from: 2, to: 3 },
    { from: 2, to: 4 },
    { from: 0, to: 3 },
    { from: 1, to: 4 },
    { from: 5, to: 2 },
    { from: 6, to: 2 },
    { from: 0, to: 5 },
    { from: 4, to: 6 },
  ];

  return (
    <div className="relative w-full h-full min-h-[200px]">
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
    { cx: 12, cy: 25, color: "accent" },
    { cx: 35, cy: 12, color: "primary" },
    { cx: 70, cy: 18, color: "accent" },
    { cx: 88, cy: 35, color: "primary" },
    { cx: 25, cy: 50, color: "accent" },
    { cx: 55, cy: 45, color: "primary" },
    { cx: 80, cy: 60, color: "accent" },
    { cx: 15, cy: 78, color: "primary" },
    { cx: 45, cy: 75, color: "accent" },
    { cx: 75, cy: 85, color: "primary" },
  ];

  return (
    <div className="relative w-full h-full min-h-[180px]">
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
    { x: 8, color: "accent", delay: 0 },
    { x: 36, color: "primary", delay: 0.2 },
    { x: 64, color: "accent", delay: 0.4 },
  ];

  const floatingItems = [
    { x: 20, delay: 0, targetFolder: 0 },
    { x: 48, delay: 0.6, targetFolder: 1 },
    { x: 76, delay: 1.2, targetFolder: 2 },
    { x: 35, delay: 1.8, targetFolder: 1 },
  ];

  return (
    <div className="relative w-full h-full min-h-[180px] overflow-hidden">
      {folders.map((folder, i) => (
        <motion.div
          key={i}
          className="absolute bottom-4 w-[28%] h-16 rounded-xl border"
          style={{
            left: `${folder.x}%`,
            background: `linear-gradient(to top, hsl(var(--${folder.color}) / 0.2), transparent)`,
            borderColor: `hsl(var(--${folder.color}) / 0.35)`,
          }}
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 2.5, delay: folder.delay, repeat: Infinity }}
        >
          <div
            className="absolute -top-3 left-0 w-10 h-4 rounded-t-lg"
            style={{ background: `hsl(var(--${folder.color}) / 0.35)` }}
          />
        </motion.div>
      ))}
      
      {floatingItems.map((item, i) => (
        <motion.div
          key={i}
          className="absolute w-8 h-6 rounded-lg bg-foreground/20 border border-foreground/15"
          style={{ left: `${item.x}%` }}
          initial={{ top: "-10%", opacity: 0 }}
          animate={{
            top: ["0%", "55%"],
            opacity: [0, 1, 1, 0],
            x: [(item.targetFolder - 1) * 8, 0],
          }}
          transition={{
            duration: 3,
            delay: item.delay,
            repeat: Infinity,
            repeatDelay: 0.5,
          }}
        />
      ))}
    </div>
  );
}

export function SearchIllustration() {
  return (
    <div className="relative w-full h-full min-h-[180px] flex items-center justify-center">
      <motion.div
        className="absolute w-28 h-28 rounded-full border-2 border-accent/25"
        animate={{ scale: [1, 2.5, 2.5], opacity: [0.6, 0, 0] }}
        transition={{ duration: 2.5, repeat: Infinity }}
      />
      <motion.div
        className="absolute w-28 h-28 rounded-full border-2 border-accent/25"
        animate={{ scale: [1, 2.5, 2.5], opacity: [0.6, 0, 0] }}
        transition={{ duration: 2.5, delay: 0.6, repeat: Infinity }}
      />
      <motion.div
        className="absolute w-28 h-28 rounded-full border-2 border-accent/25"
        animate={{ scale: [1, 2.5, 2.5], opacity: [0.6, 0, 0] }}
        transition={{ duration: 2.5, delay: 1.2, repeat: Infinity }}
      />
      
      <motion.div
        className="relative z-10 w-14 h-14 rounded-full bg-accent/25 border-2 border-accent/50 flex items-center justify-center"
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <motion.div
          className="absolute w-4 h-1 bg-accent/70 rounded-full"
          style={{ right: "-12px", bottom: "4px", rotate: "45deg" }}
        />
      </motion.div>
      
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.div
          key={i}
          className="absolute w-3 h-3 rounded-full bg-primary/70"
          style={{
            left: `${20 + i * 15}%`,
            top: `${20 + (i % 3) * 25}%`,
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: [0, 1, 0], scale: [0, 1.2, 0] }}
          transition={{
            duration: 2.5,
            delay: 0.6 + i * 0.25,
            repeat: Infinity,
          }}
        />
      ))}
    </div>
  );
}

export function KnowledgeGraphIllustration() {
  const nodes = [
    { cx: 50, cy: 50, r: 14, color: "primary" },
    { cx: 18, cy: 25, r: 8, color: "accent" },
    { cx: 82, cy: 20, r: 9, color: "accent" },
    { cx: 12, cy: 60, r: 7, color: "primary" },
    { cx: 88, cy: 55, r: 8, color: "accent" },
    { cx: 35, cy: 85, r: 7, color: "primary" },
    { cx: 70, cy: 82, r: 6, color: "accent" },
    { cx: 30, cy: 40, r: 6, color: "accent" },
    { cx: 70, cy: 35, r: 7, color: "primary" },
    { cx: 50, cy: 18, r: 5, color: "accent" },
    { cx: 25, cy: 70, r: 5, color: "primary" },
    { cx: 75, cy: 70, r: 5, color: "accent" },
  ];

  const edges = [
    [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6], [0, 7], [0, 8], [0, 9],
    [1, 3], [2, 4], [5, 6], [7, 1], [8, 2], [3, 5], [4, 6], [9, 1], [9, 2],
    [10, 3], [10, 5], [11, 4], [11, 6], [7, 10], [8, 11],
  ];

  return (
    <div className="relative w-full h-full min-h-[200px]">
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
