import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { EdenProvider } from "@/components/EdenProvider";
import { AppSidebar } from "@/components/AppSidebar";
import { CaptureModal } from "@/components/CaptureModal";
import { BatchImportModal } from "@/components/BatchImportModal";
import { FileUploadModal } from "@/components/FileUploadModal";
import { ChatInterface } from "@/components/ChatInterface";
import { ReaderMode } from "@/components/ReaderMode";
import { useEden } from "@/lib/store";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home";
import SearchPage from "@/pages/search";
import CollectionsPage from "@/pages/collections";
import GraphPage from "@/pages/graph";
import SettingsPage from "@/pages/settings";
import BookmarkletPage from "@/pages/bookmarklet";
import LandingPage from "@/pages/landing";

function AppRouter() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/search" component={SearchPage} />
      <Route path="/collections" component={CollectionsPage} />
      <Route path="/graph" component={GraphPage} />
      <Route path="/settings" component={SettingsPage} />
      <Route path="/bookmarklet" component={BookmarkletPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppLayout() {
  const { isBatchImporting, setIsBatchImporting, isFileUploading, setIsFileUploading } = useEden();
  const sidebarStyle = {
    "--sidebar-width": "14rem",
    "--sidebar-width-icon": "3rem",
  } as React.CSSProperties;

  return (
    <SidebarProvider style={sidebarStyle}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <SidebarInset className="flex flex-col flex-1 bg-background">
          <header className="sticky top-0 z-10 flex items-center justify-between gap-4 px-4 py-2 border-b border-border/30 bg-background/80 backdrop-blur-xl">
            <SidebarTrigger data-testid="button-sidebar-toggle" className="text-muted-foreground" />
            <ThemeToggle />
          </header>
          <main className="flex-1 overflow-auto">
            <AppRouter />
          </main>
        </SidebarInset>
      </div>
      <CaptureModal />
      <BatchImportModal open={isBatchImporting} onOpenChange={setIsBatchImporting} />
      <FileUploadModal open={isFileUploading} onOpenChange={setIsFileUploading} />
      <ChatInterface />
      <ReaderMode />
    </SidebarProvider>
  );
}

function MainRouter() {
  return (
    <Switch>
      <Route path="/landing" component={LandingPage} />
      <Route>
        <AppLayout />
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark">
        <EdenProvider>
          <TooltipProvider>
            <MainRouter />
            <Toaster />
          </TooltipProvider>
        </EdenProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
