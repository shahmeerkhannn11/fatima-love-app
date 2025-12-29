// Firebase setup
const firebaseConfig = {
  apiKey: "AIzaSyAVWzwX7kOSSfEBrHjdAB7kGaKEusQwuTA",
  authDomain: "loveapp-4d848.firebaseapp.com",
  databaseURL: "https://loveapp-4d848-default-rtdb.firebaseio.com",
  projectId: "loveapp-4d848",
  storageBucket: "loveapp-4d848.appspot.com",
  messagingSenderId: "106357915882",
  appId: "1:106357915882:web:ec0ce212cfddbb89d31793",
  measurementId: "G-7QY4D3D8V1"
};
if (typeof firebase !== 'undefined') {
  firebase.initializeApp(firebaseConfig);
  var storage = firebase.storage();
  var database = firebase.database();
}

document.addEventListener('DOMContentLoaded', () => {
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

  function escapeHtml(s) {
    return String(s).replace(/[&<>'"]/g, ch => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[ch] || ch));
  }

  async function renderGallery() {
    galleryGrid.innerHTML = '';
    try {
      const snapshot = await database.ref('gallery').once('value');
      const items = snapshot.val() ? Object.values(snapshot.val()) : [];
      if (!items.length) {
        galleryGrid.innerHTML = '<p class="muted">No photos yet. Upload some memories.</p>';
        return;
      }
      items.forEach(item => {
        const card = document.createElement('div');
        card.className = 'gallery-item';
        card.innerHTML = `
          <div class="thumb-wrap">
            <img src="${item.url}" alt="${escapeHtml(item.caption || '')}">
          </div>
          <div class="meta">
            <div class="cap">${escapeHtml(item.caption || '')}</div>
            <div class="date">${escapeHtml(item.date || '')}</div>
            <div class="actions">
              <button class="btn btn-ghost view" data-id="${item.id}">View</button>
              <button class="btn btn-ghost remove" data-id="${item.id}">Delete</button>
            </div>
          </div>`;
        galleryGrid.appendChild(card);
      });
    } catch (e) {
      galleryGrid.innerHTML = '<p class="muted">Failed to load gallery.</p>';
      console.error(e);
    }
  }

  fileInput.addEventListener('change', () => {
    previewArea.innerHTML = '';
    const files = Array.from(fileInput.files || []);
    files.forEach(file => {
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

  saveBtn.addEventListener('click', async () => {
    const files = Array.from(fileInput.files || []);
    if (!files.length) return alert('Pick one or more image files to upload.');
    const caption = (captionInput.value || '').trim();
    const date = dateInput.value || '';
    for (const file of files) {
      if (!file.type.startsWith('image/')) continue;
      const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      const storageRef = storage.ref('gallery/' + id + '_' + file.name);
      try {
        const snapshot = await storageRef.put(file);
        const downloadURL = await snapshot.ref.getDownloadURL();
        await database.ref('gallery/' + id).set({
          id,
          url: downloadURL,
          caption,
          date,
          createdAt: Date.now()
        });
      } catch (e) {
        console.error(e);
        alert('Failed to upload photo: ' + file.name);
      }
    }
    fileInput.value = '';
    captionInput.value = '';
    dateInput.value = '';
    previewArea.innerHTML = '';
    await renderGallery();
    alert('Photos saved to gallery');
  });

  clearBtn.addEventListener('click', async () => {
    if (!confirm('Delete all saved photos?')) return;
    try {
      await database.ref('gallery').remove();
      await renderGallery();
    } catch (e) {
      console.error(e);
      alert('Failed to clear photos');
    }
  });

  galleryGrid.addEventListener('click', async (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    const id = btn.dataset.id;
    if (btn.classList.contains('view')) {
      try {
        const snapshot = await database.ref('gallery/' + id).once('value');
        const item = snapshot.val();
        if (item) {
          lbImage.src = item.url;
          lbCaption.textContent = item.caption || '';
          lightbox.classList.remove('hidden');
        }
      } catch (e) { console.error(e); }
    } else if (btn.classList.contains('remove')) {
      if (!confirm('Delete this photo?')) return;
      try {
        await database.ref('gallery/' + id).remove();
        await renderGallery();
      } catch (e) { console.error(e); alert('Failed to delete photo'); }
    }
  });

  lbClose.addEventListener('click', () => { lightbox.classList.add('hidden'); lbImage.src = ''; });
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) { lightbox.classList.add('hidden'); lbImage.src = ''; } });

  renderGallery();
});
// Firebase setup
const firebaseConfig = {
  apiKey: "AIzaSyAVWzwX7kOSSfEBrHjdAB7kGaKEusQwuTA",
  authDomain: "loveapp-4d848.firebaseapp.com",
  databaseURL: "https://loveapp-4d848-default-rtdb.firebaseio.com",
  projectId: "loveapp-4d848",
  storageBucket: "loveapp-4d848.appspot.com",
  messagingSenderId: "106357915882",
  appId: "1:106357915882:web:ec0ce212cfddbb89d31793",
  measurementId: "G-7QY4D3D8V1"
};
if (typeof firebase !== 'undefined') {
  firebase.initializeApp(firebaseConfig);
  var storage = firebase.storage();
  var database = firebase.database();
}

document.addEventListener('DOMContentLoaded', () => {
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

  function escapeHtml(s) {
    return String(s).replace(/[&<>'"]/g, ch => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[ch] || ch));
  }

  async function renderGallery() {
    galleryGrid.innerHTML = '';
    try {
      const snapshot = await database.ref('gallery').once('value');
      const items = snapshot.val() ? Object.values(snapshot.val()) : [];
      if (!items.length) {
        galleryGrid.innerHTML = '<p class="muted">No photos yet. Upload some memories.</p>';
        return;
      }
      items.forEach(item => {
        const card = document.createElement('div');
        card.className = 'gallery-item';
        card.innerHTML = `
          <div class="thumb-wrap">
            <img src="${item.url}" alt="${escapeHtml(item.caption || '')}">
          </div>
          <div class="meta">
            <div class="cap">${escapeHtml(item.caption || '')}</div>
            <div class="date">${escapeHtml(item.date || '')}</div>
            <div class="actions">
              <button class="btn btn-ghost view" data-id="${item.id}">View</button>
              <button class="btn btn-ghost remove" data-id="${item.id}">Delete</button>
            </div>
          </div>`;
        galleryGrid.appendChild(card);
      });
    } catch (e) {
      galleryGrid.innerHTML = '<p class="muted">Failed to load gallery.</p>';
      console.error(e);
    }
  }

  fileInput.addEventListener('change', () => {
    previewArea.innerHTML = '';
    const files = Array.from(fileInput.files || []);
    files.forEach(file => {
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

  saveBtn.addEventListener('click', async () => {
    const files = Array.from(fileInput.files || []);
    if (!files.length) return alert('Pick one or more image files to upload.');
    const caption = (captionInput.value || '').trim();
    const date = dateInput.value || '';
    for (const file of files) {
      if (!file.type.startsWith('image/')) continue;
      const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      const storageRef = storage.ref('gallery/' + id + '_' + file.name);
      try {
        const snapshot = await storageRef.put(file);
        const downloadURL = await snapshot.ref.getDownloadURL();
        await database.ref('gallery/' + id).set({
          id,
          url: downloadURL,
          caption,
          date,
          createdAt: Date.now()
        });
      } catch (e) {
        console.error(e);
        alert('Failed to upload photo: ' + file.name);
      }
    }
    fileInput.value = '';
    captionInput.value = '';
    dateInput.value = '';
    previewArea.innerHTML = '';
    await renderGallery();
    alert('Photos saved to gallery');
  });

  clearBtn.addEventListener('click', async () => {
    if (!confirm('Delete all saved photos?')) return;
    try {
      await database.ref('gallery').remove();
      await renderGallery();
    } catch (e) {
      console.error(e);
      alert('Failed to clear photos');
    }
  });

  galleryGrid.addEventListener('click', async (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    const id = btn.dataset.id;
    if (btn.classList.contains('view')) {
      try {
        const snapshot = await database.ref('gallery/' + id).once('value');
        const item = snapshot.val();
        if (item) {
          lbImage.src = item.url;
          lbCaption.textContent = item.caption || '';
          lightbox.classList.remove('hidden');
        }
      } catch (e) { console.error(e); }
    } else if (btn.classList.contains('remove')) {
      if (!confirm('Delete this photo?')) return;
      try {
        await database.ref('gallery/' + id).remove();
        await renderGallery();
      } catch (e) { console.error(e); alert('Failed to delete photo'); }
    }
  });

  lbClose.addEventListener('click', () => { lightbox.classList.add('hidden'); lbImage.src = ''; });
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) { lightbox.classList.add('hidden'); lbImage.src = ''; } });

  renderGallery();
});