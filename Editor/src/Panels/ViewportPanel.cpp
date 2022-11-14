#include "pch.h"

#include "ViewportPanel.h"

#include <filesystem>
#include <imgui/imgui.h>

namespace Cober {

	ViewportPanel::ViewportPanel() {

		_framebuffer = Framebuffer::Create(1280, 720);
	}

	ViewportPanel::~ViewportPanel() {

	}

	void ViewportPanel::BindFramebuffer() {

		_framebuffer->Bind();
	}

	void ViewportPanel::UnbindFramebuffer() {

		_framebuffer->Unbind();
	}

	void ViewportPanel::ResizeViewport(Ref<EditorCamera> editorCamera, bool& game2D) {

		if (FramebufferSpecification spec = _framebuffer->GetSpecification();
			_viewportSize.x > 0.0f && _viewportSize.y > 0.0f && // zeero sized framebuffer is invalid
			(spec.Width != _viewportSize.x || spec.Height != _viewportSize.y))
		{
			_framebuffer->Resize((uint32_t)_viewportSize.x, (uint32_t)_viewportSize.y);
			editorCamera->SetViewportSize(_viewportSize.x, _viewportSize.y, game2D);
			// Resize ViewportScene ...
		}
	}

	void ViewportPanel::DrawGrid() {
		
	}

	void ViewportPanel::OnGuiRender(Ref<EditorCamera> editorCamera) {

		ImGui::PushStyleVar(ImGuiStyleVar_WindowPadding, ImVec2{ 0, 0 });
		ImGui::Begin("Viewport");

		ImVec2 viewportPanelSize = ImGui::GetContentRegionAvail();
		editorCamera->SetViewportFocused(ImGui::IsWindowFocused());

		_viewportSize = { viewportPanelSize.x, viewportPanelSize.y };

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

	void ViewportPanel::PlayButtonBar(GameState gameState, Ref<Scene>& activeScene, Ref<Scene>& editorScene, Ref<Scene>& runtimeScene) {

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
				//runtimeScene = Scene::Copy(editorScene);
				activeScene = editorScene;
				activeScene->OnRuntimeStart(activeScene);
			}
			else if (gameState == GameState::RUNTIME_EDITOR) {
				Engine::Get().SetGameState(GameState::EDITOR);
				activeScene = editorScene;
				runtimeScene = nullptr;
				activeScene->OnRuntimeStop();
			}
		}
		ImGui::PopStyleVar(2);
		ImGui::PopStyleColor(3);
		ImGui::End();
	}
}