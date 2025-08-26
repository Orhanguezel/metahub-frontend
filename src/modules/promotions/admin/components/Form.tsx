"use client";
import styled from "styled-components";
import { useMemo, useState } from "react";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "@/modules/promotions/locales";

import type {
  IPromotion,
  PromotionCreatePayload,
  PromotionUpdatePayload,
  PromotionKind,
  StackingPolicy,
  DiscountType,
} from "@/modules/promotions/types";
import type { SupportedLocale } from "@/types/common";
import { SUPPORTED_LOCALES } from "@/types/common";

/* ------- i18n helpers ------- */
type TL = Partial<Record<SupportedLocale, string>>;

const getUILang = (lng?: string): SupportedLocale => {
  const two = (lng || "").slice(0, 2).toLowerCase();
  return (SUPPORTED_LOCALES as ReadonlyArray<string>).includes(two)
    ? (two as SupportedLocale)
    : ("tr" as SupportedLocale);
};
const setTL = (obj: TL | undefined, l: SupportedLocale, val: string): TL => ({
  ...(obj || {}),
  [l]: val,
});
const getTLStrict = (obj?: TL, l?: SupportedLocale) => (l ? (obj?.[l] ?? "") : "");

/* ------- date helpers ------- */
const toLocalInput = (iso?: string | null) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  // YYYY-MM-DDTHH:mm
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};
const toISOOrNull = (local: string) => {
  if (!local) return null;
  const d = new Date(local);
  return isNaN(d.getTime()) ? null : d.toISOString();
};

/* ------- props ------- */
type Props = {
  initial?: IPromotion | null;
  lang?: SupportedLocale;
  onSubmit: (
    payload: PromotionCreatePayload | PromotionUpdatePayload,
    id?: string
  ) => void | Promise<void>;
  onCancel: () => void;
};

