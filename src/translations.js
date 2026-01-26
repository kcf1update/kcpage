// src/translations.js
import { getCurrentLanguage } from "./LanguageSelector";

const TRANSLATIONS = {
  en: {
    // --- Nav buttons on home page ---
    navMoreNews: "More News",
    navMoreYouTube: "More YouTube",
    navPoints: "Points",
    navNextRace: "Next Race Info",
    navComments: "Comments",
navBackHome: "Back to home",
navHome: "Home",
navF1News: "F1 News",
navYouTube: "YouTube",

    // --- Points page ---
    pointsPageTitle: "Championship Points",
    pointsPageSubtitle: "Live standings for drivers and constructors.",
    pointsTopThreeTitle: "Top three in points",
    pointsTopThreeSubtitle: "Current top 3 in the drivers' standings.",
    pointsDriversTitle: "Driver standings",
    pointsConstructorsTitle: "Constructor standings",
        // --- F1 News page ---
    f1NewsHeaderTitle: "F1 News",
    f1NewsIntroMain:
      "Your own curated Formula 1 news board. In admin mode you can add headlines, sources, links and a short recap for each story.",
    f1NewsIntroRights:
      "This page links to external news sites. We don’t host or copy full articles; all rights and content remain with the original publishers and writers.",
    // --- YouTube News page ---
    ytPageTitle: "F1 YouTube News",
    ytIntroMain:
      "Curated Formula 1 videos from YouTube. In admin mode you can paste links or video IDs and add your own notes.",
    ytIntroRights:
      "Videos are embedded directly from YouTube—you’re not downloading or rehosting them.",
    // --- Next Race page ---
nextRacePageTitle: "Next Race",
nextRacePageSubtitle: "Grand Prix schedule, weather and session results.",
nextRaceIntroMain: "Upcoming Grand Prix schedule, local Atlantic time. Admin mode lets you edit all details and results.",
nextRaceIntroNote: "All times shown in Atlantic Time.",

// --- Next Race: Sessions ---
nextRaceSession1: "Session 1",
nextRaceSession2: "Session 2",
nextRaceSession3: "Session 3",
nextRaceSession4: "Session 4",
nextRaceResultsNote:
  "One line per driver. Enter position, time, or a short note.",


// --- Next Race: Weather card ---
nextRaceWeatherTitle: "Weather Forecast",
nextRaceWeatherSubtitle: "Expected track and air temperatures for race day.",

// --- Next Race: Track info ---
nextRaceTrackTitle: "Track Information",
nextRaceLocationLabel: "Location",
nextRaceDateLabel: "Race date",

  },

  fr: {
    navMoreNews: "Plus de news",
    navMoreYouTube: "Plus de YouTube",
    navPoints: "Points",
    navNextRace: "Infos prochaine course",
    navComments: "Commentaires",
navBackHome: "Retour à l’accueil",
  navHome: "Accueil",
  navF1News: "Actu F1",
  navYouTube: "YouTube",

    pointsPageTitle: "Points au championnat",
    pointsPageSubtitle:
      "Classement en direct des pilotes et des constructeurs.",
    pointsTopThreeTitle: "Top 3 au classement",
    pointsTopThreeSubtitle:
      "Les 3 meilleurs pilotes au classement des points.",
    pointsDriversTitle: "Classement pilotes",
    pointsConstructorsTitle: "Classement constructeurs",
        // --- F1 News page ---
    f1NewsHeaderTitle: "Actu F1",
    f1NewsIntroMain:
      "Votre propre tableau d’actualités Formule 1. En mode admin, vous pouvez ajouter des titres, sources, liens et un court résumé pour chaque article.",
    f1NewsIntroRights:
      "Cette page renvoie vers des sites d’actualités externes. Nous n’hébergeons ni ne copions les articles complets ; tous les droits restent aux éditeurs et auteurs d’origine.",
    // --- Page YouTube ---
    ytPageTitle: "YouTube F1",
    ytIntroMain:
      "Vidéos de Formule 1 sélectionnées sur YouTube. En mode admin vous pouvez coller des liens ou des IDs de vidéo et ajouter vos notes.",
    ytIntroRights:
      "Les vidéos sont intégrées directement depuis YouTube — vous ne les téléchargez ni ne les hébergez vous-même.",
    // --- Page prochaine course ---
    nextRacePageTitle: "Prochaine course",
    nextRaceIntroMain:
      "Programme du prochain Grand Prix, heure locale de l’Atlantique. En mode admin vous pouvez modifier tous les détails et les résultats.",
    nextRaceIntroNote: "Tous les horaires sont en heure de l’Atlantique.",
nextRacePageTitle: "Prochaine course",
nextRacePageSubtitle: "Programme du Grand Prix, météo et résultats des sessions.",

nextRaceWeekendTitle: "Programme du week-end de course",
nextRaceWeekendSubtitle: "Essais, qualifications, sprint et course.",

nextRaceWeatherTitle: "Météo et conditions de piste",
nextRaceWeatherSubtitle: "Prévisions et informations sur la piste pour le week-end.",

// --- Next Race: Sessions ---
nextRaceSessionsTitle: "Résultats des sessions",
nextRaceSessionsSubtitle: "Performances et résultats session par session.",


nextRaceSession1: "Séance 1",
nextRaceSession2: "Séance 2",
nextRaceSession3: "Séance 3",
nextRaceSession4: "Séance 4",

nextRaceResultsNote: "Une ligne par pilote. Indiquez la position, le temps ou une courte note.",


  },

  es: {
    navMoreNews: "Más noticias",
    navMoreYouTube: "Más YouTube",
    navPoints: "Puntos",
    navNextRace: "Próxima carrera",
    navComments: "Comentarios",
navBackHome: "Volver al inicio",
  navHome: "Inicio",
  navF1News: "Noticias F1",
  navYouTube: "YouTube",

    pointsPageTitle: "Puntos del campeonato",
    pointsPageSubtitle:
      "Clasificación en vivo de pilotos y constructores.",
    pointsTopThreeTitle: "Tres primeros en puntos",
    pointsTopThreeSubtitle:
      "Actual top 3 en la clasificación de pilotos.",
    pointsDriversTitle: "Clasificación de pilotos",
    pointsConstructorsTitle: "Clasificación de constructores",
        // --- F1 News page ---
    f1NewsHeaderTitle: "Noticias de F1",
    f1NewsIntroMain:
      "Tu propio panel de noticias de Fórmula 1. En modo admin puedes añadir titulares, fuentes, enlaces y un breve resumen para cada noticia.",
    f1NewsIntroRights:
      "Esta página enlaza a sitios de noticias externos. No alojamos ni copiamos los artículos completos; todos los derechos siguen siendo de los editores y autores originales.",
    // --- Página de YouTube ---
    ytPageTitle: "YouTube F1",
    ytIntroMain:
      "Vídeos de Fórmula 1 seleccionados de YouTube. En modo admin puedes pegar enlaces o IDs de vídeo y añadir tus notas.",
    ytIntroRights:
      "Los vídeos se incrustan directamente desde YouTube; no los descargas ni los vuelves a alojar.",
    // --- Página próxima carrera ---
    nextRacePageTitle: "Próxima carrera",
    nextRaceIntroMain:
      "Calendario del próximo Gran Premio en hora local del Atlántico. En modo admin puedes editar todos los detalles y resultados.",
    nextRaceIntroNote: "Todos los horarios se muestran en hora del Atlántico.",
nextRacePageTitle: "Próxima carrera",
nextRacePageSubtitle: "Horario del Gran Premio, clima y resultados de sesiones.",

nextRaceWeekendTitle: "Programa del fin de semana",
nextRaceWeekendSubtitle: "Prácticas, clasificación, sprint y carrera.",

nextRaceWeatherTitle: "Clima y condiciones de pista",
nextRaceWeatherSubtitle: "Pronóstico y detalles de la pista para el fin de semana.",

// --- Next Race: Sessions ---
nextRaceSessionsTitle: "Resultados por sesión",
nextRaceSessionsSubtitle: "Rendimiento y resultados sesión por sesión.",

nextRaceSession1: "Sesión 1",
nextRaceSession2: "Sesión 2",
nextRaceSession3: "Sesión 3",
nextRaceSession4: "Sesión 4",

nextRaceResultsNote: "Una línea por piloto. Escribe posición, tiempo o una nota breve.",


  },

  it: {
    navMoreNews: "Altre news",
    navMoreYouTube: "Altro YouTube",
    navPoints: "Punti",
    navNextRace: "Prossima gara",
    navComments: "Commenti",
navBackHome: "Torna alla home",
  navHome: "Home",
  navF1News: "Notizie F1",
  navYouTube: "YouTube",

    pointsPageTitle: "Punti del campionato",
    pointsPageSubtitle:
      "Classifica in tempo reale di piloti e costruttori.",
    pointsTopThreeTitle: "Primi tre in classifica",
    pointsTopThreeSubtitle:
      "Attuali primi 3 nella classifica piloti.",
    pointsDriversTitle: "Classifica piloti",
    pointsConstructorsTitle: "Classifica costruttori",
        // --- F1 News page ---
    f1NewsHeaderTitle: "Notizie F1",
    f1NewsIntroMain:
      "La tua bacheca personale di notizie di Formula 1. In modalità admin puoi aggiungere titoli, fonti, link e un breve riassunto per ogni articolo.",
    f1NewsIntroRights:
      "Questa pagina rimanda a siti di news esterni. Non ospitiamo né copiamo gli articoli completi; tutti i diritti restano agli editori e agli autori originali.",
    // --- Pagina YouTube ---
    ytPageTitle: "YouTube F1",
    ytIntroMain:
      "Video di Formula 1 selezionati da YouTube. In modalità admin puoi incollare link o ID dei video e aggiungere le tue note.",
    ytIntroRights:
      "I video sono incorporati direttamente da YouTube: non li scarichi e non li ripubblichi.",
    // --- Pagina prossima gara ---
    nextRacePageTitle: "Prossima gara",
    nextRaceIntroMain:
      "Programma del prossimo Gran Premio, ora locale atlantica. In modalità admin puoi modificare tutti i dettagli e i risultati.",
    nextRaceIntroNote: "Tutti gli orari sono indicati in ora atlantica.",
nextRacePageTitle: "Prossima gara",
nextRacePageSubtitle: "Programma del Gran Premio, meteo e risultati delle sessioni.",

nextRaceWeekendTitle: "Programma del weekend di gara",
nextRaceWeekendSubtitle: "Prove libere, qualifiche, sprint e gara.",

nextRaceWeatherTitle: "Meteo e condizioni pista",
nextRaceWeatherSubtitle: "Previsioni e dettagli sulla pista per il weekend.",

// --- Next Race: Sessions ---
nextRaceSessionsTitle: "Risultati per sessione",
nextRaceSessionsSubtitle: "Prestazioni e risultati sessione per sessione.",

nextRaceSession1: "Sessione 1",
nextRaceSession2: "Sessione 2",
nextRaceSession3: "Sessione 3",
nextRaceSession4: "Sessione 4",

nextRaceResultsNote: "Una riga per pilota. Inserisci posizione, tempo o una breve nota.",

  },

  de: {
    navMoreNews: "Mehr News",
    navMoreYouTube: "Mehr YouTube",
    navPoints: "Punkte",
    navNextRace: "Nächstes Rennen",
    navComments: "Kommentare",
navBackHome: "Zur Startseite",
  navHome: "Start",
  navF1News: "F1-News",
  navYouTube: "YouTube",

    pointsPageTitle: "Meisterschaftspunkte",
    pointsPageSubtitle:
      "Live-Tabelle für Fahrer und Konstrukteure.",
    pointsTopThreeTitle: "Top drei in Punkten",
    pointsTopThreeSubtitle:
      "Aktuelle Top 3 in der Fahrerwertung.",
    pointsDriversTitle: "Fahrerwertung",
    pointsConstructorsTitle: "Konstrukteurswertung",
        // --- F1 News page ---
    f1NewsHeaderTitle: "F1-News",
    f1NewsIntroMain:
      "Dein eigenes, kuratiertes Formel-1-Newsboard. Im Admin-Modus kannst du Überschriften, Quellen, Links und eine kurze Zusammenfassung für jeden Artikel hinzufügen.",
    f1NewsIntroRights:
      "Diese Seite verlinkt auf externe Newssites. Wir hosten oder kopieren keine vollständigen Artikel; alle Rechte bleiben bei den ursprünglichen Verlagen und Autoren.",
    // --- YouTube-Seite ---
    ytPageTitle: "F1 YouTube News",
    ytIntroMain:
      "Ausgewählte Formel-1-Videos von YouTube. Im Admin-Modus kannst du Links oder Video-IDs einfügen und deine eigenen Notizen hinzufügen.",
    ytIntroRights:
      "Die Videos werden direkt von YouTube eingebettet – du lädst sie nicht herunter und hostest sie nicht selbst.",
    // --- Seite nächstes Rennen ---
    nextRacePageTitle: "Nächstes Rennen",
    nextRaceIntroMain:
      "Zeitplan des nächsten Grand Prix in lokaler Atlantikzeit. Im Admin-Modus kannst du alle Details und Ergebnisse bearbeiten.",
    nextRaceIntroNote: "Alle Zeiten sind in Atlantikzeit angegeben.",
nextRacePageTitle: "Nächstes Rennen",
nextRacePageSubtitle: "Grand-Prix-Zeitplan, Wetter und Session-Ergebnisse.",

nextRaceWeekendTitle: "Rennwochenende-Zeitplan",
nextRaceWeekendSubtitle: "Training, Qualifying, Sprint und Rennen.",

nextRaceWeatherTitle: "Wetter & Streckenbedingungen",
nextRaceWeatherSubtitle: "Vorhersage und Streckeninfos für das Rennwochenende.",

// --- Next Race: Sessions ---
nextRaceSessionsTitle: "Ergebnisse pro Session",
nextRaceSessionsSubtitle: "Leistungen und Resultate Session für Session.",

nextRaceSession1: "Sitzung 1",
nextRaceSession2: "Sitzung 2",
nextRaceSession3: "Sitzung 3",
nextRaceSession4: "Sitzung 4",

nextRaceResultsNote: "Eine Zeile pro Fahrer. Trage Position, Zeit oder eine kurze Notiz ein.",


  },
};

// src/translations.js


export function getTranslations(langOverride) {
  const lang = String(langOverride || getCurrentLanguage() || "en").toLowerCase();
  return TRANSLATIONS[lang] || TRANSLATIONS.en;
}

