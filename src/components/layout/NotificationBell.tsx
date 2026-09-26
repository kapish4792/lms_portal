"use client";

import { useMemo, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNotificationsStore, type NotificationItem } from "@/lib/store/notifications-store";
import type { MockUser } from "@/lib/mock/users";
import { Bell, CheckCheck, Clock, ExternalLink, Mail, RotateCcw } from "lucide-react";

export function NotificationBell({ user }: { user: MockUser }) {
  const inbox = useNotificationsStore((s) => s.inbox);
  const markRead = useNotificationsStore((s) => s.markRead);
  const markAllRead = useNotificationsStore((s) => s.markAllRead);
  const resetToSeedData = useNotificationsStore((s) => s.resetToSeedData);

  const [activeItem, setActiveItem] = useState<NotificationItem | null>(null);

  const items = useMemo(() => {
    // 1. First priority: items matching the user's specific login identifier
    const userItems = inbox.filter((n) => n.recipientIdentifier.toLowerCase() === user.identifier.toLowerCase());
    if (userItems.length > 0) return userItems.slice(0, 10);

    // 2. Second priority: items matching the user's organization
    const orgItems = inbox.filter((n) => n.org.toLowerCase() === user.org.toLowerCase());
    if (orgItems.length > 0) return orgItems.slice(0, 10);

    // 3. Fallback: all items so notifications are never empty
    return inbox.slice(0, 10);
  }, [inbox, user.identifier, user.org]);

  const unreadCount = items.filter((n) => !n.read).length;

  const handleItemClick = (item: NotificationItem) => {
    markRead(item.id);
    setActiveItem(item);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" size="icon" aria-label="Notifications" className="relative">
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-danger opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-danger"></span>
                </span>
              )}
            </Button>
          }
        />
        <DropdownMenuContent align="end" className="w-80 md:w-96 p-1">
          <div className="flex items-center justify-between px-3 py-2 border-b border-surface-border">
            <div className="flex items-center gap-2">
              <DropdownMenuLabel className="p-0 font-semibold text-sm">Notifications</DropdownMenuLabel>
              {unreadCount > 0 && (
                <Badge variant="secondary" className="text-xs px-1.5 py-0">
                  {unreadCount} new
                </Badge>
              )}
            </div>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs text-text-tertiary hover:text-text-primary px-2 gap-1"
                onClick={() => markAllRead(user.identifier)}
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </Button>
            )}
          </div>

          <div className="max-h-[380px] overflow-y-auto divide-y divide-surface-border/50">
            {items.length === 0 ? (
              <div className="p-6 text-center space-y-2">
                <Bell className="w-8 h-8 text-text-tertiary mx-auto opacity-40" />
                <p className="text-sm text-text-secondary font-medium">No notifications yet</p>
                <p className="text-xs text-text-tertiary">We will notify you about course updates and announcements here.</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 text-xs gap-1.5"
                  onClick={() => resetToSeedData()}
                >
                  <RotateCcw className="w-3 h-3" />
                  Load Sample Notifications
                </Button>
              </div>
            ) : (
              items.map((n) => (
                <DropdownMenuItem
                  key={n.id}
                  onClick={() => handleItemClick(n)}
                  className={`flex flex-col items-start gap-1 p-3 cursor-pointer transition-colors ${
                    !n.read ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-surface-sunken"
                  }`}
                >
                  <div className="flex items-start justify-between w-full gap-2">
                    <span className={`text-xs line-clamp-1 ${!n.read ? "font-semibold text-text-primary" : "text-text-secondary font-normal"}`}>
                      {n.title}
                    </span>
                    {!n.read && <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1" />}
                  </div>
                  <p className="text-xs text-text-tertiary line-clamp-2 leading-relaxed text-left w-full font-normal">
                    {n.body}
                  </p>
                  <span className="text-[10px] text-text-tertiary mt-0.5">
                    {new Date(n.createdAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </DropdownMenuItem>
              ))
            )}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Notification Content Modal Dialog */}
      <Dialog open={!!activeItem} onOpenChange={(open) => !open && setActiveItem(null)}>
        <DialogContent className="max-w-md md:max-w-lg">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <Badge variant="outline" className="text-xs gap-1">
                <Mail className="w-3 h-3 text-text-tertiary" />
                Notification
              </Badge>
              <span className="text-xs text-text-tertiary flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {activeItem ? new Date(activeItem.createdAt).toLocaleString() : ""}
              </span>
            </div>
            <DialogTitle className="text-base font-semibold text-text-primary text-left">
              {activeItem?.title}
            </DialogTitle>
            <DialogDescription className="text-xs text-text-tertiary text-left">
              Recipient: {activeItem?.recipientIdentifier} ({activeItem?.org})
            </DialogDescription>
          </DialogHeader>

          {/* Formatted Message Body */}
          <div className="p-4 rounded-lg bg-surface-sunken/80 border border-surface-border text-sm text-text-primary whitespace-pre-wrap leading-relaxed max-h-[360px] overflow-y-auto">
            {activeItem?.body}
          </div>

          <DialogFooter className="flex-row justify-between sm:justify-end gap-2 pt-2 border-t border-surface-border">
            <Button variant="default" size="sm" onClick={() => setActiveItem(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
