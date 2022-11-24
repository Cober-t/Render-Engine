#include "pch.h"

#include "ViewportPanel.h"
#include "SceneHierarchyPanel.h"
#include "core/Application.h"
#include "ImGuizmo/ImGuizmo.h"
//#include "core/Math.h"

#include <glm/gtc/matrix_transform.hpp>
#include <glm/gtc/type_ptr.hpp>

#include <filesystem>
#include <imgui/imgui.h>

namespace Cober {

	ViewportPanel* ViewportPanel::instance = nullptr;

	ViewportPanel::ViewportPanel() 
	{
		instance = this;
	}

	ViewportPanel::~ViewportPanel() 
	{
		delete instance;
		instance = nullptr;
	}

	void ViewportPanel::CreateFramebuffer(uint32_t width, uint32_t height) {

		_fbo = Framebuffer::Create(1280, 720);
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

	void ViewportPanel::OnEvent(SDL_Event& event, Entity& hoveredEntity) {

		const Uint8* keyStateArray = SDL_GetKeyboardState(NULL);
		//bool control = keyStateArray[SDL_SCANCODE_LCTRL];
		//bool shift = keyStateArray[SDL_SCANCODE_LSHIFT];

		// Gizmos
		switch (event.key.keysym.sym) {
			case SDLK_q:
			{
				if (!ImGuizmo::IsUsing())
					_gizmoType = -1;
				break;
			}
			case SDLK_w:
			{
				if (!ImGuizmo::IsUsing())
					_gizmoType = ImGuizmo::OPERATION::TRANSLATE;
				break;
			}
			case SDLK_e:
			{
				if (!ImGuizmo::IsUsing())
					_gizmoType = ImGuizmo::OPERATION::ROTATE;
				break;
			}
			case SDLK_r:
			{
				if (!ImGuizmo::IsUsing())
					_gizmoType = ImGuizmo::OPERATION::SCALE;
				break;
			}
		}
	}

	void ViewportPanel::ResizeViewport(Ref<EditorCamera> editorCamera, Ref<Scene>& activeScene, bool& game2D) {
		
		if (FramebufferSpecification spec = _fbo->GetSpecification();
			_viewportSize.x > 0.0f && _viewportSize.y > 0.0f && // zero sized framebuffer is invalid
			(spec.Width != _viewportSize.x || spec.Height != _viewportSize.y))
		{
			_fbo->Resize((uint32_t)_viewportSize.x, (uint32_t)_viewportSize.y);
			editorCamera->SetViewportSize(_viewportSize.x, _viewportSize.y, game2D);
			activeScene->OnViewportResize((uint32_t)_viewportSize.x, (uint32_t)_viewportSize.y);
			// Resize ViewportScene ...
		}
	}

	void ViewportPanel::OnGuiRender(Ref<EditorCamera> editorCamera, Ref<Scene>& scene, Entity& hoveredEntity) {

		ImGui::PushStyleVar(ImGuiStyleVar_WindowPadding, ImVec2{ 0, 0 });
		ImGui::Begin("Viewport");

		//if (hoveredEntity.GetIndex() != -1 && ImGui::IsMouseClicked(0)) {
		//	scene->SetDefaultEntity(hoveredEntity);
		//	SceneHierarchyPanel::Get().SetNullEntityContext();
		//}

		// Hovered Entity
		auto viewportMinRegion = ImGui::GetWindowContentRegionMin();
		auto viewportMaxRegion = ImGui::GetWindowContentRegionMax();
		auto viewportOffset = ImGui::GetWindowPos();
		_minViewportBound = { viewportMinRegion.x + viewportOffset.x, viewportMinRegion.y + viewportOffset.y };
		_maxViewportBound = { viewportMaxRegion.x + viewportOffset.x, viewportMaxRegion.y + viewportOffset.y };

		_viewportFocused = ImGui::IsWindowFocused();
		_viewportHovered = ImGui::IsWindowHovered();
		editorCamera->BlockEvents(_viewportHovered);

		ImVec2 viewportPanelSize = ImGui::GetContentRegionAvail();

		_viewportSize = { viewportPanelSize.x, viewportPanelSize.y };
		float width  = (viewportPanelSize.x / scene->GetWidth())  * scene->GetWidth();
		float height = (viewportPanelSize.y / scene->GetHeight()) * scene->GetHeight();

		uint32_t textureID = _fbo->GetColorAttachmentRenderID();
		ImGui::Image(reinterpret_cast<void*>(textureID), ImVec2{ width, height }, ImVec2{ 0, 1 }, ImVec2{ 1, 0 });

		///////////////////////////////////
		// Export to DragDropViewportTarget
		if (ImGui::BeginDragDropTarget()) {

			if (const ImGuiPayload* payload = ImGui::AcceptDragDropPayload("CONTENT_BROWSER_ITEM")) {
				const wchar_t* path = (const wchar_t*)payload->Data;
				_filePath = (std::filesystem::path(SOLUTION_DIR + (std::string)"assets") / path).string();

				//Textures
				if (hoveredEntity.GetIndex() != -1 && hoveredEntity.HasComponent<Sprite>()) {
					auto lastDot = _filePath.find_last_of('.');
					std::string format = lastDot != std::string::npos ? _filePath.substr(lastDot) : "null";
					if (lastDot != std::string::npos && (format == ".png" || format == ".jpg" || format == ".jpeg"))
						hoveredEntity.GetComponent<Sprite>().texture = Texture::Create(_filePath);
				}
			}
			ImGui::EndDragDropTarget();
		}

		///////////////////////////////
		//Gizmos
		Entity selectedEntity = SceneHierarchyPanel::Get().GetSelectedEntity();
		if (selectedEntity.GetIndex() != -1 && selectedEntity.HasComponent<Sprite>() && _gizmoType != -1)
		{
			ImGuizmo::SetOrthographic(Engine::Get().GetGameMode());
			ImGuizmo::SetDrawlist();

			ImGuizmo::SetRect(_minViewportBound.x, _minViewportBound.y, 
							  _maxViewportBound.x - _minViewportBound.x, 
							  _maxViewportBound.y - _minViewportBound.y);
			
			// Runtime camera from entity
			// auto cameraEntity = m_ActiveScene->GetPrimaryCameraEntity();
			// const auto& camera = cameraEntity.GetComponent<CameraComponent>().Camera;
			// const glm::mat4& cameraProjection = camera.GetProjection();
			// glm::mat4 cameraView = glm::inverse(cameraEntity.GetComponent<TransformComponent>().GetTransform());

			// Editor camera
			const glm::mat4& cameraProjection = editorCamera->GetProjection();
			glm::mat4 cameraView = editorCamera->GetView();

			// Entity transform
			auto& tc = selectedEntity.GetComponent<Transform>();
			glm::mat4 transform = tc.GetTransform();

			// Snapping
			//bool snap = /* Some Event Condition*/
			bool snap = true;	// TEST
			float snapValue = 0.5f; // Snap to 0.5m for translation/scale
			// Snap to 45 degrees for rotation
			if (_gizmoType == ImGuizmo::OPERATION::ROTATE)
				snapValue = 45.0f;

			float snapValues[3] = { snapValue, snapValue, snapValue };

			ImGuizmo::Manipulate(glm::value_ptr(cameraView), glm::value_ptr(cameraProjection),
				(ImGuizmo::OPERATION)_gizmoType, ImGuizmo::LOCAL, glm::value_ptr(transform),
				nullptr, snap ? snapValues : nullptr);

			if (ImGuizmo::IsUsing())
			{
				glm::vec3 translation, rotation, scale;
				Math::DecomposeTransform(transform, translation, rotation, scale);

				if (Engine::Get().GetGameMode())
					translation.z = tc.position.z;
				
				glm::vec3 deltaRotation = rotation - tc.rotation;

				tc.position = translation;
				tc.rotation += deltaRotation;
				tc.scale = scale;
			}
		}

		ImGui::PopStyleVar();
		ImGui::End();
	}

	void ViewportPanel::PlayButtonBar(Ref<Scene>& editorScene, Ref<Scene>& activeScene, GameState gameState) {

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
				SceneHierarchyPanel::Get().SetContext(activeScene);
				activeScene->OnRuntimeStart(activeScene);
			}
			else if (gameState == GameState::RUNTIME_EDITOR) {
				Engine::Get().SetGameState(GameState::EDITOR);
				activeScene->OnRuntimeStop();
				activeScene = editorScene;
				SceneHierarchyPanel::Get().SetContext(activeScene);
			}
		}
		ImGui::PopStyleVar(2);
		ImGui::PopStyleColor(3);
		ImGui::End();
	}
}