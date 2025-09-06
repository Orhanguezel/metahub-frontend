"use client";
import { useState } from "react";
import type { SupportedLocale } from "@/types/recipes/common";
import { SUPPORTED_LOCALES } from "@/types/recipes/common";
import { AIGeneratorProps, AiResponse, AiGenInput } from "../../types";
import { AiCard, AiHead, AiGrid, AiChecks, AiFoot, Toggle, Note, Label, Select, Input, TextArea, Small, Primary } from "./styled";
import { parseArray } from "../../utils/utils";

export default function RecipeAIGenerator({
  endpoint = "/api/recipes/ai/generate",
  defaultLang = "tr" as SupportedLocale,
  compact = false,
  onGenerated,
}: AIGeneratorProps<SupportedLocale>) {
  const [open, setOpen] = useState(true);
  const [mode, setMode] = useState<"replace" | "merge">("replace");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const [input, setInput] = useState<AiGenInput<SupportedLocale>>({
    lang: defaultLang,
    cuisine: "",
    vegetarian: false,
    vegan: false,
    glutenFree: false,
    lactoseFree: false,
    servings: undefined,
    maxMinutes: undefined,
    includeIngredients: [],
    excludeIngredients: [],
    prompt: "",
  });

  const [incRaw, setIncRaw] = useState<string>("[]");
  const [excRaw, setExcRaw] = useState<string>("[]");

  const run = async () => {
    setErr(null); setOk(null); setLoading(true);
    const payload: any = {
      lang: input.lang,
      cuisine: input.cuisine || undefined,
      vegetarian: !!input.vegetarian,
      vegan: !!input.vegan,
      glutenFree: !!input.glutenFree,
      lactoseFree: !!input.lactoseFree,
      servings: input.servings ?? undefined,
      maxMinutes: input.maxMinutes ?? undefined,
      includeIngredients: parseArray(incRaw),
      excludeIngredients: parseArray(excRaw),
      prompt: input.prompt || undefined,
    };
    try {
      const r = await fetch(endpoint, { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(payload) });
      const j: AiResponse = await r.json();
      if (!r.ok || !j?.success || !j?.data) throw new Error(j?.message || `HTTP ${r.status}`);
      setOk("✅ Tarif üretildi");
      onGenerated(j.data, mode);
    } catch (e: any) {
      setErr(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AiCard>
      <AiHead onClick={() => setOpen(v => !v)} aria-expanded={open}>
        <strong>🤖 AI ile oluştur</strong><span>{open ? "−" : "+"}</span>
      </AiHead>

      {open && (
        <AiGrid data-compact={compact ? "1" : undefined}>
          <div>
            <Label>Çıkış Dili</Label>
            <Select value={input.lang} onChange={(e)=>setInput(s=>({ ...s, lang: e.target.value as SupportedLocale }))}>
              {(SUPPORTED_LOCALES as readonly SupportedLocale[]).map((l)=> <option key={l} value={l}>{l.toUpperCase()}</option>)}
            </Select>
          </div>

          <div>
            <Label>Mutfak (örn: italian, turkish)</Label>
            <Input placeholder="italian" value={input.cuisine || ""} onChange={(e)=>setInput(s=>({ ...s, cuisine: e.target.value }))}/>
          </div>

          <div>
            <Label>Servis (kişi)</Label>
            <Input type="number" min={1} placeholder="2" value={input.servings ?? ""} onChange={(e)=>setInput(s=>({ ...s, servings: e.target.value ? Number(e.target.value) : undefined }))}/>
          </div>

          <div>
            <Label>Maks. Süre (dk)</Label>
            <Input type="number" min={1} placeholder="20" value={input.maxMinutes ?? ""} onChange={(e)=>setInput(s=>({ ...s, maxMinutes: e.target.value ? Number(e.target.value) : undefined }))}/>
          </div>

          <AiChecks>
            <label><input type="checkbox" checked={!!input.vegetarian} onChange={(e)=>setInput(s=>({...s,vegetarian:e.target.checked}))}/> Vejetaryen</label>
            <label><input type="checkbox" checked={!!input.vegan} onChange={(e)=>setInput(s=>({...s,vegan:e.target.checked}))}/> Vegan</label>
            <label><input type="checkbox" checked={!!input.glutenFree} onChange={(e)=>setInput(s=>({...s,glutenFree:e.target.checked}))}/> Glütensiz</label>
            <label><input type="checkbox" checked={!!input.lactoseFree} onChange={(e)=>setInput(s=>({...s,lactoseFree:e.target.checked}))}/> Laktozsuz</label>
          </AiChecks>

          <div data-full>
            <Label>İçerilecek Malzemeler (JSON dizi veya virgül)</Label>
            <TextArea rows={2} value={incRaw} onChange={(e)=>setIncRaw(e.target.value)} />
          </div>

          <div data-full>
            <Label>Hariç Malzemeler (JSON dizi veya virgül)</Label>
            <TextArea rows={2} value={excRaw} onChange={(e)=>setExcRaw(e.target.value)} />
          </div>

          <div data-full>
            <Label>Ek İstek / Prompt</Label>
            <TextArea rows={2} placeholder="Örn: acı olmasın, domates ağırlıklı, 20 dk’yı geçmesin…" value={input.prompt || ""} onChange={(e)=>setInput(s=>({ ...s, prompt: e.target.value }))}/>
          </div>

          <AiFoot>
            <Toggle>
              <label><input type="radio" name="aimode" value="replace" checked={mode==="replace"} onChange={()=>setMode("replace")}/> Replace</label>
              <label><input type="radio" name="aimode" value="merge" checked={mode==="merge"} onChange={()=>setMode("merge")}/> Merge</label>
            </Toggle>
            <div style={{ display:"flex", gap:8 }}>
              <Small type="button" onClick={()=>setInput(s=>({ ...s, cuisine:"italian", maxMinutes:20 }))}>⚙ Örnek</Small>
              <Primary type="button" onClick={run} disabled={loading}>{loading ? "Oluşturuluyor…" : "Oluştur"}</Primary>
            </div>
          </AiFoot>

          {err && <Note className="err">❌ {err}</Note>}
          {ok && <Note className="ok">{ok}</Note>}
        </AiGrid>
      )}
    </AiCard>
  );
}
