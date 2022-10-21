#include "pch.h"
#include "Platforms/OpenGLES3/OpenGLES3Shader.h"

#include <glm/gtc/type_ptr.hpp>
#include <fstream>


namespace Cober {

	//static GLenum ShaderTypeFromString(const std::string& type)
	//{
	///*	if (type == "vertex")
	//		return GL_VERTEX_SHADER;
	//	if (type == "fragment" || type == "pixel")
	//		return GL_FRAGMENT_SHADER;

	//	Logger::Warning("Unknown shader type!");*/
	//	return 0;
	//}

	//OpenGLES3Shader::OpenGLES3Shader(const std::string& filepath)
	//{
	//	std::string source = ReadFile(filepath);
	//	auto shaderSources = PreProcess(source);
	//	Compile(shaderSources);

	//	// Extract name from filepath
	//	auto lastSlash = filepath.find_last_of("/\\");
	//	lastSlash = lastSlash == std::string::npos ? 0 : lastSlash + 1;
	//	auto lastDot = filepath.rfind('.');
	//	auto count = lastDot == std::string::npos ? filepath.size() - lastSlash : lastDot - lastSlash;
	//	_name = filepath.substr(lastSlash, count);
	//}

	OpenGLES3Shader::~OpenGLES3Shader()
	{
		//GLCallV(glDeleteProgram(_renderID));
	}

	std::string OpenGLES3Shader::ReadFile(const std::string& filePath)
	{
		std::string result;
		std::ifstream in(SHADERS_PATH + filePath, std::ios::in | std::ios::binary);
		if (in) {
			in.seekg(0, std::ios::end);
			size_t size = in.tellg();
			if (size != -1) {
				result.resize(size);
				in.seekg(0, std::ios::beg);
				in.read(&result[0], size);
				in.close();
			}
			else
				Logger::Warning("Could not read from file " + filePath);
		}
		else
			Logger::Log("Could not open file " + filePath);

		return result;
	}

	//std::unordered_map<GLenum, std::string> OpenGLES3Shader::PreProcess(const std::string& source)
	//{
	//	std::unordered_map<GLenum, std::string> shaderSources;

	//	const char* typeToken = "#type";
	//	size_t typeTokenLength = strlen(typeToken);
	//	size_t pos = source.find(typeToken, 0); //Start of shader type declaration line
	//	while (pos != std::string::npos)
	//	{
	//		size_t eol = source.find_first_of("\r\n", pos); //End of shader type declaration line

	//		if (eol != std::string::npos)
	//			Logger::Warning("Syntax error");

	//		size_t begin = pos + typeTokenLength + 1; //Start of shader type name (after "#type " keyword)
	//		std::string type = source.substr(begin, eol - begin);

	//		if (ShaderTypeFromString(type))
	//			Logger::Log("Invalid shader type specified");

	//		size_t nextLinePos = source.find_first_not_of("\r\n", eol); //Start of shader code after shader type declaration line

	//		if (nextLinePos != std::string::npos)
	//			Logger::Log("Syntax error");

	//		pos = source.find(typeToken, nextLinePos); //Start of next shader type declaration line
	//		shaderSources[ShaderTypeFromString(type)] = (pos == std::string::npos) ? source.substr(nextLinePos) : source.substr(nextLinePos, pos - nextLinePos);
	//	}

	//	return shaderSources;
	//}

	//void OpenGLES3Shader::Compile(const std::unordered_map<GLenum, std::string>& shaderSources)
	//{
		/*
		GLuint program = GLCall(glCreateProgram());

		if (shaderSources.size() <= 2)
			Logger::Log("We only support 2 shaders for now");

		std::array<GLenum, 2> glShaderIDs;
		int glShaderIDIndex = 0;

		for (auto& kv : shaderSources) {

			GLenum type = kv.first;
			const std::string& source = kv.second;

			GLuint shader = glCreateShader(type);

			const GLchar* sourceCStr = source.c_str();
			GLCallV(glShaderSource(shader, 1, &sourceCStr, 0));

			GLCallV(glCompileShader(shader));

			GLint isCompiled = 0;
			GLCallV(glGetShaderiv(shader, GL_COMPILE_STATUS, &isCompiled));

			if (isCompiled == GL_FALSE) {
				GLint maxLength = 0;
				GLCallV(glGetShaderiv(shader, GL_INFO_LOG_LENGTH, &maxLength));

				std::vector<GLchar> infoLog(maxLength);
				GLCallV(glGetShaderInfoLog(shader, maxLength, &maxLength, &infoLog[0]));

				GLCallV(glDeleteShader(shader));

				Logger::Log(infoLog.data());
				Logger::Log("Shader link failure!");
				break;
			}

			GLCallV(glAttachShader(program, shader));
			glShaderIDs[glShaderIDIndex++] = shader;
		}

		_renderID = program;

		// Link our program
		GLCallV(glLinkProgram(program));

		// Note the different functions here: glGetProgram* instead of glGetShader*.
		GLint isLinked = 0;
		GLCallV(glGetProgramiv(program, GL_LINK_STATUS, (int*)&isLinked));
		if (isLinked == GL_FALSE)
		{
			GLint maxLength = 0;
			GLCallV(glGetProgramiv(program, GL_INFO_LOG_LENGTH, &maxLength));

			// The maxLength includes the NULL character
			std::vector<GLchar> infoLog(maxLength);
			GLCallV(glGetProgramInfoLog(program, maxLength, &maxLength, &infoLog[0]));

			// We don't need the program anymore.
			GLCallV(glDeleteProgram(program));

			for (auto id : glShaderIDs)
				glDeleteShader(id);

			Logger::Log(infoLog.data());
			Logger::Log("Shader link failure!");
			return;
		}

		for (auto id : glShaderIDs)
		{
			GLCallV(glDetachShader(program, id));
			GLCallV(glDeleteShader(id));
		}
		*/
	//}

