/* ══════════════════════════════════════════════════════
   storage.js – Gruppen·Checkpoint
   DATEN-EBENE: Konfiguration (Mitarbeitende, Aufgaben, Kostenstellen)
   sowie sämtliche localStorage-Lade-/Speicherfunktionen.
   Studjo | Evangelisches Johanneswerk
   ══════════════════════════════════════════════════════ */
/* ═══ KONFIGURATION ═══ */
var GRUPPE={
  name:"Gruppe Freisenberg",woche:"KW 31 | 28.07.\u201301.08.2025",
  wichtig:"Roter Hubwagen defekt! Bitte NICHT benutzen.",
  zustaendigkeiten:[
    {personId:1,aufgabeId:"fegen",typ:"checkliste"},{personId:2,aufgabeId:"muell",typ:"checkliste"},
    {personId:3,aufgabeId:"tische",typ:"checkliste"},{personId:4,aufgabeId:"geschirr",typ:"checkliste"},
    {personId:5,aufgabeId:"fenster",typ:"checkliste"},{personId:6,aufgabeId:"strom",typ:"checkliste"},
    {personId:7,aufgabeId:"tuerklinken",typ:"checkliste"},{personId:8,aufgabeId:"versandvorbereitung",typ:"checkliste"},
    {personId:9,aufgabeId:"sicherheit",typ:"checkliste"},{personId:10,aufgabeId:"arbeitsvorbereitung",typ:"checkliste"},
    {personId:11,aufgabeId:"checkpoint",typ:"checkliste"},{personId:14,aufgabeId:"essensmarken",typ:"checkliste"},
    {personId:1,aufgabeId:"betriebsmittel",typ:"allgemein"},{personId:2,aufgabeId:"botengaenge",typ:"allgemein"},
    {personId:12,aufgabeId:"botengaenge",typ:"allgemein"},{personId:3,aufgabeId:"hubwagen",typ:"allgemein"},
    {personId:5,aufgabeId:"qualitaet",typ:"allgemein"},{personId:13,aufgabeId:"diensttelefon",typ:"allgemein"},
    {personId:7,aufgabeId:"materialbeschaffung",typ:"allgemein"},{personId:15,aufgabeId:"mentor",typ:"allgemein"}
  ]
};
var ZUORDNUNG_DEFAULT=JSON.parse(JSON.stringify(GRUPPE.zustaendigkeiten));

var MITARBEITENDE=[
  {id:1,name:"Anna B."},{id:2,name:"Thomas K."},{id:3,name:"Maria S."},{id:4,name:"Klaus H."},
  {id:5,name:"Sandra M."},{id:6,name:"Peter W."},{id:7,name:"Nicole F."},{id:8,name:"Stefan R."},
  {id:9,name:"Monika L."},{id:10,name:"Michael G."},{id:11,name:"Christine D."},{id:12,name:"Andreas N."},
  {id:13,name:"Sabine T."},{id:14,name:"Markus E."},{id:15,name:"Ursula C."},{id:16,name:"Frank J."}
];
/* ═══ Foto-Funktion: Portraits liegen als echte Dateien im Ordner "fotos"
   (nicht in localStorage/Cloud) – Dateiname wird aus dem Namen abgeleitet,
   z.B. "Anna B." -> "anna_b.jpg". Kein Foto vorhanden = Bild wird per
   onerror ausgeblendet, es gibt keinen Fehler. ═══ */
