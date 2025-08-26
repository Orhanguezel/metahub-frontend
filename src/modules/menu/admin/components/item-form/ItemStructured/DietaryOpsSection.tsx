// src/modules/menu/admin/components/item-form/ItemStructured/DietaryOpsSection.tsx
"use client";
import { BlockTitle, CheckRow, Col, Input, Label, Row } from "../ItemForm.styles";
import type { StructuredObj, TFunc } from "./types";

type Props = { structured: StructuredObj; setStructured: (updater: (p: StructuredObj) => StructuredObj) => void; t: TFunc; };

export default function DietaryOpsSection({ structured, setStructured, t }: Props) {
  const dietKeys = [
    "vegetarian","vegan","pescatarian","halal","kosher",
    "glutenFree","lactoseFree","nutFree","eggFree","porkFree","containsAlcohol",
  ] as const;

  return (
    <>
      <BlockTitle>{t("dietary", "Dietary")}</BlockTitle>

      <Row>
        {dietKeys.map((k) => (
          <Col key={k}>
            <Label>{t(`dietaryLabels.${k}`, k)}</Label>
            <CheckRow>
              <input
                type="checkbox"
                checked={!!(structured.dietary as any)?.[k]}
                onChange={(e) => setStructured((p) => ({ ...p, dietary: { ...(p.dietary || {}), [k]: e.target.checked } }))}
              />
            </CheckRow>
          </Col>
        ))}
      </Row>

      <Row>
        <Col><Label>{t("spicyLevel", "Spicy Level (0-3)")}</Label>
          <Input type="number" value={structured.dietary?.spicyLevel ?? ""}
                 onChange={(e) => setStructured((p) => ({ ...p, dietary: { ...(p.dietary || {}), spicyLevel: e.target.value } }))}/>
        </Col>
        <Col><Label>{t("caffeine", "Caffeine mg/serv")}</Label>
          <Input type="number" value={structured.dietary?.caffeineMgPerServing ?? ""}
                 onChange={(e) => setStructured((p) => ({ ...p, dietary: { ...(p.dietary || {}), caffeineMgPerServing: e.target.value } }))}/>
        </Col>
        <Col><Label>{t("abv", "ABV %")}</Label>
          <Input type="number" step="0.1" value={structured.dietary?.abv ?? ""}
                 onChange={(e) => setStructured((p) => ({ ...p, dietary: { ...(p.dietary || {}), abv: e.target.value } }))}/>
        </Col>
        <Col><Label>{t("calories", "Calories (kcal)")}</Label>
          <Input type="number" value={structured.dietary?.caloriesKcal ?? ""}
                 onChange={(e) => setStructured((p) => ({ ...p, dietary: { ...(p.dietary || {}), caloriesKcal: e.target.value } }))}/>
        </Col>
      </Row>

      <Row>
        <Col><Label>{t("protein", "Protein (g)")}</Label>
          <Input type="number" value={structured.dietary?.macros?.proteinGr ?? ""}
                 onChange={(e) => setStructured((p) => ({ ...p, dietary: { ...(p.dietary || {}), macros: { ...(p.dietary?.macros || {}), proteinGr: e.target.value } } }))}/>
        </Col>
        <Col><Label>{t("carbs", "Carbs (g)")}</Label>
          <Input type="number" value={structured.dietary?.macros?.carbsGr ?? ""}
                 onChange={(e) => setStructured((p) => ({ ...p, dietary: { ...(p.dietary || {}), macros: { ...(p.dietary?.macros || {}), carbsGr: e.target.value } } }))}/>
        </Col>
        <Col><Label>{t("fat", "Fat (g)")}</Label>
          <Input type="number" value={structured.dietary?.macros?.fatGr ?? ""}
                 onChange={(e) => setStructured((p) => ({ ...p, dietary: { ...(p.dietary || {}), macros: { ...(p.dietary?.macros || {}), fatGr: e.target.value } } }))}/>
        </Col>
      </Row>

      <BlockTitle>{t("ops", "Operations / Availability")}</BlockTitle>
      <Row>
        <Col>
          <Label>{t("channels.delivery", "Delivery")}</Label>
          <CheckRow>
            <input type="checkbox" checked={!!structured.ops?.availability?.delivery}
                   onChange={(e) => setStructured((p) => ({ ...p, ops: { ...(p.ops || {}), availability: { ...(p.ops?.availability || {}), delivery: e.target.checked } } }))}/>
          </CheckRow>
        </Col>
        <Col>
          <Label>{t("channels.pickup", "Pickup")}</Label>
          <CheckRow>
            <input type="checkbox" checked={!!structured.ops?.availability?.pickup}
                   onChange={(e) => setStructured((p) => ({ ...p, ops: { ...(p.ops || {}), availability: { ...(p.ops?.availability || {}), pickup: e.target.checked } } }))}/>
          </CheckRow>
        </Col>
        <Col>
          <Label>{t("channels.dinein", "Dine-in")}</Label>
          <CheckRow>
            <input type="checkbox" checked={!!structured.ops?.availability?.dinein}
                   onChange={(e) => setStructured((p) => ({ ...p, ops: { ...(p.ops || {}), availability: { ...(p.ops?.availability || {}), dinein: e.target.checked } } }))}/>
          </CheckRow>
        </Col>
        <Col>
          <Label>{t("minPrep", "Min Prep (min)")}</Label>
          <Input type="number" value={structured.ops?.minPrepMinutes ?? ""}
                 onChange={(e) => setStructured((p) => ({ ...p, ops: { ...(p.ops || {}), minPrepMinutes: e.target.value } }))}/>
        </Col>
      </Row>

      <Row>
        <Col><Label>{t("kitchenSection", "Kitchen Section")}</Label>
          <Input value={structured.ops?.kitchenSection || ""}
                 onChange={(e) => setStructured((p) => ({ ...p, ops: { ...(p.ops || {}), kitchenSection: e.target.value } }))}/>
        </Col>
        <Col><Label>{t("availableFrom", "Available From (ISO)")}</Label>
          <Input value={structured.ops?.availableFrom || ""}
                 onChange={(e) => setStructured((p) => ({ ...p, ops: { ...(p.ops || {}), availableFrom: e.target.value } }))}/>
        </Col>
        <Col><Label>{t("availableTo", "Available To (ISO)")}</Label>
          <Input value={structured.ops?.availableTo || ""}
                 onChange={(e) => setStructured((p) => ({ ...p, ops: { ...(p.ops || {}), availableTo: e.target.value } }))}/>
        </Col>
      </Row>
    </>
  );
}
