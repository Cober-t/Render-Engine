#include "pch.h"

#include "RenderSystem.h"
#include "PhysicsSystem.h"

#include "core/Logger.h"

//#include "Render/DebugRenderer.h"
#include "Render/RenderGlobals.h"
#include "Entities/ECS.h"

namespace Cober {

	RenderSystem::RenderSystem() {

		RequireComponent<Transform>();
		RequireComponent<Sprite>();

		if(Engine::Get().GetGameState() == GameState::PLAY)
			//RequireComponent<CameraSystem>();

		Logger::Log("Render SYSTEM Added!!");
	}

	RenderSystem::~RenderSystem() {

		Logger::Log("Render System removed from Registry");
	}

	void RenderSystem::Start(const Ref<Scene>& scene)
	{
		_registry = scene->GetRegistry();

		RenderGlobals::Init();
		Render2D::Start();
	}

	void RenderSystem::Update(const Ref<EditorCamera>& camera)
	{
		RenderGlobals::SetClearColor(10, 0, 10, 255);
		RenderGlobals::Clear();
		// RenderGlobals::SetClearColor(camera->GetSkyboxColor());
		//	or just
		// camera->RenderSkybox();

		Render2D::ResetStats();
		Render2D::BeginScene(camera);

		// DEBUG PHYSICS
		if (Engine::Get().GetDebugMode()) {
			for (auto entity : GetSystemEntities()) {
				Render2D::DrawSolidPolygon(entity);
				// ...
			}
		}

		for (auto entity : GetSystemEntities()) {
			Sprite sprite = entity.GetComponent<Sprite>();
			Transform transform = entity.GetComponent<Transform>();

			Render2D::DrawSprite(&transform, &sprite);
		}

		Render2D::EndScene();
	}
}