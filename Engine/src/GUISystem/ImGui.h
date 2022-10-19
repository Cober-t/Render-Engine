#pragma once

// MACROS
//#ifdef DEBUG
//
//#endif // IMGUI_IMPL_

// INCLUDES
#include "imgui/imgui.h"
#include "imgui/imgui_impl_sdl.h"
#include "imgui/imgui_impl_opengl3.h"

// COLORS
#define IMGUI_FULL_OPACITY		ImVec4(1.000f, 1.000f, 1.000f, 0.000f)
#define IMGUI_WHITE				ImVec4(1.000f, 1.000f, 1.000f, 1.000f)
#define IMGUI_WHITE_OPACITY_1	ImVec4(1.000f, 1.000f, 1.000f, 0.900f)
#define IMGUI_WHITE_OPACITY_2	ImVec4(1.000f, 1.000f, 1.000f, 0.800f)
#define IMGUI_WHITE_OPACITY_3	ImVec4(1.000f, 1.000f, 1.000f, 0.700f)
#define IMGUI_WHITE_OPACITY_4	ImVec4(1.000f, 1.000f, 1.000f, 0.600f)
#define IMGUI_WHITE_OPACITY_5	ImVec4(1.000f, 1.000f, 1.000f, 0.500f)
#define IMGUI_WHITE_OPACITY_6	ImVec4(1.000f, 1.000f, 1.000f, 0.400f)
#define IMGUI_WHITE_OPACITY_7	ImVec4(1.000f, 1.000f, 1.000f, 0.300f)
#define IMGUI_WHITE_OPACITY_8	ImVec4(1.000f, 1.000f, 1.000f, 0.200f)
#define IMGUI_WHITE_OPACITY_9	ImVec4(1.000f, 1.000f, 1.000f, 0.150f)
#define IMGUI_WHITE_OPACITY_10	ImVec4(1.000f, 1.000f, 1.000f, 0.100f)

#define IMGUI_BLACK				ImVec4(0.000f, 0.000f, 0.000f, 1.000f)
#define IMGUI_BLACK_OPACITY_1	ImVec4(0.000f, 0.000f, 0.000f, 0.900f)
#define IMGUI_BLACK_OPACITY_2	ImVec4(0.000f, 0.000f, 0.000f, 0.800f)
#define IMGUI_BLACK_OPACITY_3	ImVec4(0.000f, 0.000f, 0.000f, 0.700f)
#define IMGUI_BLACK_OPACITY_4	ImVec4(0.000f, 0.000f, 0.000f, 0.600f)
#define IMGUI_BLACK_OPACITY_5	ImVec4(0.000f, 0.000f, 0.000f, 0.500f)
#define IMGUI_BLACK_OPACITY_6	ImVec4(0.000f, 0.000f, 0.000f, 0.400f)
#define IMGUI_BLACK_OPACITY_7	ImVec4(0.000f, 0.000f, 0.000f, 0.300f)
#define IMGUI_BLACK_OPACITY_8	ImVec4(0.000f, 0.000f, 0.000f, 0.200f)
#define IMGUI_BLACK_OPACITY_9	ImVec4(0.000f, 0.000f, 0.000f, 0.150f)
#define IMGUI_BLACK_OPACITY_10	ImVec4(0.000f, 0.000f, 0.000f, 0.100f)

#define IMGUI_MID_GRAY_OPACITY_1	ImVec4(0.500f, 0.500f, 0.500f, 0.100f)
#define IMGUI_MID_GRAY_OPACITY_2	ImVec4(0.500f, 0.500f, 0.500f, 0.200f)
#define IMGUI_MID_GRAY_OPACITY_3	ImVec4(0.500f, 0.500f, 0.500f, 0.300f)
#define IMGUI_MID_GRAY_OPACITY_4	ImVec4(0.500f, 0.500f, 0.500f, 0.400f)
#define IMGUI_MID_GRAY_OPACITY_5	ImVec4(0.500f, 0.500f, 0.500f, 0.500f)
#define IMGUI_MID_GRAY_OPACITY_6	ImVec4(0.500f, 0.500f, 0.500f, 0.600f)
#define IMGUI_MID_GRAY_OPACITY_7	ImVec4(0.500f, 0.500f, 0.500f, 0.700f)
#define IMGUI_MID_GRAY_OPACITY_8	ImVec4(0.500f, 0.500f, 0.500f, 0.800f)

#define IMGUI_GRAY_1	ImVec4(0.800f, 0.800f, 0.800f, 1.000f)
#define IMGUI_GRAY_2	ImVec4(0.700f, 0.700f, 0.700f, 1.000f)
#define IMGUI_GRAY_3	ImVec4(0.600f, 0.600f, 0.600f, 1.000f)
#define IMGUI_GRAY_4	ImVec4(0.500f, 0.500f, 0.500f, 1.000f)
#define IMGUI_GRAY_5	ImVec4(0.400f, 0.400f, 0.400f, 1.000f)
#define IMGUI_GRAY_6	ImVec4(0.300f, 0.300f, 0.300f, 1.000f)
#define IMGUI_GRAY_7	ImVec4(0.250f, 0.250f, 0.250f, 1.000f)
#define IMGUI_GRAY_8	ImVec4(0.200f, 0.200f, 0.200f, 1.000f)
#define IMGUI_GRAY_9	ImVec4(0.150f, 0.150f, 0.150f, 1.000f)
#define IMGUI_GRAY_10	ImVec4(0.100f, 0.100f, 0.100f, 1.000f)

#define IMGUI_ORANGE				ImVec4(1.000f, 0.391f, 0.000f, 1.000f);
#define IMGUI_ORANGE_LOW_OPACITY	ImVec4(1.000f, 0.391f, 0.000f, 0.750f);

#define IMGUI_GRAY				ImVec4(0.500f, 0.500f, 0.500f, 1.000f)
#define IMGUI_DARK				ImVec4(0.148f, 0.148f, 0.148f, 1.000f)
#define IMGUI_DARKEST			ImVec4(0.100f, 0.100f, 0.100f, 1.000f)
#define IMGUI_DARK_GRAY			ImVec4(0.280f, 0.280f, 0.280f, 1.000f)

#define COLOR_IMGUI(r, g, b, a) ImVec4(r, g, b, a)