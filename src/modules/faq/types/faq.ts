export interface IFaq {
  _id?: string;
  question: string;
  answer: string;
  language: "tr" | "en" | "de";
  category?: string;
}
