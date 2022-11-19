@echo off
:: Convenience Utility to build projects using olc::PixelGameEngine, using
:: Emscripten, producing WASM based output.
::
:: OneLoneCoder.com 2021 - Released under OLC-3 license
::
:: v1.00: Initial Release

setlocal enabledelayedexpansion enableextensions

:: Customize here ===========================================

:: Location of Emscripten SDK
set EMSDK="%~dp0emsdk\"

:: Location of Engine header files and libs
set ENGINE="%~dp0Engine\src"
set GAME="%~dp0Game\src"
set IncludeFolder="%~dp0Engine\include"
set LibsFolder=-I"%~dp0Engine\lib\" -I"%~dp0Engine\lib\box2d\" -I"%~dp0Engine\lib\lua\"
set core="%~dp0Engine\src\core"
set Render="%~dp0Engine\src\Render"
set Camera="%~dp0Engine\src\Render\Camera"
set Entities="%~dp0Engine\src\Entities"
set Platforms="%~dp0Engine\src\Platforms\OpenGLES3"
set Systems="%~dp0Engine\src\Systems"
set Physics="%~dp0Engine\src\Physics"
set GLES3="%~dp0Engine\include\GLES3"
set SDL="%~dp0Engine\include\SDL"
set GLM="%~dp0Engine\include\glm"
set NUKLEAR="%~dp0Engine\include\nuklear"
set NUKLEAR_SRC="%~dp0Engine\include\nuklear\src"

:: BOX2D
set COLLISION="%~dp0Engine\include\box2d\src\collision"
set COMMON="%~dp0Engine\include\box2d\src\common"
set DYNAMICS="%~dp0Engine\include\box2d\src\dynamics"
set ROPE="%~dp0Engine\include\box2d\src\rope"
set BOX2D_SRC="%~dp0Engine\include\box2d\src"
set BOX2D_H="%~dp0Engine\include\box2d\include"
set BOX2D_2H="%~dp0Engine\include\box2d\include\box2d"

set BOX2D_INCLUDES=-I%BOX2D_H% -I%BOX2D_2H% -I%BOX2D_SRC% 
::-I%COLLISION% -I%COMMON% -I%DYNAMICS% -I%ROPE% 

set INCLUDE_FOLDERS= -I%IncludeFolder% -I%ENGINE% -I%GAME% -I%core% -I%Render% -I%Camera% -I%Entities% -I%Platforms% -I%Systems% -I%Physics% -I%SDL% -I%GLM% -I%NUKLEAR% %BOX2D_INCLUDES% 

:: Compilation flags
set C++=-std=c++17
set CoreFlags=-sUSE_SDL_IMAGE=2 -sSDL2_IMAGE_FORMATS="[""png""]" -sUSE_SDL=2 -sUSE_WEBGL2=1 -sFULL_ES3=1 -sWASM=1
set SideFlags=-Wall -w -Wextra -sASSERTIONS=2 -sALLOW_MEMORY_GROWTH=1 -sFORCE_FILESYSTEM=1 --post-js glue.js
:: -sERROR_ON_UNDEFINED_SYMBOLS=0
::   -sEXPORTED_RUNTIME_METHODS="['printErr','print','FS_createPath']"
set Optimization=
::-Os

:: Macros
set MACROS=-D__EMSCRIPTEN__

:: ==========================================================

::set WORKINGDIR=%CD%
set WORKINGDIR=%~dp0
set DESTINATION=.\bin\WebGL2-build\game.js

if not exist %EMSDK% (
	echo Error: No Emscripten SDK folder found!
	goto :fail
)

if not exist %ENGINE% (
	echo Error: Invalid ENGINE Location!
	goto :fail
)

if "%1"=="build" goto :build
if "%1"=="run" goto :run
if "%1"=="clean" goto :clean
goto :error
	
:build 
	:: Configure path variables
	cd %EMSDK%
	call emsdk_env.bat 
	
	:: Create working folder
	cd %WORKINGDIR%
	if not exist ".\bin\WebGL2-build" (
		echo Creating .\bin\WebGL2-build output folder
		mkdir ".\bin\WebGL2-build"
	)
	
	:: Grab all cpp files if no specific file is given
	if "%~2"=="" goto :graball
	set CPP=%~2	
	goto :embuild
	
:graball
	echo Gathering *.cpp files
	set CPP=
	for %%x in (%GAME%\*.cpp, %ENGINE%\*.cpp,
				%Core%\*.cpp, %Render%\*.cpp, %Camera%\*.cpp, %Entities%\*.cpp, %Platforms%\*.cpp, %Systems%\*.cpp
				%COMMON%\*.cpp, %DYNAMICS%\*.cpp, %ROPE%\*.cpp, %COLLISION%\*.cpp) do set CPP=!CPP! %%x
	set CPP=%CPP:~1%

:embuild	
-I%Systems%
echo %CPP%
	if exist ".\assets" (
		echo Starting Build with assets...
		call em++ %C++% %Optimization% %CoreFlags% %SideFlags% %MACROS% %CPP% %Physics%\wrapperBox2D.cpp -o %DESTINATION% %INCLUDE_FOLDERS% --preload-file .\assets
	) else (
		echo Starting Build without assets...
		call em++ %C++% %Optimization% %CoreFlags% %SideFlags% %MACROS% %CPP% %Physics%\wrapperBox2D.cpp -o %DESTINATION% %INCLUDE_FOLDERS%
	)
	
	echo Build Completed
	goto :success

:run
	:: Configure path variables
	cd %EMSDK%
	call emsdk_env.bat
	cd %WORKINGDIR%
	emrun %~dp0\bin\WebGL2-build\index.html
	goto :success

:clean
	if exist ".\bin\WebGL2-build" (
		rmdir /s /q ".\bin\WebGL2-build"
	)
	goto :success

:error
	echo Error: Incorrect Input
	goto :fail

:success
	echo Exit With Success
	goto :leave

:fail
	echo Exit with Failure
	goto :leave
	
:leave
	PAUSE
	::exit


	



