// src/types/reactions.ts

/** Uygulama genelinde kullanılan locale tiplerini burada kullanmıyoruz,
 *  reactions payload’larında dil alanı yok. İleride gerekirse eklenebilir.  */

// Backend ile birebir uyumlu türler
export type ReactionKind = "LIKE" | "FAVORITE" | "BOOKMARK" | "EMOJI" | "RATING";

export type ReactionTargetType =
  | "menuitem"
  | "product"
  | "reactions"
  | "post"
  | "comment"
  | "category"
  | (string & {}); // free-form

// API'den gelebilecek tekil reaction kaydı
export interface IReactionDTO {
  _id: string;
  tenant: string;
  user: string | { _id: string;[k: string]: any };
  kind: ReactionKind;
  emoji?: string | null;
  value?: number | null; // RATING ise 1..5
  targetType: ReactionTargetType;
  targetId: string;
  extra?: Record<string, unknown>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/** /reactions/me cevabı öğeleri */
export interface IMyReactionItem {
  targetId: string;
  kind: ReactionKind;
  emoji?: string | null;
  value?: number | null; // RATING
}

/** /reactions/summary cevabı: { [targetId]: { total, byKind, byEmoji } } */
export interface IReactionSummaryItem {
  total: number;
  byKind?: Partial<Record<ReactionKind, number>>;
  byEmoji?: Record<string, number>;
}
export type IReactionSummaryMap = Record<string, IReactionSummaryItem>;

/** /reactions/ratings/summary cevabı: { [targetId]: { count, average, dist } } */
export type RatingDistribution = Record<"1" | "2" | "3" | "4" | "5", number>;
export interface IRatingSummaryItem {
  count: number;
  average: number | null;
  dist: RatingDistribution;
}
export type IRatingSummaryMap = Record<string, IRatingSummaryItem>;

/** Ortak API response sarmalayıcıları */
export interface ApiListResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  meta?: { total: number; page: number; limit: number };
}
export interface ApiItemResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
export interface ApiMapResponse<TMap> {
  success: boolean;
  message: string;
  data: TMap;
}
