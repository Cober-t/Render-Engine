#pragma once

#include <vector>
#include <string>

#define GET_SDL_ERROR()     Cober::Logger::Error(SDL_GetError());
#ifndef __EMSCRIPTEN__
#ifndef __OPENGLES3__
#define ASSERT(x) if (!(x)) __debugbreak();
#endif
#endif

#if defined __EMSCRIPTEN__ || __OPENGLES3__
	#define GLCallV( x ) \
			Cober::Logger::GLClearErrors(); \
			x;\
			Cober::Logger::GLCheckErrors(#x, __FILE__, __LINE__)

	#define GLCall( x ) [&]() { \
			Cober::Logger::GLClearErrors(); \
			auto retVal = x; \
			Cober::Logger::GLCheckErrors(#x, __FILE__, __LINE__); \
			return retVal; \
		}()
#else
	#define GLCallV( x ) \
			Cober::Logger::GLClearErrors(); \
			x; \
			ASSERT(Cober::Logger::GLCheckErrors(#x, __FILE__, __LINE__))

	#define GLCall( x ) [&]() { \
			Cober::Logger::GLClearErrors(); \
			auto retVal = x; \
			ASSERT(Cober::Logger::GLCheckErrors(#x, __FILE__, __LINE__)); \
			return retVal; \
		}()
#endif

#define LOG_INFO( x )	 Cober::Logger::Log(#x, __FILE__, __LINE__)
#define LOG_WARNING( x ) Cober::Logger::Warning(#x, __FILE__, __LINE__)
#define LOG_ERROR( x )	 Cober::Logger::Error(#x, __FILE__, __LINE__)

namespace Cober {

	enum LogType {
		INFO, WARNING, ERROR
	};

	struct LogEntry {
		LogType type;
		std::string message;
	};

	class Logger {
	public:
		static std::vector<LogEntry> messages;
		static void Log(const std::string& message, const char* file = __FILE__, int line = __LINE__);
		static void Warning(const std::string& message, const char* file = __FILE__, int line = __LINE__);
		static void Error(const std::string& message, const char* file = __FILE__, int line = __LINE__);

		// Handle Errors
		static void GLClearErrors();
		static bool GLCheckErrors(const char* function, const char* file, int line);
	};
}
