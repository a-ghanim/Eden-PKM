import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowRight, Sparkles, Network, Brain, Zap, Layers, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImage from "@assets/blade-lustre-RLUrtznJ4EU-unsplash_1768744151563.jpg";
import {
  CaptureIllustration,
  AIAnalysisIllustration,
  ConnectionsIllustration,
  CollectionsIllustration,
  SearchIllustration,
  KnowledgeGraphIllustration,
} from "@/components/bento-illustrations";

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

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section - Full Page with Retro Art */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background Image with Dark Wash */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${heroImage})`,
          }}
        />
        {/* Dark gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />

        {/* Content */}
        <div className="relative z-10 w-full px-8 md:px-16 lg:px-24">
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
              <span className="italic animated-gradient-text">everything.</span>
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
                  className="h-14 px-8 text-lg rounded-full gradient-fill-button text-black font-medium gap-2"
                  data-testid="button-get-started"
                >
                  Get Started
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Button 
                variant="ghost" 
                size="lg" 
                className="h-14 px-8 text-lg rounded-full gradient-border-button text-white border-0"
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

        {/* Bento Grid - Large showcase cards with external descriptions */}
        <div className="space-y-16" data-testid="container-bento-grid">
          {/* Row 1: Capture (large) + AI Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Capture Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex flex-col gap-6"
              data-testid="card-capture"
            >
              <div className="relative aspect-[4/3] rounded-3xl bg-gradient-to-br from-accent/20 to-accent/5 border border-border/50 p-8 hover-elevate overflow-hidden flex items-center justify-center">
                <CaptureIllustration />
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center shrink-0">
                  <Zap className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-serif text-2xl mb-2">Capture Anything</h3>
                  <p className="text-muted-foreground">
                    Save URLs with one click, batch import bookmarks, or upload files. Eden accepts it all.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* AI Analysis Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="flex flex-col gap-6"
              data-testid="card-ai-analysis"
            >
              <div className="relative aspect-[4/3] rounded-3xl bg-gradient-to-br from-primary/15 to-primary/5 border border-border/50 p-8 hover-elevate overflow-hidden flex items-center justify-center">
                <AIAnalysisIllustration />
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Brain className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-serif text-2xl mb-2">AI Analysis</h3>
                  <p className="text-muted-foreground">
                    Automatic summaries, smart tags, and concept extraction. Your content, understood.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Row 2: Connections + Collections + Search (3 columns) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Connections Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col gap-5"
              data-testid="card-connections"
            >
              <div className="relative aspect-square rounded-3xl bg-gradient-to-br from-accent/15 to-accent/5 border border-border/50 p-6 hover-elevate overflow-hidden flex items-center justify-center">
                <ConnectionsIllustration />
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                  <Network className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-serif text-xl mb-1">Smart Connections</h3>
                  <p className="text-muted-foreground text-sm">
                    Discover hidden links between your saved content automatically.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Collections Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col gap-5"
              data-testid="card-collections"
            >
              <div className="relative aspect-square rounded-3xl bg-gradient-to-br from-primary/15 to-primary/5 border border-border/50 p-6 hover-elevate overflow-hidden flex items-center justify-center">
                <CollectionsIllustration />
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Layers className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-serif text-xl mb-1">Auto Collections</h3>
                  <p className="text-muted-foreground text-sm">
                    Content organizes itself into smart, themed collections.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Search Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col gap-5"
              data-testid="card-search"
            >
              <div className="relative aspect-square rounded-3xl bg-gradient-to-br from-accent/15 to-accent/5 border border-border/50 p-6 hover-elevate overflow-hidden flex items-center justify-center">
                <SearchIllustration />
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                  <Search className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-serif text-xl mb-1">Semantic Search</h3>
                  <p className="text-muted-foreground text-sm">
                    Find anything by meaning, not just keywords.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Row 3: Knowledge Graph (full width showcase) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-col lg:flex-row gap-8 items-center"
            data-testid="card-knowledge-graph"
          >
            <div className="relative flex-1 w-full aspect-[16/9] lg:aspect-[2/1] rounded-3xl bg-gradient-to-br from-primary/10 to-accent/5 border border-border/50 p-8 hover-elevate overflow-hidden flex items-center justify-center">
              <KnowledgeGraphIllustration />
            </div>
            <div className="lg:w-80 shrink-0">
              <h3 className="font-serif text-3xl mb-3">Knowledge Graph</h3>
              <p className="text-muted-foreground text-lg mb-4">
                Visualize how your ideas connect. Watch clusters emerge as you save more content.
              </p>
              <p className="text-muted-foreground/70 text-sm">
                The more you save, the smarter it gets. Eden maps relationships between concepts, people, and ideas across everything you capture.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Oversized Wordmark Footer */}
      <footer className="py-24 px-8 md:px-16 lg:px-24 border-t border-border/30">
        <div className="flex flex-col gap-8">
          {/* Footer content - above the wordmark */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <p className="text-muted-foreground mb-1">Your second brain, powered by AI.</p>
              <p className="text-muted-foreground/60 text-sm">&copy; 2026 Eden. All rights reserved.</p>
            </div>
            <div className="flex gap-8">
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-privacy">Privacy</a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-terms">Terms</a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-twitter">Twitter</a>
            </div>
          </div>
          
          {/* Oversized eden wordmark */}
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="font-serif text-[8rem] sm:text-[12rem] md:text-[16rem] lg:text-[20rem] leading-[0.8] -ml-2 md:-ml-4 text-foreground/10 select-none"
            data-testid="text-footer-wordmark"
          >
            eden
          </motion.h2>
        </div>
      </footer>
    </div>
  );
}
