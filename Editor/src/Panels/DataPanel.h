#pragma once

// Quit when DataManger class has been created
#include <Engine.h>

namespace Cober {

	class DataPanel {
	public:
		DataPanel();
		~DataPanel();

		static DataPanel& Get() { return *instance; }

		void SetMouseX(int x) { mouseX = x; }
		void SetMouseY(int y) { mouseY = y; }

		void OnGuiRender(bool& game2D, Entity& hoveredEntity);
		//void OnGuiRender(Unique<DataManager> dataManager);

	private:
		int mouseX, mouseY;
	private:
		static DataPanel* instance;
	};
}