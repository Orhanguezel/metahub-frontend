// app/not-found.tsx  ← server component (NO "use client")
import { redirect } from "next/navigation";

export default function NotFound() {
  // 404 yakalandığında anında /page-not-found'a yönlendir
  redirect("/page-not-found");
}
