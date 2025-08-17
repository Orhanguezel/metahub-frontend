"use client";
import React, { useState } from "react";
import styled from "styled-components";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "../../locales";
import { SUPPORTED_LOCALES } from "@/i18n";
import { completeLocales } from "@/utils/completeLocales";

type NestedValue = { label: Record<string, string>; url: string };

interface NestedValueEditorProps {
  value: Record<string, any>;
  setValue: (val: Record<string, any>) => void;
  supportedLocales?: readonly string[];
}

const NestedValueEditor: React.FC<NestedValueEditorProps> = ({
  value,
  setValue,
  supportedLocales = SUPPORTED_LOCALES,
}) => {
  const { t } = useI18nNamespace("settings", translations);
  const [newField, setNewField] = useState<string>("");

  const handleAddField = () => {
    const k = newField.trim();
    if (!k) return;
    if (value[k]) {
      alert(t("fieldExists", "This field already exists."));
      return;
    }
    setValue({ ...value, [k]: { label: completeLocales({}), url: "" } });
    setNewField("");
  };

  const handleRemoveField = (k: string) => {
    const v = { ...value };
    delete v[k];
    setValue(v);
  };

  const handleLabelChange = (k: string, lang: string, val: string) => {
    setValue({
      ...value,
      [k]: {
        ...value[k],
        label: { ...completeLocales(value[k]?.label), [lang]: val },
      },
    });
  };

  const handleUrlChange = (k: string, url: string) => {
    setValue({ ...value, [k]: { ...value[k], url } });
  };

  const getLabelObj = (fieldValue: NestedValue) => completeLocales(fieldValue?.label);

  return (
    <Wrap>
      <Row>
        <Input
          type="text"
          value={newField}
          placeholder={t("enterFieldName", "Enter field name")}
          onChange={(e) => setNewField(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddField(); } }}
        />
        <Primary type="button" onClick={handleAddField}>
          + {t("addField", "Add Field")}
        </Primary>
      </Row>

      {Object.keys(value).length === 0 && (
        <Empty>{t("noFields", "No fields added yet.")}</Empty>
      )}

      {Object.entries(value).map(([fieldKey, fieldValue]) => {
        const label = getLabelObj(fieldValue as NestedValue);
        const url = (fieldValue as NestedValue).url || "";
        return (
          <Block key={fieldKey}>
            <Head>
              <Title>{fieldKey}</Title>
              <Danger type="button" onClick={() => handleRemoveField(fieldKey)} title={t("removeField","Remove Field")}>❌</Danger>
            </Head>

            {supportedLocales.map((lang) => (
              <LangRow key={lang}>
                <Small>{lang.toUpperCase()}:</Small>
                <Input
                  type="text"
                  value={label[lang] || ""}
                  onChange={(e) => handleLabelChange(fieldKey, lang, e.target.value)}
                  placeholder={t(`label${lang.toUpperCase()}`, `Label (${lang})`)}
                />
              </LangRow>
            ))}

            <LangRow>
              <Small>{t("url", "URL")}:</Small>
              <Input
                type="text"
                value={url}
                onChange={(e) => handleUrlChange(fieldKey, e.target.value)}
                placeholder={t("urlPlaceholder", "/path")}
              />
            </LangRow>
          </Block>
        );
      })}
    </Wrap>
  );
};

export default NestedValueEditor;

/* styled (aynı patern) */
const Wrap = styled.div`display:flex;flex-direction:column;gap:${({theme})=>theme.spacings.md};`;
const Row = styled.div`display:flex;gap:${({theme})=>theme.spacings.sm};align-items:center;`;
const Block = styled.section`
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.border};
  padding:${({theme})=>theme.spacings.sm};
  border-radius:${({theme})=>theme.radii.sm};
  background:${({theme})=>theme.colors.backgroundAlt};
`;
const Head = styled.div`display:flex;justify-content:space-between;align-items:center;margin-bottom:${({theme})=>theme.spacings.sm};`;
const Title = styled.strong`font-size:${({theme})=>theme.fontSizes.sm};color:${({theme})=>theme.colors.textPrimary};`;
const LangRow = styled.div`display:flex;align-items:center;gap:${({theme})=>theme.spacings.sm};margin:${({theme})=>theme.spacings.xs} 0;`;
const Small = styled.label`width:40px;font-size:${({theme})=>theme.fontSizes.xs};color:${({theme})=>theme.colors.textSecondary};`;
const Input = styled.input`
  flex:1;padding:${({theme})=>theme.spacings.sm};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.border};
  border-radius:${({theme})=>theme.radii.sm};
  background:${({theme})=>theme.inputs.background};
  color:${({theme})=>theme.inputs.text};
  font-size:${({theme})=>theme.fontSizes.sm};
`;
const Primary = styled.button`
  padding:${({theme})=>theme.spacings.sm} ${({theme})=>theme.spacings.md};
  background:${({theme})=>theme.buttons.primary.background};
  color:${({theme})=>theme.buttons.primary.text};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.buttons.primary.backgroundHover};
  border-radius:${({theme})=>theme.radii.sm};
  cursor:pointer;
`;
const Danger = styled.button`
  background:none;border:none;color:${({theme})=>theme.colors.danger};
  font-size:1.1rem;cursor:pointer;transition:opacity .15s; &:hover{opacity:.85;}
`;
const Empty = styled.div`font-size:${({theme})=>theme.fontSizes.sm};color:${({theme})=>theme.colors.textSecondary};text-align:center;`;
