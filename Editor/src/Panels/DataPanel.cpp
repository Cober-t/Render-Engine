#include "pch.h"

#include "DataPanel.h"
#include "SceneHierarchyPanel.h"

#include <imgui/imgui.h>

namespace Cober {

	DataPanel* DataPanel::instance = nullptr;

	DataPanel::DataPanel() 
	{
		instance = this;
	}

	DataPanel::~DataPanel() 
	{
		delete instance;
		instance = nullptr;
	}

	void DataPanel::OnGuiRender(bool& game2D, Entity& hoveredEntity) {

		// Data
		ImGui::Begin("Data");

		//if (hoveredEntity.GetIndex() != -1 && ImGui::IsMouseClicked(0)) {
		//	hoveredEntity.SetTag("None"); 
		//	hoveredEntity.SetIndex(-1);
		//	SceneHierarchyPanel::Get().SetNullEntityContext();
		//}

		ImGui::Text("Renderer Stats:");
		ImGui::Text("Frames: %d", Engine::Get().GetFrames());
		ImGui::Text("Draw Calls: %d", Render2D::GetStats().DrawCalls);
		ImGui::Text("Quads: %d", Render2D::GetStats().QuadCount);

		ImGui::Text("Mouse Coords: \nX: %i\nY: %i", mouseX, mouseY);
		if (hoveredEntity.GetIndex() == -1)
			ImGui::Text("Hovered Entity: %s", hoveredEntity.GetTag().c_str());
		else
			ImGui::Text("Hovered Entity: %s", hoveredEntity.GetComponent<Tag>().tag.c_str());

		ImGui::Text("Entity Index: %i", hoveredEntity.GetIndex());

		ImGui::End();

		//Console
		ImGui::Begin("Console");
		
		for (auto& message : Logger::messages) {
			switch(message.type)
			{ 
				case LOG_INFO:		ImGui::PushStyleColor(ImGuiCol_Text, IM_COL32( 80, 255, 255, 255));	break;
				case LOG_WARNING:	ImGui::PushStyleColor(ImGuiCol_Text, IM_COL32(125, 125,   0, 255));	break;
				case LOG_ERROR:		ImGui::PushStyleColor(ImGuiCol_Text, IM_COL32(255,   0,   0, 255));	break;
				default:			ImGui::PushStyleColor(ImGuiCol_Text, IM_COL32(255, 255, 255, 255));	break;
			}
			ImGui::Text(message.message.c_str());
			ImGui::PopStyleColor();
		}
		//Logger::messages.clear();

		ImGui::End();

	}

	//void DataPanel::OnGuiRender(Unique<DataManager> dataManager) {
	//
	//}
}