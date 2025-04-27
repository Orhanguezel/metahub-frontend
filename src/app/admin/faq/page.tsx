"use client";

import FAQAskPanel from "@/components/admin/faq/FAQAskPanel";
import FAQList from "@/components/admin/faq/FAQList";
import FAQMultiForm from "@/components/admin/faq/FAQMultiForm";

export default function AdminFAQPage() {
  return (
    <div>
      <h1>FAQ Verwaltung</h1>
      <FAQAskPanel />
      <FAQList />
      <FAQMultiForm />
    </div>
  );
}
