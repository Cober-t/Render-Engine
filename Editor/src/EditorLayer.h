#pragma once
#include <Engine.h>

#include "Panels/ContentBrowserPanel.h"
#include "Panels/SceneHierarchyPanel.h"

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
		//bool OnKeyPressed(KeyPressedEvent& event)
	private:
		Ref<Framebuffer> _framebuffer;
		Ref<Shader> shaderTriangle;	// Render Test
		//Ref<Shader> shaderGrid;	
		Unique<EditorCamera> _editorCamera;

		bool fullscreen = false;
		std::string _filePath;
		glm::vec2 _viewportSize = { 0.0f, 0.0f };
	private:
		ContentBrowserPanel _contentBrowserPanel;
		SceneHierarchyPanel _sceneHierarchyPanel;
	};
}