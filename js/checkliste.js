/* ══════════════════════════════════════════════════════
   checkliste.js – Gruppen·Checkpoint
   TAGES-CHECKLISTE: Rendering der Checkliste, Erledigt-Toggle,
   Drag & Drop / Bearbeitungsmodus, Checklisten-Konfiguration,
   Vertretungs-Zuweisung per Klick.
   Studjo | Evangelisches Johanneswerk
   ══════════════════════════════════════════════════════ */
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
    var falscherTag=!erl&&!enf&&!aus&&istFalscherTag(id);
    var faellig=!erl&&!enf&&!aus&&!falscherTag&&istFaelligJetzt(id);
    var rowKl=erl?'erledigt':enf?'check-entfaellt':falscherTag?'check-nicht-faellig':aus?'check-faellig':faellig?'check-faellig':abw?'warnung':'';
    var togKl=erl?'':(faellig||aus)?'faellig':abw?'warnung':'';
    var sym=erl?'&#10003;':(faellig||aus)?'&#9888;':(enf||falscherTag)?'&#8722;':abw?'&#9888;':'&#10007;';
    var warn=faellig?'<div class="check-warnung" style="color:#b45309;">&#9888; Jetzt fällig!</div>':
             abw?'<div class="check-warnung">&#9888; '+person.name+' ist abwesend</div>':
             enf?'<div class="check-warnung" style="color:var(--rot)">&#9888; Entf&auml;llt heute</div>':
             aus?'<div class="check-warnung" style="color:#b45309;">&#9888; Vertretung noch offen</div>':'';
    var wann=formatWann(id);
    var wannZeile=wann?'<div class="check-wann-anzeige">'+wann+'</div>':'';
    var persName=person?person.name:'&#8212;';
    var persZeile='<div class="check-person-zeile">&#128100; '+persName+'</div>';
    html+='<div class="check-row '+rowKl+'" id="cr-'+id+'">'
         +'<button class="check-toggle '+togKl+'" onclick="toggleErledigt(\''+id+'\')" title="'+(erl?'R\u00fckg\u00e4ngig':a.label)+'">'+sym+'</button>'
         +'<img src="'+symbolSrc(a.foto)+'" alt="'+a.label+'" class="check-symbol">'
         +'<div class="check-label-wrap" onclick="oeffneCheckPersonPicker(\''+id+'\',event)" title="Person wechseln">'+wannZeile+'<div class="check-aufgabe-name">'+a.label+'</div>'+persZeile+warn+'</div>'
         +'<button class="check-wann-btn" onclick="oeffneWannModal(\''+id+'\')" title="Zeitangabe bearbeiten">&#9200;</button>'
         +'</div>';
  });
  document.getElementById('check-tabelle').innerHTML=html;
  updateBadges();
  renderFortschritt();
}

function toggleErledigt(id){
  var idx=STATE.erledigt.indexOf(id);
  if(idx===-1)STATE.erledigt.push(id);else STATE.erledigt.splice(idx,1);
  speichereState();renderCheckliste();
}

/* Feature 2: Checkliste-Modal mit Pflicht-Zuweisung */
var AKTIVE_CHECKS_VOR_SAVE=[];
function oeffneChecklisteModal(){
  AKTIVE_CHECKS_VOR_SAVE=AKTIVE_CHECKS.slice();
  var ids=sortierteCheckIds(),html='';
  ids.forEach(function(id){
    var a=AUFGABEN[id],aktiv=AKTIVE_CHECKS.indexOf(id)!==-1,fix=id==='checkpoint';
    html+='<button class="check-modal-item'+(aktiv?' gewaehlt':'')+(fix?' fixiert':'')+'" data-check-id="'+id+'" data-fixiert="'+fix+'" onclick="checkModalClick(this)">'
         +'<img src="'+symbolSrc(a.foto)+'" alt="'+a.label+'"><span class="check-modal-label">'+a.label+(fix?' <span class="check-modal-hinweis">(immer aktiv)</span>':'')+'</span>'
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
             +'<img src="'+symbolSrc(a.foto)+'" alt="'+a.label+'" class="block-aufgabe-img">'
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
          var container=row.querySelector('.aufgaben-icons');
          if(!container)return;
          container.querySelectorAll('.aufg-icon-wrap[data-aufgabe-id]').forEach(function(w){
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
  if(editModus){
    initSortable();
  } else {
    /* Bug5: Instanzen vollständig zerstören, damit onclick-Handler wieder greifen */
    sortableInstances.forEach(function(s){try{s.destroy();}catch(e){}});
    sortableInstances=[];
  }
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
  /* Profil-Sortierung: selbst → assistenz → nicht → ohne → abwesend zuletzt */
  var _profilOrd={selbst:0,assistenz:1,nicht:2,'':3};
  var _sortiert=MITARBEITENDE.slice().sort(function(a,b){
    var aa=STATE.abwesend.indexOf(a.id)!==-1,ab2=STATE.abwesend.indexOf(b.id)!==-1;
    if(aa&&!ab2)return 1;if(!aa&&ab2)return -1;
    var wa=profilFarbe(a.id,id)||'';
    var wb=profilFarbe(b.id,id)||'';
    return (_profilOrd[wa]!==undefined?_profilOrd[wa]:3)-(_profilOrd[wb]!==undefined?_profilOrd[wb]:3)||a.name.localeCompare(b.name,'de');
  });
  _sortiert.forEach(function(p){
    var pAbw=STATE.abwesend.indexOf(p.id)!==-1;
    var ist=!enf&&cur&&cur.id===p.id;
    var pFarbe=pAbw?'':profilFarbe(p.id,id);
    var pBg=pAbw?'#f1f5f9':pFarbe?{selbst:'#dcfce7',assistenz:'#fed7aa',nicht:'#fee2e2'}[pFarbe]:(ist?'#fef2f2':'white');
    var pBorder=pAbw?'var(--hell)':ist?'var(--rot)':pFarbe?{selbst:'#86efac',assistenz:'#fcd34d',nicht:'#fca5a5'}[pFarbe]:'var(--hell)';
    var pIndikator=pAbw?'<span style="font-size:.6rem;color:var(--grau);">abwesend</span>':pFarbe?'<span style="font-size:.6rem;font-weight:900;color:'+(pFarbe==='selbst'?'#166534':pFarbe==='assistenz'?'#92400e':'#991b1b')+';">'+(pFarbe==='selbst'?'&#10003; Selbst':pFarbe==='assistenz'?'&#9889; Assistenz':'&#9711; Nicht ge\u00fcbt')+'</span>':'';
    html+='<button '+(pAbw?'disabled':'onclick="weiseCheckPersonZu('+p.id+')"')+' style="display:flex;align-items:center;justify-content:space-between;width:100%;padding:7px 10px;border-radius:8px;border:2px solid '+pBorder+';background:'+pBg+';cursor:'+(pAbw?'not-allowed':'pointer')+';font-family:inherit;font-size:.82rem;font-weight:700;opacity:'+(pAbw?'.45':'1')+';">'
         +p.name+(ist?' <span style="color:var(--rot);">\u2713</span>':pIndikator?'<span>'+pIndikator+'</span>':'')+'</button>';
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

