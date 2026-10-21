"use strict";
(() => {
  const base = {
    city:"Florianópolis, SC",role:"Direção de Tecnologia",email:"contato@empresa.com.br",phone:"(48) 99999-1234",
    about:"Empresa de tecnologia focada em soluções digitais para o mercado B2B. Atua com desenvolvimento de software, dados e inovação, valorizando colaboração e aprendizado contínuo.",
    skills:["JavaScript","React","Node.js","Python","SQL","Cloud Computing"],channels:["LinkedIn","Portal de carreiras"]
  };
  const companies = {
    inovatech:{name:"InovaTech SC",legal:"InovaTech Santa Catarina Ltda.",cnpj:"44.555.666/0001-33",segment:"Tecnologia / IoT",size:"Média",owner:"André Luiz Pereira",status:"Aprovada",...base},
    "sc-digital":{name:"SC Digital Solutions",legal:"SC Digital Solutions Ltda.",cnpj:"77.888.999/0001-55",segment:"E-commerce",size:"Pequena",owner:"Patrícia Mendes",status:"Inativada",...base,city:"Joinville, SC"},
    techcorp:{name:"TechCorp Soluções",legal:"TechCorp Soluções Ltda.",cnpj:"12.345.678/0001-90",segment:"Tecnologia / SaaS",size:"Média",owner:"Carlos Eduardo Ferreira",status:"Solicitação",...base,role:"CTO",email:"carlos@techcorp.com.br"},
    datasoft:{name:"DataSoft Ltda.",legal:"DataSoft Tecnologia Ltda.",cnpj:"98.765.432/0001-10",segment:"Cloud / Infra",size:"Grande",owner:"Fernanda Lima",status:"Solicitação",...base,city:"Blumenau, SC",skills:["AWS","Azure","DevOps","Docker","Terraform","SQL"]},
    finansc:{name:"FinanSC",legal:"FinanSC Serviços Financeiros Ltda.",cnpj:"33.444.555/0001-22",segment:"Fintech",size:"Pequena",owner:"Juliana Martins",status:"Solicitação",...base,skills:["Python","Power BI","SQL","APIs REST","Cibersegurança"]},
    cloudsc:{name:"CloudSC Tecnologia",legal:"CloudSC Tecnologia Ltda.",cnpj:"11.222.333/0001-44",segment:"Cloud / Infra",size:"Média",owner:"Marcos Souza",status:"Solicitação após recusa",...base,city:"São José, SC",skills:["Cloud Computing","AWS","Docker","CI/CD","Kubernetes"]},
    oldtech:{name:"OldTech Sistemas",legal:"OldTech Sistemas de Gestão Ltda.",cnpj:"55.666.777/0001-88",segment:"ERP / Consultoria",size:"Microempresa",owner:"Múltiplos responsáveis",status:"Recusada",...base,city:"Criciúma, SC",skills:["Java",".NET","SQL","Integrações"]},
    "nuvem-sul":{name:"Nuvem Sul",legal:"Nuvem Sul Serviços Digitais Ltda.",cnpj:"22.333.444/0001-09",segment:"Cloud Computing",size:"Pequena",owner:"Amanda Oliveira",status:"Aprovada",...base,city:"Florianópolis, SC",skills:["AWS","Google Cloud","Azure","DevOps"]},
    horizonte:{name:"Horizonte Dados",legal:"Horizonte Dados e BI Ltda.",cnpj:"66.777.888/0001-42",segment:"Dados / BI",size:"Microempresa",owner:"Rafael Nunes",status:"Aprovada",...base,city:"Chapecó, SC",skills:["Power BI","Python","SQL","ETL/ELT"]},
    "ilha-tech":{name:"Ilha Tech",legal:"Ilha Tech Desenvolvimento Ltda.",cnpj:"88.999.000/0001-77",segment:"Desenvolvimento",size:"Grande",owner:"Beatriz Lima",status:"Inativada",...base,skills:["React","TypeScript","Node.js","Testes Automatizados"]}
  };
  const id = new URLSearchParams(location.search).get("company");
  const company = companies[id] || companies.techcorp;
  const text = (target, value) => { document.getElementById(target).textContent = value; };
  const initials = company.name.split(/\s+/).slice(0, 2).map(word => word[0]).join("").toUpperCase();
  text("detail-initials", initials);
  text("detail-logo-name", company.name);
  text("detail-name", company.name);
  text("detail-legal-name", company.legal);
  text("detail-cnpj", company.cnpj);
  text("detail-segment", company.segment);
  text("detail-size", company.size);
  text("detail-city", company.city);
  text("detail-owner", company.owner);
  text("detail-role", company.role);
  text("detail-email", company.email);
  text("detail-phone", company.phone);
  text("detail-about", company.about);
  text("detail-status", company.status);
  document.title = `${company.name} - ACATE | SCTEC`;

  const status = document.getElementById("detail-status");
  status.classList.toggle("is-inactive", company.status === "Inativada");
  status.classList.toggle("is-pending", company.status.startsWith("Solicitação"));
  status.classList.toggle("is-rejected", company.status === "Recusada");
  const skills = document.getElementById("detail-skills");
  for (const skill of company.skills) {
    const chip = document.createElement("span");
    chip.className = "acate-profile__chip";
    chip.textContent = skill;
    skills.append(chip);
  }
  const channels = document.getElementById("detail-channels");
  for (const channel of company.channels) {
    const row = document.createElement("div");
    row.className = "acate-profile__channel";
    const name = document.createElement("strong");
    name.textContent = channel;
    const description = document.createElement("span");
    description.textContent = channel === "LinkedIn" ? `linkedin.com/company/${id || "techcorp"}` : `carreiras.${id || "techcorp"}.example`;
    row.append(name, description);
    channels.append(row);
  }
})();
