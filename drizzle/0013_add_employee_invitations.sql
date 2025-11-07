-- Create employee_invitations table
CREATE TABLE IF NOT EXISTS `employee_invitations` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `email` text NOT NULL,
  `company_id` integer NOT NULL,
  `user_id` integer,
  `token` text NOT NULL,
  `expires_at` integer NOT NULL,
  `status` text DEFAULT 'pending' NOT NULL,
  `created_at` integer DEFAULT (unixepoch()) NOT NULL,
  `accepted_at` integer,
  FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON UPDATE no action ON DELETE cascade,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);

-- Create indexes
CREATE INDEX `idx_ei_email_company` ON `employee_invitations` (`email`, `company_id`);
CREATE UNIQUE INDEX `idx_ei_token` ON `employee_invitations` (`token`);
CREATE INDEX `idx_ei_status` ON `employee_invitations` (`status`);
CREATE INDEX `idx_ei_company` ON `employee_invitations` (`company_id`);
CREATE INDEX `idx_ei_expires_at` ON `employee_invitations` (`expires_at`);
