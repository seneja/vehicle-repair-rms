#!/usr/bin/env bash
# Launch Pixel 6 Pro AVD on NVIDIA RTX 3050 via PRIME render offload.
# On Ubuntu with "prime-select on-demand", the Intel iGPU drives the display
# but we can offload OpenGL/Vulkan to the discrete NVIDIA GPU using these vars.

set -e

EMULATOR="$HOME/Android/Sdk/emulator/emulator"
AVD_NAME="Pixel_6_Pro"

echo "[emulator] Starting $AVD_NAME on NVIDIA RTX 3050..."

# PRIME render offload: redirect GL calls to NVIDIA
export __NV_PRIME_RENDER_OFFLOAD=1
export __NV_PRIME_RENDER_OFFLOAD_PROVIDER=NVIDIA-G0
export __GLX_VENDOR_LIBRARY_NAME=nvidia

# Vulkan: point to NVIDIA ICD only
export VK_ICD_FILENAMES=/usr/share/vulkan/icd.d/nvidia_icd.json

# Tell the emulator to use the host GPU (matches config.ini hw.gpu.mode=host)
# and disable the software fallback
export ANDROID_EMULATOR_RUNNER_FLAGS=""

exec "$EMULATOR" \
  -avd "$AVD_NAME" \
  -gpu host \
  -no-snapshot-load \
  -memory 4096 \
  "$@"
