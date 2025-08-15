export type Opt = { id: string; label: string; sub?: string };

export type SvcBind = {
  service: string;
  schedulePlan?: string;
  operationTemplate?: string;
  priceListItem?: string;
  isActive?: boolean;
  notes?: string;
};
