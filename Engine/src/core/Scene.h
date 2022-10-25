#pragma once

#include "Application.h"
#include "Render/Camera/EditorCamera.h"

namespace Cober {

	class Scene {
	public:
		Scene();
		~Scene();

		void OnRuntimeStart(const Ref<Scene>& scene);
		void OnRuntimeStop();

		void OnUpdateRuntime(Ref<Timestep> ts);	// Get Camera components from entities
		void OnUpdateEditor(Ref<Timestep> ts, Ref<EditorCamera> camera);

		Ref<Registry> GetRegistry() { return _registry; }

		static Ref<Scene> Create();

		// TEST
		bool physicsStarted;
	private:
		Ref<Registry> _registry;
	};
}