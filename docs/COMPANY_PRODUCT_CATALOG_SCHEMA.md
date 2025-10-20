# Company Product/Service Catalog Schema

## Overview
This schema enables each company to maintain their own catalog of products and services with customizable pricing, variants, add-ons, and availability schedules.

## Database Tables

### 1. `company_products` (Main Product/Service Table)

The core table storing all products and services offered by companies.

**Key Features:**
- Support for both physical products and services
- Multiple pricing types: fixed, hourly, custom, or quote-based
- Inventory tracking (optional)
- Public marketplace visibility control
- Rich media support (images, galleries)
- SEO fields for marketplace optimization

**Fields:**
- `id` - Primary key
- `company_id` - Foreign key to companies table
- `name` - Product/service name
- `slug` - URL-friendly identifier (unique per company)
- `description` - Detailed description
- `category_id` - Foreign key to service_categories
- `product_type` - Either 'service' or 'product'
- `base_price` - Base price (can be null for custom pricing)
- `currency` - Default: USD
- `pricing_type` - 'fixed', 'hourly', 'custom', or 'quote'
- `duration_minutes` - For hourly services
- `is_active` - Product availability
- `is_featured` - Featured in marketplace
- `is_public` - Visible in public marketplace
- `sku` - Stock Keeping Unit
- `stock_quantity` - Current inventory
- `track_inventory` - Enable inventory tracking
- `image_url` - Primary image
- `gallery_urls` - JSON array of additional images
- `requirements` - What customer needs to provide
- `inclusions` - What's included
- `exclusions` - What's NOT included
- `terms_and_conditions` - Legal terms
- `meta_title`, `meta_description`, `meta_keywords` - SEO fields
- `metadata` - JSON for flexible additional data
- `created_by_user_id` - User who created the product

**Indexes:**
- `idx_company_products_company` - Fast company lookups
- `idx_company_products_category` - Category filtering
- `idx_company_products_active` - Active & public products
- `idx_company_products_featured` - Featured products only

---

### 2. `company_product_variants`

Allows products to have different options (sizes, packages, etc.).

**Use Cases:**
- T-shirt sizes (S, M, L, XL)
- Service packages (Basic, Standard, Premium)
- Product colors or configurations

**Fields:**
- `id` - Primary key
- `product_id` - Foreign key to company_products
- `name` - Variant name (e.g., "Large", "Premium Package")
- `description` - Variant description
- `price` - Price for this variant (overrides base price)
- `compare_at_price` - Original price for showing discounts
- `sku` - Unique SKU for this variant
- `stock_quantity` - Inventory for this variant
- `attributes` - JSON for flexible attributes: `{"size": "M", "color": "Blue"}`
- `sort_order` - Display order
- `is_active` - Availability

**Example:**
```json
Product: "Web Design Service"
Variants:
  - Basic Package: $500
  - Standard Package: $1000
  - Premium Package: $2500
```

---

### 3. `company_product_pricing_tiers`

Enables tiered pricing based on quantity or membership level.

**Use Cases:**
- Bulk discounts (1-10 units: $100, 11-50 units: $90)
- Membership pricing (Free users: $50, Pro users: $40)
- Volume pricing for services

**Fields:**
- `id` - Primary key
- `product_id` - Foreign key to company_products
- `tier_name` - Name of the tier
- `description` - Tier description
- `price` - Price for this tier
- `min_quantity` - Minimum quantity for bulk pricing
- `max_quantity` - Maximum quantity
- `required_plan_id` - Optional: requires specific subscription plan
- `sort_order` - Display order

**Example:**
```json
Product: "Logo Design"
Pricing Tiers:
  - Tier: "1-5 logos" → $100 each
  - Tier: "6-20 logos" → $85 each
  - Tier: "21+ logos" → $70 each
```

---

### 4. `company_product_addons`

Optional extras or add-ons for products/services.

**Use Cases:**
- Express delivery (+$20)
- Rush service (+50%)
- Premium materials (+$100)
- Additional revisions (+$25)

**Fields:**
- `id` - Primary key
- `product_id` - Foreign key to company_products
- `name` - Add-on name
- `description` - Add-on description
- `price` - Add-on price
- `pricing_type` - 'fixed' or 'percentage'
- `is_required` - Must be selected
- `max_quantity` - Maximum quantity allowed
- `sort_order` - Display order

**Example:**
```json
Product: "Website Hosting"
Add-ons:
  - SSL Certificate: $50/year (required)
  - CDN Service: $20/month
  - Backup Service: $10/month
  - 24/7 Support: $100/month
```

---

### 5. `company_product_reviews`

Customer reviews and ratings for marketplace functionality.

**Features:**
- 5-star rating system
- Review moderation (approval required)
- Verified purchase badge
- Company response capability
- Media attachments (images)

**Fields:**
- `id` - Primary key
- `product_id` - Foreign key to company_products
- `user_id` - Foreign key to users
- `rating` - 1-5 stars
- `title` - Review title
- `comment` - Review text
- `image_urls` - JSON array of review images
- `is_verified_purchase` - Verified buyer badge
- `is_approved` - Moderation status
- `is_featured` - Highlighted review
- `company_response` - Company's response
- `company_response_at` - Response timestamp

**Constraint:** One review per user per product

---

### 6. `company_product_availability`

Scheduling and availability for service-based products.

**Use Cases:**
- Appointment-based services
- Booking time slots
- Operating hours
- Capacity management

**Fields:**
- `id` - Primary key
- `product_id` - Foreign key to company_products
- `day_of_week` - 0 (Sunday) to 6 (Saturday)
- `start_time` - Minutes from midnight (e.g., 540 = 9:00 AM)
- `end_time` - Minutes from midnight (e.g., 1020 = 5:00 PM)
- `max_bookings` - Capacity for this time slot
- `is_active` - Availability status

