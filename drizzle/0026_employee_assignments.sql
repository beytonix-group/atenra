-- Employee Assignments table for round-robin tracking
CREATE TABLE IF NOT EXISTS `employee_assignments` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `employee_user_id` integer NOT NULL REFERENCES `users`(`id`) ON DELETE CASCADE,
  `assigned_to_user_id` integer NOT NULL REFERENCES `users`(`id`) ON DELETE CASCADE,
  `conversation_id` integer REFERENCES `conversations`(`id`) ON DELETE SET NULL,
  `user_request` text,
  `created_at` integer NOT NULL DEFAULT (unixepoch())
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS `idx_employee_assignments_employee` ON `employee_assignments` (`employee_user_id`);
CREATE INDEX IF NOT EXISTS `idx_employee_assignments_assigned_to` ON `employee_assignments` (`assigned_to_user_id`);
