"use client";
import styled from "styled-components";
import type { IReactionDTO } from "@/modules/reactions/types";

type Props = {
  items: IReactionDTO[];
  loading?: boolean;
  onDelete: (id: string) => void;
  t: (k: string, d?: string) => string;
};

const fmtDate = (iso: string | Date) =>
  new Date(iso).toLocaleString();

const userLabel = (u: IReactionDTO["user"]) => {
  if (!u) return "—";
  if (typeof u === "string") return u;
  const any = u as any;
  return any.name || any.fullName || any.email || any.username || String(any._id || "—");
};

export default function ReactionsTable({ items, loading, onDelete, t }: Props) {
  if (loading) return <Dim>{t("loading", "Loading")}…</Dim>;
  if (!items || items.length === 0) return <Dim>{t("empty", "No records found.")}</Dim>;

  return (
    <>
      {/* DESKTOP/LAPTOP: Tablo */}
      <TableOnly>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>{t("th.createdAt", "Created")}</th>
                <th>{t("th.user", "User")}</th>
                <th>{t("th.target", "Target")}</th>
                <th>{t("th.kind", "Kind")}</th>
                <th>Emoji</th>
                <th>{t("rating", "Rating")}</th>
                <th>{t("active", "Active")}</th>
                <th>{t("extra", "Extra")}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((r) => (
                <tr key={r._id}>
                  <td>{fmtDate(r.createdAt)}</td>
                  <td title={String((r as any).user?._id || r.user)}>{userLabel(r.user)}</td>
                  <td>
                    <code>{r.targetType}</code>
                    <br />
                    <small title={String(r.targetId)}>{String(r.targetId)}</small>
                  </td>
                  <td>{r.kind}</td>
                  <td>{r.emoji || "—"}</td>
                  <td>{r.value ?? "—"}</td>
                  <td>{r.isActive ? "✓" : "—"}</td>
                  <td>
                    {r.extra && Object.keys(r.extra as object).length ? (
                      <pre style={{ margin: 0, maxWidth: 260, whiteSpace: "pre-wrap" }}>
                        {JSON.stringify(r.extra, null, 2)}
                      </pre>
                    ) : (
                      <span>—</span>
                    )}
                  </td>
                  <td>
                    <DangerBtn type="button" onClick={() => onDelete(r._id!)}>
                      {t("delete", "Delete")}
                    </DangerBtn>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </TableOnly>

      {/* MOBILE/TABLET: Kart listesi */}
      <CardsOnly>
        <CardGrid>
          {items.map((r) => (
            <Card key={r._id}>
              <CardHeader>
                <Left>
                  <Created>{fmtDate(r.createdAt)}</Created>
                  <KindBadge data-kind={r.kind}>{r.kind}</KindBadge>
                </Left>
                <Right>
                  <ActiveDot $on={!!r.isActive} title={r.isActive ? "active" : "inactive"} />
                </Right>
              </CardHeader>

              <CardBody>
                <Row>
                  <Label>{t("th.user", "User")}</Label>
                  <Value title={String((r as any).user?._id || r.user)}>{userLabel(r.user)}</Value>
                </Row>

                <Row>
                  <Label>{t("th.target", "Target")}</Label>
                  <Value>
                    <code>{r.targetType}</code>
                    <IdSmall title={String(r.targetId)}>{String(r.targetId)}</IdSmall>
                  </Value>
                </Row>

                <Row>
                  <Label>Emoji</Label>
                  <Value>{r.emoji || "—"}</Value>
                </Row>

                <Row>
                  <Label>{t("rating", "Rating")}</Label>
                  <Value>{r.value ?? "—"}</Value>
                </Row>

                {r.extra && Object.keys(r.extra as object).length ? (
                  <Row>
                    <Label>{t("extra", "Extra")}</Label>
                    <Pre>{JSON.stringify(r.extra, null, 2)}</Pre>
                  </Row>
                ) : null}
              </CardBody>

              <CardFooter>
                <DangerBtn type="button" onClick={() => onDelete(r._id!)}>
                  {t("delete", "Delete")}
                </DangerBtn>
              </CardFooter>
            </Card>
          ))}
        </CardGrid>
      </CardsOnly>
    </>
  );
}

/* ---------- styled ---------- */

const Dim = styled.div` opacity:.75; `;

/* Desktop-tablet ayrımı:
   - Desktop/Laptop (>= 1025px): tablo görünür
   - Mobile (<= 768px) ve Tablet (769–1024px): kartlar görünür
*/
const TableOnly = styled.div`
  .table-scroll { overflow:auto; }
  table { width:100%; border-collapse: collapse; }
  th, td {
    text-align:left;
    padding:10px 12px;
    border-bottom:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.border};
    vertical-align: top;
  }
  thead th {
    position: sticky; top:0;
    background:${({theme})=>theme.colors.tableHeader};
  }

  /* mobile & tablet'te gizle */
  ${({theme})=>theme.media.mobile} { display:none; }
  ${({theme})=>theme.media.tablet} { display:none; }
`;

const CardsOnly = styled.div`
  display:none;

  /* mobile & tablet'te göster */
  ${({theme})=>theme.media.mobile} { display:block; }
  ${({theme})=>theme.media.tablet} { display:block; }

  /* desktop'ta gizle */
  ${({theme})=>theme.media.desktop} { display:none; }
`;

const CardGrid = styled.div`
  display:grid;
  gap:${({theme})=>theme.spacings.sm};

  /* phone: tek sütun */
  grid-template-columns: 1fr;

  /* küçük tabletlerde 2 sütun rahat olur */
  @media (min-width: ${({theme})=>theme.breakpoints.tabletS}) and (max-width: ${({theme})=>theme.breakpoints.tablet}) {
    grid-template-columns: 1fr 1fr;
  }
`;

const Card = styled.div`
  background:${({theme})=>theme.cards.background};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.border};
  border-radius:${({theme})=>theme.radii.lg};
  box-shadow:${({theme})=>theme.cards.shadow};
  padding:${({theme})=>theme.spacings.md};
  display:flex; flex-direction:column; gap:${({theme})=>theme.spacings.sm};
`;

const CardHeader = styled.div`
  display:flex; align-items:center; justify-content:space-between;
`;
const Left = styled.div` display:flex; align-items:center; gap:${({theme})=>theme.spacings.sm}; `;
const Right = styled.div``;

const Created = styled.span`
  font-size:${({theme})=>theme.fontSizes.sm};
  color:${({theme})=>theme.colors.textSecondary};
`;

const KindBadge = styled.span`
  padding:2px 8px;
  border-radius:${({theme})=>theme.radii.pill};
  background:${({theme})=>theme.colors.primaryTransparent};
  color:${({theme})=>theme.colors.primaryDark};
  font-size:${({theme})=>theme.fontSizes.sm};
  &[data-kind="RATING"] { background:${({theme})=>theme.colors.successBg}; color:${({theme})=>theme.colors.text}; }
`;

const ActiveDot = styled.span<{ $on: boolean }>`
  width:10px; height:10px; border-radius:${({theme})=>theme.radii.circle};
  display:inline-block;
  background:${({$on, theme})=> $on ? theme.colors.success : theme.colors.border};
`;

const CardBody = styled.div` display:flex; flex-direction:column; gap:${({theme})=>theme.spacings.xs}; `;
const Row = styled.div`
  display:grid; grid-template-columns: 120px 1fr; gap:${({theme})=>theme.spacings.sm};
  ${({theme})=>theme.media.xsmall} { grid-template-columns: 1fr; }
`;
const Label = styled.div`
  color:${({theme})=>theme.colors.textSecondary};
  font-size:${({theme})=>theme.fontSizes.sm};
`;
const Value = styled.div` word-break: break-word; `;
const IdSmall = styled.div`
  font-size:${({theme})=>theme.fontSizes.xs};
  color:${({theme})=>theme.colors.textSecondary};
`;

const Pre = styled.pre`
  margin:0;
  padding:${({theme})=>theme.spacings.xs};
  border-radius:${({theme})=>theme.radii.md};
  background:${({theme})=>theme.colors.inputBackgroundLight};
  white-space:pre-wrap;
  word-break:break-word;
`;

const CardFooter = styled.div`
  display:flex; justify-content:flex-end; margin-top:${({theme})=>theme.spacings.xs};
`;

const DangerBtn = styled.button`
  background:${({theme})=>theme.colors.danger};
  color:#fff;
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.danger};
  padding:6px 10px; border-radius:${({theme})=>theme.radii.md}; cursor:pointer;
  transition:${({theme})=>theme.transition.fast};
  &:hover { background:${({theme})=>theme.colors.dangerHover}; }
`;
