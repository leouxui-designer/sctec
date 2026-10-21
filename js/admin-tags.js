"use strict";
(() => {
  const tags = [
    "Agentes de IA","Angular","APIs REST","AWS","Azure","Bancos de Dados","C#","Cibersegurança","CI/CD","Cloud Computing","CSS","Cypress","Data/Looker Studio","DAX","Deep Learning","DevOps","Docker","ETL/ELT","Figma","Flutter","Git e GitHub","Google Cloud","HTML","IA Generativa","Java","JavaScript","Jest","Kotlin","LLMs","Machine Learning","Modelagem de Dados","Next.js","Node.js",".Net","NumPy","OpenCV","Pandas","Power BI","Power Query","Prompt Engineering","Python","RAG","React","React Native","Scikit-learn","SQL","Tableau","Terraform","Testes (Automatizados, API, Integração, E2E, Unitários)","TypeScript","UX/UI Design","Visualização de Dados","Visão Computacional","Web Scraping","Kubernetes"
  ];
  const list = document.getElementById("tags-list");
  const empty = document.getElementById("tags-empty");
  const search = document.getElementById("tag-search");
  const addOpen = document.getElementById("add-tag-open");
  const addDialog = document.getElementById("add-tag-dialog");
  const addForm = document.getElementById("add-tag-form");
  const nameInput = document.getElementById("tag-name");
  const addError = document.getElementById("add-tag-error");
  const removeDialog = document.getElementById("remove-tag-dialog");
  const removeDescription = document.getElementById("remove-tag-description");
  const toast = document.getElementById("toast");
  let query = "";
  let removeIndex = -1;
  let removeOrigin = null;
  let toastTimer;

  const normalize = value => String(value).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR");

  function render() {
    const term = normalize(query.trim());
    const filtered = tags.map((tag,index)=>({tag,index})).filter(item=>!term||normalize(item.tag).includes(term));
    list.replaceChildren(...filtered.map(item => {
      const badge = document.createElement("span");
      badge.className = "admin-tag";
      const label = document.createElement("span");
      label.textContent = item.tag;
      const button = document.createElement("button");
      button.type = "button";
      button.className = "admin-tag__remove";
      button.dataset.removeTag = String(item.index);
      button.setAttribute("aria-label", `Remover tag ${item.tag}`);
      const icon = document.createElement("img");
      icon.src = "../assets/admin-figma/RequestClose.svg";
      icon.alt = "";
      icon.width = 14;
      icon.height = 14;
      button.append(icon);
      badge.append(label,button);
      return badge;
    }));
    empty.hidden = filtered.length > 0;
  }

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("toast--visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(()=>toast.classList.remove("toast--visible"),2500);
  }

  function clearAddError() {
    addError.textContent = "";
    nameInput.removeAttribute("aria-invalid");
  }

  function openAdd() {
    nameInput.value = "";
    clearAddError();
    addDialog.showModal();
    nameInput.focus();
  }

  function closeAdd() {
    if(addDialog.open)addDialog.close();
    clearAddError();
    addOpen.focus();
  }

  function openRemove(index,origin) {
    removeIndex = index;
    removeOrigin = origin;
    removeDescription.textContent = `Tem certeza de que deseja remover a tag “${tags[index]}”?`;
    removeDialog.showModal();
    removeDialog.querySelector("[data-close-remove]").focus();
  }

  function closeRemove(restoreFocus=true) {
    if(removeDialog.open)removeDialog.close();
    if(restoreFocus&&removeOrigin?.isConnected)removeOrigin.focus();
    removeIndex=-1;
    removeOrigin=null;
  }

  search.addEventListener("input",()=>{query=search.value;render()});
  addOpen.addEventListener("click",openAdd);
  addDialog.querySelectorAll("[data-close-add]").forEach(button=>button.addEventListener("click",closeAdd));
  addDialog.addEventListener("click",event=>{if(event.target===addDialog)closeAdd()});
  addDialog.addEventListener("cancel",event=>{event.preventDefault();closeAdd()});
  nameInput.addEventListener("input",clearAddError);
  addForm.addEventListener("submit",event=>{
    event.preventDefault();
    const value=nameInput.value.trim().replace(/\s+/g," ");
    if(!value){addError.textContent="Informe o nome da tag.";nameInput.setAttribute("aria-invalid","true");nameInput.focus();return}
    if(tags.some(tag=>normalize(tag)===normalize(value))){addError.textContent="Esta tag já existe.";nameInput.setAttribute("aria-invalid","true");nameInput.focus();return}
    tags.push(value);
    query="";
    search.value="";
    render();
    closeAdd();
    showToast(`Tag “${value}” adicionada nesta demonstração.`);
  });

  list.addEventListener("click",event=>{
    const button=event.target.closest("[data-remove-tag]");
    if(button)openRemove(Number(button.dataset.removeTag),button);
  });
  removeDialog.querySelectorAll("[data-close-remove]").forEach(button=>button.addEventListener("click",()=>closeRemove()));
  removeDialog.addEventListener("click",event=>{if(event.target===removeDialog)closeRemove()});
  removeDialog.addEventListener("cancel",event=>{event.preventDefault();closeRemove()});
  document.getElementById("remove-tag-confirm").addEventListener("click",()=>{
    if(removeIndex<0||removeIndex>=tags.length)return;
    const removed=tags[removeIndex];
    tags.splice(removeIndex,1);
    closeRemove(false);
    render();
    search.focus();
    showToast(`Tag “${removed}” removida desta demonstração.`);
  });

  render();
})();
