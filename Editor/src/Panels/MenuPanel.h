#pragma once
#include <Engine.h>

namespace Cober {

	class MenuPanel {
	public:
		MenuPanel();
		~MenuPanel();

		static Unique<MenuPanel> Create() { return CreateUnique<MenuPanel>(); }

		void OpenGridOptions(bool& grid2D);

		void OnGuiRender(bool& game2D, bool& debugMode);
	private:
		bool _fullscreen = false;
		bool _snap = false;
		bool _gridMenuOpen = false;
	};
}