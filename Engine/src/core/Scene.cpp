#include "pch.h"

#include "Scene.h"
#include "Systems/RenderSystem.h"
#include "Systems/UISystem.h"
#include "Systems/MovementSystem.h"
#include "Systems/PhysicsSystem.h"

namespace Cober {

	Scene::Scene() {

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

		Ref<Scene> scene = CreateRef<Scene>();

		scene->_registry = CreateRef<Registry>();

		scene->_registry->AddSystem<RenderSystem>();
		scene->_registry->GetSystem<RenderSystem>().Start(scene);
		scene->_registry->AddSystem<UISystem>();
		scene->_registry->GetSystem<UISystem>().Start(Engine::Get().GetWindow().GetNativeWindow());

		return scene;
	}

	//template<typename Component>
	//static void CopyComponent(Ref<Registry>& regDestination, Ref<Registry>& regSource, const std::unordered_map<UUID, Entity>& entityMap)
	//{
	//	auto view = regSource->GetComponent<Component>();
	//	for (auto srcEntity : view)
	//	{
	//		Entity newEntity = entityMap.at(regSource->GetComponent<IDComponent>(srcEntity).ID);

	//		auto& srcComponent = regSource->GetComponent<Component>(srcEntity);
	//		//regDestination->emplace_or_replace<Component>(newEntity, srcComponent);
	//	}
	//}

	Ref<Scene> Scene::Copy(Ref<Scene>& scene)
	{
		//Ref<Scene> newScene = CreateRef<Scene>();

		////newScene->_world2D = scene->_world2D;
		//std::unordered_map<UUID, Entity> enttMap;

		//// Create entities in new scene
		//auto& srcSceneRegistry = scene->_registry;
		//auto& dstSceneRegistry = newScene->_registry;
		//auto entities = srcSceneRegistry->GetAllEntities();
		//for (auto entity : entities)
		//{
		//	auto uuid = srcSceneRegistry->GetComponent<IDComponent>(entity).ID;
		//	const auto& name = srcSceneRegistry->GetComponent<Tag>(entity).tag;
		//	Entity newEntity = srcSceneRegistry->CreateEntity(name, uuid);
		//	enttMap[uuid] = newEntity;
		//}

		//// Copy components (except IDComponent and TagComponent)
		//CopyComponent<Transform>(dstSceneRegistry, srcSceneRegistry, enttMap);
		//CopyComponent<Sprite>(dstSceneRegistry, srcSceneRegistry, enttMap);

		//CopyComponent<Rigidbody2D>(dstSceneRegistry, srcSceneRegistry, enttMap);
		//CopyComponent<BoxCollider2D>(dstSceneRegistry, srcSceneRegistry, enttMap);

		return nullptr;
	}

	void Scene::OnRuntimeStart(const Ref<Scene>& scene) {

		_registry->AddSystem<PhysicsSystem>();
		_registry->GetSystem<PhysicsSystem>().Start(scene);
		//_registry->AddSystem<MovementSystem>();
		//_registry->GetSystem<MovementSystem>().Start(scene);
	}

	void Scene::OnRuntimeStop() {
	
		_registry->RemoveSystem<PhysicsSystem>();
	}

	void Scene::OnUpdateRuntime(Ref<Timestep> ts, Ref<EditorCamera> camera) {

		_registry->Update();

		_registry->GetSystem<RenderSystem>().Update(camera);
		_registry->GetSystem<UISystem>().Update();

		// Get Camera components from entities
		_registry->GetSystem<PhysicsSystem>().Update(ts->deltaTime);
	}

	void Scene::OnUpdateEditor(Ref<Timestep> ts, Ref<EditorCamera> editorCamera) {

		_registry->Update();

		_registry->GetSystem<RenderSystem>().Update(editorCamera);
		//_registry->GetSystem<UISystem>().Update();
	}
}
