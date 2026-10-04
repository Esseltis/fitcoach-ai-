import { redirect } from "next/navigation";

// Stara, samodzielna strona diety została zastąpiona sekcją panelu
// (dziennik posiłków, powielanie, top-5, skaner kodów). Przekierowanie
// utrzymuje działanie starych linków (w tym z panelu /client/female).
export default function DietaPage() {
  redirect("/client?sekcja=dieta");
}