#pragma once

// Quit when DataManger class has been created
#include <Engine.h>

namespace Cober {

	class DataPanel {
	public:
		DataPanel();
		~DataPanel();

		static Unique<DataPanel> Create() { return CreateUnique<DataPanel>(); }

		void OnGuiRender(bool& game2D, Entity hoveredEntity);
		//void OnGuiRender(Unique<DataManager> dataManager);
	};
}