#pragma once

//#include "core/AssetManager.h"
#include "Render/Render2D.h"

#include "Render/Camera/EditorCamera.h"
#include "core/Core.h"

namespace Cober {

	class RenderSystem : public System {
	public:
		RenderSystem();
		~RenderSystem();

		void Start(const Ref<Scene>& scene);
		void Update(const Ref<EditorCamera>& camera);
		//void Update(const Ref<CameraComponent>& camera)
	private:
		Ref<Registry> _registry;
	};	
}
