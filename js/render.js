/* ══════════════════════════════════════════════════════
   render.js – Gruppen·Checkpoint
   ANZEIGE-EBENE: alles, was auf dem Dashboard erscheint
   (Personen-Zeilen, Termine, Uhrzeit, Sprachausgabe-Formatierung).
   Version: 2026-08-19
   Studjo | Evangelisches Johanneswerk
   ══════════════════════════════════════════════════════ */

function formatTerminDatum(iso){
  if(!iso)return '';
  var d=new Date(iso+'T00:00:00');
  var wt=['SO','MO','DI','MI','DO','FR','SA'][d.getDay()];
  var dd=String(d.getDate()).padStart(2,'0');
  var mm=String(d.getMonth()+1).padStart(2,'0');
  var yy=String(d.getFullYear()).slice(2);
  return wt+', '+dd+'.'+mm+'.'+yy;
}
function formatTerminAnzeige(datum,uhrzeit){
  if(!datum)return '';
  return formatTerminDatum(datum)+(uhrzeit?' um '+uhrzeit+' Uhr':'');
}

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
var _TAGKUERZEL={mo:1,di:2,mi:3,do:4,fr:5};
/* Bug2: zentrale, case-insensitive Umwandlung Kürzel → voller Wochentagsname */
var _TAG_VOLL_MAP={mo:'Montag',di:'Dienstag',mi:'Mittwoch',do:'Donnerstag',fr:'Freitag',sa:'Samstag',so:'Sonntag'};
function tagVollName(t){return _TAG_VOLL_MAP[String(t).toLowerCase()]||t;}
function heuteIstGeplantFuer(id){
  var _zt=ZEITEN[id]||{};
  if(!_zt.tage||_zt.tage.length===0)return true;
  var wt=new Date().getDay();
  /* Bug2: Kürzel case-insensitiv vergleichen (gespeichert z.B. als "Mi", nicht "mi") */
  return _zt.tage.some(function(t){return _TAGKUERZEL[String(t).toLowerCase()]===wt;});
}
function istFaelligJetzt(id){
  var a=AUFGABEN[id];if(!a)return false;
  if(STATE.erledigt.indexOf(id)!==-1)return false;
  if(entfaelltHeute&&entfaelltHeute(id))return false;
  if(vertretungAusstehend&&vertretungAusstehend(id))return false;
  if(!heuteIstGeplantFuer(id))return false;
  var jetzt=new Date();
  var h=jetzt.getHours(),m=jetzt.getMinutes();
  var wt=jetzt.getDay();
  var _zt=ZEITEN[id]||{};
  var zeitStr=_zt.uhrzeit?_zt.uhrzeit:(wt===5?'14:30':'15:00');
  var tp=zeitStr.split(':');
  var fh=parseInt(tp[0]),fm=parseInt(tp[1]||0);
  return h>fh||(h===fh&&m>=fm);
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

/* ═══ RENDER ═══ */
/* Portrait konnte nicht geladen werden: erst Platzhalter-Muster versuchen,
   erst wenn das auch fehlt (z. B. Ordner "symbole" nicht vorhanden) grauer Kreis wie bisher. */
function fotoFehler(img){
  if(img.dataset.platzhalter){
    img.style.background='#e2e8f0';
    img.style.opacity=0;
    return;
  }
  img.dataset.platzhalter='1';
  img.src='symbole/portrait.jpg';
}

function renderNamen(){
  var html='';
  MITARBEITENDE.forEach(function(p){
    var abw=STATE.abwesend.indexOf(p.id)!==-1;

    /* Permanente Zuständigkeiten dieser Person */
    /* Bug5: check-Icons immer vor zust-Icons rendern, unabhängig von gespeicherter Reihenfolge */
    var zust=GRUPPE.zustaendigkeiten.filter(function(z){return z.personId===p.id;}).sort(function(a,b){return (a.typ==='checkliste'?0:1)-(b.typ==='checkliste'?0:1);});

    /* Vertretungs-Aufgaben (V-Badge):
       Im Normal-Modus nur heute aktive, im Edit-Modus ALLE anzeigen */
    var allVertIds=Object.keys(STATE.vertretungen).filter(function(id){
      return getVertPerson(id)===p.id;
    });
    var vertIds=editModus ? allVertIds : allVertIds.filter(function(id){return AKTIVE_CHECKS.indexOf(id)!==-1;});

    var icons='';
    var vertHtml='';

    /* Permanente Icons (sortierbar: check- gelb, zust- blau) */
    zust.forEach(function(z){
      var a=AUFGABEN[z.aufgabeId];if(!a)return;
      if(z.typ==='checkliste'&&AKTIVE_CHECKS.indexOf(z.aufgabeId)===-1)return;
      /* Feature 1: Symbol ausblenden wenn Aufgabe entfällt heute */
      if(z.typ==='checkliste'&&entfaelltHeute(z.aufgabeId))return;
      var erl=STATE.erledigt.indexOf(z.aufgabeId)!==-1;
      var badge=z.typ==='checkliste'?'<div class="aufg-badge'+(erl?' erledigt':'')+'" id="badge-'+z.aufgabeId+'">'+(erl?'&#10003;':'!')+'</div>':'';
      var clickFn=editModus?'selectIconInEditModus(\''+z.aufgabeId+'\','+p.id+',event)':'oeffneAufgabenInfoModal(\''+z.aufgabeId+'\',event)';
      icons+='<div class="aufg-icon-wrap" data-aufgabe-id="'+z.aufgabeId+'" data-typ="'+z.typ+'" onclick="'+clickFn+'">'
            +'<img src="'+a.foto+'" alt="'+a.label+'" title="'+a.label+'" class="aufg-icon-img">'+badge+'</div>';
    });

    /* Vertretungs-Icons (orangefarbener Rahmen, V-Badge) – fest rechtsbündig, nicht sortierbar */
    vertIds.forEach(function(id){
      var a=AUFGABEN[id];if(!a)return;
      var hatPermanent=GRUPPE.zustaendigkeiten.find(function(z){return z.aufgabeId===id&&z.personId===p.id;});
      if(hatPermanent)return;
      var erl=STATE.erledigt.indexOf(id)!==-1;
      var badge='<div class="aufg-badge'+(erl?' erledigt':' vert')+'" id="badge-vert-'+id+'">'+(erl?'&#10003;':'V')+'</div>';
      var dauer=getVertDauer(id);
      /* Im Edit-Modus: Remove-Button + Dauer-Hinweis anzeigen */
      var removeBtn=editModus?'<button class="aufg-vert-remove-btn" onclick="event.stopPropagation();entferneVertretung(\''+id+'\')" title="Vertretung '+(dauer==='weiteres'?'(bis auf weiteres) ':'')+'entfernen">&#10005;</button>':'';
      vertHtml+='<div class="aufg-icon-wrap aufg-vert" data-aufgabe-id="'+id+'" data-typ="checkliste" onclick="'+(editModus?'event.stopPropagation()':'oeffneAufgabenInfoModal(\''+id+'\',event)')+'" title="Vertretung: '+a.label+(editModus?' | Dauer: '+(dauer==='weiteres'?'bis auf weiteres':'nur heute'):'')+'">'+
            '<img src="'+a.foto+'" alt="'+a.label+'" class="aufg-icon-img">'+badge+removeBtn+'</div>';
    });

    var notiz=ARBEITSNOTIZEN[p.id];
    var _hatStufe=notiz&&notiz.stufe!==undefined&&notiz.stufe!==null&&notiz.stufe!=='';
    var hatNotiz=notiz&&(notiz.text||notiz.auslastung||_hatStufe);
    var _auslTitles={gut:'Gut ausgelastet',bald:'L\u00e4uft bald aus',keine:'Keine/Kaum Arbeit'};
    var _auslKl=notiz&&notiz.auslastung?' auslast-'+notiz.auslastung:'';
    var _titelTeile=[];
    if(notiz&&notiz.auslastung&&_auslTitles[notiz.auslastung])_titelTeile.push(_auslTitles[notiz.auslastung]);
    if(_hatStufe)_titelTeile.push('Stufe '+notiz.stufe);
    if(notiz&&notiz.text)_titelTeile.push(notiz.text.slice(0,60));
    var _arbTitel=hatNotiz?_titelTeile.join(' \u2013 '):'Arbeitsinhalt eintragen';
    var _arbBadgeTxt=_hatStufe?String(notiz.stufe):'';
    var arbeitIconHtml='<div class="aufg-icon-wrap arbeit-icon-fixed'+_auslKl+'" onclick="oeffneArbeitModal('+p.id+',event)" title="'+_arbTitel+'">'
      +'<img src="symbole/arbeit.jpg" alt="Arbeit" class="aufg-icon-img" onerror="this.style.background=\'#e2e8f0\'">'
      +(_arbBadgeTxt?'<div class="aufg-badge arbeit-badge">'+_arbBadgeTxt+'</div>':'')
      +'</div>';
    html+='<div class="namen-row'+(abw?' abwesend':'')+'" data-person-id="'+p.id+'">'
         +'<img src="'+fotoPfad(p.name)+'" alt="'+p.name+'" class="person-portrait" title="Nur meine Aufgaben" onerror="fotoFehler(this)" onclick="oeffneFokusModal('+p.id+',event)" ondragover="rowDragOver(event,'+p.id+')" ondrop="rowDrop(event,'+p.id+')" ondragleave="rowDragLeave(event)">'
         +'<div class="person-name" onclick="event.stopPropagation();toggleAbwesend('+p.id+')" ondragover="rowDragOver(event,'+p.id+')" ondrop="rowDrop(event,'+p.id+')" ondragleave="rowDragLeave(event)" style="position:relative;">'+p.name+'<button class="profil-badge" onclick="event.stopPropagation();oeffneProfilModal('+p.id+',event)" title="Profil bearbeiten">&#128101;</button>'+'</div>'
         +arbeitIconHtml
         +'<div class="aufgaben-icons">'+icons+'</div>'
         +'<div class="vert-icons-fixed">'+vertHtml+'</div>'
         +'</div>';
  });
  document.getElementById('namen-tabelle').innerHTML=html;
  renderAnwesenheit();
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
    html+='<div class="leitung-zeile'+(ak?' aktiv':'')+'">'
         +'<div class="leitung-symbol" onclick="setzeLeitungAktiv('+i+')" title="Als Leitung setzen" style="cursor:pointer;">'+(ak?'<span style="font-size:1.5rem;line-height:1;">&#128081;</span>':'<span style="font-size:1.1rem;color:var(--grau);">&#9675;</span>')+'</div>'
         +'<div><div class="leitung-name'+(nm?'':' leer')+'">'+(nm||'(nicht eingetragen)')+'</div>'
         +'<div class="leitung-rolle">'+labels[i]+'</div></div>'
         +'</div>';
  }
  document.getElementById('leitung-anzeige').innerHTML=html;
}
function setzeLeitungAktiv(idx){
  LEITUNG.aktiv=idx;
  speichereLeitung();
  renderLeitung();
}

