#include "pch.h"

#include <imgui/imgui.h>
#include <glm/gtc/type_ptr.hpp>

#include "MenuPanel.h"
#include "ViewportPanel.h"
#include "SceneHierarchyPanel.h"
#include "Render/Render2D.h"

namespace Cober {

	MenuPanel* MenuPanel::instance = nullptr;

	MenuPanel::MenuPanel() 
	{
		instance = this;

		_gridPatternNumber = 2;
		_gridPatternSizes[0] = 1;
		_gridPatternSizes[1] = 10;

		AddColor("Cyan", glm::vec4(100, 150, 220, 255));
		AddColor("Orange", glm::vec4(237, 97, 35, 255));
		AddColor("Light Blue", glm::vec4(225, 225, 255, 255));
		AddColor("Dark Blue", glm::vec4(10, 0, 10, 255));
	}

	MenuPanel::~MenuPanel() 
	{
		delete instance;
		instance = nullptr;
	}

	void MenuPanel::OnGuiRender(Ref<EditorCamera>& editorCamera, Ref<Scene>& activeScene, Ref<Scene>& editorScene, bool& game2D, bool& debugMode) {

		_fileBrowser.Display();
		if (_fileBrowser.HasSelected()) {
			auto file_path = _fileBrowser.GetSelected().string();
			_filePath = file_path;
			//_currentFile = file_path.substr(file_path.find_last_of("/\\") + 1);
			OpenFileDialog(activeScene, _filePath);

			_fileBrowser.ClearSelected();
		}

		_world2D = game2D;

		if (ImGui::BeginMenuBar()) {
			
			if (ImGui::BeginMenu("File")) {
				
				if(ImGui::MenuItem("Open File Explorer"))
					_fileBrowser.Open();

				if (ImGui::MenuItem("Save Scene"))
					Scene::Save(activeScene, "EditorSceneTest.txt");	 // Test Scene

				if (ImGui::MenuItem("Load Scene")) {
					editorScene = Scene::Load("EditorSceneTest.txt"); // Test Scene
					activeScene = editorScene;
					SceneHierarchyPanel::Get().SetContext(activeScene);
					activeScene->SetDefaultEntity(activeScene->GetHoveredEntity());
					activeScene->OnRuntimeStart(activeScene);
				}

				if (ImGui::MenuItem("Exit"))
					Engine::Get().Close();

				if (ImGui::Checkbox("2D", &game2D))
					editorCamera->UpdateProjection(game2D);

				if (ImGui::Checkbox("Fullscreen", &_fullscreen))
					Engine::Get().GetWindow().ChangeFullScreen();


				if (ImGui::BeginCombo("Build Option", currentBuildOption)) {
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
				if (game2D) {
					if (ImGui::MenuItem("Grid 2D"))
						_gridMenuOpen = true;
				}
				else {
					if (ImGui::MenuItem("Grid 3D"))
						_gridMenuOpen = true;
				}

				if (ImGui::BeginCombo("Resolution", currentScreenSize)) {
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

				ImGui::Checkbox("Debug Mode", &debugMode);

				//if (ImGui::MenuItem("Camera Skybox")) {
				//		RenderGlobals::DrawCubeMap();
				//}

				if (ImGui::BeginMenu("Camera Solid Color")) {

					if (ImGui::BeginCombo("Default Colors", colorKey.c_str())) {
						for (auto& color : colors) {
							bool selected = (colorSelected == color.second);
							if (ImGui::Selectable(color.first.c_str(), selected)) {
								colorSelected = color.second;
								colorKey = color.first;
							}
						}

						ImGui::EndCombo();
					}

					if (customColors.size() > 0) {
						if (ImGui::BeginCombo("Custom Colors", keyAux.c_str())) {
							for (auto& color : customColors) {
								bool selected = (colorSelected == color.second);
								if (ImGui::Selectable(color.first.c_str(), selected)) {
									colorSelected = color.second;
									keyAux = color.first;
								}
							}
							ImGui::EndCombo();
						}
					}

					if (ImGui::BeginMenu("Custom Color")) {

						char buffer[256];
						memset(buffer, 0, sizeof(buffer));
						strcpy_s(buffer, sizeof(buffer), keyAux.c_str());

						if (ImGui::ColorEdit4("Color Value", glm::value_ptr(colorAux)))
							colorSelected = glm::vec4(colorAux.x * 255.0f, colorAux.y * 255.0f, colorAux.z * 255.0f, colorSelected.w);
						if (ImGui::InputText("Color Key", buffer, sizeof(buffer)))
							keyAux = std::string(buffer);
						if (ImGui::MenuItem("Add Color") && keyAux != "No Custom Colors") {
							customColors.emplace(keyAux, colorSelected);
							colorSelected = customColors.at(keyAux);
							colorAux = colorSelected;
						}
						ImGui::EndMenu();
					}

					if (customColors.size() > 0 && ImGui::BeginMenu("Remove Custom Color")) {
						if (ImGui::BeginCombo("Colors", keyAux.c_str())) {
							for (auto& color : customColors) {
								bool selected = (colorSelected == color.second);
								if (ImGui::Selectable(color.first.c_str(), selected)) {
									customColors.erase(color.first.c_str());
									break;
								}
							}
							ImGui::EndCombo();
						}
						ImGui::EndMenu();
					}

					ImGui::EndMenu();
				}

				ImGui::EndMenu();
			}

			ImGui::EndMenuBar();

			if (_gridMenuOpen)
				OpenGridOptions();

			Render2D::SetGridData(_gridPatternSizes, _gridPatternNumber, _gridOpacity);
		}
	}

	void MenuPanel::OpenFileDialog(Ref<Scene>& activeScene, const std::filesystem::path& path) {

		//if (_menuFileOption == MenuOptions::OPEN)
		//	OpenFile(path);
		//else if (_menuFileOption == MenuOptions::SAVE_AS) {
		//	SceneSerializer serializer(_activeScene);
		//	serializer.Serialize(path.string());
		//}
	}
	
	void MenuPanel::OpenGridOptions() {

		ImGui::Begin("GRID MOFIFICABLE OPTIONS", &_gridMenuOpen);
		if (ImGui::IsWindowFocused() == false)
			_gridMenuOpen = false;

		// Grid Pattern Number and Sizes
		ImGui::Text("Grid Editor Data");
		ImGui::SliderInt("Number", &_gridPatternNumber, 0, 4, "Grid Patterns", ImGuiSliderFlags_AlwaysClamp);

		if (_gridPatternNumber > 0)
			ImGui::SliderInt("Grid Pattern 1", &_gridPatternSizes[0], 1, 50, "Pattern Size 1", ImGuiSliderFlags_AlwaysClamp);
		if (_gridPatternNumber > 1)
			ImGui::SliderInt("Grid Pattern 2", &_gridPatternSizes[1], 1, 50, "Pattern Size 2", ImGuiSliderFlags_AlwaysClamp);
		if (_gridPatternNumber > 2)
			ImGui::SliderInt("Grid Pattern 3", &_gridPatternSizes[2], 1, 50, "Pattern Size 3", ImGuiSliderFlags_AlwaysClamp);
		if(_gridPatternNumber > 3)
			ImGui::SliderInt("Grid Pattern 4", &_gridPatternSizes[3], 1, 50, "Pattern Size 4", ImGuiSliderFlags_AlwaysClamp);

		// Snap Values
		if (_world2D) {
			ImGui::SliderFloat("Opacity 2D", &_gridOpacity, 0, 1, "Opacity");
			ImGui::Text("Snap Entities to Grid");
			ImGui::Checkbox("Snap Square 2DArea", &_snap2D);
			if (_snap2D)
				ImGui::SliderInt("Snap Value 3D", &_snap2DValue, 0, 50, "Snap 2D", ImGuiSliderFlags_AlwaysClamp);
		}
		else {
			ImGui::SliderFloat("Opacity 3D", &_gridOpacity, 0, 1, "Opacity");
			ImGui::Text("Snap Entities to Grid");
			ImGui::Checkbox("Snap Square 3DArea", &_snap3D);
			if (_snap3D)
				ImGui::SliderInt("Snap Value 3D", &_snap3DValue, 0, 50, "Snap 3D", ImGuiSliderFlags_AlwaysClamp);
		}

		ImGui::End();
	}

	bool MenuPanel::MustSnap() {

		return _world2D == true ? _snap2D : _snap3D;
	}
	float MenuPanel::SnapValue() {

		return _world2D == true ? _snap2DValue : _snap3DValue;
	}

	void MenuPanel::AddColor(std::string key, glm::vec4& color) {

		colors.emplace(key, color);
		colorSelected = color;
		colorKey = key;
	}

	void MenuPanel::Resize(Ref<EditorCamera>& camera, Ref<Scene>& scene, int width, int height, bool ortho) {

		camera->SetViewportSize(width, height, ortho);
		scene->OnViewportResize(width, height);
	}
}