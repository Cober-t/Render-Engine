#pragma once

#include <stdlib.h>
#include <stdint.h>
#include <stdarg.h>
#ifndef __EMSCRIPTEN__
#ifndef __OPENGLES3__
	#include <crtdbg.h>
#endif
#endif
#include <cstddef>

#include <stdio.h>
#include <math.h>
#include <assert.h>
#include <limits.h>
#include <time.h>

#include <iostream>
#include <fstream>
#include <memory>
#include <string.h>	// For memset and memcpy Linux
#include <utility>
#include <algorithm>
#include <functional>
#include <bitset>
#include <set>
#include <typeindex>
#include <vector>
#include <list> 
#include <map>
#include <stack>

#include <filesystem>

#include <string>
#include <sstream>
#include <array>
#include <vector>
#include <map>
#include <set>

#include <SDL/SDL.h>
#include <SDL/SDL_image.h>
#include <SDL/SDL_mixer.h>
#include <SDL/SDL_ttf.h>
#include <glm/glm.hpp>
#include <core/Logger.h>