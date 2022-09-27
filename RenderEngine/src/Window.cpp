#include "pch.h"
#include "Window.h"

Window::Window(int width, int height, const char* title) {

	data = CreateUnique<WindowData>(title, width, height);
	data->_window = SDL_CreateWindow("Render Engine ;)",
								SDL_WINDOWPOS_CENTERED, SDL_WINDOWPOS_CENTERED, 
								data->width, data->heigth, 
								SDL_WINDOW_OPENGL);
	if (data->_window == nullptr)
		LOG(SDL_GetError());
	data->_context = SDL_GL_CreateContext(data->_window);
	if (data->_context == nullptr)
		LOG(SDL_GetError());
}

int Window::InitGlew() {
	
	glewExperimental = GL_TRUE;
	if (glewInit() != GLEW_OK)
		return 1;

	int bufferWidth, bufferHeight;
	SDL_GL_GetDrawableSize(data->_window, &bufferWidth, &bufferHeight);
	glViewport(0, 0, bufferWidth, bufferHeight);

	LOG(glGetString(GL_VERSION));
	LOG(glGetString(GL_VENDOR));
	LOG(glGetString(GL_RENDERER));

	return 0;
}

void Window::Destroy() {
	SDL_GL_DeleteContext(data->_context);
	SDL_DestroyWindow(data->_window);
}

void Window::SwapBuffers() {
	SDL_GL_SwapWindow(data->_window);
}