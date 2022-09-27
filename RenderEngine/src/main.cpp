#include "pch.h"

#include "Window.h"
#include "ImGuiCore.h"
#include "RenderSystem/Shader.h"
#include "RenderSystem/Framebuffer.h"


static void glfw_error_callback(int error, const char* description) {
	fprintf(stderr, "Glfw Error %d: %s\n", error, description);
}

GLuint VAO, VBO, shaderProgram;
static Window* window;

void CreateTriangle() {

	GLfloat vertices[] = {
		-0.4f, -0.4f, 0.0f,
		 0.4f, -0.4f, 0.0f,
		 0.0f,  0.4f, 0.0f
	};

	glGenVertexArrays(1, &VAO);
	glBindVertexArray(VAO);

		glGenBuffers(1, &VBO);
		glBindBuffer(GL_ARRAY_BUFFER, VBO);
			glBufferData(GL_ARRAY_BUFFER, sizeof(vertices), vertices, GL_STATIC_DRAW);

			glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 0, 0);
			glEnableVertexAttribArray(0);

		glBindBuffer(GL_ARRAY_BUFFER, 0);

	glBindVertexArray(0);
}

void AddShader(GLuint theProgram, const char* shaderCode, GLenum shaderType) {
	
	GLuint theShader = glCreateShader(shaderType);

	const GLchar* theCode[1];
	theCode[0] = shaderCode;

	GLint codeLength[1];
	codeLength[0] = strlen(shaderCode);

	glShaderSource(theShader, 1, theCode, codeLength);
	glCompileShader(theShader);

	GLint result = 0;
	GLchar eLog[1024] = { 0 };

	glGetShaderiv(theShader, GL_COMPILE_STATUS, &result);
	if (!result)
	{
		glGetShaderInfoLog(theShader, sizeof(eLog), NULL, eLog);
		printf("Error compiling the %d shader: '%s'\n", shaderType, eLog);
		return;
	}

	glAttachShader(theProgram, theShader);
}

void CompileShaders() {
	
	shaderProgram = glCreateProgram();

	if (!shaderProgram) {
		printf("Error creating shader program!\n");
		return;
	}
	
	Ref<Shader> shader = CreateRef<Shader>();
	std::string vertex_s = shader->ReadFile("vertexShader.glsl");
	std::string fragment_s = shader->ReadFile("fragmentShader.glsl");

	AddShader(shaderProgram, vertex_s.c_str(), GL_VERTEX_SHADER);
	AddShader(shaderProgram, fragment_s.c_str(), GL_FRAGMENT_SHADER);

	GLint result = 0;
	GLchar eLog[1024] = { 0 };

	glLinkProgram(shaderProgram);
	glGetProgramiv(shaderProgram, GL_LINK_STATUS, &result);
	if (!result)
	{
		glGetProgramInfoLog(shaderProgram, sizeof(eLog), NULL, eLog);
		printf("Error linking program: '%s'\n", eLog);
		return;
	}

	glValidateProgram(shaderProgram);
	glGetShaderiv(shaderProgram, GL_VALIDATE_STATUS, &result);
	if (!result)
	{
		glGetShaderInfoLog(shaderProgram, sizeof(eLog), NULL, eLog);
		printf("Error validating program: '%s'\n", eLog);
		return;
	}
}

void GameLoop() {

	CreateTriangle();
	CompileShaders();

	bool isRunning = true;
	while (isRunning) {

		int display_w, display_h;
		SDL_GL_GetDrawableSize(window->GetWindow(), &display_w, &display_h);
		glViewport(0, 0, display_w, display_h);

		Ref<Framebuffer> framebuffer = Framebuffer::Create(window->GetWidth(), window->GetHeight());
		glm::vec2 _ViewportSize{ 0.0, 0.0 };
		if (FramebufferSpecification spec = framebuffer->GetSpecification();
			_ViewportSize.x > 0.0f && _ViewportSize.y > 0.0f && // zero sized framebuffer is invalid
			(spec.Width != _ViewportSize.x || spec.Height != _ViewportSize.y))
		{
			framebuffer->Resize((uint32_t)_ViewportSize.x, (uint32_t)_ViewportSize.y);
		}
		framebuffer->Bind();
		glClearColor(0.8f, 0.3f, 0.1f, 1.0f);
		glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);


		// RENDER
		// [[-----------
		glUseProgram(shaderProgram);
		glBindVertexArray(VAO);
		glDrawArrays(GL_TRIANGLES, 0, 3);	
		glBindVertexArray(0);
		glUseProgram(0);
		// [[-----------

		framebuffer->Unbind();

		GUI::Begin();
		GUI::Render(framebuffer);
		GUI::End();

		// Inputs
		SDL_Event event;
		while (SDL_PollEvent(&event)) {

			ImGui_ImplSDL2_ProcessEvent(&event);

			switch (event.type) {
			case SDL_QUIT:
				isRunning = false;
				break;
			case SDL_KEYDOWN:
				if (event.key.keysym.sym == SDLK_ESCAPE)
					isRunning = false;
				break;
			}
		}

		window->SwapBuffers();
	}
}

int main(int argc, char *argv[]) {

	// Initialice SDL2
	if (SDL_INIT_EVERYTHING)
		LOG(SDL_GetError());

	// Init Window
	window = new Window();
	if (window == NULL)
		return 1;

	// Setup SDL Window properties
	SDL_GL_SetAttribute(SDL_GL_CONTEXT_MAJOR_VERSION, 4);
	SDL_GL_SetAttribute(SDL_GL_CONTEXT_MINOR_VERSION, 3);
	//SDL_GL_SetAttribute(SDL_GL_CONTEXT_PROFILE_MASK, SDL_GL_CONTEXT_PROFILE_CORE);
	SDL_GL_SetAttribute(SDL_GL_DOUBLEBUFFER, 1);
	SDL_GL_SetAttribute(SDL_GL_DEPTH_SIZE, 16);

	// Init GLEW
	if (window->InitGlew())
		return 1;
	GUI::InitImGui(window);

	GameLoop();
	
	// Clean
	GUI::Destroy();
	window->Destroy();
	SDL_Quit();

	return 1;
}