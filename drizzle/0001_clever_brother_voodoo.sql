CREATE TABLE `rooms` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`room_number` text NOT NULL,
	`owner_name` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `rooms_room_number_unique` ON `rooms` (`room_number`);--> statement-breakpoint
CREATE TABLE `water_readings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`room_id` integer NOT NULL,
	`month` text NOT NULL,
	`last_month` real DEFAULT 0 NOT NULL,
	`this_month` real DEFAULT 0 NOT NULL,
	`usage` real DEFAULT 0 NOT NULL,
	`price_per_unit` real DEFAULT 5 NOT NULL,
	`total_price` real DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`room_id`) REFERENCES `rooms`(`id`) ON UPDATE no action ON DELETE no action
);
