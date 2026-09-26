"use client";

import { useMemo } from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useNotificationsStore } from "@/lib/store/notifications-store";
import type { MockUser } from "@/lib/mock/users";
import { Bell } from "lucide-react";

export function NotificationBell({ user }: { user: MockUser }) {
  const inbox = useNotificationsStore((s) => s.inbox);
  const markRead = useNotificationsStore((s) => s.markRead);

  const items = useMemo(
    () => inbox.filter((n) => n.recipientIdentifier === user.identifier).slice(0, 8),
    [inbox, user.identifier]
  );
  const unread = items.filter((n) => !n.read).length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon" aria-label="Notifications" className="relative">
            <Bell className="w-4 h-4" />
            {unread > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-danger" />
            )}
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {items.length === 0 && (
          <p className="px-2 py-3 text-sm text-text-tertiary text-center">No notifications yet.</p>
        )}
        {items.map((n) => (
          <DropdownMenuItem key={n.id} onClick={() => markRead(n.id)} className="flex-col items-start gap-0.5">
            <span className={n.read ? "text-text-secondary" : "font-medium text-text-primary"}>{n.title}</span>
            <span className="text-xs text-text-tertiary">{n.body}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
