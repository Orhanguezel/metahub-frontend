"use client";
import styled from "styled-components";
import { useMemo, useRef, useEffect } from "react";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { translations } from "@/modules/servicecatalog";
import type { IServiceCatalogImage } from "@/modules/servicecatalog/types";

export default function ImageUploader({
  existing,
  onRemoveExisting,
  newFiles,
  onAddFiles,
  onRemoveNewFile,
  max = 5,
}: {
  existing: IServiceCatalogImage[];
  onRemoveExisting: (img: IServiceCatalogImage) => void;
  newFiles: File[];
  onAddFiles: (files: File[]) => void;
  onRemoveNewFile: (idx: number) => void;
  max?: number;
}) {
  const { t } = useI18nNamespace("servicecatalog", translations);
  const ref = useRef<HTMLInputElement>(null);

  const previews = useMemo(
    () => newFiles.map((f) => ({ name: f.name, url: URL.createObjectURL(f) })),
    [newFiles]
  );

  // Memory leak önleme: objectURL’leri temizle
  useEffect(() => {
    return () => {
      previews.forEach((p) => URL.revokeObjectURL(p.url));
    };
  }, [previews]);

  const left = Math.max(0, max - existing.length - newFiles.length);
  const pickLabel = t("uploader.add", "+ Add Images ({left} left)").replace("{left}", String(left));

  return (
    <Wrap>
      <Grid>
        {existing.map((img) => (
          <Item key={img.url}>
            <Thumb $bg={img.thumbnail || img.webp || img.url} role="img" aria-label={short(img.url)} />
            <Row>
              <span className="mono small" title={img.url}>
                {short(img.url)}
              </span>
              <Danger
                type="button"
                onClick={() => onRemoveExisting(img)}
                aria-label={t("uploader.removeExisting", "Remove image")}
              >
                {t("uploader.remove", "Remove")}
              </Danger>
            </Row>
          </Item>
        ))}

        {previews.map((p, i) => (
          <Item key={`new-${i}`}>
            <Thumb $bg={p.url} role="img" aria-label={p.name} />
            <Row>
              <span className="mono small" title={p.name}>
                {p.name}
              </span>
              <Danger
                type="button"
                onClick={() => onRemoveNewFile(i)}
                aria-label={t("uploader.removeNew", "Remove new file")}
              >
                {t("uploader.remove", "Remove")}
              </Danger>
            </Row>
          </Item>
        ))}
      </Grid>

      <Actions>
        <Btn
          type="button"
          onClick={() => ref.current?.click()}
          disabled={left <= 0}
          aria-disabled={left <= 0}
        >
          {pickLabel}
        </Btn>

        <HiddenInput
          ref={ref}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => {
            const files = Array.from(e.target.files || []);
            if (!files.length) return;
            onAddFiles(files.slice(0, left));
            e.currentTarget.value = "";
          }}
        />
      </Actions>
    </Wrap>
  );
}

const short = (s: string) => s.split("/").pop() || s;

/* styled */
const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacings.sm};
`;

const Grid = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacings.sm};
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
`;

const Item = styled.div`
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  overflow: hidden;
  background: ${({ theme }) => theme.colors.cardBackground};
`;

const Thumb = styled.div<{ $bg: string }>`
  width: 100%;
  padding-top: 66%;
  background-image: ${({ $bg }) => `url(${$bg})`};
  background-size: cover;
  background-position: center;
`;

const Row = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  gap: 8px;

  .mono {
    font-family: ${({ theme }) => theme.fonts.mono};
  }
  .small {
    font-size: ${({ theme }) => theme.fontSizes.xsmall};
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacings.xs};
`;

const BaseButton = styled.button`
  padding: 8px 12px;
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.buttons.secondary.background};
  color: ${({ theme }) => theme.buttons.secondary.text};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  cursor: pointer;
  transition: ${({ theme }) => theme.transition.normal};
  &:disabled,
  &[aria-disabled="true"] {
    opacity: ${({ theme }) => theme.opacity.disabled};
    cursor: not-allowed;
  }
  &:hover {
    background: ${({ theme }) => theme.buttons.secondary.backgroundHover};
    color: ${({ theme }) => theme.buttons.secondary.textHover};
  }
  &:focus-visible {
    outline: none;
    box-shadow: ${({ theme }) => theme.colors.shadowHighlight};
  }
`;

const Btn = styled(BaseButton)``;

const Danger = styled(BaseButton)`
  background: ${({ theme }) => theme.colors.dangerBg};
  color: ${({ theme }) => theme.colors.danger};
  border-color: ${({ theme }) => theme.colors.danger};
  &:hover {
    filter: brightness(0.98);
  }
`;

const HiddenInput = styled.input`
  display: none;
`;
