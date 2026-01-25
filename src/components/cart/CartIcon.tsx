"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart, Package, Trash2, Plus, Minus, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { usePolling } from "@/hooks/use-polling";
import { useCartWebSocket } from "@/hooks/use-cart-websocket";
import type { TriggeredBy, CartItemData } from "@/lib/cart-websocket-types";

interface CartItem {
  id: number;
  title: string;
  description: string | null;
  quantity: number;
  unitPriceCents: number | null;
  addedByUserId: number | null;
  createdAt: number;
}

export function CartIcon() {
  const pathname = usePathname();
  const [itemCount, setItemCount] = useState(0);
  const [items, setItems] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [updatingItemId, setUpdatingItemId] = useState<number | null>(null);
  const [removingItemId, setRemovingItemId] = useState<number | null>(null);
  const [prevCount, setPrevCount] = useState(0);
  const [countAnimating, setCountAnimating] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Animate badge when count changes
  useEffect(() => {
    if (itemCount !== prevCount && prevCount !== 0) {
      setCountAnimating(true);
      const timer = setTimeout(() => setCountAnimating(false), 300);
      return () => clearTimeout(timer);
    }
    setPrevCount(itemCount);
  }, [itemCount, prevCount]);

  const fetchCartCount = useCallback(async () => {
    try {
      const res = await fetch("/api/cart/count");
      if (!res.ok) {
        console.error(`Failed to fetch cart count: HTTP ${res.status}`);
        throw new Error(`HTTP ${res.status}`); // Throw to trigger backoff
      }
      const data = await res.json() as { count: number };
      setItemCount(data.count);
    } catch (error) {
      console.error("Failed to fetch cart count:", error);
      throw error; // Re-throw to trigger backoff in usePolling
    }
  }, []);

  const fetchCartItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/cart");
      if (!res.ok) {
        console.error(`Failed to fetch cart items: HTTP ${res.status}`);
        toast.error("Unable to load cart items. Please try again.");
        return;
      }
      const data = await res.json() as { items: CartItem[] };
      setItems(data.items);
      setItemCount(data.items.reduce((sum, item) => sum + item.quantity, 0));
    } catch (error) {
      console.error("Failed to fetch cart items:", error);
      toast.error("Unable to load cart items. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // WebSocket for real-time cart updates
  const { isConnected: isWsConnected, error: wsError } = useCartWebSocket({
    cartUserId: undefined, // undefined = own cart
    enabled: mounted,
    onItemAdded: useCallback((item: CartItemData, triggeredBy: TriggeredBy) => {
      setItemCount(prev => prev + item.quantity);
      if (triggeredBy.role === 'agent') {
        toast.info('An agent added an item to your cart');
      }
      // Refresh full items if popover is open
      if (isOpen) {
        fetchCartItems();
      }
    }, [isOpen, fetchCartItems]),
    onItemRemoved: useCallback(() => {
      // Refresh cart data
      fetchCartCount();
      if (isOpen) {
        fetchCartItems();
      }
    }, [isOpen, fetchCartCount, fetchCartItems]),
    onItemUpdated: useCallback(() => {
      // Refresh cart data
      if (isOpen) {
        fetchCartItems();
      }
    }, [isOpen, fetchCartItems]),
    onCartCleared: useCallback((triggeredBy: TriggeredBy) => {
      setItemCount(0);
      setItems([]);
      if (triggeredBy.role === 'agent') {
        toast.info('An agent cleared your cart');
      }
    }, []),
    onError: useCallback((error: Error) => {
      // Only show critical errors to user, not transient connection issues
      if (error.message.includes('Session expired') || error.message.includes('sign in')) {
        toast.error(error.message);
      }
    }, []),
  });

  // Log WebSocket errors for debugging (non-critical ones)
  useEffect(() => {
    if (wsError) {
      console.error('Cart WebSocket error:', wsError.message);
    }
  }, [wsError]);

  // Update item quantity
  const updateQuantity = async (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;

    const previousItems = [...items];
    const itemToUpdate = previousItems.find(i => i.id === itemId);
    if (!itemToUpdate) return;

    const quantityDelta = newQuantity - itemToUpdate.quantity;
    setUpdatingItemId(itemId);

    // Optimistic update
    setItems(prev => prev.map(item =>
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    ));
    setItemCount(prev => prev + quantityDelta);

    try {
      const res = await fetch(`/api/cart/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: newQuantity })
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
    } catch (error) {
      console.error(`Failed to update cart item ${itemId} quantity:`, error);
      // Revert on error
      setItems(previousItems);
      setItemCount(previousItems.reduce((sum, item) => sum + item.quantity, 0));
      toast.error("Failed to update quantity. Please try again.");
    } finally {
      setUpdatingItemId(null);
    }
  };

  // Remove item
  const removeItem = async (itemId: number) => {
    const previousItems = [...items];
    const itemToRemove = previousItems.find(i => i.id === itemId);

    setRemovingItemId(itemId);

    // Optimistic update
    setItems(prev => prev.filter(item => item.id !== itemId));
    if (itemToRemove) {
      setItemCount(prev => prev - itemToRemove.quantity);
    }

    try {
      const res = await fetch(`/api/cart/${itemId}`, { method: "DELETE" });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      toast.success("Item removed from cart");
    } catch (error) {
      console.error(`Failed to remove cart item ${itemId}:`, error);
      // Revert on error
      setItems(previousItems);
      setItemCount(previousItems.reduce((sum, item) => sum + item.quantity, 0));
      toast.error("Failed to remove item. Please try again.");
    } finally {
      setRemovingItemId(null);
    }
  };

  // Polling interval: shorter when WebSocket disconnected, longer when connected
  // When connected, polling serves as fallback; when disconnected, it's the primary mechanism
  const isMessagesPage = pathname?.startsWith("/messages");
  const pollingInterval = isWsConnected
    ? 60000  // 60s when WebSocket connected (fallback only)
    : (isMessagesPage ? 5000 : 10000);  // 5s on messages page, 10s elsewhere when WS disconnected

  usePolling(fetchCartCount, {
    interval: pollingInterval,
    enabled: mounted,
    pollOnMount: true,
  });

  // Fetch full cart when popover opens
  useEffect(() => {
    if (isOpen) {
      fetchCartItems();
    }
  }, [isOpen, fetchCartItems]);

  // Refresh items when count changes while popover is open (e.g., agent added item)
  const prevItemCountRef = useRef(itemCount);
  useEffect(() => {
    if (isOpen && itemCount !== prevItemCountRef.current) {
      // Count changed while popover is open - refresh items
      fetchCartItems();
    }
    prevItemCountRef.current = itemCount;
  }, [isOpen, itemCount, fetchCartItems]);

  // Calculate total
  const total = items.reduce((sum, item) => {
    if (item.unitPriceCents !== null) {
      return sum + (item.unitPriceCents * item.quantity);
    }
    return sum;
  }, 0);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="relative">
        <ShoppingCart className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <ShoppingCart className="h-5 w-5" />
          {itemCount > 0 && (
            <span
              className={cn(
                "absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-[10px] font-semibold text-primary-foreground flex items-center justify-center shadow-sm transition-transform duration-300",
                countAnimating && "scale-125"
              )}
            >
              {itemCount > 99 ? "99+" : itemCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-96 p-0 animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
        align="end"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-muted/30">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-primary" />
            <span className="font-semibold text-base">Your Cart</span>
          </div>
          <Badge variant="secondary" className="font-medium">
            {itemCount} {itemCount === 1 ? "item" : "items"}
          </Badge>
        </div>

        {/* Items */}
        {isLoading ? (
          <div className="p-4 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <div className="flex justify-between items-center pt-1">
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 px-6 text-center">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-base mb-1">Your cart is empty</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Browse the marketplace to find services you need
            </p>
            <Link href="/marketplace" onClick={() => setIsOpen(false)}>
              <Button variant="outline" size="sm">
                Browse Marketplace
              </Button>
            </Link>
          </div>
        ) : (
          <div className="max-h-[350px] overflow-y-auto">
            <div className="divide-y">
              {items.map((item) => {
                const isUpdating = updatingItemId === item.id;
                const isRemoving = removingItemId === item.id;
                const lineTotal = ((item.unitPriceCents ?? 0) * item.quantity) / 100;
                const unitPrice = (item.unitPriceCents ?? 0) / 100;

                return (
                  <div
                    key={item.id}
                    className={cn(
                      "p-4 group hover:bg-muted/30 transition-colors",
                      (isUpdating || isRemoving) && "opacity-60"
                    )}
                  >
                    {/* Title and remove button */}
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="font-medium text-sm leading-tight flex-1 line-clamp-2">
                        {item.title}
                      </h4>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive shrink-0"
                        onClick={() => removeItem(item.id)}
                        disabled={isRemoving || isUpdating}
                        aria-label="Remove item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Description */}
                    {item.description && (
                      <p className="text-xs text-muted-foreground line-clamp-1 mb-2">
                        {item.description}
                      </p>
                    )}

                    {/* Quantity controls and price */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1 || isUpdating || isRemoving}
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center text-sm font-medium tabular-nums">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={isUpdating || isRemoving}
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>

                      <div className="text-right">
                        <div className="text-sm font-medium text-primary">
                          ${lineTotal.toFixed(2)}
                        </div>
                        {item.quantity > 1 && (
                          <div className="text-[10px] text-muted-foreground">
                            ${unitPrice.toFixed(2)} × {item.quantity}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Added by agent indicator */}
                    {item.addedByUserId !== null && (
                      <div className="flex items-center gap-1 mt-2 text-[10px] text-muted-foreground">
                        <User className="h-3 w-3" />
                        <span>Added by agent</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer with subtotal */}
        {items.length > 0 && (
          <div className="p-4 border-t bg-muted/30">
            <div className="flex justify-between items-baseline mb-3">
              <span className="text-sm text-muted-foreground">
                Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})
              </span>
              <span className="font-semibold text-lg">
                ${(total / 100).toFixed(2)}
              </span>
            </div>
            <Button asChild className="w-full" onClick={() => setIsOpen(false)}>
              <Link href="/cart">View Full Cart</Link>
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
