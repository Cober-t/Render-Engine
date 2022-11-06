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
set EMSDK="C:\Users\jorge\OneDrive\Escritorio\Render_Engine\emsdk\"

:: Location of Engine header files
set ENGINE="%~dp0Engine\src"
set GAME="%~dp0Game\src"
set IncludeFolder="%~dp0Engine\include"
set core="%~dp0Engine\src\core"
set Render="%~dp0Engine\src\Render"
set Camera="%~dp0Engine\src\Render\Camera"
set Entities="%~dp0Engine\src\Entities"
set Platforms="%~dp0Engine\src\Platforms\OpenGLES3"
set Systems="%~dp0Engine\src\Systems"
set GLES3="%~dp0Engine\include\GLES3"
set SDL="%~dp0Engine\include\SDL"
set glm="%~dp0Engine\include\glm"
set box2D="%~dp0Engine\include\box2D"
set nuklear="%~dp0Engine\include\nuklear"

:: ==========================================================

::set WORKINGDIR=%CD%
set WORKINGDIR=%~dp0

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
	for %%x in (%GAME%\*.cpp, %ENGINE%\*.cpp, %Core%\*.cpp, %Render%\*.cpp, %Camera%\*.cpp, %Entities%\*.cpp, %Platforms%\*.cpp, %Systems%\*.cpp) do set CPP=!CPP! %%x
	set CPP=%CPP:~1%

:embuild	

echo %CPP%
	if not exist ".\assetss" (
		echo Starting Build without assets...
		set EMCC_AUTODEBUG=1
		call em++ -std=c++17 -O2 -sASSERTIONS=2 -sSAFE_HEAP=1 -sALLOW_MEMORY_GROWTH=1 -sUSE_WEBGL2=1 -sUSE_SDL=2 -sFULL_ES3=1 -sWASM=1 %CPP% -o .\bin\WebGL2-build\index.html -I%ENGINE% -I%GAME% -I%core% -I%Render% -I%Camera% -I%Entities% -I%Platforms% -I%Systems% -I%SDL% -I%glm% -I%box2D%
	) else (
		echo Starting Build with assets...
		call em++ -std=c++17 -sSTACK_OVERFLOW_CHECK=2 -sUSE_SDL=2 -sUSE_WEBGL2=1 -sFULL_ES3=1 -sLLD_REPORT_UNDEFINED -sLINKABLE=1 -sEXPORT_ALL=1 -sMAX_WEBGL_VERSION=2 -sMIN_WEBGL_VERSION=2 %CPP% -o .\bin\WebGL2-build\index.html -I%IncludeFolder% -I%ENGINE% -I%GAME% -I%core% -I%Render% -I%Camera% -I%Entities% -I%Platforms% -I%Systems% -I%glm% -I%box2D% -I%nuklear% --preload-file .\assets
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


	



