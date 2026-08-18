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
  checkpoint:{label:"Kontrolle Checkpoint",foto:"symbole/check-checkpoint.jpg",typ:"checkliste"},
  arbeitsvorbereitung:{label:"Arbeit vorbereiten",foto:"symbole/check-arbeitsvorbereitung.jpg",typ:"checkliste"},
  sicherheit:{label:"Arbeitssicherheit pr\u00fcfen",foto:"symbole/check-sicherheit.jpg",typ:"checkliste"},
  essensmarken:{label:"Essensmarken zuordnen",foto:"symbole/check-essensmarken.jpg",typ:"checkliste"},
  fegen:{label:"Boden fegen",foto:"symbole/check-fegen.jpg",typ:"checkliste"},
  fenster:{label:"Fenster schlie\u00dfen",foto:"symbole/check-fenster.jpg",typ:"checkliste"},
  geschirr:{label:"Geschirr wegr\u00e4umen",foto:"symbole/check-geschirr.jpg",typ:"checkliste"},
  muell:{label:"M\u00fcll entsorgen",foto:"symbole/check-muell.jpg",typ:"checkliste"},
  strom:{label:"Strom ausschalten",foto:"symbole/check-strom.jpg",typ:"checkliste"},
  tische:{label:"Tische wischen",foto:"symbole/check-tische.jpg",typ:"checkliste"},
  tuerklinken:{label:"T\u00fcrklinken desinfizieren",foto:"symbole/check-tuerklinken.jpg",typ:"checkliste"},
  versandvorbereitung:{label:"Versand vorbereiten",foto:"symbole/check-versandvorbereitung.jpg",typ:"checkliste"},
  rolliabholen:{label:"Rolli abholen",foto:"symbole/check-Rolliabholen.jpg",typ:"checkliste"},
  betriebsmittel:{label:"Betriebsmittel pr\u00fcfen",foto:"symbole/zust-betriebsmittel.jpg",typ:"allgemein"},
  botengaenge:{label:"Boteng\u00e4nge",foto:"symbole/zust-botengaenge.jpg",typ:"allgemein"},
  diensttelefon:{label:"Dienst-Telefon",foto:"symbole/zust-diensttelefon.jpg",typ:"allgemein"},
  hubwagen:{label:"Hubwagen fahren",foto:"symbole/zust-hubwagen.jpg",typ:"allgemein"},
  materialbeschaffung:{label:"Materialbeschaffung",foto:"symbole/zust-materialbeschaffung.jpg",typ:"allgemein"},
  mentor:{label:"Mentor / Pate",foto:"symbole/zust-mentor.jpg",typ:"allgemein"},
  qualitaet:{label:"Qualit\u00e4t pr\u00fcfen",foto:"symbole/zust-qualitaet.jpg",typ:"allgemein"},
  teilezaehlen:{label:"Teile z\u00e4hlen",foto:"symbole/zust-Teilezählen.jpg",typ:"allgemein"},
  materialholen:{label:"Material holen",foto:"symbole/zust-Materialholen.jpg",typ:"allgemein"}
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
    'Du siehst auf einen Blick: Wer ist da, wer macht was, was ist wichtig.',
    'Die Tages-Checkliste zeigt: Diese Aufgaben müssen erledigt werden.',
    'Termine, Zuständigkeiten und Arbeitsinhalte sind alle an einem Ort.',
    'So haben alle in der Gruppe die gleichen Infos.',
    'Das Dashboard läuft direkt im Browser, ganz ohne Internet.'
  ]},
  {titel:'2) Kostenstelle wechseln',saetze:[
    'Jede Gruppe hat eine eigene Kostenstellen-Nummer.',
    'Oben links auf den Button „wechseln" tippen.',
    'Die richtige, 5-stellige Nr. eingeben und bestätigen.',
    'Das Tablet zeigt dann automatisch die Daten der eigenen Gruppe.',
    'Jede Kostenstelle speichert ihre Daten getrennt voneinander.',
    'Wechseln der Nr. ist nur bei mehreren Gruppen auf 1 Tablet nötig.'
  ]},
  {titel:'3) Portraitbilder',saetze:[
    'Ein Foto macht das Dashboard persönlicher und übersichtlicher.',
    'Im Profil - runder Punkt im Namensfeld - auf „Foto hochladen" tippen.',
    'Bild auswählen – es wird automatisch auf 80x80px zugeschnitten.',
    'Die App bietet die fertige Bild-Datei zum Herunterladen an.',
    'Verschiebe diese Datei  einmalig in den Ordner „fotos" im App-Ordner.',
    'Nach dem Verschieben und Neuladen erscheint das Foto dauerhaft.',
    'Beachte die Bild-Erlaubnis. Löschen im "fotos" Ordner möglich.'
  ]},
  {titel:'4) Namen der Gruppenmitglieder',saetze:[
    'Klick auf Überschrift "Namen" für ändern, verschieben, löschen.',
    'Entfernst du Personen: Beachte, ggf. das Foto mit zu löschen.',
    'Klick auf Portrait oder Namen: Person stellt sich "abwesend".',
    'Wähle bei Abwesenheit: Nur für heute oder bis auf weiteres.',
    'Profil - Button unten rechts im Namensfeld - für Fähigkeitsbewertung.',
    '3 Möglichkeiten wählbar: Selbstständig, Assistenz oder nicht geübt.'
  ]},
  {titel:'5) Arbeitsinhalt einstellen',saetze:[
    'Stelle über das Arbeits-Symbol ein: Das arbeitet die Person gerade.',
    'Ein kurzer Text beschreibt die Tätigkeit. Auch Vorlesen möglich.',
    'Schwierigkeitsstufe (0 bis 4) zeigt die Binnendifferenzierung',
    'Je höher die Zahl, desto anspruchsvoller ist die Aufgabe.',
    'Auslastung möglich: ausgelastet, läuft bald aus oder keine Arbeit.',
    'Angaben erscheinen mit Farb-Rahmen und als kleines Symbol.'
  ]},
  {titel:'6) Symbole für Zuständigkeiten',saetze:[
    'Gelbe Symbole für Tages-Checkliste. Z.B. Beispiel „Boden fegen".',
    'Blaue Symbole für allg. Zuständigkeiten. Z.B. „Botengänge".',
    'Klick auf Überschrift "Zuständigkeiten" für Änderungen.',
    'Klicke dann auf Namen: Zuständigkeiten per Checkboxen.',
    'Oder verschiebe die Symbole auf andere Personen.',
    'So sieht jede Person sofort: Welche Aufgaben habe ich.'
  ]},
  {titel:'7) Leitung der Gruppe',saetze:[
    'Die Krone zeigt an: Wer leitet aktuell die Gruppe.',
    'Schnelles Übertragen der Krone durch Klick auf den Kreis.',
    'Bearbeitung der 3 Namen über die Überschrift "Leitung der Gruppe.',
    'Es kann  nur eine Person gleichzeitig die Krone tragen.',
    'Leitung kann auch MAmWV sein. Z.B. der Checkpoint-Verantwortliche.',
    'So ist klar erkennbar: Wer ist heute Ansprechperson.'
  ]},
  {titel:'8) Termine',saetze:[
    'In der Mitte vom Dashboard findest du Gruppen-Termine.',
    'Klick auf Überschrift „Nächster Termin": Anzeige groß u. vorlesbar.',
    'Klick auf Kalender-Symbol stellt Datum und Uhrzeit ein.',
    'Wird keine Uhrzeit gewählt, gilt der Termin als ganztägig.',
    'Grüner Hintergrund bedeutet: Der Termin ist heute.',
    'Roter Hintergrund bedeutet: Der Termin ist vorbei.'
  ]},
  {titel:'9) Diese Woche wichtig',saetze:[
    'Wichtige Hinweise für die ganze Woche stehen unten.',
    'Ohne Datum – bleibt bis zur Änderung stehen.',
    'Über Dropdown-Menü lassen sich Kategorien wählen.',
    'Dann ist rechts daneben ein Freitext möglich.',
    'So verpasst niemand wichtige Infos für die Woche.',
   ]},
  {titel:'10) Tages-Checkliste',saetze:[
    'Jede Aufgabe mit 4 möglichen Status-Symbolen.',
    'Grün=erledigt. Rot=offen, Gelb=schnell fällig, Grau=nicht nötig.',
    'Ein Tipp auf das Symbol wechselt den Status - also quittieren.',
    'Uhr-Symbol rechts stellt ein: Fällig an x Wochentagen oder Zeiten.',
    'Klick auf Bezeichnung: Zuständige Person wechseln oder Ausfall.',
    'So bleibt die Checkliste jeden Tag aktuell passend besetzt.'
  ]},
  {titel:'11) Import / Export / Neuer Tag',saetze:[
    'Pfeil nach oben: Lädt eine zuvor gespeicherte Datei wieder ein.',
    'Pfeil nach unten: Sichert aktuelle Daten als Datei zum Download.',
    'Dieses Exportieren regelmäßig durchführen – am besten täglich.',
    'Achtung: Wenn Browser-Speicher gelöscht (z.B. manuell durch Nutzer), gehen Eintragungen verloren.',
    'Nur eine vorher exportierte Datei kann dann wiederherstellen.',
    '„Neuer Tag" setzt Tages-Checkliste zurück - startet nächsten Arbeitstag.'
  ]},
  {titel:'12) Hilfe und Barrierefreiheit',saetze:[
    'Unten rechts öffnet der Button „H" die Bedienungshilfen.',
    '„A+" vergrößert die Schrift in mehreren Stufen für bessere Lesbarkeit.',
    'Kontrast-Symbol schaltet kontrastreichere Anzeige ein und aus.',
    'Der Vorlesen-Button liest Inhalte auf Wunsch laut vor.',
    'Nach dem Aktivieren einen Bereich antippen zum Vorlesen.',
    'Erneuter Tipp auf den Vorlesen-Button oder Escape-Taste beendet Vorlesen.'
  ]}
];

