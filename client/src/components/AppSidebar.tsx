import { useLocation, Link } from "wouter";
import {
  Home,
  Search,
  FolderOpen,
  Network,
  MessageCircle,
  BookOpen,
  Clock,
  Star,
  Archive,
  Plus,
  Settings,
  Upload,
  FileUp,
  Bookmark,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useEden } from "@/lib/store";

const mainNavItems = [
  { title: "Home", url: "/", icon: Home },
  { title: "Search", url: "/search", icon: Search },
  { title: "Collections", url: "/collections", icon: FolderOpen },
  { title: "Graph", url: "/graph", icon: Network },
  { title: "Bookmarklet", url: "/bookmarklet", icon: Bookmark },
];

const filterItems = [
  { title: "Read Later", icon: BookOpen, intent: "read_later" },
  { title: "Reference", icon: Archive, intent: "reference" },
  { title: "Inspiration", icon: Star, intent: "inspiration" },
  { title: "Tutorials", icon: Clock, intent: "tutorial" },
];

export function AppSidebar() {
  const [location] = useLocation();
  const { items, setIsCapturing, setIsBatchImporting, setIsFileUploading, setIsChatOpen, selectedIntent, setSelectedIntent } = useEden();

  const unreadCount = items.filter((item) => !item.isRead).length;

  return (
    <Sidebar className="border-r border-sidebar-border/50">
      <SidebarHeader className="p-4 pb-2">
        <Link href="/">
          <h1 className="font-serif text-2xl tracking-tight cursor-pointer hover:opacity-80 transition-opacity">
            eden
          </h1>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <div className="p-2 space-y-2">
          <Button
            onClick={() => setIsCapturing(true)}
            className="w-full justify-center gap-2 h-10 rounded-xl bg-accent hover:bg-accent/90"
            data-testid="button-capture"
          >
            <Plus className="w-4 h-4" />
            Capture
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsBatchImporting(true)}
              className="flex-1 justify-center gap-2 h-9 rounded-xl"
              data-testid="button-batch-import"
            >
              <Upload className="w-4 h-4" />
              URLs
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsFileUploading(true)}
              className="flex-1 justify-center gap-2 h-9 rounded-xl"
              data-testid="button-file-upload"
            >
              <FileUp className="w-4 h-4" />
              Files
            </Button>
          </div>
        </div>

        <SidebarGroup className="mt-4">
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url}
                    className="rounded-xl"
                  >
                    <Link href={item.url} data-testid={`link-nav-${item.title.toLowerCase()}`}>
                      <item.icon className="w-4 h-4" />
                      <span className="font-medium">{item.title}</span>
                      {item.title === "Home" && unreadCount > 0 && (
                        <span className="ml-auto text-xs text-muted-foreground">
                          {unreadCount}
                        </span>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-6">
          <p className="px-3 text-[10px] font-medium text-muted-foreground uppercase tracking-widest mb-2">
            Intent
          </p>
          <SidebarGroupContent>
            <SidebarMenu>
              {filterItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    isActive={selectedIntent === item.intent}
                    onClick={() =>
                      setSelectedIntent(
                        selectedIntent === item.intent ? null : item.intent
                      )
                    }
                    className="rounded-xl"
                    data-testid={`button-filter-${item.intent}`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3 space-y-1">
        <SidebarMenuButton
          onClick={() => setIsChatOpen(true)}
          className="rounded-xl justify-start"
          data-testid="button-open-chat"
        >
          <MessageCircle className="w-4 h-4" />
          <span>Ask Eden</span>
        </SidebarMenuButton>
        <SidebarMenuButton asChild className="rounded-xl">
          <Link href="/settings" data-testid="link-settings">
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </Link>
        </SidebarMenuButton>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
