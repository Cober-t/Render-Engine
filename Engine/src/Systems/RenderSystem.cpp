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

	//Entity entity;
	void RenderSystem::Start(const Ref<Scene>& scene)
	{
		_registry = scene->GetRegistry();

		RenderGlobals::Create();
		RenderGlobals::Init();
		Render2D::Start();

		// Test
		Entity entity = _registry->CreateEntity();
		entity.AddComponent<Sprite>();
		entity.GetComponent<Sprite>().color = glm::vec4(1.0f, 0.0f, 0.0f, 1.0f);

		LOG("Render System Started!!");
	}

	void RenderSystem::Update(const Ref<EditorCamera>& camera)
	{
		//RenderGlobals::SetClearColor(10, 0, 10, 255);
		//RenderGlobals::SetClearColor(225, 225, 255, 255);
		RenderGlobals::SetClearColor(235, 97, 35, 255);
		RenderGlobals::Clear();
		// RenderGlobals::SetClearColor(camera->GetSkyboxColor());
		//	or just
		// camera->RenderSkybox();

		Render2D::ResetStats();
		Render2D::BeginScene(camera);
		
		// DEBUG PHYSICS
#ifndef __EMSCRIPTNE__ 
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
		
			Render2D::DrawSprite(&transform, &sprite);
		}
	
		Render2D::EndScene();
	}
}