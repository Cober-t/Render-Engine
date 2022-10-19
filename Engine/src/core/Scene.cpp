#include "pch.h"

#include "Scene.h"
#include "Systems/RenderSystem.h"
#include "Systems/MovementSystem.h"
#include "Systems/PhysicsSystem.h"

namespace Cober {

	Scene::Scene()
	{
		_registry = Engine::Get().GetRegistry();

		_registry->AddSystem<MovementSystem>();
		_registry->AddSystem<PhysicsSystem>();
		_registry->AddSystem<RenderSystem>();
	}

	Scene::~Scene()
	{
		Logger::Log("Scene finished, removing systems from registry...");
		_registry->RemoveSystem<MovementSystem>();
		_registry->RemoveSystem<PhysicsSystem>();
		_registry->RemoveSystem<RenderSystem>();
	}

	Ref<Scene> Scene::Create() {

		return CreateRef<Scene>();
	}

	void Scene::OnRuntimeStart() {

		_registry->GetSystem<RenderSystem>().Start(Engine::Get().GetAssetManager());


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

		// Get Camera components from entities
		//_registry->GetSystem<RenderSystem>().Update();
	}

	void Scene::OnUpdateEditor(Ref<Timestep> ts, Ref<EditorCamera> editorCamera) {

		_registry->Update();

		_registry->GetSystem<RenderSystem>().Update(editorCamera);
	}
}
