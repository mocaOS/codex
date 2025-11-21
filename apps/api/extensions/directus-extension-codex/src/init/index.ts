import { promisify } from "node:util";
import { exec } from "node:child_process";
import { existsSync } from "node:fs";
import { readdir } from "node:fs/promises";
import { defineHook } from "@directus/extensions-sdk";

const execAsync = promisify(exec);

export default defineHook(({ action, init }, { env, logger }) => {
  init("app.before", async () => {
    logger.info(`App is running in ${env.NODE_ENV ?? "development"} mode. Initializing...`);
    
    // Only run setup in production
    if (env.NODE_ENV !== "production") return;

    try {
      // Run Directus bootstrap (includes database install + official migrations)
      logger.info("Running Directus bootstrap (database install + official migrations)...");
      await execAsync("npx directus bootstrap");
      logger.info("✅ Directus bootstrap completed");

      // Run custom migrations if they exist
      const migrationsPath = process.env.MIGRATIONS_PATH || "/directus/migrations";
      logger.info(`Checking for custom migrations in ${migrationsPath}...`);
      
      try {
        if (existsSync(migrationsPath)) {
          const files = await readdir(migrationsPath);
          
          if (files.length > 0) {
            logger.info(`Found custom migrations, running them...`);
            process.env.MIGRATIONS_PATH = migrationsPath;
            await execAsync("npx directus database migrate:latest");
            logger.info("✅ Custom migrations completed");
          } else {
            logger.info("ℹ️ No custom migrations found, skipping...");
          }
        } else {
          logger.info("ℹ️ Migrations directory not found, skipping...");
        }
      } catch (migrationError) {
        logger.warn("Custom migrations check failed (non-fatal):");
        logger.warn(migrationError);
      }

      logger.info("Initial setup completed successfully");
    } catch (error) {
      logger.error("Initial setup failed:");
      logger.error(error);
      throw error;
    }
  });

  action("server.start", async () => {
    if (env.NODE_ENV !== "production") return;

    try {
      logger.info("Pushing Directus sync...");
      const publicUrl = process.env.PUBLIC_URL || "http://localhost:8055";
      await execAsync(`PUBLIC_URL=${publicUrl} npx directus-sync push --force`);
      logger.info("✅ Sync completed successfully");
    } catch (error) {
      logger.error("Sync failed:");
      logger.error(error);
      // Don't throw - sync failure is non-fatal
      logger.warn("Continuing startup despite sync failure (non-fatal)");
    }
  });
});

