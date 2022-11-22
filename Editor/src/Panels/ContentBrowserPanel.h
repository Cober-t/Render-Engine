#pragma once

#include "core/Core.h"

#include <filesystem>

namespace Cober {

	class ContentBrowserPanel
	{
	public:
		ContentBrowserPanel();

		static Unique<ContentBrowserPanel> Create() { return CreateUnique<ContentBrowserPanel>(); }

		void OnGuiRender();
	private:
		std::filesystem::path _currentDirectory;
		//Ref<Texture2D> _directoryIcon;
		//Ref<Texture2D> _fileIcon;
	};
}
