#include "pch.h"
#include "Logger.h"

namespace Cober {

	std::vector<LogEntry> Logger::messages;

	void Logger::Log(const std::string& message) {
		LogEntry logEntry;
		logEntry.type = LOG_INFO;
		logEntry.message = message;
		//std::string fileName = __FILE__;
		//fileName = fileName.substr(fileName.find_last_of("/\\") + 1);
		//std::cout << "\x1B[32m" << "LOG: [" << fileName << " " << "Line: " << __LINE__ << "] --- " << logEntry.message << "\033[0m" << std::endl;
		std::cout << "\x1B[32m" << " --- LOG: [" << logEntry.message << "]  " << "\033[0m" << std::endl;
		messages.push_back(logEntry);
	}

	void Logger::Error(const std::string& message) {
		LogEntry logEntry;
		logEntry.type = LOG_ERROR;
		logEntry.message = message;
		//std::string fileName = __FILE__;
		//fileName = fileName.substr(fileName.find_last_of("/\\") + 1);
		//std::cout << "\x1B[91m" << "ERR: [" << fileName << " " << "Line: " << __LINE__ << "] --- " << logEntry.message << "\033[0m" << std::endl;
		std::cout << "\x1B[91m" << " --- ERR: [" << logEntry.message << "]  " << "\033[0m" << std::endl;
		messages.push_back(logEntry);
	}
}