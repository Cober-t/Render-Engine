#pragma once
#include <Engine.h>

namespace Cober {

	class EditorLayer : public Layer {
	public:
		EditorLayer();
		virtual ~EditorLayer() = default;

		virtual void OnAttach() override;
		virtual void OnDetach() override;

		void OnUpdate(Ref<Timestep> ts) override;
		virtual void OnGuiRender() override;
		//void OnEvent(Event& event) override;
	private:
		//bool OnKeyPressed(KeyPressedEvent& event)
	private:
		Ref<Framebuffer> _framebuffer;
		Ref<Shader> shader;	// Render Test
		EditorCamera _editorCamera;
		glm::vec2 _viewportSize = { 0.0f, 0.0f };
	};
}