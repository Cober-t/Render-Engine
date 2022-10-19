#pragma once

#include "Entities/ECS.h"
#include "Entities/Components.h"

#include "core/AssetManager.h"
//#include "core/Core.h"

#include "Render/Camera/EditorCamera.h"
#include "Render/Shader.h"

namespace Cober {

	class RenderSystem : public System {
	public:
		RenderSystem();
		~RenderSystem();

		void Start(Ref<AssetManager> assets);
		void Update(Ref<EditorCamera> camera);	// Test
	private:
		Ref<AssetManager> _assets;
	private:	//TEST
		Ref<Shader> shaderTriangle;	// Render Test
		Ref<Shader> shaderGrid;	
	};
}
