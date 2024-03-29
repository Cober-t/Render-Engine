#include "Game2D.h"

Game2D::Game2D() : Layer("First 2D Game!") {

	_camera = CreateUnique<EditorCamera>(45.0f, 1.778f, 0.01f, 1000.0f);
}

void Game2D::OnAttach() {

	//_activeScene = Scene::Create();
	_activeScene = Scene::Load("EditorSceneTest.txt");
	_activeScene->OnRuntimeStart(_activeScene);
}

void Game2D::OnDetach() {

	_activeScene = nullptr;
	_camera = nullptr;
}

void Game2D::OnUpdate(Ref<Timestep> ts) {

	bool ortho = false;
	_camera->SetViewportSize(1280, 720, ortho);

	_camera->OnUpdate(ts);
	RenderGlobals::SetClearColor(10, 0, 10, 255);
	RenderGlobals::Clear();

	_activeScene->OnUpdateRuntime(ts, _camera);

	// Render Scene (Game), when it has a cam
	//_activeScene->OnUpdateRuntime(ts);
}

void Game2D::OnEvent(SDL_Event& event) {

	_camera->OnEvent(event);
}