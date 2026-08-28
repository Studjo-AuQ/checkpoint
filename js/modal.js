/* ══════════════════════════════════════════════════════
   modal.js – Gruppen·Checkpoint
   POPUP-EBENE: Öffnen/Speichern/Schließen aller Dialoge
   (Namen, Leitung, Zuständigkeiten, Vertretung, Termine, Profil, Arbeitsinhalt …).
   Version: 2026-08-19
   Studjo | Evangelisches Johanneswerk
   ══════════════════════════════════════════════════════ */
function oeffneProfilModal(personId,event){
  event.stopPropagation();
  var p=MITARBEITENDE.find(function(m){return m.id===personId;});if(!p)return;
  var profil=PROFIL[personId]||{};
  var typen=['checkliste','allgemein'];
  var hatEigenesFoto=!!(PROFIL[personId]&&PROFIL[personId].foto);
  var html='<div class="modal-kopf"><h2>&#128101; Profil: '+p.name+'</h2>'
           +'<button class="modal-schliessen" onclick="schM(\'profil-modal\')">&#10005;</button></div>'
           /* ═══ Foto-Upload (lokal im Browser gespeichert – kein Server/Cloud, kein Ordner) ═══ */
           +'<div style="display:flex;gap:12px;align-items:flex-start;background:var(--bg);border-radius:10px;padding:10px 12px;margin-bottom:12px;">'
           +'<img id="profil-foto-preview" src="'+portraitSrc(personId)+'" alt="Foto" onerror="fotoFehler(this)" style="width:80px;height:80px;object-fit:cover;border-radius:8px;flex-shrink:0;background:var(--hell);">'
           +'<div style="flex:1;min-width:0;">'
           +'<label class="btn-modal-secondary" style="display:inline-block;cursor:pointer;font-size:.8rem;">&#128247; Foto hochladen'
           +'<input type="file" accept="image/*" style="display:none;" onchange="fotoAusgewaehlt(this,'+p.id+')"></label> '
           +'<button id="profil-foto-entfernen-btn" class="btn-modal-secondary" style="font-size:.8rem;'+(hatEigenesFoto?'':'display:none;')+'" onclick="entferneProfilFoto('+p.id+')">&#128465; Foto entfernen</button>'
           +'<p id="profil-foto-hinweis" style="font-size:.7rem;color:var(--grau);margin-top:6px;line-height:1.4;">Wird automatisch auf 80&times;80px zugeschnitten und sofort gespeichert &ndash; kein Verschieben in einen Ordner mehr n&ouml;tig.</p>'
           +'</div></div>'
           +'<p style="font-size:.78rem;color:var(--grau);margin-bottom:10px;">F\u00e4higkeitsbewertung f\u00fcr jede Aufgabe – erscheint farbig bei Zuweisung.</p>'
           +'<div id="profil-aufgaben-liste" style="display:flex;flex-direction:column;gap:5px;max-height:58vh;overflow-y:auto;">';
  var letzterTyp='';
  var aufgIds=Object.keys(AUFGABEN).sort(function(a,b){
    var ta=AUFGABEN[a].typ==='checkliste'?0:1,tb=AUFGABEN[b].typ==='checkliste'?0:1;
    return ta-tb||AUFGABEN[a].label.localeCompare(AUFGABEN[b].label,'de');
  });
  aufgIds.forEach(function(id){
    var a=AUFGABEN[id];
    var typLabel=a.typ==='checkliste'?'Tages-Checkliste':'Zust\u00e4ndigkeiten';
    if(typLabel!==letzterTyp){
      html+='<div style="font-size:.68rem;font-weight:900;text-transform:uppercase;color:var(--grau);letter-spacing:.06em;margin-top:6px;padding-bottom:3px;border-bottom:1.5px solid var(--hell);">'+typLabel+'</div>';
      letzterTyp=typLabel;
    }
    var wert=profil[id]||'';
    html+='<div class="profil-zeile" data-aufgabe-id="'+id+'">'
         +'<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">'
         +'<img src="'+symbolSrc(a.foto)+'" style="width:28px;height:28px;border-radius:6px;object-fit:contain;background:#f1f5f9;flex-shrink:0;">'
         +'<span style="font-size:.84rem;font-weight:800;line-height:1.2;">'+a.label+'</span>'
         +'</div>'
         +'<div class="profil-wahl-row">'
         +'<button class="profil-wahl-btn profil-wahl-selbst'+(wert==='selbst'?' gewaehlt':'')+'" data-aufgabe-id="'+id+'" data-wert="selbst" onclick="profilWaehlen(this)">&#10003; Selbst&#173;st&#228;ndig</button>'
         +'<button class="profil-wahl-btn profil-wahl-assistenz'+(wert==='assistenz'?' gewaehlt':'')+'" data-aufgabe-id="'+id+'" data-wert="assistenz" onclick="profilWaehlen(this)">&#9889; Mit Assistenz</button>'
         +'<button class="profil-wahl-btn profil-wahl-nicht'+(wert==='nicht'?' gewaehlt':'')+'" data-aufgabe-id="'+id+'" data-wert="nicht" onclick="profilWaehlen(this)">&#9711; Nicht ge\u00fcbt</button>'
         +'</div>'
         +'</div>';
  });
  html+='</div>'
       +'<div class="modal-btns" style="margin-top:12px;">'
       +'<button class="btn-modal-secondary" onclick="schM(\'profil-modal\')">Schlie\u00dfen</button>'
       +'<button class="btn-modal-primary" onclick="speichereProfilAusModal('+personId+')">&#128190; Speichern</button>'
       +'</div>';
  document.getElementById('profil-modal-body').innerHTML=html;
  document.getElementById('profil-modal').classList.add('sichtbar');
}
/* ═══ Foto-Upload: lokal zuschneiden (80×80) und SOFORT im Profil speichern ═══
   Läuft komplett offline im Browser (Canvas). Das Foto wird als Base64-Text
   direkt in localStorage abgelegt – keine Datei, kein Ordner "fotos" mehr
   nötig. Das ist auch der Grund, warum Android-Tablets das Bild jetzt
   zuverlässig anzeigen können. */
