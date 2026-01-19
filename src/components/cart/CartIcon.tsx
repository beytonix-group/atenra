"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { ShoppingCart, Package, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  const [itemCount, setItemCount] = useState(0);
  const [items, setItems] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchCartCount = useCallback(async () => {
    try {
      const res = await fetch("/api/cart/count");
      if (res.ok) {
        const data = await res.json() as { count: number };
        setItemCount(data.count);
      }
    } catch (error) {
      console.error("Failed to fetch cart count:", error);
    }
  }, []);

  const fetchCartItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/cart");
      if (res.ok) {
        const data = await res.json() as { items: CartItem[] };
        setItems(data.items);
        setItemCount(data.items.reduce((sum, item) => sum + item.quantity, 0));
      }
    } catch (error) {
      console.error("Failed to fetch cart items:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;

    fetchCartCount();

    // Poll for updates every 30 seconds
    const interval = setInterval(fetchCartCount, 30000);
    return () => clearInterval(interval);
  }, [mounted, fetchCartCount]);

  // Fetch full cart when popover opens
  useEffect(() => {
    if (isOpen) {
      fetchCartItems();
    }
  }, [isOpen, fetchCartItems]);

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
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-medium text-primary-foreground flex items-center justify-center">
              {itemCount > 9 ? "9+" : itemCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <span className="font-semibold">Your Cart</span>
          <span className="text-sm text-muted-foreground">
            {items.length} {items.length === 1 ? "item" : "items"}
          </span>
        </div>

        {/* Items */}
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <Package className="h-8 w-8 mb-2" />
            <span className="text-sm">Your cart is empty</span>
          </div>
        ) : (
          <ScrollArea className="max-h-[300px]">
            <div className="divide-y">
              {items.map((item) => (
                <div key={item.id} className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-medium text-sm truncate flex-1">
                      {item.title}
                    </span>
                    <span className="text-xs bg-muted px-1.5 py-0.5 rounded shrink-0">
                      x{item.quantity}
                    </span>
                  </div>
                  {item.unitPriceCents !== null && (
                    <div className="text-sm text-primary mt-1">
                      ${((item.unitPriceCents * item.quantity) / 100).toFixed(2)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}

        {/* Footer with total */}
        <div className="p-3 border-t bg-muted/50">
          {total > 0 && (
            <div className="flex justify-between mb-3">
              <span className="text-sm">Total</span>
              <span className="font-semibold">${(total / 100).toFixed(2)}</span>
            </div>
          )}
          <Link href="/cart" onClick={() => setIsOpen(false)}>
            <Button className="w-full" size="sm">
              View Full Cart
            </Button>
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
