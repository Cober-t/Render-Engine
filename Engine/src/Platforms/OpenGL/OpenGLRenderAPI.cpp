#include "pch.h"
#include "OpenGLRenderAPI.h"

#include "GL/glew.h"

namespace Cober {

	void OpenGLRenderAPI::Init() {

		glEnable(GL_BLEND);
		glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);

		glEnable(GL_DEPTH_TEST);
		//glEnable(GL_LINE_SMOOTH);
	}

	void OpenGLRenderAPI::SetViewport(uint32_t x, uint32_t y, uint32_t width, uint32_t height) {

		GLCallV(glViewport(0, 0, width, height));
	}

	void OpenGLRenderAPI::SetClearColor(const glm::vec4& color) {

		GLCallV(glClearColor(color.r, color.g, color.b, color.a));
	}

	void OpenGLRenderAPI::SetClearColor(float red, float green, float blue, float black) {

		float r = red / 255, g = green / 255, b = blue / 255, k = black / 255;	
		GLCallV(glClearColor(r, g, b, k));
	}

	void OpenGLRenderAPI::Clear() {

		glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
	}

	void OpenGLRenderAPI::DrawIndexed(const Ref<VertexArray>& vertexArray, uint32_t indexCount)
	{
		vertexArray->Bind();
		uint32_t count = indexCount ? indexCount : vertexArray->GetIndexBuffer()->GetCount();
		GLCallV(glDrawElements(GL_TRIANGLES, count, GL_UNSIGNED_INT, nullptr));
	}

	void OpenGLRenderAPI::DrawLines(const Ref<VertexArray>& vertexArray, uint32_t vertexCount)
	{
		vertexArray->Bind();
		GLCallV(glDrawArrays(GL_LINES, 0, vertexCount));
	}

	void OpenGLRenderAPI::SetLineWidth(float width)
	{
		GLCallV(glLineWidth(width));
	}
}