function fotoAusgewaehlt(input,personId){
  var file=input.files&&input.files[0];
  if(!file)return;
  var p=MITARBEITENDE.find(function(m){return m.id===personId;});
  if(!p)return;
  var reader=new FileReader();
  reader.onload=function(e){
    var img=new Image();
    img.onload=function(){
      /* Quadratischer Mittenausschnitt, dann auf 80x80 skalieren (wie object-fit:cover) */
      var gr=Math.min(img.width,img.height);
      var sx=(img.width-gr)/2,sy=(img.height-gr)/2;
      var canvas=document.createElement('canvas');
      canvas.width=80;canvas.height=80;
      var ctx=canvas.getContext('2d');
      ctx.drawImage(img,sx,sy,gr,gr,0,0,80,80);
      var dataUrl=canvas.toDataURL('image/jpeg',0.88);
      /* Direkt im Profil speichern (localStorage) */
      if(!PROFIL[personId])PROFIL[personId]={};
      PROFIL[personId].foto=dataUrl;
      speichereProfil();
      /* Vorschau im Modal aktualisieren */
      var prev=document.getElementById('profil-foto-preview');
      if(prev)prev.src=dataUrl;
      var entfBtn=document.getElementById('profil-foto-entfernen-btn');
      if(entfBtn)entfBtn.style.display='inline-block';
      var hin=document.getElementById('profil-foto-hinweis');
      if(hin)hin.innerHTML='&#9989; Foto gespeichert.';
      /* Zeile im Dashboard sofort aktualisieren */
      renderNamen();initSortable();
    };
    img.onerror=function(){alert('Diese Datei konnte nicht als Bild gelesen werden.');};
    img.src=e.target.result;
  };
  reader.readAsDataURL(file);
}
function entferneProfilFoto(personId){
  if(PROFIL[personId])delete PROFIL[personId].foto;
  speichereProfil();
  var prev=document.getElementById('profil-foto-preview');
  if(prev)prev.src=portraitSrc(personId);
  var entfBtn=document.getElementById('profil-foto-entfernen-btn');
  if(entfBtn)entfBtn.style.display='none';
  var hin=document.getElementById('profil-foto-hinweis');
  if(hin)hin.innerHTML='Foto entfernt \u2013 Platzhalter wird angezeigt.';
  renderNamen();initSortable();
}

function profilWaehlen(btn){
  var id=btn.dataset.aufgabeId;
  var wert=btn.dataset.wert;
  var aktiv=btn.classList.contains('gewaehlt');
  btn.closest('.profil-zeile').querySelectorAll('.profil-wahl-btn').forEach(function(b){b.classList.remove('gewaehlt');});
  if(!aktiv)btn.classList.add('gewaehlt');
}
function speichereProfilAusModal(personId){
  if(!PROFIL[personId])PROFIL[personId]={};
  document.querySelectorAll('#profil-aufgaben-liste .profil-zeile').forEach(function(z){
    var id=z.dataset.aufgabeId;
    var aktiv=z.querySelector('.profil-wahl-btn.gewaehlt');
    if(aktiv)PROFIL[personId][id]=aktiv.dataset.wert;
    else delete PROFIL[personId][id];
  });
  speichereProfil();
  schM('profil-modal');
  renderNamen();initSortable();
}

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
    var ddmm=formatTerminDatum(t.datum);
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

