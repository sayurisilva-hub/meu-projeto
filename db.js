function promessa(pedido) {
  return new Promise((resolve, reject) => {
    pedido.onsuccess = () => resolve(pedido.result);
    pedido.onerror = () => reject(pedido.error);
  });
}


function abrirBanco() {
  const pedido = indexedDB.open('guia-turisticos', 1);
  
  pedido.onupgradeneeded = evento => {
    const db = evento.target.result;
    const store = db.createObjectStore('locais', {
      keyPath: 'id',
      autoIncrement: true
    });
    store.createIndex('nome', 'nome', { unique: false });
  };
  
  return promessa(pedido);
}


async function listarLocais() {
  const db = await abrirBanco();
  const tx = db.transaction('locais', 'readonly');
  const store = tx.objectStore('locais');
  return promessa(store.getAll());
}

async function salvarLocal(local) {
  const db = await abrirBanco();
  const tx = db.transaction('locais', 'readwrite');
  const store = tx.objectStore('locais');
  return promessa(store.put(local));
}

async function excluirLocal(id) {
  const db = await abrirBanco();
  const tx = db.transaction('locais', 'readwrite');
  const store = tx.objectStore('locais');
  return promessa(store.delete(id));
}
