"use client";
import React from "react";
import { Form, ModeRow, ModeBtn, Row } from "./styled";
import TopBarSEO from "./RecipesForm/TopBarSEO";
import SlugAndCategories from "./RecipesForm/SlugAndCategories";
import LocaleFields from "./RecipesForm/LocaleFields";
import NumbersAndFlags from "./RecipesForm/NumbersAndFlags";
import JsonEditorPanel from "./RecipesForm/JsonEditorPanel";
import ImagesAndActions from "./RecipesForm/ImagesAndActions";
import IngredientsEditor from "./RecipesForm/IngredientsEditor";
import StepsEditor from "./RecipesForm/StepsEditor";
import { useRecipeForm } from "./RecipesForm/useRecipeForm";
import type { IRecipe } from "@/modules/recipes/types";

type Props = {
  initial?: IRecipe | null;
  onSubmit: (formData: FormData, id?: string) => Promise<void> | void;
  onCancel: () => void;
  onAddCategory: () => void;
  onOpenAI?: () => void; // opsiyonel
};

export default function RecipesForm({ initial, onSubmit, onCancel, onAddCategory, onOpenAI }: Props) {
  const f = useRecipeForm(initial || null, onSubmit);

  return (
    <Form onSubmit={f.handleSubmit}>
      <TopBarSEO
        t={f.t}
        SUPPORTED_LOCALES={f.SUPPORTED_LOCALES}
        editLang={f.editLang}
        setEditLang={f.setEditLang}
        title={f.title}
        description={f.description}
        slugMap={f.slugMap}
        slugCanonical={f.slugCanonical}
        canonicalTitle={f.canonicalTitle}
        onOpenAI={onOpenAI ?? (() => {})} // ✅ fallback ile güvenli
      />

      <Row>
        <SlugAndCategories
          t={f.t}
          editLang={f.editLang}
          slugMap={f.slugMap}
          setSlugMap={f.setSlugMap}
          slugCanonical={f.slugCanonical}
          setSlugCanonical={f.setSlugCanonical}
          autoSlug={f.autoSlug}
          setAutoSlug={f.setAutoSlug}
          categoryIds={f.categoryIds}
          setCategoryIds={f.setCategoryIds}
          onAddCategory={onAddCategory}
        />
      </Row>

      <LocaleFields
        t={f.t}
        editLang={f.editLang}
        title={f.title}
        setTitle={f.setTitle}
        description={f.description}
        setDescription={f.setDescription}
      />

      <ModeRow role="radiogroup" aria-label={f.t("editMode", "Edit Mode")}>
        <ModeBtn type="button" aria-pressed={f.editMode === "simple"} $active={f.editMode === "simple"} onClick={() => f.setEditMode("simple")}>
          {f.t("simpleMode", "Basit")}
        </ModeBtn>
        <ModeBtn type="button" aria-pressed={f.editMode === "json"} $active={f.editMode === "json"} onClick={() => f.setEditMode("json")}>
          {f.t("jsonMode", "JSON Editor")}
        </ModeBtn>
      </ModeRow>

      {f.editMode === "simple" ? (
        <>
          <NumbersAndFlags
            t={f.t}
            cuisinesStr={f.cuisinesStr}
            setCuisinesStr={f.setCuisinesStr}
            applyCuisineCanon={f.applyCuisineCanon}
            tagsStr={f.tagsStr}
            setTagsStr={f.setTagsStr}
            tagSuggestions={f.tagSuggestions}
            selectedTags={f.selectedTags}
            toggleTag={f.toggleTag}
            servings={f.servings}
            setServings={f.setServings}
            calories={f.calories}
            setCalories={f.setCalories}
            prepMinutes={f.prepMinutes}
            setPrepMinutes={f.setPrepMinutes}
            cookMinutes={f.cookMinutes}
            setCookMinutes={f.setCookMinutes}
            totalMinutes={f.totalMinutes}
            setTotalMinutes={f.setTotalMinutes}
            autoTotal={f.autoTotal}
            setAutoTotal={f.setAutoTotal}
            isPublished={f.isPublished}
            setIsPublished={f.setIsPublished}
            order={f.order}
            setOrder={f.setOrder}
            isActive={f.isActive}
            setIsActive={f.setIsActive}
            effectiveFrom={f.effectiveFrom}
            setEffectiveFrom={f.setEffectiveFrom}
            effectiveTo={f.effectiveTo}
            setEffectiveTo={f.setEffectiveTo}
          />

          <IngredientsEditor
            t={f.t}
            editLang={f.editLang}
            items={f.ingredientsJson as any}
            setItems={f.setIngredientsJson as any}
          />

          <StepsEditor
            t={f.t}
            editLang={f.editLang}
            items={f.stepsJson as any}
            setItems={f.setStepsJson as any}
          />
        </>
      ) : (
        <JsonEditorPanel t={f.t} value={f.recipeJsonValue} onChange={f.applyJsonToState} />
      )}

      <ImagesAndActions
        t={f.t}
        existingUploads={f.existingUploads}
        setExistingUploads={f.setExistingUploads}
        removedExisting={f.removedExisting}
        setRemovedExisting={f.setRemovedExisting}
        newFiles={f.newFiles}
        setNewFiles={f.setNewFiles}
        isEdit={f.isEdit}
        onCancel={onCancel}
      />
    </Form>
  );
}
