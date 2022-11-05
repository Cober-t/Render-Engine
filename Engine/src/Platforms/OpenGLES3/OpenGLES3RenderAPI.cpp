#include "pch.h"
#include "OpenGLES3RenderAPI.h"

#include "GLES3/gl3.h"
#include "GLES3/gl3platform.h"

namespace Cober {

	void OpenGLES3RenderAPI::Init() {

#ifdef __EMSCRIPTEN__
		glEnable(GL_BLEND);
		glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);

		glEnable(GL_DEPTH_TEST);
		//glEnable(GL_LINE_SMOOTH);
#else 
		GLCallV(glEnable(GL_BLEND));
		GLCallV(glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA));

		GLCallV(glEnable(GL_DEPTH_TEST));
#endif
	}

	void OpenGLES3RenderAPI::SetViewport(uint32_t x, uint32_t y, uint32_t width, uint32_t height) {

#ifdef __EMSCRIPTEN__
		glViewport(0, 0, width, height);
#else
		GLCallV(glViewport(0, 0, width, height));
#endif
	}

	void OpenGLES3RenderAPI::SetClearColor(const glm::vec4& color) {

#ifdef __EMSCRIPTEN__
		glClearColor(color.r, color.g, color.b, color.a);
#else
		GLCallV(glClearColor(color.r, color.g, color.b, color.a));
#endif
	}

	void OpenGLES3RenderAPI::SetClearColor(float red, float green, float blue, float black) {

		float r = red / 255, g = green / 255, b = blue / 255, k = black / 255;
#ifdef __EMSCRIPTEN__
		glClearColor(r, g, b, k);
#else
		GLCallV(glClearColor(r, g, b, k));
#endif
	}

	void OpenGLES3RenderAPI::Clear() {

#ifdef __EMSCRIPTEN__
		glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
#else
		GLCallV(glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT));
#endif
	}

	void OpenGLES3RenderAPI::DrawIndexed(const Ref<VertexArray>& vertexArray, uint32_t indexCount)
	{
		vertexArray->Bind();
		uint32_t count = indexCount ? indexCount : vertexArray->GetIndexBuffer()->GetCount();

#ifdef __EMSCRIPTEN__
		glDrawElements(GL_TRIANGLES, count, GL_UNSIGNED_INT, nullptr);
#else
		GLCallV(glDrawElements(GL_TRIANGLES, count, GL_UNSIGNED_INT, nullptr));
#endif
	}

	void OpenGLES3RenderAPI::DrawLines(const Ref<VertexArray>& vertexArray, uint32_t vertexCount)
	{
		vertexArray->Bind();
#ifdef __EMSCRIPTEN__
		glDrawArrays(GL_LINES, 0, vertexCount);
#else
		GLCallV(glDrawArrays(GL_LINES, 0, vertexCount));
#endif
	}

	void OpenGLES3RenderAPI::SetLineWidth(float width)
	{
#ifdef __EMSCRIPTEN__
		glLineWidth(width);
#else
		GLCallV(glLineWidth(width));
#endif
	}
}