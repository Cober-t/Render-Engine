#include "pch.h"

#include "Platforms/OpenGLES3/OpenGLES3Buffer.h"

//#include <GLES3/...>

namespace Cober {

	// [++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++]
	// [+++++++++++++++++++++++ VERTEX BUFFER ++++++++++++++++++++++++++++]
	// [++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++]

	OpenGLES3VertexBuffer::OpenGLES3VertexBuffer(uint32_t size) {

		//GLCallV(glCreateBuffers(1, &_rendererID));
		//GLCallV(glBindBuffer(GL_ARRAY_BUFFER, _rendererID));
		//GLCallV(glBufferData(GL_ARRAY_BUFFER, size, nullptr, GL_DYNAMIC_DRAW));
	}

	OpenGLES3VertexBuffer::OpenGLES3VertexBuffer(float* vertices, uint32_t size)
	{
		//GLCallV(glCreateBuffers(1, &_rendererID));
		//GLCallV(glBindBuffer(GL_ARRAY_BUFFER, _rendererID));
		//GLCallV(glBufferData(GL_ARRAY_BUFFER, size, vertices, GL_STATIC_DRAW));
	}

	OpenGLES3VertexBuffer::~OpenGLES3VertexBuffer()
	{
		//GLCallV(glDeleteBuffers(1, &_rendererID));
	}

	void OpenGLES3VertexBuffer::Bind() const
	{
		//GLCallV(glBindBuffer(GL_ARRAY_BUFFER, _rendererID));
	}

	void OpenGLES3VertexBuffer::Unbind() const
	{
		//GLCallV(glBindBuffer(GL_ARRAY_BUFFER, 0));
	}

	void OpenGLES3VertexBuffer::SetData(const void* data, uint32_t size)
	{
		//GLCallV(glBindBuffer(GL_ARRAY_BUFFER, _rendererID));
		//GLCallV(glBufferSubData(GL_ARRAY_BUFFER, 0, size, data));
	}

	// [++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++]
	// [++++++++++++++++++++++++ INDEX BUFFER ++++++++++++++++++++++++++++]
	// [++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++]

	OpenGLES3IndexBuffer::OpenGLES3IndexBuffer(uint32_t* indices, uint32_t count)
		: _count(count)
	{
		//GLCallV(glCreateBuffers(1, &_rendererID));

		// GL_ELEMENT_ARRAY_BUFFER is not valid without an actively bound VAO
		// Binding with GL_ARRAY_BUFFER allows the data to be loaded regardless of VAO state. 
		//GLCallV(glBindBuffer(GL_ARRAY_BUFFER, _rendererID));
		//GLCallV(glBufferData(GL_ARRAY_BUFFER, count * sizeof(uint32_t), indices, GL_STATIC_DRAW));
	}

	OpenGLES3IndexBuffer::~OpenGLES3IndexBuffer()
	{
		//GLCallV(glDeleteBuffers(1, &_rendererID));
	}

	void OpenGLES3IndexBuffer::Bind() const
	{
		//GLCallV(glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, _rendererID));
	}

	void OpenGLES3IndexBuffer::Unbind() const
	{
		//GLCallV(glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, 0));
	}
}