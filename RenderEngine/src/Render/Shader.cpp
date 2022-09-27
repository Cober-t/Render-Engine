#include "pch.h"
#include "Shader.h"

namespace Cober {

	Shader::Shader() {

		_shaderProgram = glCreateProgram();

		if (!_shaderProgram) {
			printf("Error creating shader program!\n");
			return;
		}
	}

	Ref<Shader> Shader::Create() {

		return CreateRef<Shader>();
	}

	std::string Shader::ReadFile(const std::string& filePath)
	{
		std::string result;
		std::ifstream in(SHADERS_PATH + filePath, std::ios::in | std::ios::binary);
		if (in) {
			in.seekg(0, std::ios::end);
			result.resize(in.tellg());
			in.seekg(0, std::ios::beg);
			in.read(&result[0], result.size());
			in.close();
		}
		else
			LOG("Could not open file ");

		return result;
	}

	void Shader::AddShader(const std::string& filePath, GLenum shaderType) {

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

	void Shader::CompileShader() {

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