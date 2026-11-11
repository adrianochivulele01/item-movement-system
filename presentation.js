// Presentation only; never grants permissions or changes user records.
(()=>{
 const dict={
 'Language':['Idioma','語言'],'Logistics':['Logística','物流'],'Warehouse':['Armazém','倉庫'],
 'Item Movement':['Movimento de Artigos','物品異動'],
 'A clear view of every item, every movement.':['Uma visão clara de cada artigo e movimento.','清楚掌握每件物品與每次異動。'],
 'Back to logistics':['Voltar à logística','返回物流'],
 'Total Items':['Total de artigos','品項總數'],'Total Movements':['Total de movimentos','異動總數'],
 'Add New Item':['Adicionar artigo','新增品項'],'Item Name:':['Nome do artigo:','品項名稱：'],'Add Item':['Adicionar artigo','新增品項'],
 'Record Movement':['Registar movimento','登記異動'],'Select Item:':['Selecionar artigo:','選擇品項：'],'Movement Type:':['Tipo de movimento:','異動類型：'],
 'Quantity:':['Quantidade:','數量：'],'Save Movement':['Guardar movimento','儲存異動'],
 'Current Stock Balance':['Saldo atual de stock','目前庫存餘額'],'Item Name':['Nome do artigo','品項名稱'],'Current Stock':['Stock atual','目前庫存'],
 'Recent Movements History':['Histórico de movimentos','異動紀錄'],'Date':['Data','日期'],'Item':['Artigo','品項'],'Type':['Tipo','類型'],'Qty':['Qtd.','數量'],'Action':['Ação','操作'],
 'Access Management (Administrator Only)':['Gestão de acessos (apenas administradores)','存取管理（僅限管理員）'],
 'User Email:':['Email do utilizador:','使用者電子郵件：'],'Role:':['Função:','角色：'],'Assign Role':['Atribuir função','指派角色'],
 'Accounts with Roles':['Contas e funções','帳號與角色'],'Role History':['Histórico de funções','角色歷程'],'Email':['Email','電子郵件'],'Role':['Função','角色'],
 'Viewer (Level 1)':['Consulta (Nível 1)','檢視者（第1級）'],'Operator (Level 2)':['Operador (Nível 2)','操作員（第2級）'],
 'Manager (Level 3)':['Gestor (Nível 3)','主管（第3級）'],'Administrator (Level 4)':['Administrador (Nível 4)','管理員（第4級）'],
 'Connecting your workspace':['A ligar à tua área','正在連接工作區'],'Use your Portal session to open the warehouse.':['Usa a tua sessão do Portal para abrir o armazém.','使用入口平台工作階段開啟倉庫。'],
 'Open from Portal →':['Abrir pelo Portal →','從入口平台開啟 →']};
 const read=(k,d)=>{try{return localStorage.getItem(k)||d}catch{return d}},save=(k,v)=>{try{localStorage.setItem(k,v)}catch{}};
 let lang=read('tcms-language','en');if(!['en','pt','zh-Hant'].includes(lang))lang='en';
 let theme=read('tcms-theme','light');const picker=document.querySelector('#language'),toggle=document.querySelector('#theme-toggle');
 function appearance(){document.documentElement.dataset.theme=theme==='dark'||theme==='system'&&matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light';toggle.setAttribute('aria-pressed',String(document.documentElement.dataset.theme==='dark'))}
 const originals=new WeakMap();
 function translate(){document.documentElement.lang=lang;picker.value=lang;const walk=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let n;while(n=walk.nextNode()){if(n.parentElement.closest('script,style,tbody,#auth-message,#user-role-display,input,textarea'))continue;const current=n.nodeValue.trim();const source=originals.get(n)||current;if(!dict[source])continue;originals.set(n,source);n.nodeValue=lang==='en'?source:dict[source][lang==='pt'?0:1]}}
 picker.addEventListener('change',()=>{lang=picker.value;save('tcms-language',lang);translate()});toggle.addEventListener('click',()=>{theme=document.documentElement.dataset.theme==='dark'?'light':'dark';save('tcms-theme',theme);appearance()});appearance();translate();
 // Associate unchanged original labels with their controls for keyboard and screen readers.
 for(const label of document.querySelectorAll('form label')){const field=label.nextElementSibling;if(field?.id&&/^(INPUT|SELECT)$/.test(field.tagName))label.htmlFor=field.id;}
})();
