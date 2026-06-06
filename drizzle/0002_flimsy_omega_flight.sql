CREATE TABLE `chatLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` varchar(64) NOT NULL,
	`personaName` varchar(32) NOT NULL,
	`userMessage` text NOT NULL,
	`assistantReply` text NOT NULL,
	`escalated` boolean DEFAULT false,
	`isBusinessHours` boolean DEFAULT true,
	`visitorEmail` varchar(320),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `chatLogs_id` PRIMARY KEY(`id`)
);
