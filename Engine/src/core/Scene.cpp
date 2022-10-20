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
		//_registry->AddSystem<CameraSystem>();				// CAMERA SYSTEM		*(something like Cinemachine in Unity)
		//_registry->AddSystem<ScriptingSystem>();			// SCRIPTING			*(With Lua & Sol wrapper)
		//_registry->AddSystem<Animation2DSystem>();	    // ANIMATION 2D SYSTEM	*(Interpolation, )
		//_registry->AddSystem<MaterialSystem>();			// MATERIAL SYSTEM
		//_registry->AddSystem<InputSystem>();				// INPUTS MANAGER		*(For an easy cutomization of inputs)
		//_registry->AddSystem<TerrainGeneratorSystem>();	// TERRAIN GENERATOR	*(perlin noise, wave function collapse...)
		//_registry->AddSystem<ParticleSystem>();			// PARTICLE SYSTEM		*(see Unity options)
		//_registry->AddSystem<AISystem>();					// AI SYSTEM			*(dijkstra pathfinding, A* star ...)
		//_registry->AddSystem<DialogueSystem>();			// DIALOGUE SYSTEM		*(excel wrinting with aware of entities and conditions)

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

	void Scene::OnRuntimeStart(const Ref<Scene>& scene) {

		_registry->GetSystem<PhysicsSystem>().Start(scene);
		_registry->GetSystem<RenderSystem>().Start(scene);
		_registry->GetSystem<UISystem>().Start(Engine::Get().GetWindow().GetNativeWindow());
	}

	void Scene::OnRuntimeStop() {

	}

	void Scene::OnUpdateRuntime(Ref<Timestep> ts) {

		_registry->Update();

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
