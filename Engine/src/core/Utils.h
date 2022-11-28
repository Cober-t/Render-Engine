#pragma once

#include <glm/glm.hpp>

namespace Cober::Utils {

	bool DecomposeTransform(const glm::mat4& transform, glm::vec3& translation, glm::vec3& rotation, glm::vec3& scale);
}