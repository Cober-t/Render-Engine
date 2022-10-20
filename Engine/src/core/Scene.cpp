#include "pch.h"

#include "Scene.h"
#include "Systems/RenderSystem.h"
#include "Systems/UISystem.h"
#include "Systems/MovementSystem.h"
#include "Systems/PhysicsSystem.h"

namespace Cober {

	Scene::Scene()
	{
		_registry = CreateRef<Registry>();

		// [+++++ TODO
		//_registry->AddSystem<TerrainGeneratorSystem>();	// TERRAIN GENERATOR	*(perlin noise, wave function collapse...)
		//_registry->AddSystem<MaterialSystem>();			// MATERIAL SYSTEM
		//_registry->AddSystem<DialogueSystem>();			// DIALOGUE SYSTEM		*(excel wrinting with aware of entities and conditions)
		//_registry->AddSystem<AISystem>();					// AI SYSTEM			*(dijkstra pathfinding, A* star ...)
		//_registry->AddSystem<ParticleSystem>();			// PARTICLE SYSTEM		*(see Unity options)
		//_registry->AddSystem<CameraSystem>();				// CAMERA SYSTEM		*(something like Cinemachine in Unity)
		//_registry->AddSystem<Animation2DSystem>();	    // ANIMATION 2D SYSTEM	*(Interpolation, )

		_registry->AddSystem<MovementSystem>();
		_registry->AddSystem<PhysicsSystem>();
		_registry->AddSystem<RenderSystem>();
		_registry->AddSystem<UISystem>();
	}			 

	Scene::~Scene()
	{
		Logger::Log("Scene finished, removing systems from registry...");
		_registry->RemoveSystem<MovementSystem>();
		_registry->RemoveSystem<PhysicsSystem>();
		_registry->RemoveSystem<RenderSystem>();
		_registry->RemoveSystem<UISystem>();
	}

	Ref<Scene> Scene::Create() {

		return CreateRef<Scene>();
	}

	void Scene::OnRuntimeStart() {

		_registry->GetSystem<RenderSystem>().Start(Engine::Get().GetAssetManager());
		_registry->GetSystem<UISystem>().Start(Engine::Get().GetWindow().GetNativeWindow());

		//_assetManager->AddTexture("cat", SHADERS_PATH + "woodenContainer.png");

		//// Create some entities
		//Entity tank = _registry->CreateEntity();

		//// Add some components to the entity
		//tank.AddComponent<Transform>(Vec2(100.0, 100.0), 0, Vec2(1.0, 1.0));
		//tank.AddComponent<Rigidbody>(Vec2(45.0f, 0.0f));
		//tank.AddComponent<Sprite>("cat", 128 * 3, 128 * 3);
	}

	void Scene::OnRuntimeStop() {

	}

	void Scene::OnUpdateRuntime(Ref<Timestep> ts) {

		_registry->Update();

		//_registry->GetSystem<ScriptingSystem>();
		_registry->GetSystem<MovementSystem>().Update(ts->deltaTime);
		_registry->GetSystem<PhysicsSystem>().Update(ts->deltaTime);
		_registry->GetSystem<UISystem>().Update();

		// Get Camera components from entities
		//_registry->GetSystem<RenderSystem>().Update();
	}

	void Scene::OnUpdateEditor(Ref<Timestep> ts, Ref<EditorCamera> editorCamera) {

		_registry->Update();

		_registry->GetSystem<RenderSystem>().Update(editorCamera);
		_registry->GetSystem<UISystem>().Update();
	}
}
