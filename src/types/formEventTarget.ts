export type FormElement = HTMLInputElement | HTMLSelectElement;

export const getTarget = (e: React.ChangeEvent<FormElement>) => e.target as HTMLInputElement;
