#include "pch.h"

#include "DataPanel.h"

#include <imgui/imgui.h>

namespace Cober {

	DataPanel::DataPanel() {

	}

	DataPanel::~DataPanel() {

	}

	void DataPanel::OnGuiRender(bool& game2D) {

		ImGui::Begin("Data");

		//std::string name = "None";
		//if (m_HoveredEntity)
		//	name = m_HoveredEntity.GetComponent<TagComponent>().Tag;
		//ImGui::Text("Hovered Entity: %s", name.c_str());

		ImGui::Text("Renderer Stats:");
		ImGui::Text("Frames: %d", Engine::Get().GetFrames());
		ImGui::Text("Draw Calls: %d", Render2D::GetStats().DrawCalls);
		ImGui::Text("Frames: %d", Render2D::GetStats().QuadCount);
		ImGui::End();
	}

	//void DataPanel::OnGuiRender(Unique<DataManager> dataManager) {
	//
	//}
}