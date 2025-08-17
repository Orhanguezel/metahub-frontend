// SparepartFormModal.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import styled from "styled-components";
import { useAppSelector } from "@/store/hooks";
import type { ISparepart, SparepartCategory } from "@/modules/sparepart/types";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { translations } from "@/modules/sparepart";
import { SUPPORTED_LOCALES, SupportedLocale } from "@/types/common";
import { toast } from "react-toastify";
import { JSONEditor, ImageUploader } from "@/shared";

type TL = Partial<Record<SupportedLocale, string>>;
type UploadImage = { url: string; thumbnail?: string; webp?: string; publicId?: string };

interface Props {
  isOpen: boolean;
  onClose: () => void;
  editingItem: ISparepart | null;
  onSubmit: (formData: FormData, id?: string) => Promise<void>;
}

const setTL = (obj: TL | undefined, l: SupportedLocale, val: string): TL => ({ ...(obj || {}), [l]: val });
const getTLStrict = (obj?: TL, l?: SupportedLocale) => (l ? (obj?.[l] ?? "") : "");
const toTL = (v: any, lang: SupportedLocale): TL =>
  v && typeof v === "object" && !Array.isArray(v) ? (v as TL) : v ? ({ [lang]: String(v) } as TL) : {};

export default function SparepartFormModal({ isOpen, onClose, editingItem, onSubmit }: Props) {
  const { i18n, t } = useI18nNamespace("sparepart", translations);
  const lang = (i18n.language?.slice(0, 2)) as SupportedLocale;

  const categories = useAppSelector((s) => s.sparepartCategory.categories);
  const successMessage = useAppSelector((s) => s.sparepart.successMessage);
  const error = useAppSelector((s) => s.sparepart.error);

  // Mod toggle
  const [editMode, setEditMode] = useState<"simple" | "json">("simple");

  // Çok dilli alanlar
  const emptyTL = useMemo(
    () => SUPPORTED_LOCALES.reduce((a, l) => ({ ...a, [l]: "" }), {} as TL),
    []
  );
  const [name, setName] = useState<TL>({});
  const [description, setDescription] = useState<TL>({});
  const combinedJSONValue = useMemo(() => ({ name, description }), [name, description]);
  const onCombinedJSONChange = (v: any) => {
    setName(toTL(v?.name, lang));
    setDescription(toTL(v?.description, lang));
  };

  // sayısal / opsiyonel
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [brand, setBrand] = useState("");
  const [tags, setTags] = useState("");
  const [category, setCategory] = useState<string>("");

  const [material, setMaterial] = useState("");
  const [color, setColor] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [size, setSize] = useState("");
  const [powerW, setPowerW] = useState("");
  const [voltageV, setVoltageV] = useState("");
  const [flowRateM3H, setFlowRateM3H] = useState("");
  const [coolingCapacityKw, setCoolingCapacityKw] = useState("");
  const [isElectric, setIsElectric] = useState(false);
  const [batteryRangeKm, setBatteryRangeKm] = useState("");
  const [motorPowerW, setMotorPowerW] = useState("");
  const [stockThreshold, setStockThreshold] = useState("");
  const [isActive, setIsActive] = useState(true);

  // Görseller (sıra + silinenler)
  const originalExisting = useMemo<UploadImage[]>(
    () =>
      (editingItem?.images || []).map((img) => ({
        url: img.url,
        thumbnail: img.thumbnail,
        webp: img.webp,
        publicId: img.publicId,
      })),
    [editingItem?.images]
  );
  const [existingUploads, setExistingUploads] = useState<UploadImage[]>(originalExisting);
  const [removedExisting, setRemovedExisting] = useState<UploadImage[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);

  // fill/reset
  useEffect(() => {
    if (!isOpen) return;
    if (editingItem) {
      setName({ ...emptyTL, ...(editingItem.name as TL) });
      setDescription({ ...emptyTL, ...(editingItem.description as TL) });
      setBrand(editingItem.brand || "");
      setTags(Array.isArray(editingItem.tags) ? editingItem.tags.join(", ") : "");
      setPrice(editingItem.price?.toString() ?? "");
      setStock(editingItem.stock?.toString() ?? "");
      setCategory(typeof editingItem.category === "string" ? editingItem.category : editingItem.category?._id || "");

      setMaterial(editingItem.material ?? "");
      setColor(Array.isArray(editingItem.color) ? editingItem.color.join(", ") : "");
      setWeightKg(editingItem.weightKg?.toString() ?? "");
      setSize(editingItem.size ?? "");
      setPowerW(editingItem.powerW?.toString() ?? "");
      setVoltageV(editingItem.voltageV?.toString() ?? "");
      setFlowRateM3H(editingItem.flowRateM3H?.toString() ?? "");
      setCoolingCapacityKw(editingItem.coolingCapacityKw?.toString() ?? "");
      setIsElectric(Boolean(editingItem.isElectric));
      setBatteryRangeKm(editingItem.batteryRangeKm?.toString() ?? "");
      setMotorPowerW(editingItem.motorPowerW?.toString() ?? "");
      setStockThreshold(editingItem.stockThreshold?.toString() ?? "");
      setIsActive(editingItem.isActive ?? true);

      setExistingUploads(originalExisting);
      setRemovedExisting([]);
      setNewFiles([]);
    } else {
      setName({ ...emptyTL });
      setDescription({ ...emptyTL });
      setBrand("");
      setTags("");
      setPrice("");
      setStock("");
      setCategory("");

      setMaterial("");
      setColor("");
      setWeightKg("");
      setSize("");
      setPowerW("");
      setVoltageV("");
      setFlowRateM3H("");
      setCoolingCapacityKw("");
      setIsElectric(false);
      setBatteryRangeKm("");
      setMotorPowerW("");
      setStockThreshold("");
      setIsActive(true);

      setExistingUploads([]);
      setRemovedExisting([]);
      setNewFiles([]);
    }
  }, [editingItem, isOpen, emptyTL, originalExisting]);

  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
      onClose();
    } else if (error) {
      toast.error(error);
    }
  }, [successMessage, error, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const filledName = { ...emptyTL, ...name };
    const firstName = Object.values(filledName).find((v) => (v || "").trim());
    if (firstName) SUPPORTED_LOCALES.forEach((l) => (filledName[l] ||= firstName as string));

    const filledDesc = { ...emptyTL, ...description };
    const firstDesc = Object.values(filledDesc).find((v) => (v || "").trim());
    if (firstDesc) SUPPORTED_LOCALES.forEach((l) => (filledDesc[l] ||= firstDesc as string));

    const fd = new FormData();
    fd.append("name", JSON.stringify(filledName));
    fd.append("description", JSON.stringify(filledDesc));
    fd.append("brand", brand.trim());
    fd.append("price", price || "0");
    fd.append("stock", stock || "0");
    if (category) fd.append("category", category);
    fd.append("isElectric", String(isElectric));
    fd.append("isActive", String(isActive));
    if (stockThreshold) fd.append("stockThreshold", stockThreshold);

    fd.append(
      "tags",
      JSON.stringify((tags || "").split(",").map((s) => s.trim()).filter(Boolean))
    );
    fd.append(
      "color",
      JSON.stringify((color || "").split(",").map((s) => s.trim()).filter(Boolean))
    );

    // teknik alanlar (boşlar dahil)
    fd.append("material", material ?? "");
    fd.append("weightKg", weightKg ?? "");
    fd.append("size", size ?? "");
    fd.append("powerW", powerW ?? "");
    fd.append("voltageV", voltageV ?? "");
    fd.append("flowRateM3H", flowRateM3H ?? "");
    fd.append("coolingCapacityKw", coolingCapacityKw ?? "");
    fd.append("batteryRangeKm", batteryRangeKm ?? "");
    fd.append("motorPowerW", motorPowerW ?? "");

    // yeni dosyalar
    newFiles.forEach((file) => fd.append("images", file));

    // kaldırılan mevcutlar
    if (removedExisting.length) {
      fd.append(
        "removedImages",
        JSON.stringify(removedExisting.map((x) => ({ publicId: x.publicId, url: x.url })))
      );
    }

    // mevcutların yeni sırası
    if (existingUploads.length) {
      const orderSig = existingUploads.map((x) => x.publicId || x.url).filter(Boolean) as string[];
      fd.append("existingImagesOrder", JSON.stringify(orderSig));
    }

    await onSubmit(fd, editingItem?._id);
  };

  if (!isOpen) return null;

  return (
     <Form onSubmit={handleSubmit}>
      <h2>{editingItem ? t("admin.sparepart.edit", "Edit Sparepart") : t("admin.sparepart.create", "Add New Sparepart")}</h2>

      <ModeRow role="radiogroup" aria-label={t("editMode", "Edit Mode")}>
        <ModeBtn type="button" aria-pressed={editMode === "simple"} $active={editMode === "simple"} onClick={() => setEditMode("simple")}>
          {t("simpleMode", "Basit")}
        </ModeBtn>
        <ModeBtn type="button" aria-pressed={editMode === "json"} $active={editMode === "json"} onClick={() => setEditMode("json")}>
          {t("jsonMode", "JSON Editor")}
        </ModeBtn>
      </ModeRow>

      {editMode === "simple" ? (
        <>
          {SUPPORTED_LOCALES.map((lng) => (
            <Row key={lng}>
              <Col style={{ gridColumn: "span 2" }}>
                <Label>{t("admin.sparepart.name", "Sparepart Name")} ({lng.toUpperCase()})</Label>
                <Input value={getTLStrict(name, lng)} onChange={(e) => setName(setTL(name, lng, e.target.value))} />
              </Col>
              <Col style={{ gridColumn: "span 2" }}>
                <Label>{t("admin.sparepart.description", "Description")} ({lng.toUpperCase()})</Label>
                <TextArea rows={3} value={getTLStrict(description, lng)} onChange={(e) => setDescription(setTL(description, lng, e.target.value))} />
              </Col>
            </Row>
          ))}
        </>
      ) : (
        <Row>
          <Col style={{ gridColumn: "span 4" }}>
            <JSONEditor
              label={t("multiLangJSON", "Name + Description (JSON)")}
              value={combinedJSONValue}
              onChange={onCombinedJSONChange}
              placeholder={JSON.stringify({ name: emptyTL, description: emptyTL }, null, 2)}
            />
          </Col>
        </Row>
      )}

      <Row>
        <Col>
          <Label>{t("admin.sparepart.brand", "Brand")}</Label>
          <Input value={brand} onChange={(e) => setBrand(e.target.value)} />
        </Col>
        <Col>
          <Label>{t("admin.sparepart.price", "Price")}</Label>
          <Input type="number" min={0} step={0.01} value={price} onChange={(e) => setPrice(e.target.value)} />
        </Col>
        <Col>
          <Label>{t("admin.sparepart.stock", "Stock")}</Label>
          <Input type="number" min={0} value={stock} onChange={(e) => setStock(e.target.value)} />
        </Col>
        <Col>
          <Label>{t("admin.sparepart.category", "Category")}</Label>
          <Select value={category} onChange={(e) => setCategory(e.target.value)} required>
            <option value="" disabled>{t("admin.sparepart.select_category", "Select category")}</option>
            {categories.map((c: SparepartCategory) => (
              <option key={c._id} value={c._id}>{c.name?.[lang] || c.slug}</option>
            ))}
          </Select>
        </Col>
      </Row>

      <Row>
        <Col style={{ gridColumn: "span 2" }}>
          <Label>{t("admin.sparepart.tags", "Tags")}</Label>
          <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="kule, fan, motor" />
        </Col>
        <Col>
          <Label>{t("admin.sparepart.isElectric", "Electric?")}</Label>
          <CheckRow>
            <input type="checkbox" checked={isElectric} onChange={(e) => setIsElectric(e.target.checked)} />
            <span>{isElectric ? t("yes", "Yes") : t("no", "No")}</span>
          </CheckRow>
        </Col>
        <Col>
          <Label>{t("admin.sparepart.isActive", "Active?")}</Label>
          <CheckRow>
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
            <span>{isActive ? t("yes", "Yes") : t("no", "No")}</span>
          </CheckRow>
        </Col>
      </Row>

      <BlockTitle>{t("admin.sparepart.image", "Images")}</BlockTitle>
      <ImageUploader
        existing={existingUploads}
        onExistingChange={setExistingUploads}
        removedExisting={removedExisting}
        onRemovedExistingChange={setRemovedExisting}
        files={newFiles}
        onFilesChange={setNewFiles}
        maxFiles={8}
        accept="image/*"
        sizeLimitMB={15}
        helpText={t("uploader.help", "jpg/png/webp • keeps order")}
      />

      <Fieldset>
        <Legend>{t("admin.sparepart.advanced", "Advanced (Optional)")}</Legend>

        <GridTwo>
          <div>
            <Label>{t("admin.sparepart.material", "Material")}</Label>
            <Input value={material} onChange={(e) => setMaterial(e.target.value)} />
          </div>
          <div>
            <Label>{t("admin.sparepart.color", "Color (comma separated)")}</Label>
            <Input value={color} onChange={(e) => setColor(e.target.value)} />
          </div>
        </GridTwo>

        <GridFour>
          <div>
            <Label>{t("admin.sparepart.weightKg", "Weight (kg)")}</Label>
            <Input type="number" min={0} step={0.01} value={weightKg} onChange={(e) => setWeightKg(e.target.value)} />
          </div>
          <div>
            <Label>{t("admin.sparepart.size", "Size/Dimensions")}</Label>
            <Input value={size} onChange={(e) => setSize(e.target.value)} />
          </div>
          <div>
            <Label>{t("admin.sparepart.powerW", "Power (W)")}</Label>
            <Input type="number" min={0} value={powerW} onChange={(e) => setPowerW(e.target.value)} />
          </div>
          <div>
            <Label>{t("admin.sparepart.voltageV", "Voltage (V)")}</Label>
            <Input type="number" min={0} value={voltageV} onChange={(e) => setVoltageV(e.target.value)} />
          </div>
        </GridFour>

        <GridFour>
          <div>
            <Label>{t("admin.sparepart.flowRateM3H", "Flow Rate (m³/h)")}</Label>
            <Input type="number" min={0} value={flowRateM3H} onChange={(e) => setFlowRateM3H(e.target.value)} />
          </div>
          <div>
            <Label>{t("admin.sparepart.coolingCapacityKw", "Cooling Capacity (kW)")}</Label>
            <Input type="number" min={0} value={coolingCapacityKw} onChange={(e) => setCoolingCapacityKw(e.target.value)} />
          </div>
          <div>
            <Label>{t("admin.sparepart.batteryRangeKm", "Battery Range (km)")}</Label>
            <Input type="number" min={0} value={batteryRangeKm} onChange={(e) => setBatteryRangeKm(e.target.value)} />
          </div>
          <div>
            <Label>{t("admin.sparepart.motorPowerW", "Motor Power (W)")}</Label>
            <Input type="number" min={0} value={motorPowerW} onChange={(e) => setMotorPowerW(e.target.value)} />
          </div>
        </GridFour>
      </Fieldset>

      <Actions>
        <Secondary type="button" onClick={onClose}>{t("admin.cancel", "Cancel")}</Secondary>
        <Primary type="submit">{editingItem ? t("admin.update", "Update") : t("admin.create", "Create")}</Primary>
      </Actions>
    </Form>
  );
}

