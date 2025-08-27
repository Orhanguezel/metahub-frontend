"use client";
import styled from "styled-components";
import { useMemo, useState } from "react";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "@/modules/webhooks/locales";
import type {
  IWebhookEndpointFE,
  WebhookEndpointCreatePayload,
  WebhookEndpointUpdatePayload,
  WebhookEvent,
  IWebhookHeaderKV,
} from "@/modules/webhooks/types";

/* ---- helpers ---- */
const ALL_EVENTS: WebhookEvent[] = [
  "order.created",
  "order.status.changed",
  "payment.created",
  "payment.refunded",
  "promotion.redeemed",
  "coupon.created",
  "coupon.updated",
  "menuitem.updated",
  "system.ping",
  "*",
];

type Props = {
  initial?: IWebhookEndpointFE | null;
  onSubmit: (
    data: WebhookEndpointCreatePayload | WebhookEndpointUpdatePayload | FormData,
    id?: string
  ) => Promise<void> | void;
  onCancel: () => void;
};

export default function WebhooksForm({ initial, onCancel, onSubmit }: Props) {
  const { t } = useI18nNamespace("webhooks", translations);
  const isEdit = Boolean(initial?._id);

  /* ---- base fields ---- */
  const [name, setName] = useState<string>(initial?.name ?? "");
  const [description, setDescription] = useState<string>(initial?.description ?? "");
  const [targetUrl, setTargetUrl] = useState<string>(initial?.targetUrl ?? "");
  const [httpMethod, setHttpMethod] = useState<"POST" | "PUT">(initial?.httpMethod ?? "POST");
  const [isActive, setIsActive] = useState<boolean>(initial?.isActive ?? true);
  const [events, setEvents] = useState<WebhookEvent[]>(initial?.events ?? ["*"]);
  const [verifySSL, setVerifySSL] = useState<boolean>(initial?.verifySSL ?? true);

  // headers
  const [headers, setHeaders] = useState<IWebhookHeaderKV[]>(
    (initial?.headers && initial.headers.length ? initial.headers : [{ key: "", value: "" }]) as IWebhookHeaderKV[]
  );

  // signing
  const [sigHeaderName, setSigHeaderName] = useState<string>(initial?.signing?.headerName ?? "x-mh-signature");
  const [tsHeaderName, setTsHeaderName] = useState<string>(initial?.signing?.timestampHeaderName ?? "x-mh-timestamp");

  // retry
  const [maxAttempts, setMaxAttempts] = useState<number>(initial?.retry?.maxAttempts ?? 3);
  const [strategy, setStrategy] = useState<"fixed" | "exponential">(initial?.retry?.strategy ?? "exponential");
  const [baseBackoffSec, setBaseBackoffSec] = useState<number>(initial?.retry?.baseBackoffSec ?? 30);
  const [timeoutMs, setTimeoutMs] = useState<number>(initial?.retry?.timeoutMs ?? 15000);

  // secret gösterim & rotate
  const [rotateSecret, setRotateSecret] = useState<boolean>(false);

  const advancedOpen = useMemo(() => true, []);

  const toggleEvent = (ev: WebhookEvent) => {
    setEvents((prev) => {
      if (ev === "*") return ["*"];
      const next = (prev.includes(ev) ? prev.filter((x) => x !== ev) : [...prev, ev]).filter((x) => x !== "*") as WebhookEvent[];
      return next.length ? next : ["*"];
    });
  };

  const updateHeader = (i: number, key: "key" | "value", val: string) => {
    setHeaders((prev) => {
      const arr = [...prev];
      arr[i] = { ...arr[i], [key]: val };
      return arr;
    });
  };
  const addHeader = () => setHeaders((prev) => [...prev, { key: "", value: "" }]);
  const removeHeader = (i: number) => setHeaders((prev) => prev.filter((_, idx) => idx !== i));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanedHeaders = (headers || []).filter(h => h.key?.trim());
    const payloadBase = {
      name: name?.trim(),
      description: description?.trim() || undefined,
      targetUrl: targetUrl?.trim(),
      httpMethod,
      isActive,
      events: events?.length ? events : ["*"],
      headers: cleanedHeaders,
      verifySSL,
      signing: {
        algorithm: "HMAC-SHA256" as const,
        headerName: sigHeaderName || "x-mh-signature",
        timestampHeaderName: tsHeaderName || "x-mh-timestamp",
        version: "v1" as const,
      },
      retry: {
        maxAttempts: Number(maxAttempts) || 3,
        strategy,
        baseBackoffSec: Number(baseBackoffSec) || 30,
        timeoutMs: Number(timeoutMs) || 15000,
      },
    };

    let payload: WebhookEndpointCreatePayload | WebhookEndpointUpdatePayload;
    if (isEdit) {
      payload = { ...payloadBase, rotateSecret } as WebhookEndpointUpdatePayload;
    } else {
      payload = payloadBase as WebhookEndpointCreatePayload;
    }

    await onSubmit(payload, initial?._id);
  };

  return (
    <Form onSubmit={handleSubmit}>
      {/* base */}
      <Row>
        <Col style={{ gridColumn: "span 2" }}>
          <Label>{t("name", "Name")}</Label>
          <Input value={name} onChange={(e)=>setName(e.target.value)} placeholder="Orders Sink" required />
        </Col>

        <Col>
          <Label>{t("httpMethod", "HTTP Method")}</Label>
          <Select value={httpMethod} onChange={(e)=>setHttpMethod(e.target.value as "POST" | "PUT")}>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
          </Select>
        </Col>

        <Col>
          <Label>{t("isActive","Active?")}</Label>
          <CheckRow>
            <input type="checkbox" checked={isActive} onChange={(e)=>setIsActive(e.target.checked)} />
            <span>{isActive ? t("yes","Yes") : t("no","No")}</span>
          </CheckRow>
        </Col>
      </Row>

      <Row>
        <Col style={{ gridColumn: "span 3" }}>
          <Label>{t("targetUrl","Target URL")}</Label>
          <Input value={targetUrl} onChange={(e)=>setTargetUrl(e.target.value)} placeholder="https://example.com/hooks/in" required />
        </Col>
        <Col>
          <Label>{t("verifySSL","Verify SSL")}</Label>
          <CheckRow>
            <input type="checkbox" checked={verifySSL} onChange={(e)=>setVerifySSL(e.target.checked)} />
            <span>{verifySSL ? t("yes","Yes") : t("no","No")}</span>
          </CheckRow>
        </Col>
      </Row>

      <Row>
        <Col style={{ gridColumn: "span 4" }}>
          <Label>{t("description","Description")}</Label>
          <TextArea rows={3} value={description} onChange={(e)=>setDescription(e.target.value)} placeholder={t("desc_ph","Örn: Order/payments webhook sink")} />
        </Col>
      </Row>

      {/* events */}
      <BlockTitle>{t("events","Events")}</BlockTitle>
      <Row>
        <Col style={{ gridColumn: "span 4" }}>
          <Chips>
            {ALL_EVENTS.map((ev) => (
              <Chip
                key={ev}
                $active={events.includes(ev)}
                type="button"
                onClick={() => toggleEvent(ev)}
                aria-pressed={events.includes(ev)}
              >
                {ev}
              </Chip>
            ))}
          </Chips>
          <Hint>{t("events_hint","‘*’ tüm eventleri dinler. Bir veya daha fazla spesifik event seçebilirsiniz.")}</Hint>
        </Col>
      </Row>

      {/* headers */}
      <BlockTitle>{t("headers","Custom Headers")}</BlockTitle>
      <Row>
        <Col style={{ gridColumn: "span 4" }}>
          <KVWrap>
            {headers.map((h, i) => (
              <KVRow key={`h-${i}`}>
                <Input
                  placeholder="Key (e.g. X-App)"
                  value={h.key}
                  onChange={(e)=>updateHeader(i,"key",e.target.value)}
                />
                <Input
                  placeholder="Value (e.g. MetaHub)"
                  value={h.value}
                  onChange={(e)=>updateHeader(i,"value",e.target.value)}
                />
                <SmallBtn type="button" onClick={()=>removeHeader(i)} aria-label="remove">
                  {t("remove","Remove")}
                </SmallBtn>
              </KVRow>
            ))}
            <SmallBtn type="button" onClick={addHeader}>{t("addHeader","Add header")}</SmallBtn>
          </KVWrap>
        </Col>
      </Row>

      {/* advanced */}
      {advancedOpen && (
        <>
          <Divider />
          <SectionTitle>{t("signing","Signing")}</SectionTitle>
          <Row>
            <Col>
              <Label>{t("signatureHeader","Signature Header Name")}</Label>
              <Input value={sigHeaderName} onChange={(e)=>setSigHeaderName(e.target.value)} placeholder="x-mh-signature" />
            </Col>
            <Col>
              <Label>{t("timestampHeader","Timestamp Header Name")}</Label>
              <Input value={tsHeaderName} onChange={(e)=>setTsHeaderName(e.target.value)} placeholder="x-mh-timestamp" />
            </Col>
            {isEdit && (
              <Col style={{ alignSelf: "end" }}>
                <CheckRow>
                  <input type="checkbox" checked={rotateSecret} onChange={(e)=>setRotateSecret(e.target.checked)} />
                  <span>{t("rotateSecretOnSave","Kaydederken secret’ı yenile")}</span>
                </CheckRow>
              </Col>
            )}
          </Row>

          <Divider />
          <SectionTitle>{t("retryPolicy","Retry Policy")}</SectionTitle>
          <Row>
            <Col>
              <Label>{t("maxAttempts","Max Attempts")}</Label>
              <Input type="number" min={1} max={10} value={maxAttempts} onChange={(e)=>setMaxAttempts(Number(e.target.value)||1)} />
            </Col>
            <Col>
              <Label>{t("strategy","Strategy")}</Label>
              <Select value={strategy} onChange={(e)=>setStrategy(e.target.value as any)}>
                <option value="exponential">{t("exponential","exponential")}</option>
                <option value="fixed">{t("fixed","fixed")}</option>
              </Select>
            </Col>
            <Col>
              <Label>{t("baseBackoffSec","Base Backoff (sec)")}</Label>
              <Input type="number" min={1} max={3600} value={baseBackoffSec} onChange={(e)=>setBaseBackoffSec(Number(e.target.value)||1)} />
            </Col>
            <Col>
              <Label>{t("timeoutMs","HTTP Timeout (ms)")}</Label>
              <Input type="number" min={1000} max={120000} step={500} value={timeoutMs} onChange={(e)=>setTimeoutMs(Number(e.target.value)||15000)} />
            </Col>
          </Row>
        </>
      )}

      {/* Actions */}
      <Actions>
        <Secondary type="button" onClick={onCancel}>{t("cancel","Cancel")}</Secondary>
        <Primary type="submit">{isEdit ? t("update","Update") : t("create","Create")}</Primary>
      </Actions>
    </Form>
  );
}