/* ══════ Impressum / Datenschutz (rote Fußzeile) ══════
   Gleiches Akkordeon-Prinzip wie HILFE_INHALTE, aber mit
   fertigem HTML statt einzelner Sätze (Adressen, Hervorhebungen usw.). */
var IMPRESSUM_INHALTE=[
  {titel:'1) Anbieter und Herausgeber',html:
    '<p>Herausgeber und inhaltlich verantwortlich für die Nutzung innerhalb des Studjo:</p>'
    +'<address>Evangelisches Johanneswerk gGmbH<br>Studjo | Arbeit und Qualifizierung<br>Freisenbergstra\u00dfe 33<br>58513 L\u00fcdenscheid</address>'
    +'<p style="margin-top:10px">\u00dcbergeordneter Tr\u00e4ger:</p>'
    +'<address>Evangelisches Johanneswerk gGmbH<br>Schildescher Str. 101<br>33611 Bielefeld<br>Telefon: 0521 801-01<br>Fax: 0521 801-2569<br>E-Mail: <a href="mailto:kommunikation@johanneswerk.de">kommunikation@johanneswerk.de</a><br>Web: <a href="https://www.johanneswerk.de" target="_blank" rel="noopener">www.johanneswerk.de</a></address>'
  },
  {titel:'2) Geschäftsführung und Registereintrag',html:
    '<p>Vertretungsberechtigte Gesch\u00e4ftsf\u00fchrung:<br>Sabine Hirte (Vorsitzende)<br>Dr. Bodo de Vries (stellv. Vorsitzender)<br>Burkhard Bensiek<br>Frank Lohmann</p>'
    +'<p style="margin-top:10px">Rechtsform: Gemeinn\u00fctzige Gesellschaft mit beschr\u00e4nkter Haftung (gGmbH)<br>Handelsregister: Amtsgericht Bielefeld, HRB 42903<br>Umsatzsteuer-Identifikationsnummer gem. \u00a7 27a UStG: DE316517497</p>'
  },
  {titel:'3) Inhaltlich Verantwortlicher',html:
    '<p>Christoph Pasch<br>Studjo | Arbeit und Qualifizierung<br>Evangelisches Johanneswerk gGmbH<br>Freisenbergstra\u00dfe 33<br>58513 L\u00fcdenscheid<br>E-Mail: <a href="mailto:christoph.pasch@johanneswerk.de">christoph.pasch@johanneswerk.de</a></p>'
  },
  {titel:'4) Technische Umsetzung und Bereitstellung',html:
    '<p>Entwicklung und Pflege:<br>Marc Brenzel<br>Studjo | Arbeit und Qualifizierung<br>Evangelisches Johanneswerk gGmbH<br>E-Mail: <a href="mailto:marc.brenzel@johanneswerk.de">marc.brenzel@johanneswerk.de</a></p>'
    +'<p style="margin-top:10px">Gruppen\u00b7Checkpoint ist eine lokale Anwendung ohne \u00f6ffentlichen Internet-Auftritt. Sie wird direkt auf dem Tablet bzw. Ger\u00e4t der jeweiligen Gruppe ge\u00f6ffnet und l\u00e4uft offline. Der Quellcode wird zur Entwicklung in einem GitHub-Repository verwaltet; die Verteilung an die Gruppen erfolgt als Download-Paket \u00fcber GitHub Releases, nicht als \u00f6ffentlich aufrufbare Website.</p>'
  },
  {titel:'5) Haftungsausschluss',html:
    '<p><strong>Haftung f\u00fcr Inhalte:</strong> Die Inhalte dieser Anwendung wurden mit gr\u00f6\u00dfter Sorgfalt erstellt. F\u00fcr die Richtigkeit, Vollst\u00e4ndigkeit und Aktualit\u00e4t der Inhalte kann jedoch keine Gew\u00e4hr \u00fcbernommen werden.</p>'
    +'<p><strong>Haftung f\u00fcr Links:</strong> Sofern die Anwendung Links zu externen Webseiten Dritter enth\u00e4lt, besteht auf deren Inhalte kein Einfluss. F\u00fcr die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter verantwortlich.</p>'
    +'<p><strong>Urheberrecht:</strong> Die durch den Betreiber erstellten Inhalte unterliegen dem deutschen Urheberrecht. Vervielf\u00e4ltigung, Bearbeitung, Verbreitung und jede Art der Verwertung au\u00dferhalb der Grenzen des Urheberrechts bed\u00fcrfen der schriftlichen Zustimmung des jeweiligen Erstellers.</p>'
    +'<p>Die in der Anwendung verwendeten Metacom-Symbole sind urheberrechtlich gesch\u00fctzt. Metacom\u00ae ist ein eingetragenes Warenzeichen von Annick Schauer-S\u00fcss, Mayer-Johnson LLC und weiteren Rechteinhabern.</p>'
  }
];

