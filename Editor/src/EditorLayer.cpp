#include "EditorLayer.h"

#include <glm/gtc/type_ptr.hpp>
#include <glm/gtc/matrix_transform.hpp>

namespace Cober {

	//extern const std::filesystem::path _AssetPath;
	// ++++++++++++++++++++++++ RENDER TEST
	void CreateTriangle(const Ref<Shader>& shader) {

		GLfloat vertices[] = {
			-0.4f, -0.4f, 0.0f,
			 0.4f, -0.4f, 0.0f,
			 0.0f,  0.4f, 0.0f
		};

		GLuint VAO = shader->GetVAO();
		GLuint VBO = shader->GetVBO();

		glGenVertexArrays(1, &VAO);
		glBindVertexArray(VAO);

		glGenBuffers(1, &VBO);
		glBindBuffer(GL_ARRAY_BUFFER, VBO);
		glBufferData(GL_ARRAY_BUFFER, sizeof(vertices), vertices, GL_STATIC_DRAW);

		glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 0, 0);
		glEnableVertexAttribArray(0);

		glBindBuffer(GL_ARRAY_BUFFER, 0);

		glBindVertexArray(0);

		shader->SetVAO(VAO);
		shader->SetVBO(VBO);
	}

	EditorLayer::EditorLayer() : Layer("Editor") {

		_editorCamera = CreateUnique<EditorCamera>(45.0f, 1.778f, 1.0f, 1000.0f);
	}

	void EditorLayer::OnAttach() {

		_framebuffer = Framebuffer::Create(1280, 720);
		//framebuffer->SetSpecificationWidth(_window->GetWidth() / aspectRatio);
		//framebuffer->SetSpecificationHeight(_window->GetHeight() / aspectRatio);
		//framebuffer->Resize(_window->GetWidth(), _window->GetHeight());

		// ++++++++++++++++++++++++ RENDER TEST
		shaderTriangle = Shader::Create();
		CreateTriangle(shaderTriangle);
		shaderTriangle->AddShader("vertexShader.glsl", GL_VERTEX_SHADER);
		shaderTriangle->AddShader("fragmentShader.glsl", GL_FRAGMENT_SHADER);
		shaderTriangle->CompileShader();

		// ++++++++++++++++++++++++ GRID
		//shaderGrid = Shader::Create();
		//shaderGrid->AddShader("gridVertex.glsl", GL_VERTEX_SHADER);
		//shaderGrid->AddShader("gridFragment.glsl", GL_FRAGMENT_SHADER);
		//shaderGrid->CompileShader();
	}

	void EditorLayer::OnDetach() {

		_framebuffer->Unbind();
	}

	void EditorLayer::OnUpdate(Ref<Timestep> ts) {

		if (FramebufferSpecification spec = _framebuffer->GetSpecification();
			_viewportSize.x > 0.0f && _viewportSize.y > 0.0f && // zeero sized framebuffer is invalid
			(spec.Width != _viewportSize.x || spec.Height != _viewportSize.y)) 
		{
			_framebuffer->Resize((uint32_t)_viewportSize.x, (uint32_t)_viewportSize.y);
			_editorCamera->SetViewportSize(_viewportSize.x, _viewportSize.y, GAME_2D);
			// Resize ViewportScene
		}

		_framebuffer->Bind();

		// Abstrar to render static commands
		//Engine::Get().GetWindow().ClearWindow(200, 80, 20, 255);
		RenderGlobals::SetClearColor(4, 0, 8, 255);
		RenderGlobals::Clear();
		switch (Engine::Get().GetGameState())
		{
			case GameState::EDITOR:
			{
				//colors[ImGuiCol_ModalWindowDimBg] = ImVec4(0.000f, 0.000f, 0.000f, 0.586f);
				_editorCamera->OnUpdate(ts);
				//_activeScene->OnUpdateEditor(ts, _editorCamera);
				break;
			}
			case GameState::PLAY:
			{
				//colors[ImGuiCol_ModalWindowDimBg] = ImVec4(0.000f, 0.000f, 0.000f, 0.586f);
				//_activeScene->OnUpdateRuntime(ts);
				break;
			}
		}

		// Run Scene Editor or Scene Play
		// ++++++++++++++++++++++++ RENDER TEST
		glUseProgram(shaderTriangle->GetShaderProgram());

		// [+++++++++++++++++++++++++++++++++++++++++++]
		// [+++++++++++++++ Camera Test +++++++++++++++]
		// [+++++++++++++++++++++++++++++++++++++++++++]
		const glm::mat4& projectionMatrix = _editorCamera->GetProjection();
		const glm::mat4& viewMatrix = _editorCamera->GetViewMatrix();

		GLint location = glGetUniformLocation(shaderTriangle->GetShaderProgram(), "_projection");
		GLCallV(glUniformMatrix4fv(location, 1, GL_FALSE, glm::value_ptr(projectionMatrix)));
		location = glGetUniformLocation(shaderTriangle->GetShaderProgram(), "_view");
		GLCallV(glUniformMatrix4fv(location, 1, GL_FALSE, glm::value_ptr(viewMatrix)));

		glBindVertexArray(shaderTriangle->GetVAO());
		glDrawArrays(GL_TRIANGLES, 0, 3);
		glBindVertexArray(0);
		glUseProgram(0);

		// [++++++++++++++++++ GRID +++++++++++++++++++]
		// [+++++++++++++++++++++++++++++++++++++++++++]
		//glm::vec3 nearPoint{ 1.0, 0.0, 1.0 };
		//glm::vec3 farPoint{ 5.0, 0.0, 5.0 };
		//glm::vec4 color{ 1.0, 0.0, 0.0, 1.0 };
		//glUseProgram(shaderGrid->GetShaderProgram());
		//location = glGetUniformLocation(shaderGrid->GetShaderProgram(), "proj");
		//glUniformMatrix4fv(location, 1, GL_FALSE, glm::value_ptr(projectionMatrix));
		//location = glGetUniformLocation(shaderGrid->GetShaderProgram(), "view");
		//glUniformMatrix4fv(location, 1, GL_FALSE, glm::value_ptr(viewMatrix));
		//
		//glBindVertexArray(shaderGrid->GetVAO());
		//glDrawArrays(GL_TRIANGLES, 0, 3);
		//glBindVertexArray(0);
		//glUseProgram(0);

		_framebuffer->Unbind();
	}

	
	void EditorLayer::OnEvent(SDL_Event& event)
	{
		//PerspCamera.OnEvent(event);
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
			window_flags |= ImGuiWindowFlags_NoTitleBar | ImGuiWindowFlags_NoCollapse | ImGuiWindowFlags_NoResize | ImGuiWindowFlags_NoMove;
			window_flags |= ImGuiWindowFlags_NoBringToFrontOnFocus | ImGuiWindowFlags_NoNavFocus | ImGuiDragDropFlags_SourceAllowNullID;
		}

		// When using ImGuiDockNodeFlags_PassthruCentralNode, DockSpace() will render our background and handle the pass-thru hole, so we ask Begin() to not render a background.
		if (dockspace_flags & ImGuiDockNodeFlags_PassthruCentralNode)
			window_flags |= ImGuiWindowFlags_NoBackground;

		// [[----- BEGIN DOCKSPACE ----]] (EXPORT TO RENDER EDITOR PROJECT)
		ImGui::PushStyleVar(ImGuiStyleVar_WindowPadding, ImVec2(0.0f, 0.0f));
		ImGui::Begin("DockSpace Demo", &dockspaceOpen, window_flags);
		ImGui::PopStyleVar();

		if (opt_fullscreen)
			ImGui::PopStyleVar(2);

		// DockSpace
		ImGuiIO& io = ImGui::GetIO();
		ImGuiStyle& style = ImGui::GetStyle();
		float minWinSizeX = style.WindowMinSize.x;
		style.WindowMinSize.x = 300.0f;
		if (io.ConfigFlags & ImGuiConfigFlags_DockingEnable) {
			ImGuiID dockspace_id = ImGui::GetID("MyDockSpace");
			ImGui::DockSpace(dockspace_id, ImVec2(0.0f, 0.0f), dockspace_flags);
		}
		style.WindowMinSize.x = minWinSizeX;

		{	///////// MENU BAR
			if (ImGui::BeginMenuBar()) {
				if (ImGui::BeginMenu("File")) {
					if (ImGui::MenuItem("Exit"))
						Engine::Get().Close();
					
					ImGui::Checkbox("2D", &GAME_2D);
					if (ImGui::Checkbox("Fullscreen", &fullscreen))
						Engine::Get().GetWindow().ChangeFullScreen();


					ImGui::EndMenu();
				}
				ImGui::EndMenuBar();
			}
		}

		{	///////// RENDER PANELS
			_sceneHierarchyPanel.OnGuiRender();
			_contentBrowserPanel.OnGuiRender();
		}

		{	///////// IMGUI SHOW DEMO
			ImGui::ShowDemoWindow();
		}

		{	///////// SETTINGS

			ImGui::Begin("Settings");

			//std::string name = "None";
			//if (m_HoveredEntity)
			//	name = m_HoveredEntity.GetComponent<TagComponent>().Tag;
			//ImGui::Text("Hovered Entity: %s", name.c_str());

			ImGui::Text("Renderer Stats:");
			uint32_t frames = Engine::Get().GetFrames();
			ImGui::Text("Frames: %d", frames);
			ImGui::End();
		}

		if (_framebuffer != nullptr)		// Viewport
		{
			ImGui::PushStyleVar(ImGuiStyleVar_WindowPadding, ImVec2{ 0, 0 });
			ImGui::Begin("Viewport");

			ImVec2 viewportPanelSize = ImGui::GetContentRegionAvail();
			//_ViewportSize = { viewportPanelSize.x, viewportPanelSize.y };
			_editorCamera->SetViewportFocused(ImGui::IsWindowFocused());

			//Engine::Get().viewportWidth  = viewportPanelSize.x;
			//Engine::Get().viewportHeight = viewportPanelSize.y;

			/*float aspectRatio = viewportPanelSize.x / viewportPanelSize.y;
			_ViewportSize = { _width / aspectRatio,
							  _height / aspectRatio };*/

			_viewportSize = { viewportPanelSize.x,
							   viewportPanelSize.y };

			uint32_t textureID = _framebuffer->GetColorAttachmentRendererID();
			ImGui::Image((void*)textureID, ImVec2{ _viewportSize.x, _viewportSize.y }, ImVec2{ 0, 1 }, ImVec2{ 1, 0 });

			if (ImGui::BeginDragDropTarget()) {
				if (const ImGuiPayload* payload = ImGui::AcceptDragDropPayload("CONTENT_BROWSER_ITEM")) {
					const wchar_t* path = (const wchar_t*)payload->Data;
					_filePath = (std::filesystem::path(SOLUTION_DIR + (std::string)"assets") / path).string();
					std::cout << _filePath.c_str() << std::endl;
				}
				ImGui::EndDragDropTarget();
			}

			ImGui::PopStyleVar();
			ImGui::End();
		}
		ImGui::End();
	}
}