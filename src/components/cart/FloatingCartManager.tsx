"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  PackagePlus,
  X,
  Search,
  Trash2,
  Plus,
  Loader2,
  Package,
  AlertCircle,
  Users,
  Pencil,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import {
  searchUsers,
  getUserCart,
  addItemToUserCart,
  updateUserCartItem,
  removeItemFromUserCart,
  clearUserCart,
  type SearchUser,
  type CartItem,
  type UserCartInfo,
} from "@/lib/admin-cart";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useConversationContext } from "@/hooks/use-conversation-context";

export function FloatingCartManager() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserCartInfo | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoadingCart, setIsLoadingCart] = useState(false);

  // Add item form
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItemTitle, setNewItemTitle] = useState("");
  const [newItemDescription, setNewItemDescription] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("");
  const [isAddingItem, setIsAddingItem] = useState(false);

  // Edit item state
  const [editingItem, setEditingItem] = useState<CartItem | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [isEditingItem, setIsEditingItem] = useState(false);

  // Clear all confirmation
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isClearingCart, setIsClearingCart] = useState(false);

  // Conversation context for showing participant dropdown
  const {
    isOnConversationPage,
    participants,
    isLoading: isLoadingParticipants,
    error: participantsError,
  } = useConversationContext();

  // Handler for participant selection from dropdown
  const handleSelectParticipant = async (participantId: string) => {
    const participant = participants.find(p => p.id === parseInt(participantId));
    if (!participant) {
      console.error('Participant not found:', { participantId });
      toast.error('Could not find selected participant');
      return;
    }

    setSelectedUser({
      id: participant.id,
      email: participant.email || '',
      displayName: participant.displayName,
    });
    setSearchQuery("");
    setSearchResults([]);

    try {
      await loadUserCart(participant.id);
    } catch (error) {
      console.error('Failed to load cart after participant selection:', {
        participantId: participant.id,
        error,
      });
      // Error is already toasted in loadUserCart
    }
  };

  // Debounced search
  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await searchUsers(searchQuery, 10);
        setSearchResults(results);
      } catch (error) {
        console.error("Search error:", error);
        toast.error("Failed to search users");
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Load cart when user is selected
  const loadUserCart = useCallback(async (userId: number) => {
    setIsLoadingCart(true);
    try {
      const cart = await getUserCart(userId);
      setCartItems(cart.items);
    } catch (error) {
      console.error("Load cart error:", error);
      toast.error("Failed to load cart");
    } finally {
      setIsLoadingCart(false);
    }
  }, []);

  // Select user and load their cart
  const handleSelectUser = async (user: SearchUser) => {
    setSelectedUser({
      id: user.id,
      email: user.email,
      displayName: user.displayName,
    });
    setSearchQuery("");
    setSearchResults([]);
    await loadUserCart(user.id);
  };

  // Add item to cart
  const handleAddItem = async () => {
    const parsedPrice = parseFloat(newItemPrice);
    if (!selectedUser || !newItemTitle.trim() || isNaN(parsedPrice) || parsedPrice < 0) return;

    setIsAddingItem(true);
    try {
      const priceInCents = Math.round(parsedPrice * 100);
      await addItemToUserCart(selectedUser.id, {
        title: newItemTitle.trim(),
        description: newItemDescription.trim() || undefined,
        unitPriceCents: priceInCents,
      });
      toast.success("Item added to cart");
      setNewItemTitle("");
      setNewItemDescription("");
      setNewItemPrice("");
      setShowAddForm(false);
      await loadUserCart(selectedUser.id);
    } catch (error) {
      console.error("Add item error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to add item");
    } finally {
      setIsAddingItem(false);
    }
  };

  // Start editing an item
  const handleStartEdit = (item: CartItem) => {
    setEditingItem(item);
    setEditTitle(item.title);
    setEditDescription(item.description || "");
    setEditPrice(item.unitPriceCents ? (item.unitPriceCents / 100).toFixed(2) : "");
  };

  // Save edited item
  const handleSaveEdit = async () => {
    if (!selectedUser || !editingItem || !editTitle.trim()) return;

    setIsEditingItem(true);
    try {
      const parsedPrice = editPrice ? parseFloat(editPrice) : NaN;
      const priceInCents = !isNaN(parsedPrice) && parsedPrice >= 0
        ? Math.round(parsedPrice * 100)
        : null;
      await updateUserCartItem(selectedUser.id, editingItem.id, {
        title: editTitle.trim(),
        description: editDescription.trim() || null,
        unitPriceCents: priceInCents,
      });
      toast.success("Item updated");
      setEditingItem(null);
      await loadUserCart(selectedUser.id);
    } catch (error) {
      console.error("Edit item error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update item");
    } finally {
      setIsEditingItem(false);
    }
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingItem(null);
    setEditTitle("");
    setEditDescription("");
    setEditPrice("");
  };

  // Remove item from cart
  const handleRemoveItem = async (itemId: number) => {
    if (!selectedUser) return;

    try {
      await removeItemFromUserCart(selectedUser.id, itemId);
      toast.success("Item removed");
      setCartItems(items => items.filter(item => item.id !== itemId));
    } catch (error) {
      console.error("Remove item error:", error);
      toast.error("Failed to remove item");
    }
  };

  // Clear all items
  const handleClearAll = async () => {
    if (!selectedUser) return;

    setIsClearingCart(true);
    try {
      const result = await clearUserCart(selectedUser.id);
      toast.success(`${result.itemsRemoved} items removed`);
      setCartItems([]);
    } catch (error) {
      console.error("Clear cart error:", error);
      toast.error("Failed to clear cart");
    } finally {
      setIsClearingCart(false);
      setShowClearConfirm(false);
    }
  };

  // Get user initials
  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      <div className="fixed bottom-4 right-20 z-50">
        {/* Collapsed state - Floating button */}
        {!isOpen && (
          <Button
            onClick={() => setIsOpen(true)}
            className="rounded-full h-12 w-12 shadow-lg hover:shadow-xl transition-shadow"
            title="Manage User Carts"
          >
            <PackagePlus className="h-5 w-5" />
          </Button>
        )}

        {/* Expanded state - Cart manager popup */}
        {isOpen && (
          <Card className="w-[420px] h-[600px] flex flex-col shadow-2xl border-border">
            {/* Header */}
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-3 border-b">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <PackagePlus className="h-5 w-5" />
                Cart Manager
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col p-4 overflow-hidden">
              {/* User Selection - Dropdown on conversation page, Search on other pages */}
              {isOnConversationPage ? (
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>Thread Participants</span>
                  </div>
                  {isLoadingParticipants ? (
                    <div className="flex items-center justify-center py-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  ) : participantsError ? (
                    <div className="text-sm text-destructive py-2">
                      {participantsError}
                    </div>
                  ) : participants.length === 0 ? (
                    <div className="text-sm text-muted-foreground py-2">
                      No participants found
                    </div>
                  ) : (
                    <Select
                      value={selectedUser?.id.toString() || ""}
                      onValueChange={handleSelectParticipant}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a participant..." />
                      </SelectTrigger>
                      <SelectContent>
                        {participants.map((p) => (
                          <SelectItem key={p.id} value={p.id.toString()}>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={p.avatarUrl || ""} />
                                <AvatarFallback className="text-xs">
                                  {getUserInitials(p.displayName)}
                                </AvatarFallback>
                              </Avatar>
                              <span>{p.displayName}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              ) : (
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search user by email or name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                  {isSearching && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                  )}

                  {/* Search Results Dropdown */}
                  {searchResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-popover border rounded-md shadow-lg z-10 max-h-48 overflow-y-auto">
                      {searchResults.map((user) => (
                        <button
                          key={user.id}
                          onClick={() => handleSelectUser(user)}
                          className="w-full flex items-center gap-3 p-2 hover:bg-muted text-left"
                        >
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.avatarUrl || ""} />
                            <AvatarFallback className="text-xs">
                              {getUserInitials(user.displayName)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">
                              {user.displayName}
                            </div>
                            <div className="text-xs text-muted-foreground truncate">
                              {user.email}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Selected User Info */}
              {selectedUser && (
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg mb-4">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      {getUserInitials(selectedUser.displayName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">
                      {selectedUser.displayName}
                    </div>
                    <div className="text-sm text-muted-foreground truncate">
                      {selectedUser.email}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedUser(null);
                      setCartItems([]);
                      setShowAddForm(false);
                    }}
                  >
                    Change
                  </Button>
                </div>
              )}

              {/* Cart Items */}
              {selectedUser && (
                <>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">
                      Cart Items ({cartItems.length})
                    </span>
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowAddForm(!showAddForm)}
                        className="h-7"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add
                      </Button>
                      {cartItems.length > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowClearConfirm(true)}
                          className="h-7 text-destructive hover:text-destructive"
                        >
                          Clear All
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Add Item Form */}
                  {showAddForm && (
                    <div className="p-3 bg-muted/30 rounded-lg mb-3 space-y-2">
                      <Input
                        placeholder="Item title (required)"
                        value={newItemTitle}
                        onChange={(e) => setNewItemTitle(e.target.value)}
                        maxLength={50}
                      />
                      <Textarea
                        placeholder="Description (optional)"
                        value={newItemDescription}
                        onChange={(e) => setNewItemDescription(e.target.value)}
                        maxLength={500}
                        rows={2}
                      />
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="Price (required)"
                          value={newItemPrice}
                          onChange={(e) => setNewItemPrice(e.target.value)}
                          className="pl-7"
                          required
                        />
                      </div>
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setShowAddForm(false);
                            setNewItemTitle("");
                            setNewItemDescription("");
                            setNewItemPrice("");
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleAddItem}
                          disabled={!newItemTitle.trim() || !newItemPrice || isNaN(parseFloat(newItemPrice)) || parseFloat(newItemPrice) < 0 || isAddingItem}
                        >
                          {isAddingItem && (
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          )}
                          Add Item
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Items List */}
                  <ScrollArea className="flex-1">
                    {isLoadingCart ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : cartItems.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                        <Package className="h-8 w-8 mb-2" />
                        <span className="text-sm">Cart is empty</span>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {cartItems.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg group"
                          >
                            {editingItem?.id === item.id ? (
                              // Edit mode
                              <div className="flex-1 space-y-2">
                                <Input
                                  placeholder="Title"
                                  value={editTitle}
                                  onChange={(e) => setEditTitle(e.target.value)}
                                  maxLength={50}
                                  className="h-8 text-sm"
                                />
                                <Textarea
                                  placeholder="Description"
                                  value={editDescription}
                                  onChange={(e) => setEditDescription(e.target.value)}
                                  maxLength={500}
                                  rows={2}
                                  className="text-sm"
                                />
                                <div className="relative">
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    placeholder="Price (required)"
                                    value={editPrice}
                                    onChange={(e) => setEditPrice(e.target.value)}
                                    className="pl-7 h-8 text-sm"
                                    required
                                  />
                                </div>
                                <div className="flex gap-2 justify-end">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleCancelEdit}
                                    className="h-7"
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={handleSaveEdit}
                                    disabled={!editTitle.trim() || !editPrice || isNaN(parseFloat(editPrice)) || parseFloat(editPrice) < 0 || isEditingItem}
                                    className="h-7"
                                  >
                                    {isEditingItem ? (
                                      <Loader2 className="h-3 w-3 animate-spin" />
                                    ) : (
                                      <Check className="h-3 w-3" />
                                    )}
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              // Display mode
                              <>
                                <Package className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="font-medium text-sm truncate">
                                      {item.title}
                                    </div>
                                    {item.unitPriceCents !== null && (
                                      <span className="text-sm font-medium text-primary shrink-0">
                                        ${(item.unitPriceCents / 100).toFixed(2)}
                                      </span>
                                    )}
                                  </div>
                                  {item.description && (
                                    <div className="text-xs text-muted-foreground line-clamp-2">
                                      {item.description}
                                    </div>
                                  )}
                                  {item.addedByUserId && (
                                    <div className="text-xs text-blue-600 mt-1">
                                      Added by agent
                                    </div>
                                  )}
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() => handleStartEdit(item)}
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() => handleRemoveItem(item.id)}
                                  >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                </div>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </>
              )}

              {/* No User Selected State */}
              {!selectedUser && (
                <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
                  <AlertCircle className="h-8 w-8 mb-2" />
                  <span className="text-sm">Search and select a user to manage their cart</span>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Clear All Confirmation Dialog */}
      <Dialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clear all items?</DialogTitle>
            <DialogDescription>
              This will remove all {cartItems.length} items from{" "}
              {selectedUser?.displayName}&apos;s cart. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowClearConfirm(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleClearAll}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isClearingCart}
            >
              {isClearingCart && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Clear All
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
