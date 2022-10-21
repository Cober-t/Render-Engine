#include "pch.h"
#include "OpenGLRenderAPI.h"

#include "GL/glew.h"

namespace Cober {

	void OpenGLRenderAPI::Init() {

#ifdef _DEBUG_
		glEnable(GL_DEBUG_OUTPUT);
		glEnable(GL_DEBUG_OUTPUT_SYNCHRONOUS);
		glDebugMessageCallback(OpenGLMessageCallback, nullptr);

		glDebugMessageControl(GL_DONT_CARE, GL_DONT_CARE, GL_DEBUG_SEVERITY_NOTIFICATION, 0, NULL, GL_FALSE);
#endif
		//glEnable(GL_TEXTURE_2D);
		glEnable(GL_BLEND);
		glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);

		glEnable(GL_DEPTH_TEST);
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
		uint32_t count = indexCount ? vertexArray->GetIndexBuffer()->GetCount() : indexCount;
		GLCallV(glDrawElements(GL_TRIANGLES, count, GL_UNSIGNED_INT, nullptr));
		GLCallV(glBindTexture(GL_TEXTURE_2D, 0));
	}
}