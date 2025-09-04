#!/bin/bash

# Script to inject environment variables from .env file into iOS build

# Get the directory of this script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/../.." &> /dev/null && pwd )"
ENV_FILE="$PROJECT_ROOT/.env"

# Check if .env file exists
if [ ! -f "$ENV_FILE" ]; then
    echo "Warning: .env file not found at $ENV_FILE"
    exit 0
fi

# Read GOOGLE_MAPS_API_KEY from .env file
GOOGLE_MAPS_API_KEY=$(grep "^GOOGLE_MAPS_API_KEY=" "$ENV_FILE" | cut -d '=' -f2- | tr -d '"' | tr -d "'")

if [ -z "$GOOGLE_MAPS_API_KEY" ]; then
    echo "Warning: GOOGLE_MAPS_API_KEY not found in .env file"
    exit 0
fi

# Export the environment variable for the build process
export GOOGLE_MAPS_API_KEY="$GOOGLE_MAPS_API_KEY"

echo "Successfully loaded GOOGLE_MAPS_API_KEY from .env file"
