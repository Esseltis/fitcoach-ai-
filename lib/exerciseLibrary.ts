// Biblioteka ćwiczeń: kategoryzacja po nazwie z planu trenera →
// wskazówki techniki („Jak to zrobić") + zamienniki („Zastąp").
// Nazwy w planach są dowolne, więc dopasowanie jest po kluczowych
// słowach; brak trafienia = kategoria ogólna z uniwersalnymi zasadami.

export type ExerciseInfo = {
  category: string;
  label: string;
  tips: string;
  alternatives: string[];
};

type Rule = ExerciseInfo & { match: RegExp };

const RULES: Rule[] = [
  {
    match: /pomp|klatk|wyciskanie (sztang|hantl|na ław)|rozpiętk|bench/i,
    category: "klatka",
    label: "Klatka piersiowa",
    tips:
      "Łopatki ściągnięte w dół i do tyłu, łokcie pod kątem ok. 45° do tułowia. " +
      "Opuszczaj kontrolowanie do momentu, gdy hantle/sztanga dotkną klatki, " +
      "wypychaj w górę przez pięty stóp — nie odbijaj sztangą od mostka. " +
      "Olej ciężar na rzecz pełnego zakresu ruchu i czucia w klatce.",
    alternatives: [
      "Pompki szerokim chwytem",
      "Wyciskanie hantli na ławce poziomej",
      "Rozpiętki w bramie (kablowe)",
      "Pompki diamentowe",
    ],
  },
  {
    match: /wiosł|ciąg|drąż|martwy ciąg|przyciąg|hyperextension|hiperek/i,
    category: "plecy",
    label: "Plecy",
    tips:
      "Prosty kręgosłup od głowy po biodra, barki opuszczone (nie uszy przy " +
      "uszach). Zacznij ruch od łopatek, dopiero potem zginaj ramiona. " +
      "Przy wiosłowaniu prowadź łokieć blisko tułowia i przytrzymaj sztangę " +
      "1 s na górze — bez buowania tułowiem.",
    alternatives: [
      "Wiosłowanie hantlem jednoręcznie",
      "Ściąganie drążka szerokim chwytem",
      "Przyciąganie sztangi w opadzie tułowia",
      "Wiosłowanie na wyciągu poziomym",
    ],
  },
  {
    match: /poślad|hip thrust|mostek/i,
    category: "pośladki",
    label: "Pośladki",
    tips:
      "Ruch napędzaj piętami i pośladkami, nie odcinkiem lędźwiowym. " +
      "Na górze zaciskaj pośladki na 1–2 s, plecy trzymaj neutralne, " +
      "brzuch napięty. Nie wyginaj kręgosłupa w mostku — to pośladki mają pracować.",
    alternatives: [
      "Hip thrust ze sztangą",
      "Mostek na jednej nodze",
      "Wypady naprzemienne",
      "Wykroki chodzone",
    ],
  },
  {
    match: /przysiad|wykrok|wypad|bułgarsk|sissy|leg extension|prostowanie n/i,
    category: "nogi",
    label: "Nogi (quads)",
    tips:
      "Stopy na szerokość bioder, kolana prowadzone linii palców (nie wpadają do " +
      "środka). Plecy proste, wzrok przed siebie, schodź przynajmniej do " +
      "kąta prostego w kolanach. Pięty przylegają do podłoża — jeśli odrywają się, " +
      "skróć zakres lub zdejmij ciężar.",
    alternatives: [
      "Przysiad goblet (kettlebell)",
      "Wypady naprzemienne",
      "Przysiad na suwnicy (Smith)",
      "Przysiad z nogami wysoko na ławce",
    ],
  },
  {
    match: /uginan.*ramion|uginan.*biceps|biceps|curl|mlotkow|młotkow/i,
    category: "biceps",
    label: "Biceps",
    tips:
      "Łokcie przy tułowiu, nie bujaj korpusem — przenosisz ciężar tylko " +
      "przedramionem. Pełny wyprost na dole i mocny skurcz na górze (1 s " +
      "przytrzymaj). Opuśćciężar ekscentrycznie przez 2–3 s — tu dzieje się " +
      "najwięcej pracy.",
    alternatives: [
      "Uginanie ramion ze sztangą prostą",
      "Młotkowe uginanie hantlami",
      "Uginanie na modlitewniku (preacher)",
      "Uginanie ramion na wyciągu (linia niska)",
    ],
  },
  {
    match: /prostowan.*ramion|prostowan.*triceps|triceps|francusk|wąsk/i,
    category: "triceps",
    label: "Triceps",
    tips:
      "Łokcie stale w jednym miejscu (nie rozjeżdżają się w boki) — pracuje " +
      "wyłącznie przedramię. Przy prostowaniu nad głową pilnuj, by łokcie " +
      "były zwrócone do przodu, a odcinek lędźwiowy nie wyginał się w łuk. " +
      "Pełny wyprost ramienia na końcu ruchu.",
    alternatives: [
      "Prostowanie ramion na wyciągu (górna linia)",
      "Francuskie wyciskanie leżąc",
      "Wyciskanie wąskim chwytem na ławce",
      "Pompki diamentowe",
    ],
  },
  {
    match: /bark|wyciskanie nad|żołnierz|unoszenie (bokiem|przodem|ramion)|face pull|ourke/i,
    category: "barki",
    label: "Barki",
    tips:
      "Nie wypychaj sztangi korpusem — prosta linia w górę, brzuch napięty. " +
      "Przy unoszeniach bokiem lekko zginaj łokcie i prowadź ręce nie wyżej " +
      "niż barki (nie zadzieraj łopatek). Pracuj w zakresie, w którym nie " +
      "boli bark.",
    alternatives: [
      "Wyciskanie żołnierskie",
      "Unoszenie bokiem hantli",
      "Unoszenie przodem sztangielki",
      "Face pull na wyciągu",
    ],
  },
  {
    match: /brzus|plank|deska|wznos|skręt|russian|brzucha|kbd|core/i,
    category: "brzuch",
    label: "Brzuch / core",
    tips:
      "W planku: ciało w jednej linii, pośladki i brzuch napięte, biodra nie " +
      "opadają. Przy brzuszkach odrywaj łopatki od podłoża, ale nie szarp " +
      "karkiem rękami — ruch robi brzuch, nie szyja. Oddychaj: wydech na " +
      "wysiłku.",
    alternatives: [
      "Plank boczny",
      "Wznosy nóg w zwisie",
      "Russian twist z ciężarem",
      "Krzesełko (wysokie unoszenie nóg)",
    ],
  },
  {
    match: /łydk|wspięci/i,
    category: "łydki",
    label: "Łydki",
    tips:
      "Pełny zakres: pięty jak najniżej na dole, maksymalne wspięcie na górze " +
      "z 1-sekundowym przytrzymaniem. Bez podskoków — ruch wolny i kontrolowany, " +
      "bo łydka lubi tempo ekscentryczne.",
    alternatives: [
      "Wspięcia na palce stojąc (jednonóż)",
      "Wspięcia siedząc na maszynie",
      "Wspięcia na schodku (z pełnym zwisem)",
    ],
  },
  {
    match: /bieg|rower|skakank|jumping|burpee|cardio|kardio|orbitrek|maszer/i,
    category: "kardio",
    label: "Kardio",
    tips:
      "Dobrze rozgrzej się 5 min przed intensywnością. Trzymaj tętno w strefie " +
      "celu (rozmowa z trudem możliwa = dobrze). Pilnuj postawy i oddechu " +
      "nosem-ustami; przy biegu ląduj śródstopiem lekko przed biodrem, nie na " +
      "pięcie.",
    alternatives: [
      "Skipping (w miejscu)",
      "Maszerowanie w tempo",
      "Rowerek stacjonarny (interwały 30/30)",
      "Burpees (spokojne tempo)",
    ],
  },
];

const GENERIC: ExerciseInfo = {
  category: "ogólne",
  label: "Ogólne",
  tips:
    "Technika ponad ciężar — jeśli tracisz pełny zakres albo sylwetka się " +
    "psuje, zmniejsz obciążenie. Rozgrzewka: 1–2 serie robocze na mniejszym " +
    "ciężarze. Oddychaj: wydech na fazy wysiłku, wdech na powrocie. " +
    "Ostatnie 1–2 powtórzenia w rezerwie (RIR 1–2), nie do zapaści.",
  alternatives: [
    "Wyciskanie hantli stojąc",
    "Wiosłowanie hantlem jednoręcznie",
    "Przysiad goblet (kettlebell)",
    "Plank 45 s",
  ],
};

/** Dopasowanie ćwiczenia z planu do kategorii, techniki i zamienników. */
export function getExerciseInfo(name: string): ExerciseInfo {
  const norm = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  for (const r of RULES) if (r.match.test(norm)) return r;
  return GENERIC;
}