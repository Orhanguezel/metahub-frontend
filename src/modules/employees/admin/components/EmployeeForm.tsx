"use client";
import styled, { css } from "styled-components";
import { useEffect, useMemo, useState } from "react";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "@/modules/employees/locales";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { createEmployee, updateEmployee } from "@/modules/employees/slice/employeesSlice";
import type { IEmployee, EmployeeStatus, IEmployment,ISkill, } from "@/modules/employees/types";

interface Props {
  initial?: IEmployee;
  onClose: () => void;
  onSaved?: () => void;
}

const TYPES: IEmployment["type"][] = ["fulltime", "parttime", "contractor", "intern"];
const STATUSES: EmployeeStatus[] = ["active", "inactive", "onleave", "terminated"];

export default function EmployeeForm({ initial, onClose, onSaved }: Props) {
  const { t, i18n } = useI18nNamespace("employees", translations);
  const dispatch = useAppDispatch();
  const isEdit = Boolean(initial?._id);
  const locale = (i18n.language || "en").replace("_", "-");

  /* ---------- Kaynak veriler (yalnız state) ---------- */
  const serviceOptions = useAppSelector((s: any) => s?.servicecatalog?.items ?? []);
  const rawUsers = useAppSelector((s: any) => s?.userCrud?.users ?? []);

  // Kullanıcı seçeneklerini normalize et (ad, soyad, email, phone vs.)
  const userOptions = useMemo(
    () =>
      (rawUsers as any[])
        .map((u) => {
          const first =
            u?.firstName ?? u?.givenName ?? (typeof u?.name === "string" ? u.name.split(" ")[0] : "") ?? "";
          const last =
            u?.lastName ??
            u?.familyName ??
            (typeof u?.name === "string" ? u.name.split(" ").slice(1).join(" ") : "") ??
            "";
          const label =
            u?.displayName || u?.fullName || u?.name || [first, last].filter(Boolean).join(" ") || u?.email || "";
          return {
            _id: u?._id ?? u?.id,
            email: u?.email ?? "",
            phone: u?.phone ?? u?.contact?.phone ?? u?.profile?.phone ?? "",
            firstName: first,
            lastName: last,
            displayName: u?.displayName ?? "",
            timezone: u?.timezone ?? u?.profile?.timezone ?? "",
            photoUrl: u?.avatarUrl ?? u?.photoUrl ?? "",
            label,
          };
        })
        .filter((u) => u._id),
    [rawUsers]
  );

  /* ---------- User (required) ---------- */
  const [userRef, setUserRef] = useState<string>(initial?.userRef || "");

  /* ---------- Basic ---------- */
  const [code, setCode] = useState(initial?.code || "");
  const [firstName, setFirstName] = useState(initial?.firstName || "");
  const [lastName, setLastName] = useState(initial?.lastName || "");
  const [displayName, setDisplayName] = useState(initial?.displayName || "");

  /* ---------- Contact ---------- */
  const [phone, setPhone] = useState(initial?.contact?.phone || "");
  const [email, setEmail] = useState(initial?.contact?.email || "");

  /* ---------- Opsiyonel özet alanlar ---------- */
  const [photoUrl, setPhotoUrl] = useState(initial?.photoUrl || "");
  const [timezone, setTimezone] = useState(initial?.timezone || "");

  /* ---------- Employment ---------- */
  const [type, setType] = useState<IEmployment["type"]>(initial?.employment?.type || "fulltime");
  const [position, setPosition] = useState(initial?.employment?.position || "");
  const [startDate, setStartDate] = useState<string>(
    initial?.employment?.startDate ? new Date(initial.employment.startDate).toISOString().slice(0, 10) : ""
  );
  const [endDate, setEndDate] = useState<string>(
    initial?.employment?.endDate ? new Date(initial.employment.endDate).toISOString().slice(0, 10) : ""
  );

  /* ---------- Status ---------- */
  const [status, setStatus] = useState<EmployeeStatus>(initial?.status || "active");

  /* ---------- Services (skills) ---------- */
  const initialSvcSkillIds = useMemo(
    () => (initial?.skills || []).filter((s) => s.serviceRef).map((s) => String(s.serviceRef)),
    [initial?.skills]
  );
  const [selectedSkillServiceIds, setSelectedSkillServiceIds] = useState<string[]>(initialSvcSkillIds);

  /* ---------- Constraints (preferred/avoid) ---------- */
  const [preferredServices, setPreferredServices] = useState<string[]>(
    (initial?.constraints?.preferredServices as string[]) ?? []
  );
  const [avoidServices, setAvoidServices] = useState<string[]>(
    (initial?.constraints?.avoidServices as string[]) ?? []
  );

  /* ---------- User seçilince formu doldur ---------- */
  useEffect(() => {
    if (!userRef) return;
    const u = userOptions.find((x) => x._id === userRef);
    if (!u) return;

    // Seçim anında kullanıcı bilgileriyle alanları senkronla (overwrite mantığı)
    setFirstName(u.firstName || "");
    setLastName(u.lastName || "");
    const full = [u.firstName, u.lastName].filter(Boolean).join(" ").trim();
    setDisplayName(u.displayName || full || u.email || "");
    setEmail(u.email || "");
    setPhone(u.phone || "");
    if (u.timezone) setTimezone(u.timezone);
    if (u.photoUrl) setPhotoUrl(u.photoUrl);
  }, [userRef, userOptions]);

  const canSubmit = useMemo(
    () => Boolean(userRef && firstName.trim() && lastName.trim() && (startDate || isEdit)),
    [userRef, firstName, lastName, startDate, isEdit]
  );

  const id = (k: string) => `emp_${k}`;
  const getMultiValues = (e: React.ChangeEvent<HTMLSelectElement>) =>
    Array.from(e.target.selectedOptions).map((o) => o.value);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const constraints: Record<string, any> = {};
    if (preferredServices.length) constraints.preferredServices = preferredServices;
    if (avoidServices.length) constraints.avoidServices = avoidServices;

    // Skill üretimi: seçilen her servis -> default level: 3
    const nonServiceSkills = (initial?.skills || []).filter((s) => !s.serviceRef);
    const serviceSkills: ISkill[] = selectedSkillServiceIds.map((sid) => ({
  key: String((serviceOptions as any[]).find(x => x._id === sid)?.code ?? sid),
  serviceRef: sid,
  level: 3,
} satisfies ISkill));


    const payload: Partial<IEmployee> = {
      userRef, // zorunlu
      code: code.trim() || undefined,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      fullName: `${firstName} ${lastName}`.trim(),
      displayName: displayName.trim() || undefined,
      photoUrl: photoUrl || undefined,
      timezone: timezone || undefined,
      contact:
        phone.trim() || email.trim()
          ? { phone: phone.trim() || undefined, email: email.trim() || undefined }
          : undefined,
      employment: {
        type,
        position: position.trim() || undefined,
        startDate: startDate || new Date().toISOString().slice(0, 10),
        endDate: endDate || undefined,
      },
      status,
      skills: [...nonServiceSkills, ...serviceSkills],
      ...(Object.keys(constraints).length ? { constraints } : {}),
    };

    if (isEdit && initial) {
      await dispatch(updateEmployee({ id: initial._id, changes: payload })).unwrap().catch(() => {});
    } else {
      await dispatch(createEmployee(payload)).unwrap().catch(() => {});
    }
    onSaved?.();
  };

  const userLabel = (u: any) =>
    u.label || [u.firstName, u.lastName].filter(Boolean).join(" ") || u.email || u._id;

  const svcLabel = (svc: any) =>
    svc?.name?.[i18n.language] || svc?.name?.en || svc?.name?.tr || svc?.code || svc?._id;

  return (
    <Form onSubmit={onSubmit} aria-label={t("form", "Employee Form")}>
      {/* User (required) */}
      <Fieldset>
        <Legend>{t("legend.user", "User")}</Legend>
        <Row>
          <Col>
            <Label htmlFor={id("userRef")}>{t("labels.user", "User")}</Label>
            <Select id={id("userRef")} required value={userRef} onChange={(e) => setUserRef(e.target.value)}>
              <option value="">{t("placeholders.selectUser", "Select user…")}</option>
              {userOptions.map((u) => (
                <option key={u._id} value={u._id}>
                  {userLabel(u)}
                </option>
              ))}
            </Select>
          </Col>
        </Row>
      </Fieldset>

      {/* Basic */}
      <Fieldset>
        <Legend>{t("legend.basic", "Basic")}</Legend>
        <Row>
          <Col>
            <Label htmlFor={id("code")}>{t("labels.code", "Code")}</Label>
            <Input
              id={id("code")}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder={t("placeholders.autoCode", "auto if empty")}
            />
          </Col>
          <Col>
            <Label htmlFor={id("firstName")}>{t("labels.firstName", "First Name")}</Label>
            <Input id={id("firstName")} required value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          </Col>
          <Col>
            <Label htmlFor={id("lastName")}>{t("labels.lastName", "Last Name")}</Label>
            <Input id={id("lastName")} required value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </Col>
          <Col>
            <Label htmlFor={id("displayName")}>{t("labels.displayName", "Display Name")}</Label>
            <Input
              id={id("displayName")}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder={t("placeholders.optional", "optional")}
            />
          </Col>
        </Row>
      </Fieldset>

      {/* Contact */}
      <Fieldset>
        <Legend>{t("legend.contact", "Contact")}</Legend>
        <Row>
          <Col>
            <Label htmlFor={id("phone")}>{t("labels.phone", "Phone")}</Label>
            <Input id={id("phone")} inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+90 5xx ..." />
          </Col>
          <Col>
            <Label htmlFor={id("email")}>{t("labels.email", "Email")}</Label>
            <Input id={id("email")} type="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com" />
          </Col>
        </Row>
      </Fieldset>

      {/* Employment */}
      <Fieldset>
        <Legend>{t("legend.employment", "Employment")}</Legend>
        <Row>
          <Col>
            <Label htmlFor={id("type")}>{t("labels.type", "Type")}</Label>
            <Select id={id("type")} value={type} onChange={(e) => setType(e.target.value as IEmployment["type"])}>
              {TYPES.map((p) => (
                <option key={p} value={p}>
                  {t(`employment.type.${p}`, p)}
                </option>
              ))}
            </Select>
          </Col>

          <Col>
            <Label htmlFor={id("position")}>{t("labels.position", "Position")}</Label>
            <Input id={id("position")} value={position} onChange={(e) => setPosition(e.target.value)} placeholder={t("placeholders.optional", "optional")} />
          </Col>

          <Col>
            <Label htmlFor={id("startDate")}>{t("labels.startDate", "Start")}</Label>
            <Input id={id("startDate")} type="date" required value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            <Hint>{t("hints.date", "YYYY-MM-DD")}</Hint>
          </Col>

          <Col>
            <Label htmlFor={id("endDate")}>{t("labels.endDate", "End")}</Label>
            <Input id={id("endDate")} type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            <Hint>{t("hints.optional", "Optional")}</Hint>
          </Col>
        </Row>
      </Fieldset>

      {/* Service Skills (dynamic) */}
      <Fieldset>
        <Legend>{t("legend.serviceSkills", "Service Skills")}</Legend>
        <Row>
          <Col>
            <Label htmlFor={id("skillServices")}>
              {t("labels.skillServices", "Services employee can perform")}
            </Label>
            <Select
              id={id("skillServices")}
              multiple
              value={selectedSkillServiceIds}
              onChange={(e) => setSelectedSkillServiceIds(getMultiValues(e))}
            >
              {serviceOptions.map((svc: any) => (
                <option key={svc._id} value={svc._id}>
                  {svcLabel(svc)}
                </option>
              ))}
            </Select>
            <Hint>{t("hints.multiSelect", "Hold CTRL/⌘ to select multiple")}</Hint>
          </Col>
        </Row>
      </Fieldset>

      {/* Constraints — Preferred / Avoid */}
      <Fieldset>
        <Legend>{t("legend.services", "Services (Preferences)")}</Legend>
        <Row>
          <Col>
            <Label htmlFor={id("preferredServices")}>
              {t("labels.preferredServices", "Preferred Services")}
            </Label>
            <Select id={id("preferredServices")} multiple value={preferredServices} onChange={(e) => setPreferredServices(getMultiValues(e))}>
              {serviceOptions.map((svc: any) => (
                <option key={svc._id} value={svc._id}>
                  {svcLabel(svc)}
                </option>
              ))}
            </Select>
            <Hint>{t("hints.multiSelect", "Hold CTRL/⌘ to select multiple")}</Hint>
          </Col>

          <Col>
            <Label htmlFor={id("avoidServices")}>
              {t("labels.avoidServices", "Avoid Services")}
            </Label>
            <Select id={id("avoidServices")} multiple value={avoidServices} onChange={(e) => setAvoidServices(getMultiValues(e))}>
              {serviceOptions.map((svc: any) => (
                <option key={svc._id} value={svc._id}>
                  {svcLabel(svc)}
                </option>
              ))}
            </Select>
            <Hint>{t("hints.multiSelect", "Hold CTRL/⌘ to select multiple")}</Hint>
          </Col>
        </Row>
      </Fieldset>

      {/* Status */}
      <Fieldset>
        <Legend>{t("legend.status", "Status")}</Legend>
        <Row>
          <Col>
            <Label htmlFor={id("status")}>{t("labels.status", "Status")}</Label>
            <Select id={id("status")} value={status} onChange={(e) => setStatus(e.target.value as EmployeeStatus)}>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {t(`status.${s}`, s)}
                </option>
              ))}
            </Select>
          </Col>
          <Col>
            <Label>{t("labels.preview", "Start (preview)")}</Label>
            <PreviewBox aria-live="polite">
              {startDate ? new Intl.DateTimeFormat(locale).format(new Date(startDate)) : "—"}
            </PreviewBox>
          </Col>
        </Row>
      </Fieldset>

      <Actions>
        <Secondary type="button" onClick={onClose}>
          {t("actions.cancel", "Cancel")}
        </Secondary>
        <Primary disabled={!canSubmit} type="submit">
          {isEdit ? t("actions.update", "Update") : t("actions.create", "Create")}
        </Primary>
      </Actions>
    </Form>
  );
}

