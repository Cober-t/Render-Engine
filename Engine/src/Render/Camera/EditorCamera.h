#pragma once

#include "Camera.h"
#include "core/Timestep.h"

#include "core/Core.h"

namespace Cober {

	struct OrthoEditCamera {
		float fov = 45.0f, aspectRatio = 1.778f, nearClip = 0.01f, farClip = 1000.0f;
		glm::vec3 position   = { 0.0f, 0.0f,  0.0f };
		glm::vec3 focalPoint = { 0.0f, 0.0f, -1.0f };
		float pitch = 0.0f, yaw = 0.0f, roll = 0.0f;
		float distance = 3.0f;

		float GetFarClip() const { return farClip; }
		void SetValues(float newFov, float ratio, float near, float far) {
			fov = newFov;
			aspectRatio = ratio;
			nearClip = near;
			farClip = far;
		}
		
		OrthoEditCamera() = default;
		OrthoEditCamera(const OrthoEditCamera& camera)
			: fov(camera.fov), aspectRatio(camera.aspectRatio), nearClip(camera.nearClip),
			  farClip(camera.farClip), position(camera.position), focalPoint(camera.focalPoint),
			  pitch(camera.pitch), yaw(camera.yaw), roll(camera.roll), distance(camera.distance) {}
		~OrthoEditCamera() = default;
	};

	struct PerspEditCamera {
		float fov = 45.0f, aspectRatio = 1.778f, nearClip = 0.01f, farClip = 1000.0f;
		glm::vec3 position	 = {   2.5f, 2.5f,  3.2f };
		glm::vec3 focalPoint = { 0.625f, 0.57f, 0.5f };
		float pitch = 6.8f, yaw = -6.8f, roll = 0.0f;
		float distance = 5.0f;

		void SetValues(float newFov, float ratio, float near, float far) {
			fov = newFov;
			aspectRatio = ratio;
			nearClip = near;
			farClip = far;
		}

		PerspEditCamera() = default;
		PerspEditCamera(const PerspEditCamera& camera)
			: fov(camera.fov), aspectRatio(camera.aspectRatio), nearClip(camera.nearClip),
			  farClip(camera.farClip), position(camera.position), focalPoint(camera.focalPoint),
			  pitch(camera.pitch), yaw(camera.yaw), roll(camera.roll), distance(camera.distance) {}
		~PerspEditCamera() = default;
	};

	class EditorCamera : public Camera
	{
	public:
		EditorCamera() = default;
		EditorCamera(float fov, float aspectRatio, float nearClip, float farClip);
		~EditorCamera();

		void OnUpdate(Ref<Timestep> ts);
		void OnEvent(SDL_Event& event);

		void BlockEvents(bool focus) { _viewportFocused = focus; }

		inline void SetViewportSize(float width, float height, bool& ortho) { 
			_viewportWidth = width; _viewportHeight = height;
			UpdateProjection(ortho);
		}

		void UpdateProjection(bool& ortho);
		const glm::mat4& GetProjection() const override { return _projection; }
		const glm::mat4& GetView() const override { return _viewMatrix; }
		const glm::mat4 GetPV() const override { return _projection * _viewMatrix; }

		float GetDistance() const;
		void SetDistance(float distance);
		glm::vec3 GetUpDirection() const;
		glm::vec3 GetRightDirection() const;
		glm::vec3 GetForwardDirection() const;
		glm::quat GetOrientation() const;
		const glm::vec3& GetPosition() const;

		float GetPitch() const;
		float GetYaw() const;
		float GetRoll() const;

		OrthoEditCamera GetOrthoCamera() { return _orthoCamera; }
		PerspEditCamera GetPerspCamera() { return _perspCamera; }
	private:
		void UpdateView();

		void OnMouseScroll(SDL_MouseWheelEvent& event);
		void MousePan(const glm::vec2& delta);
		void MouseRotate(const glm::vec2& delta);
		void MouseZoom(float delta);

		glm::vec3 CalculatePosition() const;

		std::pair<float, float> PanSpeed() const;
		float RotationSpeed() const;
		float ZoomSpeed() const;
	private:
		OrthoEditCamera _orthoCamera;
		PerspEditCamera _perspCamera;
		float _viewportWidth = 1280, _viewportHeight = 720;

		glm::vec2 _initialMousePos = { 0.0f, 0.0f };
		bool _viewportFocused = false;
		bool mouseButtonHeld = false;
		bool altKeyPressed = false;
		bool orthoProjection = false;
	};
}