#pragma once

#include <filesystem>
//#include "Cober/Renderer/Texture.h"

namespace Cober {

	class ContentBrowserPanel
	{
	public:

		ContentBrowserPanel();
		void OnGuiRender();
	private:
		std::filesystem::path _currentDirectory;
		//Ref<Texture2D> _directoryIcon;
		//Ref<Texture2D> _fileIcon;
	};
}
