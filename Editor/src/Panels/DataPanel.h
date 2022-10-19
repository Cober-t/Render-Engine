#pragma once

// Quit when DataManger class has been created
#include <Engine.h>

namespace Cober {

	class DataPanel {
	public:
		DataPanel();
		~DataPanel();

		void OnGuiRender(bool& game2D);
		//void OnGuiRender(Unique<DataManager> dataManager);
	private:
	};
}