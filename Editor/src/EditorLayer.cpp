#include "EditorLayer.h"

#include <glm/gtc/type_ptr.hpp>
#include <glm/gtc/matrix_transform.hpp>

namespace Cober {

	//extern const std::filesystem::path _AssetPath;
	EditorLayer::EditorLayer() : Layer("Editor") 
	{

		_editorCamera = CreateUnique<EditorCamera>(45.0f, 1.778f, 1.0f, 1000.0f);

		_editorScene = Scene::Create();
		_activeScene = _editorScene;

		_contentBrowserPanel = CreateUnique<ContentBrowserPanel>();
		_sceneHierarchyPanel = CreateUnique<SceneHierarchyPanel>();
		_viewportPanel = CreateUnique<ViewportPanel>();
		_menuPanel = CreateUnique<MenuPanel>();
		_dataPanel = CreateUnique<DataPanel>();
	}

	void EditorLayer::OnAttach() {


		_sceneHierarchyPanel->SetContext(_activeScene);

		// Move to PLAY/STOP button
		_activeScene->OnRuntimeStart();
	}

	void EditorLayer::OnDetach() {

		_viewportPanel->UnbindFramebuffer();

		_editorScene = nullptr;
		_activeScene = nullptr;
		_editorCamera = nullptr;
	}

	void EditorLayer::OnUpdate(Ref<Timestep> ts) {

		_viewportPanel->ResizeViewport(_editorCamera, GAME_2D);

		_viewportPanel->BindFramebuffer();

		switch (Engine::Get().GetGameState()) {
			case GameState::EDITOR: {
				//colors[ImGuiCol_ModalWindowDimBg] = ImVec4(0.000f, 0.000f, 0.000f, 0.586f);
				_editorCamera->OnUpdate(ts);
				_activeScene->OnUpdateEditor(ts, _editorCamera);
				break;
			}
			case GameState::PLAY: {
				//colors[ImGuiCol_ModalWindowDimBg] = ImVec4(0.000f, 0.000f, 0.000f, 0.586f);
				//_activeScene->OnUpdateRuntime(ts);
				break;
			}
		}

		_viewportPanel->UnbindFramebuffer();
	}

	
	void EditorLayer::OnEvent(SDL_Event& event)
	{
		_editorCamera->OnEvent(event);
	}

	/*
	bool EditorLayer::OnKeyPressed(KeyPressedEvent& event) {

		if (event.GetRepeatCount() > 0)
			return false;

		bool control = Input::IsKeyPressed(Key::LeftControl) || Input::IsKeyPressed(Key::RightControl);
		bool shift = Input::IsKeyPressed(Key::LeftShift) || Input::IsKeyPressed(Key::RightShift);

		if (m_SceneState == GameState::EDIT)
			switch (event.GetKeyCode()) {
			case Key::N:
				if (control)
					NewScene();
				break;
			case Key::O:
				if (control)
					OpenFile();
				break;
			case Key::S:
				if (control && shift)
					SaveSceneAs();
				else if (control)
					SaveScene();
				break;
			case Key::D:
				if (control)
					DuplicateSelectedEntity();
				break;
	}
	*/

	void EditorLayer::OnGuiRender() {

		InitDockspace();

		_sceneHierarchyPanel->OnGuiRender();
		_contentBrowserPanel->OnGuiRender();
		_viewportPanel->OnGuiRender(_editorCamera);
		_menuPanel->OnGuiRender(GAME_2D);
		_dataPanel->OnGuiRender(GAME_2D);

		ImGui::ShowDemoWindow();

		EndDockspace();
	}

	void EditorLayer::InitDockspace() {

		// [[----- Init variables & dockspace -----]] (from Cherno)
		static bool dockspaceOpen = true;
		static bool opt_fullscreen_persistant = true;
		bool opt_fullscreen = opt_fullscreen_persistant;
		static ImGuiDockNodeFlags dockspace_flags = ImGuiDockNodeFlags_None;

		// We are using the ImGuiWindowFlags_NoDocking flag to make the parent window not dockable into,
		// because it would be confusing to have two docking targets within each others.
		ImGuiWindowFlags window_flags = ImGuiWindowFlags_MenuBar | ImGuiWindowFlags_NoDocking;
		if (opt_fullscreen)
		{
			ImGuiViewport* viewport = ImGui::GetMainViewport();
			ImGui::SetNextWindowPos(viewport->Pos);
			ImGui::SetNextWindowSize(viewport->Size);
			ImGui::SetNextWindowViewport(viewport->ID);
			ImGui::PushStyleVar(ImGuiStyleVar_WindowRounding, 0.0f);
			ImGui::PushStyleVar(ImGuiStyleVar_WindowBorderSize, 0.0f);
			window_flags |= /*ImGuiWindowFlags_NoTitleBar |*/  ImGuiWindowFlags_NoCollapse | ImGuiWindowFlags_NoResize;/* | ImGuiWindowFlags_NoMove */
			window_flags |= ImGuiWindowFlags_NoBringToFrontOnFocus | ImGuiWindowFlags_NoNavFocus | ImGuiDragDropFlags_SourceAllowNullID;
		}

		// When using ImGuiDockNodeFlags_PassthruCentralNode, DockSpace() will render our background and handle the pass-thru hole, so we ask Begin() to not render a background.
		if (dockspace_flags & ImGuiDockNodeFlags_PassthruCentralNode)
			window_flags |= ImGuiWindowFlags_NoBackground;

		if (!dockspaceOpen)
			Engine::Get().Close();

		// [[----- BEGIN DOCKSPACE ----]]
		ImGui::PushStyleVar(ImGuiStyleVar_WindowPadding, ImVec2(0.0f, 0.0f));
		const char* title = Engine::Get().GetWindow().GetTitle().c_str();
		ImGui::Begin(title, &dockspaceOpen, window_flags);
		ImGui::PopStyleVar();

		if (opt_fullscreen)
			ImGui::PopStyleVar(2);

		// DockSpace
		ImGuiIO& io = ImGui::GetIO();
		ImGuiStyle& style = ImGui::GetStyle();
		float minWinSizeX = style.WindowMinSize.x;
		float minWinSizeY = style.WindowMinSize.y;
		style.WindowMinSize.x = 200.0f;
		style.WindowMinSize.y = 200.0f;
		if (io.ConfigFlags & ImGuiConfigFlags_DockingEnable) {
			ImGuiID dockspace_id = ImGui::GetID("MyDockSpace");
			ImGui::DockSpace(dockspace_id, ImVec2(0.0f, 0.0f), dockspace_flags);
		}
		style.WindowMinSize.x = minWinSizeX;
		style.WindowMinSize.y = minWinSizeY;
	}

	void EditorLayer::EndDockspace() {

		ImGui::End();
	}
}