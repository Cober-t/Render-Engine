CC = g++
LANG_STD = -std=c++17
NAME = Engine
COMPILER_FLAGS = -Wall -w -Wfatal-errors -fpermissive
INCLUDE_PATH= -I ./$(NAME)/include \
			  -I ./$(NAME)/include/box2D \
			  -I ./$(NAME)/include/SDL \
			  -I ./$(NAME)/include/glm \
			  -I ./$(NAME)/include/GLES3 \
			  -I ./Game/src \
			  -I ./$(NAME)/src \
			  -I ./$(NAME)/src/core \
			  -I ./$(NAME)/src/Events \
			  -I ./$(NAME)/src/Entities \
			  -I ./$(NAME)/src/Platforms/OpenGLES3 \
			  -I ./$(NAME)/src/Render \
			  -I ./$(NAME)/src/Render/Camera \
			  -I ./$(NAME)/src/Systems \
			  -I ./$(NAME)/lib/
SRC_FILES = $(NAME)/src/*.cpp \
			$(NAME)/src/core/*.cpp \
			$(NAME)/src/Events/*.cpp \
			$(NAME)/src/Render/*.cpp \
			$(NAME)/src/Render/Camera/*.cpp \
			$(NAME)/src/Platforms/OpenGLES3/*.cpp \
			$(NAME)/src/Entities/*.cpp \
			$(NAME)/src/Systems/*.cpp \
			Game/src/**.cpp
LINKER_FLAGS= -lSDL2 -lSDL2_image -lGLESv2 -lBox2D
BUILD_FOLDER= bin/Linux-build/
DEFINES=-D __OPENGLES3__
OBJ_NAME = Game

build:
	$(CC) $(COMPILER_FLAGS) $(LANG_STD) $(DEFINES) $(INCLUDE_PATH) $(SRC_FILES) $(LINKER_FLAGS) -o $(BUILD_FOLDER)$(OBJ_NAME)

run:
	./$(BUILD_FOLDER)$(OBJ_NAME)
	
clean:
	rm ./$(BUILD_FOLDER)$(OBJ_NAME)
