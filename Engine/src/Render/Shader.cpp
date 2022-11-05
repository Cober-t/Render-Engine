#include "pch.h"

#include "Render/RenderAPI.h"
#include "Shader.h"
#ifndef __EMSCRIPTEN__
#include "Platforms/OpenGL/OpenGLShader.h"
#endif
//#include "Platforms/OpenGLES/OpenGLESShader.h"
#include "Platforms/OpenGLES3/OpenGLES3Shader.h"

namespace Cober {

	Ref<Shader> Shader::Create(const std::string& filepath) {

		switch (RenderAPI::GetAPI()) {
#ifndef __EMSCRIPTEN__
			case RenderAPI::API::None:		Logger::Warning("RenderAPI::None means there is not render defined!!");		return nullptr;
			case RenderAPI::API::OpenGL:	return CreateRef<OpenGLShader>(filepath);
#endif
			// Future implementation
			//case RenderAPI::API::OpenGLES:	return CreateUnique<OpenGLESShader>(filePath);
			//case RenderAPI::API::OpenGLES3:	return CreateUnique<OpenGLES3Shader>(filePath);
		}
		Logger::Warning("Unknown Shader RenderAPI!");
		return nullptr;
	}

	Ref<Shader> Shader::Create(const std::string& name, const std::string& vertexSrc, const std::string& fragmentSrc)
	{
		switch (RenderAPI::GetAPI())
		{
#ifndef __EMSCRIPTEN__
			case RenderAPI::API::None:		Logger::Warning("RenderAPI::None means there is not render defined!!");		return nullptr;
			case RenderAPI::API::OpenGL:	return CreateRef<OpenGLShader>(name, vertexSrc, fragmentSrc);

#endif
			// Future implementation
			//case RenderAPI::API::OpenGLES:	return CreateUnique<OpenGLESShader>(name, vertexSrc, fragmentSrc)		return nullptr;
			//case RenderAPI::API::OpenGLES3:	return CreateUnique<OpenGLES3Shader>(name, vertexSrc, fragmentSrc);
		}

		Logger::Warning("Unknown RendererAPI!");
		return nullptr;
	}

	void ShaderLibrary::Add(const std::string& name, const Ref<Shader>& shader)
	{
		//if (!Exists(name))
			//Logger::Warning("Shader already exists!");
		_shaders[name] = shader;
	}

	void ShaderLibrary::Add(const Ref<Shader>& shader)
	{
		auto& name = shader->GetName();
		Add(name, shader);
	}

	Ref<Shader> ShaderLibrary::Load(const std::string& filepath)
	{
		auto shader = Shader::Create(filepath);
		Add(shader);
		return shader;
	}

	Ref<Shader> ShaderLibrary::Load(const std::string& name, const std::string& filepath)
	{
		auto shader = Shader::Create(filepath);
		Add(name, shader);
		return shader;
	}

	Ref<Shader> ShaderLibrary::Get(const std::string& name)
	{
		if(Exists(name))
			Logger::Warning("Shader not found!");
		return _shaders[name];
	}

	bool ShaderLibrary::Exists(const std::string& name) const
	{
		return _shaders.find(name) != _shaders.end();
	}
}