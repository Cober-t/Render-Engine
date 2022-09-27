#pragma once

namespace Cober {

	enum LogType {
		LOG_INFO, LOG_WARNING, LOG_ERROR
	};

	struct LogEntry {
		LogType type;
		std::string message;
	};

	class Logger {
	public:
		static std::vector<LogEntry> messages;
		static void Log(const std::string& message);
		static void Error(const std::string& message);
	};
}