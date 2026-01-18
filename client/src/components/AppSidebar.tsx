import { useLocation, Link } from "wouter";
import {
  Home,
  Search,
  FolderOpen,
  Network,
  MessageCircle,
  Sparkles,
  BookOpen,
  Clock,
  Star,
  Archive,
  Plus,
  Settings,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useEden } from "@/lib/store";
import { Badge } from "@/components/ui/badge";

const mainNavItems = [
  { title: "All Saves", url: "/", icon: Home },
  { title: "Search", url: "/search", icon: Search },
  { title: "Collections", url: "/collections", icon: FolderOpen },
  { title: "Knowledge Graph", url: "/graph", icon: Network },
];

const filterItems = [
  { title: "Read Later", icon: BookOpen, intent: "read_later" },
  { title: "Reference", icon: Archive, intent: "reference" },
  { title: "Inspiration", icon: Star, intent: "inspiration" },
  { title: "Tutorials", icon: Clock, intent: "tutorial" },
];

export function AppSidebar() {
  const [location] = useLocation();
  const { items, setIsCapturing, setIsChatOpen, selectedIntent, setSelectedIntent } = useEden();
  
  const unreadCount = items.filter((item) => !item.isRead).length;

  return (
    <Sidebar className="border-r border-sidebar-border">
      <SidebarHeader className="p-4">
        <Link href="/">
          <div className="flex items-center gap-2 cursor-pointer">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-serif text-xl font-medium tracking-tight">Eden</span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <div className="px-3 py-2">
          <Button
            onClick={() => setIsCapturing(true)}
            className="w-full justify-start gap-2"
            data-testid="button-capture"
          >
            <Plus className="w-4 h-4" />
            Capture URL
          </Button>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Navigate
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url}
                  >
                    <Link href={item.url} data-testid={`link-nav-${item.title.toLowerCase().replace(/\s/g, "-")}`}>
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                      {item.title === "All Saves" && unreadCount > 0 && (
                        <Badge variant="secondary" className="ml-auto text-2xs">
                          {unreadCount}
                        </Badge>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Filter by Intent
          </SidebarGroupLabel>
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

      <SidebarFooter className="p-3 space-y-2">
        <Button
          variant="outline"
          className="w-full justify-start gap-2"
          onClick={() => setIsChatOpen(true)}
          data-testid="button-open-chat"
        >
          <MessageCircle className="w-4 h-4" />
          Ask Eden
        </Button>
        <SidebarMenuButton asChild>
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
