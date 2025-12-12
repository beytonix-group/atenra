"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronsUpDown, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { getCategoryStyles } from "@/lib/utils/colors";

interface ServiceCategory {
  id: number;
  name: string;
  description: string | null;
  parentId?: number | null;
  level?: number;
  parentName?: string;
}

export function ServicePreferencesForm() {
  const router = useRouter();
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/service-categories");
      if (response.ok) {
        const data = await response.json() as { categories: ServiceCategory[] };
        setCategories(data.categories);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      setError("Failed to load service categories");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleCategory = (categoryId: number) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleRemoveCategory = (categoryId: number) => {
    setSelectedCategories((prev) => prev.filter((id) => id !== categoryId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedCategories.length === 0) {
      setError("Please select at least one service category");
      return;
    }

    setIsSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/user/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryIds: selectedCategories }),
      });

      if (response.ok) {
        setSuccess("Preferences saved successfully!");
        setTimeout(() => {
          router.push("/upgrade");
          router.refresh();
        }, 1000);
      } else {
        const data = await response.json() as { error?: string };
        setError(data.error || "Failed to save preferences");
      }
    } catch (error) {
      console.error("Save preferences error:", error);
      setError("Failed to save preferences");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl">Welcome! Let&apos;s personalize your experience</CardTitle>
          <CardDescription>
            Select the service categories you&apos;re interested in. This helps us show you relevant content.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Multi-select Dropdown */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Service Categories</label>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between h-auto min-h-[40px] py-2"
                  >
                    <span className="truncate">
                      {selectedCategories.length === 0
                        ? "Select service categories..."
                        : `${selectedCategories.length} selected`}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search categories..." />
                    <CommandList>
                      <CommandEmpty>No category found.</CommandEmpty>
                      <CommandGroup>
                        {categories.map((category) => {
                          const level = category.level || 0;
                          const indent = level * 16; // 16px per level

                          return (
                            <CommandItem
                              key={category.id}
                              value={`${category.parentName || ''} ${category.name}`}
                              onSelect={() => handleToggleCategory(category.id)}
                              className="cursor-pointer"
                            >
                              <div style={{ marginLeft: `${indent}px` }} className="flex items-start flex-1">
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4 shrink-0 mt-0.5",
                                    selectedCategories.includes(category.id)
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    {level > 0 && (
                                      <span className="text-muted-foreground text-xs">└─</span>
                                    )}
                                    <div className="font-medium truncate">
                                      {category.name}
                                    </div>
                                  </div>
                                  {category.parentName && (
                                    <div className="text-xs text-muted-foreground mt-0.5">
                                      Under: {category.parentName}
                                    </div>
                                  )}
                                  {category.description && (
                                    <div className="text-xs text-muted-foreground mt-0.5">
                                      {category.description}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Selected Categories Display */}
            {selectedCategories.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Selected Categories ({selectedCategories.length})</label>
                <div className="flex flex-wrap gap-2 p-3 border rounded-md bg-gray-50 dark:bg-gray-800">
                  {categories
                    .filter(cat => selectedCategories.includes(cat.id))
                    .map((category) => {
                      const styles = getCategoryStyles(category.id);
                      return (
                        <Badge
                          key={category.id}
                          style={styles}
                          className="gap-1 transition-colors border"
                        >
                          {category.name}
                          <button
                            type="button"
                            onClick={() => handleRemoveCategory(category.id)}
                            className="ml-1 opacity-80 hover:opacity-100 rounded-full p-0.5 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      );
                    })}
                </div>
              </div>
            )}

            {/* Error/Success Messages */}
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-200">
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSaving || selectedCategories.length === 0}
              className="w-full"
              size="lg"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Continue"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}