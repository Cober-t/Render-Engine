#pragma once

#include "core/Core.h"
#include "Entities/ECS.h"

#include "Events/EventHandler.h"

namespace Cober{

	class AnimationSystem2D : public System {

	public:
		AnimationSystem2D();
		~AnimationSystem2D();

		void Start();

		void Update();

		//void OnEvent(Unique<EventHandler>& eventHandler);

	private:
		glm::vec2 texSize{ 64, 32 };			// Export to Component Editor
		int indexRow = 0, indexColumn = 0;		// Export to Component Editor
	};
}