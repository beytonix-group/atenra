#!/usr/bin/env bun

import { db } from "../src/server/db";
import { roles } from "../src/server/db/schema";
import { ROLES } from "../src/lib/auth/roles";
import { eq } from "drizzle-orm";

async function seedRoles() {
  console.log("🌱 Seeding roles...");
  
  const defaultRoles = [
    { name: ROLES.SUPER_ADMIN, description: "Super Administrator with full system access" },
    { name: ROLES.MANAGER, description: "Manager with elevated privileges" },
    { name: ROLES.EMPLOYEE, description: "Employee with standard work access" },
    { name: ROLES.USER, description: "Regular user with basic access" },
  ];

  for (const role of defaultRoles) {
    try {
      // Check if role already exists
      const existingRole = await db
        .select()
        .from(roles)
        .where(eq(roles.name, role.name))
        .get();
      
      if (existingRole) {
        console.log(`✓ Role '${role.name}' already exists`);
      } else {
        await db.insert(roles).values(role);
        console.log(`✓ Created role: ${role.name}`);
      }
    } catch (error) {
      console.error(`✗ Error creating role ${role.name}:`, error);
    }
  }
  
  console.log("✅ Role seeding complete!");
  
  // Show all roles
  const allRoles = await db.select().from(roles).all();
  console.log("\n📋 All roles in database:");
  allRoles.forEach((role: any) => {
    console.log(`  - ${role.name}: ${role.description}`);
  });
  
  process.exit(0);
}

seedRoles().catch((error) => {
  console.error("Failed to seed roles:", error);
  process.exit(1);
});