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

	void RenderSystem::Start()
	{
		RenderGlobals::Create();
		RenderGlobals::Init();
		Render2D::Start();

		LOG("Render System Started!!");
	}

	void RenderSystem::Update(const Ref<EditorCamera>& camera)
	{
		Render2D::ResetStats();
		Render2D::BeginScene(camera);

		Render2D::DrawGrid();

		// DEBUG PHYSICS
#ifndef __EMSCRIPTEN__ 
#ifndef __OPENGLES3__
		if (Engine::Get().GetDebugMode()) {
			for (auto& entity : GetSystemEntities()) {
				Render2D::DrawSolidPolygon(entity);
				// ...
			}
		}
#endif
#endif
		
		for (auto& entity : GetSystemEntities()) {
			Sprite sprite = entity.GetComponent<Sprite>();
			Transform transform = entity.GetComponent<Transform>();
		
			Render2D::DrawSprite(&transform, &sprite, entity.GetIndex());
		}

		Render2D::EndScene();
	}
}