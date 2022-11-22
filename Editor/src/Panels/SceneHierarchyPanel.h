#pragma once

#include <filesystem>

namespace Cober {

	class SceneHierarchyPanel
	{
	public:
		SceneHierarchyPanel() = default;
		~SceneHierarchyPanel();

		static Unique<SceneHierarchyPanel> Create() { return CreateUnique<SceneHierarchyPanel>(); }

		void OnGuiRender();

		void SetContext(const Ref<Scene>& selectionContext);
		Entity GetSelectedEntity() const { return _selectionContext; }
		void SetSelectedEntity(Entity entity);

		template<typename T, typename UIFunction>
		void DrawComponent(const std::string& name, Entity& entity, UIFunction uiFunction);

		template<typename T>
		void AddIfHasComponent(std::string name);
	private:
		void DrawEntityNode(Entity entity);
		void DrawComponents(Entity& entity);
	private:
		Ref<Scene> _sceneContext;
		Entity _selectionContext;
		Entity _nullEntityContext;
	};
}