/* Editierbares Aufgaben-Info-Modal (ersetzt das alte 4-Sekunden-Popup) */
var _aufgabeInfoModalId=null;
function oeffneAufgabenInfoModal(id,event){
  event.stopPropagation();
  if(editModus)return;
  var a=AUFGABEN[id];if(!a)return;
  _aufgabeInfoModalId=id;
  document.getElementById('aufgabe-info-titel').innerHTML='<img src="'+symbolSrc(a.foto)+'" style="width:26px;height:26px;vertical-align:middle;border-radius:5px;margin-right:6px;object-fit:contain;background:#f1f5f9;">'+a.label;
  var pers=getZustaendigePerson(id);
  var wannTxt='';
  var _wz=ZEITEN[id]||{};
  if(_wz.tage&&_wz.tage.length){
    wannTxt=' \u00b7 '+_wz.tage.map(function(t){return tagVollName(t);}).join(',')+(_wz.uhrzeit?' '+_wz.uhrzeit+' Uhr':'');
  }
  document.getElementById('aufgabe-info-zustaendig').textContent='Zust\u00e4ndig: '+(pers?pers.name:'nicht zugewiesen')+wannTxt;
  var gespeichert=AUFGABEN_NOTIZEN[id];
  document.getElementById('aufgabe-info-textarea').value=(gespeichert!==undefined?gespeichert:(AUFGABEN_INFO[id]||''));
  document.getElementById('aufgabe-info-modal').classList.add('sichtbar');
}
function speichereAufgabeInfoNotiz(){
  if(!_aufgabeInfoModalId)return;
  var txt=document.getElementById('aufgabe-info-textarea').value.trim();
  if(txt)AUFGABEN_NOTIZEN[_aufgabeInfoModalId]=txt;
  else delete AUFGABEN_NOTIZEN[_aufgabeInfoModalId];
  speichereAufgabenNotizen();
  schM('aufgabe-info-modal');
}
function setzeAufgabeInfoStandard(){
  if(!_aufgabeInfoModalId)return;
  document.getElementById('aufgabe-info-textarea').value=AUFGABEN_INFO[_aufgabeInfoModalId]||'';
}
function vorlesenAufgabeInfoModal(){
  if(!window.speechSynthesis||!_aufgabeInfoModalId)return;
  var a=AUFGABEN[_aufgabeInfoModalId];if(!a)return;
  var txt=document.getElementById('aufgabe-info-textarea').value||a.label;
  window.speechSynthesis.cancel();
  var u=new SpeechSynthesisUtterance(sprachText(a.label+'. '+txt));
  u.lang='de-DE';u.rate=0.88;
  window.speechSynthesis.speak(u);
}

/* ═══ Fokus-Modal: "Meine Aufgaben" (persönliche Übersicht) ═══
   Öffnet sich beim Klick auf das Portraitbild. Zeigt ausschließlich die
   eigenen Inhalte der Person – bewusst ohne Termine, Leitung usw. */
var _fokusPersonId=null, _fokusVorleseText='';

function checklistenStatusHeute(id){
  var erl=STATE.erledigt.indexOf(id)!==-1;
  if(erl)return {text:'Bereits erledigt',klasse:'fokus-status-ok'};
  if(entfaelltHeute(id))return {text:'Entf\u00e4llt heute',klasse:'fokus-status-entfaellt'};
  if(vertretungAusstehend(id))return {text:'Vertretung noch offen',klasse:'fokus-status-warnung'};
  var z=ZEITEN[id]||{};
  var falscherTag=z.tage&&z.tage.length>0&&!heuteIstGeplantFuer(id);
  if(falscherTag){
    var tage=z.tage.map(tagVollName).join(', ');
    return {text:'Heute nicht dran (planm\u00e4\u00dfig: '+tage+')',klasse:'fokus-status-neutral'};
  }
  var zeitTxt=z.uhrzeit?' um '+z.uhrzeit+' Uhr':'';
  return {text:'Heute f\u00e4llig'+zeitTxt,klasse:'fokus-status-faellig'};
}

