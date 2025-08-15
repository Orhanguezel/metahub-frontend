"use client";
import styled from "styled-components";
import { useMemo, useState } from "react";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { translations } from "@/modules/opstemplates";
import { useAppDispatch } from "@/store/hooks";
import {
  createOpsTemplate,
  updateOpsTemplate,
} from "@/modules/opstemplates/slice/opstemplatesSlice";
import type {
  IOperationTemplate,
  IOperationStep,
  IChecklistItem,
  IQualityCheck,
  CreateOpsTemplateDTO,
  UpdateOpsTemplateDTO,
} from "@/modules/opstemplates/types";
import type { SupportedLocale } from "@/types/common";

/* ---------- i18n helpers ----------- */
type TL = Partial<Record<SupportedLocale, string>>;
const emptyTL = (): TL => ({});
const getTL = (obj: TL | undefined, l: SupportedLocale) => obj?.[l] ?? obj?.en ?? "";
const setTL = (obj: TL | undefined, l: SupportedLocale, val: string): TL => ({
  ...(obj || {}),
  [l]: val,
});

interface Props {
  initial?: IOperationTemplate;
  onClose: () => void;
  onSaved?: () => void;
}

export default function TemplateForm({ initial, onClose, onSaved }: Props) {
  const { t, i18n } = useI18nNamespace("opstemplates", translations);

  const lang = useMemo<SupportedLocale>(() => {
    const two = (i18n.language?.slice(0, 2) || "en") as SupportedLocale;
    return two;
  }, [i18n.language]);

  const dispatch = useAppDispatch();
  const isEdit = Boolean(initial?._id);
  const [submitting, setSubmitting] = useState(false);

  const [code, setCode] = useState(initial?.code || "");
  const [name, setName] = useState<TL>((initial?.name as TL) || emptyTL());
  const [description, setDescription] = useState<TL>(
    (initial?.description as TL) || emptyTL()
  );
  const [serviceRef, setServiceRef] = useState(initial?.serviceRef || "");
  const [defaultDurationMinutes, setDefaultDurationMinutes] = useState<number>(
    Number(initial?.defaultDurationMinutes || 0)
  );
  const [crew, setCrew] = useState(initial?.crew || {});
  const [steps, setSteps] = useState<IOperationStep[]>(
    (initial?.steps as IOperationStep[]) || []
  );
  const [materials] = useState(initial?.materials || []);
  const [safetyNotes] = useState<TL[]>((initial?.safetyNotes as TL[]) || []);
  const [isActive, setIsActive] = useState<boolean>(initial?.isActive ?? true);
  const [version, setVersion] = useState<number>(Number(initial?.version || 1));

  // deliverables
  const [photosBefore, setPhotosBefore] = useState<boolean>(!!initial?.deliverables?.photos?.before);
  const [photosAfter, setPhotosAfter] = useState<boolean>(!!initial?.deliverables?.photos?.after);
  const [minPerStep, setMinPerStep] = useState<number>(
    Number(initial?.deliverables?.photos?.minPerStep || 0)
  );
  const [sigCustomer, setSigCustomer] = useState<boolean>(
    !!initial?.deliverables?.signatures?.customer
  );
  const [sigSupervisor, setSigSupervisor] = useState<boolean>(
    !!initial?.deliverables?.signatures?.supervisor
  );
  const [notesRequired, setNotesRequired] = useState<boolean>(
    !!initial?.deliverables?.notesRequired
  );
  const [attachmentsRequired, setAttachmentsRequired] = useState<boolean>(
    !!initial?.deliverables?.attachmentsRequired
  );

  // recurrence (özet)
  const [recEnabled, setRecEnabled] = useState<boolean>(!!initial?.recurrence?.enabled);
  const [recEvery, setRecEvery] = useState<number>(Number(initial?.recurrence?.every || 1));
  const [recUnit, setRecUnit] = useState<"day" | "week" | "month">(
    (initial?.recurrence?.unit as any) || "week"
  );
  const [recDays, setRecDays] = useState<number[]>(initial?.recurrence?.daysOfWeek || []);
  const [recDayOfMonth, setRecDayOfMonth] = useState<number | "">(
    initial?.recurrence?.dayOfMonth || ""
  );
  const [startHint, setStartHint] = useState<string>(
    initial?.recurrence?.startDateHint
      ? new Date(initial.recurrence!.startDateHint as any).toISOString().slice(0, 10)
      : ""
  );

  // applicability (CSV id girişleri)
  const [categoryRefs, setCategoryRefs] = useState<string>(
    (initial?.applicability?.categoryRefs || []).join(",")
  );
  const [apartmentRefs, setApartmentRefs] = useState<string>(
    (initial?.applicability?.apartmentRefs || []).join(",")
  );
  const [tags, setTags] = useState<string>((initial?.tags || []).join(","));

  const addStep = () =>
    setSteps((s) => [
      ...s,
      {
        title: emptyTL(),
        type: "task",
        estimatedMinutes: 30,
        checklist: [],
        quality: [],
      } as IOperationStep,
    ]);
  const updateStep = (i: number, patch: Partial<IOperationStep>) =>
    setSteps((s) => s.map((x, idx) => (idx === i ? { ...x, ...patch } : x)));
  const removeStep = (i: number) => setSteps((s) => s.filter((_, idx) => idx !== i));

  const addChecklist = (i: number) =>
    updateStep(i, {
      checklist: [ ...(steps[i].checklist || []), { text: emptyTL(), required: false } ] as IChecklistItem[],
    });
  const updateChecklist = (i: number, ci: number, patch: Partial<IChecklistItem>) =>
    updateStep(i, {
      checklist: (steps[i].checklist || []).map((c, idx) => (idx === ci ? { ...c, ...patch } : c)),
    });
  const removeChecklist = (i: number, ci: number) =>
    updateStep(i, {
      checklist: (steps[i].checklist || []).filter((_, idx) => idx !== ci),
    });

  const addQuality = (i: number) =>
    updateStep(i, {
      quality: [ ...(steps[i].quality || []), { key: "metric", type: "boolean" } ] as IQualityCheck[],
    });
  const updateQuality = (i: number, qi: number, patch: Partial<IQualityCheck>) =>
    updateStep(i, {
      quality: (steps[i].quality || []).map((q, idx) => (idx === qi ? { ...q, ...patch } : q)),
    });
  const removeQuality = (i: number, qi: number) =>
    updateStep(i, { quality: (steps[i].quality || []).filter((_, idx) => idx !== qi) });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    // DTO’lar: create/update thunks böyle bekliyor
    const base = {
      code: code || undefined,
      name,
      description,
      serviceRef: serviceRef || undefined,
      defaultDurationMinutes: Number(defaultDurationMinutes) || undefined,
      crew,
      steps,
      materials,
      safetyNotes,
      deliverables: {
        photos: {
          before: photosBefore,
          after: photosAfter,
          minPerStep: Number(minPerStep) || 0,
        },
        signatures: { customer: sigCustomer, supervisor: sigSupervisor },
        notesRequired,
        attachmentsRequired,
      },
      recurrence: {
        enabled: recEnabled,
        every: Number(recEvery) || 1,
        unit: recUnit,
        daysOfWeek: recUnit === "week" ? recDays : undefined,
        dayOfMonth: recUnit === "month" ? (recDayOfMonth || undefined) : undefined,
        startDateHint: startHint ? new Date(startHint).toISOString() : undefined,
      },
      applicability: {
        categoryRefs: categoryRefs.split(",").map((s) => s.trim()).filter(Boolean),
        apartmentRefs: apartmentRefs.split(",").map((s) => s.trim()).filter(Boolean),
        tags: tags.split(",").map((s) => s.trim()).filter(Boolean),
      },
      tags: tags.split(",").map((s) => s.trim()).filter(Boolean),
      version: Number(version) || 1,
      isActive,
    };

    try {
      setSubmitting(true);
      if (isEdit) {
        const updateDto: UpdateOpsTemplateDTO = base as UpdateOpsTemplateDTO;
        await dispatch(updateOpsTemplate({ id: initial!._id, changes: updateDto })).unwrap();
      } else {
        const createDto: CreateOpsTemplateDTO = {
          // name zorunlu ⇒ en az aktif dilde doldurulmuş olmalı
          ...base,
          name, // TL
          steps, // IOperationStep[]
        } as CreateOpsTemplateDTO;
        await dispatch(createOpsTemplate(createDto)).unwrap();
      }
      onSaved?.();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Form onSubmit={onSubmit}>
      {/* top row */}
      <Row>
        <Col>
          <Label>{t("code", "Code")}</Label>
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder={t("autoIfEmpty", "(auto if empty)")}
          />
        </Col>
        <Col>
          <Label>{t("serviceId", "Service ID")}</Label>
          <Input value={serviceRef} onChange={(e) => setServiceRef(e.target.value)} />
        </Col>
        <Col>
          <Label>{t("defaultMinutes", "Default Minutes")}</Label>
          <Input
            type="number"
            min={0}
            value={defaultDurationMinutes}
            onChange={(e) => setDefaultDurationMinutes(Number(e.target.value) || 0)}
          />
        </Col>
        <Col>
          <Label>{t("active", "Active")}</Label>
          <Check>
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
            <span>{isActive ? t("yes", "Yes") : t("no", "No")}</span>
          </Check>
        </Col>
      </Row>

      {/* titles */}
      <Row>
        <Col>
          <Label>{t("titleLang", "Title ({lang})").replace("{lang}", lang)}</Label>
          <Input
            value={getTL(name, lang)}
            onChange={(e) => setName(setTL(name, lang, e.target.value))}
            required
          />
        </Col>
        <Col style={{ gridColumn: "span 3" }}>
          <Label>{t("descriptionLang", "Description ({lang})").replace("{lang}", lang)}</Label>
          <TextArea
            rows={2}
            value={getTL(description, lang)}
            onChange={(e) => setDescription(setTL(description, lang, e.target.value))}
          />
        </Col>
      </Row>

      {/* crew + version */}
      <Row>
        <Col>
          <Label>{t("crewMin", "Crew Min")}</Label>
          <Input
            type="number"
            min={0}
            value={crew.min ?? ""}
            onChange={(e) =>
              setCrew({ ...crew, min: e.target.value === "" ? undefined : Number(e.target.value) })
            }
          />
        </Col>
        <Col>
          <Label>{t("crewRec", "Crew Rec.")}</Label>
          <Input
            type="number"
            min={0}
            value={crew.recommended ?? ""}
            onChange={(e) =>
              setCrew({
                ...crew,
                recommended: e.target.value === "" ? undefined : Number(e.target.value),
              })
            }
          />
        </Col>
        <Col>
          <Label>{t("crewMax", "Crew Max")}</Label>
          <Input
            type="number"
            min={0}
            value={crew.max ?? ""}
            onChange={(e) =>
              setCrew({ ...crew, max: e.target.value === "" ? undefined : Number(e.target.value) })
            }
          />
        </Col>
        <Col>
          <Label>{t("version", "Version")}</Label>
          <Input
            type="number"
            min={1}
            value={version}
            onChange={(e) => setVersion(Number(e.target.value) || 1)}
          />
        </Col>
      </Row>

      <Block>{t("steps", "Steps")}</Block>
      {steps.map((s, idx) => (
        <Step key={idx}>
          <Row>
            <Col>
              <Label>{t("type", "Type")}</Label>
              <Select
                value={s.type || "task"}
                onChange={(e) => updateStep(idx, { type: e.target.value as any })}
              >
                {["task", "inspection", "safety", "handover"].map((x) => (
                  <option key={x} value={x}>
                    {x}
                  </option>
                ))}
              </Select>
            </Col>
            <Col>
              <Label>{t("code", "Code")}</Label>
              <Input
                value={s.code || ""}
                onChange={(e) => updateStep(idx, { code: e.target.value })}
              />
            </Col>
            <Col>
              <Label>{t("titleLang", "Title ({lang})").replace("{lang}", lang)}</Label>
              <Input
                value={getTL(s.title as TL, lang)}
                onChange={(e) => updateStep(idx, { title: setTL(s.title as TL, lang, e.target.value) })}
              />
            </Col>
            <Col>
              <Label>{t("estMinutes", "Est. Minutes")}</Label>
              <Input
                type="number"
                min={0}
                value={s.estimatedMinutes ?? 30}
                onChange={(e) =>
                  updateStep(idx, { estimatedMinutes: Number(e.target.value) || 0 })
                }
              />
            </Col>
          </Row>

          <Row>
            <Col>
              <Label>{t("instruction", "Instruction")} ({lang})</Label>
              <TextArea
                rows={2}
                value={getTL(s.instruction as TL, lang)}
                onChange={(e) =>
                  updateStep(idx, { instruction: setTL(s.instruction as TL, lang, e.target.value) })
                }
              />
            </Col>
            <Col>
              <Label>{t("skillsCsv", "Skills (csv)")}</Label>
              <Input
                value={(s.requiredSkills || []).join(",")}
                onChange={(e) =>
                  updateStep(idx, {
                    requiredSkills: e.target.value.split(",").map((x) => x.trim()).filter(Boolean),
                  })
                }
              />
            </Col>
            <Col>
              <Label>{t("equipmentCsv", "Equipment (csv)")}</Label>
              <Input
                value={(s.requiredEquipment || []).join(",")}
                onChange={(e) =>
                  updateStep(idx, {
                    requiredEquipment: e.target.value.split(",").map((x) => x.trim()).filter(Boolean),
                  })
                }
              />
            </Col>
            <Col style={{ display: "flex", alignItems: "end" }}>
              <Mini type="button" onClick={(ev) => { ev.preventDefault(); addChecklist(idx); }}>
                + {t("addChecklist", "Checklist")}
              </Mini>
              <Mini type="button" onClick={(ev) => { ev.preventDefault(); addQuality(idx); }}>
                + {t("addQuality", "Quality")}
              </Mini>
              <Mini
                type="button"
                danger
                onClick={(ev) => { ev.preventDefault(); removeStep(idx); }}
              >
                {t("remove", "Remove")}
              </Mini>
            </Col>
          </Row>

          {(s.checklist || []).map((c, ci) => (
            <SubRow key={ci}>
              <Col>
                <Label>{t("checklistTextLang", "Checklist Text ({lang})").replace("{lang}", lang)}</Label>
                <Input
                  value={getTL(c.text as TL, lang)}
                  onChange={(e) =>
                    updateChecklist(idx, ci, { text: setTL(c.text as TL, lang, e.target.value) })
                  }
                />
              </Col>
              <Col>
                <Label>{t("required", "Required")}</Label>
                <Check>
                  <input
                    type="checkbox"
                    checked={!!c.required}
                    onChange={(e) => updateChecklist(idx, ci, { required: e.target.checked })}
                  />
                  <span>{t("yes", "Yes")}</span>
                </Check>
              </Col>
              <Col>
                <Label>{t("photoReq", "Photo Req.")}</Label>
                <Check>
                  <input
                    type="checkbox"
                    checked={!!c.photoRequired}
                    onChange={(e) => updateChecklist(idx, ci, { photoRequired: e.target.checked })}
                  />
                  <span>{t("yes", "Yes")}</span>
                </Check>
              </Col>
              <Col>
                <Label>{t("minPhotos", "Min Photos")}</Label>
                <Input
                  type="number"
                  min={0}
                  value={c.minPhotos ?? 0}
                  onChange={(e) =>
                    updateChecklist(idx, ci, { minPhotos: Number(e.target.value) || 0 })
                  }
                />
              </Col>
              <Col style={{ display: "flex", alignItems: "end" }}>
                <Mini
                  type="button"
                  danger
                  onClick={(ev) => { ev.preventDefault(); removeChecklist(idx, ci); }}
                >
                  {t("remove", "Remove")}
                </Mini>
              </Col>
            </SubRow>
          ))}

          {(s.quality || []).map((q, qi) => (
            <SubRow key={qi}>
              <Col>
                <Label>{t("qualityKey", "Quality Key")}</Label>
                <Input value={q.key} onChange={(e) => updateQuality(idx, qi, { key: e.target.value })} />
              </Col>
              <Col>
                <Label>{t("qualityLabelLang", "Label ({lang})").replace("{lang}", lang)}</Label>
                <Input
                  value={getTL(q.label as TL, lang)}
                  onChange={(e) =>
                    updateQuality(idx, qi, { label: setTL(q.label as TL, lang, e.target.value) })
                  }
                />
              </Col>
              <Col>
                <Label>Type</Label>
                <Select
                  value={q.type || "boolean"}
                  onChange={(e) => updateQuality(idx, qi, { type: e.target.value as any })}
                >
                  {["boolean", "number", "select"].map((x) => (
                    <option key={x} value={x}>{x}</option>
                  ))}
                </Select>
              </Col>
              <Col>
                <Label>{t("passIf", "Pass If")}</Label>
                <Input
                  value={String(q.passIf ?? "")}
                  onChange={(e) => updateQuality(idx, qi, { passIf: e.target.value })}
                />
              </Col>
              <Col style={{ display: "flex", alignItems: "end" }}>
                <Mini type="button" danger onClick={(ev) => { ev.preventDefault(); removeQuality(idx, qi); }}>
                  {t("remove", "Remove")}
                </Mini>
              </Col>
            </SubRow>
          ))}
        </Step>
      ))}
      {steps.length === 0 && (
        <BtnRow>
          <Mini type="button" onClick={(e) => { e.preventDefault(); addStep(); }}>
            + {t("addStep", "Add Step")}
          </Mini>
        </BtnRow>
      )}

      {/* deliverables */}
      <Block>{t("deliverables", "Deliverables")}</Block>
      <Row>
        <Col>
          <Label>{t("beforePhoto", "Before Photo")}</Label>
          <Check>
            <input type="checkbox" checked={photosBefore} onChange={(e) => setPhotosBefore(e.target.checked)} />
            <span>{t("yes", "Yes")}</span>
          </Check>
        </Col>
        <Col>
          <Label>{t("afterPhoto", "After Photo")}</Label>
          <Check>
            <input type="checkbox" checked={photosAfter} onChange={(e) => setPhotosAfter(e.target.checked)} />
            <span>{t("yes", "Yes")}</span>
          </Check>
        </Col>
        <Col>
          <Label>{t("minPerStep", "Min/Step")}</Label>
          <Input type="number" min={0} value={minPerStep} onChange={(e) => setMinPerStep(Number(e.target.value) || 0)} />
        </Col>
        <Col>
          <Label>{t("notesRequired", "Notes Required")}</Label>
          <Check>
            <input type="checkbox" checked={notesRequired} onChange={(e) => setNotesRequired(e.target.checked)} />
            <span>{t("yes", "Yes")}</span>
          </Check>
        </Col>
      </Row>
      <Row>
        <Col>
          <Label>{t("signatureCustomer", "Signature (Customer)")}</Label>
          <Check>
            <input type="checkbox" checked={sigCustomer} onChange={(e) => setSigCustomer(e.target.checked)} />
            <span>{t("yes", "Yes")}</span>
          </Check>
        </Col>
        <Col>
          <Label>{t("signatureSupervisor", "Signature (Supervisor)")}</Label>
          <Check>
            <input type="checkbox" checked={sigSupervisor} onChange={(e) => setSigSupervisor(e.target.checked)} />
            <span>{t("yes", "Yes")}</span>
          </Check>
        </Col>
        <Col>
          <Label>{t("attachmentsRequired", "Attachments Required")}</Label>
          <Check>
            <input type="checkbox" checked={attachmentsRequired} onChange={(e) => setAttachmentsRequired(e.target.checked)} />
            <span>{t("yes", "Yes")}</span>
          </Check>
        </Col>
      </Row>

      {/* recurrence */}
      <Block>{t("recurrence", "Recurrence")}</Block>
      <Row>
        <Col>
          <Label>{t("enabled", "Enabled")}</Label>
          <Check>
            <input type="checkbox" checked={recEnabled} onChange={(e) => setRecEnabled(e.target.checked)} />
            <span>{t("yes", "Yes")}</span>
          </Check>
        </Col>
        <Col>
          <Label>{t("every", "Every")}</Label>
          <Input type="number" min={1} value={recEvery} onChange={(e) => setRecEvery(Number(e.target.value) || 1)} />
        </Col>
        <Col>
          <Label>{t("unit", "Unit")}</Label>
          <Select value={recUnit} onChange={(e) => setRecUnit(e.target.value as any)}>
            <option value="day">{t("unit.day", "day")}</option>
            <option value="week">{t("unit.week", "week")}</option>
            <option value="month">{t("unit.month", "month")}</option>
          </Select>
        </Col>
        <Col>
          <Label>{t("startHint", "Start Hint")}</Label>
          <Input type="date" value={startHint} onChange={(e) => setStartHint(e.target.value)} />
        </Col>
      </Row>

      {recUnit === "week" && (
        <Row>
          <Col style={{ gridColumn: "span 4" }}>
            <Label>{t("daysOfWeek", "Days of Week")}</Label>
            <Multi>
              {[0, 1, 2, 3, 4, 5, 6].map((d) => (
                <label key={d}>
                  <input
                    type="checkbox"
                    checked={recDays.includes(d)}
                    onChange={(e) =>
                      setRecDays((p) => (e.target.checked ? [...p, d] : p.filter((x) => x !== d)))
                    }
                  />{" "}
                  {t(`weekday.${d}`, ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d])}
                </label>
              ))}
            </Multi>
          </Col>
        </Row>
      )}

      {recUnit === "month" && (
        <Row>
          <Col style={{ gridColumn: "span 4" }}>
            <Label>{t("dayOfMonth", "Day of Month")}</Label>
            <Input
              type="number"
              min={1}
              max={31}
              value={recDayOfMonth}
              onChange={(e) => setRecDayOfMonth(e.target.value === "" ? "" : Number(e.target.value))}
            />
          </Col>
        </Row>
      )}

      {/* applicability */}
      <Block>{t("applicability", "Applicability")}</Block>
      <Row>
        <Col>
          <Label>{t("categoryIdsCsv", "Category IDs (csv)")}</Label>
          <Input value={categoryRefs} onChange={(e) => setCategoryRefs(e.target.value)} />
        </Col>
        <Col>
          <Label>{t("apartmentIdsCsv", "Apartment IDs (csv)")}</Label>
          <Input value={apartmentRefs} onChange={(e) => setApartmentRefs(e.target.value)} />
        </Col>
        <Col style={{ gridColumn: "span 2" }}>
          <Label>{t("tagsCsv", "Tags (csv)")}</Label>
          <Input value={tags} onChange={(e) => setTags(e.target.value)} />
        </Col>
      </Row>

      <Actions>
        <Secondary type="button" onClick={onClose}>{t("cancel", "Cancel")}</Secondary>
        <Primary type="submit" disabled={submitting} aria-busy={submitting}>
          {isEdit ? t("update", "Update") : t("create", "Create")}
        </Primary>
      </Actions>
    </Form>
  );
}

