/* =====================================================================
   EUROMONT KALKULATOR – OVDE MENJATE CENE I OPCIJE
   Sve cene su u evrima i sa PDV-om. Brojevi su OKVIRNE POČETNE VREDNOSTI,
   zamenite ih svojim cenama. Ostale fajlove ne morate da dirate.
   ===================================================================== */
window.KALKULATOR_CENE = {

  valuta: "€",
  datumCenovnika: "23. 10. 2026",   // prikazuje se na vrhu kalkulatora
  minPovrsinaM2: 0.5,               // najmanja površina koja se obračunava (m²)
  udeoStakla: 0.75,                 // deo površine elementa koji je staklo (doplata za staklo se računa na to)
  roletnaKutijaCm: 20,              // kada se izabere roletna, ovoliko cm visine ide na kutiju (oduzima se od stolarije)
  precka: { cenaPoM: 9 },           // cena prečke po metru dužine
  // Faktor cene po tipu polja (množi cenu po m² te površine):
  faktoriKrila: { krilo: 1, fiks: 0.75, klizno: 1.5 },

  // 1) SISTEMI – osnovna cena po m² (uf = toplotna vrednost profila, samo se prikazuje)
  sistemi: {
    ideal4000:     { naziv: "PVC IDEAL 4000",    dubina: "aluplast · 70 mm", uf: "1.3",  cenaPoM2: 70 },
    intertec85:    { naziv: "PVC INTERTEC 85",   dubina: "aluplast · 85 mm", uf: "1.0",  cenaPoM2: 82 },
    multilock4600: { naziv: "ALU MULTILOCK 4600", dubina: "Elvial · 69 mm",  uf: "2.5",  cenaPoM2: 150 },
    essence67:     { naziv: "ALU ESSENCE W67",   dubina: "Elvial · 67 mm",   uf: "≥ 1.1", cenaPoM2: 175 }
  },

  // 2) TIPOVI ELEMENATA (početni raspored; kupac ga posle sam menja prevlačenjem prečki)
  //    grupa: prozori / kombinacije / vrata / ulazna (kartica u kojoj se prikazuje)
  //    faktor: množi cenu celog elementa (1 = bez promene, 1.05 = +5%)
  //    def: početna širina i visina u cm
  //    r: raspored po redovima [udeo visine, "polja odvojena zarezom", [udeli širina - nije obavezno]]
  //       F = fiksno, LT / DT = okretno-kipno levo / desno, T = samo kip,
  //       S< / S> = klizno (strelica pokazuje smer klizanja)
  //       Vrata: LK / DK = karolaj krilo (staklo gore, panel dole), LU / DU = UK panel krilo (uzak prozorčić)
  //    udeo (nije obavezno): deo površine koji je staklo, za vrata sa panelom (inače važi udeoStakla)
  //    roletna / komarnik (nije obavezno): false = opcija se ne nudi, true = nudi se uvek (komarnik na elementu bez krila računa se na celu površinu).
  //       Ako ih ne navedete, važi pravilo: roletna se ne nudi za ulazna vrata; komarnik samo ako element
  //       ima krilo koje se otvara ili klizi (ne za fiks, svetlarnik i ulazna vrata).
  //    lim (nije obavezno): [min širina, max širina, min visina, max visina]
  tipovi: {
    jp:        { grupa: "prozori",     naziv: "Jednokrilni prozor",          kod: "JP",   faktor: 1,    def: [120, 140], r: [[1, "LT"]] },
    dp:        { grupa: "prozori",     naziv: "Dvokrilni prozor",            kod: "DP",   faktor: 1,    def: [140, 140], r: [[1, "LT,DT"]] },
    dvodelni:  { grupa: "prozori",     naziv: "Prozorsko krilo + FIKS",     kod: "JP + FIX",   faktor: 1,    def: [140, 140], r: [[1, "LT,F"]] },
    fiks:      { grupa: "prozori",     naziv: "Fiksni prozor",               kod: "FIX",  faktor: 1,    def: [100, 100], r: [[1, "F"]] },
    svetlarnik:{ grupa: "prozori",     naziv: "Svetlarnik",                  kod: "SV",   faktor: 0.9,  def: [100, 50],  r: [[1, "T"]], lim: [40, 300, 30, 100], roletna: false, komarnik: false },
    trokrilni: { grupa: "kombinacije", naziv: "Trokrilni (krilo-fiks-krilo)", kod: "TR",  faktor: 1,    def: [200, 140], r: [[1, "LT,F,DT"]] },
    fiksjp:    { grupa: "kombinacije", naziv: "FIKS + prozorsko krilo",     kod: "FIX + JP",     faktor: 1, def: [140, 140], r: [[1, "F,LT"]] },
    fiksjpfiks:{ grupa: "kombinacije", naziv: "FIKS + krilo + FIKS",        kod: "FIX + JP + FIX", faktor: 1, def: [200, 140], r: [[1, "F,LT,F"]] },
    fiksdp:    { grupa: "kombinacije", naziv: "FIKS + dvokrilni",           kod: "FIX + DP",     faktor: 1, def: [200, 140], r: [[1, "F,LT,DT"]] },
    fiksprecke:{ grupa: "kombinacije", naziv: "FIKS sa prečkama",           kod: "FIX PREČKE",   faktor: 1, def: [200, 140], r: [[0.3, "F"], [0.7, "F,F,F"]], komarnik: true },
    preckejp:  { grupa: "kombinacije", naziv: "Prečke + srednje krilo",     kod: "PREČKE + JP",  faktor: 1, def: [200, 140], r: [[0.3, "F"], [0.7, "F,LT,F", [0.35, 0.3, 0.35]]] },
    nadsvetlo: { grupa: "kombinacije", naziv: "Prozor + nadsvetlo",          kod: "JP+N", faktor: 1,    def: [100, 180], r: [[0.25, "F"], [0.75, "LT"]] },
    bal1:      { grupa: "vrata",       naziv: "Balkonska jednokrilna",       kod: "BV",   faktor: 1.05, def: [80, 210],  r: [[1, "LT"]] },
    bal2:      { grupa: "vrata",       naziv: "Balkonska dvokrilna",         kod: "BV2",  faktor: 1.05, def: [140, 210], r: [[1, "LT,DT"]] },
    balfiks:   { grupa: "vrata",       naziv: "Balkonska + fiks",            kod: "BV+F", faktor: 1.05, def: [130, 210], r: [[1, "LT,F"]] },
    klizna2:   { grupa: "vrata",       naziv: "Klizna balkonska (2 krila)",  kod: "KL2",  faktor: 1,    def: [200, 220], r: [[1, "F,S<"]],   klizno: true, lim: [120, 500, 180, 250] },
    klizna3:   { grupa: "vrata",       naziv: "Klizna balkonska (3 krila)",  kod: "KL3",  faktor: 1,    def: [300, 220], r: [[1, "S>,F,S<"]], klizno: true, lim: [180, 600, 180, 250] },
    karolaj1:  { grupa: "ulazna",      naziv: "Karolaj vrata 1K",            kod: "KAROL",     faktor: 1.3, udeo: 0.4, def: [100, 210], r: [[1, "LK"]] },
    karolaj2:  { grupa: "ulazna",      naziv: "Karolaj vrata 2K",            kod: "KAROL 2K",  faktor: 1.3, udeo: 0.4, def: [140, 210], r: [[1, "LK,DK"]] },
    ukpanel1:  { grupa: "ulazna",      naziv: "UK panel vrata 1K",           kod: "UK PANEL",  faktor: 1.3, udeo: 0.3, def: [100, 210], r: [[1, "LU"]] },
    ukpanel2:  { grupa: "ulazna",      naziv: "UK panel vrata 2K",           kod: "UK PANEL 2K", faktor: 1.3, udeo: 0.3, def: [140, 210], r: [[1, "LU,DU"]] },
    uknad1:    { grupa: "ulazna",      naziv: "UK panel + nadsvetlo",        kod: "UK + NADS", faktor: 1.3, udeo: 0.3, def: [100, 240], r: [[0.2, "F"], [0.8, "LU"]] },
    ukfiks1:   { grupa: "ulazna",      naziv: "FIKS + UK panel vrata",        kod: "FIX + UK",     faktor: 1.3, udeo: 0.5, def: [170, 210], r: [[1, "F,LU", [0.4, 0.6]]] },
    ukfiks2:   { grupa: "ulazna",      naziv: "FIKS + UK panel vrata + FIKS", kod: "FIX + UK + FIX", faktor: 1.3, udeo: 0.5, def: [220, 210], r: [[1, "F,LU,F", [0.25, 0.5, 0.25]]] },
    uknad2:    { grupa: "ulazna",      naziv: "UK panel 2K + nadsvetlo",     kod: "UK 2K + NADS", faktor: 1.3, udeo: 0.3, def: [140, 240], r: [[0.2, "F"], [0.8, "LU,DU"]] }
  },

  // Dozvoljene dimenzije u cm po grupi: s = širina [min, max], v = visina [min, max]
  granice: {
    prozori:     { s: [40, 300], v: [40, 250] },
    kombinacije: { s: [40, 350], v: [40, 300] },
    vrata:       { s: [60, 300], v: [180, 250] },
    ulazna:      { s: [70, 250], v: [190, 300] }
  },

  // 3) BOJE – dopuna kao deo osnovne cene (0.15 = +15%), hex samo za izgled slike
  boje: {
    bela:   { naziv: "Bela",             hex: "#ffffff", dopuna: 0 },
    antracit:{ naziv: "Antracit",        hex: "#3b4147", dopuna: 0.2 },
    hrast:  { naziv: "Zlatni hrast",     hex: "#c4963f", dopuna: 0.15 },
    orah:   { naziv: "Orah",             hex: "#6b4423", dopuna: 0.15 },
    mahagoni:{ naziv: "Mahagoni",        hex: "#7a2e22", dopuna: 0.15 },
    ral:    { naziv: "Druga boja (RAL)", hex: "#9aa0a6", dopuna: 0.25 }
  },

  // 4) STAKLO – doplata po m² staklene površine (0 = uračunato u osnovnu cenu)
  stakla: {
    termo:     { naziv: "Termo 4-16-4", doplataPoM2: 0 },
    lowe:      { naziv: "Low-E",        doplataPoM2: 7 },
    troslojno: { naziv: "Troslojno",    doplataPoM2: 14 },
    mat:       { naziv: "Mat / pesak",  doplataPoM2: 7 }
  },

  // 5) ROLETNE – poM2 = cena po m², fiksno = doplata po komadu (npr. motor)
  roletne: {
    bez:        { naziv: "Bez roletne",                  poM2: 0,  fiksno: 0 },
    rucna:      { naziv: "Roletna – ručno (gurt)",       poM2: 45, fiksno: 0 },
    elektricna: { naziv: "Roletna – električna (motor)", poM2: 45, fiksno: 80 }
  },
  roletneMinM2: 1,                  // roletna se računa na ukupnu površinu (širina × ukupna visina, sa kutijom)

  // 6) KOMARNICI – cena po m²
  komarnici: {
    bez:  { naziv: "Bez komarnika",   poM2: 0 },
    ram:  { naziv: "Komarnik na ram", poM2: 18 },
    rolo: { naziv: "Rolo komarnik",   poM2: 38 }
  },
  komarniciMinM2: 0.5,

  // 7) KONTAKT za dugme "Pošalji upit" i "Pozovite nas"
  kontakt: { email: "euromont@gmail.com", telefon: "065 555 4449", adresa: "Trg bratstva jedinstva 25/3, Vranje" },

  napomena: "Cene su informativne i sa PDV-om. Tačnu ponudu dobijate nakon merenja."
};
