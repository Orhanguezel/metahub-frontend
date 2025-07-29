import React from "react";
import { Select } from "@/modules/users/styles/AccountStyles";
import { COUNTRY_OPTIONS, CountryCode } from "@/types/common";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { accountTranslations } from "@/modules/users";

type Props = {
  value: CountryCode;
  onChange: (code: CountryCode) => void;
};

const CountrySelector: React.FC<Props> = ({ value, onChange }) => {
  const { t } = useI18nNamespace("account", accountTranslations);

  return (
    <Select value={value} onChange={e => onChange(e.target.value as CountryCode)}>
      {COUNTRY_OPTIONS.map(code => (
        <option key={code} value={code}>
          {t(`countries.${code}`)}
        </option>
      ))}
    </Select>
  );
};

export default CountrySelector;
