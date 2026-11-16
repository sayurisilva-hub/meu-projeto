function atualizarStatusConexao() {
  const statusEl = document.getElementById('status-conexao');
  if (!statusEl) return;
  
  if (navigator.onLine) {
    statusEl.textContent = '✅ Online';
    statusEl.className = 'status online';
  } else {
    statusEl.textContent = '⚠️ Offline';
    statusEl.className = 'status offline';
  }
}

window.addEventListener('online', atualizarStatusConexao);
window.addEventListener('offline', atualizarStatusConexao);
atualizarStatusConexao();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.log('✅ Service Worker registrado!', reg))
      .catch(err => console.error('❌ Erro no registro do SW:', err));
  });
}

const btnGps = document.getElementById('btn-gps');
const inputCoordenadas = document.getElementById('coordenadas');

if (btnGps) {
  btnGps.addEventListener('click', () => {
    if (!navigator.geolocation) {
      alert('❌ Geolocalização não suportada no navegador');
      return;
    }
    
    btnGps.textContent = '⏳ Obtendo...';
    btnGps.disabled = true;
    
    navigator.geolocation.getCurrentPosition(
      posicao => {
        const lat = posicao.coords.latitude.toFixed(6);
        const lng = posicao.coords.longitude.toFixed(6);
        inputCoordenadas.value = `${lat}, ${lng}`;
        btnGps.textContent = '📍 Localização obtida!';
        btnGps.disabled = false;
      },
      erro => {
        alert('❌ Não foi possível obter localização: ' + erro.message);
        btnGps.textContent = '📍 Usar minha localização';
        btnGps.disabled = false;
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });
}

const inputFoto = document.getElementById('foto');
const previewContainer = document.getElementById('preview-container');
const previewFoto = document.getElementById('preview-foto');

if (inputFoto) {
  inputFoto.addEventListener('change', e => {
    const arquivo = e.target.files[0];
    if (arquivo) {
      const leitor = new FileReader();
      leitor.onload = evento => {
        previewFoto.src = evento.target.result;
        previewContainer.classList.add('visivel');
      };
      leitor.readAsDataURL(arquivo);
    }
  });
}

const formLocal = document.getElementById('form-local');
if (formLocal) {
  formLocal.addEventListener('submit', async e => {
    e.preventDefault();
    
    const nome = document.getElementById('nome').value;
    const descricao = document.getElementById('descricao').value;
    const coordenadas = document.getElementById('coordenadas').value;
    const favorito = document.getElementById('favorito').checked;
    
    let fotoBase64 = '';
    if (inputFoto && inputFoto.files[0]) {
      const leitor = new FileReader();
      await new Promise(resolve => {
        leitor.onload = r => { fotoBase64 = r.target.result; resolve(); };
        leitor.readAsDataURL(inputFoto.files[0]);
      });
    }
    
    const local = {
      nome,
      descricao,
      coordenadas,
      foto: fotoBase64,
      favorito,
      dataCriacao: new Date().toISOString()
    };
    
    await salvarLocal(local);
    formLocal.reset();
    previewContainer.classList.remove('visivel');
    

    if (Notification.permission === 'granted') {
      new Notification('📍 Local Salvo!', {
        body: `${nome} foi adicionado aos seus locais.`,
        icon: 'icons/icon-192.png'
      });
    }
    
    alert('✅ Local salvo com sucesso!');
    window.location.href = 'locais.html';
  });
}


const listaLocais = document.getElementById('lista-locais');
if (listaLocais) 
    
    {async function carregarLocais() {
    const locais = await listarLocais();
    
    if (locais.length === 0) {
      listaLocais.innerHTML = '<p class="vazio">Nenhum local cadastrado ainda.</p>';
      return;
    }
    
    listaLocais.innerHTML = '';
    
    locais.forEach(local => {
      const cartao = document.createElement('div');
      cartao.className = 'cartao';
      
      cartao.innerHTML = `
        <h3>
          ${local.favorito ? '<span class="favorito">⭐</span> ' : ''}
          ${local.nome}
        </h3>
        ${local.foto ? `<img src="${local.foto}" class="foto" alt="Foto de ${local.nome}">` : ''}
        <p>${local.descricao}</p>
        ${local.coordenadas ? `<p><strong>📍 Coordenadas:</strong> ${local.coordenadas}</p>` : ''}
        <p><em>Cadastrado em: ${new Date(local.dataCriacao).toLocaleDateString('pt-BR')}</em></p>
        <button class="btn-pequeno" data-excluir="${local.id}">🗑️ Excluir</button>
      `;
      
      listaLocais.appendChild(cartao);
    });

  
    document.querySelectorAll('[data-excluir]').forEach(btn => {
      btn.addEventListener('click', async e => {
        const id = Number(e.target.dataset.excluir);
        if (confirm('Tem certeza que deseja excluir este local?')) {
          await excluirLocal(id);
          carregarLocais(); 
        }
      });
    });
  }

  carregarLocais();
}

if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
  Notification.requestPermission().then(permissao => {
    if (permissao === 'granted') {
      console.log('🔔 Notificações permitidas');
    }
  });
}
