import { defineHook } from "@directus/extensions-sdk";

export default defineHook(({ filter }) => {
  // Filter fields from codex items.read responses
  filter("codex.items.read", (payload, meta, context) => {
    return payload; // Disable for now

    if (!payload) return payload;

    // Get the fields parameter from the query
    const fields = meta.query?.fields;

    // Helper function to check if thumbnail fields are explicitly requested
    const hasThumbnailFields = (fieldsParam: any): boolean => {
      if (!fieldsParam) return false;

      // Convert fields to array if it's a string
      const fieldsArray = typeof fieldsParam === "string"
        ? fieldsParam.split(",").map(f => f.trim())
        : Array.isArray(fieldsParam)
          ? fieldsParam
          : [];

      // Check for wildcard or explicit field names
      return fieldsArray.some((f) => {
        const field = typeof f === "string" ? f.trim() : String(f);
        return field === "thumbnail" || field === "thumbnail_background" || field === "*" || field.startsWith("*");
      });
    };

    // Helper function to remove thumbnail fields from an item
    const removeThumbnailFields = (item: any) => {
      if (!item || typeof item !== "object") return item;
      const { thumbnail, thumbnail_background, ...rest } = item;
      return rest;
    };

    // If fields is explicitly specified, check if thumbnail fields are included
    if (fields && hasThumbnailFields(fields)) {
      // Thumbnail fields are explicitly requested, keep them
      return payload;
    }

    // Remove thumbnail fields (either not requested or no fields specified)
    if (Array.isArray(payload)) {
      // Multiple items
      return payload.map(removeThumbnailFields);
    } else if (typeof payload === "object" && payload !== null) {
      // Single item
      return removeThumbnailFields(payload);
    }

    return payload;
  });
});
