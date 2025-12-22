import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { serviceCategories } from "@/server/db/schema";
import { eq, asc } from "drizzle-orm";


// GET - Fetch all active service categories with hierarchy
export async function GET() {
  try {
    const categories = await db
      .select({
        id: serviceCategories.id,
        name: serviceCategories.name,
        description: serviceCategories.description,
        parentId: serviceCategories.parentId,
        sortOrder: serviceCategories.sortOrder,
      })
      .from(serviceCategories)
      .where(eq(serviceCategories.isActive, 1))
      .orderBy(asc(serviceCategories.sortOrder), asc(serviceCategories.name))
      .all();

    // Build hierarchy structure
    const categoryMap = new Map();
    const rootCategories: any[] = [];

    // First pass: create a map of all categories
    categories.forEach(cat => {
      categoryMap.set(cat.id, { ...cat, children: [] });
    });

    // Second pass: build the hierarchy
    categories.forEach(cat => {
      const category = categoryMap.get(cat.id);
      if (cat.parentId) {
        const parent = categoryMap.get(cat.parentId);
        if (parent) {
          parent.children.push(category);
        } else {
          // If parent not found, treat as root
          rootCategories.push(category);
        }
      } else {
        rootCategories.push(category);
      }
    });

    // Flatten hierarchy for display with indentation markers
    const flattenedCategories: any[] = [];

    const flatten = (categories: any[], level = 0, parentName = ''): void => {
      categories.forEach(cat => {
        flattenedCategories.push({
          id: cat.id,
          name: cat.name,
          description: cat.description,
          parentId: cat.parentId,
          level,
          parentName,
        });
        if (cat.children && cat.children.length > 0) {
          flatten(cat.children, level + 1, cat.name);
        }
      });
    };

    flatten(rootCategories);

    return NextResponse.json({ categories: flattenedCategories });
  } catch (error) {
    console.error("Fetch categories error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}