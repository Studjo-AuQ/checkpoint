/* ══════════════════════════════════════════════════════
   app.js – Gruppen·Checkpoint
   EINSTIEGSPUNKT: Initialisierung beim Start, Timer/Uhr-Bootstrap,
   Barrierefreiheits-Leiste, KST-Login-Prüfung.
   Muss als LETZTES Skript geladen werden (nach storage/render/modal/checkliste).
   Studjo | Evangelisches Johanneswerk
   ══════════════════════════════════════════════════════ */
/* Minuten-Timer: Check auf Fälligkeit (Feature 3) */
setInterval(function(){
  var aktiv=document.getElementById('check-tabelle');
  if(aktiv)renderCheckliste();
},60000);
/* Statistik-Sicherheitsnetz: falls "Neuer Tag" an einem Tag vergessen
   wird (oder das Gerät um 18 Uhr aus war), wird der Tagesstand trotzdem
   spätestens ab 18:00 Uhr für die Übersicht archiviert. Läuft im selben
   Minuten-Takt mit; mehrfaches Auslösen am selben Tag ist unschädlich,
   da archiviereTagesstatistik() den heutigen Eintrag nur überschreibt. */
setInterval(function(){
  if(AKTIVE_KST&&new Date().getHours()>=18)archiviereTagesstatistik();
},60000);
ladeZuordnung();ladeNamen();ladeAktiveChecks();ladeLeitung();ladeTermine();ladeWichtig();ladeZeiten();ladeArbeitsnotizen();ladeAufgabenNotizen();

setInterval(updateClock,30000);

/* ═══ INIT ═══ */
/* banner-kw wird von updateClock() gesetzt */
document.getElementById('jahr').textContent=new Date().getFullYear();
updateClock();

/* Popups bei Klick außerhalb schließen */
document.addEventListener('click',function(e){
  var picker=document.getElementById('check-person-picker');
  if(picker&&picker.style.display!=='none'&&!picker.contains(e.target)){
    schliesseCheckPicker();
  }
  var tpop=document.getElementById('termin-naechster-popup');
  if(tpop&&tpop.style.display!=='none'&&!tpop.contains(e.target)){
    schliesseTerminPopup();
  }
});

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
      var txt=p.name+(abw?' \u2013 heute abwesend':'')+'. ';

      /* 1) Arbeitsinhalt */
      var notiz=ARBEITSNOTIZEN&&ARBEITSNOTIZEN[pId];
      if(notiz&&(notiz.text||notiz.auslastung||(notiz.stufe!==undefined&&notiz.stufe!==null&&notiz.stufe!==''))){
        var auslN={gut:'gut ausgelastet',bald:'l\u00e4uft bald aus',keine:'keine Arbeit'};
        var stufeN=(notiz.stufe!==undefined&&notiz.stufe!==null&&notiz.stufe!=='')?', Schwierigkeitsstufe '+notiz.stufe:'';
        txt+='Arbeitsinhalt'+(notiz.auslastung?' ('+(auslN[notiz.auslastung]||'')+')':'')+stufeN+(notiz.text?': '+notiz.text:'')+'. ';
      }

      /* 2) Checklisten-Aufgaben */
      var checkAufg=GRUPPE.zustaendigkeiten.filter(function(z){return z.personId===pId&&z.typ==='checkliste';})
        .map(function(z){var a=AUFGABEN[z.aufgabeId];return a?a.label:'';}).filter(Boolean);
      if(checkAufg.length)txt+='Checklisten-Aufgaben: '+checkAufg.join(', ')+'. ';

      /* 3) Allgemeine Zuständigkeiten */
      var allgAufg=GRUPPE.zustaendigkeiten.filter(function(z){return z.personId===pId&&z.typ==='allgemein';})
        .map(function(z){var a=AUFGABEN[z.aufgabeId];return a?a.label:'';}).filter(Boolean);
      if(allgAufg.length)txt+='Allgemeine Zust\u00e4ndigkeiten: '+allgAufg.join(', ')+'. ';

      if(!checkAufg.length&&!allgAufg.length)txt+='Keine Aufgaben zugewiesen. ';

      /* 4) Mögliche Vertretungen (V-Badge) */
      var vertAufg=Object.keys(STATE.vertretungen).filter(function(id){return getVertPerson(id)===pId;})
        .map(function(id){var a=AUFGABEN[id];return a?a.label:'';}).filter(Boolean);
      if(vertAufg.length)txt+='Vertretung f\u00fcr: '+vertAufg.join(', ')+'. ';

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
      var falscherTag=!enf&&!aus&&istFalscherTag(id);
      /* Wann-Info aus ZEITEN[id] (korrekte Quelle) */
      var wannTxt='';
      var _wz=ZEITEN[id]||{};
      if(_wz.tage||_wz.uhrzeit){
        var _tage=(_wz.tage&&_wz.tage.length)?_wz.tage.map(function(t){return tagVollName(t);}).join(' und '):'';
        var _zeit=_wz.uhrzeit?uhrzeitSprache(_wz.uhrzeit):'';
        if(_tage&&_zeit)wannTxt=_tage+', '+_zeit+', ';
        else if(_tage)wannTxt=_tage+', ';
        else if(_zeit)wannTxt=_zeit+', ';
      }
      var txt=a.label+', '+wannTxt+'zuständig: '+(pers?pers.name:'nicht zugewiesen')+'.';
      txt+=erl?' Erledigt.':enf?' Entfällt heute.':aus?' Vertretung noch offen.':falscherTag?' Heute nicht fällig.':' Noch offen.';
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
      /* Bug6: vergangene oder gelöschte Termine nicht vorlesen */
      if(tz.classList.contains('termin-vergangenheit')||tz.classList.contains('termin-frei-geleert'))
        return 'Dieser Termin ist bereits abgelaufen.';
      /* Bug2: Datum/Uhrzeit-Felder wurden durch das Termin-Modal ersetzt (keine <input>
         mehr in der Zeile) – Werte daher direkt aus TERMINE lesen statt aus dem DOM. */
      var parts=[],datum='',uhrzeit='';
      if(tz.dataset.freiIdx!==undefined){
        var f=TERMINE.frei[parseInt(tz.dataset.freiIdx)];
        if(f){if(f.text)parts.push(f.text);datum=f.datum;uhrzeit=f.uhrzeit;}
      }else{
        var p=TERMINE.pflicht.find(function(p){return p.id===tz.dataset.pflichtIdRow;});
        if(p){parts.push(p.label);datum=p.datum;uhrzeit=p.uhrzeit;}
      }
      if(datum)parts.push(isoDatumSpracheVoll(datum)); /* voller Wochentag, z.B. "Mittwoch" */
      if(uhrzeit)parts.push(uhrzeitSprache(uhrzeit));
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
