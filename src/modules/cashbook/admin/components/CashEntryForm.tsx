"use client";
import styled from "styled-components";
import { useState } from "react";
import { useAppDispatch } from "@/store/hooks";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "@/modules/cashbook/locales";
import { createEntry } from "@/modules/cashbook/slice/cashbookSlice";
import type { ICashAccount, EntryDirection } from "@/modules/cashbook/types";

interface Props {
  accounts: ICashAccount[];
  onClose: () => void;
  onSaved?: () => void;
}

export default function CashEntryForm({ accounts, onClose, onSaved }: Props) {
  const { t } = useI18nNamespace("cashbook", translations);
  const dispatch = useAppDispatch();

  const [accountId, setAccountId] = useState<string>(accounts[0]?._id || "");
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [direction, setDirection] = useState<EntryDirection>("in");
  const [amount, setAmount] = useState<number>(0);
  const [description, setDescription] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [tags, setTags] = useState<string>("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await dispatch(
      createEntry({
        accountId,
        date: new Date(date).toISOString(),
        direction,
        amount: Math.max(0, Number(amount) || 0),
        description: description || undefined,
        category: category || undefined,
        tags: tags ? tags.split(",").map((s) => s.trim()).filter(Boolean) : [],
      })
    )
      .unwrap()
      .catch(() => {});
    onSaved?.();
  };

  return (
    <Form onSubmit={onSubmit} aria-labelledby="entry-form-title">
      <VisuallyHidden as="h2" id="entry-form-title">
        {t("actions.create", "Create")} — {t("sections.entries", "Entries")}
      </VisuallyHidden>

      <Row>
        <Col>
          <Label htmlFor="ce-account">{t("entry.account", "Account")}</Label>
          <Select
            id="ce-account"
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            required
          >
            {accounts.map((a) => (
              <option key={a._id} value={a._id}>
                {a.code} — {a.name} ({a.currency})
              </option>
            ))}
          </Select>
        </Col>

        <Col>
          <Label htmlFor="ce-date">{t("entry.date", "Date")}</Label>
          <Input
            id="ce-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </Col>

        <Col>
          <Label htmlFor="ce-direction">{t("entry.direction", "Direction")}</Label>
          <Select
            id="ce-direction"
            value={direction}
            onChange={(e) => setDirection(e.target.value as EntryDirection)}
          >
            <option value="in">{t("entry.in", "In")}</option>
            <option value="out">{t("entry.out", "Out")}</option>
          </Select>
        </Col>

        <Col>
          <Label htmlFor="ce-amount">{t("entry.amount", "Amount")}</Label>
          <Input
            id="ce-amount"
            type="number"
            min={0}
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            required
            inputMode="decimal"
          />
        </Col>
      </Row>

      <Row>
        <Col>
          <Label htmlFor="ce-desc">{t("entry.description", "Description")}</Label>
          <Input id="ce-desc" value={description} onChange={(e) => setDescription(e.target.value)} />
        </Col>

        <Col>
          <Label htmlFor="ce-cat">{t("entry.category", "Category")}</Label>
          <Input id="ce-cat" value={category} onChange={(e) => setCategory(e.target.value)} />
        </Col>

        <Col span2>
          <Label htmlFor="ce-tags">{t("entry.tags", "Tags")}</Label>
          <Input
            id="ce-tags"
            placeholder="fuel,material"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            aria-description={t("entry.tagsHelp", "Comma separated")}
          />
        </Col>
      </Row>

      <Actions>
        <Secondary type="button" onClick={onClose}>
          {t("actions.cancel", "Cancel")}
        </Secondary>
        <Primary type="submit">{t("actions.create", "Create")}</Primary>
      </Actions>
    </Form>
  );
}

/* styled (theme) */
const VisuallyHidden = styled.div`
  border: 0; clip: rect(0 0 0 0); height: 1px; margin: -1px; overflow: hidden;
  padding: 0; position: absolute; width: 1px;
`;

const Form = styled.form`
  display: flex; flex-direction: column; gap: ${({ theme }) => theme.spacings.md};
`;

const Row = styled.div`
  display: grid; gap: ${({ theme }) => theme.spacings.md};
  grid-template-columns: repeat(4, 1fr);
  ${({ theme }) => theme.media.tablet}{ grid-template-columns: repeat(2, 1fr); }
  ${({ theme }) => theme.media.mobile}{ grid-template-columns: 1fr; }
`;

const Col = styled.div<{ span2?: boolean }>`
  display: flex; flex-direction: column; gap: ${({ theme }) => theme.spacings.xs};
  ${({ span2 }) => span2 && `grid-column: span 2;`}
`;

const Label = styled.label`
  font-size: ${({ theme }) => theme.fontSizes.xsmall};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Input = styled.input`
  padding: 10px 12px; border-radius: ${({ theme }) => theme.radii.md};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.inputBorder};
  background: ${({ theme }) => theme.inputs.background}; color: ${({ theme }) => theme.inputs.text};
  &:focus{ outline: none; border-color: ${({ theme }) => theme.inputs.borderFocus};
    box-shadow: ${({ theme }) => theme.colors.shadowHighlight};
    background: ${({ theme }) => theme.colors.inputBackgroundFocus}; }
`;

const Select = styled.select`
  padding: 10px 12px; border-radius: ${({ theme }) => theme.radii.md};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.inputBorder};
  background: ${({ theme }) => theme.inputs.background}; color: ${({ theme }) => theme.inputs.text};
  &:focus{ outline: none; border-color: ${({ theme }) => theme.inputs.borderFocus};
    box-shadow: ${({ theme }) => theme.colors.shadowHighlight};
    background: ${({ theme }) => theme.colors.inputBackgroundFocus}; }
`;

const Actions = styled.div`
  display: flex; gap: ${({ theme }) => theme.spacings.sm}; justify-content: flex-end;
`;

const Primary = styled.button`
  background: ${({ theme }) => theme.buttons.primary.background};
  color: ${({ theme }) => theme.buttons.primary.text};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.buttons.primary.backgroundHover};
  padding: 8px 14px; border-radius: ${({ theme }) => theme.radii.md}; cursor: pointer;
`;

const Secondary = styled.button`
  background: ${({ theme }) => theme.buttons.secondary.background};
  color: ${({ theme }) => theme.buttons.secondary.text};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  padding: 8px 14px; border-radius: ${({ theme }) => theme.radii.md}; cursor: pointer;
`;
