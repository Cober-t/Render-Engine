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

	}

	void EditorLayer::OnAttach() {

		_framebuffer = Framebuffer::Create(1280, 720);
		//framebuffer->SetSpecificationWidth(_window->GetWidth() / aspectRatio);
		//framebuffer->SetSpecificationHeight(_window->GetHeight() / aspectRatio);
		//framebuffer->Resize(_window->GetWidth(), _window->GetHeight());

		// ++++++++++++++++++++++++ RENDER TEST
		shader = Shader::Create();
		CreateTriangle(shader);
		shader->AddShader("vertexShader.glsl", GL_VERTEX_SHADER);
		shader->AddShader("fragmentShader.glsl", GL_FRAGMENT_SHADER);
		shader->CompileShader();
	}

	void EditorLayer::OnDetach() {

		_framebuffer->Unbind();
	}

	void EditorLayer::OnUpdate(Ref<Timestep> ts) {

		_framebuffer->Bind();

		Engine::Get().GetWindow().ClearWindow(200, 80, 20, 255);
		
		// Run Scene Editor or Scene Play
		// ++++++++++++++++++++++++ RENDER TEST
		glUseProgram(shader->GetShaderProgram());
		glBindVertexArray(shader->GetVAO());
		glDrawArrays(GL_TRIANGLES, 0, 3);
		glBindVertexArray(0);
		glUseProgram(0);

		_framebuffer->Unbind();
	}

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
			window_flags |= ImGuiWindowFlags_NoBringToFrontOnFocus | ImGuiWindowFlags_NoNavFocus;
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
		if (io.ConfigFlags & ImGuiConfigFlags_DockingEnable) {
			ImGuiID dockspace_id = ImGui::GetID("MyDockSpace");
			ImGui::DockSpace(dockspace_id, ImVec2(0.0f, 0.0f), dockspace_flags);
		}

		if (ImGui::BeginMenuBar()) {
			if (ImGui::BeginMenu("File")) {
				if (ImGui::MenuItem("Exit"))
					Engine::Get().Close();

				ImGui::EndMenu();
			}
			ImGui::EndMenuBar();
		}

		if (_framebuffer != nullptr)		// Viewport
		{
			glm::vec2 _ViewportSize = { 0.0f, 0.0f };
			ImGui::PushStyleVar(ImGuiStyleVar_WindowPadding, ImVec2{ 0, 0 });
			ImGui::Begin("Viewport");

			ImVec2 viewportPanelSize = ImGui::GetContentRegionAvail();
			//_ViewportSize = { viewportPanelSize.x, viewportPanelSize.y };

			//Engine::Get().viewportWidth  = viewportPanelSize.x;
			//Engine::Get().viewportHeight = viewportPanelSize.y;

			/*float aspectRatio = viewportPanelSize.x / viewportPanelSize.y;
			_ViewportSize = { _width / aspectRatio,
							  _height / aspectRatio };*/

			_ViewportSize = { viewportPanelSize.x,
							   viewportPanelSize.y };

			uint32_t textureID = _framebuffer->GetColorAttachmentRendererID();
			ImGui::Image((void*)textureID, ImVec2{ _ViewportSize.x, _ViewportSize.y }, ImVec2{ 0, 1 }, ImVec2{ 1, 0 });
			ImGui::PopStyleVar();
			ImGui::End();
		}
		ImGui::End();
	}
}