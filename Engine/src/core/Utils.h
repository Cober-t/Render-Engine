#pragma once

#include <glm/glm.hpp>

namespace Cober::Utils {

	bool DecomposeTransform(const glm::mat4& transform, glm::vec3& translation, glm::vec3& rotation, glm::vec3& scale);

	// Thanks javidx9!
	class DataFile {
	public:
		// Data Structure
		void SetString(const std::string& string, const size_t item = 0);
		const std::string GetString(const size_t item = 0) const;

		void SetReal(const double d, const size_t item = 0);
		const double GetReal(const size_t item = 0) const;

		void SetVec2(const glm::vec2 vec);
		void SetVec3(const glm::vec3 vec);
		void SetVec4(const glm::vec4 vec);
		glm::vec2 GetVec2() const;
		glm::vec3 GetVec3() const;
		glm::vec4 GetVec4() const;

		void SetInt(const int32_t number, const size_t item = 0);
		const int32_t GetInt(const size_t item = 0) const;

		size_t GetValueCount() const;

		bool HasProperty(const std::string& sName) const;
		DataFile& GetProperty(const std::string& name);
		DataFile& GetIndexedProperty(const std::string& name, const size_t nIndex);

		inline DataFile& operator[](const std::string& name)
		{
			if (_mapObjects.count(name) == 0) {
				_mapObjects[name] = _vecObjects.size();
				_vecObjects.push_back({ name, DataFile() });
			}

			return _vecObjects[_mapObjects[name]].second;
		}

		// Serializer
		static bool Write(const DataFile& dataFile, const std::string& fileName, const std::string& indent = "\t", const char listStep = ',');
		// Deserializer
		static bool Read(DataFile& dataFile, const std::string& fileName, const char listStep = ',');

	private:
		// The "list of strings" that make up a property value
		std::vector<std::string> _content;

		std::vector<std::pair<std::string, DataFile>> _vecObjects;
		std::map<std::string, size_t> _mapObjects;
	protected:
		// Used to identify if a property is a comment or not, not user
		bool isComment = false;
	};
}