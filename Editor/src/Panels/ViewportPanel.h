#pragma once
#include <Engine.h>

//#include <glm/gtc/type_ptr.hpp>
//#include <glm/gtc/matrix_transform.hpp>

#include "SceneHierarchyPanel.h"

namespace Cober {

	class ViewportPanel {
	public:
		ViewportPanel(uint32_t width, uint32_t height);
		~ViewportPanel();

		static Unique<ViewportPanel> Create(uint32_t width = 1280, uint32_t height = 720) { return CreateUnique<ViewportPanel>(width, height); }

		void BindFramebuffer();
		void UnbindFramebuffer();

		void DrawGrid();

		void ResizeViewport(Ref<EditorCamera> editorCamera, Ref<Scene>& activeScene, bool& game2D);
		void OnGuiRender(Ref<EditorCamera> editorCamera);

		void SetCursorEntity(Ref<Scene>& activeScene, Entity& hoveredEntity);
		void FBOClearAttachments(uint32_t attachmentIndex, int value) { _fbo->ClearAttachment(attachmentIndex, value); }


		void PlayButtonBar(GameState gameState, Unique<SceneHierarchyPanel>& sceneHierarchyPanel, Ref<Scene>& activeScene, Ref<Scene>& editorScene);

	private:
		glm::vec2 _viewportSize = { 0.0f, 0.0f };
		glm::vec2 _minViewportBound;
		glm::vec2 _maxViewportBound;
		bool _viewportFocused = false, _viewportHovered = false;
		Ref<Framebuffer> _fbo;
		
		std::string _filePath;
	};
}