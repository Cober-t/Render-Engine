#include "pch.h"

#include "Render/RenderAPI.h"
#include "Shader.h"



#if !defined __EMSCRIPTEN__ && !defined __OPENGLES3__
	#include "Platforms/OpenGL/OpenGLShader.h"
#elif defined __EMSCRIPTEN__ || __OPENGLES3__
	#include "Platforms/OpenGLES3/OpenGLES3Shader.h"
#endif

namespace Cober {

	Ref<Shader> Shader::Create(const std::string& filepath) {

		switch (RenderAPI::GetAPI()) {
#if !defined __EMSCRIPTEN__ && !defined __OPENGLES3__
			case RenderAPI::API::None:		LOG_ERROR("RenderAPI::None means there is not render defined!!");		return nullptr;
			case RenderAPI::API::OpenGL:	return CreateRef<OpenGLShader>(filepath);
#elif defined __EMSCRIPTEN__ || __OPENGLES3__
			case RenderAPI::API::None:			LOG_ERROR("Wrong API"); break;
			case RenderAPI::API::OpenGL:		LOG_ERROR("Wrong API"); break;
			case RenderAPI::API::OpenGLES:		LOG_ERROR("Wrong API"); break;
			case RenderAPI::API::OpenGLES3:		return CreateUnique<OpenGLES3Shader>(filepath);
			default:	LOG_ERROR("Unknown RendererAPI!"); break;
#endif
		}
		return nullptr;
	}

	Ref<Shader> Shader::Create(const std::string& name, const std::string& vertexSrc, const std::string& fragmentSrc)
	{
		switch (RenderAPI::GetAPI())
		{
#if !defined __EMSCRIPTEN__ && !defined __OPENGLES3__
			case RenderAPI::API::None:		LOG_ERROR("RenderAPI::None means there is not render defined!!");		return nullptr;
			case RenderAPI::API::OpenGL:	return CreateRef<OpenGLShader>(name, vertexSrc, fragmentSrc);
#elif defined __EMSCRIPTEN__ || __OPENGLES3__
			case RenderAPI::API::None:			LOG_ERROR("Wrong API"); break;
			case RenderAPI::API::OpenGL:		LOG_ERROR("Wrong API"); break;
			case RenderAPI::API::OpenGLES:		LOG_ERROR("Wrong API"); break;
			case RenderAPI::API::OpenGLES3:		return CreateUnique<OpenGLES3Shader>(name, vertexSrc, fragmentSrc);
			default:	LOG_ERROR("Unknown RendererAPI!"); break;
#endif
		}
		LOG_ERROR("Unknown RendererAPI!");
		return nullptr;
	}

	void ShaderLibrary::Add(const std::string& name, const Ref<Shader>& shader)
	{
		//if (!Exists(name))
			//LOG_WARNING("Shader already exists!");
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
			LOG_WARNING("Shader not found!");
		return _shaders[name];
	}

	bool ShaderLibrary::Exists(const std::string& name) const
	{
		return _shaders.find(name) != _shaders.end();
	}
}