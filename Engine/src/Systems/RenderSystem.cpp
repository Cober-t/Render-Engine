#include "pch.h"

#include "RenderSystem.h"
#include "PhysicsSystem2D.h"
#include "Render/RenderGlobals.h"

// TEST
#include "Render/CubeMap.h"

namespace Cober {

	RenderSystem::RenderSystem() {

		RequireComponent<Transform>();
		RequireComponent<Sprite>();

		//if (Engine::Get().GetGameState() == GameState::PLAY)
			//RequireComponent<CameraSystem>();

		LOG("Render System Added to Registry!!");
	}

	RenderSystem::~RenderSystem() {

		LOG("Render System removed from Registry");
	}

	Ref<CubeMap> cubeMap;
	void RenderSystem::Start()
	{
		RenderGlobals::Create();
		RenderGlobals::Init();
		Render2D::Start();

		// TEST CUBEMAP
		std::string _filePath = std::filesystem::path(SOLUTION_DIR + (std::string)"assets\\skybox\\").string();
		std::vector<std::string> faces{
			SKYBOX_PATH + "right.jpg",
			SKYBOX_PATH + "left.jpg",
			SKYBOX_PATH + "top.jpg",
			SKYBOX_PATH + "bottom.jpg",
			SKYBOX_PATH + "front.jpg",
			SKYBOX_PATH + "back.jpg"
		};
		cubeMap = CubeMap::Create(faces);
		cubeMap->Bind();

		LOG("Render System Started!!");
	}

	void RenderSystem::Update(const Ref<EditorCamera>& camera)
	{
		Render2D::ResetStats();
		Render2D::BeginScene(camera);

		glm::vec3 cameraFocus = camera->GetPosition() + camera->GetForwardDirection();
		Render2D::DrawGrid(cameraFocus);
		cubeMap->DrawSkybox(camera->GetProjection(), camera->GetView());

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