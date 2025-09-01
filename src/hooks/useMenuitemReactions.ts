"use client";

import { useCallback, useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  toggleReaction,
  rateReaction,
  fetchReactionsSummary,
  fetchRatingsSummary,
  fetchMyReactions,
  selectReactionOn,
  selectSummaryByTarget,
  selectRatingSummaryByTarget,
  selectMyReactions,
} from "@/modules/reactions/slice";

type RxSummary = {
  likes: number;
  favorites: number;
  bookmarks: number;
  emojis: Record<string, number>;
  ratingAvg: number | null;
  ratingCount: number;
};

type MyRx = {
  like: boolean;
  favorite: boolean;
  bookmark: boolean;
  emojis: Set<string>;
  rating: number | null;
};

const EMPTY_SUMMARY: RxSummary = {
  likes: 0,
  favorites: 0,
  bookmarks: 0,
  emojis: {},
  ratingAvg: null,
  ratingCount: 0,
};

type ToggleableKind = "LIKE" | "FAVORITE" | "BOOKMARK";
const TARGET_TYPE = "menuitem" as const;

export function useMenuitemReactions(targetId?: string) {
  const dispatch = useAppDispatch();

  // auth
  const profile = useAppSelector((s) => s.account.profile);

  // store’dan node’lar
  const rawSummary = useAppSelector((s) =>
    targetId ? selectSummaryByTarget(s as any, targetId) : undefined
  );
  const ratingNode = useAppSelector((s) =>
    targetId ? selectRatingSummaryByTarget(s as any, targetId) : undefined
  );

  const likeOn = useAppSelector((s) =>
    targetId ? selectReactionOn(s as any, targetId, "LIKE") : false
  );
  const favoriteOn = useAppSelector((s) =>
    targetId ? selectReactionOn(s as any, targetId, "FAVORITE") : false
  );
  const bookmarkOn = useAppSelector((s) =>
    targetId ? selectReactionOn(s as any, targetId, "BOOKMARK") : false
  );

  const myAll = useAppSelector((s) => selectMyReactions(s as any));
  const loading: boolean =
    useAppSelector((s) => (s as any).reactions?.loading) || false;

  // Bu target için zaten my kaydı var mı?
  const hasMineForTarget = useMemo(
    () => !!targetId && (myAll || []).some((r) => r.targetId === targetId),
    [myAll, targetId]
  );

  // Derived — benim durumum
  const mine: MyRx = useMemo(() => {
    if (!targetId) {
      return {
        like: false,
        favorite: false,
        bookmark: false,
        emojis: new Set(),
        rating: null,
      };
    }
    const me = (myAll || []).filter((r) => r.targetId === targetId);
    const emojis = new Set<string>();
    let rating: number | null = null;
    for (const r of me) {
      if (r.kind === "EMOJI" && r.emoji) emojis.add(r.emoji);
      if (r.kind === "RATING" && typeof r.value === "number") rating = r.value;
    }
    return {
      like: !!likeOn,
      favorite: !!favoriteOn,
      bookmark: !!bookmarkOn,
      emojis,
      rating,
    };
  }, [targetId, myAll, likeOn, favoriteOn, bookmarkOn]);

  // Derived — özet
  const summary: RxSummary = useMemo(() => {
    if (!rawSummary && !ratingNode) return EMPTY_SUMMARY;
    const byKind = rawSummary?.byKind || {};
    const byEmoji = rawSummary?.byEmoji || {};
    return {
      likes: Number(byKind.LIKE || 0),
      favorites: Number(byKind.FAVORITE || 0),
      bookmarks: Number(byKind.BOOKMARK || 0),
      emojis: byEmoji,
      ratingAvg:
        typeof ratingNode?.average === "number" ? ratingNode.average : null,
      ratingCount: Number(ratingNode?.count || 0),
    };
  }, [rawSummary, ratingNode]);

  // İlk yükleme / target değişiminde: sadece eksikse çek
  useEffect(() => {
    if (!targetId) return;

    if (!rawSummary) {
      dispatch(
        fetchReactionsSummary({
          targetType: TARGET_TYPE,
          targetId,
          breakdown: "kind+emoji",
        }) as any
      );
    }

    if (!ratingNode) {
      dispatch(
        fetchRatingsSummary({
          targetType: TARGET_TYPE,
          targetId,
        }) as any
      );
    }

    // /reactions/me: sadece login ise ve bu target için elimizde yoksa
    if (profile && !hasMineForTarget) {
      dispatch(
        fetchMyReactions({
          targetType: TARGET_TYPE,
          targetIds: [targetId],
        }) as any
      );
    }
  }, [dispatch, targetId, rawSummary, ratingNode, profile, hasMineForTarget]);

  // Actions
  const refresh = useCallback(() => {
    if (!targetId) return;
    dispatch(
      fetchReactionsSummary({
        targetType: TARGET_TYPE,
        targetId,
        breakdown: "kind+emoji",
      }) as any
    );
    dispatch(
      fetchRatingsSummary({
        targetType: TARGET_TYPE,
        targetId,
      }) as any
    );
    if (profile) {
      dispatch(
        fetchMyReactions({
          targetType: TARGET_TYPE,
          targetIds: [targetId],
        }) as any
      );
    }
  }, [dispatch, targetId, profile]);

  const toggle = useCallback(
    async (kind: ToggleableKind) => {
      if (!targetId) return;
      await dispatch(
        toggleReaction({ targetType: TARGET_TYPE, targetId, kind }) as any
      );
      refresh();
    },
    [dispatch, targetId, refresh]
  );

  const toggleEmoji = useCallback(
    async (emoji: string) => {
      if (!targetId) return;
      await dispatch(
        toggleReaction({
          targetType: TARGET_TYPE,
          targetId,
          kind: "EMOJI",
          emoji,
        }) as any
      );
      refresh();
    },
    [dispatch, targetId, refresh]
  );

  const rate = useCallback(
    async (value: 1 | 2 | 3 | 4 | 5) => {
      if (!targetId) return false;
      const res: any = await dispatch(
        rateReaction({ targetType: TARGET_TYPE, targetId, value }) as any
      );
      refresh();
      return !res?.error;
    },
    [dispatch, targetId, refresh]
  );

  return { summary, mine, loading, refresh, toggle, toggleEmoji, rate };
}
