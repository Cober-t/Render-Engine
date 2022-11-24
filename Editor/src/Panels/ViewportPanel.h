#pragma once
#include <Engine.h>

#include "core/Core.h"

#include <SDL/SDL.h>

namespace Cober {

	class ViewportPanel {
	public:
		ViewportPanel();
		~ViewportPanel();

		static ViewportPanel& Get() { return *instance; }

		void CreateFramebuffer(uint32_t width = 1280, uint32_t height = 720);

		void BindFramebuffer();
		void UnbindFramebuffer();
		void FBOClearAttachments(uint32_t attachmentIndex, int value) { _fbo->ClearAttachment(attachmentIndex, value); }

		void OnEvent(SDL_Event& event, Entity& hoveredEntity);	// Abstract to EVENT API
		void ResizeViewport(Ref<EditorCamera> editorCamera, Ref<Scene>& activeScene, bool& game2D);

		void OnGuiRender(Ref<EditorCamera> editorCamera, Ref<Scene>& scene, Entity& hoveredEntity);

		void SetCursorEntity(Ref<Scene>& activeScene, Entity& hoveredEntity);
		void PlayButtonBar(Ref<Scene>& editorScene, Ref<Scene>& activeScene, GameState gameState);

	private:
		Ref<Framebuffer> _fbo;
		Ref<EditorCamera> _cameraAux;
		static ViewportPanel* instance;

		glm::vec2 _viewportSize = { 0.0f, 0.0f };
		glm::vec2 _minViewportBound, _maxViewportBound;
		bool _viewportFocused = false, _viewportHovered = false;

		bool mouseButtonHeld = false;
		glm::vec2 mouse{0.0f, 0.0f}, lastMousePos{ 0.0f, 0.0f };

		std::string _filePath;
		int _gizmoType = -1;
	};
}