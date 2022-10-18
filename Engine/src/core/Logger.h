#pragma once

#include <vector>

#define GET_SDL_ERROR()     Cober::Logger::Error(SDL_GetError());
#define ASSERT(x) if (!(x)) __debugbreak();
//#define GLCall(x) Cober::Logger::GLCheckError();\
//				  x;\
//				  ASSERT(Cober::Logger::GLCheckError())
//
//#define GLCall(x, y)  Cober::Logger::GLCheckError(y);\
//					  x;\
//				      ASSERT(Cober::Logger::GLCheckError(y))
#define GLCallV( x ) \
		Cober::Logger::GLClearErrors(); \
		x; \
		ASSERT(Cober::Logger::GLCheckErrors(#x, __FILE__, __LINE__)

#define GLCall( x ) [&]() { \
		Cober::Logger::GLClearErrors(); \
		auto retVal = x; \
		ASSERT(Cober::Logger::GLCheckErrors(#x, __FILE__, __LINE__)); \
		return retVal; \
	}()

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
		static void Warning(const std::string& message);
		static void Error(const std::string& message);

		// Handle Errors
		static void GLClearErrors();
		static bool GLCheckErrors(const char* function, const char* file, int line);
	};
}
