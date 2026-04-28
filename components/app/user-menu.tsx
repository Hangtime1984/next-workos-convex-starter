"use client";

import { startTransition, useState } from "react";
import Link from "next/link";
import { useAuth } from "@workos-inc/authkit-nextjs/components";
import { LogOutIcon, Settings2Icon, ShieldCheckIcon } from "lucide-react";
import type { Role } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function initials(value: string | null) {
  if (!value) {
    return "AW";
  }

  return value
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function UserMenu({
  user,
  role,
}: {
  user: {
    email: string | null;
    name: string | null;
    pictureUrl: string | null;
  };
  role: Role;
}) {
  const { signOut } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            className="h-auto w-full justify-start px-2 py-2"
          />
        }
      >
        <Avatar className="size-9">
          <AvatarImage src={user.pictureUrl ?? undefined} alt={user.name ?? "User"} />
          <AvatarFallback>{initials(user.name)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 text-left">
          <div className="truncate text-sm font-medium">{user.name ?? "Workspace user"}</div>
          <div className="truncate text-xs text-muted-foreground">
            {user.email ?? "No email available"}
          </div>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="space-y-2">
            <div className="truncate font-medium text-foreground">
              {user.name ?? "Workspace user"}
            </div>
            <div className="truncate text-xs font-normal text-muted-foreground">
              {user.email ?? "No email available"}
            </div>
            <Badge variant="secondary">{role}</Badge>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem render={<Link href="/settings/profile" />}>
            <Settings2Icon />
            Profile settings
          </DropdownMenuItem>
          {(role === "owner" || role === "admin") && (
            <DropdownMenuItem render={<Link href="/admin/users" />}>
              <ShieldCheckIcon />
              Admin controls
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          disabled={isSigningOut}
          onClick={() => {
            setIsSigningOut(true);
            startTransition(async () => {
              try {
                await signOut({ returnTo: "/" });
              } finally {
                setIsSigningOut(false);
              }
            });
          }}
        >
          <LogOutIcon />
          {isSigningOut ? "Signing out..." : "Sign out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
