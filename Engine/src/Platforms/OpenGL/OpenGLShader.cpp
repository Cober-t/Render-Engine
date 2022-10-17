#include "pch.h"
#include "OpenGLShader.h"

namespace Cober {

	OpenGLShader::OpenGLShader() {

		_shaderProgram = glCreateProgram();

		if (!_shaderProgram) {
			printf("Error creating shader program!\n");
			return;
		}
	}

	/*OpenGLShader::OpenGLShader(const std::string& filepath) {

	}
	OpenGLShader::OpenGLShader(const std::string& name, const std::string& vertexSrc, const std::string& fragmentSrc) {

	}*/

	OpenGLShader::~OpenGLShader()
	{
		glDeleteProgram(_shaderProgram);
	}

	void OpenGLShader::AddShader(const std::string& filePath, GLenum shaderType) {

		std::string file = ReadFile(filePath);
		GLuint theShader = glCreateShader(shaderType);

		const GLchar* theCode[1];
		theCode[0] = file.c_str();

		GLint codeLength[1];
		codeLength[0] = strlen(file.c_str());

		glShaderSource(theShader, 1, theCode, codeLength);
		glCompileShader(theShader);

		GLint result = 0;
		GLchar eLog[1024] = { 0 };

		glGetShaderiv(theShader, GL_COMPILE_STATUS, &result);
		if (!result)
		{
			glGetShaderInfoLog(theShader, sizeof(eLog), NULL, eLog);
			printf("Error compiling the %d shader: '%s'\n", shaderType, eLog);
			return;
		}

		glAttachShader(_shaderProgram, theShader);
	}

	void OpenGLShader::CompileShader() {

		GLint result = 0;
		GLchar eLog[1024] = { 0 };

		glLinkProgram(_shaderProgram);
		glGetProgramiv(_shaderProgram, GL_LINK_STATUS, &result);
		if (!result)
		{
			glGetProgramInfoLog(_shaderProgram, sizeof(eLog), NULL, eLog);
			printf("Error linking program: '%s'\n", eLog);
			return;
		}

		glValidateProgram(_shaderProgram);
		glGetShaderiv(_shaderProgram, GL_VALIDATE_STATUS, &result);
		if (!result)
		{
			glGetShaderInfoLog(_shaderProgram, sizeof(eLog), NULL, eLog);
			printf("Error validating program: '%s'\n", eLog);
			return;
		}
	}
}