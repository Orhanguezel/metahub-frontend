"use client";
import { RowGrid, Label, Input, Check } from "../FormUI";

export default function PublishSection({
  t, slug, setSlug, isPublished, setIsPublished
}: {
  t: (k: string, d?: string) => string;
  slug: string; setSlug: (v: string) => void;
  isPublished: boolean; setIsPublished: (b: boolean) => void;
}) {
  return (
    <RowGrid>
      <div>
        <Label>{t("form.slug", "Slug (optional)")}</Label>
        <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="my-apartment-slug" />
      </div>
      <Check>
        <input id="isPublished" type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} />
        <label htmlFor="isPublished">{t("form.isPublished", "Published")}</label>
      </Check>
    </RowGrid>
  );
}
