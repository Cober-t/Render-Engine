#pragma once

#include "Application.h"
#include "Render/Camera/EditorCamera.h"

namespace Cober {

	class Scene {
	public:
		Scene();
		~Scene();

		void OnRuntimeStart();
		void OnRuntimeStop();

		void OnUpdateRuntime(Ref<Timestep> ts);	// Get Camera components from entities
		void OnUpdateEditor(Ref<Timestep> ts, Ref<EditorCamera> camera);

		static Ref<Scene> Create();
	private:
		Ref<Registry> _registry;
	};
}