#pragma once

#include "imgui.h"
#include "imgui_impl_sdl.h"
#include "imgui_impl_opengl3.h"

#include "Window.h"
#include "RenderSystem/Framebuffer.h"

static class GUI {
public:
	static void InitImGui(Window* window);
	static void Begin();
	static void End();
	static void Render(const Ref<Framebuffer>& framebuffer = nullptr);
	static void Destroy();
};