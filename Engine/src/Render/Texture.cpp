#include "pch.h"
#include "Texture.h"

#include "Render/RenderAPI.h"
#include "Systems/RenderSystem.h"

#if !defined __EMSCRIPTEN__ && !defined __OPENGLES3__
	#include "Platforms/OpenGL/OpenGLTexture.h"
#elif defined __EMSCRIPTEN__ || __OPENGLES3__
	#include "Platforms/OpenGLES3/OpenGLES3Texture.h"
#endif

namespace Cober {

	Ref<Texture> Texture::Create(uint32_t width, uint32_t height)
	{
		switch (RenderAPI::GetAPI())
		{
#if !defined __EMSCRIPTEN__ && !defined __OPENGLES3__
			case RenderAPI::API::None:    LOG_WARNING("RendererAPI::None is currently not supported!"); return nullptr;
			case RenderAPI::API::OpenGL:  return CreateRef<OpenGLTexture>(width, height);
#elif defined __EMSCRIPTEN__ || __OPENGLES3__
			case RenderAPI::API::None:			LOG_ERROR("Wrong API"); break;
			case RenderAPI::API::OpenGL:		LOG_ERROR("Wrong API"); break;
			case RenderAPI::API::OpenGLES:		LOG_ERROR("Wrong API"); break;
			case RenderAPI::API::OpenGLES3:		return CreateRef<OpenGLES3Texture>(width, height);
			default:	LOG_ERROR("Unknown RendererAPI!"); break;
#endif
		}
		return nullptr;
	}

	Ref<Texture> Texture::Create(const std::string& path)
	{
		switch (RenderAPI::GetAPI())
		{
#if !defined __EMSCRIPTEN__ && !defined __OPENGLES3__
		case RenderAPI::API::None:    LOG_WARNING("RendererAPI::None is currently not supported!"); return nullptr;
		case RenderAPI::API::OpenGL:  return CreateRef<OpenGLTexture>(path);
#elif defined __EMSCRIPTEN__ || __OPENGLES3__
		case RenderAPI::API::None:			LOG_ERROR("Wrong API"); break;
		case RenderAPI::API::OpenGL:		LOG_ERROR("Wrong API"); break;
		case RenderAPI::API::OpenGLES:		LOG_ERROR("Wrong API"); break;
		case RenderAPI::API::OpenGLES3:		return CreateRef<OpenGLES3Texture>(path);
		default:	LOG_ERROR("Unknown RendererAPI!"); break;
#endif
		}
		return nullptr;
	}

	SubTexture2D::SubTexture2D(const Ref<Texture>& texture, const glm::vec2& min, const glm::vec2& max)
		: _texture(texture)
	{
		_texCoords[0] = { min.x, min.y };
		_texCoords[1] = { max.x, min.y };
		_texCoords[2] = { max.x, max.y };
		_texCoords[3] = { min.x, max.y };
	};

	Ref<SubTexture2D> SubTexture2D::CreateFromCoords(const Ref<Texture>& texture, 
													 const glm::vec2& coord, 
													 const glm::vec2& cellsize, 
													 const glm::vec2& spriteSize)
	{
		glm::vec2 min = { (coord.x * cellsize.x) / texture->GetWidth(), (coord.y * cellsize.y) / texture->GetHeight() };
		glm::vec2 max = { (coord.x + spriteSize.x) * cellsize.x / texture->GetWidth(), ((coord.y + spriteSize.y) * cellsize.y) / texture->GetHeight() };
		return CreateRef<SubTexture2D>(texture, min, max);
	};
}