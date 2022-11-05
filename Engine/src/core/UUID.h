#pragma once


namespace Cober {

	class UUID {

	public:
		UUID();
		UUID(uint64_t id);
		UUID(const UUID& other);

		operator uint64_t() { return m_UUID; }
		operator const uint64_t() const { return m_UUID; }
	private:
		uint64_t m_UUID;
	};
}

#ifndef __EMSCRIPTEN__
	#include <xhash>
namespace std {

	// Specialization
	template<>
	struct hash<Cober::UUID> 
	{
		std::size_t operator()(const Cober::UUID& uuid) const {
			return hash<uint64_t>()((uint64_t)uuid);
		}
	};
}
#endif