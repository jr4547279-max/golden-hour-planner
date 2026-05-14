CREATE TABLE `availability_windows` (
	`id` varchar(36) NOT NULL,
	`userId` int NOT NULL,
	`groupId` varchar(36) NOT NULL,
	`startTime` timestamp NOT NULL,
	`endTime` timestamp NOT NULL,
	`source` varchar(32) NOT NULL,
	`timezone` varchar(64) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `availability_windows_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `calendar_connections` (
	`id` varchar(36) NOT NULL,
	`userId` int NOT NULL,
	`provider` varchar(32) NOT NULL,
	`accessToken` text NOT NULL,
	`refreshToken` text,
	`expiresAt` timestamp,
	`email` varchar(320),
	`lastSynced` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `calendar_connections_id` PRIMARY KEY(`id`),
	CONSTRAINT `calendar_connections_user_provider_unique` UNIQUE(`userId`,`provider`)
);
--> statement-breakpoint
CREATE TABLE `group_members` (
	`id` varchar(36) NOT NULL,
	`groupId` varchar(36) NOT NULL,
	`userId` int NOT NULL,
	`role` enum('admin','member') NOT NULL DEFAULT 'member',
	`joinedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `group_members_id` PRIMARY KEY(`id`),
	CONSTRAINT `group_members_group_user_unique` UNIQUE(`groupId`,`userId`)
);
--> statement-breakpoint
CREATE TABLE `groups` (
	`id` varchar(36) NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `groups_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_preferences` (
	`id` varchar(36) NOT NULL,
	`userId` int NOT NULL,
	`maxSpend` int,
	`maxTravelDistance` int,
	`cuisines` text,
	`dietaryRestrictions` text,
	`preferredDays` text,
	`vibes` text,
	`homeLat` varchar(32),
	`homeLng` varchar(32),
	`timezone` varchar(64),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_preferences_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_preferences_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE INDEX `availability_windows_userGroup_idx` ON `availability_windows` (`userId`,`groupId`);--> statement-breakpoint
CREATE INDEX `availability_windows_groupStart_idx` ON `availability_windows` (`groupId`,`startTime`);--> statement-breakpoint
CREATE INDEX `calendar_connections_userId_idx` ON `calendar_connections` (`userId`);--> statement-breakpoint
CREATE INDEX `group_members_groupId_idx` ON `group_members` (`groupId`);--> statement-breakpoint
CREATE INDEX `group_members_userId_idx` ON `group_members` (`userId`);--> statement-breakpoint
CREATE INDEX `groups_createdBy_idx` ON `groups` (`createdBy`);--> statement-breakpoint
CREATE INDEX `user_preferences_userId_idx` ON `user_preferences` (`userId`);