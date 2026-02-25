import Link from "next/link";
import {
  Dumbbell,
  Brain,
  Users,
  LineChart,
  Utensils,
  MessageCircle,
  ArrowRight,
} from "lucide-react";

const features = [
  {
    icon: Users,
    title: "Wybierz swojego trenera",
    description:
      "Przeglądaj trenerów, porównaj specjalizacje i ceny. Wykup współpracę i otrzymaj dostęp do swojego panelu.",
  },
  {
    icon: Dumbbell,
    title: "Plany treningowe dla Ciebie",
    description:
      "Otrzymuj spersonalizowane plany treningowe od swojego trenera, dopasowane do Twoich celów i możliwości.",
  },
  {
    icon: Utensils,
    title: "Plany dietetyczne",
    description:
      "Jadłospisy i makro od trenera – wszystko w jednym miejscu, bez gubienia się w notatkach.",
  },
  {
    icon: Brain,
    title: "Asystent AI twojego trenera",
    description:
      "Pomaga wyuczonej inteligencji twojego trenera na szybszą odpowiedź na pytania o trening i dietę.",
  },
  {
    icon: LineChart,
    title: "Twoje postępy",
    description:
      "Wpisuj wagę, pomiary i zdjęcia. Śledź progres i pokazuj go trenerowi w jednym panelu.",
  },
  {
    icon: MessageCircle,
    title: "Czat z trenerem",
    description:
      "Bezpośredni kontakt z trenerem w jednym miejscu – bez messengera i gubienia wątków.",
  },
];

