workspace "GameEngine"
	architecture "x64"
	startproject "Game"

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

project "Engine"
	location "Engine"
	kind "StaticLib"
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
        "%{prj.name}/include/GLES3/**.h",
		"%{prj.name}/include/SDL/**.h",
		"%{prj.name}/include/glm/**.h",
		"%{prj.name}/include/glm/**.hpp",
		"%{prj.name}/include/glm/**.inl",
		"%{prj.name}/include/sol/**.hpp",
		"%{prj.name}/include/lua/**.h",
		"%{prj.name}/include/lua/**.hpp",
		"%{prj.name}/include/box2d/include/box2d/**.h",
		"%{prj.name}/include/entt/**.hpp",
		"%{prj.name}/include/nuklear/**.h",
		--"%{prj.name}/include/imgui/**.cpp",
		--"%{prj.name}/include/imgui/**.h",
		--"%{prj.name}/include/core/**.cpp",
		--"%{prj.name}/include/core/**.h",
		--"%{prj.name}/include/Entities/**.cpp",
		--"%{prj.name}/include/Entities/**.h",
		--"%{prj.name}/include/GUISystem/**.cpp",
		--"%{prj.name}/include/GUISystem/**.h",
		--"%{prj.name}/include/Systems/**.cpp",
		--"%{prj.name}/include/Systems/**.h",
		--"%{prj.name}/include/Render/**.cpp",
		--"%{prj.name}/include/Render/**.h",
		--"%{prj.name}/include/Render/Camera/**.h",
		--"%{prj.name}/include/Render/Camera/**.cpp",
	}

	defines
	{
		"_CRT_SECURE_NO_WARNINGS"
	}

	includedirs
	{
		"%{prj.name}/include",
		"%{prj.name}/include/SDL",
		"%{prj.name}/include/glm",
		"%{prj.name}/include/box2d",
		"%{prj.name}/include/box2d/include",
		"%{prj.name}/include/nuklear",
		"%{prj.name}/include/sol",
		"%{prj.name}/include/lua",
		"%{prj.name}/src",
		"%{prj.name}/src/imgui",
		"%{prj.name}/src/core",
		"%{prj.name}/src/Entities",
		"%{prj.name}/src/Render",
		"%{prj.name}/src/Render/Camera",
		"%{prj.name}/src/GUISystem",
		"%{prj.name}/src/Systems",
		"%{prj.name}/src/Platforms",
		"%{prj.name}/src/Platforms/OpenGL",
		"%{prj.name}/src/Platforms/OpenGLES3",
		--"%{prj.name}/src/Physics",
	}

	libdirs
	{
        	"%{prj.name}/lib/GL",
        	"%{prj.name}/lib/GLES3",
        	"%{prj.name}/lib/box2d",
        	"%{prj.name}/lib/lua",
        	"%{prj.name}/lib/SDL",
	}

	links
	{
		"opengl32",
		"glew32s",
		"libGLESv2",
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
			'SOLUTION_DIR=R"($(SolutionDir))"',
			"CB_BUILD_DLL",
			"IMGUI_IMPL_OPENGL_LOADER_CUSTOM=<SDL_opengl.h>",
			"NK_IMPLEMENTATION",
			"NK_SDL_GL3_IMPLEMENTATION",
			"GL_GLEXT_PROTOTYPES=1",
			"GLEW_STATIC",
			"__OPENGL__",
			--"__OPENGLES3__",
		}

	filter "configurations:Debug"
		defines "CB_DEBUG"
		--buildoptions "/MTd"
		buildoptions "/MDd"
		symbols "on"

	filter "configurations:Release"
		defines "CB_RELEASE"
		--buildoptions "/MT"
		buildoptions "/MD"
		optimize "on"

	filter "configurations:Dist"
		defines "CB_DIST"
		--buildoptions "/MT"
		buildoptions "/MD"
		optimize "on"

project "Editor"
	location "Editor"
	kind "ConsoleApp"
	language "C++"
	cppdialect "C++17"
	ignoredefaultlibraries { "MSVCRT" }
	ignoredefaultlibraries { "LIBCMT" }
	staticruntime "on"

	targetdir ("bin/" .. outputdir .. "/%{prj.name}")
	objdir("bin-int/" .. outputdir .. "/%{prj.name}")

	files 
	{
		"%{prj.name}/**.h",
		"%{prj.name}/**.cpp"
	}

	includedirs
	{
		"Engine/include",
		"Engine/include/SDL",
		"Engine/include/glm",
		"Engine/include/box2d/include",
		"Engine/include/nuklear",
		"Engine/include/sol",
		"Engine/include/lua",
		"Engine/include/imgui",
		"Engine/src",
	}

	links 
	{
		"Engine"
	}

	filter "system:windows"
		systemversion "latest"
		
		defines 
		{
			"CB_PLATFORM_WINDOWS",
			'SOLUTION_DIR=R"($(SolutionDir))"',
			"NK_IMPLEMENTATION",
			"NK_SDL_GL3_IMPLEMENTATION",
			"IMGUI_IMPL_OPENGL_LOADER_CUSTOM=<SDL_opengl.h>",
			"GL_GLEXT_PROTOTYPES=1",
			"GLEW_STATIC",
			"__OPENGL__",
		}


	filter "configurations:Debug"
		defines "CB_DEBUG"
		--buildoptions "/MTd"
		buildoptions "/MDd"
		symbols "on"

	filter "configurations:Release"
		defines "CB_RELEASE"
		--buildoptions "/MT"
		buildoptions "/MD"
		optimize "on"

	filter "configurations:Dist"
		defines "CB_DIST"
		--buildoptions "/MT"
		buildoptions "/MD"
		optimize "on"

project "Game"
	location "Game"
	kind "ConsoleApp"
	language "C++"
	cppdialect "C++17"
	staticruntime "on"

	targetdir ("bin/" .. outputdir .. "/%{prj.name}")
	objdir("bin-int/" .. outputdir .. "/%{prj.name}")

	files 
	{
		"%{prj.name}/**.h",
		"%{prj.name}/**.cpp",
	}

	includedirs
	{
		"Engine/include",
		"Engine/include/SDL",
		"Engine/include/glm",
		"Engine/include/box2d/include",
		"Engine/include/nuklear",
		"Engine/include/sol",
		"Engine/include/lua",
		"Engine/src",
	}

	links 
	{
		"Engine"
	}

	filter "system:windows"
		systemversion "latest"

		defines 
		{
			"CB_PLATFORM_WINDOWS",
			'SOLUTION_DIR=R"($(SolutionDir))"',
			"NK_IMPLEMENTATION",
			--"GL_GLEXT_PROTOTYPES=1",
			--"GLEW_STATIC",
			--"__OPENGL__",
			--"__OPENGLES3__",
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
