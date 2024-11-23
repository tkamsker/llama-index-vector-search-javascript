#!/usr/bin/env bash

# Navigate to the root directory (three levels up from the script's location)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../../../" && pwd)"
cd "$ROOT_DIR" || { echo "Error: Failed to change directory to $ROOT_DIR"; exit 1; }

echo "Loading azd .env file from the current environment"

# Check if the .env file exists before sourcing it
if [[ -f .env ]]; then
    source .env
else
    echo "Error: .env file not found in $ROOT_DIR"
    exit 1
fi

echo "Cleaning up cache directories"

# Check if the cache directory environment variable is set and the directory exists
if [[ -n "$LLAMAINDEX_STORAGE_CACHE_DIR" ]]; then
    if [[ -d "$LLAMAINDEX_STORAGE_CACHE_DIR" ]]; then
        rm -fr "$LLAMAINDEX_STORAGE_CACHE_DIR" && echo "Cache directory cleaned: $LLAMAINDEX_STORAGE_CACHE_DIR"
    else
        echo "Warning: Cache directory does not exist: $LLAMAINDEX_STORAGE_CACHE_DIR"
    fi
else
    echo "Error: LLAMAINDEX_STORAGE_CACHE_DIR environment variable is not set"
    exit 1
fi

echo 'Running "pnpm generate"'

# Temporarily set AZURE_CLIENT_ID to an empty string and run the pnpm command.
# When running this hook locally, we need to force using the default Azure credential chain
# because managed identity is not available in local development.
# we do this by setting the AZURE_CLIENT_ID to an empty string before running the command
AZURE_CLIENT_ID= pnpm generate || { echo "Error: 'pnpm generate' failed"; exit 1; }

echo "Script completed successfully"