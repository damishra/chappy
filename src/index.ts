import dotenv from "dotenv";
import WebSocket from "ws";
import type { RawData } from "ws";
import logger from "./logger";
import { Database } from "sqlite3";

const database = new Database("chappy.db");

dotenv.config({ path: "chappy.conf" });

database.serialize(() => {
	database.exec(`CREATE TABLE IF NOT EXISTS channels (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(25) NOT NULL UNIQUE,
        enabled INTEGER NOT NULL DEFAULT 0,
        privilege INTEGER NOT NULL DEFAULT 0
    )`);
	database.exec(`CREATE TABLE IF NOT EXISTS commands (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        command VARCHAR(255),
        response TEXT NOT NULL,
        channel INTEGER NOT NULL DEFAULT 0,
        cooldown INTEGER NOT NULL DEFAULT 10,
        privilege INTEGER NOT NULL DEFAULT 0,
        FOREIGN KEY(channel) REFERENCES channels(id) ON DELETE CASCADE ON UPDATE CASCADE,
        UNIQUE(channel, command) ON CONFLICT REPLACE
    )`);
	database.exec(`CREATE TABLE IF NOT EXISTS moderators (
        channel INTEGER NOT NULL,
        moderator INTEGER NOT NULL,
        FOREIGN KEY(channel) REFERENCES channels(id) ON DELETE CASCADE ON UPDATE CASCADE,
        FOREIGN KEY(moderator) REFERENCES channels(id) ON DELETE CASCADE ON UPDATE CASCADE,
        UNIQUE(channel, moderator) ON CONFLICT REPLACE
    )`);
});

const socket = new WebSocket("wss://irc-ws.chat.twitch.tv:443", {
	handshakeTimeout: 2147483647,
});

const connect = (socket: WebSocket) => {
	logger.info("connecting to wss://irc-ws.chat.twitch.tv:443");
	socket.send(`PASS ${process.env["TWITCH_OAUTH_TOKEN"]}`);
	socket.send(`NICK ${process.env["TWITCH_USERNAME"]}`);
	socket.send(`JOIN #${process.env["TWITCH_USERNAME"]}`);
};

socket.on("open", () => connect(socket));
socket.on("ping", () => socket.pong("tmi.twitch.tv"));

const responder = (message: RawData, socket: WebSocket) => {
	const data = message.toString().trim();
	if (data.split(" ")[0] === "PING") {
		logger.ping("server ping");
		socket.send("PONG :tmi.twitch.tv");
		logger.pong("client pong");
	}
	switch (data.split(" ")[1]) {
		case "001":
			logger.info("connected successfully");
			break;
		case "JOIN":
			logger.info(
				`joining channel #${data.split("#")[1]?.split("\n")[0]?.trim()}`
			);
			break;
		case "PRIVMSG":
			const user = data.split("!")[0]?.slice(1);
			const channel = data.split("#")[1]?.split(" ")[0];
			const message = data.split(":").slice(2).join(":");
			if (message.startsWith("!")) {
			} else {
				logger.message(`#${channel} ${user}: ${message}`);
			}
			break;
		case "353":
			logger.info(
				`successfully joined channel ${data
					.split("=")[1]
					?.split(":")[0]
					?.trim()}`
			);
			break;
		default:
			break;
	}
};

socket.on("message", message => responder(message, socket));
