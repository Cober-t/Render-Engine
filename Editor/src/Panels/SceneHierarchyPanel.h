#pragma once

//#include "Engine/Core/Core.h"
//#include "Engine/Core/Logger.h"
//#include "Engine/Scene/Scene.h"
//#include "Engine/Scene/Entity.h"

#include <filesystem>

namespace Cober {

	class SceneHierarchyPanel
	{
	public:
		SceneHierarchyPanel() = default;
		~SceneHierarchyPanel();
		//SceneHierarchyPanel(const Ref<Scene>& scene);

		//void SetContext(const Ref<Scene>& scene);

		void OnGuiRender();
		//Entity GetSelectedEntity() const { return m_SelectionContext; }
		//void SetSelectedEntity(Entity entity);

		//template<typename T, typename UIFunction>
		//void DrawComponent(const std::string& name, Entity entity, UIFunction uiFunction);

		template<typename T>
		void AddIfHasComponent(std::string name);
	private:
		//void DrawEntityNode(Entity entity);
		//void DrawComponents(Entity entity);
	private:
		//Ref<Scene> m_Context;
		//Entity m_SelectionContext;
	};
}
