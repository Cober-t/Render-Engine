#include "Game2D.h"

Game2D::Game2D() : Layer("First 2D Game!") {

	_camera = CreateUnique<EditorCamera>(45.0f, 1.778f, 0.01f, 100.0f);
}

void Game2D::OnAttach() {

	_activeScene = Scene::Create();
	_activeScene->OnRuntimeStart(_activeScene);
}

void Game2D::OnDetach() {

	_activeScene = nullptr;
	_camera = nullptr;
}

void Game2D::OnUpdate(Ref<Timestep> ts) {

	bool ortho = false;
	_camera->SetViewportSize(1280, 720, ortho);
	//RenderGlobals::SetClearColor(10, 0, 10, 255);
	//RenderGlobals::SetClearColor(225, 225, 255, 255);
	//RenderGlobals::SetClearColor(235, 97, 35, 255);
	RenderGlobals::SetClearColor(100, 150, 220, 255);
	RenderGlobals::Clear();

	_camera->OnUpdate(ts);
	_activeScene->OnUpdateRuntime(ts, _camera);

	// Render Scene (Game), when it has a cam
	//_activeScene->OnUpdateRuntime(ts);
}

void Game2D::OnEvent(SDL_Event& event) {

	_camera->OnEvent(event);
}