#include "pch.h"
#include "OpenGLRenderAPI.h"

#include "GL/glew.h"

namespace Cober {

	void OpenGLRenderAPI::Init() {

		glEnable(GL_TEXTURE_2D);
		glEnable(GL_DEPTH_TEST);
	}

	void OpenGLRenderAPI::SetViewport(uint32_t x, uint32_t y, uint32_t width, uint32_t height) {

		glViewport(0, 0, width, height);
	}

	void OpenGLRenderAPI::SetClearColor(const glm::vec4& color) {

		glClearColor(color.r, color.g, color.b, color.a);
	}

	void OpenGLRenderAPI::SetClearColor(float red, float green, float blue, float black) {

		float r = red / 255, g = green / 255, b = blue / 255, k = black / 255;	
		glClearColor(r, g, b, k);
	}

	void OpenGLRenderAPI::Clear() {

		glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
	}
}