function dateiNameFuerFoto(name){
  var s=(name||'').toLowerCase()
    .replace(/ä/g,'ae').replace(/ö/g,'oe').replace(/ü/g,'ue').replace(/ß/g,'ss')
    .replace(/\./g,'').replace(/\s+/g,'_')
    .replace(/[^a-z0-9_]/g,'');
  return (s||'foto')+'.jpg';
}
function fotoPfad(name){return 'fotos/'+dateiNameFuerFoto(name);}
var AUFGABEN={
  checkpoint:{label:"Kontrolle Checkpoint",foto:"check-checkpoint.jpg",typ:"checkliste"},
  arbeitsvorbereitung:{label:"Arbeit vorbereiten",foto:"check-arbeitsvorbereitung.jpg",typ:"checkliste"},
  sicherheit:{label:"Arbeitssicherheit pr\u00fcfen",foto:"check-sicherheit.jpg",typ:"checkliste"},
  essensmarken:{label:"Essensmarken zuordnen",foto:"check-essensmarken.jpg",typ:"checkliste"},
  fegen:{label:"Boden fegen",foto:"check-fegen.jpg",typ:"checkliste"},
  fenster:{label:"Fenster schlie\u00dfen",foto:"check-fenster.jpg",typ:"checkliste"},
  geschirr:{label:"Geschirr wegr\u00e4umen",foto:"check-geschirr.jpg",typ:"checkliste"},
  muell:{label:"M\u00fcll entsorgen",foto:"check-muell.jpg",typ:"checkliste"},
  strom:{label:"Strom ausschalten",foto:"check-strom.jpg",typ:"checkliste"},
  tische:{label:"Tische wischen",foto:"check-tische.jpg",typ:"checkliste"},
  tuerklinken:{label:"T\u00fcrklinken desinfizieren",foto:"check-tuerklinken.jpg",typ:"checkliste"},
  versandvorbereitung:{label:"Versand vorbereiten",foto:"check-versandvorbereitung.jpg",typ:"checkliste"},
  rolliabholen:{label:"Rolli abholen",foto:"check-Rolliabholen.jpg",typ:"checkliste"},
  betriebsmittel:{label:"Betriebsmittel pr\u00fcfen",foto:"zust-betriebsmittel.jpg",typ:"allgemein"},
  botengaenge:{label:"Boteng\u00e4nge",foto:"zust-botengaenge.jpg",typ:"allgemein"},
  diensttelefon:{label:"Dienst-Telefon",foto:"zust-diensttelefon.jpg",typ:"allgemein"},
  hubwagen:{label:"Hubwagen fahren",foto:"zust-hubwagen.jpg",typ:"allgemein"},
  materialbeschaffung:{label:"Materialbeschaffung",foto:"zust-materialbeschaffung.jpg",typ:"allgemein"},
  mentor:{label:"Mentor / Pate",foto:"zust-mentor.jpg",typ:"allgemein"},
  qualitaet:{label:"Qualit\u00e4t pr\u00fcfen",foto:"zust-qualitaet.jpg",typ:"allgemein"},
  teilezaehlen:{label:"Teile z\u00e4hlen",foto:"zust-Teilezählen.jpg",typ:"allgemein"},
  materialholen:{label:"Material holen",foto:"zust-Materialholen.jpg",typ:"allgemein"}
};
function sortierteCheckIds(){
  var rest=Object.keys(AUFGABEN).filter(function(id){return AUFGABEN[id].typ==='checkliste'&&id!=='checkpoint';})
           .sort(function(a,b){return AUFGABEN[a].label.localeCompare(AUFGABEN[b].label,'de');});
  return ['checkpoint'].concat(rest);
}
function sortierteZustIds(){
  return Object.keys(AUFGABEN).filter(function(id){return AUFGABEN[id].typ==='allgemein';})
         .sort(function(a,b){return AUFGABEN[a].label.localeCompare(AUFGABEN[b].label,'de');});
}

/* Originalliste als Fallback sichern (wird bei KST-Wechsel zurückgesetzt) */
var MITARBEITENDE_DEFAULT = MITARBEITENDE.map(function(p){return{id:p.id,name:p.name};});

/* ═══ KOSTENSTELLEN-KONFIGURATION ═══
   Trage hier alle Gruppen ein: KST-Nummer → Gruppenname
   Unbekannte 5-stellige Nummern werden ebenfalls akzeptiert. */
var GRUPPEN_CONFIG = {
  '50200': 'Gruppe Freisenberg',
  '50301': 'Gruppe Wefelshohl',
  '50412': 'Gruppe Kerkhagen',
  '50500': 'Gruppe Kierspie',
  '50601': 'Gruppe Werdohl',
  '50702': 'Gruppe Dannenbaum',
  '50803': 'Gruppe Auf der Heide'
  /* weitere Gruppen hier ergänzen */
};

/* ═══ AKTIVE KOSTENSTELLE ═══ */
var AKTIVE_KST = '';

/* Alle Storage-Keys dynamisch mit KST-Prefix */
var STATE_KEY='', ASSIGN_KEY='', NAMEN_KEY='', CHECKS_KEY='',
    LEITUNG_KEY='', TERMINE_KEY='', WICHTIG_KEY='', ZEITEN_KEY='', PROFIL_KEY='';