	void OpenGLES3Shader::Bind() const
	{
		//GLCallV(glUseProgram(_renderID));
	}

	void OpenGLES3Shader::Unbind() const
	{
		//GLCallV(glUseProgram(0));
	}

	void OpenGLES3Shader::SetInt(const std::string& name, int value)
	{
		UploadUniformInt(name, value);
	}

	void OpenGLES3Shader::SetIntArray(const std::string& name, int* values, uint32_t count)
	{
		UploadUniformIntArray(name, values, count);
	}

	void OpenGLES3Shader::SetFloat(const std::string& name, float value)
	{
		UploadUniformFloat(name, value);
	}

	void OpenGLES3Shader::SetFloat3(const std::string& name, const glm::vec3& value)
	{
		UploadUniformFloat3(name, value);
	}

	void OpenGLES3Shader::SetFloat4(const std::string& name, const glm::vec4& value)
	{
		UploadUniformFloat4(name, value);
	}

	void OpenGLES3Shader::SetMat4(const std::string& name, const glm::mat4& value)
	{
		UploadUniformMat4(name, value);
	}

	void OpenGLES3Shader::UploadUniformInt(const std::string& name, int value)
	{
		//GLint location = GLCall(glGetUniformLocation(_renderID, name.c_str()));
		//GLCallV(glUniform1i(location, value));
	}

	void OpenGLES3Shader::UploadUniformIntArray(const std::string& name, int* values, uint32_t count)
	{
		//GLint location = GLCall(glGetUniformLocation(_renderID, name.c_str()));
		//GLCallV(glUniform1iv(location, count, values));
	}

	void OpenGLES3Shader::UploadUniformFloat(const std::string& name, float value)
	{
		//GLint location = GLCall(glGetUniformLocation(_renderID, name.c_str()));
		//GLCallV(glUniform1f(location, value));
	}

	void OpenGLES3Shader::UploadUniformFloat2(const std::string& name, const glm::vec2& value)
	{
		//GLint location = GLCall(glGetUniformLocation(_renderID, name.c_str()));
		//GLCallV(glUniform2f(location, value.x, value.y));
	}

	void OpenGLES3Shader::UploadUniformFloat3(const std::string& name, const glm::vec3& value)
	{
		//GLint location = GLCall(glGetUniformLocation(_renderID, name.c_str()));
		//GLCallV(glUniform3f(location, value.x, value.y, value.z));
	}

	void OpenGLES3Shader::UploadUniformFloat4(const std::string& name, const glm::vec4& value)
	{
		//GLint location = GLCall(glGetUniformLocation(_renderID, name.c_str()));
		//GLCallV(glUniform4f(location, value.x, value.y, value.z, value.w));
	}

	void OpenGLES3Shader::UploadUniformMat3(const std::string& name, const glm::mat3& matrix)
	{
		//GLint location = GLCall(glGetUniformLocation(_renderID, name.c_str()));
		//GLCallV(glUniformMatrix3fv(location, 1, GL_FALSE, glm::value_ptr(matrix)));
	}

	void OpenGLES3Shader::UploadUniformMat4(const std::string& name, const glm::mat4& matrix)
	{
		//GLint location = GLCall(glGetUniformLocation(_renderID, name.c_str()));
		//GLCallV(glUniformMatrix4fv(location, 1, GL_FALSE, glm::value_ptr(matrix)));
	}
}