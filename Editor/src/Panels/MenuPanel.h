#pragma once
#include <Engine.h>

namespace Cober {

	class MenuPanel {
	public:
		MenuPanel();
		~MenuPanel();

		void OpenGridOptions(bool& grid2D);

		void OnGuiRender(bool& game2D);
	private:
		bool _fullscreen = false;
		bool _snap = false;
		bool _gridMenuOpen = false;
	};
}