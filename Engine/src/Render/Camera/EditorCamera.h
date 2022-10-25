#pragma once

#include "Camera.h"
#include "core/Timestep.h"
//#include "core/MouseEvents.h"

#include <core/Core.h>

//#include <glm/glm.hpp>

namespace Cober {

	class EditorCamera : public Camera
	{
	public:
		EditorCamera() = default;
		EditorCamera(float fov, float aspectRatio, float nearClip, float farClip);
		~EditorCamera();

		void OnUpdate(Ref<Timestep> ts);
		void OnEvent(SDL_Event& event);

		float OnMouseScroll(SDL_MouseWheelEvent& event);
		void SetViewportFocused(bool focus) { _viewportFocused = focus; }
		bool GetViewportFocused() { return _viewportFocused; }

		inline float GetDistance() const { return _distance; }
		inline void SetDistance(float distance) { _distance = distance; }

		inline void SetViewportSize(float width, float height, bool& ortho) { 
			_viewportWidth = width; _viewportHeight = height;
			UpdateProjection(ortho);
		}

		const glm::mat4& GetProjection() const override { return _projection; }
		const glm::mat4& GetView() const override { return _viewMatrix; }
		glm::mat4 GetViewProjection() const { return _projection * _viewMatrix; }

		glm::vec3 GetUpDirection() const;
		glm::vec3 GetRightDirection() const;
		glm::vec3 GetForwardDirection() const;
		const glm::vec3& GetPosition() const { return _position; }
		glm::quat GetOrientation() const;

		float GetPitch() const { return _pitch; }
		float GetYaw() const { return _yaw; }
	private:
		void UpdateProjection(bool& ortho);
		void UpdateView();

		//bool OnMouseScroll(MouseScrolledEvent& e);
		void MousePan(const glm::vec2& delta);
		void MouseRotate(const glm::vec2& delta);
		void MouseZoom(float delta);

		glm::vec3 CalculatePosition() const;

		std::pair<float, float> PanSpeed() const;
		float RotationSpeed() const;
		float ZoomSpeed() const;
	private:
		float _fov = 45.0f, _aspectRatio = 1.778f, _nearClip = 0.1f, _farClip = 1000.0f;
		//glm::mat4 _viewMatrix;
		glm::vec3 _position   = { 0.0f, 0.0f,  0.0f };
		glm::vec3 _focalPoint = { 0.0f, 0.0f, -1.0f };

		glm::vec2 _initialMousePos = { 0.0f, 0.0f };

		float _distance = 10.0f;
		float _pitch = 0.0f, _yaw = 0.0f;
		bool _viewportFocused = false;
		bool mouseButtonHeld = false;
		bool altKeyPressed = false;
		bool orthoProjection = false;

		float _viewportWidth = 1280, _viewportHeight = 720;
	};
}