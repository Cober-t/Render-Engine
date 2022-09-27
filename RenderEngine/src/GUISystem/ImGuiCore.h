#pragma once

#include "imgui.h"
#include "imgui_impl_sdl.h"
#include "imgui_impl_opengl3.h"

#include "core/Window.h"
#include "core/Engine.h"
#include "Render/Framebuffer.h"

namespace Cober {

	static class GUI {
	public:
		static void Init(const Unique<Window>& window);
		static void Begin();
		static void End();
		static void Render(const Ref<Framebuffer>& framebuffer = nullptr);
		static void Destroy();
	};
}