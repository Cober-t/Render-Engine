#pragma once

#include "Render/Shader.h"
#include "core/Core.h"

//#include <GLES/...>

namespace Cober {

	class OpenGLES3Shader : public Shader {
	public:
		OpenGLES3Shader();
		OpenGLES3Shader(const std::string& filepath);
		OpenGLES3Shader(const std::string& name, const std::string& vertexSrc, const std::string& fragmentSrc);

		//virtual void AddShader(const std::string& filePath, GLenum shaderType) override;
		//virtual void CompileShader() override;

		//virtual GLuint GetShaderProgram() override { return _shaderProgram; };
		//virtual GLuint GetVAO() override { return _VAO; };
		//virtual GLuint GetVBO() override { return _VBO; };
		//virtual void SetVAO(const GLuint& VAO) override { _VAO = VAO; };
		//virtual void SetVBO(const GLuint& VBO) override { _VBO = VBO; };
	private:
		//GLuint _shaderProgram;
		//GLuint _VAO, _VBO;
	};
}
