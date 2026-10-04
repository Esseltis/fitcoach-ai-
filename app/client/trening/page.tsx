import { redirect } from "next/navigation";

// Stara, samodzielna strona treningu (hardkodowana lista ćwiczeń) została
// zastąpiona sekcją panelu z planem trenera i trybem sesji. Przekierowanie
// utrzymuje działanie starych linków (w tym z panelu /client/female).
export default function TreningPage() {
  redirect("/client?sekcja=trening");
}