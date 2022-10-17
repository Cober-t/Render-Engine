#include "pch.h"
#include "core/Core.h"
#include "RenderGlobals.h"


namespace Cober {

	Unique<RenderAPI> RenderGlobals::_api = RenderAPI::Create();
}