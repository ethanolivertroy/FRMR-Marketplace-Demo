import { schema } from "@json-render/react";
import { z } from "zod";

/**
 * json-render catalog for trust center UI primitives.
 *
 * Defines the components that any renderer (AI or programmatic) can compose
 * to build a trust center view from structured JSON data.
 */
export const trustCatalog = schema.createCatalog({
  components: {
    Section: {
      props: z.object({
        title: z.string().describe("Section heading"),
      }),
      slots: ["default"],
      description: "A titled section container grouping related trust items",
    },
    Card: {
      props: z.object({
        title: z.string().describe("Card heading"),
        status: z
          .enum(["implemented", "current", "authorized", "in-progress", "expired", "neutral"])
          .optional()
          .describe("Status of the item"),
        description: z.string().optional().describe("Summary text"),
      }),
      slots: ["default"],
      description: "A card representing a single trust center item (certification, control, etc.)",
    },
    InfoRow: {
      props: z.object({
        label: z.string().describe("Row label"),
        value: z.string().describe("Row value"),
      }),
      description: "A key–value information row inside a Card",
    },
    Badge: {
      props: z.object({
        label: z.string().describe("Badge text"),
        variant: z
          .enum(["success", "warning", "error", "neutral"])
          .describe("Color variant"),
      }),
      description: "A small status badge",
    },
  },
  actions: {},
});

export type TrustCatalog = typeof trustCatalog;
