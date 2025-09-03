cmake_minimum_required(VERSION 3.16)
project(EVA_Core)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Find required packages
find_package(Protobuf REQUIRED)
find_package(gRPC REQUIRED)
find_package(PostgreSQL REQUIRED)

# Include directories
include_directories(${CMAKE_CURRENT_SOURCE_DIR}/ofo-core/cpp/include)
include_directories(${Protobuf_INCLUDE_DIRS})

# Source files
file(GLOB_RECURSE SOURCES "ofo-core/cpp/src/*.cpp")

# Create executable
add_executable(eva_core ${SOURCES})

# Link libraries
target_link_libraries(eva_core 
    ${Protobuf_LIBRARIES}
    gRPC::grpc++
    PostgreSQL::PostgreSQL
)

# Compiler flags
target_compile_options(eva_core PRIVATE -Wall -Wextra -O3)