/* ---- styled ---- */
const Form = styled.form`
  display: flex; flex-direction: column; gap: ${({ theme }) => theme.spacings.md};
`;
const Row = styled.div`
  display: grid; gap: ${({ theme }) => theme.spacings.md}; grid-template-columns: repeat(4,1fr);
  ${({ theme }) => theme.media.tablet}{ grid-template-columns: repeat(2,1fr); }
  ${({ theme }) => theme.media.mobile}{ grid-template-columns: 1fr; }
`;
const SubRow = styled(Row)` margin-top: ${({ theme }) => theme.spacings.xs}; `;
const Col = styled.div` display: flex; flex-direction: column; gap: ${({ theme }) => theme.spacings.xs}; min-width: 0; `;
const Block = styled.h3` margin: ${({ theme }) => theme.spacings.sm} 0; `;
const Label = styled.label` font-size: ${({ theme }) => theme.fontSizes.xsmall}; color: ${({ theme }) => theme.colors.textSecondary}; `;
const Input = styled.input`
  padding: 10px 12px; border-radius: ${({ theme }) => theme.radii.md};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.inputBorder};
  background: ${({ theme }) => theme.inputs.background}; color: ${({ theme }) => theme.inputs.text};
  min-width: 0; &:focus{ outline: none; box-shadow: ${({ theme }) => theme.colors.shadowHighlight}; }
`;
const TextArea = styled.textarea`
  padding: 10px 12px; border-radius: ${({ theme }) => theme.radii.md};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.inputBorder};
  background: ${({ theme }) => theme.inputs.background}; color: ${({ theme }) => theme.inputs.text};
  &:focus{ outline: none; box-shadow: ${({ theme }) => theme.colors.shadowHighlight}; }
`;
const Select = styled.select`
  padding: 10px 12px; border-radius: ${({ theme }) => theme.radii.md};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.inputBorder};
  background: ${({ theme }) => theme.inputs.background}; color: ${({ theme }) => theme.inputs.text};
  &:focus{ outline: none; box-shadow: ${({ theme }) => theme.colors.shadowHighlight}; }
`;
const Check = styled.label` display: flex; gap: ${({ theme }) => theme.spacings.xs}; align-items: center; `;
const Multi = styled.div`
  display: flex; flex-wrap: wrap; gap: ${({ theme }) => theme.spacings.xs};
  label{ display:flex; align-items:center; gap:6px; padding:6px 10px; border:${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border}; border-radius:${({ theme }) => theme.radii.md}; }
`;
const Actions = styled.div` display:flex; gap:${({ theme }) => theme.spacings.sm}; justify-content:flex-end; `;
const Primary = styled.button`
  background:${({ theme }) => theme.buttons.primary.background};
  color:${({ theme }) => theme.buttons.primary.text};
  border:${({ theme }) => theme.borders.thin} ${({ theme }) => theme.buttons.primary.backgroundHover};
  padding:8px 14px; border-radius:${({ theme }) => theme.radii.md}; cursor:pointer; transition: background ${({ theme }) => theme.transition.normal};
  &:hover{ background:${({ theme }) => theme.buttons.primary.backgroundHover}; }
  &:disabled{ opacity:${({ theme }) => theme.opacity.disabled}; cursor:not-allowed; }
`;
const Secondary = styled.button`
  background:${({ theme }) => theme.buttons.secondary.background};
  color:${({ theme }) => theme.buttons.secondary.text};
  border:${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  padding:8px 14px; border-radius:${({ theme }) => theme.radii.md}; cursor:pointer; transition: background ${({ theme }) => theme.transition.normal};
  &:hover{ background:${({ theme }) => theme.buttons.secondary.backgroundHover}; }
`;
const BtnRow = styled.div` display:flex; gap:${({ theme }) => theme.spacings.xs}; `;
const Mini = styled.button<{ danger?: boolean }>`
  padding:6px 10px; border-radius:${({ theme }) => theme.radii.md}; cursor:pointer; margin-right:${({ theme }) => theme.spacings.xs};
  background:${({ danger, theme }) => (danger ? theme.colors.dangerBg : theme.buttons.secondary.background)};
  color:${({ danger, theme }) => (danger ? theme.colors.danger : theme.buttons.secondary.text)};
  border:${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  transition: background ${({ theme }) => theme.transition.fast};
  &:hover{ background:${({ danger, theme }) => (danger ? theme.colors.dangerHover : theme.buttons.secondary.backgroundHover)}; }
`;
const Step = styled.div`
  background:${({ theme }) => theme.colors.cardBackground};
  border:${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.borderBright};
  border-radius:${({ theme }) => theme.radii.lg};
  padding:${({ theme }) => theme.spacings.md};
  margin-bottom:${({ theme }) => theme.spacings.sm};
  box-shadow:${({ theme }) => theme.cards.shadow};
`;
