#include "pch.h"

#include <imgui/imgui.h>

#include "MenuPanel.h"
#include "ViewportPanel.h"

namespace Cober {

	MenuPanel* MenuPanel::instance = nullptr;

	MenuPanel::MenuPanel() 
	{
		instance = this;
	}

	MenuPanel::~MenuPanel() 
	{
		delete instance;
		instance = nullptr;
	}

	void MenuPanel::OnGuiRender(Ref<EditorCamera>& editorCamera, Ref<Scene>& activeScene, bool& game2D, bool& debugMode) {

		_fileBrowser.Display();
		if (_fileBrowser.HasSelected()) {
			auto file_path = _fileBrowser.GetSelected().string();
			_filePath = file_path;
			//_currentFile = file_path.substr(file_path.find_last_of("/\\") + 1);
			OpenFileDialog(activeScene, _filePath);

			_fileBrowser.ClearSelected();
		}

		if (ImGui::BeginMenuBar()) {
			if (ImGui::BeginMenu("File")) {
				if (ImGui::MenuItem("SaveScene"))
					_fileBrowser.Open();

				if (ImGui::MenuItem("Exit"))
					Engine::Get().Close();

				if(ImGui::Checkbox("2D", &game2D))
					editorCamera->UpdateProjection(game2D);

				if (ImGui::Checkbox("Fullscreen", &_fullscreen))
					Engine::Get().GetWindow().ChangeFullScreen();


				if (ImGui::BeginCombo("##Build Option", currentBuildOption)) {
					for (int n = 0; n < IM_ARRAYSIZE(_buildValues); n++) {
						bool selected = (currentBuildOption == _buildValues[n]);
						if (ImGui::Selectable(_buildValues[n], selected)) {
							currentBuildOption = _buildValues[n];
							switch (n) {
								case BUILD_OPTION::WINDOWS:	std::cout << _buildValues[n] << std::endl; /*Lod makefile path*/ break;
								case BUILD_OPTION::LINUX:	std::cout << _buildValues[n] << std::endl; /*Lod makefile path*/ break;
								case BUILD_OPTION::WEB:		std::cout << _buildValues[n] << std::endl; /*Lod makefile path*/ break;
							}
						}
					}
					ImGui::EndCombo();
				}

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

				ImGui::Checkbox("Debug Mode", &debugMode);

				if (ImGui::BeginCombo("##Resolution", currentScreenSize)) {
					for (int n = 0; n < IM_ARRAYSIZE(_screenValues); n++) {
						bool selected = (currentScreenSize == _screenValues[n]);
						if (ImGui::Selectable(_screenValues[n], selected)) {
							currentScreenSize = _screenValues[n];
							switch (n) {
								case SCREEN_SIZE::VERY_LOW:	 Resize(editorCamera, activeScene, _VPSize[n].x, _VPSize[n].y, game2D);	break;
								case SCREEN_SIZE::LOW:		 Resize(editorCamera, activeScene, _VPSize[n].x, _VPSize[n].y, game2D);	break;
								case SCREEN_SIZE::MID:		 Resize(editorCamera, activeScene, _VPSize[n].x, _VPSize[n].y, game2D);	break;
								case SCREEN_SIZE::HIGH:		 Resize(editorCamera, activeScene, _VPSize[n].x, _VPSize[n].y, game2D);	break;
								case SCREEN_SIZE::VERY_HIGH: Resize(editorCamera, activeScene, _VPSize[n].x, _VPSize[n].y, game2D);	break;
								case SCREEN_SIZE::ULTRA:	 Resize(editorCamera, activeScene, _VPSize[n].x, _VPSize[n].y, game2D);	break;
							}
						}
					}
					ImGui::EndCombo();
				}
				ImGui::EndMenu();
			}

			ImGui::EndMenuBar();
		}

		if(_gridMenuOpen)
			OpenGridOptions(game2D);
	}

	void MenuPanel::OpenFileDialog(Ref<Scene>& activeScene, const std::filesystem::path& path) {

		//if (_menuFileOption == MenuOptions::OPEN)
		//	OpenFile(path);
		//else if (_menuFileOption == MenuOptions::SAVE_AS) {
		//	SceneSerializer serializer(_activeScene);
		//	serializer.Serialize(path.string());
		//}
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


	void MenuPanel::Resize(Ref<EditorCamera>& camera, Ref<Scene>& scene, int width, int height, bool ortho) {

		camera->SetViewportSize(width, height, ortho);
		scene->OnViewportResize(width, height);
	}
}