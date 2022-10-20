#include "pch.h"
#include "UUID.h"

#include <random>
#include <unordered_map>

namespace Cober {

	// Generate random numbers
	static std::random_device s_RandomDevide;
	static std::mt19937_64 s_Engine(s_RandomDevide());
	static std::uniform_int_distribution<uint64_t> s_UniformDistribution;

	UUID::UUID() 
		: m_UUID(s_UniformDistribution(s_Engine))
	{
	}

	UUID::UUID(uint64_t uuid) 
		: m_UUID(uuid)
	{

	}

	UUID::UUID(const UUID& other)
		: m_UUID(other.m_UUID)
	{

	}
}