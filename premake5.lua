workspace "Engine"
	architecture "x64"
	startproject "Engine"

	configurations
	{
		"Debug",
		"Release",
		"Dist"
	}
	flags
	{
		"MultiProcessorCompile"
	}

outputdir = "%{cfg.buildcfg}-%{cfg.system}-%{cfg.architecture}"

project "RenderEngine"
	location "RenderEngine"
	kind "ConsoleApp"
	language "C++"
	warnings "Off"
	ignoredefaultlibraries { "MSVCRT" }
	ignoredefaultlibraries { "LIBCMT" }
	implibprefix ("obj")
	cppdialect "C++17"
	staticruntime "on"

	targetdir ("bin/" .. outputdir .. "/%{prj.name}")
	objdir ("bin-int/" .. outputdir .. "/%{prj.name}")

	pchheader "pch.h"
	pchsource "%{prj.name}/src/pch.cpp" 	

	files
	{
		"%{prj.name}/src/**.h",
		"%{prj.name}/src/**.cpp",
        	"%{prj.name}/include/GL/**.h",
		"%{prj.name}/include/SDL/**.h",
		"%{prj.name}/include/glm/**.h",
		"%{prj.name}/include/glm/**.hpp",
		"%{prj.name}/include/glm/**.inl",
		"%{prj.name}/include/sol/**.hpp",
		"%{prj.name}/include/lua/**.h",
		"%{prj.name}/include/lua/**.hpp",
		"%{prj.name}/include/box2D/**.h",
		"%{prj.name}/include/entt/**.hpp",
		"%{prj.name}/include/imgui/**.cpp",
		"%{prj.name}/include/imgui/**.h",
	}

	defines
	{
		"_CRT_SECURE_NO_WARNINGS"
	}

	includedirs
	{
		"%{prj.name}/include",
		"%{prj.name}/include/SDL",
		"%{prj.name}/src",
		"%{prj.name}/src/imgui"
	}

	libdirs
	{
        	"%{prj.name}/lib/GL",
        	"%{prj.name}/lib/box2D",
        	"%{prj.name}/lib/lua",
        	"%{prj.name}/lib/SDL",
	}

	links
	{
		"opengl32",
		"glew32s",		
		"Box2D",
		"SDL2",
		"SDL2main",
		"SDL2_image",
		"SDL2_mixer",
		"SDL2_ttf",
		--"liblua54",
	}

	postbuildcommands
	{
		-- "{COPY} ..\\lib\\SDL2\\SDL2.dll/ ..\\bin\\" .. outputdir .. "\\Engine",
	}

	--filter "files:Cober/include/ImGuizmo/**.cpp"
	--flags { "NoPCH" }

	--filter "files:Cober/include/Bullet/**.cpp"
	--flags { "NoPCH" }

	filter "system:windows"
		systemversion "latest"

		defines
		{
			"CB_PLATFORM_WINDOWS",
			"IMGUI_IMPL_OPENGL_LOADER_CUSTOM=<SDL_opengl.h>",
			"GL_GLEXT_PROTOTYPES=1",
			"CB_BUILD_DLL",
			"GLEW_STATIC",
			'SOLUTION_DIR=R"($(SolutionDir))"'
		}

	filter "configurations:Debug"
		defines "CB_DEBUG"
		buildoptions "/MDd"
		symbols "on"

	filter "configurations:Release"
		defines "CB_RELEASE"
		buildoptions "/MD"
		optimize "on"

	filter "configurations:Dist"
		defines "CB_DIST"
		buildoptions "/MD"
		optimize "on"