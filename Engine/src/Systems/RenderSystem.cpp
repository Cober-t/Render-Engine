#include "pch.h"

#include "RenderSystem.h"
#include "PhysicsSystem.h"
#include "Render/RenderGlobals.h"
#include "Entities/ECS.h"
// Test
//#include "Entities/Components.h"

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
		//_registry = scene->GetRegistry();

		RenderGlobals::Create();
		RenderGlobals::Init();
		Render2D::Start();

//		// Test
//		{
//			Entity entity = _registry->CreateEntity();
//			entity.AddComponent<Sprite>();
//			entity.GetComponent<Sprite>().color = glm::vec4(0.92f, 0.38f, 0.13f, 1.0f);
//			//entity.GetComponent<Sprite>().color = glm::vec4(0.13f, 0.38f, 0.92f, 1.0f);
//#ifdef __EMSCRIPTEN__
//			entity.GetComponent<Sprite>().texture = Texture::Create("assets/textures/orangeMykoeski.png");
//#else
//			std::string texturePath = SOLUTION_DIR + (std::string)"assets\\textures\\";
//			entity.GetComponent<Sprite>().texture = Texture::Create(texturePath + "blendTest.png");
//#endif
//			entity.AddComponent<BoxCollider2D>();
//			entity.AddComponent<Rigidbody2D>();
//			entity.GetComponent<Rigidbody2D>().type = BodyType::Dynamic;
//		}

		LOG("Render System Started!!");
	}

	void RenderSystem::Update(const Ref<EditorCamera>& camera)
	{
		//RenderGlobals::SetClearColor(10, 0, 10, 255);
		RenderGlobals::SetClearColor(225, 225, 255, 255);
		//RenderGlobals::SetClearColor(235, 97, 35, 255);
		RenderGlobals::Clear();
		// RenderGlobals::SetClearColor(camera->GetSkyboxColor());
		//	or just
		// camera->RenderSkybox();

		Render2D::ResetStats();
		Render2D::BeginScene(camera);

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
		
			Render2D::DrawSprite(&transform, &sprite);
		}
	
		Render2D::EndScene();
	}
}