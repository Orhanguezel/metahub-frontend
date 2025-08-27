"use client";
import styled from "styled-components";
import Link from "next/link";
import { getMultiLang } from "@/types/common";
import type { SupportedLocale } from "@/types/common";

type CatRef = { category: string; order?: number; isFeatured?: boolean };

type Props = {
  categories: CatRef[];
  catDict: Map<string, any>;
  t: (k:string,d?:string)=>string;
  lang: SupportedLocale;
  isLoading?: boolean;
  /** id -> slug eşlemesi (ör. 68ac.. -> "sparmenu-10") */
  anchorMap: Map<string, string>;
  /** opsiyonel: branch query’si aynı kalsın diye */
  branchId?: string;
};

export default function CategoryNav({
  categories,
  catDict,
  lang,
  isLoading,
  anchorMap,
  branchId,
}: Props) {
  return (
    <Bar role="navigation" aria-label="Categories">
      {isLoading && [1,2,3,4,5].map((i)=> <Skel key={i} style={{width:100}} />)}

      {!isLoading && categories.map((c) => {
        const id = String(c.category);
        const obj = catDict.get(id);
        const label = obj
          ? (getMultiLang(obj.name as any, lang) || obj.slug || obj.code || id)
          : id;

        // path’i slug ile üretin; query’de branch varsa koruyun
        const slug = anchorMap.get(id) ?? `cat-${id}`;
        const href = branchId
          ? { pathname: `/menu/${slug}`, query: { branch: branchId } }
          : `/menu/${slug}`;

        return (
          <Link key={slug} href={href} className="pill" scroll>
            {label}{c.isFeatured ? <span className="feat">★</span> : null}
          </Link>
        );
      })}
    </Bar>
  );
}

const Bar = styled.nav`
  display:flex;gap:8px;overflow:auto;padding:8px 0;
  .pill{white-space:nowrap;border:1px solid #ddd;border-radius:999px;padding:6px 10px;text-decoration:none;color:inherit;}
  .feat{margin-left:6px;opacity:.8}
`;
const Skel = styled.div`height:28px;background:#eee;border-radius:999px;`;