function setzeKSTKeys(kst) {
  AKTIVE_KST  = kst;
  STATE_KEY   = kst + '-chk-state-v4';
  ASSIGN_KEY  = kst + '-chk-assign-v3';
  NAMEN_KEY   = kst + '-chk-namen-v2';
  CHECKS_KEY  = kst + '-chk-checks-v2';
  LEITUNG_KEY = kst + '-chk-leitung-v1';
  TERMINE_KEY = kst + '-chk-termine-v1';
  WICHTIG_KEY = kst + '-chk-wichtig-v1';
  ZEITEN_KEY  = kst + '-chk-zeiten-v1';
  PROFIL_KEY  = kst + '-chk-profil-v1';
  setzeArbeitKey(kst);
  setzeAufgNotizKey(kst);
}

function zeigeKstEingabe(){
  document.getElementById('kst-login-overlay').style.display='flex';
  setTimeout(function(){var f=document.getElementById('kst-input');if(f){f.value='';f.focus();}},80);
}
function kstBestaetigen(){
  var kst=(document.getElementById('kst-input').value||'').trim();
  if(!/^\d{5}$/.test(kst)){
    document.getElementById('kst-fehler').textContent='Bitte genau 5 Ziffern eingeben.';
    return;
  }
  document.getElementById('kst-fehler').textContent='';
  wechsleKostenstelle(kst);
}
function wechsleKostenstelle(kst) {
  setzeKSTKeys(kst);
  localStorage.setItem('chk-letzte-kst', kst);

  /* Alle Daten für diese KST frisch laden */
  GRUPPE.zustaendigkeiten = JSON.parse(JSON.stringify(ZUORDNUNG_DEFAULT));
  AKTIVE_CHECKS = sortierteCheckIds();
  LEITUNG       = {namen:['','',''], aktiv:0};
  TERMINE = {frei:[{datum:'',text:'',uhrzeit:''},{datum:'',text:'',uhrzeit:''}], pflicht:[
    {id:'fruehrunde',label:'Fr\u00fchrunde',icon:'&#9728;',datum:'',uhrzeit:''},
    {id:'gruppenstunde',label:'Gruppenstunde',icon:'&#128101;',datum:'',uhrzeit:''},
    {id:'dienstbesprechung',label:'Dienstbesprechung',icon:'&#128203;',datum:'',uhrzeit:''},
    {id:'geburtstag',label:'Geburtstagsfeier',icon:'&#127874;',datum:'',uhrzeit:''},
    {id:'ausflug',label:'Gruppenausflug',icon:'&#128652;',datum:'',uhrzeit:''}
  ]};
  WICHTIG = [{kategorie:'',text:''},{kategorie:'',text:''}];
  ZEITEN  = {};

  /* Gespeicherte Daten dieser KST laden */
  var raw = ladeLS(STATE_KEY);
  STATE = (raw && raw.datum === heute()) ? raw : {datum:heute(),abwesend:[],erledigt:[],vertretungen:{}};
  if (!STATE.vertretungen) STATE.vertretungen = {};
  if (!STATE.abwesendWeiteres) STATE.abwesendWeiteres = [];

  ladeZuordnung();ladeNamen();ladeAktiveChecks();ladeLeitung();ladeTermine();ladeWichtig();ladeZeiten();ladeArbeitsnotizen();ladeProfil();ladeAufgabenNotizen();

  /* Banner aktualisieren */
  var gruppenname = GRUPPEN_CONFIG[kst] || 'Kostenstelle ' + kst;
  document.getElementById('banner-name').textContent = gruppenname;
  document.getElementById('kst-anzeige-nr').textContent = kst;
  document.getElementById('kst-login-overlay').style.display = 'none';

  /* Alles neu rendern */
  MITARBEITENDE.splice(0, MITARBEITENDE.length);
  MITARBEITENDE_DEFAULT.forEach(function(p){ MITARBEITENDE.push({id:p.id, name:p.name}); });
  ladeNamen();
  renderNamen(); renderLeitung(); renderTermine(); renderWichtig(); renderCheckliste(); initSortable();
}
/* ═══ PERSONEN-PROFIL ═══ */
var PROFIL={};
function ladeProfil(){var s=ladeLS(PROFIL_KEY);if(s&&typeof s==='object')PROFIL=s;}
function speichereProfil(){if(PROFIL_KEY)localStorage.setItem(PROFIL_KEY,JSON.stringify(PROFIL));}
function profilFarbe(personId,aufgabeId){return (PROFIL[personId]||{})[aufgabeId]||'';}
function profilBgKl(personId,aufgabeId){var w=profilFarbe(personId,aufgabeId);return w?'profil-bg-'+w:'';}

