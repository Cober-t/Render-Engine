#include "pch.h"

#ifdef __OPENGL__
	#include <GL/glew.h>
#elif  __OPENGLES__
	#include <GLES3/gl2.h>
#elif  __OPENGLES3__
	#ifndef __EMSCRIPTEN__
		#include <GLES3/gl32.h>
		#include <GLES3/gl3platform.h>
	#endif
#endif

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
		std::cout << "\033[94m" << " --- LOG: [" << logEntry.message << "]  " << "\033[0m" << std::endl;
		messages.push_back(logEntry);
	}

	void Logger::Warning(const std::string& message) {

		LogEntry logEntry;
		logEntry.type = LOG_INFO;
		logEntry.message = message;
		//std::string fileName = __FILE__;
		//fileName = fileName.substr(fileName.find_last_of("/\\") + 1);
		//std::cout << "\x1B[32m" << "LOG: [" << fileName << " " << "Line: " << __LINE__ << "] --- " << logEntry.message << "\033[0m" << std::endl;
		std::cout << "\033[93m" << " --- LOG: [" << logEntry.message << "]  " << "\033[0m" << std::endl;
		messages.push_back(logEntry);
	}


	void Logger::Error(const std::string& message) {

		LogEntry logEntry;
		logEntry.type = LOG_ERROR;
		logEntry.message = message;
		//std::string fileName = __FILE__;
		//fileName = fileName.substr(fileName.find_last_of("/\\") + 1);
		//std::cout << "\x1B[91m" << "ERR: [" << fileName << " " << "Line: " << __LINE__ << "] --- " << logEntry.message << "\033[0m" << std::endl;
		std::cout << "\033[91m" << " --- ERR: [" << logEntry.message << "]  " << "\033[0m" << std::endl;
		messages.push_back(logEntry);
	}

	void Logger::GLClearErrors() {

#ifndef __EMSCRIPTEN__
		while (glGetError());
#endif
	}

	bool Logger::GLCheckErrors(const char* function, const char* file, int line) {	

#ifndef __EMSCRIPTEN__
		while (GLenum error = glGetError()) {
			std::string fileName = (std::string)file;
			std::string solutionDir = SOLUTION_DIR;
			fileName = fileName.substr(solutionDir.length());
			Logger::Error("[OpenGL Error] (" + std::to_string(error) + (std::string)") " + function + "\n\t\t" + fileName + ":" + std::to_string(line));
			return false;
		}
		return true;
#endif


	}
}

// [++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++]
// [++++++++++++++++++++++   COLORS   ++++++++++++++++++++++++++]
// [++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++]
//		<<	"/033[" + foreground + ";" + background + "m"	<<
// 
//			Foreground					Background
//		30 - color_black		 0	 40 - color_black      0
//		34 - color_dark_blue	 1	 44 - color_dark_blue  1
//		32 - color_dark_green	 2	 42 - color_dark_green 2
//		36 - color_light_blue	 3	 46 - color_light_blue 3
//		31 - color_dark_red		 4	 41 - color_dark_red   4
//		35 - color_magenta		 5	 45 - color_magenta    5
//		33 - color_orange		 6	 43 - color_orange     6
//		37 - color_light_gray	 7	 47 - color_light_gray 7
//		90 - color_gray			 8	100 - color_gray       8
//		94 - color_blue			 9	104 - color_blue       9
//		92 - color_green		10	102 - color_green     10
//		96 - color_cyan			11	106 - color_cyan      11
//		91 - color_red			12	101 - color_red       12
//		95 - color_pink			13	105 - color_pink      13
//		93 - color_yellow		14	103 - color_yellow    14
//		97 - color_white		15	107 - color_white     15
//		37 - default				 40 - default
