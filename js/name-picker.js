import { cleanName, nameKey, readNames, saveNames } from './game/names.mjs';
export function createNamePicker(container) {
  let storage;
  try { storage = window.localStorage; } catch { /* The picker still works for this session. */ }
  let names = readNames(storage), current = null, options = [], highlighted = -1;
  const inputs = new Map();
  const list = document.createElement('div');
  list.id = 'name-options'; list.className = 'name-options'; list.role = 'listbox'; list.hidden = true;
  list.setAttribute('aria-label', 'Nombres guardados'); list.setAttribute('popover','manual'); container.closest('dialog').append(list);
  const status = document.querySelector('#name-status');
  function close() {
    if(current) { current.setAttribute('aria-expanded','false'); current.removeAttribute('aria-activedescendant'); }
    if(list.matches(':popover-open')) list.hidePopover();
    list.hidden = true; current = null; highlighted = -1;
  }
  function position() {
    if(!current) return;
    const rect = current.closest('.name-input-wrap').getBoundingClientRect();
    const height = Math.min(268, options.length * 44 + 4);
    const viewport = window.visualViewport;
    const top = viewport?.offsetTop || 0, bottom = top + (viewport?.height || window.innerHeight);
    const below = bottom - rect.bottom - 8, above = rect.top - top - 8;
    const upwards = below < height && above > below;
    const available = Math.max(44, upwards ? above : below);
    list.style.maxHeight = Math.min(268, available) + 'px';
    list.style.width = rect.width + 'px'; list.style.left = rect.left + 'px';
    list.style.top = (upwards ? rect.top - Math.min(height, available) : rect.bottom) + 'px';
  }
  function persist(values) {
    const result = saveNames(storage, [...names, ...values]); names = result.names;
    status.textContent = result.saved ? '' : 'Los nombres se pueden usar, pero este navegador no permite guardarlos para otra visita.';
  }
  function choose(index) {
    const selected = options[index]; if(!selected || !current) return;
    const input = current; input.value = selected.name; input.setCustomValidity('');
    persist([selected.name]); close(); input.focus({preventScroll:true});
  }
  function highlight(index) {
    highlighted = index;
    [...list.children].forEach((option,i)=>option.setAttribute('aria-selected',String(i===index)));
    if(index>=0) {
      current.setAttribute('aria-activedescendant',list.children[index].id);
      list.children[index].scrollIntoView({block:'nearest'});
    } else current.removeAttribute('aria-activedescendant');
  }
  function open(input, all = false) {
    if(current && current !== input) close();
    current = input; names = [...new Map([...names,...readNames(storage)].map(n=>[nameKey(n),n])).values()];
    const query = all ? '' : nameKey(input.value);
    options = names.filter(name=>nameKey(name).includes(query)).map(name=>({name}));
    const typed = cleanName(input.value);
    if(!all && typed && !names.some(name=>nameKey(name)===nameKey(typed))) options.push({name:typed,add:true});
    list.replaceChildren(...options.map((option,index)=>{
      const item = document.createElement('div'); item.role='option'; item.id='name-option-'+index;
      item.textContent=option.add ? 'Guardar y usar: '+option.name : option.name;
      item.setAttribute('aria-selected','false');
      item.addEventListener('pointerdown',event=>event.preventDefault());
      item.addEventListener('click',()=>choose(index)); return item;
    }));
    list.hidden=false; if(!list.matches(':popover-open')) list.showPopover(); input.setAttribute('aria-expanded','true'); highlighted=-1;
    input.removeAttribute('aria-activedescendant'); list.scrollTop=0; position();
  }
  for(const [id,color,value] of [['blue','Azul','Eri'],['red','Rojo','Melina'],['yellow','Amarillo','Diego'],['green','Verde','Gustavo']]) {
    const field=document.createElement('div'); field.className='name-field';field.dataset.playerId=id;
    const label=document.createElement('label');label.htmlFor='name-'+id;label.textContent='Jugador '+(inputs.size+1);
    const wrap=document.createElement('div');wrap.className='name-input-wrap';wrap.style.setProperty('--name-color','var(--'+id+')');
    const input=document.createElement('input');input.id='name-'+id;input.value='';input.maxLength=32;input.autocomplete='off';input.spellcheck=false;
    input.setAttribute('role','combobox');input.setAttribute('aria-autocomplete','list');input.setAttribute('aria-expanded','false');input.setAttribute('aria-controls',list.id);
    input.placeholder='Elegir o escribir un nombre';
    const button=document.createElement('button');button.type='button';button.textContent='\u25be';button.setAttribute('aria-label','Ver nombres para jugador '+(inputs.size+1));
    button.addEventListener('click',()=>{if(current===input && !list.hidden)close();else{input.focus({preventScroll:true});open(input,true);}});
    input.addEventListener('click',()=>open(input,true));
    input.addEventListener('input',()=>{input.setCustomValidity('');open(input);});
    input.addEventListener('keydown',event=>{
      if(event.isComposing)return;
      if(event.key==='ArrowDown' || event.key==='ArrowUp') {
        event.preventDefault();if(current!==input || list.hidden)open(input,true);
        if(options.length)highlight((highlighted+(event.key==='ArrowDown'?1:highlighted<0?0:-1)+options.length)%options.length);
      } else if(event.key==='Enter') {
        event.preventDefault();if(current===input && highlighted>=0)choose(highlighted);
        else if(cleanName(input.value)){input.value=cleanName(input.value);persist([input.value]);close();}
      } else if(event.key==='Escape' && !list.hidden) {event.preventDefault();event.stopPropagation();close();}
      else if(event.key==='Tab')close();
    });
    wrap.append(input,button);field.append(label,wrap);container.append(field);inputs.set(id,input);
  }
  document.addEventListener('pointerdown',event=>{
    if(current && !current.closest('.name-input-wrap').contains(event.target) && !list.contains(event.target))close();
  });
  window.addEventListener('resize',position);
  document.addEventListener('scroll',event=>{if(event.target!==list)position();},true);
  window.visualViewport?.addEventListener('resize',position);
  return {
    setValues(values = {}) { close(); for(const [id,input] of inputs){input.value=values[id] || '';input.setCustomValidity('');} },
    focus() { inputs.get('blue').focus({preventScroll:true}); },
    setCount(count) {close();[...inputs].forEach(([id,input],i)=>input.closest('.name-field').hidden=i>=count);},
    values() {return Object.fromEntries([...inputs].map(([id,input])=>[id,cleanName(input.value)]));},
    commit() {
      const active=[...inputs.values()].filter(input=>!input.closest('.name-field').hidden);
      for(const input of active) {
        if(!cleanName(input.value)){close();input.setCustomValidity('Escribe o elige un nombre.');input.reportValidity();input.focus();return false;}
        input.setCustomValidity(''); input.value=cleanName(input.value);
      }
      persist(active.map(input=>input.value));close();return true;
    }, close,
  };
}
