#!/bin/sh

set -e

echo "🚀 Starting Directus setup process..."

# Function to wait for database to be ready
wait_for_db() {
    echo "⏳ Waiting for database to be ready..."
    local retries=0
    local max_retries=30
    
    while [ $retries -lt $max_retries ]; do
        # Try to connect to the database using pg_isready (preferred method)
        if PGPASSWORD="$DB_PASSWORD" pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_DATABASE" >/dev/null 2>&1; then
            echo "✅ Database connection established (pg_isready)"
            return 0
        fi
        
        # Fallback: Try basic TCP connection test to database port
        if timeout 5s sh -c "echo > /dev/tcp/$DB_HOST/$DB_PORT" >/dev/null 2>&1; then
            echo "✅ Database TCP connection established (fallback)"
            return 0
        fi
        
        echo "⏳ Database not ready yet, waiting 2 seconds... (attempt $((retries + 1))/$max_retries)"
        sleep 2
        retries=$((retries + 1))
    done
    
    echo "❌ Database failed to become ready within expected time"
    echo "🔍 Database connection details:"
    echo "   Host: $DB_HOST"
    echo "   Port: $DB_PORT" 
    echo "   Database: $DB_DATABASE"
    echo "   User: $DB_USER"
    return 1
}



# Function to run directus bootstrap (includes install + migrate)
run_bootstrap() {
    echo "🔧 Running Directus bootstrap (database install + official migrations)..."
    npx directus bootstrap
    echo "✅ Directus bootstrap completed"
}

# Function to run custom migrations if they exist
run_custom_migrations() {
    if [ -d "/directus/migrations" ] && [ "$(ls -A /directus/migrations 2>/dev/null)" ]; then
        echo "🔧 Found custom migrations, running them..."
        
        # Set the migrations path environment variable
        export MIGRATIONS_PATH="/directus/migrations"
        
        # Run custom migrations
        npx directus database migrate:latest
        echo "✅ Custom migrations completed"
    else
        echo "ℹ️ No custom migrations found, skipping..."
    fi
}

# Function to run directus-sync push
run_directus_sync() {
    echo "🔄 Running directus-sync push --force..."
    if ! PUBLIC_URL=http://localhost:8055 directus-sync push --force; then
        echo "⚠️ directus-sync push failed; continuing startup (non-fatal)."
    else
        echo "✅ directus-sync push completed"
    fi
}



# Function to start Directus in background and wait for it to be ready
start_directus_background() {
    echo "🚀 Starting Directus in background..."
    npx directus start &
    DIRECTUS_PID=$!
    
    # Wait for Directus to be ready
    echo "⏳ Waiting for Directus to be ready..."
    local retries=0
    local max_retries=30
    
    while [ $retries -lt $max_retries ]; do
        if curl -f http://localhost:8055/server/health >/dev/null 2>&1; then
            echo "✅ Directus is ready!"
            sleep 10
            return 0
        fi
        echo "⏳ Directus not ready yet, waiting 2 seconds... (attempt $((retries + 1))/$max_retries)"
        sleep 2
        retries=$((retries + 1))
    done
    
    echo "❌ Directus failed to start within expected time"
    return 1
}

# Function to stop background Directus
stop_directus_background() {
    if [ ! -z "$DIRECTUS_PID" ]; then
        echo "🛑 Stopping background Directus process..."
        kill $DIRECTUS_PID
        wait $DIRECTUS_PID 2>/dev/null || true
    fi
}

# Main execution flow
main() {
    echo "🎬 Starting MOCA Codex Directus setup..."
    
    # Wait for database to be ready
    wait_for_db
    
    # Run bootstrap (includes database install and official migrations)
    run_bootstrap
    
    # Run custom migrations if they exist
    run_custom_migrations
    
    # Start Directus in background to run sync
    start_directus_background
    
    # Run directus-sync push --force against running instance
    run_directus_sync
    
    # Stop background Directus
    stop_directus_background
    
    echo "✅ Setup completed successfully!"
    echo "🚀 Starting Directus server..."
    
    # Start Directus server
    exec npx directus start
}

# Run main function
main "$@"

