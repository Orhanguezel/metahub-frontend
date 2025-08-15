"use client";
import styled from "styled-components";
import { Card, Sub, Label, Select, Small, Check } from "../FormUI";
import { Opt } from "../formTypes";

type T = (k: string, d?: string) => string;

export default function OperationsSection({
  t, employeeOpts, planOpts,
  selectedEmployees, setSelectedEmployees,
  supervisorId, setSupervisorId,
  cleaningPlanId, setCleaningPlanId,
  trashPlanId, setTrashPlanId,
  cashDay, setCashDay,
  notifyJobCompleted, setNotifyJobCompleted,
  notifyManagerOnAssigned, setNotifyManagerOnAssigned,
  notifyEmployeeOnAssigned, setNotifyEmployeeOnAssigned,
}: {
  t: T;
  employeeOpts: Opt[];
  planOpts: Opt[];
  selectedEmployees: string[]; setSelectedEmployees: (ids: string[]) => void;
  supervisorId: string; setSupervisorId: (id: string) => void;
  cleaningPlanId: string; setCleaningPlanId: (id: string) => void;
  trashPlanId: string; setTrashPlanId: (id: string) => void;
  cashDay?: number; setCashDay: (v: number | undefined) => void;
  notifyJobCompleted: boolean; setNotifyJobCompleted: (b: boolean) => void;
  notifyManagerOnAssigned: boolean; setNotifyManagerOnAssigned: (b: boolean) => void;
  notifyEmployeeOnAssigned: boolean; setNotifyEmployeeOnAssigned: (b: boolean) => void;
}) {
  return (
    <Card>
      <Sub>{t("form.opsBlock","Operations")}</Sub>

      {/* Plans */}
      <Grid>
        <div>
          <Label>{t("form.cleaningPlan","Cleaning plan")}</Label>
          <Select value={cleaningPlanId} onChange={(e)=>setCleaningPlanId(e.target.value)}>
            <option value="">{t("form.planOptional","Plan (optional)")}</option>
            {planOpts.map((o)=> <option key={o.id} value={o.id}>{o.label}</option>)}
          </Select>
        </div>
        <div>
          <Label>{t("form.trashPlan","Trash plan")}</Label>
          <Select value={trashPlanId} onChange={(e)=>setTrashPlanId(e.target.value)}>
            <option value="">{t("form.planOptional","Plan (optional)")}</option>
            {planOpts.map((o)=> <option key={o.id} value={o.id}>{o.label}</option>)}
          </Select>
        </div>
      </Grid>

      {/* Team / Supervisor / Cash day */}
      <Grid style={{ marginTop: 12 }}>
        <div className="full-sm">
          <Label>{t("form.team","Team (Employees)")}</Label>
          <MultiSelect
            multiple
            value={selectedEmployees}
            onChange={(e)=>setSelectedEmployees(Array.from(e.target.selectedOptions).map(o=>o.value))}
          >
            {employeeOpts.map((e)=> (
              <option key={e.id} value={e.id}>
                {e.label}{e.sub ? ` — ${e.sub}` : ""}
              </option>
            ))}
          </MultiSelect>
          <Small>
            {t("form.multiselectHint","Hold Ctrl/Cmd to multi-select")}
            {selectedEmployees.length > 0 ? ` • ${selectedEmployees.length} ${t("form.selected","selected")}` : ""}
          </Small>
        </div>

        <div>
          <Label>{t("form.supervisor","Supervisor")}</Label>
          <Select value={supervisorId} onChange={(e)=>setSupervisorId(e.target.value)}>
            <option value="">{t("form.supervisorAny","Select supervisor")}</option>
            {employeeOpts.map((e)=> <option key={e.id} value={e.id}>{e.label}</option>)}
          </Select>
        </div>

        <div>
          <Label>{t("form.cashDay","Cash collection day")}</Label>
          <Select
            value={cashDay === undefined ? "" : String(cashDay)}
            onChange={(e)=>setCashDay(e.target.value ? Number(e.target.value) : undefined)}
          >
            <option value="">{t("form.any","Any")}</option>
            {Array.from({length:31}, (_,i)=>i+1).map((d)=> <option key={d} value={d}>{d}</option>)}
          </Select>
        </div>
      </Grid>

      {/* Notifications */}
      <InlineChecks style={{ marginTop: 8 }}>
        <Check>
          <input
            id="ops-notify-completed"
            type="checkbox"
            checked={notifyJobCompleted}
            onChange={(e)=>setNotifyJobCompleted(e.target.checked)}
          />
          <label htmlFor="ops-notify-completed">
            {t("form.notify.completed","Notify manager on job completed")}
          </label>
        </Check>

        <Check>
          <input
            id="ops-notify-manager-assigned"
            type="checkbox"
            checked={notifyManagerOnAssigned}
            onChange={(e)=>setNotifyManagerOnAssigned(e.target.checked)}
          />
          <label htmlFor="ops-notify-manager-assigned">
            {t("form.notify.managerAssigned","Notify manager on job assigned")}
          </label>
        </Check>

        <Check>
          <input
            id="ops-notify-employee-assigned"
            type="checkbox"
            checked={notifyEmployeeOnAssigned}
            onChange={(e)=>setNotifyEmployeeOnAssigned(e.target.checked)}
          />
          <label htmlFor="ops-notify-employee-assigned">
            {t("form.notify.employeeAssigned","Notify employee on job assigned")}
          </label>
        </Check>
      </InlineChecks>
    </Card>
  );
}

/* ======= layout helpers ======= */
const Grid = styled.div`
  display: grid;
  gap: ${({theme}) => theme?.spacings?.sm || "12px"};
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  align-items: end;

  /* Küçük ekranlarda team alanını tam satır yaptırmak için */
  .full-sm { grid-column: 1 / -1; }

  @media (min-width: 1024px) {
    .full-sm { grid-column: auto; }
  }
`;

/* Çoklu seçim daha rahat tıklansın diye */
const MultiSelect = styled(Select)`
  min-height: 44px;
  height: auto;
  padding-top: 8px;
  padding-bottom: 8px;
`;

/* Bildirim anahtarlarını yatay diz ve wrap et */
const InlineChecks = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px 16px;
  align-items: center;

  /* “Check” bileşenleri dikey ortalansın */
  & > * { margin: 0; }
`;
