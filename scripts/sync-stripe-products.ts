/**
 * Stripe Product Sync Script
 *
 * This script will:
 * 1. List all existing Stripe products in test mode
 * 2. Archive/delete old products
 * 3. Create new products matching current database plans
 * 4. Create prices for each product
 *
 * Usage: bun run scripts/sync-stripe-products.ts
 */

import Stripe from 'stripe';
import { readFileSync } from 'fs';
import { join } from 'path';

// Load environment variables from .dev.vars
try {
  const devVarsPath = join(process.cwd(), '.dev.vars');
  const devVars = readFileSync(devVarsPath, 'utf-8');

  devVars.split('\n').forEach(line => {
    const trimmedLine = line.trim();
    if (trimmedLine && !trimmedLine.startsWith('#')) {
      const [key, ...valueParts] = trimmedLine.split('=');
      const value = valueParts.join('=');
      if (key && value) {
        process.env[key.trim()] = value.trim();
      }
    }
  });
} catch (error) {
  console.warn('⚠️  Could not load .dev.vars file');
}

// Initialize Stripe with test mode key
const stripeTestKey = process.env.STRIPE_SECRET_KEY;

if (!stripeTestKey) {
  console.error('❌ STRIPE_SECRET_KEY environment variable is required');
  console.log('Add STRIPE_SECRET_KEY=sk_test_... to your .dev.vars file');
  process.exit(1);
}

const stripe = new Stripe(stripeTestKey, {
  apiVersion: '2024-12-18.acacia',
});

// Plans from database (excluding invite-only/custom plans)
const PLANS = [
  {
    id: 4,
    name: 'Student Plan',
    type: 'student',
    price: 1500, // in cents
    currency: 'usd',
    interval: 'month' as const,
    description: 'Affordable plan for students with essential features',
  },
  {
    id: 5,
    name: 'Basic Plan',
    type: 'regular',
    price: 3000,
    currency: 'usd',
    interval: 'month' as const,
    description: 'Essential features for individual professionals',
  },
  {
    id: 6,
    name: 'Premium Plan',
    type: 'regular',
    price: 12000,
    currency: 'usd',
    interval: 'month' as const,
    description: 'Advanced features for growing professionals',
  },
  {
    id: 7,
    name: 'Royal Plan',
    type: 'regular',
    price: 20000,
    currency: 'usd',
    interval: 'month' as const,
    description: 'Ultimate features with priority support',
  },
  {
    id: 9,
    name: 'Premium Business Partnership',
    type: 'business',
    price: 18000,
    currency: 'usd',
    interval: 'month' as const,
    description: 'Enterprise-level features for business teams',
  },
];

async function listExistingProducts() {
  console.log('📋 Listing existing Stripe products...\n');

  const products = await stripe.products.list({ limit: 100 });

  if (products.data.length === 0) {
    console.log('   No existing products found.\n');
    return [];
  }

  console.log(`   Found ${products.data.length} products:\n`);

  for (const product of products.data) {
    console.log(`   - ${product.name} (${product.id})`);
    console.log(`     Active: ${product.active}`);
    console.log(`     Created: ${new Date(product.created * 1000).toLocaleDateString()}`);
    console.log('');
  }

  return products.data;
}

async function archiveOldProducts(products: Stripe.Product[]) {
  console.log('🗑️  Archiving old products...\n');

  if (products.length === 0) {
    console.log('   No products to archive.\n');
    return;
  }

  for (const product of products) {
    if (product.active) {
      await stripe.products.update(product.id, { active: false });
      console.log(`   ✓ Archived: ${product.name}`);
    }
  }

  console.log('');
}

async function createNewProducts() {
  console.log('✨ Creating new Stripe products...\n');

  const results = [];

  for (const plan of PLANS) {
    try {
      // Create product
      const product = await stripe.products.create({
        name: plan.name,
        description: plan.description,
        metadata: {
          plan_id: plan.id.toString(),
          plan_type: plan.type,
        },
      });

      console.log(`   ✓ Created product: ${product.name} (${product.id})`);

      // Create price
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: plan.price,
        currency: plan.currency,
        recurring: {
          interval: plan.interval,
        },
        metadata: {
          plan_id: plan.id.toString(),
        },
      });

      console.log(`     ✓ Created price: $${plan.price / 100}/${plan.interval} (${price.id})`);
      console.log('');

      results.push({
        plan_id: plan.id,
        plan_name: plan.name,
        product_id: product.id,
        price_id: price.id,
      });
    } catch (error) {
      console.error(`   ❌ Error creating ${plan.name}:`, error);
      console.log('');
    }
  }

  return results;
}

async function printSummary(results: any[]) {
  console.log('📊 Summary\n');
  console.log('=' .repeat(80));
  console.log('');
  console.log('Plan ID | Plan Name                      | Product ID           | Price ID');
  console.log('-'.repeat(80));

  for (const result of results) {
    const planId = result.plan_id.toString().padEnd(7);
    const planName = result.plan_name.padEnd(30);
    const productId = result.product_id.padEnd(20);
    const priceId = result.price_id;

    console.log(`${planId} | ${planName} | ${productId} | ${priceId}`);
  }

  console.log('');
  console.log('=' .repeat(80));
  console.log('');
  console.log('🎉 Stripe product sync completed!');
  console.log('');
  console.log('Next steps:');
  console.log('1. Update your database with the Stripe product/price IDs if needed');
  console.log('2. Test the checkout flow with these new products');
  console.log('3. Verify in Stripe Dashboard: https://dashboard.stripe.com/test/products');
  console.log('');
}

async function main() {
  console.log('');
  console.log('🔄 Stripe Product Sync (Test Mode)');
  console.log('=' .repeat(80));
  console.log('');

  try {
    // Step 1: List existing products
    const existingProducts = await listExistingProducts();

    // Step 2: Archive old products
    await archiveOldProducts(existingProducts);

    // Step 3: Create new products
    const results = await createNewProducts();

    // Step 4: Print summary
    await printSummary(results);

  } catch (error) {
    console.error('❌ Error during sync:', error);
    process.exit(1);
  }
}

main();
