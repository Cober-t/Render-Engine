#pragma once

#include "Render/VertexArray.h"

//#include <SDL/SDL_opengles2.h>
#include <GLES3/gl3.h>

namespace Cober {

	class OpenGLES3VertexArray : public VertexArray
	{
	public:
		OpenGLES3VertexArray();
		virtual ~OpenGLES3VertexArray();

		virtual void Bind() const override;
		virtual void Unbind() const override;

		virtual void AddVertexBuffer(const Ref<VertexBuffer>& vertexBuffer) override;
		virtual void SetIndexBuffer(const Ref<IndexBuffer>& indexBuffer) override;

		virtual const std::vector<Ref<VertexBuffer>>& GetVertexBuffers() const override { return _vertexBuffers; }
		virtual const Ref<IndexBuffer>& GetIndexBuffer() const override { return _indexBuffer; }
	private:
		uint32_t _rendererID;
		uint32_t _vertexBufferIndex = 0;
		std::vector<Ref<VertexBuffer>> _vertexBuffers;
		Ref<IndexBuffer> _indexBuffer;
	};
}