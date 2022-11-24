#pragma once

#include <filesystem>

namespace Cober {

	class ContentBrowserPanel
	{
	public:
		ContentBrowserPanel();
		~ContentBrowserPanel();

		static ContentBrowserPanel& Get() { return *instance; }

		void OnGuiRender();
	private:
		static ContentBrowserPanel* instance;
		std::filesystem::path _currentDirectory;
		//Ref<Texture2D> _directoryIcon;
		//Ref<Texture2D> _fileIcon;
	};
}
