import { Link } from "@tanstack/react-router";
import { Bell, Search, ChevronsUpDown, Plus, Shield, User, Settings, LogOut } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function TopBar() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur-xl">
      <SidebarTrigger />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="hidden h-9 gap-2 rounded-xl md:inline-flex">
            <div className="grid h-5 w-5 place-items-center rounded-md bg-gradient-primary text-[10px] font-bold text-white">
              A
            </div>
            <span className="text-sm font-medium">Acme Corp</span>
            <Badge variant="secondary" className="ml-1 text-[10px]">
              <Shield className="mr-1 h-2.5 w-2.5" /> Admin
            </Badge>
            <ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-64">
          <DropdownMenuLabel>Switch workspace</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Acme Corp</DropdownMenuItem>
          <DropdownMenuItem>Lumen Labs</DropdownMenuItem>
          <DropdownMenuItem>Northwind Talent</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>+ Create workspace</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="relative ml-2 hidden max-w-md flex-1 md:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search interviews, candidates…"
          className="h-9 rounded-xl pl-9 pr-16"
        />
        <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 select-none rounded border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline-block">
          ⌘K
        </kbd>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <Button size="sm" className="h-9 gap-1.5 rounded-xl bg-gradient-primary text-white shadow-elegant hover:opacity-95">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Quick Create</span>
        </Button>
        <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-xl">
          <Bell className="h-4 w-4" />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-destructive" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <Avatar className="h-9 w-9 ring-2 ring-border transition hover:ring-primary/40">
                <AvatarFallback className="bg-gradient-primary text-xs font-semibold text-white">
                  JD
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="text-sm font-medium">Jane Doe</span>
                <span className="text-xs font-normal text-muted-foreground">jane.doe@acme.com</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/profile">
                <User className="mr-2 h-4 w-4" /> Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" /> Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="text-destructive focus:text-destructive">
              <Link to="/login">
                <LogOut className="mr-2 h-4 w-4" /> Log out
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
