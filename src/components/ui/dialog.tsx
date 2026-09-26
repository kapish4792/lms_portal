"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  isValidElement,
  cloneElement,
  type ReactNode,
  type ReactElement,
  type ComponentProps,
} from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, type HTMLMotionProps } from "framer-motion";
import { cn } from "cn";
import { XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DialogContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const DialogContext = createContext<DialogContextValue | null>(null);

function useDialog() {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error("Dialog components must be used within a <Dialog>");
  }
  return context;
}

interface DialogProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: ReactNode;
}

function Dialog({
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  children,
}: DialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;

  const setOpen = useCallback(
    (nextOpen: boolean) => {
      if (!isControlled) {
        setUncontrolledOpen(nextOpen);
      }
      onOpenChange?.(nextOpen);
    },
    [isControlled, onOpenChange]
  );

  return (
    <DialogContext.Provider value={{ open, setOpen }}>
      {children}
    </DialogContext.Provider>
  );
}

function DialogTrigger({
  children,
  render,
  onClick,
  asChild,
  ...props
}: ComponentProps<"button"> & {
  render?: ReactElement;
  asChild?: boolean;
}) {
  const { setOpen } = useDialog();

  const triggerElement = render ?? (asChild && isValidElement(children) ? children : undefined);

  if (triggerElement) {
    return cloneElement(triggerElement as ReactElement<{ onClick?: (e: MouseEvent) => void }>, {
      onClick: (e: MouseEvent) => {
        (triggerElement as any).props?.onClick?.(e);
        setOpen(true);
      },
    });
  }

  return (
    <button
      type="button"
      data-slot="dialog-trigger"
      onClick={(e) => {
        onClick?.(e);
        setOpen(true);
      }}
      {...props}
    >
      {children}
    </button>
  );
}

function DialogClose({
  children,
  render,
  onClick,
  asChild,
  ...props
}: ComponentProps<"button"> & {
  render?: ReactElement;
  asChild?: boolean;
}) {
  const { setOpen } = useDialog();

  const triggerElement = render ?? (asChild && isValidElement(children) ? children : undefined);

  if (triggerElement) {
    return cloneElement(triggerElement as ReactElement<{ onClick?: (e: MouseEvent) => void }>, {
      onClick: (e: MouseEvent) => {
        (triggerElement as any).props?.onClick?.(e);
        setOpen(false);
      },
    });
  }

  return (
    <button
      type="button"
      data-slot="dialog-close"
      onClick={(e) => {
        onClick?.(e);
        setOpen(false);
      }}
      {...props}
    >
      {children}
    </button>
  );
}

function DialogPortal({ children }: { children?: ReactNode }) {
  return <>{children}</>;
}

function DialogOverlay() {
  return null;
}

interface DialogContentProps extends Omit<HTMLMotionProps<"div">, "children"> {
  children?: ReactNode;
  showCloseButton?: boolean;
  onInteractOutside?: () => void;
  onEscapeKeyDown?: () => void;
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  onInteractOutside,
  onEscapeKeyDown,
  ...props
}: DialogContentProps) {
  const { open, setOpen } = useDialog();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle ESC key to close
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onEscapeKeyDown ? onEscapeKeyDown() : setOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, setOpen, onEscapeKeyDown]);

  // Lock background scrolling when open
  useEffect(() => {
    if (!open) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [open]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          key="dialog-portal-container"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.22, ease: "easeOut" } }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 isolate"
        >
          {/* Framer Motion Backdrop Fade */}
          <motion.div
            key="dialog-overlay"
            data-slot="dialog-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onClick={() => {
              onInteractOutside ? onInteractOutside() : setOpen(false);
            }}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs cursor-pointer"
            aria-hidden="true"
          />

          {/* Framer Motion Modal Zoom-In and Zoom-Out */}
          <motion.div
            key="dialog-content"
            data-slot="dialog-content"
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0, scale: 0.9, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 12 }}
            transition={{
              type: "spring",
              damping: 25,
              stiffness: 350,
              mass: 0.8,
            }}
            className={cn(
              "relative z-50 flex flex-col w-full max-w-[calc(100%-2rem)] max-h-[88vh] overflow-y-auto gap-5 rounded-2xl bg-popover p-6 sm:p-7 text-sm/relaxed text-popover-foreground shadow-2xl ring-1 ring-foreground/10 outline-none sm:max-w-lg md:max-w-2xl scrollbar-thin",
              className
            )}
            onClick={(e) => e.stopPropagation()}
            {...props}
          >
            {children}
            {showCloseButton && (
              <Button
                variant="ghost"
                type="button"
                className="absolute top-3.5 right-3.5 h-8 w-8 rounded-full p-0 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
                size="icon-sm"
                onClick={() => setOpen(false)}
                aria-label="Close"
              >
                <XIcon className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </Button>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

function DialogHeader({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-1 shrink-0", className)}
      {...props}
    />
  );
}

function DialogBody({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-body"
      className={cn("flex-1 overflow-y-auto pr-1 scrollbar-thin space-y-4", className)}
      {...props}
    />
  );
}

function DialogFooter({
  className,
  showCloseButton = false,
  children,
  ...props
}: ComponentProps<"div"> & {
  showCloseButton?: boolean;
}) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end shrink-0 pt-2",
        className
      )}
      {...props}
    >
      {children}
      {showCloseButton && (
        <DialogClose render={<Button variant="outline" />}>
          Close
        </DialogClose>
      )}
    </div>
  );
}

function DialogTitle({ className, ...props }: ComponentProps<"h2">) {
  return (
    <h2
      data-slot="dialog-title"
      className={cn("font-heading text-base font-semibold", className)}
      {...props}
    />
  );
}

function DialogDescription({
  className,
  ...props
}: ComponentProps<"p">) {
  return (
    <p
      data-slot="dialog-description"
      className={cn(
        "text-xs/relaxed text-muted-foreground *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-foreground",
        className
      )}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
