#include "pch.h"

#include "RenderSystem.h"
#include "PhysicsSystem.h"
#include "Render/RenderGlobals.h"
#include "Entities/ECS.h"

namespace Cober {

	RenderSystem::RenderSystem() {

		RequireComponent<Transform>();
		RequireComponent<Sprite>();

		//if (Engine::Get().GetGameState() == GameState::PLAY)
			//RequireComponent<CameraSystem>();
	}

	RenderSystem::~RenderSystem() {

		LOG("Render System removed from Registry");
	}

	void RenderSystem::Start(const Ref<Scene>& scene)
	{
		_registry = scene->GetRegistry();

		LOG("Render System Init");
#ifndef __EMSCRIPTEN__
		RenderGlobals::Init();
		Render2D::Start();
#else
		GLCallV(glEnable(GL_BLEND));
		GLCallV(glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA));
		GLCallV(glEnable(GL_DEPTH_TEST));
#endif
		LOG("Render System Started!!");
	}

	void RenderSystem::Update(const Ref<EditorCamera>& camera)
	{
		//RenderGlobals::SetClearColor(10, 0, 10, 255);
		RenderGlobals::SetClearColor(225,225, 255, 255);
		RenderGlobals::Clear();
		// RenderGlobals::SetClearColor(camera->GetSkyboxColor());
		//	or just
		// camera->RenderSkybox();
#ifndef __EMSCRIPTEN__
		Render2D::ResetStats();
		Render2D::BeginScene(camera);
		
		// DEBUG PHYSICS
		if (Engine::Get().GetDebugMode()) {
			for (auto& entity : GetSystemEntities()) {
				Render2D::DrawSolidPolygon(entity);
				// ...
			}
		}
		
		for (auto& entity : GetSystemEntities()) {
			Sprite sprite = entity.GetComponent<Sprite>();
			Transform transform = entity.GetComponent<Transform>();
		
			Render2D::DrawSprite(&transform, &sprite);
		}
		
		Render2D::EndScene();
#endif
	}
}