"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Mic,
  Users,
  CreditCard,
  Sparkles,
  Settings,
  LogOut,
  User as UserIcon,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";

const items = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Interviews", url: "/interviews", icon: Mic },
  { title: "Candidates", url: "/candidates", icon: Users },
  { title: "Usage", url: "/usage", icon: CreditCard },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const path = usePathname();
  const isActive = (url: string) => (url === "/" ? path === "/" : path?.startsWith(url));

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader className="border-b">
        <Link href="/dashboard" className="flex items-center gap-2.5 px-2 py-2.5">
          <div className="relative grid h-9 w-9 place-items-center rounded-xl bg-gradient-ai shadow-glow">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          {!collapsed && (
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold tracking-tight">Voxa AI</span>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Interview Platform
              </span>
            </div>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                    <Link href={item.url} className="flex items-center gap-2.5">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {!collapsed && (
          <div className="mx-3 mt-4 rounded-2xl bg-gradient-ai p-[1px] shadow-elegant">
            <div className="rounded-2xl bg-card p-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-ai" />
                <span className="text-xs font-medium">AI Credits</span>
              </div>
              <div className="mt-3 flex items-end justify-between">
                <span className="text-2xl font-semibold tracking-tight">2,450</span>
                <Badge variant="secondary" className="text-[10px]">Pro</Badge>
              </div>
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full w-[68%] rounded-full bg-gradient-ai" />
              </div>
              <p className="mt-2 text-[10px] text-muted-foreground">68% of monthly quota used</p>
            </div>
          </div>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Settings">
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
