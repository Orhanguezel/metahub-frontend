"use client";
import React, { useState, ChangeEvent, FormEvent } from "react";
import styled from "styled-components";
import { useAppDispatch } from "@/store/hooks";
import { batchUpdateModuleSetting } from "@/modules/adminmodules/slices/moduleMaintenanceSlice";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

const BatchUpdateModuleForm: React.FC = () => {
  const { t } = useTranslation("adminModules");
  const dispatch = useAppDispatch();
  const [module, setModule] = useState<string>("");
  const [field, setField] = useState<string>("enabled");
  const [value, setValue] = useState<boolean | string | number>(true);
  const [loading, setLoading] = useState<boolean>(false);

  // Alan tipine göre input'u değiştir
  const getInput = () => {
    if (field === "roles") {
      return (
        <StyledInput
          type="text"
          placeholder={t("roles", "Roles (comma separated)")}
          value={typeof value === "string" ? value : ""}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setValue(e.target.value)
          }
        />
      );
    }
    if (field === "order") {
      return (
        <StyledInput
          type="number"
          placeholder={t("order", "Order")}
          value={typeof value === "number" ? value : ""}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setValue(Number(e.target.value))
          }
        />
      );
    }
    // Booleanlar için (enabled, visibleInSidebar, ...)
    return (
      <StyledSelect
        value={value ? "1" : "0"}
        onChange={(e: ChangeEvent<HTMLSelectElement>) =>
          setValue(e.target.value === "1")
        }
      >
        <option value="1">{t("yes", "Yes")}</option>
        <option value="0">{t("no", "No")}</option>
      </StyledSelect>
    );
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      let sendValue: boolean | string | number | string[] = value;
      if (field === "roles" && typeof value === "string") {
        sendValue = value
          .split(",")
          .map((r) => r.trim())
          .filter(Boolean);
      }
      await dispatch(
        batchUpdateModuleSetting({
          module,
          update: { [field]: sendValue },
        })
      ).unwrap();
      setModule("");
      toast.success(t("batchUpdateSuccess", "Batch update completed!"));
    } catch (err: any) {
      toast.error(err?.message || "Batch update failed!");
    }
    setLoading(false);
  };

  return (
    <PanelCard>
      <Form onSubmit={handleSubmit}>
        <Title>{t("batchUpdate", "Batch Update Module Setting")}</Title>
        <Row>
          <StyledInput
            value={module}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setModule(e.target.value)
            }
            placeholder={t("moduleName", "Module Name")}
            required
          />
          <StyledSelect
            value={field}
            onChange={(e: ChangeEvent<HTMLSelectElement>) =>
              setField(e.target.value)
            }
          >
            <option value="enabled">{t("enabled", "Enabled")}</option>
            <option value="visibleInSidebar">
              {t("visibleInSidebar", "Sidebar")}
            </option>
            <option value="useAnalytics">
              {t("useAnalytics", "Analytics")}
            </option>
            <option value="showInDashboard">
              {t("showInDashboard", "Dashboard")}
            </option>
            <option value="roles">{t("roles", "Roles")}</option>
            <option value="order">{t("order", "Order")}</option>
          </StyledSelect>
          {getInput()}
          <SubmitButton type="submit" disabled={loading || !module}>
            {loading ? t("saving", "Saving...") : t("update", "Update")}
          </SubmitButton>
        </Row>
      </Form>
    </PanelCard>
  );
};

export default BatchUpdateModuleForm;

// --- Styles ---
const PanelCard = styled.div`
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.09);
  padding: 22px 22px 16px 22px;
  min-width: 270px;
  flex: 1 1 270px;
  margin-bottom: 18px;
  display: flex;
  flex-direction: column;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const Title = styled.div`
  font-weight: 700;
  font-size: 1.08em;
  margin-bottom: 14px;
  color: ${({ theme }) => theme.colors.text};
`;

const Row = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
  @media (max-width: 700px) {
    flex-direction: column;
    gap: 10px;
    align-items: stretch;
  }
`;

const StyledInput = styled.input`
  padding: 7px 13px;
  border: 1.1px solid #b4b7c9;
  border-radius: 7px;
  font-size: 1em;
  min-width: 110px;
  background: ${({ theme }) => theme.inputs.background};
  color: ${({ theme }) => theme.inputs.text};
`;

const StyledSelect = styled.select`
  padding: 7px 12px;
  border-radius: 7px;
  border: 1.1px solid #b4b7c9;
  font-size: 1em;
  min-width: 110px;
  background: ${({ theme }) => theme.inputs.background};
  color: ${({ theme }) => theme.inputs.text};
`;

const SubmitButton = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: #fff;
  border: none;
  border-radius: 7px;
  padding: 8px 22px;
  font-size: 1em;
  font-weight: 600;
  cursor: pointer;
  min-width: 120px;
  transition: background 0.15s;
  &:hover,
  &:focus {
    background: ${({ theme }) => theme.colors.primaryHover || "#1bbfff"};
  }
`;