function renderTermine(){
  var html='';

  /* 2 freie Termine */
  TERMINE.frei.forEach(function(f,idx){
    var dt=formatTerminAnzeige(f.datum,f.uhrzeit||'');
    html+='<div class="termin-frei-zeile" data-frei-idx="'+idx+'">'
        +'<div class="termin-ikon-col">'
        +'<button class="termin-ikon-btn" data-frei-idx="'+idx+'" onclick="oeffneTerminDtModal(this)" title="Datum und Uhrzeit einstellen">&#128197;</button>'
        +'</div>'
        +'<div class="termin-content-col">'
        +(dt?'<div class="termin-dt-anzeige">'+dt+'</div>':'<div class="termin-dt-anzeige termin-dt-leer">Datum &ndash; Uhrzeit</div>')
        +'<input type="text" class="termin-input" data-frei-idx="'+idx+'" data-feld="text" value="'+(f.text||'')+'" placeholder="Termin \u2026" maxlength="60" onchange="terminFreiSp(this)" onblur="terminFreiSp(this)">'
        +'</div>'
        +'</div>';
  });

  html+='<div class="termin-trenner">&mdash; Regelm&auml;&szlig;ige Termine &mdash;</div>';

  TERMINE.pflicht.forEach(function(p){
    var dt=formatTerminAnzeige(p.datum,p.uhrzeit||'');
    html+='<div class="termin-pflicht-zeile" data-pflicht-id-row="'+p.id+'">'
        +'<div class="termin-ikon-col">'
        +'<button class="termin-ikon-btn" data-pflicht-id="'+p.id+'" onclick="oeffneTerminDtModal(this)" title="Datum und Uhrzeit einstellen">&#128197;</button>'
        +'</div>'
        +'<div class="termin-action-ikon">'+p.icon+'</div>'
        +'<div class="termin-content-col">'
        +(dt?'<div class="termin-dt-anzeige">'+dt+'</div>':'<div class="termin-dt-anzeige termin-dt-leer">&nbsp;</div>')
        +'<div class="termin-pflicht-label">'+p.label+'</div>'
        +'</div>'
        +'</div>';
  });

  document.getElementById('termine-anzeige').innerHTML=html;
  checkTerminDatumHeute();
}

