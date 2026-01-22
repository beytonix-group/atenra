"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Minus, Plus, Trash2, ShoppingCart, Loader2, Package, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface CartItem {
  id: number;
  title: string;
  description: string | null;
  quantity: number;
  unitPriceCents: number | null;
  createdAt: number;
  addedByUserId?: number | null;
}

const POLLING_INTERVAL = 5000; // 5 seconds

export function CartContent() {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [updatingItems, setUpdatingItems] = useState<Set<number>>(new Set());
  const previousItemIds = useRef<Set<number>>(new Set());
  const isInitialLoad = useRef(true);

  const fetchCartItems = useCallback(async (showNewItemToast = false) => {
    try {
      const res = await fetch("/api/cart");
      if (res.ok) {
        const data = await res.json() as { items: CartItem[] };

        // Check for new items added by employee (only after initial load)
        if (showNewItemToast && !isInitialLoad.current) {
          const currentIds = new Set(data.items.map(item => item.id));
          const newItems = data.items.filter(
            item => !previousItemIds.current.has(item.id) && item.addedByUserId
          );

          if (newItems.length > 0) {
            toast.info(`${newItems.length} new item${newItems.length > 1 ? 's' : ''} added to your cart`);
          }

          previousItemIds.current = currentIds;
        } else if (isInitialLoad.current) {
          // Store initial item IDs
          previousItemIds.current = new Set(data.items.map(item => item.id));
          isInitialLoad.current = false;
        }

        setItems(data.items);
        setFetchError(null);
      } else {
        if (isInitialLoad.current) {
          setFetchError("Failed to load cart. Please try again.");
        }
      }
    } catch (error) {
      console.error("Failed to fetch cart:", error);
      if (isInitialLoad.current) {
        setFetchError("Failed to load cart. Please check your connection and try again.");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchCartItems(false);
  }, [fetchCartItems]);

  // Polling with visibility API
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    const startPolling = () => {
      intervalId = setInterval(() => {
        if (document.visibilityState === "visible") {
          fetchCartItems(true);
        }
      }, POLLING_INTERVAL);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        // Refresh immediately when tab becomes visible
        fetchCartItems(true);
        // Restart polling
        if (intervalId) clearInterval(intervalId);
        startPolling();
      } else {
        // Stop polling when tab is hidden
        if (intervalId) clearInterval(intervalId);
      }
    };

    // Start polling
    startPolling();

    // Listen for visibility changes
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (intervalId) clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [fetchCartItems]);

  async function updateQuantity(itemId: number, newQuantity: number) {
    if (newQuantity < 1) return;

    setUpdatingItems((prev) => new Set(prev).add(itemId));

    try {
      const res = await fetch(`/api/cart/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: newQuantity }),
      });

      if (res.ok) {
        setItems((prev) =>
          prev.map((item) =>
            item.id === itemId ? { ...item, quantity: newQuantity } : item
          )
        );
      } else {
        toast.error("Failed to update quantity. Please try again.");
      }
    } catch (error) {
      console.error("Failed to update quantity:", error);
      toast.error("Failed to update quantity. Please check your connection.");
    } finally {
      setUpdatingItems((prev) => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    }
  }

  async function removeItem(itemId: number) {
    setUpdatingItems((prev) => new Set(prev).add(itemId));

    try {
      const res = await fetch(`/api/cart/${itemId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setItems((prev) => prev.filter((item) => item.id !== itemId));
        toast.success("Item removed from cart");
      } else {
        toast.error("Failed to remove item. Please try again.");
      }
    } catch (error) {
      console.error("Failed to remove item:", error);
      toast.error("Failed to remove item. Please check your connection.");
    } finally {
      setUpdatingItems((prev) => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    }
  }

  async function clearCart() {
    if (!confirm("Are you sure you want to clear your cart? This action cannot be undone.")) {
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/cart", {
        method: "DELETE",
      });

      if (res.ok) {
        setItems([]);
        toast.success("Cart cleared");
      } else {
        toast.error("Failed to clear cart. Please try again.");
      }
    } catch (error) {
      console.error("Failed to clear cart:", error);
      toast.error("Failed to clear cart. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (fetchError) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="h-16 w-16 text-destructive mb-4" />
          <h2 className="text-xl font-semibold mb-2">Unable to load cart</h2>
          <p className="text-muted-foreground mb-6 text-center">
            {fetchError}
          </p>
          <Button onClick={() => {
            setIsLoading(true);
            isInitialLoad.current = true;
            previousItemIds.current = new Set();
            fetchCartItems(false);
          }}>
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (items.length === 0) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-6 text-center">
            Browse our marketplace to find services you need.
          </p>
          <Link href="/marketplace">
            <Button>Browse Marketplace</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const total = items.reduce((sum, item) => {
    return sum + ((item.unitPriceCents ?? 0) * item.quantity);
  }, 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Shopping Cart</h1>
        <Button variant="outline" size="sm" onClick={clearCart}>
          Clear Cart
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {/* Cart Items */}
          <div className="divide-y">
            {items.map((item) => (
              <div
                key={item.id}
                className={cn(
                  "flex items-center gap-4 p-4",
                  updatingItems.has(item.id) && "opacity-60"
                )}
              >
                {/* Item Icon */}
                <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                  <Package className="h-6 w-6 text-muted-foreground" />
                </div>

                {/* Item Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{item.title}</h3>
                  {item.description && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                      {item.description}
                    </p>
                  )}
                </div>

                {/* Price Display */}
                <div className="text-right shrink-0 min-w-[80px]">
                  <div className="font-semibold">
                    ${(((item.unitPriceCents ?? 0) * item.quantity) / 100).toFixed(2)}
                  </div>
                  {item.quantity > 1 && (
                    <div className="text-xs text-muted-foreground">
                      ${((item.unitPriceCents ?? 0) / 100).toFixed(2)} each
                    </div>
                  )}
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    disabled={item.quantity <= 1 || updatingItems.has(item.id)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-8 text-center font-medium">{item.quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    disabled={updatingItems.has(item.id)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {/* Remove Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => removeItem(item.id)}
                  disabled={updatingItems.has(item.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          {/* Cart Summary */}
          <div className="border-t bg-muted/30 p-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Items</span>
              <span className="font-semibold">{totalItems}</span>
            </div>
            <div className="flex justify-between text-lg">
              <span className="font-medium">Subtotal</span>
              <span className="font-semibold">${(total / 100).toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0">
          <Button
            className="w-full"
            size="lg"
            onClick={() => router.push("/checkout")}
          >
            Proceed to Checkout
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
