#include "pch.h"
#include "GuiLayer.h"

#include "ImGui.h"

namespace Cober {

	uint32_t _width, _height;

	void Style() {

		ImGuiStyle* style = &ImGui::GetStyle();
		auto& colors = ImGui::GetStyle().Colors;

		colors[ImGuiCol_Text]					= IMGUI_WHITE;
		colors[ImGuiCol_TextDisabled]			= IMGUI_GRAY;
		colors[ImGuiCol_WindowBg]				= IMGUI_DARK;
		colors[ImGuiCol_ChildBg]				= IMGUI_DARK_GRAY;
		colors[ImGuiCol_PopupBg]				= IMGUI_DARK;
		colors[ImGuiCol_Border]					= IMGUI_DARK_GRAY;
		colors[ImGuiCol_BorderShadow]			= IMGUI_DARKEST;
		colors[ImGuiCol_FrameBg]				= IMGUI_GRAY_9;
		colors[ImGuiCol_FrameBgHovered]			= IMGUI_GRAY_8;
		colors[ImGuiCol_FrameBgActive]			= IMGUI_DARK_GRAY;
		colors[ImGuiCol_TitleBg]				= IMGUI_GRAY_9;
		colors[ImGuiCol_TitleBgActive]			= IMGUI_GRAY_9;
		colors[ImGuiCol_TitleBgCollapsed]		= IMGUI_GRAY_9;
		colors[ImGuiCol_MenuBarBg]				= IMGUI_GRAY_9;
		colors[ImGuiCol_ScrollbarBg]			= IMGUI_GRAY_9;
		colors[ImGuiCol_ScrollbarGrab]			= IMGUI_GRAY_7;
		colors[ImGuiCol_ScrollbarGrabHovered]	= IMGUI_GRAY_6;
		colors[ImGuiCol_ScrollbarGrabActive]	= IMGUI_ORANGE;
		colors[ImGuiCol_CheckMark]				= IMGUI_WHITE;
		colors[ImGuiCol_SliderGrab]				= IMGUI_GRAY_5;
		colors[ImGuiCol_SliderGrabActive]		= IMGUI_ORANGE;
		colors[ImGuiCol_Button]					= IMGUI_FULL_OPACITY;
		colors[ImGuiCol_ButtonHovered]			= IMGUI_MID_GRAY_OPACITY_5;
		colors[ImGuiCol_ButtonActive]			= IMGUI_MID_GRAY_OPACITY_4;
		colors[ImGuiCol_Header]					= IMGUI_GRAY_6;
		colors[ImGuiCol_HeaderHovered]			= IMGUI_GRAY_4;
		colors[ImGuiCol_HeaderActive]			= IMGUI_GRAY_4;
		colors[ImGuiCol_Separator]				= colors[ImGuiCol_Border];
		colors[ImGuiCol_SeparatorHovered]		= IMGUI_ORANGE;
		colors[ImGuiCol_SeparatorActive]		= IMGUI_ORANGE;
		colors[ImGuiCol_ResizeGrip]				= IMGUI_WHITE_OPACITY_7;
		colors[ImGuiCol_ResizeGripHovered]		= IMGUI_WHITE_OPACITY_3;
		colors[ImGuiCol_ResizeGripActive]		= IMGUI_ORANGE;
		colors[ImGuiCol_Tab]					= IMGUI_GRAY_10;
		colors[ImGuiCol_TabHovered]				= IMGUI_GRAY_6;
		colors[ImGuiCol_TabActive]				= IMGUI_GRAY_8;
		colors[ImGuiCol_TabUnfocused]			= IMGUI_GRAY_10;
		colors[ImGuiCol_TabUnfocusedActive]		= IMGUI_GRAY_8;
		//colors[ImGuiCol_DockingPreview]		= IMGUI_ORANGE_LOG_OPACITY;
		//colors[ImGuiCol_DockingEmptyBg]		= IMGUI_GRAY_9;
		colors[ImGuiCol_PlotLines]				= IMGUI_GRAY_4;
		colors[ImGuiCol_PlotLinesHovered]		= IMGUI_ORANGE;
		colors[ImGuiCol_PlotHistogram]			= IMGUI_GRAY_3;
		colors[ImGuiCol_PlotHistogramHovered]	= IMGUI_ORANGE;
		colors[ImGuiCol_TextSelectedBg]			= IMGUI_WHITE_OPACITY_8;
		colors[ImGuiCol_DragDropTarget]			= IMGUI_ORANGE;
		colors[ImGuiCol_NavHighlight]			= IMGUI_ORANGE;
		colors[ImGuiCol_NavWindowingHighlight]  = IMGUI_ORANGE;
		colors[ImGuiCol_NavWindowingDimBg]		= IMGUI_BLACK_OPACITY_5;

		colors[ImGuiCol_ModalWindowDimBg]		= IMGUI_BLACK_OPACITY_5;

		style->ChildRounding = 4.0f;
		style->FrameBorderSize = 1.0f;
		style->FrameRounding = 2.0f;
		style->GrabMinSize = 7.0f;
		style->PopupRounding = 2.0f;
		style->ScrollbarRounding = 12.0f;
		style->ScrollbarSize = 13.0f;
		style->TabBorderSize = 1.0f;
		style->TabRounding = 0.0f;
		style->WindowRounding = 20.0f;
		colors[ImGuiCol_TitleBgCollapsed] = ImVec4{ 0.07f, 0.07f, 0.07f, 1.0f };
	}

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
	
		Style();
		//ImGui::StyleColorsDark();
		
		
		ImGui_ImplSDL2_InitForOpenGL(Engine::Get().GetWindow().GetNativeWindow(), Engine::Get().GetWindow().GetContext());
		ImGui_ImplOpenGL3_Init(glsl_version);

		_width  = Engine::Get().GetWindow().GetWidth();
		_height = Engine::Get().GetWindow().GetHeight();
	}

	void GuiLayer::OnDetach() {

		Logger::Log("ImGui Destructor called!");
	}

	void GuiLayer::OnEvent(SDL_Event& event) {

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