export default function PromotionsForm({ initial, onSubmit, onCancel, lang: langProp }: Props) {
  const { t, i18n } = useI18nNamespace("promotions", translations);
  const uiLang = useMemo<SupportedLocale>(() => langProp || getUILang(i18n?.language), [langProp, i18n?.language]);
  const isEdit = Boolean(initial?._id);

  /* ------- basic ------- */
  const [kind, setKind] = useState<PromotionKind>(initial?.kind ?? "auto");
  const [code, setCode] = useState<string>(initial?.code ?? "");
  const [name, setName] = useState<TL>((initial?.name as TL) || {});
  const [description, setDescription] = useState<TL>((initial?.description as TL) || {});
  const [isActive, setIsActive] = useState<boolean>(initial?.isActive ?? true);
  const [isPublished, setIsPublished] = useState<boolean>(initial?.isPublished ?? false);
  const [priority, setPriority] = useState<number>(Number(initial?.priority ?? 100));
  const [stackingPolicy, setStackingPolicy] = useState<StackingPolicy>(
    initial?.stackingPolicy ?? "with_different"
  );

  /* ------- rules ------- */
  const [startsAt, setStartsAt] = useState<string>(toLocalInput(initial?.rules?.startsAt || null));
  const [endsAt, setEndsAt] = useState<string>(toLocalInput(initial?.rules?.endsAt || null));
  const [minAmount, setMinAmount] = useState<number>(Number(initial?.rules?.minOrder?.amount ?? 0));
  const [minCurrency, setMinCurrency] = useState<string>(initial?.rules?.minOrder?.currency ?? "TRY");

  const [branchIdsCSV, setBranchIdsCSV] = useState<string>(
    (initial?.rules?.scope?.branchIds || []).join(", ")
  );
  const [categoryIdsCSV, setCategoryIdsCSV] = useState<string>(
    (initial?.rules?.scope?.categoryIds || []).join(", ")
  );
  const [itemIdsCSV, setItemIdsCSV] = useState<string>(
    (initial?.rules?.scope?.itemIds || []).join(", ")
  );
  const [serviceTypes, setServiceTypes] = useState<Array<"delivery" | "pickup" | "dinein">>(
    initial?.rules?.scope?.serviceTypes || []
  );

  const [firstOrderOnly, setFirstOrderOnly] = useState<boolean>(initial?.rules?.firstOrderOnly ?? false);
  const [usageLimit, setUsageLimit] = useState<number | "">(
    typeof initial?.rules?.usageLimit === "number" ? initial!.rules!.usageLimit! : ""
  );
  const [perUserLimit, setPerUserLimit] = useState<number | "">(
    typeof initial?.rules?.perUserLimit === "number" ? initial!.rules!.perUserLimit! : ""
  );

  /* ------- effect ------- */
  const [effectType, setEffectType] = useState<DiscountType>(initial?.effect?.type ?? "percentage");
  const [effectValue, setEffectValue] = useState<number | "">(
    typeof initial?.effect?.value === "number" ? initial!.effect!.value! : ""
  );
  const [effectCurrency, setEffectCurrency] = useState<string>(initial?.effect?.currency ?? "TRY");

  const [bxBuyQty, setBxBuyQty] = useState<number | "">(
    (initial?.effect?.bxgy?.buyQty as number) || ""
  );
  const [bxGetQty, setBxGetQty] = useState<number | "">(
    (initial?.effect?.bxgy?.getQty as number) || ""
  );
  const [bxItemIdsCSV, setBxItemIdsCSV] = useState<string>(
    (initial?.effect?.bxgy?.itemScope?.itemIds || []).join(", ")
  );
  const [bxCategoryIdsCSV, setBxCategoryIdsCSV] = useState<string>(
    (initial?.effect?.bxgy?.itemScope?.categoryIds || []).join(", ")
  );

  /* ------- helpers ------- */
  const toggleServiceType = (v: "delivery" | "pickup" | "dinein") => {
    setServiceTypes((arr) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]));
  };

  const parseCSV = (s: string) =>
    s
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);

  /* ------- submit ------- */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload: PromotionCreatePayload | PromotionUpdatePayload = {
      kind,
      code: kind === "coupon" ? (code || "").toUpperCase() : undefined,
      name: name || {},
      description: description || {},
      isActive,
      isPublished, // not: inline publish/patch de var; burada da gönderilebilir
      priority: Number(priority) || 0,
      stackingPolicy,

      rules: {
        startsAt: toISOOrNull(startsAt),
        endsAt: toISOOrNull(endsAt),
        minOrder:
          Number(minAmount) > 0
            ? { amount: Number(minAmount), currency: minCurrency || "TRY" }
            : undefined,
        scope: {
          branchIds: parseCSV(branchIdsCSV),
          categoryIds: parseCSV(categoryIdsCSV),
          itemIds: parseCSV(itemIdsCSV),
          serviceTypes: serviceTypes.length ? serviceTypes : undefined,
        },
        firstOrderOnly,
        usageLimit: typeof usageLimit === "number" ? usageLimit : undefined,
        perUserLimit: typeof perUserLimit === "number" ? perUserLimit : undefined,
      },

      effect:
        effectType === "bxgy"
          ? {
              type: "bxgy",
              bxgy: {
                buyQty: Number(bxBuyQty) || 0,
                getQty: Number(bxGetQty) || 0,
                itemScope: {
                  itemIds: parseCSV(bxItemIdsCSV),
                  categoryIds: parseCSV(bxCategoryIdsCSV),
                },
              },
            }
          : effectType === "free_delivery"
          ? { type: "free_delivery" }
          : {
              type: effectType,
              value: typeof effectValue === "number" ? effectValue : undefined,
              currency: effectType === "fixed" ? effectCurrency || "TRY" : undefined,
            },
    };

    if (isEdit && initial?._id) onSubmit(payload, initial._id);
    else onSubmit(payload);
  };

  return (
    <Form onSubmit={handleSubmit}>
      {/* BASIC */}
      <BlockTitle>{t("basic", "Basic")}</BlockTitle>
      <Row>
        <Col>
          <Label>{t("kind", "Kind")}</Label>
          <Select value={kind} onChange={(e) => setKind(e.target.value as PromotionKind)}>
            <option value="auto">auto</option>
            <option value="coupon">coupon</option>
          </Select>
        </Col>
        <Col>
          <Label>{t("code", "Code (for coupon)")}</Label>
          <Input
            placeholder="WELCOME10"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            disabled={kind !== "coupon"}
          />
        </Col>
        <Col>
          <Label>{t("priority", "Priority")}</Label>
          <Input
            type="number"
            min={0}
            value={priority}
            onChange={(e) => setPriority(Number(e.target.value) || 0)}
          />
        </Col>
        <Col>
          <Label>{t("stackingPolicy", "Stacking policy")}</Label>
          <Select
            value={stackingPolicy}
            onChange={(e) => setStackingPolicy(e.target.value as StackingPolicy)}
          >
            <option value="none">none</option>
            <option value="with_different">with_different</option>
            <option value="with_same">with_same</option>
          </Select>
        </Col>
      </Row>

      <Row>
        <Col>
          <Label>{t("name", "Name")} ({uiLang})</Label>
          <Input
            value={getTLStrict(name, uiLang)}
            onChange={(e) => setName(setTL(name, uiLang, e.target.value))}
          />
        </Col>
        <Col style={{ gridColumn: "span 3" }}>
          <Label>{t("description", "Description")} ({uiLang})</Label>
          <TextArea
            rows={2}
            value={getTLStrict(description, uiLang)}
            onChange={(e) => setDescription(setTL(description, uiLang, e.target.value))}
          />
        </Col>
      </Row>

      <Row>
        <Col>
          <Label>{t("active", "Active?")}</Label>
          <CheckRow>
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
            <span>{isActive ? t("yes","Yes") : t("no","No")}</span>
          </CheckRow>
        </Col>
        <Col>
          <Label>{t("published", "Published?")}</Label>
          <CheckRow>
            <input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} />
            <span>{isPublished ? t("yes","Yes") : t("no","No")}</span>
          </CheckRow>
        </Col>
      </Row>

      {/* RULES */}
      <BlockTitle>{t("rules", "Rules")}</BlockTitle>
      <Row>
        <Col>
          <Label>{t("startsAt", "Starts At")}</Label>
          <Input type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} />
        </Col>
        <Col>
          <Label>{t("endsAt", "Ends At")}</Label>
          <Input type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} />
        </Col>
        <Col>
          <Label>{t("minOrderAmount", "Min. Order Amount")}</Label>
          <Input type="number" min={0} value={minAmount} onChange={(e) => setMinAmount(Number(e.target.value) || 0)} />
        </Col>
        <Col>
          <Label>{t("currency", "Currency")}</Label>
          <Input value={minCurrency} onChange={(e) => setMinCurrency(e.target.value || "TRY")} />
        </Col>
      </Row>

      <Row>
        <Col>
          <Label>{t("branchIdsCSV", "Branch IDs (comma separated)")}</Label>
          <Input value={branchIdsCSV} onChange={(e) => setBranchIdsCSV(e.target.value)} placeholder="5f..., 60..." />
        </Col>
        <Col>
          <Label>{t("categoryIdsCSV", "Category IDs (comma separated)")}</Label>
          <Input value={categoryIdsCSV} onChange={(e) => setCategoryIdsCSV(e.target.value)} />
        </Col>
        <Col>
          <Label>{t("itemIdsCSV", "Item IDs (comma separated)")}</Label>
          <Input value={itemIdsCSV} onChange={(e) => setItemIdsCSV(e.target.value)} />
        </Col>
        <Col>
          <Label>{t("serviceTypes", "Service Types")}</Label>
          <CheckRow>
            <label><input type="checkbox" checked={serviceTypes.includes("delivery")} onChange={() => toggleServiceType("delivery")} /> delivery</label>
          </CheckRow>
          <CheckRow>
            <label><input type="checkbox" checked={serviceTypes.includes("pickup")} onChange={() => toggleServiceType("pickup")} /> pickup</label>
          </CheckRow>
          <CheckRow>
            <label><input type="checkbox" checked={serviceTypes.includes("dinein")} onChange={() => toggleServiceType("dinein")} /> dinein</label>
          </CheckRow>
        </Col>
      </Row>

      <Row>
        <Col>
          <Label>{t("firstOrderOnly", "First order only?")}</Label>
          <CheckRow>
            <input type="checkbox" checked={firstOrderOnly} onChange={(e) => setFirstOrderOnly(e.target.checked)} />
            <span>{firstOrderOnly ? t("yes","Yes") : t("no","No")}</span>
          </CheckRow>
        </Col>
        <Col>
          <Label>{t("usageLimit", "Usage limit (global)")}</Label>
          <Input
            type="number"
            min={0}
            value={usageLimit as number | ""}
            onChange={(e) => setUsageLimit(e.target.value === "" ? "" : Number(e.target.value))}
          />
        </Col>
        <Col>
          <Label>{t("perUserLimit", "Per user limit")}</Label>
          <Input
            type="number"
            min={0}
            value={perUserLimit as number | ""}
            onChange={(e) => setPerUserLimit(e.target.value === "" ? "" : Number(e.target.value))}
          />
        </Col>
      </Row>

      {/* EFFECT */}
      <BlockTitle>{t("effect", "Effect")}</BlockTitle>
      <Row>
        <Col>
          <Label>{t("effect.type", "Type")}</Label>
          <Select value={effectType} onChange={(e) => setEffectType(e.target.value as DiscountType)}>
            <option value="percentage">percentage</option>
            <option value="fixed">fixed</option>
            <option value="free_delivery">free_delivery</option>
            <option value="bxgy">bxgy</option>
          </Select>
        </Col>

        {effectType === "percentage" && (
          <Col>
            <Label>{t("effect.percent", "Percent (1-100)")}</Label>
            <Input
              type="number"
              min={1}
              max={100}
              value={effectValue as number | ""}
              onChange={(e) => setEffectValue(e.target.value === "" ? "" : Number(e.target.value))}
            />
          </Col>
        )}

        {effectType === "fixed" && (
          <>
            <Col>
              <Label>{t("effect.amount", "Amount")}</Label>
              <Input
                type="number"
                min={0}
                value={effectValue as number | ""}
                onChange={(e) => setEffectValue(e.target.value === "" ? "" : Number(e.target.value))}
              />
            </Col>
            <Col>
              <Label>{t("effect.currency", "Currency")}</Label>
              <Input value={effectCurrency} onChange={(e) => setEffectCurrency(e.target.value || "TRY")} />
            </Col>
          </>
        )}
      </Row>

      {effectType === "bxgy" && (
        <>
          <Row>
            <Col>
              <Label>{t("bxgy.buyQty", "Buy Qty")}</Label>
              <Input
                type="number"
                min={1}
                value={bxBuyQty as number | ""}
                onChange={(e) => setBxBuyQty(e.target.value === "" ? "" : Number(e.target.value))}
              />
            </Col>
            <Col>
              <Label>{t("bxgy.getQty", "Get Qty")}</Label>
              <Input
                type="number"
                min={1}
                value={bxGetQty as number | ""}
                onChange={(e) => setBxGetQty(e.target.value === "" ? "" : Number(e.target.value))}
              />
            </Col>
          </Row>
          <Row>
            <Col>
              <Label>{t("bxgy.itemIdsCSV", "Item IDs (comma separated)")}</Label>
              <Input value={bxItemIdsCSV} onChange={(e) => setBxItemIdsCSV(e.target.value)} />
            </Col>
            <Col>
              <Label>{t("bxgy.categoryIdsCSV", "Category IDs (comma separated)")}</Label>
              <Input value={bxCategoryIdsCSV} onChange={(e) => setBxCategoryIdsCSV(e.target.value)} />
            </Col>
          </Row>
        </>
      )}

      {/* ACTIONS */}
      <Actions>
        <Secondary type="button" onClick={onCancel}>
          {t("cancel", "Cancel")}
        </Secondary>
        <Primary type="submit">{isEdit ? t("update", "Update") : t("create", "Create")}</Primary>
      </Actions>
    </Form>
  );
}

