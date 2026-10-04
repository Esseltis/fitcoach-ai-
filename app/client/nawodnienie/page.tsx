import { redirect } from "next/navigation";

// Stara, samodzielna strona nawodnienia została zastąpiona sekcją panelu
// (cel wody trenera, historia szklanek, seria dni). Przekierowanie
// utrzymuje działanie starych linków (w tym z panelu /client/female).
export default function NawodnieniePage() {
  redirect("/client?sekcja=nawodnienie");
}