function baueFokusInhalt(personId){
  var p=MITARBEITENDE.find(function(m){return m.id===personId;});
  if(!p)return '';
  var vorlesenTeile=[p.name+'.'];
  var html='';

  /* ── Arbeitsinhalte: nur Freitext, nichts anzeigen wenn leer ── */
  var notiz=ARBEITSNOTIZEN[personId];
  var arbeitText=notiz&&notiz.text?notiz.text.trim():'';
  if(arbeitText){
    html+='<div class="fokus-abschnitt">'
        +'<h3 class="fokus-abschnitt-titel"><img src="'+symbolSrc('symbole/arbeit.jpg')+'" class="fokus-mini-icon" alt="">Arbeitsinhalte</h3>'
        +'<p class="fokus-text">'+escFokus(arbeitText)+'</p>'
        +'</div>';
    vorlesenTeile.push('Arbeitsinhalte: '+arbeitText+'.');
  }

  /* ── Checklisten-Aufgaben: permanente + heute aktive Vertretungen ── */
  var permCheck=GRUPPE.zustaendigkeiten.filter(function(z){return z.personId===personId&&z.typ==='checkliste';}).map(function(z){return z.aufgabeId;});
  var allVertIds=Object.keys(STATE.vertretungen).filter(function(id){return getVertPerson(id)===personId;});
  var vertIds=allVertIds.filter(function(id){return AKTIVE_CHECKS.indexOf(id)!==-1&&permCheck.indexOf(id)===-1;});
  var checkIds=permCheck.filter(function(id){return AKTIVE_CHECKS.indexOf(id)!==-1;}).concat(vertIds);

  if(checkIds.length){
    html+='<div class="fokus-abschnitt"><h3 class="fokus-abschnitt-titel" style="margin-bottom:12px;">Checklisten-Aufgaben</h3>';
    checkIds.forEach(function(id){
      var a=AUFGABEN[id];if(!a)return;
      var beschreibung=(AUFGABEN_NOTIZEN[id]!==undefined?AUFGABEN_NOTIZEN[id]:(AUFGABEN_INFO[id]||''));
      var status=checklistenStatusHeute(id);
      html+='<div style="margin-bottom:14px;">'
          +'<div style="display:flex;align-items:center;font-weight:800;font-size:.96rem;margin-bottom:4px;"><img src="'+symbolSrc(a.foto)+'" class="fokus-mini-icon" alt="">'+a.label+'</div>'
          +(beschreibung?'<p class="fokus-text">'+escFokus(beschreibung)+'</p>':'')
          +'<span class="fokus-status '+status.klasse+'">'+status.text+'</span>'
          +'</div>';
      vorlesenTeile.push(a.label+(beschreibung?': '+beschreibung:'')+'. '+status.text+'.');
    });
    html+='</div>';
  }

  /* ── Allgemeine Zuständigkeiten: wie oben, aber ohne "heute fällig"-Status ── */
  var allgIds=GRUPPE.zustaendigkeiten.filter(function(z){return z.personId===personId&&z.typ==='allgemein';}).map(function(z){return z.aufgabeId;});
  if(allgIds.length){
    html+='<div class="fokus-abschnitt"><h3 class="fokus-abschnitt-titel" style="margin-bottom:12px;">Allgemeine Zust\u00e4ndigkeiten</h3>';
    allgIds.forEach(function(id){
      var a=AUFGABEN[id];if(!a)return;
      var beschreibung=(AUFGABEN_NOTIZEN[id]!==undefined?AUFGABEN_NOTIZEN[id]:(AUFGABEN_INFO[id]||''));
      html+='<div style="margin-bottom:14px;">'
          +'<div style="display:flex;align-items:center;font-weight:800;font-size:.96rem;margin-bottom:4px;"><img src="'+symbolSrc(a.foto)+'" class="fokus-mini-icon" alt="">'+a.label+'</div>'
          +(beschreibung?'<p class="fokus-text">'+escFokus(beschreibung)+'</p>':'')
          +'</div>';
      vorlesenTeile.push(a.label+(beschreibung?': '+beschreibung:'')+'.');
    });
    html+='</div>';
  }

  if(!arbeitText&&!checkIds.length&&!allgIds.length){
    html='<p class="fokus-leer">F\u00fcr dich sind aktuell keine Aufgaben oder Zust\u00e4ndigkeiten eingetragen.</p>';
    vorlesenTeile.push('F\u00fcr dich sind aktuell keine Aufgaben oder Zust\u00e4ndigkeiten eingetragen.');
  }

  _fokusVorleseText=sprachText(vorlesenTeile.join(' '));
  return html;
}
function escFokus(s){
  return String(s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});
}
function oeffneFokusModal(personId,event){
  if(event)event.stopPropagation();
  if(editModus)return;
  var p=MITARBEITENDE.find(function(m){return m.id===personId;});
  if(!p)return;
  _fokusPersonId=personId;
  document.getElementById('fokus-name').textContent=p.name;
  document.getElementById('fokus-inhalt').innerHTML=baueFokusInhalt(personId);
  document.getElementById('fokus-modal').classList.add('sichtbar');
}
function schliesseFokusModal(){
  window.speechSynthesis&&window.speechSynthesis.cancel();
  document.getElementById('fokus-modal').classList.remove('sichtbar');
  _fokusPersonId=null;
}
function fokusModalAK(e){if(e.target===document.getElementById('fokus-modal'))schliesseFokusModal();}
function vorlesenFokusModal(){
  if(!window.speechSynthesis||!_fokusVorleseText)return;
  window.speechSynthesis.cancel();
  var u=new SpeechSynthesisUtterance(_fokusVorleseText);
  u.lang='de-DE';u.rate=0.88;
  window.speechSynthesis.speak(u);
}

