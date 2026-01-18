import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowRight, Sparkles, Network, Brain, Zap, Layers, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Midjourney Prompt for Hero Image:
 * 
 * "Abstract retro artistic landscape, dreamy surreal digital painting,
 * warm earth tones with deep teals and burnt oranges, floating geometric shapes,
 * soft gradients, organic flowing forms, vintage 1970s poster aesthetic,
 * grain texture overlay, muted sage green accents, ethereal atmosphere,
 * painterly brushstrokes, minimalist composition, high resolution, 16:9 aspect ratio
 * --ar 16:9 --v 6 --style raw --s 250"
 */

const floatAnimation = {
  y: [0, -10, 0],
  transition: {
    duration: 3,
    repeat: Infinity,
    ease: "easeInOut",
  },
};

const floatAnimationSlow = {
  y: [0, -15, 0],
  transition: {
    duration: 4,
    repeat: Infinity,
    ease: "easeInOut",
  },
};

const floatAnimationFast = {
  y: [0, -8, 0],
  transition: {
    duration: 2.5,
    repeat: Infinity,
    ease: "easeInOut",
  },
};

function FloatingShape({ 
  className, 
  delay = 0 
}: { 
  className?: string; 
  delay?: number;
}) {
  return (
    <motion.div
      className={className}
      animate={{ y: [0, -12, 0], rotate: [0, 5, 0] }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut",
        delay,
      }}
    />
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section - Full Page with Retro Art */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background Image with Dark Wash */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1920&q=80')`,
          }}
        />
        {/* Dark gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        
        {/* Floating decorative shapes */}
        <FloatingShape 
          className="absolute top-20 right-20 w-24 h-24 rounded-full bg-accent/20 blur-2xl"
          delay={0}
        />
        <FloatingShape 
          className="absolute bottom-40 right-40 w-32 h-32 rounded-full bg-primary/10 blur-3xl"
          delay={1}
        />
        <FloatingShape 
          className="absolute top-1/3 right-1/4 w-16 h-16 rounded-full bg-accent/30 blur-xl"
          delay={0.5}
        />

        {/* Content */}
        <div className="relative z-10 container mx-auto px-8 md:px-16 lg:px-24">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="max-w-2xl"
          >
            {/* Small badge */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-8"
            >
              <Sparkles className="w-4 h-4 text-accent" />
              <span className="text-sm text-white/90">Your second brain, powered by AI</span>
            </motion.div>

            {/* Main headline - left aligned */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="font-serif text-6xl md:text-7xl lg:text-8xl text-white leading-[0.95] mb-6"
              data-testid="text-hero-headline"
            >
              Remember
              <br />
              everything.
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-xl md:text-2xl text-white/70 mb-10 max-w-lg leading-relaxed"
              data-testid="text-hero-subheadline"
            >
              Eden captures, connects, and resurfaces your saved content. 
              No more tab graveyard. No more forgotten bookmarks.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="flex flex-col sm:flex-row gap-4"
              data-testid="container-hero-ctas"
            >
              <Link href="/" data-testid="link-get-started">
                <Button 
                  size="lg" 
                  className="h-14 px-8 text-lg rounded-xl bg-white text-black hover:bg-white/90 gap-2"
                  data-testid="button-get-started"
                >
                  Get Started
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Button 
                variant="outline" 
                size="lg" 
                className="h-14 px-8 text-lg rounded-xl border-white/30 text-white hover:bg-white/10 backdrop-blur-sm"
                data-testid="button-learn-more"
              >
                Learn More
              </Button>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-2"
          >
            <motion.div className="w-1 h-2 bg-white/50 rounded-full" />
          </motion.div>
        </motion.div>
      </section>

      {/* Bento Grid Features Section */}
      <section className="py-24 px-8 md:px-16 lg:px-24">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-16"
        >
          <h2 className="font-serif text-4xl md:text-5xl mb-4" data-testid="text-features-headline">How it works</h2>
          <p className="text-muted-foreground text-xl max-w-xl" data-testid="text-features-subheadline">
            Save anything. Eden handles the rest.
          </p>
        </motion.div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-[200px] md:auto-rows-[240px]" data-testid="container-bento-grid">
          {/* Large card - Capture */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative col-span-1 md:col-span-2 row-span-2 rounded-3xl bg-gradient-to-br from-accent/20 to-accent/5 border border-border/50 p-8 overflow-hidden hover-elevate"
          >
            <motion.div
              animate={floatAnimation}
              className="absolute -right-8 -bottom-8 w-48 h-48 rounded-full bg-accent/20 blur-3xl"
            />
            <motion.div
              animate={floatAnimationSlow}
              className="absolute right-16 top-16 w-20 h-20 rounded-2xl bg-accent/30 rotate-12"
            />
            <motion.div
              animate={floatAnimationFast}
              className="absolute right-32 bottom-24 w-12 h-12 rounded-xl bg-accent/20 -rotate-6"
            />
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-accent/20 flex items-center justify-center mb-6">
                <Zap className="w-7 h-7 text-accent" />
              </div>
              <h3 className="font-serif text-3xl mb-3">Capture Anything</h3>
              <p className="text-muted-foreground text-lg max-w-sm">
                Save URLs with one click, batch import bookmarks, or upload files. 
                Eden accepts it all.
              </p>
            </div>
          </motion.div>

          {/* AI Analysis */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative col-span-1 row-span-1 rounded-3xl bg-card border border-border/50 p-6 overflow-hidden hover-elevate"
          >
            <motion.div
              animate={floatAnimationSlow}
              className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-primary/10 blur-2xl"
            />
            <motion.div
              animate={floatAnimation}
              className="absolute right-8 bottom-4 w-8 h-8 rounded-lg bg-primary/20 rotate-45"
            />
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Brain className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-serif text-xl mb-2">AI Analysis</h3>
              <p className="text-muted-foreground text-sm">
                Automatic summaries, tags, and concept extraction
              </p>
            </div>
          </motion.div>

          {/* Connections */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative col-span-1 row-span-1 rounded-3xl bg-card border border-border/50 p-6 overflow-hidden hover-elevate"
          >
            <motion.div
              animate={floatAnimationFast}
              className="absolute -left-4 -bottom-4 w-20 h-20 rounded-full bg-accent/15 blur-xl"
            />
            <motion.div
              animate={floatAnimationSlow}
              className="absolute right-4 top-12 w-6 h-6 rounded-full bg-accent/30"
            />
            <motion.div
              animate={floatAnimation}
              className="absolute right-12 top-8 w-4 h-4 rounded-full bg-accent/20"
            />
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                <Network className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-serif text-xl mb-2">Smart Connections</h3>
              <p className="text-muted-foreground text-sm">
                Discover hidden links between your saved content
              </p>
            </div>
          </motion.div>

          {/* Collections */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="relative col-span-1 row-span-1 rounded-3xl bg-card border border-border/50 p-6 overflow-hidden hover-elevate"
          >
            <motion.div
              animate={floatAnimation}
              className="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-primary/10 blur-2xl"
            />
            <motion.div
              animate={floatAnimationFast}
              className="absolute left-1/2 bottom-6 w-10 h-10 rounded-xl bg-primary/15 -rotate-12"
            />
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Layers className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-serif text-xl mb-2">Auto Collections</h3>
              <p className="text-muted-foreground text-sm">
                Content organizes itself into smart collections
              </p>
            </div>
          </motion.div>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="relative col-span-1 row-span-1 rounded-3xl bg-card border border-border/50 p-6 overflow-hidden hover-elevate"
          >
            <motion.div
              animate={floatAnimationSlow}
              className="absolute -left-8 top-1/2 w-24 h-24 rounded-full bg-accent/10 blur-xl"
            />
            <motion.div
              animate={floatAnimationFast}
              className="absolute right-6 bottom-8 w-8 h-8 rounded-lg bg-accent/25 rotate-12"
            />
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                <Search className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-serif text-xl mb-2">Semantic Search</h3>
              <p className="text-muted-foreground text-sm">
                Find anything by meaning, not just keywords
              </p>
            </div>
          </motion.div>

          {/* Large card - Knowledge Graph */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="relative col-span-1 md:col-span-2 row-span-1 rounded-3xl bg-gradient-to-br from-primary/10 to-primary/5 border border-border/50 p-8 overflow-hidden hover-elevate"
          >
            {/* Animated graph nodes */}
            <motion.div
              animate={floatAnimation}
              className="absolute right-20 top-8 w-4 h-4 rounded-full bg-primary/40"
            />
            <motion.div
              animate={floatAnimationSlow}
              className="absolute right-32 top-16 w-3 h-3 rounded-full bg-primary/30"
            />
            <motion.div
              animate={floatAnimationFast}
              className="absolute right-24 bottom-12 w-5 h-5 rounded-full bg-primary/35"
            />
            <motion.div
              animate={floatAnimation}
              className="absolute right-40 bottom-8 w-3 h-3 rounded-full bg-primary/25"
            />
            {/* Connection lines (decorative) */}
            <div className="absolute right-20 top-10 w-12 h-[1px] bg-primary/20 rotate-45" />
            <div className="absolute right-28 top-18 w-8 h-[1px] bg-primary/15 -rotate-12" />
            
            <div className="relative z-10">
              <h3 className="font-serif text-2xl mb-2">Knowledge Graph</h3>
              <p className="text-muted-foreground max-w-md">
                Visualize how your ideas connect. Watch clusters emerge as you save more content.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Oversized Wordmark Footer */}
      <footer className="py-24 px-8 md:px-16 lg:px-24 border-t border-border/30">
        <div className="flex flex-col items-start gap-12">
          {/* Oversized eden wordmark */}
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="font-serif text-[12rem] md:text-[16rem] lg:text-[20rem] leading-[0.8] -ml-4 text-foreground/10 select-none"
            data-testid="text-footer-wordmark"
          >
            eden
          </motion.h2>
          
          {/* Footer content */}
          <div className="w-full flex flex-col md:flex-row justify-between items-start md:items-end gap-8 -mt-16 md:-mt-24">
            <div className="relative z-10">
              <p className="text-muted-foreground mb-2">Your second brain, powered by AI.</p>
              <p className="text-muted-foreground/60 text-sm">&copy; 2026 Eden. All rights reserved.</p>
            </div>
            <div className="relative z-10 flex gap-8">
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-privacy">Privacy</a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-terms">Terms</a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-twitter">Twitter</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
