#include "pch.h"
#include "Platforms/OpenGL/OpenGLVertexArray.h"

#include <GL/glew.h>

namespace Cober {

	static GLenum ShaderDataTypeToOpenGLBaseType(ShaderDataType type)
	{
		switch (type)
		{
		case ShaderDataType::Float:    return GL_FLOAT;
		case ShaderDataType::Float2:   return GL_FLOAT;
		case ShaderDataType::Float3:   return GL_FLOAT;
		case ShaderDataType::Float4:   return GL_FLOAT;
		case ShaderDataType::Mat3:     return GL_FLOAT;
		case ShaderDataType::Mat4:     return GL_FLOAT;
		case ShaderDataType::Int:      return GL_INT;
		case ShaderDataType::Int2:     return GL_INT;
		case ShaderDataType::Int3:     return GL_INT;
		case ShaderDataType::Int4:     return GL_INT;
		case ShaderDataType::Bool:     return GL_BOOL;
		}

		Logger::Warning("Unknown ShaderDataType!");
		return 0;
	}

	OpenGLVertexArray::OpenGLVertexArray()
	{
		GLCallV(glCreateVertexArrays(1, &_rendererID));
	}

	OpenGLVertexArray::~OpenGLVertexArray()
	{
		GLCallV(glDeleteVertexArrays(1, &_rendererID));
	}

	void OpenGLVertexArray::Bind() const
	{
		GLCallV(glBindVertexArray(_rendererID));
	}

	void OpenGLVertexArray::Unbind() const
	{
		GLCallV(glBindVertexArray(0));
	}

	void OpenGLVertexArray::AddVertexBuffer(const Ref<VertexBuffer>& vertexBuffer)
	{
		//if(vertexBuffer->GetLayout().GetElements().size())
			//Logger::Warning("Vertex Buffer has no layout!");

		GLCallV(glBindVertexArray(_rendererID));
		vertexBuffer->Bind();

		const auto& layout = vertexBuffer->GetLayout();
		for (const auto& element : layout)
		{
			GLCallV(glEnableVertexAttribArray(_vertexBufferIndex));
			GLCallV(glVertexAttribPointer(_vertexBufferIndex,
									      element.GetComponentCount(),
									      ShaderDataTypeToOpenGLBaseType(element.type),
									      element.normalized ? GL_TRUE : GL_FALSE,
									      layout.GetStride(),
									      (const void*)element.offset));
			_vertexBufferIndex++;
		}

		_vertexBuffers.push_back(vertexBuffer);
	}

	void OpenGLVertexArray::SetIndexBuffer(const Ref<IndexBuffer>& indexBuffer)
	{
		GLCallV(glBindVertexArray(_rendererID));
		indexBuffer->Bind();

		_indexBuffer = indexBuffer;
	}
}