/* ═══ Termin Datum/Uhrzeit Modal ═══
   Bug1-Fix: Statt fragiler nativer Picker-Tricks ein eigenes, zuverlässiges Modal.
   Uhrzeit ist optional ("Ganztägig", wenn Haken nicht gesetzt) – keine erzwungene
   Uhrzeitangabe mehr. */
var _terminDtEdit=null; /* {type:'frei',idx:n} oder {type:'pflicht',id:'...'} */
function oeffneTerminDtModal(btn){
  var t;
  if(btn.dataset.freiIdx!==undefined){
    _terminDtEdit={type:'frei',idx:parseInt(btn.dataset.freiIdx)};
    t=TERMINE.frei[_terminDtEdit.idx];
  }else{
    _terminDtEdit={type:'pflicht',id:btn.dataset.pflichtId};
    t=TERMINE.pflicht.find(function(p){return p.id===_terminDtEdit.id;});
  }
  if(!t)return;
  document.getElementById('termin-dt-datum').value=t.datum||'';
  var hatZeit=!!t.uhrzeit;
  document.getElementById('termin-dt-hatzeit').checked=hatZeit;
  document.getElementById('termin-dt-uhrzeit').value=t.uhrzeit||'';
  document.getElementById('termin-dt-uhrzeit-wrap').style.display=hatZeit?'flex':'none';
  document.getElementById('termin-dt-modal').classList.add('sichtbar');
}
function toggleTerminDtUhrzeit(){
  var an=document.getElementById('termin-dt-hatzeit').checked;
  document.getElementById('termin-dt-uhrzeit-wrap').style.display=an?'flex':'none';
}
function speichereTerminDtAusModal(){
  if(!_terminDtEdit)return;
  var datum=document.getElementById('termin-dt-datum').value;
  var hatZeit=document.getElementById('termin-dt-hatzeit').checked;
  var uhrzeit=hatZeit?document.getElementById('termin-dt-uhrzeit').value:'';
  if(_terminDtEdit.type==='frei'){
    TERMINE.frei[_terminDtEdit.idx].datum=datum;
    TERMINE.frei[_terminDtEdit.idx].uhrzeit=uhrzeit;
  }else{
    var p=TERMINE.pflicht.find(function(p){return p.id===_terminDtEdit.id;});
    if(p){p.datum=datum;p.uhrzeit=uhrzeit;}
  }
  speichereTermine();
  renderTermine();
  schM('termin-dt-modal');
}
function loescheTerminDt(){
  if(!_terminDtEdit)return;
  if(_terminDtEdit.type==='frei'){
    TERMINE.frei[_terminDtEdit.idx].datum='';
    TERMINE.frei[_terminDtEdit.idx].uhrzeit='';
  }else{
    var p=TERMINE.pflicht.find(function(p){return p.id===_terminDtEdit.id;});
    if(p){p.datum='';p.uhrzeit='';}
  }
  speichereTermine();
  renderTermine();
  schM('termin-dt-modal');
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
    return z.personId===personId&&z.typ==='checkliste'
      &&AKTIVE_CHECKS.indexOf(z.aufgabeId)!==-1
      &&heuteIstGeplantFuer(z.aufgabeId); /* Feature 3: kein Vertreter für nicht-heutige Aufgaben */
  }).map(function(z){return{aufgabeId:z.aufgabeId};});
  Object.keys(STATE.vertretungen).forEach(function(id){
    if(getVertPerson(id)===personId&&AKTIVE_CHECKS.indexOf(id)!==-1&&heuteIstGeplantFuer(id))
      if(!cz.find(function(t){return t.aufgabeId===id;}))cz.push({aufgabeId:id});
  });
  if(cz.length>0){oeffneVertretungsModal(personId,cz,dauer);return;}
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
/* ═══ MODALS ═══ */
function schM(id){
  document.getElementById(id).classList.remove('sichtbar');
  if(id==='aufgaben-modal'&&editModus){setTimeout(initSortable,100);}
  /* Feature 3: Warn-Rahmen sofort sichtbar nach "Später entscheiden" oder Backdrop-Klick */
  if(id==='vertretung-modal'){renderNamen();renderCheckliste();}
}
function modalAK(e,id){if(e.target===document.getElementById(id))schM(id);}

