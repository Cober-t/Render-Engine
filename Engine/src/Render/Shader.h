#pragma once

#include <GL/glew.h>

namespace Cober {

	class Shader {
	public:
		Shader();
		static Ref<Shader> Create();
		std::string ReadFile(const std::string& filePath);
		void AddShader(const std::string& filePath, GLenum shaderType);
		void CompileShader();

		GLuint GetShaderProgram() { return _shaderProgram; };
		GLuint GetVAO() { return _VAO; };
		GLuint GetVBO() { return _VBO; };
		void SetVAO(const GLuint& VAO) { _VAO = VAO; };
		void SetVBO(const GLuint& VBO) { _VBO = VBO; };

	private:
		GLuint _shaderProgram;
		GLuint _VAO, _VBO;
	};
}
