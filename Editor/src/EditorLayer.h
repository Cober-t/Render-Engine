#pragma once
#include <Engine.h>

// GUI PANELS
#include "Panels/MenuPanel.h"
#include "Panels/ContentBrowserPanel.h"
#include "Panels/SceneHierarchyPanel.h"
#include "Panels/MenuPanel.h"
#include "Panels/DataPanel.h"
#include "Panels/ViewportPanel.h"

namespace Cober {

	class EditorLayer : public Layer {
	public:
		EditorLayer();
		virtual ~EditorLayer() = default;

		virtual void OnAttach() override;
		virtual void OnDetach() override;

		void OnUpdate(Ref<Timestep> ts) override;
		virtual void OnGuiRender() override;
		void OnEvent(SDL_Event& event) override;

	private:
		void InitDockspace();
		void EndDockspace();
		//bool OnKeyPressed(KeyPressedEvent& event)
	private:
		Ref<EditorCamera> _editorCamera;
		Ref<Scene> _activeScene, _editorScene;
	private:
		Ref<Framebuffer> _fbo;

		glm::vec2 _viewportSize = { 0.0f, 0.0f };
		glm::vec2 _minViewportBound;
		glm::vec2 _maxViewportBound;
		bool _viewportFocused = false, _viewportHovered = false;
		int _guizmoType = -1;
	};
}