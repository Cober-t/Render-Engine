#include "pch.h"

#include "ViewportPanel.h"

#include <filesystem>
#include <imgui/imgui.h>

namespace Cober {

	ViewportPanel::ViewportPanel(uint32_t width, uint32_t heigth) {

		//FramebufferSpecification fbSpec;
		//fbSpec.Width = 1280;
		//fbSpec.Height = 720;
		//fbSpec.Attachments = { FramebufferTextureFormat::RGBA8,FramebufferTextureFormat::RED_INTEGER,FramebufferTextureFormat::Depth };
		_fbo = Framebuffer::Create(1280, 720);
	}

	ViewportPanel::~ViewportPanel() {

	}

	void ViewportPanel::BindFramebuffer() {

		_fbo->Bind();  
	}

	void ViewportPanel::UnbindFramebuffer() {

		_fbo->Unbind();
	}

	void ViewportPanel::SetCursorEntity(Ref<Scene>& activeScene, Entity& hoveredEntity) {

		auto [mx, my] = ImGui::GetMousePos();
		mx -= _minViewportBound.x;
		my -= _minViewportBound.y;
		glm::vec2 viewportSize = _maxViewportBound - _minViewportBound;
		my = viewportSize.y - my;
		int mouseX = (int)mx;
		int mouseY = (int)my;

		if (mouseX >= 0 && mouseY >= 0 && mouseX < (int)_viewportSize.x && mouseY < (int)_viewportSize.y) {
			int pixelData = _fbo->ReadPixel(1, mouseX, mouseY);
			pixelData == -1 ? activeScene->SetDefaultEntity(hoveredEntity) : activeScene->GetEntity(pixelData, hoveredEntity);
			//std::cout << "PixelData: " << pixelData << "\tHoveredEntity: " << hoveredEntity.GetIndex() << std::endl;
		}
	}

	void ViewportPanel::DrawGrid() {

	}

	void ViewportPanel::ResizeViewport(Ref<EditorCamera> editorCamera, Ref<Scene>& activeScene, bool& game2D) {

		if (FramebufferSpecification spec = _fbo->GetSpecification();
			_viewportSize.x > 0.0f && _viewportSize.y > 0.0f && // zeero sized framebuffer is invalid
			(spec.Width != _viewportSize.x || spec.Height != _viewportSize.y))
		{
			_fbo->Resize((uint32_t)_viewportSize.x, (uint32_t)_viewportSize.y);
			editorCamera->SetViewportSize(_viewportSize.x, _viewportSize.y, game2D);
			//activeScene->OnViewportResize((uint32_t)_viewportSize.x, (uint32_t)_viewportSize.y);
			// Resize ViewportScene ...
		}
	}

	void ViewportPanel::OnGuiRender(Ref<EditorCamera> editorCamera) {

		ImGui::PushStyleVar(ImGuiStyleVar_WindowPadding, ImVec2{ 0, 0 });
		ImGui::Begin("Viewport");

		// Hovered Entity
		auto viewportMinRegion = ImGui::GetWindowContentRegionMin();
		auto viewportMaxRegion = ImGui::GetWindowContentRegionMax();
		auto viewportOffset = ImGui::GetWindowPos();
		_minViewportBound = { viewportMinRegion.x + viewportOffset.x, viewportMinRegion.y + viewportOffset.y };
		_maxViewportBound = { viewportMaxRegion.x + viewportOffset.x, viewportMaxRegion.y + viewportOffset.y };

		_viewportFocused = ImGui::IsWindowFocused();
		_viewportHovered = ImGui::IsWindowHovered();
		//Application::Get().GetImGuiLayer()->BlockEvents(!m_ViewportFocused && !m_ViewportHovered);

		ImVec2 viewportPanelSize = ImGui::GetContentRegionAvail();
		editorCamera->SetViewportFocused(ImGui::IsWindowFocused());

		_viewportSize = { viewportPanelSize.x, viewportPanelSize.y };

		uint32_t textureID = _fbo->GetColorAttachmentRenderID();
		ImGui::Image(reinterpret_cast<void*>(textureID), ImVec2{ _viewportSize.x, _viewportSize.y }, ImVec2{ 0, 1 }, ImVec2{ 1, 0 });

		if (ImGui::BeginDragDropTarget()) {
			if (const ImGuiPayload* payload = ImGui::AcceptDragDropPayload("CONTENT_BROWSER_ITEM")) {
				const wchar_t* path = (const wchar_t*)payload->Data;
				//_filePath = (std::filesystem::path(SOLUTION_DIR + (std::string)"assets") / path).string();
				//std::cout << _filePath.c_str() << std::endl;
			}
			ImGui::EndDragDropTarget();
		}

		ImGui::PopStyleVar();
		ImGui::End();
	}

	void ViewportPanel::PlayButtonBar(GameState gameState, Unique<SceneHierarchyPanel>& sceneHierarchyPanel, Ref<Scene>& activeScene, Ref<Scene>& editorScene) {

		ImGui::PushStyleVar(ImGuiStyleVar_WindowPadding, ImVec2(0, 2));
		ImGui::PushStyleVar(ImGuiStyleVar_ItemInnerSpacing, ImVec2(0, 0));
		ImGui::PushStyleColor(ImGuiCol_Button, ImVec4(0, 0, 0, 0));
		auto& colors = ImGui::GetStyle().Colors;
		const auto& buttonHovered = colors[ImGuiCol_ButtonHovered];
		ImGui::PushStyleColor(ImGuiCol_ButtonHovered, ImVec4(buttonHovered.x, buttonHovered.y, buttonHovered.z, 0.5f));
		const auto& buttonActive = colors[ImGuiCol_ButtonActive];
		ImGui::PushStyleColor(ImGuiCol_ButtonActive, ImVec4(buttonActive.x, buttonActive.y, buttonActive.z, 0.5f));

		ImGui::Begin("##toolbar", nullptr, ImGuiWindowFlags_NoDecoration | ImGuiWindowFlags_NoScrollbar | ImGuiWindowFlags_NoScrollWithMouse);

		float size = ImGui::GetWindowHeight() - 4.0f;
		const char* icon = gameState == GameState::EDITOR ? "I>" : "||";
		ImGui::SetCursorPosX((ImGui::GetWindowContentRegionMax().x * 0.5f) - (size * 0.5f));

		if (ImGui::Button(icon, ImVec2(size, size))) {
			activeScene = editorScene;	////// TEST
			if (gameState == GameState::EDITOR) {
				Engine::Get().SetGameState(GameState::RUNTIME_EDITOR);
				activeScene = Scene::Copy(editorScene);
				sceneHierarchyPanel->SetContext(activeScene);
				activeScene->OnRuntimeStart(activeScene);
			}
			else if (gameState == GameState::RUNTIME_EDITOR) {
				Engine::Get().SetGameState(GameState::EDITOR);
				activeScene->OnRuntimeStop();
				activeScene = editorScene;
				sceneHierarchyPanel->SetContext(activeScene);
			}
		}
		ImGui::PopStyleVar(2);
		ImGui::PopStyleColor(3);
		ImGui::End();
	}
}