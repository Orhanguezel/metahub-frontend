"use client";
import { AddBtn, BlockTitle, CheckRow, Col, Input, Label, Row, Select } from "../ItemForm.styles";
import type { MenuCategory, StructuredObj, TFunc } from "./types";

type Props = {
  structured: StructuredObj;
  setStructured: (updater: (p: StructuredObj) => StructuredObj) => void;

  allCats: MenuCategory[];
  catLabel: (c?: MenuCategory) => string;

  t: TFunc;
};

export default function CategoriesSection({
  structured, setStructured, allCats, catLabel, t
}: Props) {
  const pushRow = (row: any) =>
    setStructured((p) => ({ ...p, categories: [...(p.categories || []), row] }));
  const removeRow = (idx: number) =>
    setStructured((p) => ({ ...p, categories: (p.categories || []).filter((_: any, i: number) => i !== idx) }));
  const updateRow = (idx: number, patch: any) =>
    setStructured((p) => ({ ...p, categories: (p.categories || []).map((r: any, i: number) => (i === idx ? { ...r, ...patch } : r)) }));

  return (
    <>
      <BlockTitle>{t("categories", "Categories")}</BlockTitle>
      {(structured.categories || []).map((c: any, i: number) => {
        const current = allCats.find(
          (x) => x._id === (typeof c.category === "string" ? c.category : c?.category?._id)
        );
        return (
          <Row key={`cat-${i}`}>
            <Col>
              <Label>{t("category", "Category")}</Label>
              {allCats.length ? (
                <Select
                  value={typeof c.category === "string" ? c.category : (c?.category?._id || "")}
                  onChange={(e) => updateRow(i, { category: e.target.value })}
                >
                  <option value="" disabled>— {t("choose", "choose")} —</option>
                  {allCats.map((cat) => (
                    <option key={cat._id} value={cat._id}>{catLabel(cat)}</option>
                  ))}
                </Select>
              ) : (
                <Input
                  value={typeof c.category === "string" ? c.category : (c?.category?._id || "")}
                  onChange={(e) => updateRow(i, { category: e.target.value })}
                  placeholder="CategoryId"
                />
              )}
            </Col>
            <Col>
              <Label>{t("order", "Order")}</Label>
              <Input type="number" value={c.order ?? ""} onChange={(e) => updateRow(i, { order: e.target.value })} />
            </Col>
            <Col>
              <Label>{t("featured", "Featured?")}</Label>
              <CheckRow>
                <input type="checkbox" checked={!!c.isFeatured} onChange={(e) => updateRow(i, { isFeatured: e.target.checked })} />
              </CheckRow>
            </Col>
            <Col>
              <Label>{t("preview", "Preview")}</Label>
              <div style={{ padding: "10px 0" }}>{current ? catLabel(current) : "—"}</div>
            </Col>
            <Col style={{ alignItems: "flex-end", gridColumn: "span 4" }}>
              <button type="button" onClick={() => removeRow(i)}>− {t("remove", "Remove")}</button>
            </Col>
          </Row>
        );
      })}
      <AddBtn
        type="button"
        onClick={() =>
          pushRow({ category: "", order: (structured.categories?.length || 0) + 1, isFeatured: false })
        }
      >
        + {t("addCategory", "Add Category")}
      </AddBtn>
    </>
  );
}
