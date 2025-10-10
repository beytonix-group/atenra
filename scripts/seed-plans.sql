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
  'Juggling classes, work, and a social life is a lot. This plan helps take some of the pressure off, giving you back time and peace of mind. We pull together all the tools you need to balance your budget, get your meals sorted, and manage your time, so you can focus on acing your academic journey.',
  15.00,
  'USD',
  'monthly',
  '["Save on essentials (food, rides)", "Study & finance tools", "Simplified planning and reminders"]',
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
  'Perfect for individuals who want a helping hand with life''s little tasks.',
  'Perfect for individuals who want a helping hand with life''s little tasks. It''s about more than just saving time—it''s about saving your energy for the things that really matter. Consider it your personal sidekick for staying on track and getting things done.',
  30.00,
  'USD',
  'monthly',
  '["Daily task support", "Smart reminders", "Personal planning"]',
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
  'This is the upgrade for people ready to take convenience to the next level.',
  'This is the upgrade for people ready to take convenience to the next level. It''s for the family that needs more weekend time together or the professional who wants to focus on a new passion. We handle the extra work, so you can focus on the things you care about most.',
  120.00,
  'USD',
  'monthly',
  '["Everything in Basic", "Faster response, personal assistance", "Adaptive automations"]',
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
  'Built For: Executives and high achievers',
  'Imagine a solid step up in convenience, week after week.',
  'Imagine a solid step up in convenience, week after week. With a dedicated agent and specialized teams, we become a seamless extension of your daily life. This is the plan for those who need a consistent, behind-the-scenes team to manage the details, allowing for maximum focus on what drives them.',
  200.00,
  'USD',
  'monthly',
  '["Dedicated Atenra agent", "On-demand support team", "Concierge-level access"]',
  '["Concierge", "Executive Assistance"]',
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
  'A world of possibilities, crafted just for you.',
  'Built For: Discerning individuals and institutions',
  'This is a lifestyle designed around you. From the moment you wake up, our dedicated team is at your service, managing everything from your daily schedule to planning bespoke global excursions. We work tirelessly to ensure your day-to-day is effortless and your biggest ambitions are realized.',
  0.00,
  'USD',
  'monthly',
  '["24/7 concierge lifestyle", "Global travel/event support", "Bespoke management teams"]',
  '["Luxury", "Bespoke Lifestyle Management", "Global Excursions", "Family Office"]',
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
  180.00,
  'USD',
  'monthly',
  '["Verified provider listing", "Client referral dashboard", "Analytics + support"]',
  '["All professional service providers"]',
  1,
  0,
  0,
  NULL,
  NULL,
  90,
  1
);
