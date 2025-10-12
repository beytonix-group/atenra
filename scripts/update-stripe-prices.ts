/**
 * Update Stripe Prices and Create Promotional Coupons
 *
 * This script will:
 * 1. Update Student Plan price from $15 to $30
 * 2. Update Basic Plan price from $30 to $60
 * 3. Create promotional coupons for 50% off first 3 months
 *
 * Usage: bun run scripts/update-stripe-prices.ts
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

const stripeTestKey = process.env.STRIPE_SECRET_KEY;

if (!stripeTestKey) {
  console.error('❌ STRIPE_SECRET_KEY environment variable is required');
  process.exit(1);
}

const stripe = new Stripe(stripeTestKey, {
  apiVersion: '2024-12-18.acacia',
});

// Current Stripe IDs from the previous sync
const STRIPE_PRODUCTS = {
  studentPlan: {
    productId: 'prod_TDee216kYzRrGE',
    oldPriceId: 'price_1SHDLYLBeHmjMLrjqhlSEFHG',
    newPrice: 3000, // $30 in cents
    planId: 4,
    name: 'Student Plan',
  },
  basicPlan: {
    productId: 'prod_TDeeaxhcWYhjKT',
    oldPriceId: 'price_1SHDLZLBeHmjMLrjAV9ER3xb',
    newPrice: 6000, // $60 in cents
    planId: 5,
    name: 'Basic Plan',
  },
};

async function updateProductPrices() {
  console.log('');
  console.log('💰 Updating Stripe Product Prices');
  console.log('=' .repeat(80));
  console.log('');

  const results = [];

  for (const [key, product] of Object.entries(STRIPE_PRODUCTS)) {
    console.log(`📦 Processing: ${product.name}`);
    console.log('');

    try {
      // Archive old price
      await stripe.prices.update(product.oldPriceId, {
        active: false,
      });
      console.log(`   ✓ Archived old price: ${product.oldPriceId}`);

      // Create new price
      const newPrice = await stripe.prices.create({
        product: product.productId,
        unit_amount: product.newPrice,
        currency: 'usd',
        recurring: {
          interval: 'month',
        },
        metadata: {
          plan_id: product.planId.toString(),
        },
      });

      console.log(`   ✓ Created new price: $${product.newPrice / 100}/month (${newPrice.id})`);
      console.log('');

      results.push({
        planId: product.planId,
        planName: product.name,
        productId: product.productId,
        oldPriceId: product.oldPriceId,
        newPriceId: newPrice.id,
        newPrice: product.newPrice,
      });
    } catch (error) {
      console.error(`   ❌ Error updating ${product.name}:`, error);
      console.log('');
    }
  }

  return results;
}

async function createPromotionalCoupons() {
  console.log('🎟️  Creating Promotional Coupons');
  console.log('=' .repeat(80));
  console.log('');

  const coupons = [];

  try {
    // Check if coupons already exist
    const existingCoupons = await stripe.coupons.list({ limit: 100 });
    const studentCoupon = existingCoupons.data.find(c => c.id === 'STUDENT50');
    const basicCoupon = existingCoupons.data.find(c => c.id === 'BASIC50');

    // Create Student Plan coupon (50% off for 3 months)
    if (!studentCoupon) {
      const studentCouponObj = await stripe.coupons.create({
        id: 'STUDENT50',
        name: 'Student Plan - 50% Off First 3 Months',
        percent_off: 50,
        duration: 'repeating',
        duration_in_months: 3,
        metadata: {
          plan_id: '4',
          plan_name: 'Student Plan',
        },
      });

      console.log(`   ✓ Created coupon: ${studentCouponObj.id} (50% off for 3 months)`);
      coupons.push(studentCouponObj);
    } else {
      console.log(`   ℹ️  Coupon STUDENT50 already exists`);
      coupons.push(studentCoupon);
    }

    // Create Basic Plan coupon (50% off for 3 months)
    if (!basicCoupon) {
      const basicCouponObj = await stripe.coupons.create({
        id: 'BASIC50',
        name: 'Basic Plan - 50% Off First 3 Months',
        percent_off: 50,
        duration: 'repeating',
        duration_in_months: 3,
        metadata: {
          plan_id: '5',
          plan_name: 'Basic Plan',
        },
      });

      console.log(`   ✓ Created coupon: ${basicCouponObj.id} (50% off for 3 months)`);
      coupons.push(basicCouponObj);
    } else {
      console.log(`   ℹ️  Coupon BASIC50 already exists`);
      coupons.push(basicCoupon);
    }

    console.log('');

  } catch (error) {
    console.error('   ❌ Error creating coupons:', error);
    console.log('');
  }

  return coupons;
}

async function printSummary(priceResults: any[], coupons: any[]) {
  console.log('📊 Summary');
  console.log('=' .repeat(80));
  console.log('');

  console.log('Updated Prices:');
  console.log('-'.repeat(80));
  for (const result of priceResults) {
    console.log(`${result.planName}`);
    console.log(`  Product ID: ${result.productId}`);
    console.log(`  Old Price ID: ${result.oldPriceId} (archived)`);
    console.log(`  New Price ID: ${result.newPriceId}`);
    console.log(`  Price: $${result.newPrice / 100}/month`);
    console.log('');
  }

  console.log('Promotional Coupons:');
  console.log('-'.repeat(80));
  for (const coupon of coupons) {
    console.log(`${coupon.id} - ${coupon.name}`);
    console.log(`  ${coupon.percent_off}% off for ${coupon.duration_in_months} months`);
    console.log('');
  }

  console.log('=' .repeat(80));
  console.log('');
  console.log('✅ Price updates and coupon creation completed!');
  console.log('');
  console.log('Next steps:');
  console.log('1. Update your checkout flow to apply coupons automatically:');
  console.log('   - Student Plan: Apply coupon "STUDENT50" at checkout');
  console.log('   - Basic Plan: Apply coupon "BASIC50" at checkout');
  console.log('2. After 3 months, Stripe will automatically charge the full price');
  console.log('3. Verify in Stripe Dashboard: https://dashboard.stripe.com/test/coupons');
  console.log('');
}

async function main() {
  try {
    const priceResults = await updateProductPrices();
    const coupons = await createPromotionalCoupons();
    await printSummary(priceResults, coupons);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();