var DATENSCHUTZ_INHALTE=[
  {titel:'1) Verantwortlicher für die Datenverarbeitung',html:
    '<p>Verantwortliche Stelle im Sinne des Datenschutzgesetzes der evangelischen Kirche in Deutschland (DSG-EKD) ist die Ev. Johanneswerk gGmbH.</p>'
    +'<address>Evangelisches Johanneswerk gGmbH<br>Studjo | Arbeit und Qualifizierung<br>Freisenbergstra\u00dfe 33<br>58513 L\u00fcdenscheid<br>Telefon: +49 0 23 51 95 80-0<br>E-Mail: <a href="mailto:christoph.pasch@johanneswerk.de">christoph.pasch@johanneswerk.de</a></address>'
  },
  {titel:'2) Datenschutzbeauftragter',html:
    '<p>Der Datenschutzbeauftragte des Evangelischen Johanneswerks ist erreichbar unter:</p>'
    +'<address>Niels Kill<br>c/o Althammer &amp; Kill GmbH &amp; Co. KG<br>Roscherstra\u00dfe 7<br>30161 Hannover<br>Telefon: +49 511 33 06 03-0<br>E-Mail: <a href="mailto:johanneswerk@ak-datenschutz.de">johanneswerk@ak-datenschutz.de</a><br><a href="https://www.althammer-kill.de" target="_blank" rel="noopener">www.althammer-kill.de</a></address>'
  },
  {titel:'3) Wie und wo werden die Daten gespeichert?',html:
    '<div class="info-ok">\u2713 <strong>Kurz zusammengefasst:</strong> Gruppen\u00b7Checkpoint ist eine rein lokale Anwendung. Es gibt keinen Server, keine Cloud und keine Datenübertragung im laufenden Betrieb.</div>'
    +'<p>Alle Eingaben \u2013 Namen, Anwesenheit, Zust\u00e4ndigkeiten, Arbeitsinhalte, Termine und Notizen \u2013 werden ausschlie\u00dflich im lokalen Speicher (localStorage) des Browsers auf dem jeweiligen Tablet bzw. Ger\u00e4t abgelegt.</p>'
    +'<p>Jede Kostenstelle (Gruppe) hat einen eigenen, getrennten Datenspeicher auf dem Ger\u00e4t. Die Daten verlassen das Ger\u00e4t zu keinem Zeitpunkt automatisch \u2013 es findet weder eine Synchronisation noch ein Cloud-Abgleich oder eine \u00dcbermittlung an den Betreiber oder Dritte statt.</p>'
    +'<p>Die App wird lokal per Doppelklick auf die Datei <code>index.html</code> ge\u00f6ffnet und funktioniert vollst\u00e4ndig offline.</p>'
  },
  {titel:'4) Portraitbilder – schriftliche Einwilligung erforderlich',html:
    '<div class="info-hervorhebung">\u26a0\ufe0f <strong>Wichtig:</strong> Bevor ein Foto einer Person im Checkpoint hinterlegt wird, muss die schriftliche Einwilligung der abgebildeten Person bzw. ihrer gesetzlichen Vertretung zur Nutzung des Bildes vorliegen. Ohne diese Einwilligung darf kein Foto hochgeladen werden.</div>'
    +'<p>Portraitfotos werden nicht in der App selbst gespeichert, sondern als eigenst\u00e4ndige Bilddatei (80\u00d780\u2009px) im Ordner <code>fotos/</code> auf dem jeweiligen Ger\u00e4t abgelegt. Die App verweist lediglich auf diese Datei.</p>'
    +'<p>Die Fotos werden nicht auf GitHub oder einem anderen Online-Dienst gespeichert oder ver\u00f6ffentlicht. Eine L\u00f6schung ist jederzeit m\u00f6glich, indem die entsprechende Datei im Ordner <code>fotos/</code> entfernt wird.</p>'
  },
  {titel:'5) Datensicherung (Export / Import)',html:
    '<p>Da alle Daten ausschlie\u00dflich lokal gespeichert werden, kann ein manuelles Leeren des Browser-Caches zum vollst\u00e4ndigen Verlust der Eingaben f\u00fchren. Als Sicherung dient die Export-Funktion (Pfeil-Symbol im Banner), die alle Daten als JSON-Datei zum Download anbietet.</p>'
    +'<p>Diese Export-Datei enth\u00e4lt personenbezogene Daten (u.\u2009a. Namen, Notizen zu Arbeitsinhalten, Abwesenheiten). Sie sollte daher sorgf\u00e4ltig aufbewahrt und nicht an \u00f6ffentlich zug\u00e4ngliche oder ungesicherte Orte hochgeladen werden.</p>'
  },
  {titel:'6) Entwicklung des Programms auf GitHub',html:
    '<p>Der Programmcode des Gruppen\u00b7Checkpoints wird zur Entwicklung in einem GitHub-Repository verwaltet. Die Verteilung an die Gruppen erfolgt als ZIP-Datei \u00fcber GitHub Releases \u2013 die Anwendung wird von den Gruppen nicht online \u00fcber GitHub, sondern lokal auf dem eigenen Ger\u00e4t ausgef\u00fchrt.</p>'
    +'<p>Der Ordner <code>fotos/</code> mit den Portraitbildern ist bewusst nicht Teil des Repositorys und wird bei einem Update nicht \u00fcberschrieben oder mit hochgeladen. Es werden keine personenbezogenen Daten im Quellcode-Repository gespeichert.</p>'
  },
  {titel:'7) Externe Schriftart (Google Fonts)',html:
    '<p>F\u00fcr die Darstellung wird die Schriftart „Nunito Sans" eingebunden. Ist das Ger\u00e4t beim Start mit dem Internet verbunden, wird diese Schriftart von den Servern von Google Fonts nachgeladen; dabei wird die IP-Adresse des Ger\u00e4ts an Google \u00fcbermittelt.</p>'
    +'<p>Im normalen, offline genutzten Betrieb (ohne Internetverbindung) findet dieser Abruf nicht statt; die App verwendet dann automatisch eine im Betriebssystem hinterlegte Ersatzschrift.</p>'
  },
  {titel:'8) Cookies und Tracking',html:
    '<div class="info-ok">\u2713 Es werden keine Cookies gesetzt.<br>\u2713 Es kommen keine Analyse- oder Tracking-Werkzeuge zum Einsatz.<br>\u2713 Es gibt keine Nutzerkonten oder Anmeldung.<br>\u2713 Die einzige verwendete Speichertechnik (localStorage) dient ausschlie\u00dflich der technisch notwendigen Funktion der App und verbleibt auf dem Ger\u00e4t.</div>'
    +'<p>Da keine nicht notwendigen Speichertechniken eingesetzt werden, ist gem\u00e4\u00df \u00a7 25 Abs. 2 Nr. 2 TTDSG keine Einwilligung erforderlich.</p>'
  },
  {titel:'9) Ihre Rechte als betroffene Person',html:
    '<ul>'
    +'<li><strong>Auskunftsrecht</strong> (Art. 15 DSGVO)</li>'
    +'<li><strong>Berichtigungsrecht</strong> (Art. 16 DSGVO)</li>'
    +'<li><strong>Recht auf L\u00f6schung</strong> (Art. 17 DSGVO)</li>'
    +'<li><strong>Recht auf Einschr\u00e4nkung der Verarbeitung</strong> (Art. 18 DSGVO)</li>'
    +'<li><strong>Widerspruchsrecht</strong> (Art. 21 DSGVO)</li>'
    +'<li><strong>Recht auf Daten\u00fcbertragbarkeit</strong> (Art. 20 DSGVO)</li>'
    +'</ul>'
    +'<p style="margin-top:10px">Da die Daten ausschlie\u00dflich lokal auf dem Ger\u00e4t der Gruppe gespeichert werden, richten sich Anfragen bitte direkt an den Verantwortlichen (siehe Kapitel 1), z.\u2009B. an Christoph Pasch oder die zust\u00e4ndige Gruppenleitung.</p>'
  },
  {titel:'10) Beschwerderecht bei der Aufsichtsbehörde',html:
    '<p>Sie haben das Recht, sich bei der zust\u00e4ndigen Datenschutz-Aufsichtsbeh\u00f6rde \u00fcber die Verarbeitung Ihrer personenbezogenen Daten zu beschweren. Zust\u00e4ndige Aufsichtsbeh\u00f6rde f\u00fcr das Evangelische Johanneswerk ist:</p>'
    +'<address>Landesbeauftragte f\u00fcr Datenschutz und Informationsfreiheit<br>Nordrhein-Westfalen (LfDI NRW)<br>Kavalleriestra\u00dfe 2\u20134<br>40213 D\u00fcsseldorf<br>Telefon: 0211 38424-0<br>E-Mail: <a href="mailto:poststelle@ldi.nrw.de">poststelle@ldi.nrw.de</a><br>Web: <a href="https://www.ldi.nrw.de" target="_blank" rel="noopener">www.ldi.nrw.de</a></address>'
  },
  {titel:'11) Aktualität dieser Datenschutzerklärung',html:
    '<p>Diese Datenschutzerkl\u00e4rung hat den Stand: August 2026.</p>'
    +'<p>Sie wird bei Bedarf aktualisiert, insbesondere bei technischen \u00c4nderungen der Anwendung. Die jeweils aktuelle Version ist in dieser App unter „Datenschutz" abrufbar.</p>'
  }
];