/* ---- styled ---- */
const Form = styled.form`
  display:flex;flex-direction:column;gap:${({theme})=>theme.spacings.md};
`;
const BlockTitle = styled.h3`
  font-size:${({theme})=>theme.fontSizes.md};
  margin:${({theme})=>theme.spacings.sm} 0;
`;
const Row = styled.div`
  display:grid;grid-template-columns:repeat(4,1fr);gap:${({theme})=>theme.spacings.md};
  ${({theme})=>theme.media.tablet}{grid-template-columns:repeat(2,1fr);}
  ${({theme})=>theme.media.mobile}{grid-template-columns:1fr;}
`;
const Col = styled.div`display:flex;flex-direction:column;gap:${({theme})=>theme.spacings.xs};min-width:0;`;
const Label = styled.label`font-size:${({theme})=>theme.fontSizes.xsmall};color:${({theme})=>theme.colors.textSecondary};`;
const Input = styled.input`
  padding:10px 12px;border-radius:${({theme})=>theme.radii.md};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.inputBorder};
  background:${({theme})=>theme.inputs.background};color:${({theme})=>theme.inputs.text};
  min-width:0;
`;
const Select = styled.select`
  padding:10px 12px;border-radius:${({theme})=>theme.radii.md};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.inputBorder};
  background:${({theme})=>theme.inputs.background};color:${({theme})=>theme.inputs.text};
`;
const TextArea = styled.textarea`
  padding:10px 12px;border-radius:${({theme})=>theme.radii.md};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.inputBorder};
  background:${({theme})=>theme.inputs.background};color:${({theme})=>theme.inputs.text};
`;
const CheckRow = styled.div`display:flex;gap:${({theme})=>theme.spacings.xs};align-items:center;`;
const Actions = styled.div`display:flex;gap:${({theme})=>theme.spacings.sm};justify-content:flex-end;`;
const Primary = styled.button`
  background:${({theme})=>theme.buttons.primary.background};
  color:${({theme})=>theme.buttons.primary.text};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.buttons.primary.backgroundHover};
  padding:8px 14px;border-radius:${({theme})=>theme.radii.md};cursor:pointer;
`;
const Secondary = styled.button`
  background:${({theme})=>theme.buttons.secondary.background};
  color:${({theme})=>theme.buttons.secondary.text};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.border};
  padding:8px 14px;border-radius:${({theme})=>theme.radii.md};cursor:pointer;
`;