const testimonials = [
  {
    name: "Anna Kowalska",
    role: "Podopieczna",
    content:
      "Dzięki FitCoach AI schudłam 15kg w 4 miesiące. Mój trener ma wszystko w jednym miejscu, a ja – plany i czat na jednej stronie.",
    avatar: "AK",
  },
  {
    name: "Piotr Wiśniewski",
    role: "Podopieczny",
    content:
      "Najlepsza inwestycja w moje zdrowie. Wybrałem trenera, wykupiłem współpracę i od razu mam plany i dietę w panelu.",
    avatar: "PW",
  },
  {
    name: "Katarzyna Lewandowska",
    role: "Podopieczna",
    content:
      "W końcu nie gubię planów w mailach. Wszystko u trenera w jednym miejscu – trening, dieta, postępy i czat.",
    avatar: "KL",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Dumbbell className="h-8 w-8 text-primary-600" />
              <span className="text-xl font-bold text-gray-900">FitCoach AI</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a
                href="#features"
                className="text-gray-600 hover:text-gray-900 transition"
              >
                Dla Ciebie
              </a>
              <a
                href="#how-it-works"
                className="text-gray-600 hover:text-gray-900 transition"
              >
                Jak to działa
              </a>
              <a
                href="#testimonials"
                className="text-gray-600 hover:text-gray-900 transition"
              >
                Opinie
              </a>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/login"
                className="text-gray-600 hover:text-gray-900 font-medium transition"
              >
                Zaloguj się
              </Link>
              <Link
                href="/register?role=client"
                className="bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition"
              >
                Znajdź trenera
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - dla podopiecznego */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6">
              Wybierz swojego trenera
              <span className="block mt-2 bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                i osiągaj cele w jednym miejscu
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Znajdź trenera, wykup współpracę i korzystaj z planów treningowych,
              diety i czatu w jednym panelu. AI wspiera Cię i trenera na co
              dzień.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/register?role=client"
                className="inline-flex items-center justify-center px-8 py-4 bg-primary-600 text-white rounded-xl font-semibold text-lg hover:bg-primary-700 transition shadow-lg shadow-primary-600/25"
              >
                Znajdź trenera
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-gray-900 rounded-xl font-semibold text-lg hover:bg-gray-50 transition border-2 border-gray-200"
              >
                Jesteś trenerem? Zaloguj się
              </Link>
            </div>
          </div>

          {/* Stats - pod kątem podopiecznego */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "500+", label: "Trenerów do wyboru" },
              { value: "10k+", label: "Podopiecznych na platformie" },
              { value: "50k+", label: "Planów treningowych" },
              { value: "98%", label: "Zadowolonych podopiecznych" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl font-bold text-primary-600">
                  {stat.value}
                </div>
                <div className="text-gray-600 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Co zyskujesz jako podopieczny
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Jedna platforma: wybór trenera, plany, dieta, postępy i czat – bez
              gubienia się w mailach i messengerze.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition card-hover"
                >
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-6">
                    <Icon className="h-6 w-6 text-primary-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works - dla podopiecznego */}
      <section id="how-it-works" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Jak to działa?
            </h2>
            <p className="text-xl text-gray-600">
              Trzy kroki do współpracy z trenerem
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                step: "01",
                title: "Załóż konto",
                description:
                  "Zarejestruj się jako podopieczny i uzupełnij swój profil (cele, możliwości).",
              },
              {
                step: "02",
                title: "Wybierz trenera",
                description:
                  "Przeglądaj trenerów, porównaj oferty i cenę. Wykup współpracę z wybranym trenerem.",
              },
              {
                step: "03",
                title: "Korzystaj z panelu",
                description:
                  "Otrzymuj plany treningowe i dietę, śledź postępy i pisz do trenera w jednym miejscu.",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {item.title}
                </h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Co mówią podopieczni
            </h2>
            <p className="text-xl text-gray-600">
              Dołącz do tysięcy zadowolonych użytkowników
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.name}
                className="bg-white p-8 rounded-2xl shadow-sm"
              >
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-semibold">
                    {testimonial.avatar}
                  </div>
                  <div className="ml-4">
                    <div className="font-semibold text-gray-900">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-gray-600">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 italic">
                  &ldquo;{testimonial.content}&rdquo;
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cena - dla podopiecznego */}
      <section id="pricing" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Cena współpracy
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Cenę ustala Twój trener. Wybierz trenera, zobacz jego ofertę i
              wykup współpracę – wtedy zyskujesz dostęp do panelu z planami,
              dietą i czatem.
            </p>
          </div>
          <div className="max-w-xl mx-auto text-center">
            <Link
              href="/register?role=client"
              className="inline-flex items-center justify-center px-8 py-4 bg-primary-600 text-white rounded-xl font-semibold text-lg hover:bg-primary-700 transition"
            >
              Zobacz trenerów i oferty
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <p className="mt-4 text-sm text-gray-500">
              Jesteś trenerem?{" "}
              <Link
                href="/login"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Zaloguj się
              </Link>
              , aby zarządzać ofertą i podopiecznymi.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section - podopieczny */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            Znajdź swojego trenera
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Załóż konto, wybierz trenera i zacznij współpracę – plany, dieta i
            czat w jednym miejscu.
          </p>
          <Link
            href="/register?role=client"
            className="inline-flex items-center px-8 py-4 bg-white text-primary-600 rounded-xl font-semibold text-lg hover:bg-gray-100 transition"
          >
            Rozpocznij
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-900 text-gray-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Dumbbell className="h-6 w-6 text-primary-500" />
                <span className="text-lg font-bold text-white">FitCoach AI</span>
              </div>
              <p className="text-sm">
                Dla podopiecznych: wybierz trenera i korzystaj z planów, diety i
                czatu w jednym panelu. Trenerzy: zaloguj się do panelu.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Produkt</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#features" className="hover:text-white transition">
                    Funkcje
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="hover:text-white transition">
                    Cennik
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    API
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Firma</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition">
                    O nas
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Kariera
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Wsparcie</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition">
                    Centrum pomocy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Kontakt
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Polityka prywatności
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-sm">
            <p>&copy; 2026 FitCoach AI. Wszystkie prawa zastrzeżone.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
