"use client";
import React from "react";
import { Row, Col } from "../styled";
import { JSONEditor } from "@/shared";
import type { RecipeJSON } from "./useRecipeForm";

type Props = {
  t: (k: string, d?: string) => string;
  value: RecipeJSON;
  onChange: (v: any) => void;
};

export default function JsonEditorPanel({ t, value, onChange }: Props) {
  return (
    <Row>
      <Col style={{ gridColumn: "span 4" }}>
        <JSONEditor
          label={t("recipe_json_full", "Tarif (JSON) — resimler hariç")}
          value={value}
          onChange={onChange}
          placeholder={`{
  "_id":{"$oid":"..."},
  "tenant":"tarifintarifi",
  "slugCanonical":"pepper-onion-garlic-recipe",
  "slug": { "tr":"biberli-sogan...", "en":"pepper-onion..." },
  "isActive": true,
  "isPublished": true,
  "order": 3,
  "title": { "tr":"...", "en":"..." },
  "description": { "tr":"...", "en":"..." },
  "categories": [],
  "cuisines": ["hint"],
  "tags": [ { "tr":"vejetaryen","en":"vegetarian"} ],
  "servings": 1,
  "prepMinutes": 5,
  "cookMinutes": 10,
  "totalMinutes": 15,
  "calories": 120,
  "effectiveFrom": null,
  "effectiveTo": null,
  "ingredients": [...],
  "steps": [...]
}`}
        />
      </Col>
    </Row>
  );
}
