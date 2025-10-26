-- Delete all existing plans and subscriptions
DELETE FROM subscriptions;
DELETE FROM plans;

-- Student Plan
INSERT INTO plans (
  name, plan_type, tagline, description, detailed_description,
  price, currency, billing_period,
  quick_view_json, industries_json,
  is_active, is_invite_only,
  has_promotion, promotion_percent_off, promotion_months,
  trial_days, has_refund_guarantee
) VALUES (
  'Student Plan',
  'student',
  'Built For: Students on a budget',
  'Join our exclusive network of verified service providers. Start with our risk-free 3-month trial.',
  'Juggling classes, work, and a social life can be overwhelming. This plan helps take some of the pressure off, giving you back time and peace of mind. We can simplify how you access the tools you need to balance your budget, get your meals sorted, and manage your time, so you can focus on acing your academic journey.',
  15.00,
  'USD',
  'monthly',
  '["Savings on Food & Rides", "Study & Budgeting tools", "Simplified Planning and Reminders", "Service from 9am-5pm", "Commission  only 5%"]',
  '["Education", "Food", "Transportation"]',
  1,
  0,
  1,
  50,
  3,
  0,
  0
);

-- Regular Plans: Basic
INSERT INTO plans (
  name, plan_type, tagline, description, detailed_description,
  price, currency, billing_period,
  quick_view_json, industries_json,
  is_active, is_invite_only,
  has_promotion, promotion_percent_off, promotion_months,
  trial_days, has_refund_guarantee
) VALUES (
  'Basic Plan',
  'regular',
  'Built For: Everyday individuals, freelancers, or part-timers',
  'Perfect for individuals who want a helping hand with life''s small tasks.',
  'Perfect for individuals who want a helping hand with life''s small tasks. It''s about more than just saving time—it''s about saving your energy for the things that really matter. Consider it your personal sidekick for staying on track and getting things done.',
  29.99,
  'USD',
  'monthly',
  '["Appointment/Reservation assistance", "Food & Transport savings", "Entry-level access to all industry services", "Facilitated Online orders", "V1 Atenra AI", "Service from 9am-5pm", "Commission  only 7%"]',
  '["Lifestyle", "Productivity", "Errands"]',
  1,
  0,
  1,
  50,
  3,
  0,
  0
);

-- Regular Plans: Premium
INSERT INTO plans (
  name, plan_type, tagline, description, detailed_description,
  price, currency, billing_period,
  quick_view_json, industries_json,
  is_active, is_invite_only,
  has_promotion, promotion_percent_off, promotion_months,
  trial_days, has_refund_guarantee
) VALUES (
  'Premium Plan',
  'regular',
  'Built For: Families and busy professionals',
  'This is for people ready to offload some of their work...',
  'This is for people ready to offload some of their work and take convenience to the next level. It''s for the average family that needs more weekend time together ,or the professional who wants to focus on their craft. We handle the extra work, so you can focus on the things you care about most.',
  149.99,
  'USD',
  'monthly',
  '["Everything in Basic", "Advanced Agents assigned", "Intermediate-level access to all industry services", "Faster response time", "Basic Miscellaneous requests", "V2 Atenra AI", "Service from 8am-8pm", "Commission  only 5%"]',
  '["Family Support", "Personal Growth"]',
  1,
  0,
  0,
  NULL,
  NULL,
  0,
  0
);

-- Regular Plans: Royal
INSERT INTO plans (
  name, plan_type, tagline, description, detailed_description,
  price, currency, billing_period,
  quick_view_json, industries_json,
  is_active, is_invite_only,
  has_promotion, promotion_percent_off, promotion_months,
  trial_days, has_refund_guarantee
) VALUES (
  'Royal Plan',
  'regular',
  'Built For: Larger families, influencers, high-maintainance individuals',
  'Where comfort truly meets your daily life, here can you hand-off the busywork and mundane chores...',
  'Where comfort truly meets your daily life, here can you hand-off the busywork and mundane chores to the advanced, premium agents and do so quickly. We become a seamless extension of your daily life, taking on most things to make sure you maximize the most of your day.',
  250.00,
  'USD',
  'monthly',
  '["Everything in Premium", "Premium-selected Agents assigned", "Priority response time", "Full-access to all industry services", "Intermediate Miscellaneous requests", "Service from 7am-11pm", "Commission  only 3%"]',
  '["Concierge", "Executive Assistance", "Premium Services"]',
  1,
  0,
  0,
  NULL,
  NULL,
  0,
  0
);

-- Regular Plans: ☐☐☐ (Invite Only)
INSERT INTO plans (
  name, plan_type, tagline, description, detailed_description,
  price, currency, billing_period,
  quick_view_json, industries_json,
  is_active, is_invite_only,
  has_promotion, promotion_percent_off, promotion_months,
  trial_days, has_refund_guarantee
) VALUES (
  '☐☐☐ Plan',
  'regular',
  'The world at your fingertips, with unlimited possibilities.',
  'Built For: Legacy Families, VIP''s, and investors ',
  'This is a lifestyle designed around you. From the moment you wake up, our dedicated team is at your service, managing everything from your daily schedule to arranging others remotely. We work tirelessly to ensure your day-to-day is effortless and your able to focus on your goals.',
  0.00,
  'USD',
  'monthly',
  '["Everything in Royal", "Dedicated team of Agents", "Direct phone line", "All Miscellaneous requests", "V3 Atenra AI", "24/7 Service", "Commission  ≤1%"]',
  '["Luxury", "Bespoke Lifestyle Management", "Global priority service", "Absolute Priority"]',
  1,
  1,
  0,
  NULL,
  NULL,
  0,
  0
);

-- Business Plan
INSERT INTO plans (
  name, plan_type, tagline, description, detailed_description,
  price, currency, billing_period,
  quick_view_json, industries_json,
  is_active, is_invite_only,
  has_promotion, promotion_percent_off, promotion_months,
  trial_days, has_refund_guarantee
) VALUES (
  'Premium Business Partnership',
  'business',
  'Built For: All businesses',
  'Join our exclusive network of verified service providers. Start with our risk-free 3-month trial.',
  'Atenra''s verified partner ecosystem connects service providers with vetted clients. Gives professionals visibility, analytics, and a direct referral channel backed by a transparent refund policy.',
  189.99,
  'USD',
  'monthly',
  '["Individualized terms", "Client referral dashboard", "Analytics + support", "Renewal of contract after Trial ends, based on preformance"]',
  '["All professional service providers"]',
  1,
  0,
  0,
  NULL,
  NULL,
  90,
  1
);
