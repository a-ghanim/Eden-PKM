import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bookmark, Check, Copy, GripVertical, ExternalLink, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";

export default function BookmarkletPage() {
  const [copied, setCopied] = useState(false);
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  
  const { data: tokenData, isLoading: tokenLoading, error: tokenError } = useQuery<{ token: string }>({
    queryKey: ["/api/auth/token"],
    enabled: isAuthenticated,
  });
  
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const token = tokenData?.token || "";
  
  const bookmarkletCode = token 
    ? `javascript:(function(){var d=document,s=d.createElement('script'),c='_eden_'+Date.now();window[c]=function(r){delete window[c];s.remove();var o=d.createElement('div');o.id='eden-toast';o.style.cssText='position:fixed;top:20px;right:20px;z-index:999999;padding:16px 20px;border-radius:12px;font-family:system-ui,sans-serif;font-size:14px;box-shadow:0 4px 20px rgba(0,0,0,0.3);transition:all 0.3s ease;'+(r.success?'background:#1a2e1a;color:#86efac;border:1px solid #22c55e40;':'background:#2e1a1a;color:#fca5a5;border:1px solid #ef444440;');o.innerHTML=r.success?'<strong>Saved to Eden</strong><br><span style="opacity:0.8">'+r.item.title.slice(0,50)+'</span>':'<strong>Save failed</strong><br><span style="opacity:0.8">'+(r.error||'Unknown error')+'</span>';d.body.appendChild(o);setTimeout(function(){o.style.opacity='0';setTimeout(function(){o.remove()},300)},3000)};s.src='${origin}/api/bookmarklet/save?token=${token}&callback='+c+'&url='+encodeURIComponent(location.href)+'&title='+encodeURIComponent(d.title);d.body.appendChild(s)})();`
    : "";

  const handleCopy = async () => {
    if (!bookmarkletCode) return;
    try {
      await navigator.clipboard.writeText(bookmarkletCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const isLoading = authLoading || tokenLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background p-6 md:p-10">
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-destructive/20 border border-destructive/30">
              <AlertCircle className="w-8 h-8 text-destructive" />
            </div>
            <h1 className="font-serif text-4xl">Sign In Required</h1>
            <p className="text-muted-foreground text-lg">
              You need to be signed in to use the bookmarklet
            </p>
            <a href="/api/login" className="inline-block">
              <Button data-testid="button-sign-in">Sign In</Button>
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (tokenError) {
    return (
      <div className="min-h-screen bg-background p-6 md:p-10">
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-destructive/20 border border-destructive/30">
              <AlertCircle className="w-8 h-8 text-destructive" />
            </div>
            <h1 className="font-serif text-4xl">Error Loading Token</h1>
            <p className="text-muted-foreground text-lg">
              Could not load your personal bookmarklet. Please try again.
            </p>
            <a href="/" className="inline-block">
              <Button variant="outline" data-testid="button-back-home">Back to Eden</Button>
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 md:p-10">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent/20 border border-accent/30">
            <Bookmark className="w-8 h-8 text-accent" />
          </div>
          <h1 className="font-serif text-4xl">Save to Eden</h1>
          <p className="text-muted-foreground text-lg">
            One-click saving from any webpage
          </p>
        </div>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="font-serif text-xl">Your Personal Bookmarklet</CardTitle>
            <CardDescription>
              This bookmarklet is unique to your account. Items you save will sync to your library.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-center p-8 bg-muted/30 rounded-xl border-2 border-dashed border-border/50">
              <a
                href={bookmarkletCode}
                onClick={(e) => e.preventDefault()}
                draggable="true"
                className="inline-flex items-center gap-2 px-5 py-3 bg-accent text-accent-foreground rounded-xl font-medium shadow-lg hover:bg-accent/90 transition-all cursor-grab active:cursor-grabbing"
                title="Drag me to your bookmarks bar!"
                data-testid="link-bookmarklet-drag"
              >
                <GripVertical className="w-4 h-4 opacity-60" />
                <Bookmark className="w-4 h-4" />
                Save to Eden
              </a>
            </div>

            <div className="space-y-3">
              <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
                How to install
              </h3>
              <ol className="space-y-3 text-sm">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/20 text-accent flex items-center justify-center text-xs font-medium">1</span>
                  <span>Make sure your bookmarks bar is visible (Ctrl+Shift+B on Chrome/Firefox)</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/20 text-accent flex items-center justify-center text-xs font-medium">2</span>
                  <span>Drag the green "Save to Eden" button above to your bookmarks bar</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/20 text-accent flex items-center justify-center text-xs font-medium">3</span>
                  <span>When on any page you want to save, click the bookmark!</span>
                </li>
              </ol>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="font-serif text-xl">Alternative: Copy the Code</CardTitle>
            <CardDescription>
              If dragging doesn't work, you can manually create a bookmark
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <pre className="p-4 bg-muted/50 rounded-xl text-xs overflow-x-auto max-h-32 font-mono text-muted-foreground">
                {bookmarkletCode}
              </pre>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCopy}
                className="absolute top-2 right-2"
                data-testid="button-copy-bookmarklet"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 mr-1" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 mr-1" />
                    Copy
                  </>
                )}
              </Button>
            </div>
            <ol className="space-y-2 text-sm text-muted-foreground">
              <li>1. Copy the code above</li>
              <li>2. Create a new bookmark in your browser</li>
              <li>3. Name it "Save to Eden"</li>
              <li>4. Paste the code as the URL</li>
            </ol>
          </CardContent>
        </Card>

        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-medium text-sm">Keep your bookmarklet private</p>
                <p className="text-sm text-muted-foreground">
                  Your bookmarklet contains a personal token. Don't share it with others.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <a
            href="/"
            className="inline-flex items-center gap-2 text-accent hover:underline"
            data-testid="link-back-home"
          >
            <ExternalLink className="w-4 h-4" />
            Back to Eden
          </a>
        </div>
      </div>
    </div>
  );
}
