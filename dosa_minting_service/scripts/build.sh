#!/usr/bin/env bash
set -o errexit -o nounset -o pipefail

# This script builds all subprojects and puts all created Wasm modules in one dir
(
  cd curl_adapter
  cargo update --aggressive
  marine build --release
)
(
  cd mint_indexer
  cargo update --aggressive
  marine build --release
)

mkdir -p artifacts
rm -f artifacts/*.wasm
cp curl_adapter/target/wasm32-wasi/release/curl_adapter.wasm artifacts/
cp mint_indexer/target/wasm32-wasi/release/mint_indexer.wasm artifacts/
