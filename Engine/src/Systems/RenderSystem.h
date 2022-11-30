#pragma once

//#include "core/AssetManager.h"
#include "Render/Render2D.h"

#include "core/Core.h"
#include "Entities/ECS.h"
#include "Entities/Scene.h"
#include "Render/Camera/EditorCamera.h"

#include "Events/EventHandler.h"

namespace Cober {

	class RenderSystem : public System {
	public:
		RenderSystem();
		~RenderSystem();

		void Start();

		void Update(const Ref<EditorCamera>& camera);
		//void Update(const Ref<CameraComponent>& camera)

		//void OnEvent(Unique<EventHandler>& eventHandler);

	private:
		Ref<Registry> _registry;
	};	
}