**Example:**
```json
Service: "Hair Salon Appointment"
Availability:
  - Monday: 9:00 AM - 5:00 PM (max 4 bookings/hour)
  - Tuesday: 9:00 AM - 5:00 PM (max 4 bookings/hour)
  - Wednesday: Closed
  - Thursday-Saturday: 9:00 AM - 7:00 PM (max 6 bookings/hour)
```

---

### 7. `company_product_tags`

Flexible tagging system for categorization and filtering.

**Use Cases:**
- Seasonal tags (Summer, Winter, Holiday)
- Feature tags (Eco-Friendly, Handmade, Local)
- Difficulty tags (Beginner, Advanced)

**Fields:**
- `id` - Primary key
- `company_id` - Foreign key to companies
- `name` - Tag name
- `slug` - URL-friendly identifier
- `description` - Tag description
- `color` - Hex color for UI display

---

### 8. `company_product_tag_relations`

Many-to-many relationship between products and tags.

**Fields:**
- `product_id` - Foreign key to company_products
- `tag_id` - Foreign key to company_product_tags

---

## Usage Examples

### Example 1: Simple Service
```sql
-- Lawn Mowing Service
INSERT INTO company_products (
    company_id, name, slug, description,
    product_type, base_price, pricing_type
) VALUES (
    1, 'Lawn Mowing', 'lawn-mowing',
    'Professional lawn mowing service for residential properties',
    'service', 50.00, 'fixed'
);
```

### Example 2: Product with Variants
```sql
-- T-Shirt with sizes
INSERT INTO company_products (
    company_id, name, slug, product_type, base_price
) VALUES (
    1, 'Premium Cotton T-Shirt', 'premium-tshirt', 'product', 25.00
);

INSERT INTO company_product_variants (product_id, name, price, sku) VALUES
    (1, 'Small', 25.00, 'TSH-S'),
    (1, 'Medium', 25.00, 'TSH-M'),
    (1, 'Large', 25.00, 'TSH-L'),
    (1, 'X-Large', 28.00, 'TSH-XL');
```

### Example 3: Service with Add-ons
```sql
-- Website Design with add-ons
INSERT INTO company_products (
    company_id, name, slug, product_type, base_price
) VALUES (
    1, 'Website Design', 'website-design', 'service', 1500.00
);

INSERT INTO company_product_addons (product_id, name, price, pricing_type) VALUES
    (1, 'Rush Delivery (1 week)', 500.00, 'fixed'),
    (1, 'E-commerce Integration', 800.00, 'fixed'),
    (1, 'SEO Optimization', 300.00, 'fixed'),
    (1, 'Content Writing', 50.00, 'percentage');
```

### Example 4: Tiered Pricing
```sql
-- Bulk printing service
INSERT INTO company_products (
    company_id, name, slug, product_type, pricing_type
) VALUES (
    1, 'Business Card Printing', 'business-cards', 'product', 'custom'
);

INSERT INTO company_product_pricing_tiers (product_id, tier_name, price, min_quantity, max_quantity) VALUES
    (1, '100-250 cards', 50.00, 100, 250),
    (1, '251-500 cards', 40.00, 251, 500),
    (1, '501-1000 cards', 35.00, 501, 1000),
    (1, '1000+ cards', 30.00, 1001, NULL);
```

## Integration with Existing Tables

### Relationships:
- `company_products.company_id` → `companies.id`
- `company_products.category_id` → `service_categories.id`
- `company_products.created_by_user_id` → `users.id`
- `company_product_pricing_tiers.required_plan_id` → `plans.id`
- `company_product_reviews.user_id` → `users.id`

## API Endpoints to Build

Recommended API endpoints for this schema:

### Product Management (Company Admin)
- `GET /api/company/products` - List company's products
- `POST /api/company/products` - Create new product
- `GET /api/company/products/:id` - Get product details
- `PUT /api/company/products/:id` - Update product
- `DELETE /api/company/products/:id` - Delete product

### Variants
- `POST /api/company/products/:id/variants` - Add variant
- `PUT /api/company/products/:id/variants/:variantId` - Update variant
- `DELETE /api/company/products/:id/variants/:variantId` - Delete variant

### Pricing Tiers
- `POST /api/company/products/:id/pricing-tiers` - Add pricing tier
- `PUT /api/company/products/:id/pricing-tiers/:tierId` - Update tier
- `DELETE /api/company/products/:id/pricing-tiers/:tierId` - Delete tier

### Public Marketplace
- `GET /api/marketplace/products` - Browse all public products
- `GET /api/marketplace/products/:id` - Product details
- `GET /api/marketplace/companies/:companyId/products` - Company's products
- `GET /api/marketplace/categories/:categoryId/products` - Products by category

### Reviews
- `POST /api/products/:id/reviews` - Submit review
- `GET /api/products/:id/reviews` - Get product reviews
- `PUT /api/company/products/:id/reviews/:reviewId/response` - Company response

## Best Practices

1. **Always use transactions** when creating products with variants/add-ons
2. **Validate pricing** - Ensure prices are positive and currency is valid
3. **Check inventory** before allowing purchases if `track_inventory` is enabled
4. **Cache product data** - Products don't change frequently
5. **Index properly** - Use the provided indexes for performance
6. **Soft delete** - Consider adding `deleted_at` field instead of hard deletes
7. **Version pricing** - Consider storing pricing history for auditing

## Migration Applied

✅ Migration `0011_add_company_product_catalog.sql` successfully applied to:
- Remote database (production)
- Local database (development)

Created 8 new tables and 16 indexes with automatic timestamp triggers.
