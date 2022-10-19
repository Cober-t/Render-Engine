#pragma once
#include <Engine.h>

//#include <glm/gtc/type_ptr.hpp>
//#include <glm/gtc/matrix_transform.hpp>

namespace Cober {

	class ViewportPanel {
	public:
		ViewportPanel();
		~ViewportPanel();

		void BindFramebuffer();
		void UnbindFramebuffer();

		Ref<Framebuffer> GetFramebuffer() { return _framebuffer; };

		void ResizeViewport(Ref<EditorCamera> editorCamera, bool& game2D);

		void OnGuiRender(Ref<EditorCamera> editorCamera);
	private:
		std::string _filePath;
		glm::vec2 _viewportSize = { 0.0f, 0.0f };
		Ref<Framebuffer> _framebuffer;
	};
}
