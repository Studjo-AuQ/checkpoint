/* ══════════════════════════════════════════════════════
   app.js – Gruppen·Checkpoint (alle Funktionen)
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
  betriebsmittel:{label:"Betriebsmittel pr\u00fcfen",foto:"zust-betriebsmittel.jpg",typ:"allgemein"},
  botengaenge:{label:"Boteng\u00e4nge",foto:"zust-botengaenge.jpg",typ:"allgemein"},
  diensttelefon:{label:"Dienst-Telefon",foto:"zust-diensttelefon.jpg",typ:"allgemein"},
  hubwagen:{label:"Hubwagen fahren",foto:"zust-hubwagen.jpg",typ:"allgemein"},
  materialbeschaffung:{label:"Materialbeschaffung",foto:"zust-materialbeschaffung.jpg",typ:"allgemein"},
  mentor:{label:"Mentor / Pate",foto:"zust-mentor.jpg",typ:"allgemein"},
  qualitaet:{label:"Qualit\u00e4t pr\u00fcfen",foto:"zust-qualitaet.jpg",typ:"allgemein"}
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
    LEITUNG_KEY='', TERMINE_KEY='', WICHTIG_KEY='', ZEITEN_KEY='';

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
  setzeArbeitKey(kst);
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
  TERMINE = {frei:[{datum:'',text:''},{datum:'',text:''}], pflicht:[
    {id:'fruehrunde',label:'Fr\u00fchrunde',icon:'&#9200;',datum:'',uhrzeit:''},
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

  ladeZuordnung();ladeNamen();ladeAktiveChecks();ladeLeitung();ladeTermine();ladeWichtig();ladeZeiten();ladeArbeitsnotizen();

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
  /* Arbeitsnotizen: nur "1tag" löschen */
  Object.keys(ARBEITSNOTIZEN).forEach(function(id){
    if(!ARBEITSNOTIZEN[id]||ARBEITSNOTIZEN[id].dauer!=='weiteres') delete ARBEITSNOTIZEN[id];
  });
  speichereArbeitsnotizen();
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

