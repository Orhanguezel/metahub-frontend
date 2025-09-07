"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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

/* ---- types ---- */
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
const TARGET_TYPE = "recipe" as const;

/* helpers */
const cloneEmojiCounts = (src: Record<string, number> | undefined) =>
  Object.fromEntries(Object.entries(src || {}).map(([k, v]) => [k, Number(v) || 0]));

/* ===========================================================
   Hook: useRecipeReactions (optimistic + safe hooks usage)
   =========================================================== */
export function useRecipeReactions(targetId?: string) {
  const dispatch = useAppDispatch();

  // ---- store selectors (unconditional) ----
  const profile = useAppSelector((s) => (s as any).account?.profile);
  const rawSummary = useAppSelector((s) => (targetId ? selectSummaryByTarget(s as any, targetId) : undefined));
  const ratingNode = useAppSelector((s) => (targetId ? selectRatingSummaryByTarget(s as any, targetId) : undefined));
  const likeOn = useAppSelector((s) => (targetId ? selectReactionOn(s as any, targetId, "LIKE") : false));
  const favoriteOn = useAppSelector((s) => (targetId ? selectReactionOn(s as any, targetId, "FAVORITE") : false));
  const bookmarkOn = useAppSelector((s) => (targetId ? selectReactionOn(s as any, targetId, "BOOKMARK") : false));
  const myAll = useAppSelector((s) => selectMyReactions(s as any));
  const reactionsLoading: boolean = useAppSelector((s) => (s as any).reactions?.loading) || false;

  // ---- derive mine from store ----
  const baseMine: MyRx = useMemo(() => {
    if (!targetId) return { like: false, favorite: false, bookmark: false, emojis: new Set(), rating: null };
    const me = (myAll || []).filter((r) => r.targetId === targetId);
    const emojis = new Set<string>();
    let rating: number | null = null;
    for (const r of me) {
      if (r.kind === "EMOJI" && r.emoji) emojis.add(r.emoji);
      if (r.kind === "RATING" && typeof r.value === "number") rating = r.value;
    }
    return { like: !!likeOn, favorite: !!favoriteOn, bookmark: !!bookmarkOn, emojis, rating };
  }, [targetId, myAll, likeOn, favoriteOn, bookmarkOn]);

  // ---- derive summary from store ----
  const baseSummary: RxSummary = useMemo(() => {
    if (!rawSummary && !ratingNode) return EMPTY_SUMMARY;
    const byKind = rawSummary?.byKind || {};
    const byEmoji = rawSummary?.byEmoji || {};
    return {
      likes: Number(byKind.LIKE || 0),
      favorites: Number(byKind.FAVORITE || 0),
      bookmarks: Number(byKind.BOOKMARK || 0),
      emojis: cloneEmojiCounts(byEmoji),
      ratingAvg: typeof ratingNode?.average === "number" ? ratingNode.average : null,
      ratingCount: Number(ratingNode?.count || 0),
    };
  }, [rawSummary, ratingNode]);

  // ---- optimistic overlay ----
  type Overlay = Partial<Pick<MyRx, "like" | "favorite" | "bookmark" | "rating">> & { emojis?: Set<string> };
  const [overlay, setOverlay] = useState<Overlay>({});
  const [pending, setPending] = useState(false);

  const optimistic = useCallback((patch: Overlay) => {
    setOverlay((prev) => {
      const next: Overlay = { ...prev, ...patch };
      if (patch.emojis) next.emojis = new Set(patch.emojis);
      return next;
    });
  }, []);

  // ---- mine with overlay ----
  const mine: MyRx = useMemo(
    () => ({
      like: overlay.like ?? baseMine.like,
      favorite: overlay.favorite ?? baseMine.favorite,
      bookmark: overlay.bookmark ?? baseMine.bookmark,
      emojis: overlay.emojis ? new Set(overlay.emojis) : new Set(baseMine.emojis),
      rating: overlay.rating ?? baseMine.rating,
    }),
    [baseMine, overlay]
  );

  // ---- summary with overlay (diff) ----
  const summary: RxSummary = useMemo(() => {
    const res: RxSummary = {
      likes: baseSummary.likes,
      favorites: baseSummary.favorites,
      bookmarks: baseSummary.bookmarks,
      emojis: cloneEmojiCounts(baseSummary.emojis),
      ratingAvg: baseSummary.ratingAvg,
      ratingCount: baseSummary.ratingCount,
    };

    if (baseMine.like !== mine.like) res.likes += mine.like ? 1 : -1;
    if (baseMine.favorite !== mine.favorite) res.favorites += mine.favorite ? 1 : -1;
    if (baseMine.bookmark !== mine.bookmark) res.bookmarks += mine.bookmark ? 1 : -1;

    const all = new Set<string>([...baseMine.emojis, ...mine.emojis]);
    for (const e of all) {
      const before = baseMine.emojis.has(e) ? 1 : 0;
      const after = mine.emojis.has(e) ? 1 : 0;
      const delta = after - before;
      if (delta !== 0) res.emojis[e] = Math.max(0, (res.emojis[e] || 0) + delta);
    }

    const r0 = baseMine.rating;
    const r1 = mine.rating;
    if (r0 !== r1) {
      const count0 = res.ratingCount;
      const avg0 = res.ratingAvg ?? 0;
      let sum0 = avg0 * count0;
      let count1 = count0;
      if (r0 == null && r1 != null) {
        sum0 += r1; count1 += 1;
      } else if (r0 != null && r1 == null) {
        sum0 -= r0; count1 = Math.max(0, count1 - 1);
      } else if (r0 != null && r1 != null) {
        sum0 += (r1 - r0);
      }
      res.ratingCount = count1;
      res.ratingAvg = count1 > 0 ? sum0 / count1 : null;
    }

    return res;
  }, [baseSummary, baseMine, mine]);

  // ---- initial fetches ----
  useEffect(() => {
    if (!targetId) return;

    if (!rawSummary) {
      dispatch(fetchReactionsSummary({ targetType: TARGET_TYPE, targetId, breakdown: "kind+emoji" }) as any);
    }
    if (!ratingNode) {
      dispatch(fetchRatingsSummary({ targetType: TARGET_TYPE, targetId }) as any);
    }
    if (profile) {
      dispatch(fetchMyReactions({ targetType: TARGET_TYPE, targetIds: [targetId] }) as any);
    }
  }, [dispatch, targetId, rawSummary, ratingNode, profile]);

  // ---- refresh ----
  const refresh = useCallback(() => {
    if (!targetId) return;
    dispatch(fetchReactionsSummary({ targetType: TARGET_TYPE, targetId, breakdown: "kind+emoji" }) as any);
    dispatch(fetchRatingsSummary({ targetType: TARGET_TYPE, targetId }) as any);
    if (profile) {
      dispatch(fetchMyReactions({ targetType: TARGET_TYPE, targetIds: [targetId] }) as any);
    }
  }, [dispatch, targetId, profile]);

  // ---- actions (optimistic) ----
  const toggle = useCallback(
    async (kind: ToggleableKind) => {
      if (!targetId) return;
      setPending(true);

      const desired: Overlay = {};
      if (kind === "LIKE") desired.like = !mine.like;
      if (kind === "FAVORITE") desired.favorite = !mine.favorite;
      if (kind === "BOOKMARK") desired.bookmark = !mine.bookmark;

      const prev = overlay;
      optimistic(desired);
      try {
        await (dispatch as any)(toggleReaction({ targetType: TARGET_TYPE, targetId, kind }));
        refresh();
      } catch {
        setOverlay(prev); // rollback
      } finally {
        setPending(false);
      }
    },
    [dispatch, targetId, mine.like, mine.favorite, mine.bookmark, overlay, refresh, optimistic]
  );

  const toggleEmoji = useCallback(
    async (emoji: string) => {
      if (!targetId) return;
      setPending(true);

      const nextSet = new Set(mine.emojis);
      if (nextSet.has(emoji)) {
        nextSet.delete(emoji);
      } else {
        nextSet.add(emoji);
      }

      const prev = overlay;
      optimistic({ emojis: nextSet });
      try {
        await (dispatch as any)(toggleReaction({ targetType: TARGET_TYPE, targetId, kind: "EMOJI", emoji }));
        refresh();
      } catch {
        setOverlay(prev); // rollback
      } finally {
        setPending(false);
      }
    },
    [dispatch, targetId, mine.emojis, overlay, refresh, optimistic]
  );

  const rate = useCallback(
    async (value: 1 | 2 | 3 | 4 | 5) => {
      if (!targetId) return false;
      setPending(true);

      const prev = overlay;
      optimistic({ rating: value });
      try {
        const res: any = await (dispatch as any)(rateReaction({ targetType: TARGET_TYPE, targetId, value }));
        refresh();
        return !res?.error;
      } catch {
        setOverlay(prev); // rollback
        return false;
      } finally {
        setPending(false);
      }
    },
    [dispatch, targetId, overlay, refresh, optimistic]
  );

  return {
    summary,
    mine,
    loading: pending || reactionsLoading,
    refresh,
    toggle,
    toggleEmoji,
    rate,
  };
}
