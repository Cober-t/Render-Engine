#pragma once

#include "core/Core.h"

namespace Cober {

	class CubeMap {
	public:
		virtual ~CubeMap() = default;

		static Ref<CubeMap> Create();
	private:
	};
}