/* gallery.js — handle image upload, preview, storage (localStorage), and display */
'use strict';

document.addEventListener('DOMContentLoaded', () => {
  // signal to CSS that JS is ready so entrance transitions run smoothly
  try { requestAnimationFrame(()=>{ document.documentElement.classList.add('page-ready'); }); } catch(e) { document.documentElement.classList.add('page-ready'); }

  // Cross-page fade: intercept internal link clicks and fade out before navigation
  (function setupCrossPageFade(){
    document.addEventListener('click', (e) => {
      if (e.defaultPrevented) return;
      if (e.button !== 0) return; // only left clicks
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return; // allow open-in-new-tab
      const a = e.target.closest('a');
      if (!a) return;
      const href = a.getAttribute('href');
      if (!href) return;
      if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('http') || href.startsWith('https') || href.startsWith('javascript:')) return;
      if (a.target === '_blank') return;
      e.preventDefault();
      document.documentElement.classList.add('page-exit');
      setTimeout(() => { window.location.href = href; }, 380);
    }, { capture: true });
  })();
  const FILE_KEY = 'fatima_memory_images_v1';
  const fileInput = document.getElementById('file-input');
  const captionInput = document.getElementById('caption-input');
  const dateInput = document.getElementById('photo-date');
  const previewArea = document.getElementById('preview-area');
  const saveBtn = document.getElementById('save-photos');
  const clearBtn = document.getElementById('clear-photos');
  const galleryGrid = document.getElementById('gallery-grid');
  const lightbox = document.getElementById('lightbox');
  const lbImage = document.getElementById('lb-image');
  const lbCaption = document.getElementById('lb-caption');
  const lbClose = document.getElementById('lb-close');

  /* IndexedDB storage helpers */
  const DB_NAME = 'fatima_gallery_db';
  const DB_VERSION = 1;
  const DB_STORE = 'images';

  function openDB(){
    return new Promise((res, rej) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(DB_STORE)) db.createObjectStore(DB_STORE, { keyPath: 'id' });
      };
      req.onsuccess = () => res(req.result);
      req.onerror = () => rej(req.error);
    });
  }

  async function getAllImages(){
    const db = await openDB();
    return new Promise((res, rej)=>{
      const tx = db.transaction(DB_STORE, 'readonly');
      const store = tx.objectStore(DB_STORE);
      const r = store.getAll();
      r.onsuccess = () => res(r.result);
      r.onerror = () => rej(r.error);
    });
  }

  async function addImages(items){
    if (!items || !items.length) return;
    const db = await openDB();
    return new Promise((res, rej)=>{
      const tx = db.transaction(DB_STORE, 'readwrite');
      const store = tx.objectStore(DB_STORE);
      for (const it of items) store.put(it);
      tx.oncomplete = () => res();
      tx.onerror = () => rej(tx.error);
    });
  }

  async function deleteImageById(id){
    const db = await openDB();
    return new Promise((res, rej)=>{
      const tx = db.transaction(DB_STORE, 'readwrite');
      const store = tx.objectStore(DB_STORE);
      const r = store.delete(id);
      r.onsuccess = () => res();
      r.onerror = () => rej(r.error);
    });
  }

  async function clearAllImages(){
    const db = await openDB();
    return new Promise((res, rej)=>{
      const tx = db.transaction(DB_STORE, 'readwrite');
      const store = tx.objectStore(DB_STORE);
      const r = store.clear();
      r.onsuccess = () => res();
      r.onerror = () => rej(r.error);
    });
  }

  // migrate any images stored in localStorage to IndexedDB (one-time)
  async function migrateLocalStorageToIndexedDB(){
    try{
      const s = localStorage.getItem(FILE_KEY);
      if (!s) return;
      const arr = JSON.parse(s);
      if (Array.isArray(arr) && arr.length){
        await addImages(arr);
        localStorage.removeItem(FILE_KEY);
      }
    }catch(e){ /* ignore */ }
  }

  async function renderGallery() {
    const items = await getAllImages();
    galleryGrid.innerHTML = '';
    if (!items.length) {
      galleryGrid.innerHTML = '<p class="muted">No photos yet. Upload some memories.</p>';
      return;
    }
    items.forEach(item => {
      const card = document.createElement('div');
      card.className = 'gallery-item';
      card.innerHTML = `
        <div class="thumb-wrap">
          <img src="${item.data}" alt="${escapeHtml(item.caption||'')}">
        </div>
        <div class="meta">
          <div class="cap">${escapeHtml(item.caption||'')}</div>
          <div class="date">${escapeHtml(item.date||'')}</div>
          <div class="actions">
            <button class="btn btn-ghost view" data-id="${item.id}">View</button>
            <button class="btn btn-ghost remove" data-id="${item.id}">Delete</button>
          </div>
        </div>`;
      galleryGrid.appendChild(card);
    });
  }

  function escapeHtml(s) { return String(s).replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;','\'':'&#39;'}[ch]||ch)); }

  // preview selected files
  fileInput.addEventListener('change', () => {
    previewArea.innerHTML = '';
    const files = Array.from(fileInput.files || []);
    files.forEach((file, i) => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = e => {
        const div = document.createElement('div');
        div.className = 'preview-item';
        div.innerHTML = `<img src="${e.target.result}" alt="preview"><div class="preview-meta"><small>${escapeHtml(file.name)}</small></div>`;
        previewArea.appendChild(div);
      };
      reader.readAsDataURL(file);
    });
  });

  // save selected images (now uses IndexedDB)
  saveBtn.addEventListener('click', async () => {
    const files = Array.from(fileInput.files || []);
    if (!files.length) return alert('Pick one or more image files to upload.');
    const caption = (captionInput.value || '').trim();
    const date = dateInput.value || '';
    const itemsToAdd = [];
    for (const file of files) {
      if (!file.type.startsWith('image/')) continue;
      const dataUrl = await readFileAsDataURL(file);
      itemsToAdd.push({ id: Date.now().toString(36) + Math.random().toString(36).slice(2,6), data: dataUrl, caption, date, createdAt: Date.now() });
    }
    try{
      await addImages(itemsToAdd);
      fileInput.value = '';
      captionInput.value = '';
      dateInput.value = '';
      previewArea.innerHTML = '';
      await renderGallery();
      alert('Photos saved to gallery');
    }catch(e){ console.error(e); alert('Failed to save photos'); }
  });

  clearBtn.addEventListener('click', async () => {
    if (!confirm('Delete all saved photos?')) return;
    try{ await clearAllImages(); await renderGallery(); }catch(e){ console.error(e); alert('Failed to clear photos'); }
  });



  // delegation for view/delete (now works with IndexedDB)
  galleryGrid.addEventListener('click', async (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    const id = btn.dataset.id;
    if (btn.classList.contains('view')) {
      try{
        const items = await getAllImages();
        const item = items.find(i=>i.id===id);
        if (item) { lbImage.src = item.data; lbCaption.textContent = item.caption || ''; lightbox.classList.remove('hidden'); }
      }catch(e){ console.error(e); }
    } else if (btn.classList.contains('remove')) {
      if (!confirm('Delete this photo?')) return;
      try{ await deleteImageById(id); await renderGallery(); }catch(e){ console.error(e); alert('Failed to delete photo'); }
    }
  });

  lbClose.addEventListener('click', () => { lightbox.classList.add('hidden'); lbImage.src = ''; });
  lightbox.addEventListener('click', (e)=>{ if (e.target === lightbox) { lightbox.classList.add('hidden'); lbImage.src=''; }});

  function readFileAsDataURL(file){
    return new Promise((res, rej)=>{ const r = new FileReader(); r.onload = ()=>res(r.result); r.onerror = rej; r.readAsDataURL(file); });
  }

  // migrate any old localStorage images into IndexedDB, then render
  migrateLocalStorageToIndexedDB().then(()=>renderGallery()).catch(()=>renderGallery());
});