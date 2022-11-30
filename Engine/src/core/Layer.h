#pragma once

#include <vector>
#include <string>

#include "core/Core.h"
#include "core/Timestep.h"

#include "Events/EventHandler.h"

namespace Cober {

	class Layer {

	public:
		Layer(const std::string& debugName = "No Assigned");
		~Layer();

		virtual void OnAttach() {}
		virtual void OnDetach() {}
		virtual void OnUpdate(Ref<Timestep> ts) {}
		virtual void OnEvent(SDL_Event& event) {}
		virtual void OnGuiRender() {}

		void PushLayer(Layer* layer);
		void PushOverlay(Layer* overlay);
		void PopLayer(Layer* layer);
		void PopOverlay(Layer* overlay);

		std::vector<Layer*>::iterator begin()	{ return m_Layers.begin(); }
		std::vector<Layer*>::iterator end()		{ return m_Layers.end(); }
		std::vector<Layer*>::reverse_iterator rbegin()	{ return m_Layers.rbegin(); }
		std::vector<Layer*>::reverse_iterator rend()	{ return m_Layers.rend(); }

		std::vector<Layer*>::const_iterator begin() const	{ return m_Layers.begin(); }
		std::vector<Layer*>::const_iterator end() const		{ return m_Layers.end(); }
		std::vector<Layer*>::const_reverse_iterator rbegin() const	{ return m_Layers.rbegin(); }
		std::vector<Layer*>::const_reverse_iterator rend() const	{ return m_Layers.rend(); }
	private:
		std::vector<Layer*> m_Layers;
		unsigned int m_LayerInsertIndex = 0;
		std::string _debugName;
	};
}