var TERMINE={frei:[{datum:'',text:''},{datum:'',text:''}],pflicht:[
  {id:'fruehrunde',label:'Fr\u00fchrunde',icon:'&#9200;',datum:'',uhrzeit:''},
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

/* ═══ TERMIN-POPUP (Feature 4) ═══ */
function oeffneNaechstenTermin(event){
  event.stopPropagation();
  var h=heute(); /* YYYY-MM-DD */
  var alle=[];
  TERMINE.frei.forEach(function(t){
    if(t.datum&&t.datum>=h&&(t.text||'').trim())
      alle.push({datum:t.datum,label:'',text:t.text.trim(),uhrzeit:''});
  });
  TERMINE.pflicht.forEach(function(t){
    if(t.datum&&t.datum>=h)
      alle.push({datum:t.datum,label:t.label,text:'',uhrzeit:t.uhrzeit||''});
  });
  alle.sort(function(a,b){return a.datum.localeCompare(b.datum)||a.uhrzeit.localeCompare(b.uhrzeit);});

  var popup=document.getElementById('termin-naechster-popup');
  if(!popup)return;
  var vorleseText='';

  if(alle.length===0){
    document.getElementById('termin-popup-inhalt').innerHTML=
      '<p style="color:var(--grau);font-size:.85rem;margin:0;">Keine zukünftigen Termine eingetragen.</p>';
  } else {
    var t=alle[0];
    var ddmm=t.datum.split('-').reverse().join('.');
    vorleseText=(t.label?t.label+': ':'')+(t.text||t.label)+'. Am '+isoDatumSprache(t.datum)
                +(t.uhrzeit?' um '+uhrzeitSprache(t.uhrzeit):'')+'.'||'';
    var html='<div style="background:#f0f9ff;border-radius:10px;padding:12px 14px;">';
    html+='<div style="font-size:.78rem;font-weight:900;color:var(--grau);">&#128197; '+ddmm+'</div>';
    if(t.uhrzeit)html+='<div style="font-size:.78rem;color:var(--grau);">&#9200; '+t.uhrzeit+' Uhr</div>';
    if(t.label)html+='<div style="font-size:.72rem;color:var(--grau);margin-top:2px;">'+t.label+'</div>';
    if(t.text)html+='<div style="font-size:.9rem;font-weight:800;margin-top:4px;">'+t.text+'</div>';
    html+='</div>';
    if(alle.length>1)html+='<div style="font-size:.7rem;color:var(--grau);margin-top:6px;">&#43; '
         +(alle.length-1)+' weitere Termin'+(alle.length-1>1?'e':'')+'</div>';
    document.getElementById('termin-popup-inhalt').innerHTML=html;
  }
  popup.dataset.vorleseText=vorleseText;

  var rect=event.currentTarget.getBoundingClientRect();
  var left=rect.left;
  if(left+290>window.innerWidth)left=window.innerWidth-298;
  popup.style.left=Math.max(left,6)+'px';
  popup.style.top=(rect.bottom+6)+'px';
  popup.style.display='block';
}
function schliesseTerminPopup(){
  var p=document.getElementById('termin-naechster-popup');
  if(p)p.style.display='none';
}
function vorlesenTerminPopup(){
  var popup=document.getElementById('termin-naechster-popup');
  if(!popup||!window.speechSynthesis)return;
  var text=popup.dataset.vorleseText||'';
  if(!text)return;
  window.speechSynthesis.cancel();
  var u=new SpeechSynthesisUtterance(text);
  u.lang='de-DE';u.rate=0.88;
  window.speechSynthesis.speak(u);
}

var WICHTIG_KAT=['Produktion','Qualifizierung','Unterweisung','Neue Mitarbeitende','Ausfall','Ver\u00e4nderung','Motto der Woche','Sonstiges'];
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

ladeZuordnung();ladeNamen();ladeAktiveChecks();ladeLeitung();ladeTermine();ladeWichtig();ladeZeiten();ladeArbeitsnotizen();

/* ═══ HILFSFUNKTIONEN ═══ */
function getZustaendigePerson(id){
  var p=getVertPerson(id);
  if(p!==undefined){
    if(p==='entfaellt')return null;
    if(p)return MITARBEITENDE.find(function(m){return m.id===p;})||null;
  }
  var z=GRUPPE.zustaendigkeiten.find(function(z){return z.aufgabeId===id&&z.typ==='checkliste';});
  return z?MITARBEITENDE.find(function(m){return m.id===z.personId;})||null:null;
}
function entfaelltHeute(id){
  var p=getVertPerson(id);
  return p==='entfaellt';
}
/* Vertretung offen: Person abwesend, aber noch keine Entscheidung */
function vertretungAusstehend(id){
  var z=GRUPPE.zustaendigkeiten.find(function(z){return z.aufgabeId===id&&z.typ==='checkliste';});
  if(!z)return false;
  var person=MITARBEITENDE.find(function(p){return p.id===z.personId;});
  if(!person||STATE.abwesend.indexOf(person.id)===-1)return false;
  return STATE.vertretungen[id]===undefined||STATE.vertretungen[id]===null;
}
function formatWann(id){
  var z=ZEITEN[id];if(!z)return '';
  var parts=[];
  if(z.tage&&z.tage.length)parts.push(z.tage.map(function(t){return t.toUpperCase();}).join(' '));
  if(z.uhrzeit)parts.push(z.uhrzeit+' Uhr');
  return parts.join(' | ');
}

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

var _infoTimeout=null;
function zeigeAufgabeInfo(id,event){
  event.stopPropagation();
  if(editModus)return;
  var a=AUFGABEN[id];if(!a)return;
  var popup=document.getElementById('aufg-info-popup');
  document.getElementById('aufg-info-titel').textContent=a.label;
  document.getElementById('aufg-info-text').textContent=AUFGABEN_INFO[id]||a.label;
  /* Position: unterhalb des Icons, im sichtbaren Bereich */
  var rect=event.currentTarget.getBoundingClientRect();
  var left=Math.min(rect.left,window.innerWidth-250);
  var top=rect.bottom+6;
  if(top+120>window.innerHeight)top=rect.top-126;
  popup.style.left=left+'px';
  popup.style.top=top+'px';
  popup.style.display='block';
  popup.style.pointerEvents='auto';
  clearTimeout(_infoTimeout);
  _infoTimeout=setTimeout(function(){popup.style.display='none';popup.style.pointerEvents='none';},4000);
}

/* ═══ RENDER ═══ */
function renderNamen(){
  var html='';
  MITARBEITENDE.forEach(function(p){
    var abw=STATE.abwesend.indexOf(p.id)!==-1;

    /* Permanente Zuständigkeiten dieser Person */
    var zust=GRUPPE.zustaendigkeiten.filter(function(z){return z.personId===p.id;});

    /* Vertretungs-Aufgaben (V-Badge):
       Im Normal-Modus nur heute aktive, im Edit-Modus ALLE anzeigen */
    var allVertIds=Object.keys(STATE.vertretungen).filter(function(id){
      return getVertPerson(id)===p.id;
    });
    var vertIds=editModus ? allVertIds : allVertIds.filter(function(id){return AKTIVE_CHECKS.indexOf(id)!==-1;});

    var icons='';

    /* Permanente Icons */
    zust.forEach(function(z){
      var a=AUFGABEN[z.aufgabeId];if(!a)return;
      if(z.typ==='checkliste'&&AKTIVE_CHECKS.indexOf(z.aufgabeId)===-1)return;
      var erl=STATE.erledigt.indexOf(z.aufgabeId)!==-1;
      var badge=z.typ==='checkliste'?'<div class="aufg-badge'+(erl?' erledigt':'')+'" id="badge-'+z.aufgabeId+'">'+(erl?'&#10003;':'!')+'</div>':'';
      var clickFn=editModus?'selectIconInEditModus(\''+z.aufgabeId+'\','+p.id+',event)':'zeigeAufgabeInfo(\''+z.aufgabeId+'\',event)';
      icons+='<div class="aufg-icon-wrap" data-aufgabe-id="'+z.aufgabeId+'" data-typ="'+z.typ+'" onclick="'+clickFn+'">'
            +'<img src="'+a.foto+'" alt="'+a.label+'" title="'+a.label+'" class="aufg-icon-img">'+badge+'</div>';
    });

    /* Vertretungs-Icons (orangefarbener Rahmen, V-Badge) */
    vertIds.forEach(function(id){
      var a=AUFGABEN[id];if(!a)return;
      var hatPermanent=GRUPPE.zustaendigkeiten.find(function(z){return z.aufgabeId===id&&z.personId===p.id;});
      if(hatPermanent)return;
      var erl=STATE.erledigt.indexOf(id)!==-1;
      var badge='<div class="aufg-badge'+(erl?' erledigt':' vert')+'" id="badge-vert-'+id+'">'+(erl?'&#10003;':'V')+'</div>';
      var dauer=getVertDauer(id);
      /* Im Edit-Modus: Remove-Button + Dauer-Hinweis anzeigen */
      var removeBtn=editModus?'<button class="aufg-vert-remove-btn" onclick="event.stopPropagation();entferneVertretung(\''+id+'\')" title="Vertretung '+(dauer==='weiteres'?'(bis auf weiteres) ':'')+'entfernen">&#10005;</button>':'';
      icons+='<div class="aufg-icon-wrap aufg-vert" data-aufgabe-id="'+id+'" data-typ="checkliste" onclick="'+(editModus?'event.stopPropagation()':'zeigeAufgabeInfo(\''+id+'\',event)')+'" title="Vertretung: '+a.label+(editModus?' | Dauer: '+(dauer==='weiteres'?'bis auf weiteres':'nur heute'):'')+'">'+
            '<img src="'+a.foto+'" alt="'+a.label+'" class="aufg-icon-img">'+badge+removeBtn+'</div>';
    });

    var notiz=ARBEITSNOTIZEN[p.id];
    var hatNotiz=notiz&&notiz.text;
    var arbBtn='<button class="arbeit-btn'+(hatNotiz?' hat-notiz':'')+'" onclick="oeffneArbeitModal('+p.id+',event)" title="'+(hatNotiz?notiz.text.slice(0,40):'Arbeitsinhalt')+'">💼</button>';
    html+='<div class="namen-row'+(abw?' abwesend':'')+'" data-person-id="'+p.id+'">'
         +'<img src="portrait.jpg" alt="'+p.name+'" class="person-portrait" onerror="this.style.background=\'#e2e8f0\'" onclick="event.stopPropagation();toggleAbwesend('+p.id+')" ondragover="rowDragOver(event,'+p.id+')" ondrop="rowDrop(event,'+p.id+')" ondragleave="rowDragLeave(event)">'
         +'<div class="person-name" onclick="event.stopPropagation();toggleAbwesend('+p.id+')" ondragover="rowDragOver(event,'+p.id+')" ondrop="rowDrop(event,'+p.id+')" ondragleave="rowDragLeave(event)">'+p.name+'</div>'
         +arbBtn  
         +'<div class="aufgaben-icons">'+icons+'</div></div>';
  });
  document.getElementById('namen-tabelle').innerHTML=html;
}

function updateBadges(){
  sortierteCheckIds().forEach(function(id){
    var erl=STATE.erledigt.indexOf(id)!==-1;
    /* Permanentes Badge */
    var b=document.getElementById('badge-'+id);
    if(b){b.innerHTML=erl?'&#10003;':'!';b.className='aufg-badge'+(erl?' erledigt':'');}
    /* Vertretungs-Badge */
    var bv=document.getElementById('badge-vert-'+id);
    if(bv){bv.innerHTML=erl?'&#10003;':'V';bv.className='aufg-badge'+(erl?' erledigt':' vert');}
  });
}

function renderLeitung(){
  var labels=['Gruppenleitung','Vertretung 1','Vertretung 2'],html='';
  for(var i=0;i<3;i++){
    var ak=LEITUNG.aktiv===i,nm=LEITUNG.namen[i]||'';
    html+='<div class="leitung-zeile'+(ak?' aktiv':'')+'"><div class="leitung-symbol">'+(ak?'&#10003;':'&#9675;')+'</div>'
         +'<div><div class="leitung-name'+(nm?'':' leer')+'">'+(nm||'(nicht eingetragen)')+'</div>'
         +'<div class="leitung-rolle">'+labels[i]+'</div></div></div>';
  }
  document.getElementById('leitung-anzeige').innerHTML=html;
}

function renderTermine(){
  var html='';
  for(var i=0;i<2;i++){
    var f=TERMINE.frei[i];
    html+='<div class="termin-frei-zeile" data-frei-idx="'+i+'">'
         +'<input type="date" class="termin-input" data-frei-idx="'+i+'" data-feld="datum" value="'+(f.datum||'')+'" onchange="terminFreiSp(this)">'
         +'<input type="text" class="termin-input" data-frei-idx="'+i+'" data-feld="text" value="'+(f.text||'')+'" placeholder="Termin \u2026" maxlength="60" onchange="terminFreiSp(this)" onblur="terminFreiSp(this)">'
         +'</div>';
  }
  html+='<div class="termin-trenner">&mdash; Regelm&auml;&szlig;ige Termine &mdash;</div>';
  TERMINE.pflicht.forEach(function(p){
    html+='<div class="termin-pflicht-zeile" data-pflicht-id-row="'+p.id+'">'
         +'<div class="termin-pflicht-dt">'
         +'<input type="date" class="termin-input" data-pflicht-id="'+p.id+'" data-feld="datum" value="'+(p.datum||'')+'" onchange="terminPflichtSp(this)" style="margin-bottom:2px">'
         +'<input type="time" class="termin-input" data-pflicht-id="'+p.id+'" data-feld="uhrzeit" value="'+(p.uhrzeit||'')+'" onchange="terminPflichtSp(this)">'
         +'</div>'
         +'<div class="termin-icon-zelle">'+p.icon+'</div>'
         +'<div class="termin-pflicht-label">'+p.label+'</div></div>';
  });
  document.getElementById('termine-anzeige').innerHTML=html;
  checkTerminDatumHeute();
}
function terminFreiSp(el){var i=parseInt(el.dataset.freiIdx);TERMINE.frei[i][el.dataset.feld]=el.value;speichereTermine();checkTerminDatumHeute();}
function terminPflichtSp(el){
  var p=TERMINE.pflicht.find(function(p){return p.id===el.dataset.pflichtId;});if(!p)return;
  var feld=el.dataset.feld||'datum';
  p[feld]=el.value;
  speichereTermine();checkTerminDatumHeute();
}
/* Feature 8: Datumsabgleich */
function checkTerminDatumHeute(){
  var td=heute();
  document.querySelectorAll('.termin-frei-zeile,.termin-pflicht-zeile').forEach(function(r){
    r.classList.remove('termin-heute','termin-vergangenheit');
  });
  function klasseF(datum){
    if(!datum)return '';
    if(datum===td)return 'termin-heute';
    if(datum<td) return 'termin-vergangenheit';
    return ''; /* Zukunft: keine Klasse */
  }
  TERMINE.frei.forEach(function(f,i){
    var kl=klasseF(f.datum);
    var rows=document.querySelectorAll('.termin-frei-zeile');
    if(rows[i]&&kl)rows[i].classList.add(kl);
  });
  TERMINE.pflicht.forEach(function(p){
    var kl=klasseF(p.datum);
    var el=document.querySelector('[data-pflicht-id-row="'+p.id+'"]');
    if(el&&kl)el.classList.add(kl);
  });
}

function renderWichtig(){
  var html='';
  for(var i=0;i<2;i++){
    var w=WICHTIG[i];
    var opts=WICHTIG_KAT.map(function(k){return '<option value="'+k+'"'+(w.kategorie===k?' selected':'')+'>'+k+'</option>';}).join('');
    html+='<div class="wichtig-zeile"><select class="wichtig-select" data-idx="'+i+'" onchange="wichtigSp(this)"><option value="">&#8211; Kategorie &#8211;</option>'+opts+'</select>'
         +'<input type="text" class="wichtig-textin" data-idx="'+i+'" value="'+(w.text||'')+'" placeholder="Eintragen\u2026" maxlength="80" onchange="wichtigSp(this)" onblur="wichtigSp(this)"></div>';
  }
  document.getElementById('wichtig-anzeige').innerHTML=html;
}
function wichtigSp(el){var i=parseInt(el.dataset.idx);if(el.tagName==='SELECT')WICHTIG[i].kategorie=el.value;else WICHTIG[i].text=el.value;speichereWichtig();}

/* Feature 4+7: Checkliste mit 3 Zeilen */
function renderCheckliste(){
  var ids=sortierteCheckIds().filter(function(id){return AKTIVE_CHECKS.indexOf(id)!==-1;});
  var html='';
  ids.forEach(function(id){
    var a=AUFGABEN[id];
    var erl=STATE.erledigt.indexOf(id)!==-1;
    var enf=!erl&&entfaelltHeute(id);
    var aus=!erl&&!enf&&vertretungAusstehend(id);
    var person=getZustaendigePerson(id);
    var abw=!erl&&!enf&&!aus&&person&&STATE.abwesend.indexOf(person.id)!==-1;
    var rowKl=erl?'erledigt':abw?'warnung':(enf||aus)?'check-entfaellt':'';
    var togKl=abw&&!erl?'warnung':'';
    var sym=erl?'&#10003;':abw?'&#9888;':(enf||aus)?'&#8722;':'&#10007;';
    var warn=abw?'<div class="check-warnung">&#9888; '+person.name+' ist abwesend</div>':
             enf?'<div class="check-warnung" style="color:var(--rot)">&#9888; Entf&auml;llt heute</div>':
             aus?'<div class="check-warnung" style="color:var(--rot)">&#9888; Vertretung noch offen</div>':'';
    var wann=formatWann(id);
    var wannZeile=wann?'<div class="check-wann-anzeige">'+wann+'</div>':'';
    var persName=person?person.name:'&#8212;';
    var persZeile='<div class="check-person-zeile">&#128100; '+persName+'</div>';
    html+='<div class="check-row '+rowKl+'" id="cr-'+id+'">'
         +'<button class="check-toggle '+togKl+'" onclick="toggleErledigt(\''+id+'\')" title="'+(erl?'R\u00fckg\u00e4ngig':a.label)+'">'+sym+'</button>'
         +'<img src="'+a.foto+'" alt="'+a.label+'" class="check-symbol">'
         +'<div class="check-label-wrap" onclick="oeffneCheckPersonPicker(\''+id+'\',event)" title="Person wechseln">'+wannZeile+'<div class="check-aufgabe-name">'+a.label+'</div>'+persZeile+warn+'</div>'
         +'<button class="check-wann-btn" onclick="oeffneWannModal(\''+id+'\')" title="Zeitangabe bearbeiten">&#9200;</button>'
         +'</div>';
  });
  document.getElementById('check-tabelle').innerHTML=html;
  updateBadges();
  renderFortschritt();
}

/* ═══ EVENTS ═══ */
/* Feature 2: Abwesenheits-Modal (immer Popup, mit Dauer-Wahl) */
function toggleAbwesend(personId){
  if(editModus){
    if(_selectedAufgabe){
      var selId=_selectedAufgabe.aufgabeId,selSrc=_selectedAufgabe.personId;
      _selectedAufgabe=null;
      document.querySelectorAll('.aufg-icon-wrap.ausgewaehlt').forEach(function(el){el.classList.remove('ausgewaehlt');});
      if(selSrc!==personId){
        var a=AUFGABEN[selId];if(!a)return;
        var qi=GRUPPE.zustaendigkeiten.findIndex(function(z){return z.aufgabeId===selId&&z.personId===selSrc;});
        if(qi!==-1)GRUPPE.zustaendigkeiten.splice(qi,1);
        if(a.typ==='checkliste'){
          var xi=GRUPPE.zustaendigkeiten.findIndex(function(z){return z.aufgabeId===selId&&z.typ==='checkliste';});
          if(xi!==-1)GRUPPE.zustaendigkeiten.splice(xi,1);
        }
        GRUPPE.zustaendigkeiten.push({personId:personId,aufgabeId:selId,typ:a.typ});
        speichereZuordnung();renderNamen();initSortable();renderCheckliste();
      }
      return;
    }
    oeffneAufgabenModal(personId);return;
  }
  oeffneAbwesenheitsModal(personId);
}
function oeffneAbwesenheitsModal(personId){
  var p=MITARBEITENDE.find(function(m){return m.id===personId;});if(!p)return;
  var istAbw=STATE.abwesend.indexOf(personId)!==-1;
  var istW=(STATE.abwesendWeiteres||[]).indexOf(personId)!==-1;
  var html='<div class="modal-kopf"><h2>&#128100; '+p.name+'</h2>'
           +'<button class="modal-schliessen" onclick="schM(\'abwesend-modal\')">&#10005;</button></div>';
  if(istAbw){
    html+='<p style="font-size:.82rem;color:var(--grau);margin:4px 0 16px;">'
         +'Abwesend '+(istW?'<strong>bis auf weiteres</strong>':'<strong>nur heute</strong>')+'</p>';
    html+='<div class="modal-btns">'
         +'<button class="btn-modal-secondary" onclick="schM(\'abwesend-modal\')">Abbrechen</button>'
         +'<button class="btn-modal-primary" onclick="setzeAnwesend('+personId+')">&#10003; Wieder anwesend</button>'
         +'</div>';
  } else {
    html+='<p style="font-size:.85rem;margin:4px 0 14px;">Wie lange ist <strong>'+p.name+'</strong> abwesend?</p>';
    html+='<div style="display:flex;flex-direction:column;gap:8px;margin-bottom:14px;">'
         +'<button class="btn-abw-option" onclick="setzeAbwesend('+personId+',\'1tag\')">'         +'&#9728; Nur heute &ndash; 1 Tag<br><small>Morgen automatisch wieder anwesend</small></button>'
         +'<button class="btn-abw-option btn-abw-weiteres" onclick="setzeAbwesend('+personId+',\'weiteres\')">'         +'&#9899; Bis auf weiteres<br><small>Bleibt abwesend bis manuell geändert</small></button>'
         +'</div>'
         +'<div class="modal-btns"><button class="btn-modal-secondary" onclick="schM(\'abwesend-modal\')">Abbrechen</button></div>';
  }
  document.getElementById('abwesend-modal-body').innerHTML=html;
  document.getElementById('abwesend-modal').classList.add('sichtbar');
}
function setzeAbwesend(personId,dauer){
  if(STATE.abwesend.indexOf(personId)===-1)STATE.abwesend.push(personId);
  if(dauer==='weiteres'){
    if(!STATE.abwesendWeiteres)STATE.abwesendWeiteres=[];
    if(STATE.abwesendWeiteres.indexOf(personId)===-1)STATE.abwesendWeiteres.push(personId);
  }
  speichereState();
  schM('abwesend-modal');
  var cz=GRUPPE.zustaendigkeiten.filter(function(z){
    return z.personId===personId&&z.typ==='checkliste'&&AKTIVE_CHECKS.indexOf(z.aufgabeId)!==-1;
  }).map(function(z){return{aufgabeId:z.aufgabeId};});
  Object.keys(STATE.vertretungen).forEach(function(id){
    if(getVertPerson(id)===personId&&AKTIVE_CHECKS.indexOf(id)!==-1)
      if(!cz.find(function(t){return t.aufgabeId===id;}))cz.push({aufgabeId:id});
  });
  if(cz.length>0){oeffneVertretungsModal(personId,cz);return;}
  renderNamen();renderCheckliste();
}
function setzeAnwesend(personId){
  var i=STATE.abwesend.indexOf(personId);if(i!==-1)STATE.abwesend.splice(i,1);
  if(STATE.abwesendWeiteres){var w=STATE.abwesendWeiteres.indexOf(personId);if(w!==-1)STATE.abwesendWeiteres.splice(w,1);}
  GRUPPE.zustaendigkeiten.filter(function(z){return z.personId===personId&&z.typ==='checkliste';})
    .forEach(function(z){if(getVertDauer(z.aufgabeId)==='1tag')delete STATE.vertretungen[z.aufgabeId];});
  speichereState();
  schM('abwesend-modal');
  renderNamen();renderCheckliste();
}
function toggleErledigt(id){
  var idx=STATE.erledigt.indexOf(id);
  if(idx===-1)STATE.erledigt.push(id);else STATE.erledigt.splice(idx,1);
  speichereState();renderCheckliste();
}

/* ═══ MODALS ═══ */
function schM(id){
  document.getElementById(id).classList.remove('sichtbar');
  if(id==='aufgaben-modal'&&editModus){setTimeout(initSortable,100);}
  /* Feature 3: Warn-Rahmen sofort sichtbar nach "Später entscheiden" oder Backdrop-Klick */
  if(id==='vertretung-modal'){renderNamen();renderCheckliste();}
}
function modalAK(e,id){if(e.target===document.getElementById(id))schM(id);}

/* Namen (Feature 3: 1-spaltig + sortable, kein Standard) */
var namenSortable=null;
function oeffneNamenModal(){
  var html='';
  MITARBEITENDE.forEach(function(p,idx){
    html+='<div class="namen-sort-item" data-person-id="'+p.id+'">'
         +'<div class="namen-drag-handle">&#8661;</div>'
         +'<span class="namen-nr">'+(idx+1)+'.</span>'
         +'<input class="namen-input" type="text" value="'+p.name+'" data-person-id="'+p.id+'" maxlength="20" placeholder="Vorname N.">'
         +'<button class="namen-del-btn" onclick="loescheNamenZeile(this)" title="Person entfernen">&#10005;</button>'
         +'</div>';
  });
  document.getElementById('namen-felder').innerHTML=html;
  document.getElementById('namen-modal').classList.add('sichtbar');
  if(typeof Sortable!=='undefined'){
    if(namenSortable)namenSortable.destroy();
    namenSortable=new Sortable(document.getElementById('namen-felder'),{
      animation:150,handle:'.namen-drag-handle',
      onEnd:function(){updateNamenNummern();}
    });
  }
  setTimeout(function(){var f=document.querySelector('.namen-input');if(f)f.focus();},80);
}
function updateNamenNummern(){
  document.querySelectorAll('.namen-sort-item .namen-nr').forEach(function(el,i){el.textContent=(i+1)+'.';});
}
function loescheNamenZeile(btn){
  var item=btn.closest('.namen-sort-item');if(!item)return;
  if(document.querySelectorAll('.namen-sort-item').length<=1)return;
  item.remove();updateNamenNummern();
}
function fuegeNamenHinzu(){
  var alleIds=MITARBEITENDE.map(function(p){return p.id;});
  document.querySelectorAll('.namen-sort-item[data-person-id]').forEach(function(el){
    var id=parseInt(el.dataset.personId);if(!isNaN(id))alleIds.push(id);
  });
  var neueId=alleIds.length>0?Math.max.apply(null,alleIds)+1:1;
  var nr=document.querySelectorAll('.namen-sort-item').length+1;
  var item=document.createElement('div');
  item.className='namen-sort-item';item.dataset.personId=neueId;
  item.innerHTML='<div class="namen-drag-handle">&#8661;</div>'
               +'<span class="namen-nr">'+nr+'.</span>'
               +'<input class="namen-input" type="text" value="" data-person-id="'+neueId+'" maxlength="20" placeholder="Vorname N.">'
               +'<button class="namen-del-btn" onclick="loescheNamenZeile(this)" title="Person entfernen">&#10005;</button>';
  document.getElementById('namen-felder').appendChild(item);
  if(namenSortable)namenSortable.destroy();
  namenSortable=new Sortable(document.getElementById('namen-felder'),{
    animation:150,handle:'.namen-drag-handle',onEnd:function(){updateNamenNummern();}
  });
  item.querySelector('.namen-input').focus();
}
function sortNamenAlpha(){
  var items=Array.from(document.querySelectorAll('.namen-sort-item'));
  items.sort(function(a,b){
    var va=a.querySelector('.namen-input').value;
    var vb=b.querySelector('.namen-input').value;
    var la=va.split(' ').pop().replace('.','');
    var lb=vb.split(' ').pop().replace('.','');
    return la.localeCompare(lb,'de');
  });
  var c=document.getElementById('namen-felder');
  items.forEach(function(item){c.appendChild(item);});
  updateNamenNummern();
}
function speichereNamenAusModal(){
  var items=document.querySelectorAll('.namen-sort-item');
  var alleAltenIds=MITARBEITENDE.map(function(p){return p.id;});
  var ordered=[];
  items.forEach(function(item){
    var id=parseInt(item.dataset.personId);
    var inp=item.querySelector('.namen-input');
    var name=(inp&&inp.value.trim())||'';
    if(!name)return;
    var bestehend=MITARBEITENDE.find(function(p){return p.id===id;});
    if(bestehend){bestehend.name=name;ordered.push(bestehend);}
    else{ordered.push({id:id,name:name});}
  });
  if(ordered.length===0)return;
  /* Entfernte Personen: Zuständigkeiten und State bereinigen */
  var entferntIds=alleAltenIds.filter(function(id){return !ordered.find(function(p){return p.id===id;});});
  entferntIds.forEach(function(id){
    GRUPPE.zustaendigkeiten=GRUPPE.zustaendigkeiten.filter(function(z){return z.personId!==id;});
    var ai=STATE.abwesend.indexOf(id);if(ai!==-1)STATE.abwesend.splice(ai,1);
    Object.keys(STATE.vertretungen).forEach(function(aufgId){if(getVertPerson(aufgId)===id)delete STATE.vertretungen[aufgId];});
    delete ARBEITSNOTIZEN[id];
  });
  MITARBEITENDE.splice(0,MITARBEITENDE.length);
  ordered.forEach(function(p){MITARBEITENDE.push(p);});
  localStorage.setItem(NAMEN_KEY,JSON.stringify(MITARBEITENDE.map(function(p){return{id:p.id,name:p.name};})));
  if(entferntIds.length>0){speichereZuordnung();speichereState();speichereArbeitsnotizen();}
  schM('namen-modal');renderNamen();initSortable();renderCheckliste();
}

/* Leitung */
function oeffneLeitungModal(){
  var labels=['Gruppenleitung','Vertretung 1','Vertretung 2'],html='';
  for(var i=0;i<3;i++){
    var ak=LEITUNG.aktiv===i;
    html+='<div class="leitung-modal-zeile'+(ak?' aktiv':'')+'" id="lmz-'+i+'">'
         +'<input type="radio" name="leit-aktiv" class="leitung-radio" value="'+i+'"'+(ak?' checked':'')+' onchange="leitRadCh()">'
         +'<div class="leitung-modal-info"><div class="leitung-modal-rolle">'+labels[i]+'</div>'
         +'<input class="leitung-modal-input" type="text" value="'+(LEITUNG.namen[i]||'')+'" data-idx="'+i+'" placeholder="Name \u2026"></div></div>';
  }
  document.getElementById('leitung-modal-inhalt').innerHTML=html;
  document.getElementById('leitung-modal').classList.add('sichtbar');
}
function leitRadCh(){
  for(var i=0;i<3;i++){var z=document.getElementById('lmz-'+i);if(z)z.classList.remove('aktiv');}
  var c=document.querySelector('input[name="leit-aktiv"]:checked');
  if(c){var z=document.getElementById('lmz-'+c.value);if(z)z.classList.add('aktiv');}
}
function speichereLeitungAusModal(){
  var c=document.querySelector('input[name="leit-aktiv"]:checked');LEITUNG.aktiv=c?parseInt(c.value):0;
  document.querySelectorAll('.leitung-modal-input[data-idx]').forEach(function(inp){LEITUNG.namen[parseInt(inp.dataset.idx)]=inp.value.trim();});
  speichereLeitung();schM('leitung-modal');renderLeitung();
}

/* Aufgaben-Zuweisung */
var aufgabenModalPersonId=null;
function oeffneAufgabenModal(personId){
  aufgabenModalPersonId=personId;
  var person=MITARBEITENDE.find(function(p){return p.id===personId;});
  var aktuell=GRUPPE.zustaendigkeiten.filter(function(z){return z.personId===personId;}).map(function(z){return z.aufgabeId;});
  function chip(id,kl){
    var a=AUFGABEN[id],gew=aktuell.indexOf(id)!==-1;
    var inaktiv=a.typ==='checkliste'&&AKTIVE_CHECKS.indexOf(id)===-1;
    var and=a.typ==='checkliste'?GRUPPE.zustaendigkeiten.find(function(z){return z.aufgabeId===id&&z.personId!==personId;}):null;
    var andP=and?MITARBEITENDE.find(function(p){return p.id===and.personId;}):null;
    return '<button class="aufg-chip '+kl+(gew?' gewaehlt':'')+(inaktiv?' inaktiv-chip':'')+'" data-aufgabe-id="'+id+'" onclick="chipToggle(this)">'
          +'<img src="'+a.foto+'" alt="'+a.label+'"><span>'+a.label
          +(andP&&!gew?'<span class="aufg-chip-belegt">aktuell: '+andP.name+'</span>':'')
          +(inaktiv?'<span class="aufg-chip-warn">&#9888; Zuerst in Checkliste aktivieren</span>':'')
          +'</span><div class="aufg-chip-check">'+(gew?'&#10003;':'')+'</div></button>';
  }
  document.getElementById('aufgaben-modal-inhalt').innerHTML=
    '<div class="aufg-modal-person"><img src="portrait.jpg" alt="'+person.name+'" onerror="this.style.background=\'#e2e8f0\'"><div class="aufg-modal-person-name">'+person.name+'</div></div>'
   +'<div class="aufg-modal-cols">'
   +'<div><div class="aufg-col-titel gelb">&#128203; Checklisten-Aufgaben</div><div class="aufg-col-chips">'+sortierteCheckIds().map(function(id){return chip(id,'check-chip');}).join('')+'</div></div>'
   +'<div><div class="aufg-col-titel blau">&#9881; Allgemeine Zust&auml;ndigkeiten</div><div class="aufg-col-chips">'+sortierteZustIds().map(function(id){return chip(id,'zust-chip');}).join('')+'</div></div>'
   +'</div>';
  document.getElementById('aufgaben-modal').classList.add('sichtbar');
}
function chipToggle(btn){
  if(btn.classList.contains('inaktiv-chip'))return;
  btn.classList.toggle('gewaehlt');
  btn.querySelector('.aufg-chip-check').innerHTML=btn.classList.contains('gewaehlt')?'&#10003;':'';
}

/* Feature 1: Deaktivierung check-Aufgabe → Neuzuweisung */
var neuzuwQueue=[];
function speichereAufgabenAusModal(){
  var personId=aufgabenModalPersonId;
  var alt=GRUPPE.zustaendigkeiten.filter(function(z){return z.personId===personId&&z.typ==='checkliste';}).map(function(z){return z.aufgabeId;});
  var neu=GRUPPE.zustaendigkeiten.filter(function(z){return z.personId!==personId;});
  document.querySelectorAll('.aufg-chip.gewaehlt:not(.inaktiv-chip)').forEach(function(chip){
    var id=chip.dataset.aufgabeId,a=AUFGABEN[id];
    if(a.typ==='checkliste'){var idx=neu.findIndex(function(z){return z.aufgabeId===id&&z.typ==='checkliste';});if(idx!==-1)neu.splice(idx,1);}
    neu.push({personId:personId,aufgabeId:id,typ:a.typ});
  });
  GRUPPE.zustaendigkeiten=neu;speichereZuordnung();
  schM('aufgaben-modal');renderNamen();initSortable();

  /* Prüfe: aktive Check-Aufgaben ohne zuständige Person → Neuzuweisung */
  neuzuwQueue=[];
  AKTIVE_CHECKS.forEach(function(id){
    var hat=GRUPPE.zustaendigkeiten.find(function(z){return z.aufgabeId===id&&z.typ==='checkliste';});
    if(!hat)neuzuwQueue.push(id);
  });
  if(neuzuwQueue.length>0){oeffneNeuzuweisungModal();}
  else{renderCheckliste();}
}

function oeffneNeuzuweisungModal(){
  var html='';
  neuzuwQueue.forEach(function(id){
    var a=AUFGABEN[id];
    html+='<div class="neuzuw-block">'
         +'<div class="neuzuw-kopf"><img src="'+a.foto+'" alt="'+a.label+'"><span class="neuzuw-label">'+a.label+'</span></div>'
         +'<div class="neuzuw-person-liste">'
         +MITARBEITENDE.map(function(p){
           return '<label class="neuzuw-person-label"><input type="radio" name="neuzuw-'+id+'" value="'+p.id+'">'+p.name+'</label>';
         }).join('')
         +'</div>'
         +'<label class="neuzuw-loeschen-label"><input type="radio" name="neuzuw-'+id+'" value="loeschen"> &#128465; Aufgabe aus Checkliste entfernen</label>'
         +'</div>';
  });
  document.getElementById('neuzuw-inhalt').innerHTML=html;
  document.getElementById('neuzuw-modal').classList.add('sichtbar');
}
function speichereNeuzuweisungAusModal(){
  neuzuwQueue.forEach(function(id){
    var radio=document.querySelector('input[name="neuzuw-'+id+'"]:checked');
    if(!radio)return;
    if(radio.value==='loeschen'){
      var idx=AKTIVE_CHECKS.indexOf(id);if(idx!==-1)AKTIVE_CHECKS.splice(idx,1);
      speichereAktiveChecks();
    } else {
      var pId=parseInt(radio.value);
      var existing=GRUPPE.zustaendigkeiten.findIndex(function(z){return z.aufgabeId===id&&z.typ==='checkliste';});
      if(existing!==-1)GRUPPE.zustaendigkeiten.splice(existing,1);
      GRUPPE.zustaendigkeiten.push({personId:pId,aufgabeId:id,typ:'checkliste'});
      speichereZuordnung();
    }
  });
  schM('neuzuw-modal');renderNamen();initSortable();renderCheckliste();
}

/* Feature 2: Checkliste-Modal mit Pflicht-Zuweisung */
var AKTIVE_CHECKS_VOR_SAVE=[];
function oeffneChecklisteModal(){
  AKTIVE_CHECKS_VOR_SAVE=AKTIVE_CHECKS.slice();
  var ids=sortierteCheckIds(),html='';
  ids.forEach(function(id){
    var a=AUFGABEN[id],aktiv=AKTIVE_CHECKS.indexOf(id)!==-1,fix=id==='checkpoint';
    html+='<button class="check-modal-item'+(aktiv?' gewaehlt':'')+(fix?' fixiert':'')+'" data-check-id="'+id+'" data-fixiert="'+fix+'" onclick="checkModalClick(this)">'
         +'<img src="'+a.foto+'" alt="'+a.label+'"><span class="check-modal-label">'+a.label+(fix?' <span class="check-modal-hinweis">(immer aktiv)</span>':'')+'</span>'
         +'<div class="check-modal-cb">'+(aktiv?'&#10003;':'')+'</div></button>';
  });
  document.getElementById('check-modal-liste').innerHTML=html;
  document.getElementById('check-block-warn-container').innerHTML='';
  document.getElementById('checkliste-modal').classList.add('sichtbar');
}
function checkModalClick(btn){
  if(btn.dataset.fixiert==='true')return;
  btn.classList.toggle('gewaehlt');
  btn.querySelector('.check-modal-cb').innerHTML=btn.classList.contains('gewaehlt')?'&#10003;':'';
  document.getElementById('check-block-warn-container').innerHTML='';
}
function versucheChecklisteSpeichern(){
  var ausgewaehlt=['checkpoint'];
  document.querySelectorAll('.check-modal-item.gewaehlt').forEach(function(btn){if(btn.dataset.fixiert!=='true')ausgewaehlt.push(btn.dataset.checkId);});
  var neuAktiv=ausgewaehlt.filter(function(id){return AKTIVE_CHECKS_VOR_SAVE.indexOf(id)===-1;});
  var ohneTraeger=neuAktiv.filter(function(id){return !GRUPPE.zustaendigkeiten.find(function(z){return z.aufgabeId===id&&z.typ==='checkliste';});});
  if(ohneTraeger.length===0){speichereChecklisteEndgueltig(ausgewaehlt);return;}
  /* Warnung einblenden */
  var warnHtml='<div class="check-block-warn"><div class="check-block-warn-titel">&#9888; Folgende neue Aufgaben haben noch keine zust&auml;ndige Person:</div>';
  ohneTraeger.forEach(function(id){
    var a=AUFGABEN[id];
    warnHtml+='<div class="block-aufgabe-zeile">'
             +'<img src="'+a.foto+'" alt="'+a.label+'" class="block-aufgabe-img">'
             +'<span class="block-aufgabe-label">'+a.label+'</span>'
             +'<select class="block-person-select" data-aufgabe-id="'+id+'">'
             +'<option value="">&#8211; Person w&auml;hlen &#8211;</option>'
             +MITARBEITENDE.map(function(p){return '<option value="'+p.id+'">'+p.name+'</option>';}).join('')
             +'</select></div>'
             +'<label class="joker-label"><input type="checkbox" data-joker-id="'+id+'"> Vergebe ich nachtr&auml;glich</label>';
  });
  warnHtml+='</div>';
  document.getElementById('check-block-warn-container').innerHTML=warnHtml;
  /* Beachten: zweiter Klick auf Speichern speichert mit den gewählten Personen */
  var btn=document.querySelector('#checkliste-modal .btn-modal-primary');
  btn.onclick=function(){erzwingeChecklisteSpeichern(ausgewaehlt,ohneTraeger);};
}
function erzwingeChecklisteSpeichern(ausgewaehlt,ohneTraeger){
  ohneTraeger.forEach(function(id){
    var joker=document.querySelector('input[data-joker-id="'+id+'"]');
    if(joker&&joker.checked)return;
    var sel=document.querySelector('select[data-aufgabe-id="'+id+'"]');
    if(sel&&sel.value){
      var existing=GRUPPE.zustaendigkeiten.findIndex(function(z){return z.aufgabeId===id&&z.typ==='checkliste';});
      if(existing!==-1)GRUPPE.zustaendigkeiten.splice(existing,1);
      GRUPPE.zustaendigkeiten.push({personId:parseInt(sel.value),aufgabeId:id,typ:'checkliste'});
      speichereZuordnung();
    }
  });
  speichereChecklisteEndgueltig(ausgewaehlt);
  /* Button zurücksetzen */
  document.querySelector('#checkliste-modal .btn-modal-primary').onclick=versucheChecklisteSpeichern;
}
function speichereChecklisteEndgueltig(ausgewaehlt){
  AKTIVE_CHECKS=sortierteCheckIds().filter(function(id){return ausgewaehlt.indexOf(id)!==-1;});
  speichereAktiveChecks();schM('checkliste-modal');renderNamen();renderCheckliste();
}
function resetAktiveChecks(){
  AKTIVE_CHECKS=sortierteCheckIds();speichereAktiveChecks();schM('checkliste-modal');renderNamen();renderCheckliste();
}

/* Vertretung */
var vertPersonId=null,vertZust=[];
function oeffneVertretungsModal(personId,checkZust){
  vertPersonId=personId;vertZust=checkZust;
  var person=MITARBEITENDE.find(function(p){return p.id===personId;});
  document.getElementById('vert-beschreibung').innerHTML=
    '<strong>'+person.name+'</strong> ist abwesend. Bitte Vertretung und Dauer w&auml;hlen:';
  var html='';
  checkZust.forEach(function(z,zi){
    var a=AUFGABEN[z.aufgabeId];if(!a)return;
    var av=STATE.vertretungen[z.aufgabeId];
    var avPerson=getVertPerson(z.aufgabeId);
    var avDauer=getVertDauer(z.aufgabeId);
    if(zi>0)html+='<div class="vert-trenn"></div>';
    html+='<div class="vert-aufgabe-block"><div class="vert-aufgabe-kopf"><img src="'+a.foto+'" alt="'+a.label+'"><span class="vert-aufgabe-label">'+a.label+'</span></div>'
         /* Dauer-Auswahl */
         +'<div class="vert-dauer-wrap">'
         +'<label class="vert-dauer-label'+(avDauer==='1tag'?' gewaehlt':'')+'"><input type="radio" name="dauer-'+z.aufgabeId+'" value="1tag"'+(avDauer!=='weiteres'?' checked':'')+' onchange="vertDauerCh(this)"> Nur f\u00fcr 1 Tag</label>'
         +'<label class="vert-dauer-label'+(avDauer==='weiteres'?' gewaehlt':'')+'"><input type="radio" name="dauer-'+z.aufgabeId+'" value="weiteres"'+(avDauer==='weiteres'?' checked':'')+' onchange="vertDauerCh(this)"> Bis auf weiteres</label>'
         +'</div>'
         +'<label class="vert-entfaellt-label"><input type="checkbox" name="entf-'+z.aufgabeId+'" value="entfaellt"'+(avPerson==='entfaellt'?' checked':'')+' onchange="vertEntfCh(this,\''+z.aufgabeId+'\')"> Diese Aufgabe entf&auml;llt heute</label>'
         +'<div class="vert-person-liste">'+MITARBEITENDE.filter(function(p){return p.id!==personId;}).map(function(p){
           return '<label class="vert-person-label"><input type="radio" name="vert-'+z.aufgabeId+'" value="'+p.id+'"'+(avPerson===p.id?' checked':'')+'>'+p.name+'</label>';
         }).join('')+'</div></div>';
  });
  document.getElementById('vert-inhalt').innerHTML=html;
  document.getElementById('vertretung-modal').classList.add('sichtbar');
}
function vertDauerCh(radio){
  var wrap=radio.closest('.vert-dauer-wrap');
  if(!wrap)return;
  wrap.querySelectorAll('.vert-dauer-label').forEach(function(l){l.classList.remove('gewaehlt');});
  if(radio.checked)radio.closest('.vert-dauer-label').classList.add('gewaehlt');
}
function vertEntfCh(cb,id){
  var radios=document.querySelectorAll('input[name="vert-'+id+'"]');
  radios.forEach(function(r){r.disabled=cb.checked;if(cb.checked)r.checked=false;});
}
function speichereVertretungAusModal(){
  vertZust.forEach(function(z){
    var ec=document.querySelector('input[name="entf-'+z.aufgabeId+'"]');
    if(ec&&ec.checked){
      STATE.vertretungen[z.aufgabeId]={person:'entfaellt',dauer:'1tag'};return;
    }
    var r=document.querySelector('input[name="vert-'+z.aufgabeId+'"]:checked');
    var dauerEl=document.querySelector('input[name="dauer-'+z.aufgabeId+'"]:checked');
    var dauer=dauerEl?dauerEl.value:'1tag';
    if(r){STATE.vertretungen[z.aufgabeId]={person:parseInt(r.value),dauer:dauer};}
    else{delete STATE.vertretungen[z.aufgabeId];}
  });
  speichereState();
  schM('vertretung-modal');
  renderNamen();initSortable();renderCheckliste();
}

/* Feature 7: Wann-Modal */
var wannModalId=null;
var TAGE_LABELS=['Mo','Di','Mi','Do','Fr'];
function oeffneWannModal(id){
  wannModalId=id;
  var a=AUFGABEN[id];
  document.getElementById('wann-modal-titel').textContent=a.label;
  var z=ZEITEN[id]||{tage:[],uhrzeit:''};
  var gespeicherteTage=z.tage||[];
  document.getElementById('wann-tage').innerHTML=TAGE_LABELS.map(function(t){
    var aktiv=gespeicherteTage.indexOf(t)!==-1;
    return '<label class="wann-tag-label'+(aktiv?' aktiv':'')+'">'
          +'<input type="checkbox"'+(aktiv?' checked':'')+' value="'+t+'"'
          +' onchange="this.closest(\'.wann-tag-label\').classList.toggle(\'aktiv\',this.checked)"'
          +' style="display:none">'+t.toUpperCase()+'</label>';
  }).join('');
  document.getElementById('wann-uhrzeit').value=z.uhrzeit||'';
  document.getElementById('wann-modal').classList.add('sichtbar');
}
function speichereWannAusModal(){
  var tage=[];
  document.querySelectorAll('#wann-tage input[type="checkbox"]:checked').forEach(function(cb){tage.push(cb.value);});
  var uhrzeit=document.getElementById('wann-uhrzeit').value;
  ZEITEN[wannModalId]={tage:tage,uhrzeit:uhrzeit};
  speichereZeiten();schM('wann-modal');renderCheckliste();
}
function loescheWann(){
  delete ZEITEN[wannModalId];
  speichereZeiten();schM('wann-modal');renderCheckliste();
}
/* wannTagToggle nicht mehr benötigt – onchange auf Checkbox übernimmt die Arbeit */

/* ═══ ARBEIT-NOTIZ ═══ */
var arbeitModalPersonId=null;
function oeffneArbeitModal(personId,e){
  e.stopPropagation();
  arbeitModalPersonId=personId;
  var p=MITARBEITENDE.find(function(m){return m.id===personId;});
  document.getElementById('arbeit-modal-name').textContent='Arbeitsinhalt für: '+(p?p.name:'');
  var notiz=ARBEITSNOTIZEN[personId]||{text:'',dauer:'1tag'};
  document.getElementById('arbeit-textarea').value=notiz.text||'';
  /* Dauer Radio */
  var ist1tag=notiz.dauer!=='weiteres';
  document.querySelector('input[name="arbeit-dauer"][value="1tag"]').checked=ist1tag;
  document.querySelector('input[name="arbeit-dauer"][value="weiteres"]').checked=!ist1tag;
  document.getElementById('arbeit-dauer-1tag-label').classList.toggle('gewaehlt',ist1tag);
  document.getElementById('arbeit-dauer-weit-label').classList.toggle('gewaehlt',!ist1tag);
  document.getElementById('arbeit-modal').classList.add('sichtbar');
  setTimeout(function(){document.getElementById('arbeit-textarea').focus();},80);
}
function arbeitDauerCh(radio){
  document.getElementById('arbeit-dauer-1tag-label').classList.toggle('gewaehlt',radio.value==='1tag');
  document.getElementById('arbeit-dauer-weit-label').classList.toggle('gewaehlt',radio.value==='weiteres');
}
function speichereArbeitNotiz(){
  var text=document.getElementById('arbeit-textarea').value.trim();
  var dauerEl=document.querySelector('input[name="arbeit-dauer"]:checked');
  var dauer=dauerEl?dauerEl.value:'1tag';
  if(text){ARBEITSNOTIZEN[arbeitModalPersonId]={text:text,dauer:dauer};}
  else{delete ARBEITSNOTIZEN[arbeitModalPersonId];}
  speichereArbeitsnotizen();
  schM('arbeit-modal');
  renderNamen();
}
function loescheArbeitNotiz(){
  delete ARBEITSNOTIZEN[arbeitModalPersonId];
  speichereArbeitsnotizen();
  schM('arbeit-modal');
  renderNamen();
}

/* ═══ DRAG & DROP ═══ */
var editModus=false,sortableInstances=[];
var _dragAufgabeId=null,_dragSrcPersonId=null,_rowDropHandled=false;
var _selectedAufgabe=null; /* Click-to-Select Alternative */

function initSortable(){
  if(typeof Sortable==='undefined')return;
  sortableInstances.forEach(function(s){try{s.destroy();}catch(e){}});
  sortableInstances=[];
  document.querySelectorAll('.aufgaben-icons').forEach(function(el){
    sortableInstances.push(new Sortable(el,{
      group:'aufgaben',animation:150,disabled:!editModus,
      delay:200,delayOnTouchOnly:true,   /* Maus = sofort ziehbar, Touch = 200ms */
      forceFallback:false,
      onStart:function(evt){
        evt.item.style.opacity='0.7';
        _dragAufgabeId=evt.item.dataset.aufgabeId;
        var row=evt.item.closest('.namen-row');
        _dragSrcPersonId=row?parseInt(row.dataset.personId):null;
        /* Klick-Auswahl aufheben wenn Drag startet */
        _selectedAufgabe=null;
        document.querySelectorAll('.aufg-icon-wrap.ausgewaehlt').forEach(function(el){el.classList.remove('ausgewaehlt');});
      },
      onEnd:function(evt){
        evt.item.style.opacity='';
        if(_rowDropHandled){_rowDropHandled=false;_dragAufgabeId=null;_dragSrcPersonId=null;return;}
        _dragAufgabeId=null;_dragSrcPersonId=null;
        document.querySelectorAll('.namen-row').forEach(function(r){r.classList.remove('drag-hl');});
        var neu=[];
        document.querySelectorAll('.namen-row[data-person-id]').forEach(function(row){
          var pId=parseInt(row.dataset.personId);
          row.querySelectorAll('.aufg-icon-wrap[data-aufgabe-id]').forEach(function(w){
            neu.push({personId:pId,aufgabeId:w.dataset.aufgabeId,typ:w.dataset.typ});
          });
        });
        GRUPPE.zustaendigkeiten=neu;speichereZuordnung();renderCheckliste();
      }
    }));
  });
}

/* Click-to-Select: Icon antippen → leuchtet auf → andere Person antippen → zuweisen */
function selectIconInEditModus(aufgabeId,personId,e){
  e.stopPropagation();
  if(_selectedAufgabe&&_selectedAufgabe.aufgabeId===aufgabeId&&_selectedAufgabe.personId===personId){
    _selectedAufgabe=null;
    document.querySelectorAll('.aufg-icon-wrap.ausgewaehlt').forEach(function(el){el.classList.remove('ausgewaehlt');});
    return;
  }
  _selectedAufgabe={aufgabeId:aufgabeId,personId:personId};
  document.querySelectorAll('.aufg-icon-wrap.ausgewaehlt').forEach(function(el){el.classList.remove('ausgewaehlt');});
  e.currentTarget.classList.add('ausgewaehlt');
}

/* Symbol direkt auf Portrait oder Namen ziehen → Zuweisung */
function rowDragOver(e,personId){
  if(!editModus||!_dragAufgabeId)return;
  e.preventDefault();
  document.querySelectorAll('.namen-row').forEach(function(r){r.classList.remove('drag-hl');});
  var row=document.querySelector('.namen-row[data-person-id="'+personId+'"]');
  if(row)row.classList.add('drag-hl');
}
function rowDragLeave(e){/* Highlight bleibt bis zum nächsten dragover */}
function rowDrop(e,personId){
  if(!editModus||!_dragAufgabeId)return;
  e.preventDefault();e.stopPropagation();
  document.querySelectorAll('.namen-row').forEach(function(r){r.classList.remove('drag-hl');});
  if(personId===_dragSrcPersonId){_dragAufgabeId=null;_dragSrcPersonId=null;return;}
  var id=_dragAufgabeId,a=AUFGABEN[id];
  if(!a){_dragAufgabeId=null;return;}
  /* Aus Quelle entfernen */
  var qi=GRUPPE.zustaendigkeiten.findIndex(function(z){return z.aufgabeId===id&&z.personId===_dragSrcPersonId;});
  if(qi!==-1)GRUPPE.zustaendigkeiten.splice(qi,1);
  /* Bei Checkliste: sicherstellen nur ein Träger pro Aufgabe */
  if(a.typ==='checkliste'){
    var xi=GRUPPE.zustaendigkeiten.findIndex(function(z){return z.aufgabeId===id&&z.typ==='checkliste';});
    if(xi!==-1)GRUPPE.zustaendigkeiten.splice(xi,1);
  }
  GRUPPE.zustaendigkeiten.push({personId:personId,aufgabeId:id,typ:a.typ});
  speichereZuordnung();
  _rowDropHandled=true;_dragAufgabeId=null;_dragSrcPersonId=null;
  renderNamen();initSortable();renderCheckliste();
}
function toggleEditModus(){
  editModus=!editModus;
  var btn=document.getElementById('btn-edit');
  document.body.classList.toggle('edit-modus',editModus);
  btn.classList.toggle('aktiv',editModus);
  btn.innerHTML=editModus?'&#10003; Fertig':'&#9998; Zust&auml;ndigkeiten';
  document.getElementById('edit-leiste').classList.toggle('sichtbar',editModus);
  sortableInstances.forEach(function(s){s.option('disabled',!editModus);});
}

/* Feature 2: Tagesfortschritt */
function renderFortschritt(){
  var ids=AKTIVE_CHECKS;
  /* Entfallene (rot umrandet) und ausstehende (noch kein Vertretungs-Entscheid)
     zählen nicht zur erledigbaren Gesamtmenge */
  var effektiv=ids.filter(function(id){
    return !entfaelltHeute(id)&&!vertretungAusstehend(id);
  });
  var gesamt=effektiv.length;
  var erl=STATE.erledigt.filter(function(id){return effektiv.indexOf(id)!==-1;}).length;
  var entf=ids.length-gesamt;
  var pct=gesamt>0?Math.round(erl/gesamt*100):0;
  var b=8,voll=Math.round(pct/100*b),bar='';
  for(var i=0;i<b;i++)bar+=i<voll?'\u2588':'\u2591';
  var el=document.getElementById('fortschritt-anzeige');if(!el)return;
  var txt=erl+'/'+gesamt+'\u2002'+bar+'\u2002'+pct+'%';
  if(entf>0)txt+='\u2002\u2212'+entf+'\u00d7\u2205';
  el.textContent=txt;
  el.style.color=pct===100?'var(--gruen)':pct>=50?'var(--gelb)':'var(--grau)';
}

/* Feature 4: Check-Person-Picker */
var _checkPickerId=null;
function oeffneCheckPersonPicker(id,event){
  event.stopPropagation();
  _checkPickerId=id;
  var a=AUFGABEN[id],cur=getZustaendigePerson(id);
  var enf=entfaelltHeute(id);
  var html='<div style="font-size:.7rem;font-weight:900;color:var(--rot);margin-bottom:8px;padding-bottom:6px;border-bottom:1px solid var(--hell);">'+a.label+'</div>';
  html+='<div style="display:flex;flex-direction:column;gap:3px;max-height:300px;overflow-y:auto;">';
  /* Entfällt-Option immer ganz oben */
  html+='<button onclick="weiseCheckPersonZu(\'entfaellt\')" style="display:flex;align-items:center;gap:8px;width:100%;padding:7px 10px;border-radius:8px;border:2px solid '+(enf?'var(--rot)':'#fca5a5')+';background:'+(enf?'#fef2f2':'white')+';cursor:pointer;font-family:inherit;font-size:.82rem;font-weight:700;">'
       +'\u26D4 Aufgabe entf\u00e4llt heute'+(enf?' \u2713':'')+'</button>';
  html+='<div style="height:1px;background:var(--hell);margin:2px 0;"></div>';
  MITARBEITENDE.forEach(function(p){
    var ist=!enf&&cur&&cur.id===p.id;
    html+='<button onclick="weiseCheckPersonZu('+p.id+')" style="display:flex;align-items:center;justify-content:space-between;width:100%;padding:7px 10px;border-radius:8px;border:2px solid '+(ist?'var(--rot)':'var(--hell)')+';background:'+(ist?'#fef2f2':'white')+';cursor:pointer;font-family:inherit;font-size:.82rem;font-weight:700;">'
         +p.name+(ist?' <span style="color:var(--rot);">\u2713</span>':'')+'</button>';
  });
  html+='</div>';
  document.getElementById('check-person-picker-inhalt').innerHTML=html;
  var popup=document.getElementById('check-person-picker');
  var rect=event.currentTarget.getBoundingClientRect();
  var left=rect.right+6;
  if(left+224>window.innerWidth)left=rect.left-230;
  var top=rect.top;
  if(top+360>window.innerHeight)top=window.innerHeight-366;
  popup.style.left=Math.max(left,8)+'px';
  popup.style.top=Math.max(top,8)+'px';
  popup.style.display='block';
}
function weiseCheckPersonZu(personId){
  var id=_checkPickerId;if(!id)return;
  if(personId==='entfaellt'){
    /* Aufgabe entfällt heute (1 Tag) */
    STATE.vertretungen[id]={person:'entfaellt',dauer:'1tag'};
    speichereState();
    schliesseCheckPicker();
    renderNamen();initSortable();renderCheckliste();
    return;
  }
  var ex=GRUPPE.zustaendigkeiten.findIndex(function(z){return z.aufgabeId===id&&z.typ==='checkliste';});
  if(ex!==-1)GRUPPE.zustaendigkeiten.splice(ex,1);
  delete STATE.vertretungen[id];
  GRUPPE.zustaendigkeiten.push({personId:personId,aufgabeId:id,typ:'checkliste'});
  speichereZuordnung();speichereState();
  schliesseCheckPicker();
  renderNamen();initSortable();renderCheckliste();
}
function schliesseCheckPicker(){
  var el=document.getElementById('check-person-picker');
  if(el)el.style.display='none';
  _checkPickerId=null;
}

/* Feature 2: Vertretung im Edit-Modus entfernen */
function entferneVertretung(aufgabeId){
  if(!editModus)return;
  delete STATE.vertretungen[aufgabeId];
  speichereState();
  renderNamen();initSortable();renderCheckliste();
}

/* ═══ UHRZEIT (Feature 6) ═══ */
var WOCHENTAGE=['Sonntag','Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag'];
var MONATE=['Januar','Februar','M\u00e4rz','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];
function getKW(d){
  var dt=new Date(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate()));
  var day=dt.getUTCDay()||7;
  dt.setUTCDate(dt.getUTCDate()+4-day);
  var jan1=new Date(Date.UTC(dt.getUTCFullYear(),0,1));
  return Math.ceil((((dt-jan1)/86400000)+1)/7);
}
function formatDatum2(d){
  return ('0'+d.getDate()).slice(-2)+'.'+('0'+(d.getMonth()+1)).slice(-2)+'.'+d.getFullYear().toString().slice(-2);
}
function berechneKWZeile(){
  var now=new Date();
  var dayOfWeek=now.getDay(); /* 0=So,1=Mo,...,6=Sa */
  var diffMo=(dayOfWeek===0)?-6:1-dayOfWeek;
  var mo=new Date(now);mo.setDate(now.getDate()+diffMo);
  var fr=new Date(mo);fr.setDate(mo.getDate()+4);
  return 'KW '+getKW(now)+' | '+formatDatum2(mo)+' – '+formatDatum2(fr);
}
function updateClock(){
  var now=new Date();
  var h=now.getHours().toString().padStart(2,'0');
  var m=now.getMinutes().toString().padStart(2,'0');
  document.getElementById('clock-time').textContent=h+':'+m;
  document.getElementById('clock-date').textContent=WOCHENTAGE[now.getDay()]+', den '+now.getDate()+'. '+MONATE[now.getMonth()]+' '+now.getFullYear();
  /* KW-Zeile automatisch */
  var kwEl=document.getElementById('banner-kw');
  if(kwEl)kwEl.textContent=berechneKWZeile();
  checkTerminDatumHeute();
}
setInterval(updateClock,30000);

/* ═══ INIT ═══ */
/* banner-kw wird von updateClock() gesetzt */
document.getElementById('jahr').textContent=new Date().getFullYear();
updateClock();

/* Popups bei Klick außerhalb schließen */
document.addEventListener('click',function(e){
  var popup=document.getElementById('aufg-info-popup');
  if(popup&&popup.style.display!=='none'){
    popup.style.display='none';popup.style.pointerEvents='none';
    clearTimeout(_infoTimeout);
  }
  var picker=document.getElementById('check-person-picker');
  if(picker&&picker.style.display!=='none'&&!picker.contains(e.target)){
    schliesseCheckPicker();
  }
  var tpop=document.getElementById('termin-naechster-popup');
  if(tpop&&tpop.style.display!=='none'&&!tpop.contains(e.target)){
    schliesseTerminPopup();
  }
});

/* ── Datum / Uhrzeit → gesprochenes Deutsch (global) ── */
function _z(n){
  var e=['','ein','zwei','drei','vier','fünf','sechs','sieben','acht','neun','zehn',
         'elf','zwölf','dreizehn','vierzehn','fünfzehn','sechzehn','siebzehn','achtzehn','neunzehn'];
  var z=['','','zwanzig','dreißig','vierzig','fünfzig','sechzig','siebzig','achtzig','neunzig'];
  if(n<=0)return 'null';if(n<20)return e[n];
  if(n<100){var r=n%10,t=Math.floor(n/10);return r?e[r]+'und'+z[t]:z[t];}
  if(n<1000){var h=Math.floor(n/100);return e[h]+'hundert'+(_z(n%100)||'');}
  if(n<10000){return _z(Math.floor(n/1000))+'tausend'+(_z(n%1000)||'');}
  return String(n);
}
var _TAGORD=['','ersten','zweiten','dritten','vierten','fünften','sechsten','siebten','achten',
  'neunten','zehnten','elften','zwölften','dreizehnten','vierzehnten','fünfzehnten','sechzehnten',
  'siebzehnten','achtzehnten','neunzehnten','zwanzigsten','einundzwanzigsten','zweiundzwanzigsten',
  'dreiundzwanzigsten','vierundzwanzigsten','fünfundzwanzigsten','sechsundzwanzigsten',
  'siebenundzwanzigsten','achtundzwanzigsten','neunundzwanzigsten','dreißigsten','einundreißigsten'];
var _MON=['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];
function datumSprache(s){
  var m=s.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})/);
  if(!m)return s;
  return (_TAGORD[parseInt(m[1])]||m[1]+'.')+' '+_MON[parseInt(m[2])-1]+' '+_z(parseInt(m[3]));
}
function uhrzeitSprache(s){
  var m=s.match(/(\d{1,2}):(\d{2})/);
  if(!m)return s;
  var h=parseInt(m[1]),min=parseInt(m[2]);
  return _z(h)+' Uhr'+(min>0?' '+_z(min):'');
}
function isoDatumSprache(iso){
  if(!iso)return '';
  var p=iso.split('-');
  if(p.length!==3)return iso;
  return datumSprache(p[2]+'.'+p[1]+'.'+p[0]);
}
function sprachText(s){
  if(!s)return s;
  s=s.replace(/\d{1,2}\.\d{1,2}\.\d{4}/g,datumSprache);
  s=s.replace(/\b(\d{1,2}):(\d{2})\b/g,uhrzeitSprache);
  return s;
}

