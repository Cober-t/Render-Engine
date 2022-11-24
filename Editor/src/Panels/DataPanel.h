#pragma once

// Quit when DataManger class has been created
#include <Engine.h>

namespace Cober {

	class DataPanel {
	public:
		DataPanel();
		~DataPanel();

		static DataPanel& Get() { return *instance; }

		void OnGuiRender(bool& game2D, Entity& hoveredEntity);
		//void OnGuiRender(Unique<DataManager> dataManager);

	private:
		static DataPanel* instance;
	};
}