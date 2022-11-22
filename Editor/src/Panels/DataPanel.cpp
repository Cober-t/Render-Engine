#include "pch.h"

#include "DataPanel.h"

#include <imgui/imgui.h>

namespace Cober {

	DataPanel::DataPanel() {

	}

	DataPanel::~DataPanel() {

	}

	void DataPanel::OnGuiRender(bool& game2D, Entity hoveredEntity) {

		ImGui::Begin("Data");

		ImGui::Text("Renderer Stats:");
		ImGui::Text("Frames: %d", Engine::Get().GetFrames());
		ImGui::Text("Draw Calls: %d", Render2D::GetStats().DrawCalls);
		ImGui::Text("Quads: %d", Render2D::GetStats().QuadCount);

		if (hoveredEntity.GetIndex() == -1)
			ImGui::Text("Hovered Entity: %s", hoveredEntity.GetTag().c_str());
		else
			ImGui::Text("Hovered Entity: %s", hoveredEntity.GetComponent<Tag>().tag.c_str());

		ImGui::Text("Entity Index: %i", hoveredEntity.GetIndex());

		ImGui::End();
	}

	//void DataPanel::OnGuiRender(Unique<DataManager> dataManager) {
	//
	//}
}