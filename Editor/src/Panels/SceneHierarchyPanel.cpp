#include "pch.h"

#include "SceneHierarchyPanel.h"
//#include "Cober/Scene/Components.h"
//#include "Cober/Renderer/Renderer.h"
//#include "Cober/Renderer/Lighting.h"

#include <glm/gtc/type_ptr.hpp>
#include <imgui/imgui.h>
#include <imgui/imgui_internal.h>

namespace Cober {

	//extern const std::filesystem::path _assetPath = SOLUTION_DIR + (std::string)"assets";

	SceneHierarchyPanel::~SceneHierarchyPanel() {

	}

	void SceneHierarchyPanel::OnGuiRender() {

		ImGui::Begin("Scene Hierarchy");

		if (ImGui::BeginPopupContextWindow(0, 1)) {
			if (ImGui::Selectable("Empty Entity")) {
				// Create new Entity
			}
			ImGui::EndPopup();
		}
		ImGui::End();

		ImGui::Begin("Properties");
		//if (m_SelectionContext)
			//DrawComponents(m_SelectionContext);

		ImGui::End();
	}
}