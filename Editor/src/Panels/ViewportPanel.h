#pragma once
#include <Engine.h>

//#include <glm/gtc/type_ptr.hpp>
//#include <glm/gtc/matrix_transform.hpp>

namespace Cober {

	class ViewportPanel {
	public:
		ViewportPanel(Ref<Framebuffer>& fbo);
		~ViewportPanel();

		static Unique<ViewportPanel> Create(Ref<Framebuffer>& fbo) { return CreateUnique<ViewportPanel>(fbo); }

		void BindFramebuffer();
		void UnbindFramebuffer();

		Ref<Framebuffer> GetFramebuffer() { return _framebuffer; };

		void ResizeViewport(Ref<EditorCamera> editorCamera, bool& game2D);

		void DrawGrid();

		void OnGuiRender(Ref<EditorCamera> editorCamera);
		void PlayButtonBar(GameState gameState, Ref<Scene>& activeScene, Ref<Scene>& editorScene);

	private:
		std::string _filePath;
		glm::vec2 _viewportSize = { 0.0f, 0.0f };
		Ref<Framebuffer> _framebuffer;
		// Unique<Shader> _gridShader
	};
}
