#include "pch.h"
#include "OpenGLES3RenderAPI.h"

namespace Cober {

	void OpenGLES3RenderAPI::Init() {

		//GLCallV(glEnable(GL_TEXTURE_2D));
		GLCallV(glEnable(GL_BLEND));
		GLCallV(glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA));
		GLCallV(glEnable(GL_DEPTH_TEST));
	}

	void OpenGLES3RenderAPI::SetViewport(uint32_t x, uint32_t y, uint32_t width, uint32_t height) {

		GLCallV(glViewport(0, 0, width, height));
	}

	void OpenGLES3RenderAPI::SetClearColor(glm::vec4 color) {

		GLCallV(glClearColor(color.r, color.g, color.b, color.a));
	}

	void OpenGLES3RenderAPI::SetClearColor(float red, float green, float blue, float black) {

		float r = red / 255, g = green / 255, b = blue / 255, k = black / 255;
		GLCallV(glClearColor(r, g, b, k));
	}

	void OpenGLES3RenderAPI::Clear() {

		GLCallV(glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT));
	}

	void OpenGLES3RenderAPI::DrawIndexed(const Ref<VertexArray>& vertexArray, uint32_t indexCount)
	{
		vertexArray->Bind();
		uint32_t count = indexCount ? indexCount : vertexArray->GetIndexBuffer()->GetCount();
		GLCallV(glDrawElements(GL_TRIANGLES, count, GL_UNSIGNED_INT, nullptr));
		//GLCallV(glBindTexture(GL_TEXTURE_2D, 0));
	}

	void OpenGLES3RenderAPI::DrawLines(const Ref<VertexArray>& vertexArray, uint32_t vertexCount)
	{
		vertexArray->Bind();
		GLCallV(glDrawArrays(GL_LINES, 0, vertexCount));
	}

	void OpenGLES3RenderAPI::SetLineWidth(float width)
	{
		GLCallV(glLineWidth(width));
	}
}