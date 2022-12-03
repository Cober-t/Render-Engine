#include "pch.h"

#include "ScriptSystem.h"

namespace Cober {

	ScriptSystem::ScriptSystem() {

		RequireComponent<Script>();
	}

	void ScriptSystem::Update() {

		for (auto entity : GetSystemEntities()) {

			//std::vector<sol::function> scriptsList = entity.GetComponent<Script>().scripts;

			//for (sol::function script : scriptsList) {
				//if (script != sol::lua_nil)
				//	script.func();	// Inoke lua function
			//}
		}

	}
}
