#pragma once

//#include <SDL/SDL_opengles2.h>
#include <GLES3/gl3.h>

#include "Render/Buffer.h"

namespace Cober {

	class OpenGLES3VertexBuffer : public VertexBuffer
	{
	public:
		OpenGLES3VertexBuffer(uint32_t size);
		OpenGLES3VertexBuffer(float* vertices, uint32_t size);
		virtual ~OpenGLES3VertexBuffer();

		virtual void Bind() const override;
		virtual void Unbind() const override;

		virtual void SetData(const void* data, uint32_t size) override;

		virtual const BufferLayout& GetLayout() const override { return _layout; }
		virtual void SetLayout(const BufferLayout& layout) override { _layout = layout; }
	private:
		uint32_t _rendererID;
		BufferLayout _layout;
	};

	class OpenGLES3IndexBuffer : public IndexBuffer
	{
	public:
		OpenGLES3IndexBuffer(uint32_t* indices, uint32_t count);
		virtual ~OpenGLES3IndexBuffer();

		virtual void Bind() const;
		virtual void Unbind() const;

		virtual uint32_t GetCount() const { return _count; }
	private:
		uint32_t _rendererID;
		uint32_t _count;
	};
}