/* Feature 4: Export / Import der KST-Daten */
function exportierenKST(){
  var keys=[STATE_KEY,ASSIGN_KEY,NAMEN_KEY,CHECKS_KEY,LEITUNG_KEY,TERMINE_KEY,WICHTIG_KEY,ZEITEN_KEY,ARBEIT_KEY,PROFIL_KEY];
  var data={};
  keys.forEach(function(k){var v=localStorage.getItem(k);if(v)data[k]=v;});
  data['__kst']=AKTIVE_KST;
  var blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
  var url=URL.createObjectURL(blob);
  var a=document.createElement('a');a.href=url;a.download='checkpoint-'+AKTIVE_KST+'-'+heute()+'.json';
  document.body.appendChild(a);a.click();document.body.removeChild(a);URL.revokeObjectURL(url);
}
function importierenKST(){
  var inp=document.createElement('input');inp.type='file';inp.accept='.json';
  inp.onchange=function(e){
    var f=e.target.files[0];if(!f)return;
    var r=new FileReader();
    r.onload=function(ev){
      try{
        var d=JSON.parse(ev.target.result);
        Object.keys(d).forEach(function(k){if(k!=='__kst')localStorage.setItem(k,d[k]);});
        wechsleKostenstelle(AKTIVE_KST);
        alert('Daten f\u00fcr KST '+AKTIVE_KST+' erfolgreich geladen.');
      }catch(err){alert('Fehler beim Laden: '+err.message);}
    };
    r.readAsText(f);
  };
  inp.click();
}
function heute(){return new Date().toISOString().slice(0,10);}
function ladeLS(k){try{return JSON.parse(localStorage.getItem(k));}catch(e){return null;}}
function speichereState(){localStorage.setItem(STATE_KEY,JSON.stringify(STATE));}

var raw=ladeLS(STATE_KEY);
var STATE=(raw&&raw.datum===heute())?raw:{datum:heute(),abwesend:[],abwesendWeiteres:[],erledigt:[],vertretungen:{}};
if(!STATE.vertretungen)STATE.vertretungen={};
if(!STATE.abwesendWeiteres)STATE.abwesendWeiteres=[];
/* "Bis auf weiteres"-Abwesende aus letztem Tag wiederherstellen */
if(STATE.abwesendWeiteres.length){
  STATE.abwesendWeiteres.forEach(function(id){
    if(STATE.abwesend.indexOf(id)===-1)STATE.abwesend.push(id);
  });
}

function tagesReset(m){
  if(m&&!confirm('Tages-Reset?'))return;
  /* "Bis auf weiteres"-Vertretungen behalten, "Nur 1 Tag" löschen */
  var behalte={};
  Object.keys(STATE.vertretungen||{}).forEach(function(id){
    var v=STATE.vertretungen[id];
    var dauer=(typeof v==='object')?v.dauer:'1tag';
    if(dauer==='weiteres') behalte[id]=v;
  });
  STATE={datum:heute(),abwesend:(STATE.abwesendWeiteres||[]).slice(),abwesendWeiteres:(STATE.abwesendWeiteres||[]).slice(),erledigt:[],vertretungen:behalte};
  /* Arbeitsinhalte (Text/Schwierigkeitsstufe/Auslastung) bleiben seit Entfernen der
     "1 Tag"/"Bis auf weiteres"-Auswahl erhalten und werden beim Tages-Reset NICHT
     mehr automatisch gelöscht – manuelles Löschen weiterhin über den Modal-Button möglich. */
  speichereState();
  document.querySelectorAll('.namen-row').forEach(function(r){r.classList.remove('abwesend');});
  renderNamen();renderCheckliste();
}

