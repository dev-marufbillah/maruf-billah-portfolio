import type { Metadata } from "next";
import { AdminStudio } from "@/components/admin/AdminStudio";

export const metadata: Metadata = {
  title: "Content Studio",
  description: "No-code editor for the Maruf Billah portfolio.",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return <AdminStudio />;
}