/* styled (ensotek patern) */
const Form = styled.form`
  display:flex; flex-direction:column; gap:${({theme})=>theme.spacings.md};
  max-width: 960px; margin: 0 auto;
  background:${({theme})=>theme.colors.cardBackground};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.border};
  border-radius:${({theme})=>theme.radii.lg};
  box-shadow:${({theme})=>theme.cards.shadow};
  padding:${({theme})=>theme.spacings.lg};
`;
const Row = styled.div`
  display:grid; grid-template-columns:repeat(4,1fr); gap:${({theme})=>theme.spacings.md};
  ${({theme})=>theme.media.tablet}{grid-template-columns:repeat(2,1fr);}
  ${({theme})=>theme.media.mobile}{grid-template-columns:1fr;}
`;
const Col = styled.div`display:flex; flex-direction:column; gap:${({theme})=>theme.spacings.xs}; min-width:0;`;
const BlockTitle = styled.h3`font-size:${({theme})=>theme.fontSizes.md}; margin:${({theme})=>theme.spacings.sm} 0; color:${({theme})=>theme.colors.title};`;
const Label = styled.label`font-size:${({theme})=>theme.fontSizes.xsmall}; color:${({theme})=>theme.colors.textSecondary};`;
const Input = styled.input`
  padding:10px 12px; border-radius:${({theme})=>theme.radii.md};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.inputBorder};
  background:${({theme})=>theme.inputs.background}; color:${({theme})=>theme.inputs.text};
  min-width:0;
`;
const TextArea = styled.textarea`
  padding:10px 12px; border-radius:${({theme})=>theme.radii.md};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.inputBorder};
  background:${({theme})=>theme.inputs.background}; color:${({theme})=>theme.inputs.text};
  resize:vertical;
`;
const Select = styled.select`
  flex:1 1 auto; padding:10px 12px; border-radius:${({theme})=>theme.radii.md};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.inputBorder};
  background:${({theme})=>theme.inputs.background}; color:${({theme})=>theme.inputs.text};
`;
const CheckRow = styled.label`display:flex; gap:${({theme})=>theme.spacings.xs}; align-items:center;`;
const Actions = styled.div`display:flex; gap:${({theme})=>theme.spacings.sm}; justify-content:flex-end; margin-top:${({theme})=>theme.spacings.md};`;
const BaseBtn = styled.button`
  padding:8px 14px; border-radius:${({theme})=>theme.radii.md}; cursor:pointer;
  border:${({theme})=>theme.borders.thin} transparent; font-weight:${({theme})=>theme.fontWeights.medium};
`;
const Primary = styled(BaseBtn)`
  background:${({theme})=>theme.buttons.primary.background};
  color:${({theme})=>theme.buttons.primary.text};
  &:hover{ background:${({theme})=>theme.buttons.primary.backgroundHover}; }
`;
const Secondary = styled(BaseBtn)`
  background:${({theme})=>theme.buttons.secondary.background};
  color:${({theme})=>theme.buttons.secondary.text};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.border};
`;
const Fieldset = styled.fieldset`
  margin-top:${({theme})=>theme.spacings.md};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.border};
  border-radius:${({theme})=>theme.radii.md};
  padding:${({theme})=>theme.spacings.md};
`;
const Legend = styled.legend`padding:0 ${({theme})=>theme.spacings.xs}; color:${({theme})=>theme.colors.textSecondary};`;
const GridTwo = styled.div`display:grid; grid-template-columns:repeat(2,1fr); gap:${({theme})=>theme.spacings.md}; ${({theme})=>theme.media.mobile}{grid-template-columns:1fr;}`;
const GridFour = styled(GridTwo)`grid-template-columns:repeat(4,1fr); ${({theme})=>theme.media.tablet}{grid-template-columns:repeat(2,1fr);} ${({theme})=>theme.media.mobile}{grid-template-columns:1fr;}`;
const ModeRow = styled.div`display:flex; gap:${({theme})=>theme.spacings.xs}; align-items:center; margin-top:-6px;`;
const ModeBtn = styled.button<{ $active?: boolean }>`
  padding:8px 10px; border-radius:${({theme})=>theme.radii.pill};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.border};
  background:${({$active,theme})=>$active?theme.colors.primaryLight:theme.colors.cardBackground};
  color:${({theme})=>theme.colors.text};
  cursor:pointer;
`;
