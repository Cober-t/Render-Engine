#pragma once

#include "Entities/ECS.h"
#include "Entities/Components.h"
#include "core/AssetManager.h"

namespace Cober {

	class RenderSystem : public System {
	public:
		RenderSystem();
		void Update(SDL_Renderer* renderer, Unique<AssetManager>& assets);
	};
}
