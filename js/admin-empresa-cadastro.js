"use strict";
(() => {
  const form=document.getElementById('company-registration');
  const toast=document.getElementById('toast');
  const editMode=document.body.classList.contains('company-edit-page');
  const editProfile=document.body.dataset.profile==='acate'?'acate':'admin';
  const editRecords=[
    ['inovatech','InovaTech SC','44.555.666/0001-33','Tecnologia / IoT','Média','Florianópolis, SC','Sim','Aprovada','André Luiz Pereira','Diretor de Tecnologia','andre@inovatech.sc'],
    ['sc-digital','SC Digital Solutions','77.888.999/0001-55','E-commerce','Pequena','Joinville, SC','Não','Inativada','Patrícia Mendes','Diretora Comercial','patricia@scdigital.com.br'],
    ['techcorp','TechCorp Soluções','12.345.678/0001-90','Tecnologia / SaaS','Média','Florianópolis, SC','Sim','Solicitação','Carlos Eduardo Ferreira','CTO','carlos@techcorp.com.br'],
    ['datasoft','DataSoft Ltda.','98.765.432/0001-10','Cloud / Infra','Grande','Blumenau, SC','Não','Solicitação','Fernanda Lima','Diretora de Operações','fernanda@datasoft.com.br'],
    ['finansc','FinanSC','33.444.555/0001-22','Fintech','Pequena','Florianópolis, SC','Não informado','Solicitação','Juliana Martins','Diretora Comercial','juliana@finansc.com.br'],
    ['cloudsc','CloudSC Tecnologia','11.222.333/0001-44','Cloud / Infra','Grande','São José, SC','Sim','Ressolicitação','Marcos Souza','Gerente de Tecnologia','roberto@cloudsc.com.br'],
    ['oldtech','OldTech Sistemas','55.666.777/0001-88','ERP / Consultoria','Microempresa','Criciúma, SC','Não','Recusada','Marcos Oliveira','Diretor','marcos@oldtech.com.br'],
    ['nexussc','NexusSC Digital','22.333.444/0001-66','Tecnologia / SaaS','Pequena','Florianópolis, SC','Sim','Recusada','Beatriz Souza','CEO','beatriz@nexussc.com.br'],
    ['safetech','SafeTech Brasil','66.777.888/0001-11','Cibersegurança','Grande','Florianópolis, SC','Sim','Aprovada','Rafael Costa','CISO','rafael@safetech.com.br'],
    ['dadosul','DadoSul','10.111.222/0001-33','Análise de Dados','Pequena','Chapecó, SC','Não','Aprovada','Camila Rocha','Head de Dados','camila@dadosul.com.br'],
    ['orbit','Orbit Sistemas','20.222.333/0001-44','ERP / Consultoria','Média','Concórdia, SC','Não','Inativada','Lucas Martins','Diretor de Produto','lucas@orbit.com.br'],
    ['verde','Verde Labs','30.333.444/0001-55','Tecnologia / IoT','Microempresa','Florianópolis, SC','Sim','Aprovada','Ana Beatriz','CEO','ana@verdelabs.com.br'],
    ['ponte','Ponte Tech','40.444.555/0001-66','E-commerce','Pequena','Timbó, SC','Não','Solicitação','Diego Lima','Gerente Comercial','diego@pontetech.com.br'],
    ['farol','Farol Digital','50.555.666/0001-77','Fintech','Média','Laguna, SC','Não informado','Recusada','Marina Alves','Diretora','marina@faroldigital.com.br'],
    ['nuvem-sul','Nuvem Sul','22.333.444/0001-09','Cloud Computing','Pequena','Florianópolis, SC','Sim','Aprovada','Amanda Oliveira','CEO','amanda@nuvemsul.com.br'],
    ['horizonte','Horizonte Dados','66.777.888/0001-42','Dados / BI','Microempresa','Chapecó, SC','Sim','Aprovada','Rafael Nunes','Head de Dados','rafael@horizontedados.com.br'],
    ['ilha-tech','Ilha Tech','88.999.000/0001-77','Desenvolvimento','Grande','Florianópolis, SC','Sim','Inativada','Beatriz Lima','Diretora de Tecnologia','beatriz@ilhatech.com.br']
  ].map(([id,name,cnpj,segment,size,city,acate,status,responsible,role,email],index)=>({id,name,legalName:`${name} Ltda.`,cnpj,segment,size,city,acate:editProfile==='acate'?'Sim':acate,status,responsible:{name:responsible,role,email,phone:`(48) 9999${String(1200+index).slice(-4)}`},notes:`Acompanhamento fictício de ${name}. Dados revisados para a demonstração do fluxo de edição.`,about:`A ${name} atua no segmento de ${segment} em Santa Catarina. A empresa valoriza inovação, colaboração e desenvolvimento contínuo de pessoas.`,skills:segment.includes('Cloud')?['AWS','Cloud Computing','Docker']:segment.includes('Dados')?['Python','SQL','Power BI']:['JavaScript','React','Node.js'],channels:[{type:'LinkedIn',label:'LinkedIn',url:`https://example.test/${id}`}]}));
  const requestedCompanyId=new URLSearchParams(location.search).get('company')||'techcorp';
  const editCompany=editMode?(editRecords.find(company=>company.id===requestedCompanyId)||editRecords.find(company=>company.id==='techcorp')):null;
  const attempted=new WeakSet();
  const knownDemoCompanies=[{"cnpj":"44555666000133","email":"andre@inovatech.sc"},{"cnpj":"77888999000155","email":"patricia@scdigital.com.br"},{"cnpj":"12345678000190","email":"carlos@techcorp.com.br"},{"cnpj":"98765432000110","email":"fernanda@datasoft.com.br"},{"cnpj":"33444555000122","email":"juliana@finansc.com.br"},{"cnpj":"11222333000144","email":"roberto@cloudsc.com.br"},{"cnpj":"55666777000188","email":"marcos@oldtech.com.br"},{"cnpj":"22333444000166","email":"beatriz@nexussc.com.br"},{"cnpj":"66777888000111","email":"rafael@safetech.com.br"},{"cnpj":"10111222000133","email":"camila@dadosul.com.br"},{"cnpj":"20222333000144","email":"lucas@orbit.com.br"},{"cnpj":"30333444000155","email":"ana@verdelabs.com.br"},{"cnpj":"40444555000166","email":"diego@pontetech.com.br"},{"cnpj":"50555666000177","email":"marina@faroldigital.com.br"}];
  // Local copies of existing demonstration identifiers, not a registry or remote validation.
  const knownCnpjs=new Set(knownDemoCompanies.map(c=>c.cnpj));
  const knownEmails=new Set(knownDemoCompanies.map(c=>c.email));
  const messages={
    'company-name':'Informe o nome fantasia da empresa.',
    'company-legal-name':'Informe a razão social conforme o CNPJ.',
    'company-cnpj':'Informe o CNPJ da empresa.',
    'company-segment':'Selecione o segmento de atuação da empresa.',
    'company-size':'Selecione o porte da empresa.',
    'company-city':'Selecione a cidade de atuação.',
    'company-acate':'Indique se a empresa é associada à ACATE.',
    name:'Informe o nome completo do responsável.',
    role:'Informe o cargo do responsável na empresa.',
    email:'E-mail corporativo inválido ou já cadastrado',
    phone:'Informe um número de contato com DDD.',
    'channel-type':'Selecione uma opção.'
  };
  let completed=false;
  function notify(title,description='',success=false){
    document.getElementById('registration-toast-title').textContent=title;
    document.getElementById('registration-toast-description').textContent=description;
    toast.classList.toggle('registration-toast--success',success);
    toast.hidden=false;
  }
  document.getElementById('registration-toast-close').addEventListener('click',()=>{toast.hidden=true;});
  function validateField(field){
    let message='';
    const value=field.value.trim();
    const key=field.id.replace(/^(responsible-|additional-)/,'');
    if(!value)message=messages[field.id]||messages[key]||'Preencha este campo.';
    else if(key==='email'&&(field.validity.typeMismatch||(knownEmails.has(value.toLowerCase())&&(!editCompany||value.toLowerCase()!==editCompany.responsible.email.toLowerCase()))))message=messages.email;
    else if(key==='phone'&&!/^\d{10,11}$/.test(value.replace(/\D/g,'')))message=messages.phone;
    else if(field.id==='company-cnpj'){
      const digits=value.replace(/\D/g,'');
      if(!/^\d{14}$/.test(digits)||/[^\d.\/\-\s]/.test(value))message='Informe um CNPJ com 14 dígitos.';
      else if(knownCnpjs.has(digits)&&(!editCompany||digits!==editCompany.cnpj.replace(/\D/g,'')))message='Este CNPJ já está cadastrado no sistema';
    }
    const error=document.getElementById(field.id+'-error');
    error.textContent=message;error.hidden=!message;
    field.setAttribute('aria-invalid',String(Boolean(message)));
    return !message;
  }
  function validateForm(target){
    attempted.add(target);
    const invalid=[...target.querySelectorAll('[required]')].filter(field=>!validateField(field));
    if(invalid.length){invalid[0].focus();invalid[0].scrollIntoView({block:'center'});return false;}
    return true;
  }
  document.querySelectorAll('form').forEach(target=>{
    const revalidate=event=>{if(target.id==='channel-dialog-form')return;if(event.target.required&&(attempted.has(target)||event.target.getAttribute('aria-invalid')==='true'))validateField(event.target);};
    target.addEventListener('input',revalidate);target.addEventListener('change',revalidate);
  });
  function returnToCompanies(){
    const route=editMode&&editProfile==='acate'?'#/sctec/acate/companies':'#/sctec/admin/companies';
    const page=editMode&&editProfile==='acate'?'acate-empresas.html':'admin-empresas.html';
    try{if(window.parent!==window&&window.parent.location.origin===window.location.origin&&window.parent.document.getElementById('sctec-content')){window.parent.location.hash=route;return;}}catch{}
    window.location.href=page;
  }
  form.addEventListener('submit',event=>{
    event.preventDefault();
    if(completed)return;
    if(!validateForm(form)){notify('Erro ao salvar as alterações','Corrija os campos em vermelho antes de continuar.');return;}
    if(document.getElementById('logo-upload').getAttribute('aria-invalid')==='true'){notify('Erro ao salvar as alterações','Corrija os campos em vermelho antes de continuar.');document.getElementById('logo-choose').focus();return;}
    completed=true;
    form.querySelector('button[type=submit]').disabled=true;
    toast.hidden=true;
    openDialog(document.getElementById('success-dialog'),document.getElementById('success-return'));
  });
  // Data URLs remain local and avoid object-URL lifecycle leaks.
  const upload=document.getElementById('logo-upload');
  const logoChoose=document.getElementById('logo-choose');
  const logoRemove=document.getElementById('logo-remove');
  const logoImage=document.querySelector('#logo-preview img');
  const logoPlaceholder=logoImage.src;
  let logoFingerprint='',logoVersion=0;
  logoChoose.addEventListener('click',()=>upload.click());
  logoRemove.addEventListener('click',()=>{
    logoVersion++;logoFingerprint='';upload.value='';logoImage.src=logoPlaceholder;
    logoChoose.textContent='Adicionar logo';logoRemove.hidden=true;
    upload.removeAttribute('aria-invalid');document.getElementById('logo-error').hidden=true;
    logoChoose.focus();
  });
  upload.addEventListener('change',()=>{
    const file=upload.files?.[0];if(!file)return;
    const message=(!['image/png','image/jpeg'].includes(file.type)||file.size>5*1024*1024)?'JPG ou PNG, até 5 MB':'';
    const error=document.getElementById('logo-error');error.textContent=message;error.hidden=!message;
    upload.setAttribute('aria-invalid',String(Boolean(message)));if(message)return;
    const version=++logoVersion;
    logoFingerprint=[file.name,file.size,file.lastModified].join(':');
    const reader=new FileReader();reader.addEventListener('load',()=>{if(version!==logoVersion)return;logoImage.src=reader.result;});reader.readAsDataURL(file);
    logoChoose.textContent='Alterar';logoRemove.hidden=false;
  });
  const skills=['Agentes de IA','Angular','APIs REST','AWS','Azure','Bancos de Dados','C#','Cibersegurança','CI/CD','Cloud Computing','CSS','Cypress','Data/Looker Studio','DAX','Deep Learning','DevOps','Docker','ETL/ELT','Figma','Flutter','Git e GitHub','Google Cloud','HTML','IA Generativa','Java','JavaScript','Jest','Kotlin','LLMs','Machine Learning','Modelagem de Dados','Next.js','Node.js','.Net','NumPy','OpenCV','Pandas','Power BI','Power Query','Prompt Engineering','Python','RAG','React','React Native','Scikit-learn','SQL','Tableau','Terraform','Testes (Automatizados, API, Integração, E2E, Unitários)','TypeScript','UX/UI Design','Visualização de Dados','Visão Computacional','Web Scraping','Kubernetes'];
  const tags=document.getElementById('company-skills');
  for(const skill of skills){const button=document.createElement('button');button.type='button';button.className='registration-tag';button.textContent=skill;button.setAttribute('aria-pressed','false');button.addEventListener('click',()=>button.setAttribute('aria-pressed',String(button.getAttribute('aria-pressed')!=='true')));tags.append(button);}
  document.getElementById('company-skills-search').addEventListener('input',event=>{const term=event.target.value.toLocaleLowerCase('pt-BR');for(const tag of tags.children)tag.hidden=!tag.textContent.toLocaleLowerCase('pt-BR').includes(term);});
  const supportMessage='Olá! Estou navegando no Portal de Talentos SCTEC e preciso de um suporte com a plataforma. Poderiam me ajudar?';
  document.getElementById('registration-support').addEventListener('click',()=>{
    if(editMode){notify('Suporte demonstrativo','Nenhuma mensagem foi enviada.');return;}
    window.open('https://wa.me/554832395845?text='+encodeURIComponent(supportMessage),'_blank','noopener,noreferrer');
  });

  const dialogOpeners=new WeakMap();
  function openDialog(dialog,focusTarget){
    dialogOpeners.set(dialog,document.activeElement);
    dialog.showModal();(focusTarget||dialog.querySelector('input:not(:disabled),select,button:not(:disabled)'))?.focus();
  }
  function closeDialog(dialog){dialog.close();const opener=dialogOpeners.get(dialog);if(opener?.isConnected)opener.focus();}
  function clearErrors(target){
    attempted.delete(target);
    target.querySelectorAll('[aria-invalid]').forEach(input=>input.removeAttribute('aria-invalid'));
    target.querySelectorAll('.registration-error').forEach(error=>{error.textContent='';error.hidden=true;});
  }
  document.querySelectorAll('dialog').forEach(dialog=>{
    dialog.addEventListener('keydown',event=>{
      if(event.key!=='Tab')return;
      const items=[...dialog.querySelectorAll('input:not(:disabled),select:not(:disabled),button:not(:disabled),a[href]')].filter(el=>el.getClientRects().length);
      if(!items.length)return;
      if(event.shiftKey&&document.activeElement===items[0]){event.preventDefault();items.at(-1).focus();}
      else if(!event.shiftKey&&document.activeElement===items.at(-1)){event.preventDefault();items[0].focus();}
    });
  });
  const responsibleDialog=document.getElementById('responsible-dialog');
  const responsibleForm=document.getElementById('responsible-dialog-form');
  document.getElementById('add-responsible').addEventListener('click',()=>openDialog(responsibleDialog));
  responsibleDialog.querySelectorAll('[data-close-dialog]').forEach(button=>button.addEventListener('click',()=>closeDialog(responsibleDialog)));
  responsibleDialog.addEventListener('cancel',event=>{event.preventDefault();closeDialog(responsibleDialog);});
  responsibleForm.addEventListener('submit',event=>{
    event.preventDefault();if(!validateForm(responsibleForm))return;
    const item=document.createElement('div');item.className='registration-extra-item';
    item.textContent=[...responsibleForm.querySelectorAll('input')].map(input=>input.value.trim()).join(' · ');
    document.getElementById('extra-responsibles').append(item);
    responsibleForm.reset();clearErrors(responsibleForm);closeDialog(responsibleDialog);
  });

  const channelDialog=document.getElementById('channel-dialog');
  const channelForm=document.getElementById('channel-dialog-form');
  const channelType=document.getElementById('channel-type');
  const channelName=document.getElementById('channel-name');
  const channelLink=document.getElementById('channel-link');
  const channelSave=channelForm.querySelector('[type=submit]');
  const channels=[];
  function httpsUrl(value){
    try{const url=new URL(value.trim());return url.protocol==='https:'&&Boolean(url.hostname)&&!url.username&&!url.password?url.href:null;}catch{return null;}
  }
  function channelValid(){return Boolean(channelType.value&&httpsUrl(channelLink.value)&&(channelType.value!=='Outro'||(channelName.value.trim()&&channelName.value.length<=50)));}
  function channelError(field,message){const error=document.getElementById(field.id+'-error');error.textContent=message;error.hidden=!message;field.setAttribute('aria-invalid',String(Boolean(message)));}
  function updateChannel(){
    const selected=Boolean(channelType.value),other=channelType.value==='Outro';
    document.getElementById('channel-name-group').hidden=!other;channelName.disabled=!other;channelName.required=other;
    document.getElementById('channel-link-group').hidden=!selected;channelLink.disabled=!selected;channelLink.required=selected;
    document.getElementById('channel-name-counter').textContent=channelName.value.length+'/50';
    channelSave.disabled=!channelValid();
  }
  function resetChannel(){channelForm.reset();clearErrors(channelForm);updateChannel();}
  document.getElementById('add-channel').addEventListener('click',()=>{resetChannel();openDialog(channelDialog,channelType);});
  channelDialog.querySelectorAll('[data-close-dialog]').forEach(button=>button.addEventListener('click',()=>closeDialog(channelDialog)));
  channelDialog.addEventListener('cancel',event=>{event.preventDefault();closeDialog(channelDialog);});
  channelType.addEventListener('change',()=>{clearErrors(channelForm);updateChannel();});
  channelForm.addEventListener('input',event=>{
    if(event.target===channelLink||event.target===channelName)channelError(event.target,'');
    updateChannel();
  });
  channelLink.addEventListener('blur',()=>{if(channelLink.value&&!httpsUrl(channelLink.value))channelError(channelLink,'Informe um link válido com HTTPS.');});
  channelName.addEventListener('blur',()=>{if(channelType.value==='Outro'&&!channelName.value.trim())channelError(channelName,'Informe o nome do canal.');});
  channelForm.addEventListener('submit',event=>{
    event.preventDefault();if(!channelValid())return;
    const url=httpsUrl(channelLink.value),label=channelType.value==='Outro'?channelName.value.trim():channelType.value;
    if(channels.some(channel=>channel.url===url&&channel.label.toLocaleLowerCase('pt-BR')===label.toLocaleLowerCase('pt-BR'))){channelError(channelLink,'Este canal já foi adicionado.');channelLink.focus();return;}
    channels.push({type:channelType.value,label,url});
    const item=document.createElement('div');item.className='registration-extra-item';
    const name=document.createElement('strong');name.textContent=label;
    const link=document.createElement('a');link.href=url;link.textContent=url;link.target='_blank';link.rel='noopener noreferrer';
    item.append(name,link);document.getElementById('company-channels').append(item);
    resetChannel();closeDialog(channelDialog);
  });
  updateChannel();

  function appendExistingChannel(channel){
    channels.push(channel);
    const item=document.createElement('div');item.className='registration-extra-item';
    const name=document.createElement('strong');name.textContent=channel.label;
    const link=document.createElement('a');link.href=channel.url;link.textContent=channel.url;link.target='_blank';link.rel='noopener noreferrer';
    item.append(name,link);document.getElementById('company-channels').append(item);
  }
  function populateEditForm(){
    if(!editCompany)return;
    const values={
      'company-name':editCompany.name,'company-legal-name':editCompany.legalName,'company-cnpj':editCompany.cnpj,
      'company-segment':editCompany.segment,'company-size':editCompany.size,'company-city':editCompany.city,'company-acate':editCompany.acate,
      'responsible-name':editCompany.responsible.name,'responsible-role':editCompany.responsible.role,
      'responsible-email':editCompany.responsible.email,'responsible-phone':editCompany.responsible.phone,
      'company-notes':editCompany.notes,'company-about':editCompany.about
    };
    for(const [id,value] of Object.entries(values)){const field=document.getElementById(id);if(field)field.value=value;}
    document.body.dataset.companyId=editCompany.id;document.body.dataset.companyStatus=editCompany.status;
    document.title='Editar Empresa - '+(editProfile==='acate'?'ACATE':'Admin')+' | SCTEC';
    logoImage.alt='Prévia da logo de '+editCompany.name;
    for(const tag of tags.children)tag.setAttribute('aria-pressed',String(editCompany.skills.includes(tag.textContent)));
    for(const channel of editCompany.channels)appendExistingChannel({...channel});
    if(editCompany.id==='datasoft'){
      const extra=document.createElement('div');extra.className='registration-extra-item';
      extra.textContent='Marina Lopes · Gerente de Pessoas · marina@datasoft.com.br · (48) 98888-4321';
      document.getElementById('extra-responsibles').append(extra);
    }
    document.getElementById('success-title').textContent='Empresa atualizada com sucesso!';
    document.getElementById('success-description').textContent=`Os dados de ${editCompany.name} foram atualizados nesta demonstração.`;
    document.getElementById('success-simulation').textContent='Simulação: nenhuma alteração foi persistida e nenhum e-mail foi enviado.';
    document.getElementById('success-return').textContent=editProfile==='acate'?'Voltar para Consulta de Empresas':'Voltar para Gestão de Empresas';
    document.getElementById('success-another').hidden=true;
  }
  populateEditForm();

  // Compare meaningful draft contents, so undoing a change restores a pristine form.
  function draftSnapshot(){
    const fields=[...form.querySelectorAll('input:not([type=file]):not([type=search]),select,textarea')].map(field=>[field.id,field.value]);
    return JSON.stringify({fields,logo:logoFingerprint,channels,responsibles:document.getElementById('extra-responsibles').textContent,skills:[...tags.querySelectorAll('[aria-pressed=true]')].map(tag=>tag.textContent)});
  }
  const initialDraft=draftSnapshot();
  let allowLeave=false,pendingExit=null,pendingCancel=null,previousDialog=null;
  const leaveDialog=document.getElementById('leave-dialog');
  const isDirty=()=>!completed&&!allowLeave&&draftSnapshot()!==initialDraft;
  function requestExit(proceed,onCancel){
    if(!isDirty()){proceed();return false;}
    if(pendingExit){onCancel?.();return true;}
    pendingExit=proceed;pendingCancel=onCancel;
    previousDialog=document.querySelector('dialog[open]');
    if(previousDialog)previousDialog.close();
    openDialog(leaveDialog,leaveDialog.querySelector('[data-stay]'));
    return true;
  }
  function stay(){pendingExit=null;pendingCancel?.();pendingCancel=null;closeDialog(leaveDialog);if(previousDialog){previousDialog.showModal();previousDialog=null;}}
  leaveDialog.querySelectorAll('[data-stay]').forEach(button=>button.addEventListener('click',stay));
  leaveDialog.addEventListener('cancel',event=>{event.preventDefault();stay();});
  document.getElementById('confirm-leave').addEventListener('click',()=>{
    const proceed=pendingExit;pendingExit=null;pendingCancel=null;allowLeave=true;leaveDialog.close();proceed?.();
  });
  // Optional same-origin hook used by the viewer before replacing this iframe.
  window.sctecConfirmNavigation=(proceed,onCancel)=>isDirty()?requestExit(proceed,onCancel):false;
  document.addEventListener('click',event=>{
    const link=event.target.closest('a[href]');
    if(!link||event.defaultPrevented||event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey||link.target||link.hasAttribute('download'))return;
    const url=new URL(link.href,location.href);
    if(url.origin!==location.origin||(url.pathname===location.pathname&&url.search===location.search))return;
    if(!isDirty())return;
    event.preventDefault();event.stopImmediatePropagation();
    requestExit(()=>link.click());
  },true);
  window.addEventListener('beforeunload',event=>{if(isDirty()){event.preventDefault();event.returnValue='';}});
  const successDialog=document.getElementById('success-dialog');
  successDialog.addEventListener('cancel',event=>{event.preventDefault();returnToCompanies();});
  document.getElementById('success-return').addEventListener('click',returnToCompanies);
  document.getElementById('success-another').addEventListener('click',()=>location.reload());
})();
