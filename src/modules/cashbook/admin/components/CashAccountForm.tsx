"use client";
import styled from "styled-components";
import { useState } from "react";
import { useAppDispatch } from "@/store/hooks";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "@/modules/cashbook/locales";
import { createAccount, updateAccount } from "@/modules/cashbook/slice/cashbookSlice";
import type { ICashAccount, CashAccountType, CurrencyCode } from "@/modules/cashbook/types";

interface Props {
  initial?: ICashAccount;
  onClose: () => void;
  onSaved?: () => void;
}

/** Backend ile aynı kurala uygun görsel yardımcı */
const toUpperSnake = (s: string) =>
  s?.toString().trim().replace(/\s+/g, "_").replace(/[^A-Za-z0-9_]/g, "").toUpperCase();

export default function CashAccountForm({ initial, onClose, onSaved }: Props) {
  const { t } = useI18nNamespace("cashbook", translations);
  const dispatch = useAppDispatch();

  const isEdit = Boolean(initial?._id);

  const [code, setCode] = useState(initial?.code || "");
  const [name, setName] = useState(initial?.name || "");
  const [type, setType] = useState<CashAccountType>(initial?.type || "cash");
  const [currency, setCurrency] = useState<CurrencyCode>(initial?.currency || "EUR");
  const [openingBalance, setOpeningBalance] = useState<number>(Number(initial?.openingBalance ?? 0));
  const [isActive, setIsActive] = useState<boolean>(initial?.isActive ?? true);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isEdit && initial) {
      await dispatch(
        updateAccount({
          id: initial._id,
          changes: { code, name, type, currency, isActive },
        })
      )
        .unwrap()
        .catch(() => {});
    } else {
      await dispatch(
        createAccount({
          code,
          name,
          type,
          currency,
          openingBalance,
          isActive,
        })
      )
        .unwrap()
        .catch(() => {});
    }
    onSaved?.();
  };

  const helpId = "acc-open-help";

  return (
    <Form onSubmit={onSubmit} aria-labelledby="acc-form-title">
      <VisuallyHidden as="h2" id="acc-form-title">
        {isEdit ? t("actions.update", "Update") : t("actions.create", "Create")} — {t("sections.accounts", "Accounts")}
      </VisuallyHidden>

      <Row>
        <Col>
          <Label htmlFor="acc-code">{t("acc.code", "Code")}</Label>
          <Input
            id="acc-code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onBlur={(e) => setCode(toUpperSnake(e.target.value))}
            placeholder="MAIN_CASH"
            required
            autoComplete="off"
          />
        </Col>

        <Col>
          <Label htmlFor="acc-name">{t("acc.name", "Name")}</Label>
          <Input id="acc-name" value={name} onChange={(e) => setName(e.target.value)} required />
        </Col>

        <Col>
          <Label htmlFor="acc-type">{t("acc.type", "Type")}</Label>
          <Select
            id="acc-type"
            value={type}
            onChange={(e) => setType(e.target.value as CashAccountType)}
          >
            <option value="cash">{t("acc.t.cash", "Cash")}</option>
            <option value="bank">{t("acc.t.bank", "Bank")}</option>
            <option value="other">{t("acc.t.other", "Other")}</option>
          </Select>
        </Col>

        <Col>
          <Label htmlFor="acc-currency">{t("acc.currency", "Currency")}</Label>
          <Select
            id="acc-currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
          >
            <option value="EUR">EUR</option>
            <option value="USD">USD</option>
            <option value="TRY">TRY</option>
          </Select>
        </Col>
      </Row>

      <Row>
        <Col>
          <Label htmlFor="acc-opening">{t("acc.openingBalance", "Opening Balance")}</Label>
          <Input
            id="acc-opening"
            type="number"
            step="0.01"
            min={0}
            value={openingBalance}
            onChange={(e) => setOpeningBalance(Number(e.target.value))}
            disabled={isEdit} /* edit’te başlangıç bakiyesi kilitli */
            aria-describedby={isEdit ? helpId : undefined}
          />
        </Col>

        <Col>
          <Label htmlFor="acc-active">{t("acc.active", "Active")}</Label>
          <CheckboxWrap htmlFor="acc-active">
            <input
              id="acc-active"
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
            <span>{isActive ? t("common.yes", "Yes") : t("common.no", "No")}</span>
          </CheckboxWrap>
        </Col>

        {isEdit && (
          <Col span2>
            <InfoText id={helpId}>{t("acc.openingLocked", "Opening balance is set on create.")}</InfoText>
          </Col>
        )}
      </Row>

      <Actions>
        <Secondary type="button" onClick={onClose}>
          {t("actions.cancel", "Cancel")}
        </Secondary>
        <Primary type="submit">
          {isEdit ? t("actions.update", "Update") : t("actions.create", "Create")}
        </Primary>
      </Actions>
    </Form>
  );
}

/* ---- styled (theme) ---- */
const VisuallyHidden = styled.div`
  border: 0; clip: rect(0 0 0 0); height: 1px; margin: -1px; overflow: hidden;
  padding: 0; position: absolute; width: 1px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacings.md};
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: ${({ theme }) => theme.spacings.md};
  ${({ theme }) => theme.media.tablet}{ grid-template-columns: repeat(2, 1fr); }
  ${({ theme }) => theme.media.mobile}{ grid-template-columns: 1fr; }
`;

const Col = styled.div<{ span2?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacings.xs};
  ${({ span2 }) => span2 && `grid-column: span 2;`}
`;

const Label = styled.label`
  font-size: ${({ theme }) => theme.fontSizes.xsmall};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Input = styled.input`
  padding: 10px 12px;
  border-radius: ${({ theme }) => theme.radii.md};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.inputBorder};
  background: ${({ theme }) => theme.inputs.background};
  color: ${({ theme }) => theme.inputs.text};
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.inputs.borderFocus};
    box-shadow: ${({ theme }) => theme.colors.shadowHighlight};
    background: ${({ theme }) => theme.colors.inputBackgroundFocus};
  }
`;

const Select = styled.select`
  padding: 10px 12px;
  border-radius: ${({ theme }) => theme.radii.md};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.inputBorder};
  background: ${({ theme }) => theme.inputs.background};
  color: ${({ theme }) => theme.inputs.text};
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.inputs.borderFocus};
    box-shadow: ${({ theme }) => theme.colors.shadowHighlight};
    background: ${({ theme }) => theme.colors.inputBackgroundFocus};
  }
`;

const CheckboxWrap = styled.label`
  display: flex;
  gap: ${({ theme }) => theme.spacings.xs};
  align-items: center;
`;

const InfoText = styled.div`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.fontSizes.xsmall};
  padding-top: ${({ theme }) => theme.spacings.xs};
`;

const Actions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacings.sm};
  justify-content: flex-end;
  flex-wrap: wrap;
`;

const Primary = styled.button`
  background: ${({ theme }) => theme.buttons.primary.background};
  color: ${({ theme }) => theme.buttons.primary.text};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.buttons.primary.backgroundHover};
  padding: 8px 14px;
  border-radius: ${({ theme }) => theme.radii.md};
  cursor: pointer;
`;

const Secondary = styled.button`
  background: ${({ theme }) => theme.buttons.secondary.background};
  color: ${({ theme }) => theme.buttons.secondary.text};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  padding: 8px 14px;
  border-radius: ${({ theme }) => theme.radii.md};
  cursor: pointer;
`;
