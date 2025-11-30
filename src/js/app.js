// Login Simples
const loginScreen = document.getElementById('loginScreen');
const app = document.getElementById('app');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
let artists = [];
let events = [];

function resetApp() {
  artists = [];
  renderArtists();
  renderAdmin();
}

loginForm.onsubmit = function(e) {
  e.preventDefault();
  loginScreen.style.display = 'none';
  app.style.display = '';
};

document.getElementById('logoutBtn').onclick = function() {
  app.style.display = 'none';
  loginScreen.style.display = '';
  resetApp();
};

// SPA Navigation
const sections = {
 dashboard : document.getElementById('dashboard'),
 cadastro : document.getElementById('cadastro'),
 listagem : document.getElementById('listagem'),
 admin : document.getElementById('admin'),
 cadastroEvento: document.getElementById('cadastro-evento')
};
const navs = {
 dashboard : document.getElementById('nav-dashboard'),
 cadastro : document.getElementById('nav-cadastro'),
 listagem : document.getElementById('nav-listagem'),
 admin : document.getElementById('nav-admin'),
 cadastroEvento: document.getElementById('nav-cadastro-evento')
};
function showSection(sec) {
 for (let s in sections) sections[s].style.display = 'none';
 for (let n in navs) navs[n].classList.remove('active');
 sections[sec].style.display = '';
 navs[sec].classList.add('active');
}
navs.dashboard.onclick = () => {
    showSection('dashboard');
    renderEventos();
};
navs.cadastro.onclick = () => showSection('cadastro');
navs.listagem.onclick = () => { showSection('listagem'); renderArtists(); };
navs.admin.onclick = () => { showSection('admin'); renderAdmin(); };
navs.cadastroEvento.onclick = () => showSection('cadastroEvento');

// Cadastro de Artistas
const artistForm = document.getElementById('artistForm');
const artistList = document.getElementById('artistList');
const filtroTipo = document.getElementById('filtroTipo');

artistForm.onsubmit = function(e) {
 e.preventDefault();
 const formData = new FormData(artistForm);
 const data = Object.fromEntries(formData.entries());
 // Foto
 const fileInput = artistForm.querySelector('input[name="foto"]');
 if (fileInput.files[0]) {
   const reader = new FileReader();
   reader.onload = function(evt) {
     data.foto = evt.target.result;
     data.status = 'pendente';
     artists.push(data);
     artistForm.reset();
     renderArtists();
     renderAdmin();
   };
   reader.readAsDataURL(fileInput.files[0]);
   return;
 }
 data.status = 'pendente';
 artists.push(data);
 artistForm.reset();
 renderArtists();
 renderAdmin();
};

function renderArtists() {
 if (!artistList) return;
 // Filtro por tipo
 const tipoSelecionado = filtroTipo ? filtroTipo.value : "";
 let filtrados = artists;
 if (tipoSelecionado) {
   filtrados = artists.filter(a => a.tipo === tipoSelecionado);
 }
 if (!filtrados.length) {
   artistList.innerHTML = '<em>Nenhum artista cadastrado.</em>';
   return;
 }
 artistList.innerHTML =
   '<h3>Artistas Cadastrados</h3>' +
   filtrados.map((a,i) => `
     <div class="artist">
       ${a.foto ? `<img src="${a.foto}" alt="Foto de ${a.nome}" class='artist-photo'>` : ''}
       <div style='flex-grow:1'>
       <strong>${a.nome}</strong> (${a.tipo})<br>${a.descricao}<br>
       ${a.portfolio ? `<a href="${a.portfolio}" target="_blank" style="color:#F5A623;">Portfólio</a><br>` : ''}
       Status: ${a.status}
       </div>
       <button class='btn btn-small' onclick='editArtist(${i})'>Editar</button>
     </div>`).join('');
}
if (filtroTipo) filtroTipo.onchange = renderArtists;

function renderAdmin() {
 const adminList = document.getElementById('adminList');
 if (!artists.length) return adminList.innerHTML = '<em>Nenhum artista cadastrado.</em>';
 adminList.innerHTML =
   artists.map((a,i) => `
     <div class='admin-item'>
       ${a.foto ? `<img src="${a.foto}" alt="Foto de ${a.nome}" class='artist-photo'>` : ''}
       <div style='flex-grow:1'>
       <strong>${a.nome}</strong> (${a.tipo})<br>${a.descricao}<br>Status atual:
       <b>${a.status}</b><br></div>
       ${a.status === 'pendente'
         ? `<button class='btn btn-small' onclick='approveArtist(${i})'>Aprovar</button>`
         : ''}
       <button class='btn btn-small' onclick='editArtist(${i})'>Editar</button>
       <button class='btn btn-small' onclick='removeArtist(${i})'>Remover</button></div>`).join('');
}

// Confirmação ao aprovar/remover artista
window.approveArtist = function(i) {
 if (artists[i].status === 'pendente') {
   if (confirm('Deseja realmente aprovar este artista?')) {
     artists[i].status = 'aprovado';
     renderAdmin();
     renderArtists();
   }
 }
};
window.removeArtist = function(i) {
 if (confirm('Deseja realmente remover este artista?')) {
   artists.splice(i,1);
   renderAdmin();
   renderArtists();
 }
};

