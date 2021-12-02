import type { Database } from "sqlite3";

type cmmdpriv =
	| "ALL"
	| "FOLLOWER"
	| "SUBSCRIBER"
	| "MODERATOR"
	| "BROADCASTER"
	| "SELF";

type chanpriv = "MODERATOR" | "BROADCASTER" | "SELF";

export function addChannel(
	channel: string,
	enabled: number,
	database: Database
) {
	database.parallelize(() =>
		database.run(
			`INSERT INTO channels (channel, enabled) VALUES ($channel, $enabled)`,
			{ channel, enabled }
		)
	);
}

export function enableChannel(channel: string, database: Database) {
	database.parallelize(() =>
		database.run(
			`UPDATE channels SET enabled = 1 WHERE channel = $channel`,
			{ channel }
		)
	);
}

export function disableChannel(channel: string, database: Database) {
	database.parallelize(() =>
		database.run(
			`UPDATE channels SET enabled = 0 WHERE channel = $channel`,
			{ channel }
		)
	);
}

export function removeChannel(channel: string, database: Database) {
	database.parallelize(() =>
		database.run(`DELETE FROM channels WHERE channel = $channel`, {
			channel,
		})
	);
}

export function addModerator(
	channel: string,
	moderator: string,
	database: Database
) {
	database.parallelize(() =>
		database.run(
			`INSERT INTO moderators (channel, moderator) VALUES ($channel, $moderator)`,
			{ channel, moderator }
		)
	);
}

export function addModerators(
	channel: string,
	moderators: string[],
	database: Database
) {
	moderators.map(moderator => addModerator(channel, moderator, database));
}

export function addCommand(
	command: string,
	response: string,
	cooldown: number,
	privlege: cmmdpriv,
	channel: string,
	database: Database
) {}
