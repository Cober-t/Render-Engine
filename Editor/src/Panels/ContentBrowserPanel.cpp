#include "pch.h"
#include "ContentBrowserPanel.h"

#include <imgui/imgui.h>
#include <imgui/imgui_internal.h>

namespace Cober {

	// Once we have projects, change this
	extern const std::filesystem::path _assetPath = SOLUTION_DIR + (std::string)"assets";

	ContentBrowserPanel::ContentBrowserPanel()
		: _currentDirectory(_assetPath)
	{
		//m_DirectoryIcon = Texture2D::Create("Assets/Icons/DirectoryIcon.png");
		//m_FileIcon = Texture2D::Create("Assets/Icons/FileIcon.png");
	}

	void ContentBrowserPanel::OnGuiRender()
	{
		ImGui::Begin("Content Browser");

		if (_currentDirectory != std::filesystem::path(_assetPath))
			if (ImGui::Button("<-"))
				_currentDirectory = _currentDirectory.parent_path();

		static float padding = 10.0f;
		static float thumbnailSize = 64.0f;
		float cellSize = thumbnailSize + padding;

		float panelWidth = ImGui::GetContentRegionAvail().x;
		int columnCount = (int)(panelWidth / cellSize);

		if (columnCount < 1)
			columnCount = 1;

		ImGui::Columns(1);
		ImGui::SliderFloat("Thumbnail Size", &thumbnailSize, 16, 85);
		ImGui::SliderFloat("Padding", &padding, 0, 32);

		ImGui::Columns(columnCount, 0, false);

		for (auto& directoryEntry : std::filesystem::directory_iterator(_currentDirectory)) {
			const auto& path = directoryEntry.path();
			auto relativePath = std::filesystem::relative(path, _assetPath);
			std::string filenameString = relativePath.filename().string();
			ImGui::PushID(filenameString.c_str());

			//Ref<Texture2D> icon = directoryEntry.is_directory() ? m_DirectoryIcon : m_FileIcon;
			// EXPORT UNIVERSAL COLORS
			ImGui::PushStyleColor(ImGuiCol_Button, ImVec4(0.78f, 0.31f, 0.078f, 1.0f));
			ImGui::Button(filenameString.c_str(), {thumbnailSize, thumbnailSize});
			//ImGui::ImageButton((ImTextureID)icon->GetRendererID(), { thumbnailSize, thumbnailSize }, { 0, 1 }, { 1, 0 });

			// Drag and Drop
			if (ImGui::BeginDragDropSource()) {
				const wchar_t* itemPath = relativePath.c_str();
				ImGui::SetDragDropPayload("CONTENT_BROWSER_ITEM", itemPath, (wcslen(itemPath) + 1) * sizeof(wchar_t));
				ImGui::EndDragDropSource();
			}

			ImGui::PopStyleColor();
			if (ImGui::IsItemHovered() && ImGui::IsMouseDoubleClicked(ImGuiMouseButton_Left))
				if (directoryEntry.is_directory())
					_currentDirectory /= path.filename();

			//ImGui::TextWrapped(filenameString.c_str());
			ImGui::NextColumn();
			ImGui::PopID();
		}

		ImGui::End();
	}
}