/* ═══ BARRIEREFREIHEIT (a11y) ═══ */
(function(){
  /* ── Schriftgröße ── */
  var STUFEN=[14,16,18,20,22,24],STD=1;
  var stufe=parseInt(localStorage.getItem('a11y-stufe')||STD);
  function wendeSchrift(toast){
    document.documentElement.style.fontSize=STUFEN[stufe]+'px';
    localStorage.setItem('a11y-stufe',stufe);
    var g=document.getElementById('a11y-groesser'),k=document.getElementById('a11y-kleiner');
    if(g)g.disabled=stufe>=STUFEN.length-1;
    if(k)k.disabled=stufe<=0;
    if(toast)zeigToast('Schrift: '+STUFEN[stufe]+' px');
  }

  /* ── Kontrast ── */
  var kontrast=localStorage.getItem('a11y-kontrast')==='1';
  function wendeKontrast(toast){
    document.documentElement.classList.toggle('kontrast',kontrast);
    localStorage.setItem('a11y-kontrast',kontrast?'1':'0');
    var b=document.getElementById('a11y-kontrast');
    if(b)b.classList.toggle('kontrast-aktiv',kontrast);
    if(toast)zeigToast(kontrast?'Kontrast AN':'Kontrast AUS');
  }

  /* ── Leiste öffnen/schließen ── */
  var leistOffen=false;
  function leistToggle(){
    leistOffen=!leistOffen;
    var bar=document.getElementById('a11y-bar'),h=document.getElementById('btn-a11y-help');
    if(!bar||!h)return;
    bar.classList.toggle('offen',leistOffen);
    h.classList.toggle('offen',leistOffen);
    h.textContent=leistOffen?'✕':'H';
    h.setAttribute('aria-expanded',leistOffen);
  }
  function leistSchliessen(){
    if(!leistOffen)return;
    leistOffen=false;
    var bar=document.getElementById('a11y-bar'),h=document.getElementById('btn-a11y-help');
    if(bar)bar.classList.remove('offen');
    if(h){h.classList.remove('offen');h.textContent='H';h.setAttribute('aria-expanded',false);}
  }

  /* ── Vorlesen – Klick-auf-Bereich ── */
  var vorleseModus=false,spricht=false;

  /* Datum/Uhrzeit-Helfer → global definiert (s. oben) */

  /* Was wird gelesen, wenn ein Bereich angeklickt wird */
  function textFuerElement(target){
    /* Person-Zeile */
    var row=target.closest('.namen-row[data-person-id]');
    if(row){
      var pId=parseInt(row.dataset.personId);
      var p=MITARBEITENDE.find(function(m){return m.id===pId;});
      if(!p)return '';
      var abw=STATE.abwesend.indexOf(pId)!==-1;
      var aufg=GRUPPE.zustaendigkeiten.filter(function(z){return z.personId===pId;})
               .map(function(z){var a=AUFGABEN[z.aufgabeId];return a?a.label:'';}).filter(Boolean);
      var notiz=ARBEITSNOTIZEN&&ARBEITSNOTIZEN[pId]&&ARBEITSNOTIZEN[pId].text?ARBEITSNOTIZEN[pId].text:'';
      var txt=p.name+(abw?' – heute abwesend':'')+'. ';
      txt+=aufg.length?'Zuständig für: '+aufg.join(', ')+'. ':'Keine Aufgaben. ';
      if(notiz)txt+='Arbeitsinhalt: '+notiz+'. ';
      return txt;
    }
    /* Checklisten-Zeile */
    var cr=target.closest('.check-row');
    if(cr){
      var id=cr.id?cr.id.replace('cr-',''):'';
      var a=AUFGABEN[id];if(!a)return '';
      var erl=STATE.erledigt.indexOf(id)!==-1;
      var pers=getZustaendigePerson(id);
      var enf=entfaelltHeute(id),aus=vertretungAusstehend(id);
      /* Wann-Info */
      var wannTxt='';
      if(a.wann){
        var tgN={mo:'Montag',di:'Dienstag',mi:'Mittwoch',do:'Donnerstag',fr:'Freitag'};
        if(a.wann.tage&&a.wann.tage.length)wannTxt+='Wochentage: '+a.wann.tage.map(function(t){return tgN[t]||t;}).join(', ')+'. ';
        if(a.wann.zeit)wannTxt+='Uhrzeit: '+uhrzeitSprache(a.wann.zeit)+'. ';
      }
      var txt=a.label+'. '+wannTxt+'Verantwortlich: '+(pers?pers.name:'nicht zugewiesen')+'.';
      txt+=erl?' Erledigt.':enf?' Entfällt heute.':aus?' Vertretung noch offen.':' Noch offen.';
      return txt;
    }
    /* Leitung-Zeile */
    var lz=target.closest('.leitung-zeile');
    if(lz){
      var nm=lz.querySelector('.leitung-name'),ro=lz.querySelector('.leitung-rolle');
      return (ro?ro.textContent+': ':'')+(nm&&nm.textContent.trim()?nm.textContent.trim():'nicht eingetragen');
    }
    /* Termin-Zeile */
    var tz=target.closest('.termin-frei-zeile,.termin-pflicht-zeile');
    if(tz){
      var parts=[];
      var lbl=tz.querySelector('.termin-pflicht-label');if(lbl)parts.push(lbl.textContent.trim());
      tz.querySelectorAll('input').forEach(function(inp){
        var v=inp.value;if(!v)return;
        if(inp.type==='date')v=isoDatumSprache(v);
        else if(inp.type==='time')v=uhrzeitSprache(v);
        parts.push(v);
      });
      return parts.join(': ')||'Kein Termin eingetragen';
    }
    /* Wichtig-Zeile */
    var wz=target.closest('.wichtig-zeile');
    if(wz){
      var sel=wz.querySelector('select'),txt=wz.querySelector('input[type=text]');
      var pp=[];if(sel&&sel.value)pp.push(sel.value);if(txt&&txt.value)pp.push(txt.value);
      return pp.join(': ')||'Kein Eintrag';
    }
    /* Spalten-Header */
    var ch=target.closest('.col-header');
    if(ch)return ch.textContent.replace(/\s+/g,' ').trim();
    return '';
  }

  function vorlesenText(text,el){
    if(!window.speechSynthesis||!text)return;
    text=sprachText(text);
    window.speechSynthesis.cancel();
    document.querySelectorAll('.a11y-liest').forEach(function(e){e.classList.remove('a11y-liest');});
    if(el)el.classList.add('a11y-liest');
    spricht=true;
    var u=new SpeechSynthesisUtterance(text);
    u.lang='de-DE';u.rate=0.88;
    u.onend=u.onerror=function(){spricht=false;if(el)el.classList.remove('a11y-liest');};
    window.speechSynthesis.speak(u);
  }

  var LESE_SEL='.namen-row[data-person-id],.check-row,.leitung-zeile,.termin-frei-zeile,.termin-pflicht-zeile,.wichtig-zeile,.col-header';
  function aktiviereVorleseModus(){
    vorleseModus=true;
    document.getElementById('a11y-vorlesen').classList.add('vorlese-aktiv');
    document.body.style.cursor='crosshair';
    document.querySelectorAll(LESE_SEL).forEach(function(el){el.classList.add('a11y-lese-target');});
    zeigToast('Jetzt Bereich antippen zum Vorlesen – erneut ☝ zum Beenden');
  }
  function deaktiviereVorleseModus(){
    vorleseModus=false;
    var b=document.getElementById('a11y-vorlesen');if(b)b.classList.remove('vorlese-aktiv');
    document.body.style.cursor='';
    window.speechSynthesis&&window.speechSynthesis.cancel();
    document.querySelectorAll('.a11y-lese-target').forEach(function(el){el.classList.remove('a11y-lese-target');});
    document.querySelectorAll('.a11y-liest').forEach(function(el){el.classList.remove('a11y-liest');});
    spricht=false;
  }

  /* Klick im Vorlese-Modus (capture phase → vor allen anderen Handlern) */
  document.addEventListener('click',function(e){
    if(!vorleseModus)return;
    if(e.target.closest('#a11y-bar')||e.target.closest('#btn-a11y-help'))return;
    e.stopPropagation();e.preventDefault();
    var text=textFuerElement(e.target);
    if(text){
      var el=e.target.closest(LESE_SEL);
      vorlesenText(text,el);
    }
  },true);

  /* Toast */
  var toastTimer=null;
  function zeigToast(text){
    var t=document.getElementById('a11y-toast');if(!t)return;
    t.textContent=text;t.classList.add('sichtbar');
    clearTimeout(toastTimer);
    toastTimer=setTimeout(function(){t.classList.remove('sichtbar');},2400);
  }

  /* Event-Listener */
  document.getElementById('btn-a11y-help').addEventListener('click',function(e){e.stopPropagation();leistToggle();});
  document.getElementById('a11y-groesser').addEventListener('click',function(e){e.stopPropagation();if(stufe<STUFEN.length-1){stufe++;wendeSchrift(true);}});
  document.getElementById('a11y-kleiner').addEventListener('click',function(e){e.stopPropagation();if(stufe>0){stufe--;wendeSchrift(true);}});
  document.getElementById('a11y-kontrast').addEventListener('click',function(e){e.stopPropagation();kontrast=!kontrast;wendeKontrast(true);});
  document.getElementById('a11y-vorlesen').addEventListener('click',function(e){
    e.stopPropagation();
    if(vorleseModus){deaktiviereVorleseModus();}else{aktiviereVorleseModus();}
  });

  /* Leiste bei Außen-Klick schließen */
  document.addEventListener('click',function(e){
    var bar=document.getElementById('a11y-bar');
    if(leistOffen&&bar&&!bar.contains(e.target)&&e.target.id!=='btn-a11y-help')leistSchliessen();
  });

  /* ESC beendet Vorlese-Modus */
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&vorleseModus)deaktiviereVorleseModus();});

  /* Beim Laden sofort anwenden */
  wendeSchrift(false);
  wendeKontrast(false);
})();

var gespeicherteKST=localStorage.getItem('chk-letzte-kst');
if(gespeicherteKST&&/^\d{5}$/.test(gespeicherteKST)){
  wechsleKostenstelle(gespeicherteKST);
} else {
  document.getElementById('kst-login-overlay').style.display='flex';
  document.getElementById('banner-name').textContent='Gruppen\u00b7Checkpoint';
  document.getElementById('kst-anzeige-nr').textContent='\u2014';
  setTimeout(function(){var f=document.getElementById('kst-input');if(f)f.focus();},200);
}
