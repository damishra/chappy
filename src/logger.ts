import { appendFileSync } from "fs";

type LogLevel = "MSSG" | "INFO" | "WARN" | "CRIT" | "PING" | "PONG";

function log(level: LogLevel, message: string) {
	appendFileSync(
		`./logs/${(new Date().valueOf() / (900 * 1000)).toFixed(0)}.log`,
		`${new Date().toISOString()} ${level} ${message}\n`,
		"utf8"
	);
}

export default {
	message: (message: string) => log("MSSG", message),
	info: (message: string) => log("INFO", message),
	warn: (message: string) => log("WARN", message),
	critical: (message: string) => log("CRIT", message),
	ping: (message: string) => log("PING", message),
	pong: (message: string) => log("PONG", message),
};
