#include "EditorLayer.h"

#include <glm/gtc/type_ptr.hpp>
#include <glm/gtc/matrix_transform.hpp>

namespace Cober {

	//extern const std::filesystem::path _AssetPath;
	EditorLayer::EditorLayer() : Layer("Editor") 
	{
		_editorCamera = CreateUnique<EditorCamera>(45.0f, 1.778f, 0.01f, 1000.0f);

		new ViewportPanel();
		new SceneHierarchyPanel();
		new ContentBrowserPanel();
		new DataPanel();
		new MenuPanel();
	}

	void EditorLayer::OnAttach() {

		_editorScene = Scene::Create();
		//_editorScene = Scene::Load("EditorSceneTest.txt");
		_activeScene = _editorScene;

		ViewportPanel::Get().CreateFramebuffer(1280, 720);
		SceneHierarchyPanel::Get().SetContext(_activeScene);

		_activeScene->SetDefaultEntity(_activeScene->GetHoveredEntity());
		_activeScene->OnRuntimeStart(_activeScene);
	}

	void EditorLayer::OnDetach() {

		ViewportPanel::Get().UnbindFramebuffer();

		_editorScene  = nullptr;
		_activeScene  = nullptr;
		_editorCamera = nullptr;
	}

	void EditorLayer::OnUpdate(Ref<Timestep> ts) {

		ViewportPanel::Get().ResizeViewport(_editorCamera, _activeScene, Engine::Get().GetGameMode());
		ViewportPanel::Get().BindFramebuffer();

		ViewportPanel::Get().RenderSkybox();

		ViewportPanel::Get().FBOClearAttachments(1, -1);

		switch (Engine::Get().GetGameState()) {
			case GameState::EDITOR: {
				//colors[ImGuiCol_ModalWindowDimBg] = ImVec4(0.000f, 0.000f, 0.000f, 0.586f);
				_editorCamera->OnUpdate(ts);
				_activeScene->OnUpdateEditor(ts, _editorCamera);
				break;
			}
			case GameState::RUNTIME_EDITOR: {
				//colors[ImGuiCol_ModalWindowDimBg] = ImVec4(0.000f, 0.000f, 0.000f, 0.586f);
				_activeScene->OnUpdateRuntime(ts, _editorCamera);
				break;
			}
		}

		ViewportPanel::Get().SetCursorEntity(_activeScene, _activeScene->GetHoveredEntity());

		if (ImGui::IsMouseClicked(0) && _activeScene->GetHoveredEntity().GetIndex() != -1)
			SceneHierarchyPanel::Get().SetSelectedEntity(_activeScene->GetHoveredEntity());

		ViewportPanel::Get().UnbindFramebuffer();
	}

	
	void EditorLayer::OnEvent(SDL_Event& event)
	{
		_editorCamera->OnEvent(event);

		ViewportPanel::Get().OnEvent(event, _activeScene->GetHoveredEntity());
		//eventHandler->SubscribeToEvent<CollisionEvent>(this, &Cober::Events::OnCollision);
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

		Entity& hoveredEntity = _activeScene->GetHoveredEntity();
		SceneHierarchyPanel::Get().OnGuiRender(hoveredEntity);
		ContentBrowserPanel::Get().OnGuiRender();
		ViewportPanel::Get().OnGuiRender(_editorCamera, _activeScene, hoveredEntity);
		DataPanel::Get().OnGuiRender(Engine::Get().GetGameMode(), hoveredEntity);
		MenuPanel::Get().OnGuiRender(_editorCamera, _activeScene, _editorScene, Engine::Get().GetGameMode(), Engine::Get().GetDebugMode());

		ViewportPanel::Get().PlayButtonBar(_editorScene, _activeScene, Engine::Get().GetGameState());

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
			//window_flags |= ImGuiWindowFlags_NoTitleBar |  ImGuiWindowFlags_NoCollapse | ImGuiWindowFlags_NoResize | ImGuiWindowFlags_NoMove;
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
		//float minWinSizeY = style.WindowMinSize.y;
		style.WindowMinSize.x = 200.0f;
		//style.WindowMinSize.y = 25.0f;
		if (io.ConfigFlags & ImGuiConfigFlags_DockingEnable) {
			ImGuiID dockspace_id = ImGui::GetID("MyDockSpace");
			ImGui::DockSpace(dockspace_id, ImVec2(0.0f, 0.0f), dockspace_flags);
		}
		style.WindowMinSize.x = minWinSizeX;
		//style.WindowMinSize.y = minWinSizeY;
	}

	void EditorLayer::EndDockspace() {

		ImGui::End();
	}
}