function terminFreiSp(el){
  var i=parseInt(el.dataset.freiIdx);
  TERMINE.frei[i][el.dataset.feld]=el.value;
  speichereTermine();
  var f=TERMINE.frei[i];
  var dtEl=el.closest('.termin-frei-zeile');
  if(dtEl){var da=dtEl.querySelector('.termin-dt-anzeige');if(da){var t=formatTerminAnzeige(f.datum,f.uhrzeit||'');da.textContent=t||'Datum – Uhrzeit';da.className='termin-dt-anzeige'+(t?'':' termin-dt-leer');}}
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
  var _geaendert=false;
  TERMINE.frei.forEach(function(f,i){
    var kl=klasseF(f.datum);
    var rows=document.querySelectorAll('.termin-frei-zeile');
    if(!rows[i])return;
    if(kl==='termin-vergangenheit'){
      /* Freier Termin abgelaufen → Eintragung löschen, neutral grau */
      TERMINE.frei[i].datum='';TERMINE.frei[i].text='';TERMINE.frei[i].uhrzeit='';_geaendert=true;
      var ti=rows[i].querySelector('input[type="text"]');if(ti)ti.value='';
      var da=rows[i].querySelector('.termin-dt-anzeige');
      if(da){da.textContent='Datum – Uhrzeit';da.className='termin-dt-anzeige termin-dt-leer';}
      rows[i].classList.add('termin-frei-geleert');
    } else if(kl){
      rows[i].classList.add(kl);
    }
  });
  if(_geaendert)speichereTermine();
  TERMINE.pflicht.forEach(function(p){
    var kl=klasseF(p.datum);
    var el=document.querySelector('[data-pflicht-id-row="'+p.id+'"]');
    if(el&&kl){
      el.classList.add(kl);
      /* Vergangener Pflicht-Termin: Datum ausblenden, Rot bleibt */
      if(kl==='termin-vergangenheit'){
        var da=el.querySelector('.termin-dt-anzeige');
        if(da)da.style.display='none';
      }
    }
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

/* Feature 2: Tagesfortschritt */
function pctFarbe6(pct){
  if(pct>=95)return '#166534';
  if(pct>=85)return '#16a34a';
  if(pct>=75)return '#65a30d';
  if(pct>=65)return '#ca8a04';
  if(pct>=50)return '#ea580c';
  return '#dc2626';
}
function istFalscherTag(id){
  return !!(ZEITEN[id]&&ZEITEN[id].tage&&ZEITEN[id].tage.length>0&&!heuteIstGeplantFuer(id));
}
/* Feature 4: Anwesenheits-Zählwerk */
function renderAnwesenheit(){
  var gesamt=MITARBEITENDE.length;
  var anwesend=gesamt-(STATE.abwesend||[]).length;
  var pct=gesamt>0?Math.round(anwesend/gesamt*100):100;
  var el=document.getElementById('anwesenheit-anzeige');if(!el)return;
  var farbe=pctFarbe6(pct);
  var voll=Math.round(pct/100*8);
  el.innerHTML=anwesend+'/'+gesamt+' anwesend&ensp;<span style="font-size:.5rem;letter-spacing:0;">'
    +'<span style="color:'+farbe+';">'+'█'.repeat(voll)+'</span>'
    +'<span style="color:var(--hell);">'+'░'.repeat(8-voll)+'</span>'
    +'</span>&ensp;'+pct+'%';
  el.style.color=farbe;
}
function renderFortschritt(){
  var ids=AKTIVE_CHECKS;
  /* Entfallene (rot umrandet) und ausstehende (noch kein Vertretungs-Entscheid)
     zählen nicht zur erledigbaren Gesamtmenge */
  var effektiv=ids.filter(function(id){
    return !entfaelltHeute(id)&&!vertretungAusstehend(id)&&!istFalscherTag(id);
  });
  var gesamt=effektiv.length;
  var erl=STATE.erledigt.filter(function(id){return effektiv.indexOf(id)!==-1;}).length;
  var entf=ids.filter(function(id){return entfaelltHeute(id)||vertretungAusstehend(id)||istFalscherTag(id);}).length;
  var pct=gesamt>0?Math.round(erl/gesamt*100):0;
  var farbe=pctFarbe6(pct);
  var voll=Math.round(pct/100*8);
  var el=document.getElementById('fortschritt-anzeige');if(!el)return;
  el.innerHTML=erl+'/'+gesamt+'&ensp;<span style="font-size:.5rem;letter-spacing:0;">'
    +'<span style="color:'+farbe+';">'+'█'.repeat(voll)+'</span>'
    +'<span style="color:var(--hell);">'+'░'.repeat(8-voll)+'</span>'
    +'</span>&ensp;'+pct+'%'+(entf>0?'&ensp;<span style="color:var(--grau);">−19×∅</span>'.replace('19',entf):'');
  el.style.color=farbe;
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
/* ═══ Arbeits-/Pausenzeit-Erkennung ("Aktuell"-Feld im Banner) ═══
   Regulär: 08:00–10:00, 10:20–12:00, 13:00–15:15 Arbeit | 10:00–10:20, 12:00–13:00 Pause
   Freitags UND am 1. Dienstag im Monat endet die Arbeit bereits um 14:45 Uhr.
   Wochenende sowie außerhalb aller Zeitfenster = neutral ("Kein Betrieb"). */
function istErsterDienstagImMonat(d){
  return d.getDay()===2&&d.getDate()<=7;
}
function berechnePhase(d){
  d=d||new Date();
  var tag=d.getDay(); /* 0=So … 6=Sa */
  if(tag===0||tag===6)return{phase:'neutral',label:'Kein Betrieb'};
  var min=d.getHours()*60+d.getMinutes();
  var kurzerTag=(tag===5)||istErsterDienstagImMonat(d);
  var arbeitBloecke=kurzerTag
    ?[[480,600],[620,720],[780,885]]   /* 08:00-10:00 / 10:20-12:00 / 13:00-14:45 */
    :[[480,600],[620,720],[780,915]];  /* 08:00-10:00 / 10:20-12:00 / 13:00-15:15 */
  var pauseBloecke=[[600,620],[720,780]]; /* 10:00-10:20 / 12:00-13:00 */
  function inBloecken(bloecke){return bloecke.some(function(b){return min>=b[0]&&min<b[1];});}
  if(inBloecken(arbeitBloecke))return{phase:'arbeit',label:'Arbeitszeit'};
  if(inBloecken(pauseBloecke))return{phase:'pause',label:'Pause'};
  return{phase:'neutral',label:'Kein Betrieb'};
}
function renderAktuellePhase(){
  var el=document.getElementById('banner-phase');
  if(!el)return;
  var p=berechnePhase(new Date());
  el.classList.remove('phase-arbeit','phase-pause','phase-neutral');
  el.classList.add('phase-'+p.phase);
  var icon=document.getElementById('banner-phase-icon');
  var txt=document.getElementById('banner-phase-text');
  if(icon)icon.textContent=p.phase==='arbeit'?'\u{1F4BC}':(p.phase==='pause'?'\u2615':'\u2013');
  if(txt)txt.textContent=p.label;
  el.title=p.label;
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
  renderAktuellePhase();
  checkTerminDatumHeute();
}
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
/* Bug6: vollständige Sprachausgabe für Vorlesen */
function isoDatumSpracheVoll(iso){
  if(!iso)return '';
  var d=new Date(iso+'T00:00:00');
  if(isNaN(d.getTime()))return '';
  var wt=['Sonntag','Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag'];
  var mo=['Januar','Februar','M\u00e4rz','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];
  return wt[d.getDay()]+', der '+(_TAGORD[d.getDate()]||d.getDate()+'.')+' '+mo[d.getMonth()]+' '+_z(d.getFullYear());
}
function sprachText(s){
  if(!s)return s;
  s=s.replace(/\d{1,2}\.\d{1,2}\.\d{4}/g,datumSprache);
  s=s.replace(/\b(\d{1,2}):(\d{2})\b/g,uhrzeitSprache);
  return s;
}

