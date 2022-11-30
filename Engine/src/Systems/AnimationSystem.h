#pragma once

#include "core/Core.h"
#include "Entities/ECS.h"

namespace Cober{

	class AnimationSystem : public System {

	public:
		AnimationSystem();
		~AnimationSystem();

		void Start();

		void Update();

	private:
		glm::vec2 texSize{ 64, 32 };			// Export to Component Editor
		int indexRow = 0, indexColumn = 0;		// Export to Component Editor
	};
}