/* ---- styled ---- */
const controlStyles = css`
  width: 100%;
  padding: 10px 12px;
  border-radius: ${({ theme }) => theme.radii.md};
  border: ${({ theme }) => theme.borders.thin}
    ${({ theme }) => (theme.colors?.inputBorder ?? theme.colors?.border)};
  background: ${({ theme }) =>
    theme.inputs?.background ?? theme.colors?.inputBackground ?? theme.colors?.backgroundAlt};
  color: ${({ theme }) => theme.inputs?.text ?? theme.colors?.text};
  &::placeholder { color: ${({ theme }) => theme.colors?.placeholder}; }
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.inputs?.borderFocus ?? theme.colors?.borderHighlight};
    box-shadow: ${({ theme }) => theme.colors?.shadowHighlight};
  }
`;

const Form = styled.form` display: flex; flex-direction: column; gap: ${({ theme }) => theme.spacings.lg}; `;
const Fieldset = styled.fieldset` border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border}; border-radius: ${({ theme }) => theme.radii.lg}; padding: ${({ theme }) => theme.spacings.lg}; `;
const Legend = styled.legend` padding: 0 ${({ theme }) => theme.spacings.xs}; color: ${({ theme }) => theme.colors.textPrimary}; font-weight: ${({ theme }) => theme.fontWeights.semiBold}; `;
const Row = styled.div`
  display: grid; grid-template-columns: repeat(4, 1fr); gap: ${({ theme }) => theme.spacings.md};
  ${({ theme }) => theme.media.tablet} { grid-template-columns: repeat(2, 1fr); }
  ${({ theme }) => theme.media.mobile} { grid-template-columns: 1fr; }
`;
const Col = styled.div` display: flex; flex-direction: column; gap: ${({ theme }) => theme.spacings.xs}; min-width: 0; `;
const Label = styled.label` font-size: ${({ theme }) => theme.fontSizes.xsmall}; color: ${({ theme }) => theme.colors.textSecondary}; `;
const Hint = styled.div` font-size: ${({ theme }) => theme.fontSizes.xsmall}; color: ${({ theme }) => theme.colors.textSecondary}; opacity: .8; `;
const Input = styled.input`${controlStyles} min-width: 0;`;
const Select = styled.select`${controlStyles}`;
const PreviewBox = styled.div`
  padding: 10px 12px; border-radius: ${({ theme }) => theme.radii.md};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.backgroundAlt}; color: ${({ theme }) => theme.colors.text};
  min-height: 40px; display: flex; align-items: center;
`;
const Actions = styled.div` display: flex; gap: ${({ theme }) => theme.spacings.sm}; justify-content: flex-end; `;
const Primary = styled.button`
  background: ${({ theme }) => theme.buttons.primary.background};
  color: ${({ theme }) => theme.buttons.primary.text};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.buttons.primary.backgroundHover};
  padding: 8px 14px; border-radius: ${({ theme }) => theme.radii.md}; cursor: pointer;
  &:disabled { opacity: ${({ theme }) => theme.opacity.disabled}; cursor: not-allowed; }
`;
const Secondary = styled.button`
  background: ${({ theme }) => theme.buttons.secondary.background};
  color: ${({ theme }) => theme.buttons.secondary.text};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  padding: 8px 14px; border-radius: ${({ theme }) => theme.radii.md}; cursor: pointer;
`;