/* Hilfsfunktionen für neue Vertretungs-Struktur {person, dauer} */
function getVertPerson(id){
  var v=STATE.vertretungen[id];
  if(v===undefined||v===null)return undefined;
  var p=(typeof v==='object')?v.person:v;
  /* Sicherstellen: Person-ID immer als Zahl, 'entfaellt' bleibt String */
  return (typeof p==='number'||p==='entfaellt')?p:(p?parseInt(p):undefined);
}
function getVertDauer(id){
  var v=STATE.vertretungen[id];
  if(!v||typeof v!=='object')return '1tag';
  return v.dauer||'1tag';
}

function ladeZuordnung(){
  var s=ladeLS(ASSIGN_KEY);
  if(s&&Array.isArray(s)){
    s=s.map(function(z){if(z.aufgabeId==='essensmarken')z.typ='checkliste';return z;});
    GRUPPE.zustaendigkeiten=s;
  }
}
function speichereZuordnung(){localStorage.setItem(ASSIGN_KEY,JSON.stringify(GRUPPE.zustaendigkeiten));}
function resetZuordnung(){
  if(!confirm('Alle Zuordnungen zur\u00fccksetzen?'))return;
  GRUPPE.zustaendigkeiten=JSON.parse(JSON.stringify(ZUORDNUNG_DEFAULT));
  localStorage.removeItem(ASSIGN_KEY);renderNamen();initSortable();renderCheckliste();
}

var NAMEN_DEFAULT=MITARBEITENDE.map(function(p){return{id:p.id,name:p.name};});
function ladeNamen(){
  var s=ladeLS(NAMEN_KEY);if(!s||!Array.isArray(s))return;
  var ordered=[];
  s.forEach(function(d){
    var p=MITARBEITENDE.find(function(p){return p.id===d.id;});
    if(p){if(d.name)p.name=d.name;ordered.push(p);}
    else if(d.id&&d.name){ordered.push({id:d.id,name:d.name});}  /* neu hinzugefügte Person */
  });
  if(ordered.length>0){
    MITARBEITENDE.splice(0,MITARBEITENDE.length);
    ordered.forEach(function(p){MITARBEITENDE.push(p);});
  }
}

var AKTIVE_CHECKS=sortierteCheckIds();
function ladeAktiveChecks(){var s=ladeLS(CHECKS_KEY);if(s&&Array.isArray(s))AKTIVE_CHECKS=s;}
function speichereAktiveChecks(){localStorage.setItem(CHECKS_KEY,JSON.stringify(AKTIVE_CHECKS));}

var LEITUNG={namen:['','',''],aktiv:0};
function ladeLeitung(){var s=ladeLS(LEITUNG_KEY);if(s)LEITUNG=s;}
function speichereLeitung(){localStorage.setItem(LEITUNG_KEY,JSON.stringify(LEITUNG));}

var TERMINE={frei:[{datum:'',text:'',uhrzeit:''},{datum:'',text:'',uhrzeit:''}],pflicht:[
  {id:'fruehrunde',label:'Fr\u00fchrunde',icon:'&#9728;',datum:'',uhrzeit:''},
  {id:'gruppenstunde',label:'Gruppenstunde',icon:'&#128101;',datum:'',uhrzeit:''},
  {id:'dienstbesprechung',label:'Dienstbesprechung',icon:'&#128203;',datum:'',uhrzeit:''},
  {id:'geburtstag',label:'Geburtstagsfeier',icon:'&#127874;',datum:'',uhrzeit:''},
  {id:'ausflug',label:'Gruppenausflug',icon:'&#128652;',datum:'',uhrzeit:''}
]};
function ladeTermine(){
  var s=ladeLS(TERMINE_KEY);if(!s)return;
  if(s.frei&&Array.isArray(s.frei))TERMINE.frei=s.frei;
  if(s.pflicht&&Array.isArray(s.pflicht))s.pflicht.forEach(function(sp){
    var p=TERMINE.pflicht.find(function(p){return p.id===sp.id;});
    if(p){p.datum=sp.datum||'';p.uhrzeit=sp.uhrzeit||'';}
  });
}
function speichereTermine(){localStorage.setItem(TERMINE_KEY,JSON.stringify(TERMINE));}

