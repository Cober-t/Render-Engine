#include "pch.h"

#include "MenuPanel.h"

#include <imgui/imgui.h>

namespace Cober {

	MenuPanel::MenuPanel() {

	}

	MenuPanel::~MenuPanel() {

	}

	void MenuPanel::OpenGridOptions(bool& grid2D) {

		ImGui::Begin("GRID MOFIFICABLE OPTIONS", &_gridMenuOpen);
		if (ImGui::IsWindowFocused() == false)
			_gridMenuOpen = false;

		if (grid2D) {
			ImGui::Text("PROVISIONAL");
			ImGui::Text("Adjustable Grid Data");
			ImGui::Checkbox("Snap Square Area", &_snap);
			//if (snap)
				//ImGui::VSliderInt();
		}
		else {
			ImGui::Text("PROVISIONAL");
			ImGui::Text("Adjustable Grid Data");
			ImGui::Checkbox("Snap Cube Area", &_snap);
			//if (snap)
				//ImGui::VSliderInt();
		}
		ImGui::End();
	}

	void MenuPanel::OnGuiRender(bool& game2D) {

		if (ImGui::BeginMenuBar()) {
			if (ImGui::BeginMenu("File")) {
				if (ImGui::MenuItem("Exit"))
					Engine::Get().Close();

				ImGui::Checkbox("2D", &game2D);
				if (ImGui::Checkbox("Fullscreen", &_fullscreen))
					Engine::Get().GetWindow().ChangeFullScreen();


				ImGui::EndMenu();
			}

			if (ImGui::BeginMenu("Options")) {
				if (game2D){
					if (ImGui::MenuItem("Grid 2D"))
						_gridMenuOpen = true;
				} 
				else {
					if (ImGui::MenuItem("Grid 3D"))
						_gridMenuOpen = true;
				}
				ImGui::EndMenu();
			}

			//if (ImGui::BeginMenu("Resolutions")) {
			//	if (ImGui::TreeNode())
			//
			//	ImGui::EndMenu();
			//}
			ImGui::EndMenuBar();
		}

		if(_gridMenuOpen)
			OpenGridOptions(game2D);
	}
}