/* ═══ Freitags-Erinnerung "Bitte exportieren" ═══ */
function oeffneExportErinnerungModal(){
  var m=document.getElementById('export-erinnerung-modal');
  if(m)m.classList.add('sichtbar');
}

/* ═══ Hilfe-Modal (Anleitung als Aufklapp-Liste) ═══ */
function oeffneHilfeModal(){
  var html='';
  HILFE_INHALTE.forEach(function(k,i){
    html+='<div class="hilfe-kapitel">'
        +'<button class="hilfe-kapitel-kopf" onclick="toggleHilfeKapitel('+i+')">'
        +'<span>'+k.titel+'</span><span class="hilfe-kapitel-pfeil" id="hilfe-pfeil-'+i+'">&#9656;</span>'
        +'</button>'
        +'<div class="hilfe-kapitel-body" id="hilfe-body-'+i+'" style="display:none;">'
        +'<ul>'+k.saetze.map(function(s){return '<li>'+s+'</li>';}).join('')+'</ul>'
        +'</div>'
        +'</div>';
  });
  document.getElementById('hilfe-modal-body').innerHTML=html;
  document.getElementById('hilfe-modal').classList.add('sichtbar');
}
function toggleHilfeKapitel(i){
  var body=document.getElementById('hilfe-body-'+i);
  var pfeil=document.getElementById('hilfe-pfeil-'+i);
  if(!body)return;
  var offen=body.style.display!=='none';
  body.style.display=offen?'none':'block';
  if(pfeil)pfeil.innerHTML=offen?'&#9656;':'&#9662;';
}

/* ═══ Übersicht-Modal (statistische Auswertung) ═══ */
function oeffneUebersichtModal(){
  renderUebersicht();
  document.getElementById('uebersicht-modal').classList.add('sichtbar');
}

/* ═══ Impressum / Datenschutz (rote Fußzeile) ═══
   Gleiches Akkordeon-Prinzip wie die Hilfe, aber mit fertigem HTML
   je Kapitel (Adressen, Hervorhebungen) statt einzelner Sätze. */
function baueInfoModalHtml(inhalte,prefix){
  var html='';
  inhalte.forEach(function(k,i){
    html+='<div class="hilfe-kapitel">'
        +'<button class="hilfe-kapitel-kopf" onclick="toggleInfoKapitel(\''+prefix+'\','+i+')">'
        +'<span>'+k.titel+'</span><span class="hilfe-kapitel-pfeil" id="'+prefix+'-pfeil-'+i+'">&#9656;</span>'
        +'</button>'
        +'<div class="hilfe-kapitel-body" id="'+prefix+'-body-'+i+'" style="display:none;">'
        +k.html
        +'</div>'
        +'</div>';
  });
  return html;
}
function toggleInfoKapitel(prefix,i){
  var body=document.getElementById(prefix+'-body-'+i);
  var pfeil=document.getElementById(prefix+'-pfeil-'+i);
  if(!body)return;
  var offen=body.style.display!=='none';
  body.style.display=offen?'none':'block';
  if(pfeil)pfeil.innerHTML=offen?'&#9656;':'&#9662;';
}
function oeffneImpressumModal(){
  document.getElementById('impressum-modal-body').innerHTML=baueInfoModalHtml(IMPRESSUM_INHALTE,'impr');
  document.getElementById('impressum-modal').classList.add('sichtbar');
}
function oeffneDatenschutzModal(){
  document.getElementById('datenschutz-modal-body').innerHTML=baueInfoModalHtml(DATENSCHUTZ_INHALTE,'dat');
  document.getElementById('datenschutz-modal').classList.add('sichtbar');
}

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
  /* Entfernte Personen: Zuständigkeiten, State und Profil (inkl. Foto) bereinigen.
     Das Foto liegt jetzt als Base64-Text im Profil – wird automatisch mitgelöscht,
     kein manuelles Aufräumen eines Ordners mehr nötig. */
  var entferntIds=alleAltenIds.filter(function(id){return !ordered.find(function(p){return p.id===id;});});
  entferntIds.forEach(function(id){
    GRUPPE.zustaendigkeiten=GRUPPE.zustaendigkeiten.filter(function(z){return z.personId!==id;});
    var ai=STATE.abwesend.indexOf(id);if(ai!==-1)STATE.abwesend.splice(ai,1);
    Object.keys(STATE.vertretungen).forEach(function(aufgId){if(getVertPerson(aufgId)===id)delete STATE.vertretungen[aufgId];});
    delete ARBEITSNOTIZEN[id];
    delete PROFIL[id];
  });
  MITARBEITENDE.splice(0,MITARBEITENDE.length);
  ordered.forEach(function(p){MITARBEITENDE.push(p);});
  localStorage.setItem(NAMEN_KEY,JSON.stringify(MITARBEITENDE.map(function(p){return{id:p.id,name:p.name};})));
  if(entferntIds.length>0){speichereZuordnung();speichereState();speichereArbeitsnotizen();speichereProfil();}
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
          +'<img src="'+symbolSrc(a.foto)+'" alt="'+a.label+'"><span>'+a.label
          +(andP&&!gew?'<span class="aufg-chip-belegt">aktuell: '+andP.name+'</span>':'')
          +(inaktiv?'<span class="aufg-chip-warn">&#9888; Zuerst in Checkliste aktivieren</span>':'')
          +'</span><div class="aufg-chip-check">'+(gew?'&#10003;':'')+'</div></button>';
  }
  document.getElementById('aufgaben-modal-inhalt').innerHTML=
    '<div class="aufg-modal-person"><img src="'+portraitSrc(person.id)+'" alt="'+person.name+'" onerror="fotoFehler(this)"><div class="aufg-modal-person-name">'+person.name+'</div></div>'
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
         +'<div class="neuzuw-kopf"><img src="'+symbolSrc(a.foto)+'" alt="'+a.label+'"><span class="neuzuw-label">'+a.label+'</span></div>'
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