var WICHTIG_KAT=['Produktion','Qualifizierung','Unterweisung','Neue Mitarbeitende','Ausfall','Ver\u00e4nderung','Werkstattrat','Besuch','Motto der Woche','Sonstiges'];
var WICHTIG=[{kategorie:'',text:''},{kategorie:'',text:''}];
function ladeWichtig(){var s=ladeLS(WICHTIG_KEY);if(s&&Array.isArray(s))WICHTIG=s;}
function speichereWichtig(){localStorage.setItem(WICHTIG_KEY,JSON.stringify(WICHTIG));}

var ZEITEN={};
function ladeZeiten(){var s=ladeLS(ZEITEN_KEY);if(s)ZEITEN=s;}
function speichereZeiten(){localStorage.setItem(ZEITEN_KEY,JSON.stringify(ZEITEN));}

var ARBEIT_KEY='';
var ARBEITSNOTIZEN={};
function setzeArbeitKey(kst){ARBEIT_KEY=kst+'-chk-arbeit-v1';}
function ladeArbeitsnotizen(){var s=ladeLS(ARBEIT_KEY);if(s)ARBEITSNOTIZEN=s;}
function speichereArbeitsnotizen(){localStorage.setItem(ARBEIT_KEY,JSON.stringify(ARBEITSNOTIZEN));}

/* Editierbare, gespeicherte Notizen zu Checklisten-/Zuständigkeits-Aufgaben (nicht personenbezogen) */
var AUFGNOTIZ_KEY='';
var AUFGABEN_NOTIZEN={};
function setzeAufgNotizKey(kst){AUFGNOTIZ_KEY=kst+'-chk-aufgnotiz-v1';}
function ladeAufgabenNotizen(){var s=ladeLS(AUFGNOTIZ_KEY);if(s)AUFGABEN_NOTIZEN=s;}
function speichereAufgabenNotizen(){localStorage.setItem(AUFGNOTIZ_KEY,JSON.stringify(AUFGABEN_NOTIZEN));}

/* ── Aufgaben-Beschreibungen für Info-Popup (Feature 6) ── */
var AUFGABEN_INFO={
  checkpoint:         'Kontrolle: Alle Checklisten-Aufgaben pr\u00fcfen und best\u00e4tigen, dass alles erledigt wurde.',
  arbeitsvorbereitung:'Materialien, Werkzeuge und Arbeitsunterlagen f\u00fcr den Tag vorbereiten und bereitstellen.',
  sicherheit:         'Arbeitssicherheit pr\u00fcfen: Fluchtwege, Sicherheitsauszeichnungen und m\u00f6gliche Gefahren kontrollieren.',
  essensmarken:       'Essensmarken f\u00fcr alle Mitarbeitenden zuordnen und verteilen.',
  fegen:              'Den Boden fegen, kehren und sauber halten. Schmutz und Staub beseitigen.',
  fenster:            'Alle Fenster am Ende des Arbeitstages schlie\u00dfen und verriegeln.',
  geschirr:           'Geschirr abr\u00e4umen, sp\u00fclen und ordentlich einr\u00e4umen.',
  muell:              'M\u00fclleimer leeren und Abfall ordnungsgem\u00e4\u00df entsorgen und trennen.',
  strom:              'Alle elektrischen Ger\u00e4te ausschalten und sicherstellen, dass nichts in Stand-by bleibt.',
  tische:             'Tische abwischen, reinigen und f\u00fcr den n\u00e4chsten Tag vorbereiten.',
  tuerklinken:        'T\u00fcrklinken, Schalter und Kontaktfl\u00e4chen mit Desinfektionsmittel reinigen.',
  versandvorbereitung:'Versandmaterial pr\u00fcfen, Pakete kontrollieren und versandfertig machen.',
  betriebsmittel:     'Maschinen, Werkzeuge und Betriebsmittel auf M\u00e4ngel und Vollst\u00e4ndigkeit pr\u00fcfen.',
  botengaenge:        'Boteng\u00e4nge innerhalb und au\u00dferhalb des Geb\u00e4udes erledigen, Post und Waren transportieren.',
  diensttelefon:      'Das Dienst-Telefon annehmen, Anrufe weiterleiten und Nachrichten aufnehmen.',
  hubwagen:           'Den Hubwagen sachgem\u00e4\u00df bedienen und schwere Lasten sicher transportieren.',
  materialbeschaffung:'Ben\u00f6tigtes Material und Verbrauchsmittel beschaffen, auff\u00fcllen und lagern.',
  mentor:             'Neue Mitarbeitende oder Praktikanten einweisen, begleiten und bei Fragen unterst\u00fctzen.',
  qualitaet:          'Die Qualit\u00e4t der Arbeitsergebnisse pr\u00fcfen und sicherstellen, dass Standards eingehalten werden.'
};