// Edição de artista via modal
window.editArtist = function(i) {
 const a = artists[i];
 const modal = document.getElementById('editModal');
 const form = document.getElementById('editArtistForm');
 form.idx.value = i;
 form.nome.value = a.nome || '';
 form.tipo.value = a.tipo || '';
 form.descricao.value = a.descricao || '';
 form.portfolio.value = a.portfolio || '';
 // Limpa file input
 form.foto.value = '';
 modal.style.display = 'flex';
};
window.closeEditModal = function() {
 document.getElementById('editModal').style.display = 'none';
};
document.getElementById('editArtistForm').onsubmit = function(e) {
 e.preventDefault();
 const idx = +this.idx.value;
 const a = artists[idx];
 a.nome = this.nome.value;
 a.tipo = this.tipo.value;
 a.descricao = this.descricao.value;
 a.portfolio = this.portfolio.value;
 // Foto
 const fileInput = this.foto;
 if (fileInput.files && fileInput.files[0]) {
   const reader = new FileReader();
   reader.onload = function(evt) {
     a.foto = evt.target.result;
     finishEdit();
   };
   reader.readAsDataURL(fileInput.files[0]);
 } else {
   finishEdit();
 }
 function finishEdit() {
   window.closeEditModal();
   renderArtists();
   renderAdmin();
 }
};

// Cadastro de Eventos
const eventForm = document.getElementById('eventForm');
eventForm.onsubmit = function(e) {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(eventForm));
  data.status = 'pendente';
  events.push(data);
  eventForm.reset();
};

// Renderização dos eventos na Área Administrativa
function renderAdmin() {
  const adminList = document.getElementById('adminList');
  let html = '';

  // Artistas
  if (artists.length) {
    html += '<h3>Artistas</h3>' + artists.map((a,i) => `
      <div class="admin-item">
        <strong>${a.nome}</strong> (${a.tipo})<br>${a.descricao}<br>
        Status atual: <b>${a.status}</b><br>
        ${a.status === 'pendente' ? `<button class="btn btn-small" onclick="approveArtist(${i})">Aprovar</button>` : ''}
        <button class="btn btn-small" onclick="removeArtist(${i})">Remover</button>
      </div>
    `).join('');
  }

  // Eventos
  if (events.length) {
    html += '<h3>Eventos</h3>' + events.map((e,i) => `
      <div class="admin-item">
        <strong>${e.titulo}</strong><br>
        Data: ${e.data}<br>
        Local: ${e.local}<br>
        ${e.descricao}<br>
        Status atual: <b>${e.status}</b><br>
        ${e.status === 'pendente' ? `<button class="btn btn-small" onclick="approveEvent(${i})">Aprovar</button>` : ''}
        <button class="btn btn-small" onclick="removeEvent(${i})">Remover</button>
      </div>
    `).join('');
  }

  if (!artists.length && !events.length) {
    html = '<em>Nenhum artista ou evento cadastrado.</em>';
  }

  adminList.innerHTML = html;
}

function renderEventos() {
  const eventList = document.getElementById('eventList');
  // Mostra apenas eventos aprovados
  const aprovados = events.filter(e => e.status === 'aprovado');
  if (!aprovados.length) {
    eventList.innerHTML = '<em>Nenhum evento programado no momento</em>';
    return;
  }
  eventList.innerHTML = aprovados.map(e => `
    <div class="event">
      <strong>${e.titulo}</strong><br>
      Data: ${e.data}<br>
      Local: ${e.local}<br>
      Descrição: ${e.descricao}
    </div>
  `).join('');
}

window.approveEvent = function(i) {
  events[i].status = 'aprovado';
  renderAdmin();
  renderEventos();
};

window.removeEvent = function(i) {
  events.splice(i,1);
  renderAdmin();
  renderEventos();
};

// --- Sidebar/Responsivo ---
const sidebar = document.getElementById('sidebar');
const openSidebar = document.getElementById('openSidebar');
const closeSidebar = document.getElementById('closeSidebar');

// Abre sidebar
openSidebar.onclick = () => sidebar.classList.add('open');
// Fecha sidebar
closeSidebar.onclick = () => sidebar.classList.remove('open');
// Fecha ao clicar fora
window.addEventListener('click', function(e){
    if(sidebar.classList.contains('open') && !sidebar.contains(e.target) && e.target !== openSidebar){
        sidebar.classList.remove('open');
    }
});

// Sincroniza navegação dos botões do sidebar com os do topnav
const navMap = [
    { main: 'nav-dashboard', side: 'nav-dashboard-sidebar', sec: 'dashboard', cb: () => { showSection('dashboard'); renderEventos(); } },
    { main: 'nav-cadastro', side: 'nav-cadastro-sidebar', sec: 'cadastro', cb: () => showSection('cadastro') },
    { main: 'nav-cadastro-evento', side: 'nav-cadastro-evento-sidebar', sec: 'cadastroEvento', cb: () => showSection('cadastroEvento') },
    { main: 'nav-listagem', side: 'nav-listagem-sidebar', sec: 'listagem', cb: () => { showSection('listagem'); renderArtists(); } },
    { main: 'nav-admin', side: 'nav-admin-sidebar', sec: 'admin', cb: () => { showSection('admin'); renderAdmin(); } }
];

navMap.forEach(({main, side, cb}) => {
    const btnSide = document.getElementById(side);
    if(btnSide) btnSide.onclick = function() {
        cb();
        sidebar.classList.remove('open');
    };
});

showSection('dashboard');
renderEventos();