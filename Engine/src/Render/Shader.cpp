#include "pch.h"

#include "Render/RenderAPI.h"
#include "Shader.h"
#include "Platforms/OpenGL/OpenGLShader.h"
//#include "Platforms/OpenGLES/OpenGLESShader.h"
//#include "Platforms/OpenGLES3/OpenGLES3Shader.h"

namespace Cober {

	Ref<Shader> Shader::Create() {

		switch (RenderAPI::GetAPI()) {
			case RenderAPI::API::None:		LOG("RenderAPI::None means there is not render defined!!");		return nullptr;
			case RenderAPI::API::OpenGL:	return CreateRef<OpenGLShader>();

			// Future implementation
			//case RenderAPI::API::OpenGLES:	return CreateUnique<OpenGLESShader>(spec)	return nullptr;
			//case RenderAPI::API::OpenGLES3:	return CreateUnique<OpenGLES3Shader>(spec)	return nullptr;
		}
		LOG_ERROR("Unknown Shader RenderAPI!");
		return nullptr;
	}

	//Ref<Shader> Shader::Create(const std::string& filepath)
	//{
	//	switch (RenderAPI::GetAPI())
	//	{
	//		case RenderAPI::API::None:		LOG("RenderAPI::None means there is not render defined!!");		return nullptr;
	//		case RenderAPI::API::OpenGL:	return CreateRef<OpenGLShader>(filepath);
	//		// Future implementation
	//		//case RenderAPI::API::OpenGLES:	return CreateUnique<OpenGLESShader>(spec)	return nullptr;
	//		//case RenderAPI::API::OpenGLES3:	return CreateUnique<OpenGLES3Shader>(spec)	return nullptr;
	//	}

	//	LOG_ERROR("Unknown Shader RenderAPI!");
	//	return nullptr;
	//}

	//Ref<Shader> Shader::Create(const std::string& name, const std::string& vertexSrc, const std::string& fragmentSrc)
	//{
	//	switch (RenderAPI::GetAPI())
	//	{
	//		case RenderAPI::API::None:		LOG("RenderAPI::None means there is not render defined!!");		return nullptr;
	//		case RenderAPI::API::OpenGL:	return CreateRef<OpenGLShader>(name, vertexSrc, fragmentSrc);
	//		// Future implementation
	//		//case RenderAPI::API::OpenGLES:	return CreateUnique<OpenGLESShader>(spec)	return nullptr;
	//		//case RenderAPI::API::OpenGLES3:	return CreateUnique<OpenGLES3Shader>(spec)	return nullptr;
	//	}

	//	LOG_ERROR("Unknown Shader RenderAPI!");
	//	return nullptr;
	//}

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
}

