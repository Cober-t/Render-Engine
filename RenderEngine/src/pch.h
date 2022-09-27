#pragma once

#include <stdlib.h>
#include <stdint.h>
#include <crtdbg.h>

#include <iostream>
#include <fstream>
#include <memory>
#include <utility>
#include <algorithm>
#include <functional>
#include <bitset>
#include <set>
#include <typeindex>
#include <vector>
#include <map>

#include <string>
#include <sstream>
#include <array>
#include <vector>
#include <unordered_map>
#include <unordered_set>

// Own libs
#include <core/Logger.h>
#include <GL/glew.h>	// Always first
#include <SDL/SDL.h>
#include <SDL/SDL_image.h>
#include <SDL/SDL_mixer.h>
#include <SDL/SDL_ttf.h>
#include <glm/glm.hpp>


#define LOG(x) std::cout << x << std::endl;
#define SHADERS_PATH SOLUTION_DIR + (std::string)"assets\\shaders\\"
#define BIT(x)          (1 << x)
#define GET_ERROR()     Logger::Error(SDL_GetError());
#define Vec2            glm::vec2
#define Vec3            glm::vec3
#define Mat4            glm::mat3
#define Mat4            glm::mat4

namespace Cober {

	template<typename T>
	using Unique = std::unique_ptr<T>;
	template<typename T, typename ... Args>
	constexpr Unique<T> CreateUnique(Args&& ... args)
	{
		return std::make_unique<T>(std::forward<Args>(args)...);
	}

	template<typename T>
	using Ref = std::shared_ptr<T>;
	template<typename T, typename ... Args>
	constexpr Ref<T> CreateRef(Args&& ... args)
	{
		return std::make_shared<T>(std::forward<Args>(args)...);
	}
}