export type MultiLangValue = { tr: string; en: string; de: string };
export type NestedLinkItem = { label: MultiLangValue; url: string };
export type NestedMultiLangLinkValue = Record<string, NestedLinkItem>;

