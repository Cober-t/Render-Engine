#pragma once

#include <string>

#include "core/Core.h"

typedef unsigned int GLuint;
typedef unsigned int GLenum;

namespace Cober {

	class Shader {
	public:
		virtual ~Shader() = default;

		static Ref<Shader> Create();
		/*static Ref<Shader> Create(const std::string& filepath);
		static Ref<Shader> Create(const std::string& name, const std::string& vertexSrc, const std::string& fragmentSrc);*/
		
		static std::string ReadFile(const std::string& filePath);
		
		virtual void AddShader(const std::string& filePath, GLenum shaderType) = 0;
		virtual void CompileShader() = 0;

		virtual GLuint GetShaderProgram() = 0;
		virtual GLuint GetVAO() = 0;
		virtual GLuint GetVBO() = 0;
		virtual void SetVAO(const GLuint& VAO) = 0;
		virtual void SetVBO(const GLuint& VBO) = 0;
	private:
		GLuint _shaderProgram;
		GLuint _VAO, _VBO;
	};
}
