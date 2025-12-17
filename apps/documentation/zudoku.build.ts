import type { ZudokuBuildConfig } from "zudoku";
import { API_BASE_URL } from "./constants";

async function retainSpecificSchemas({ schema }) {
  const schemasToKeep = [ "ItemsCodex", "Files", "x-metadata" ];

  if (schema.components && schema.components.schemas) {
    // First, filter schemas to keep only the ones we want
    schema.components.schemas = Object.fromEntries(
      Object.entries(schema.components.schemas).filter(([ key ]) =>
        schemasToKeep.includes(key),
      ),
    );

    // Helper function to check if a $ref points to a schema we're keeping
    const isValidRef = (ref: string): boolean => {
      if (!ref || !ref.startsWith("#/components/schemas/")) {
        return true; // Not a schema ref, keep it
      }
      const refName = ref.split("/").pop();
      return schemasToKeep.includes(refName);
    };

    // Clean up broken $ref references recursively
    const cleanSchemaRefs = (obj: any): any => {
      if (Array.isArray(obj)) {
        return obj.map(cleanSchemaRefs).filter(item => item !== null);
      } else if (obj && typeof obj === "object") {
        // If it's a $ref to a schema we removed, mark for removal
        if (obj.$ref && typeof obj.$ref === "string") {
          if (!isValidRef(obj.$ref)) {
            return null; // Mark for removal
          }
        }

        // Recursively clean nested objects
        const cleaned: any = {};
        for (const [ key, value ] of Object.entries(obj)) {
          const cleanedValue = cleanSchemaRefs(value);
          if (cleanedValue !== null) {
            cleaned[key] = cleanedValue;
          }
        }

        // Handle oneOf arrays specially
        if (cleaned.oneOf && Array.isArray(cleaned.oneOf)) {
          cleaned.oneOf = cleaned.oneOf.filter((item: any) => item !== null);
          // If only one item remains, simplify by removing oneOf wrapper
          if (cleaned.oneOf.length === 1) {
            const singleItem = cleaned.oneOf[0];
            // Preserve nullable and other properties
            return {
              ...singleItem,
              nullable: cleaned.nullable ?? singleItem.nullable,
            };
          }
          // If oneOf becomes empty, remove the property entirely
          if (cleaned.oneOf.length === 0) {
            delete cleaned.oneOf;
          }
        }

        return cleaned;
      }
      return obj;
    };

    // Clean all kept schemas
    for (const [ key, value ] of Object.entries(schema.components.schemas)) {
      schema.components.schemas[key] = cleanSchemaRefs(value);
    }

    // Also clean references in paths (responses, parameters, etc.)
    if (schema.paths) {
      for (const pathValue of Object.values(schema.paths)) {
        if (typeof pathValue === "object" && pathValue !== null) {
          for (const [ method, operation ] of Object.entries(pathValue)) {
            if (typeof operation === "object" && operation !== null) {
              (pathValue as any)[method] = cleanSchemaRefs(operation);
            }
          }
        }
      }
    }
  }

  // Update server URL from config
  if (schema.servers && schema.servers.length > 0) {
    schema.servers[0].url = API_BASE_URL;
  }

  return schema;
}

const buildConfig: ZudokuBuildConfig = {
  processors: [ retainSpecificSchemas ],
};

export default buildConfig;