/* ---- styled ---- */
const Form = styled.form`display:flex;flex-direction:column;gap:${({theme})=>theme.spacings.md};`;
const Row = styled.div`
  display:grid;grid-template-columns:repeat(4,1fr);gap:${({theme})=>theme.spacings.md};
  ${({theme})=>theme.media.tablet}{grid-template-columns:repeat(2,1fr);}
  ${({theme})=>theme.media.mobile}{grid-template-columns:1fr;}
`;
const Col = styled.div`display:flex;flex-direction:column;gap:${({theme})=>theme.spacings.xs};min-width:0;`;
const SectionTitle = styled.h3`font-size:${({theme})=>theme.fontSizes.md};margin:${({theme})=>theme.spacings.xs} 0;`;
const Divider = styled.hr`
  border: 0;
  border-top: ${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.borderBright};
  margin: ${({theme})=>theme.spacings.md} 0;
`;
const BlockTitle = styled.h4`font-size:${({theme})=>theme.fontSizes.sm};margin:${({theme})=>theme.spacings.sm} 0 ${(({theme})=>theme.spacings.xs)};`;
const Label = styled.label`font-size:${({theme})=>theme.fontSizes.xsmall};color:${({theme})=>theme.colors.textSecondary};`;
const Input = styled.input`
  padding:10px 12px;border-radius:${({theme})=>theme.radii.md};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.inputBorder};
  background:${({theme})=>theme.inputs.background};color:${({theme})=>theme.inputs.text};
  min-width:0;
`;
const TextArea = styled.textarea`
  padding:10px 12px;border-radius:${({theme})=>theme.radii.md};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.inputBorder};
  background:${({theme})=>theme.inputs.background};color:${({theme})=>theme.inputs.text};
  resize:vertical;
`;
const Select = styled.select`
  padding:10px 12px;border-radius:${({theme})=>theme.radii.md};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.inputBorder};
  background:${({theme})=>theme.inputs.background};color:${({theme})=>theme.inputs.text};
`;
const CheckRow = styled.label`display:flex;gap:${({theme})=>theme.spacings.xs};align-items:center;`;
const KVWrap = styled.div`display:flex;flex-direction:column;gap:${({theme})=>theme.spacings.xs};`;
const KVRow = styled.div`display:grid;grid-template-columns:1fr 1fr auto;gap:${({theme})=>theme.spacings.xs};`;
const Chips = styled.div`display:flex;flex-wrap:wrap;gap:${({theme})=>theme.spacings.xs};`;
const Chip = styled.button<{ $active?: boolean }>`
  padding:6px 10px;border-radius:${({theme})=>theme.radii.pill};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.border};
  background:${({$active,theme})=>$active?theme.colors.primaryLight:theme.colors.cardBackground};
  color:${({theme})=>theme.colors.text}; cursor:pointer;
`;
const Hint = styled.p`
  margin-top: 6px;
  color: ${({theme})=>theme.colors.textSecondary};
  font-size: ${({theme})=>theme.fontSizes.xsmall};
`;
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

const SmallBtn = styled.button`
  background:${({theme})=>theme.buttons.secondary.background};
  color:${({theme})=>theme.buttons.secondary.text};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.border};
  padding:6px 10px;border-radius:${({theme})=>theme.radii.md};cursor:pointer;
  font-size:${({theme})=>theme.fontSizes.xsmall};
`;
