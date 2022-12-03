#pragma once

#include "core/Core.h"
#include "Entities/ECS.h"
#include "Entities/Components.h"

#ifndef __EMSCRIPTEN__
	#include <sol/sol.hpp>
#endif

namespace Cober {

	class ScriptSystem : public System {
	public:
		ScriptSystem();

		void Update();
	};
}

