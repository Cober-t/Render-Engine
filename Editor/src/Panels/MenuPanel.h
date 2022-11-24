#pragma once
#include <Engine.h>
#include "GUISystem/ImFileBrowser.h" 

namespace Cober {

	class MenuPanel {
	public:
		MenuPanel();
		~MenuPanel();

		static MenuPanel& Get() { return *instance; }

		void OnGuiRender(Ref<EditorCamera>& editorCamera, Ref<Scene>& activeScene, bool& game2D, bool& debugMode);

		void OpenFileDialog(Ref<Scene>& activeScene, const std::filesystem::path& path);
		void OpenGridOptions(bool& grid2D);

	private:
		void Resize(Ref<EditorCamera>& camera, Ref<Scene>& scene, int width, int height, bool ortho);
	private:
		bool _fullscreen   = false;
		bool _snap		   = false;
		bool _gridMenuOpen = false;

		enum BUILD_OPTION { WINDOWS = 0, LINUX, WEB };
		enum SCREEN_SIZE  { VERY_LOW = 0, LOW, MID, HIGH, VERY_HIGH, ULTRA };

		const char* currentScreenSize = nullptr;
		const char* _buildValues[3]	= { "Windows", "Linux", "Web" };	// Add paths to makefiles instead platform names

		const char* currentBuildOption = nullptr;
		const char* _screenValues[6] = {
			{  "640 x 480"  },
			{  "800 x 400"  },
			{ "1280 x 720"  },
			{ "1366 x 768"  },
			{ "1920 x 1080" },
			{ "2560 x 1440" }
		};
		glm::vec2 _VPSize[6] = { {640, 480}, {800, 400}, {1280, 720}, {1366, 768}, {1920, 1080}, {2560, 1440} };

		ImGui::FileBrowser _fileBrowser;
		std::string _filePath;
		enum MenuOptions { OPEN = 0, SAVE_AS };
		MenuOptions _menuFileOption;
	private:
		static MenuPanel* instance;
	};
}