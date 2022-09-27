#include "pch.h"
#include "Shader.h"

Shader::Shader() {

}

std::string Shader::ReadFile(const std::string& filePath)
{
	std::string result;
	std::ifstream in(SHADERS_PATH + filePath, std::ios::in | std::ios::binary);
	if (in) {
		in.seekg(0, std::ios::end);
		result.resize(in.tellg());
		in.seekg(0, std::ios::beg);
		in.read(&result[0], result.size());
		in.close();
	}
	else
		LOG("Could not open file ");

	return result;
}