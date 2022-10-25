#include "pch.h"
#include "GuiLayer.h"

#include "ImGui.h"

namespace Cober {

	uint32_t _width, _height;
	std::string _fontsPath = SOLUTION_DIR + (std::string)"assets/fonts/";

	GuiLayer::GuiLayer(const char* glVersion)
	: glsl_version(glVersion) 
	{
	}

	GuiLayer::~GuiLayer() {

		ImGui_ImplOpenGL3_Shutdown();
		ImGui_ImplSDL2_Shutdown();
		ImGui::DestroyContext();
	}

	void GuiLayer::OnAttach() {

		IMGUI_CHECKVERSION();
		ImGui::CreateContext();
		ImGuiIO& io = ImGui::GetIO(); (void)io;
		io.ConfigFlags |= ImGuiConfigFlags_DockingEnable;
		io.ConfigFlags |= ImGuiConfigFlags_ViewportsEnable;

		ImFontConfig cfg;
		float SCALE = 1.0f;
		cfg.SizePixels = 13 * SCALE;
		std::string fontFilePath = _fontsPath + (std::string)"Cousine-Regular.ttf";
		io.Fonts->AddFontFromFileTTF(fontFilePath.c_str(), cfg.SizePixels);
	
		//Style();
		ImGui::StyleColorsDark();
		
		ImGui_ImplSDL2_InitForOpenGL(Engine::Get().GetWindow().GetNativeWindow(), Engine::Get().GetWindow().GetContext());
		ImGui_ImplOpenGL3_Init(glsl_version);

		_width  = Engine::Get().GetWindow().GetWidth();
		_height = Engine::Get().GetWindow().GetHeight();
	}

	void GuiLayer::OnDetach() {

		Logger::Log("ImGui Destructor called!");
	}

	void GuiLayer::OnEvent(SDL_Event& event) {

		auto gameState = Engine::Get().GetGameState();
		if (gameState == GameState::EDITOR || gameState == GameState::RUNTIME_EDITOR)
			ImGui_ImplSDL2_ProcessEvent(&event);
	}

	void GuiLayer::Begin() {
		ImGui_ImplOpenGL3_NewFrame();
		ImGui_ImplSDL2_NewFrame();
		ImGui::NewFrame();
	}

	void GuiLayer::End() {
		ImGui::Render();
		ImGui_ImplOpenGL3_RenderDrawData(ImGui::GetDrawData());

		ImGuiIO& io = ImGui::GetIO(); (void)io;
		if (io.ConfigFlags & ImGuiConfigFlags_ViewportsEnable)
		{
			SDL_Window* backup_current_window = SDL_GL_GetCurrentWindow();
			SDL_GLContext backup_current_context = SDL_GL_GetCurrentContext();
			ImGui::UpdatePlatformWindows();
			ImGui::RenderPlatformWindowsDefault();
			SDL_GL_MakeCurrent(backup_current_window, backup_current_context);
		}
	}

}