/* Vertretung */
var vertPersonId=null,vertZust=[];
function oeffneVertretungsModal(personId,checkZust,vorDauer){
  vertPersonId=personId;vertZust=checkZust;
  var person=MITARBEITENDE.find(function(p){return p.id===personId;});
  document.getElementById('vert-beschreibung').innerHTML=
    '<strong>'+person.name+'</strong> ist abwesend. Bitte Vertretung und Dauer w&auml;hlen:';
  var html='';
  checkZust.forEach(function(z,zi){
    var a=AUFGABEN[z.aufgabeId];if(!a)return;
    var av=STATE.vertretungen[z.aufgabeId];
    var avPerson=getVertPerson(z.aufgabeId);
    var avDauer=vorDauer||getVertDauer(z.aufgabeId);
    if(zi>0)html+='<div class="vert-trenn"></div>';
    html+='<div class="vert-aufgabe-block"><div class="vert-aufgabe-kopf"><img src="'+symbolSrc(a.foto)+'" alt="'+a.label+'"><span class="vert-aufgabe-label">'+a.label+'</span></div>'
         /* Dauer-Auswahl */
         +'<div class="vert-dauer-wrap">'
         +'<label class="vert-dauer-label'+(avDauer==='1tag'?' gewaehlt':'')+'"><input type="radio" name="dauer-'+z.aufgabeId+'" value="1tag"'+(avDauer!=='weiteres'?' checked':'')+' onchange="vertDauerCh(this)"> Nur f\u00fcr 1 Tag</label>'
         +'<label class="vert-dauer-label'+(avDauer==='weiteres'?' gewaehlt':'')+'"><input type="radio" name="dauer-'+z.aufgabeId+'" value="weiteres"'+(avDauer==='weiteres'?' checked':'')+' onchange="vertDauerCh(this)"> Bis auf weiteres</label>'
         +'</div>'
         +'<label class="vert-entfaellt-label"><input type="checkbox" name="entf-'+z.aufgabeId+'" value="entfaellt"'+(avPerson==='entfaellt'?' checked':'')+' onchange="vertEntfCh(this,\''+z.aufgabeId+'\')"> Diese Aufgabe entf&auml;llt heute</label>'
         +'<div class="vert-person-liste">'+MITARBEITENDE.filter(function(p){return p.id!==personId;}).sort(function(a,b){var _o={selbst:0,assistenz:1,nicht:2};var wa=profilFarbe(a.id,z.aufgabeId)||'';var wb=profilFarbe(b.id,z.aufgabeId)||'';var aa=STATE.abwesend.indexOf(a.id)!==-1,ab=STATE.abwesend.indexOf(b.id)!==-1;if(aa&&!ab)return 1;if(!aa&&ab)return -1;return (_o[wa]!==undefined?_o[wa]:3)-(_o[wb]!==undefined?_o[wb]:3)||a.name.localeCompare(b.name,'de');}).map(function(p){
           var vFarbe=profilFarbe(p.id,z.aufgabeId);
           var vBg=vFarbe?{selbst:'#dcfce7',assistenz:'#fed7aa',nicht:'#fee2e2'}[vFarbe]:'';
           var vAbw=STATE.abwesend.indexOf(p.id)!==-1;
           var vHint=vFarbe&&!vAbw?'<small style="float:right;font-size:.6rem;color:'+(vFarbe==='selbst'?'#166534':vFarbe==='assistenz'?'#92400e':'#991b1b')+'">'+(vFarbe==='selbst'?'&#10003;Selbst':vFarbe==='assistenz'?'&#9889;Assistenz':'&#9711;N.geübt')+'</small>':'';
           var vAbwStyle=vAbw?'opacity:.35;pointer-events:none;':'';
           var vAbwHint=vAbw?'<small style="float:right;font-size:.6rem;color:var(--grau);">abwesend</small>':'';
           return '<label class="vert-person-label'+(vFarbe&&!vAbw?' profil-bg-'+vFarbe:'')+'" style="'+(vBg&&!vAbw?'background:'+vBg+';border-color:'+(vFarbe==='selbst'?'#86efac':vFarbe==='assistenz'?'#fcd34d':'#fca5a5')+';':'')+''+vAbwStyle+'"><input type="radio" name="vert-'+z.aufgabeId+'" value="'+p.id+'"'+(avPerson===p.id?' checked':'')+(vAbw?' disabled':'')+'>'+p.name+vHint+vAbwHint+'</label>';
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
  var notiz=ARBEITSNOTIZEN[personId]||{text:'',stufe:'',auslastung:''};
  document.getElementById('arbeit-textarea').value=notiz.text||'';
  /* Schwierigkeitsstufe Radio – Zustand wiederherstellen */
  var stufe=(notiz.stufe!==undefined&&notiz.stufe!==null)?String(notiz.stufe):'';
  document.querySelectorAll('input[name="arbeit-stufe"]').forEach(function(r){r.checked=r.value===stufe;});
  ['0','1','2','3','4'].forEach(function(v){
    var el=document.getElementById('arbeit-stufe-'+v+'-label');
    if(el)el.classList.toggle('gewaehlt',v===stufe);
  });
  /* Auslastung Radio – Zustand wiederherstellen */
  var ausl=notiz.auslastung||'';
  var avEl=document.getElementById('arbeit-auslastung-val');
  if(avEl)avEl.value=ausl;
  document.querySelectorAll('input[name="arbeit-auslastung"]').forEach(function(r){r.checked=r.value===ausl;});
  ['gut','bald','keine'].forEach(function(v){
    var el=document.getElementById('auslast-'+v+'-label');
    if(el)el.classList.toggle('gewaehlt',v===ausl);
  });
  document.getElementById('arbeit-modal').classList.add('sichtbar');
  setTimeout(function(){document.getElementById('arbeit-textarea').focus();},80);
}
function arbeitStufeCh(radio){
  ['0','1','2','3','4'].forEach(function(v){
    var el=document.getElementById('arbeit-stufe-'+v+'-label');
    if(el)el.classList.toggle('gewaehlt',v===radio.value);
  });
}
function auslastCh(radio){
  /* Setzt Hidden-Input + visuelles gewaehlt-Klasse */
  var val=radio.checked?radio.value:'';
  var avEl=document.getElementById('arbeit-auslastung-val');
  if(avEl)avEl.value=val;
  ['gut','bald','keine'].forEach(function(v){
    var el=document.getElementById('auslast-'+v+'-label');
    if(el)el.classList.toggle('gewaehlt',v===val);
  });
}
function speichereArbeitNotiz(){
  var text=document.getElementById('arbeit-textarea').value.trim();
  var stufeEl=document.querySelector('input[name="arbeit-stufe"]:checked');
  var stufe=stufeEl?stufeEl.value:'';
  var avEl=document.getElementById('arbeit-auslastung-val');
  var ausl=avEl?avEl.value:'';
  if(text||ausl||stufe!==''){ARBEITSNOTIZEN[arbeitModalPersonId]={text:text,stufe:stufe,auslastung:ausl};}
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
function vorlesenArbeitModal(){
  if(!window.speechSynthesis||!arbeitModalPersonId)return;
  var p=MITARBEITENDE.find(function(m){return m.id===arbeitModalPersonId;});
  var txt=document.getElementById('arbeit-textarea').value.trim();
  var auslEl=document.querySelector('input[name="arbeit-auslastung"]:checked');
  var auslTxt=auslEl?({gut:'Gut ausgelastet',bald:'L\u00e4uft bald aus',keine:'Keine Arbeit'}[auslEl.value]||''):'';
  var stufeEl=document.querySelector('input[name="arbeit-stufe"]:checked');
  var stufeTxt=stufeEl?'Schwierigkeitsstufe '+stufeEl.value:'';
  var teile=[];
  if(auslTxt)teile.push(auslTxt);
  if(stufeTxt)teile.push(stufeTxt);
  var voll=(p?p.name+'. ':'')+'Arbeitsinhalt'+(teile.length?', '+teile.join(', '):'')+(txt?': '+txt:'.');
  window.speechSynthesis.cancel();
  var u=new SpeechSynthesisUtterance(sprachText(voll));
  u.lang='de-DE';u.rate=0.88;
  window.speechSynthesis.speak(u);
}