/* ── Inhalte für das Hilfe-Modal (Kapitel als Aufklapp-Liste) ── */
var HILFE_INHALTE=[
  {titel:'1) Sinn und Zweck des Checkpoints',saetze:[
    'Der Checkpoint hilft der Gruppe, den Tag gemeinsam zu organisieren.',
    'Hier steht auf einen Blick, wer da ist, wer was macht und was heute wichtig ist.',
    'Die Tages-Checkliste zeigt, welche Aufgaben heute erledigt werden müssen.',
    'Termine, Zuständigkeiten und Arbeitsinhalte sind alle an einem Ort.',
    'So haben alle in der Gruppe die gleichen Informationen.',
    'Das Dashboard läuft direkt im Browser, ganz ohne Internet.'
  ]},
  {titel:'2) Kostenstelle wechseln',saetze:[
    'Jede Gruppe hat eine eigene Kostenstellen-Nummer.',
    'Oben links auf den Button „wechseln" tippen.',
    'Die richtige Nummer eingeben und bestätigen.',
    'Das Tablet zeigt dann automatisch die Daten der eigenen Gruppe.',
    'Jede Kostenstelle speichert ihre Daten getrennt voneinander.',
    'Das Wechseln ist nur nötig, wenn ein Tablet für mehrere Gruppen genutzt wird.'
  ]},
  {titel:'3) Portraitbilder',saetze:[
    'Ein Foto macht das Dashboard persönlicher und übersichtlicher.',
    'Im Profil einer Person auf „Foto hochladen" tippen.',
    'Ein Bild auswählen – es wird automatisch auf die richtige Größe zugeschnitten.',
    'Die App bietet die fertige Bild-Datei zum Herunterladen an.',
    'Diese Datei muss einmalig in den Ordner „fotos" neben der App verschoben werden.',
    'Erst nach dem Verschieben und einem Neuladen der Seite erscheint das Foto dauerhaft.'
  ]},
  {titel:'4) Namen: Editieren, Abwesenheit und Profil',saetze:[
    'Ein Tipp auf einen Namen in der Liste öffnet das Aufgaben-Modal dieser Person.',
    'Über das Namen-Modal (Stift-Symbol) lassen sich Namen bearbeiten, sortieren oder neu hinzufügen.',
    'Ein Tipp direkt auf das Foto markiert die Person als abwesend.',
    'Bei Abwesenheit lässt sich wählen: nur für heute oder bis auf weiteres.',
    'Im Profil-Modal wird für jede Aufgabe eingestellt, wie sicher die Person sie schon beherrscht.',
    'Diese Einstellung sorgt dafür, dass Aufgaben farblich passend zur Fähigkeit angezeigt werden.'
  ]},
  {titel:'5) Arbeitsinhalt einstellen',saetze:[
    'Über das Werkzeug-Symbol wird eingetragen, woran eine Person gerade arbeitet.',
    'Ein kurzer Text beschreibt die aktuelle Tätigkeit.',
    'Die Schwierigkeitsstufe (0 bis 4) zeigt nach Binnendifferenzierung: „Wie schwer ist die Tätigkeit?"',
    'Je höher die Zahl, desto anspruchsvoller ist die Aufgabe für die Person.',
    'Zusätzlich lässt sich die Auslastung markieren: gut ausgelastet, läuft bald aus oder keine Arbeit.',
    'Alle Angaben erscheinen als kleines Symbol direkt auf dem Werkzeug-Icon.'
  ]},
  {titel:'6) Symbole für Tages-Checkliste und allgemeine Zuständigkeiten',saetze:[
    'Gelbe Symbole gehören zur Tages-Checkliste, zum Beispiel „Boden fegen".',
    'Blaue Symbole sind allgemeine Zuständigkeiten, zum Beispiel „Botengänge".',
    'Ein Symbol lässt sich per Ziehen (Maus oder Finger) auf eine Person legen.',
    'Alternativ: Symbol antippen, dann die passende Person antippen.',
    'So sieht jede Person sofort, welche Aufgaben zu ihr gehören.',
    'Über das Aufgaben-Modal lassen sich mehrere Zuständigkeiten gleichzeitig einstellen.'
  ]},
  {titel:'7) Leitung der Gruppe: Namen wechseln und Krone wechseln',saetze:[
    'Die Krone zeigt an, wer aktuell die Gruppe leitet.',
    'Ein Tipp auf eine andere Person in der Leitungs-Liste überträgt ihr die Krone.',
    'Die Namen in dieser Liste lassen sich über das Leitungs-Modal bearbeiten.',
    'Es kann jederzeit nur eine Person gleichzeitig die Krone tragen.',
    'Die Leitung wird nicht automatisch zurückgesetzt und bleibt bis zur nächsten Änderung bestehen.',
    'So ist immer klar erkennbar, wer heute die Ansprechperson ist.'
  ]},
  {titel:'8) Termine: Nächster Termin, Datum/Uhrzeit, Farbhintergründe',saetze:[
    'In der Mitte vom Dashboard stehen die möglichen Termine der Gruppe.',
    'Ein Klick auf „Nächster Termin" zeigt ihn groß an und liest ihn vor.',
    'Über das Kalender-Symbol lassen sich Datum und Uhrzeit einstellen.',
    'Wird keine Uhrzeit gewählt, gilt der Termin als ganztägig.',
    'Grüner Hintergrund bedeutet: Der Termin ist heute.',
    'Roter, blasser Hintergrund bedeutet: Der Termin liegt in der Vergangenheit.'
  ]},
  {titel:'9) Diese Woche wichtig',saetze:[
    'Hier steht ein wichtiger Hinweis, der für die ganze Woche gilt.',
    'Es gibt bewusst kein festes Datum – der Hinweis bleibt einfach stehen, bis er geändert wird.',
    'Über das Dropdown-Menü lässt sich ein passender, vorbereiteter Text auswählen.',
    'Der Hinweis ist gut sichtbar oben im Dashboard platziert.',
    'So verpasst niemand wichtige Infos für die laufende Woche.',
    'Der Text lässt sich jederzeit wieder ändern oder löschen.'
  ]},
  {titel:'10) Tages-Checkliste pflegen',saetze:[
    'Jede Aufgabe hat vier mögliche Status-Symbole zur Auswahl.',
    'Grün bedeutet erledigt, grau bedeutet an diesem Tag nicht nötig.',
    'Ein Tipp auf das Symbol wechselt zwischen den Status-Möglichkeiten.',
    'Über das Uhr-Symbol wird eingestellt, an welchen Wochentagen und zu welcher Uhrzeit eine Aufgabe fällig ist.',
    'Die zuständige Person lässt sich für den Tag wechseln, zum Beispiel bei Krankheit (Vertretung).',
    'So bleibt die Checkliste jeden Tag aktuell und passend besetzt.'
  ]},
  {titel:'11) Import / Export / Neuer Tag',saetze:[
    'Der Pfeil nach oben lädt eine zuvor gespeicherte Datei wieder ein.',
    'Der Pfeil nach unten sichert alle aktuellen Daten als Datei zum Herunterladen.',
    'Dieses Exportieren regelmäßig durchführen – am besten täglich.',
    'Achtung: Wird der Browser-Speicher gelöscht (z. B. manuell durch Nutzer), gehen alle Eintragungen unwiderruflich verloren.',
    'Nur eine vorher exportierte Datei kann die Daten dann wiederherstellen – deshalb den Export nicht vergessen.',
    '„Neuer Tag" setzt die Tages-Checkliste zurück und startet den nächsten Arbeitstag.'
  ]},
  {titel:'12) Hilfe und Barrierefreiheit',saetze:[
    'Unten rechts öffnet der Button „H" die Bedienungshilfen.',
    '„A+" vergrößert die Schrift in mehreren Stufen für bessere Lesbarkeit.',
    'Das Kontrast-Symbol schaltet einen kontrastreicheren Anzeigemodus ein und aus.',
    'Der Vorlesen-Button liest Inhalte auf Wunsch laut vor.',
    'Nach dem Aktivieren einfach einen Bereich auf dem Dashboard antippen – dieser wird dann vorgelesen.',
    'Ein erneuter Tipp auf den Vorlesen-Button oder die Escape-Taste beendet das Vorlesen wieder.'
  ]}
];

