/*
 * script.js — Improved and robust version
 * Features:
 * - Countdown timer (handles past dates)
 * - Rotating love quotes
 * - Memory timeline persisted in localStorage
 * - Optional form support to add memories (`#add-memory-form` with inputs named `date` and `event`)
 */
'use strict';

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
    var database = firebase.database();
}

document.addEventListener('DOMContentLoaded', () => {
  // trigger CSS entrance once JS is running to avoid initial flicker
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
      // ignore external links, anchors, mailto, tel, js
      if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('http') || href.startsWith('https') || href.startsWith('javascript:')) return;
      if (a.target === '_blank') return;
      e.preventDefault();
      document.documentElement.classList.add('page-exit');
      // length should match CSS transition (360ms)
      setTimeout(() => { window.location.href = href; }, 380);
    }, { capture: true });
  })();
    // === Configuration ===
    // Default countdown target and storage handling
  const COUNTDOWN_TARGET_DEFAULT = '2026-07-12T00:00:00';
  const STORAGE_COUNTDOWN_KEY = 'fatima_countdown_target';
    // Load countdown from Firebase
    let countdownTargetISO = COUNTDOWN_TARGET_DEFAULT;
    let countdownTargetTime = new Date(countdownTargetISO).getTime();
    async function loadCountdownFromFirebase() {
        try {
            const snapshot = await database.ref('countdown').once('value');
            const val = snapshot.val();
            if (val && val.iso) {
                countdownTargetISO = val.iso;
                countdownTargetTime = new Date(countdownTargetISO).getTime();
                if (val.label) countdownLabel = val.label;
                updateCountdown();
            }
        } catch (e) { updateCountdown(); }
    }
    loadCountdownFromFirebase();
    function setCountdownTargetFromISO(iso) {
        try {
            localStorage.setItem(STORAGE_COUNTDOWN_KEY, iso);
            database.ref('countdown/iso').set(iso);
        } catch (e) {}
        countdownTargetISO = iso;
        countdownTargetTime = new Date(iso).getTime();
        updateCountdown();
    }
    // === Elements ===
        const countdownDisplayEl = document.getElementById('countdown-display');
        const countdownHeadingEl = document.getElementById('countdown-heading');
        const quotesTextEl = document.getElementById('quotes-text');
        const timelineContentEl = document.getElementById('timeline-content');
        const addForm = document.getElementById('add-memory-form'); // optional
        const clearBtn = document.getElementById('clear-memories');
        // Countdown label persistence
        const STORAGE_COUNTDOWN_LABEL_KEY = 'fatima_countdown_label';
        function getStoredCountdownLabel() { try { return localStorage.getItem(STORAGE_COUNTDOWN_LABEL_KEY) || 'Days until Nikkah'; } catch (e) { return 'Days until Nikkah'; } }
        let countdownLabel = getStoredCountdownLabel();
                function setCountdownLabel(label) {
                    try {
                        localStorage.setItem(STORAGE_COUNTDOWN_LABEL_KEY, label);
                        database.ref('countdown/label').set(label);
                    } catch (e) {}
                    countdownLabel = label;
                    updateCountdown();
                }

    // === Countdown ===
    function pad(n) { return String(n).padStart(2, '0'); }



    function updateCountdown() {
        if (!countdownDisplayEl) return;
        // ensure heading shows the current label
        if (countdownHeadingEl) countdownHeadingEl.textContent = countdownLabel;

        const now = Date.now();
        const diff = countdownTargetTime - now;

        if (isNaN(countdownTargetTime)) {
            countdownDisplayEl.innerHTML = '<strong>Invalid date</strong>';
            return;
        }

        if (diff <= 0) {
            countdownDisplayEl.innerHTML = `<strong>EXPIRED</strong>`;
            return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        countdownDisplayEl.innerHTML = `<div class="countdown-value"><strong>${days}d ${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s</strong></div>`;
    }

    updateCountdown();
    setInterval(updateCountdown, 1000);

    // === Quotes ===
    const quotes = [
        "You're the love of my life.",
        "Every moment with you is a blessing.",
        "You're my forever and always.",
        "I love you to the moon and back.",
        "You are my sun, my moon, and all my stars.",
        "With you, every day is special.",
        "My heart is, and always will be, yours.",
        "You make my heart smile.",
        "I fall in love with you more every day.",
        "You are my favorite hello and hardest goodbye.",
        "Home is wherever I'm with you.",
        "Your love is my greatest treasure.",
        "I found my forever in you.",
        "You are the best part of my life.",
        "I choose you. And I'll choose you over and over.",
        "Your smile is my favorite thing.",
        "I love the way you make me feel.",
        "Being with you feels like a dream I never want to wake from.",
        "You are my always and my everything.",
        "Thank you for being my person.",
        "You are the poem I never knew how to write.",
        "I love you more than words can say.",
        "In you, I've found the love of my life and my closest friend.",
        "Every love story is beautiful, but ours is my favorite.",
        "You are my heart's compass.",
        "I am yours, you are mine, always and forever.",
        "Your love completes me.",
        "I love you not only for what you are, but for what I am when I am with you.",
        "You're the reason I believe in love.",
        "My love for you is a journey; starting at forever, and ending at never.",
        "You are the beat of my heart.",
        "Together is my favorite place to be.",
        "I want all of my lasts to be with you.",
        "You are the love that came without warning; you had my heart before I could say no.",
        "Your love is the light that brightens my darkest days.",
        "I knew I loved you before I met you.",
        "You are the calm in my chaos.",
        "I still fall for you every single day.",
        "Your love is the song my heart loves to sing.",
        "Loving you is my favorite thing to do.",
        "You are my sweetest hello and my hardest goodbye.",
        "I carry your heart with me (I carry it in my heart).",
        "You are my greatest adventure.",
        "My heart is perfect because you are inside.",
        "Every time I see you, I fall in love all over again.",
        "You make my world a better place.",
        "You're my once in a lifetime.",
        "I love you more than yesterday and less than tomorrow.",
        "Your love is the magic that makes life beautiful.",
        "To the moon, to the stars, to you — always.",
        "You are the reason I smile a little brighter.",
        "With you, I am home.",
        "I adore you, cherish you, and love you endlessly."
    ];

    function showQuote() {
        if (!quotesTextEl) return;
        // fade out, change, then fade in
        quotesTextEl.classList.add('fade-out');
        setTimeout(() => {
            const q = quotes[Math.floor(Math.random() * quotes.length)];
            quotesTextEl.textContent = q;
            quotesTextEl.classList.remove('fade-out');
        }, 360);
    }

    showQuote();
    setInterval(showQuote, 5000); // change every 5 seconds

    // === Memory timeline (persisted) ===
    const STORAGE_KEY = 'fatima_memories_v1';
    let memories = [
        { date: '12 JULY 2025', event: 'NIKKAH DAY' },
    ];

        // Load memories from Firebase
        async function loadMemoriesFromFirebase() {
            try {
                const snapshot = await database.ref('memories').once('value');
                const val = snapshot.val();
                if (val) memories = val;
                renderTimeline();
            } catch (e) { renderTimeline(); }
        }
        loadMemoriesFromFirebase();

        function saveMemories() {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(memories));
                database.ref('memories').set(memories);
            } catch (e) {}
        }

    function escapeHtml(str) {
        return String(str).replace(/[&<>'"]/g, ch => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
        })[ch]);
    }

    function renderTimeline() {
        if (!timelineContentEl) return;
        timelineContentEl.innerHTML = '';
        memories.forEach((m, idx) => {
            const div = document.createElement('div');
            div.className = 'memory';
            div.innerHTML = `<strong>${escapeHtml(m.date)}</strong><div class="memory-event">${escapeHtml(m.event)}</div>`;
            timelineContentEl.appendChild(div);
        });
    }

    renderTimeline();

    if (addForm) {
        addForm.addEventListener('submit', e => {
            e.preventDefault();
            const dateInput = addForm.querySelector('[name="date"]');
            const eventInput = addForm.querySelector('[name="event"]');
            const date = dateInput ? dateInput.value.trim() : '';
            const event = eventInput ? eventInput.value.trim() : '';
            if (!date || !event) return alert('Please enter both date and event');
            memories.push({ date, event });
            saveMemories();
            renderTimeline();
            addForm.reset();
        });
    }

    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            if (!confirm('Clear all saved memories?')) return;
            memories = [];
            saveMemories();
            renderTimeline();
        });
    }

    // === Countdown edit UI ===
    const editCountdownBtn = document.getElementById('edit-countdown');
    const countdownForm = document.getElementById('countdown-form');
    const countdownLabelInput = countdownForm ? countdownForm.querySelector('[name="countdown-label"]') : null;
    const countdownDateInput = countdownForm ? countdownForm.querySelector('[name="countdown-date"]') : null;
    const countdownTimeInput = countdownForm ? countdownForm.querySelector('[name="countdown-time"]') : null;
    const cancelCountdownBtn = document.getElementById('cancel-countdown');

    function showCountdownForm() {
        if (!countdownForm || !countdownDateInput || !countdownTimeInput) return;
        const d = new Date(countdownTargetISO);
        // set inputs to local date/time and label
        countdownDateInput.value = d.toISOString().slice(0,10);
        countdownTimeInput.value = d.toTimeString().slice(0,5);
        if (countdownLabelInput) countdownLabelInput.value = countdownLabel || '';
        countdownForm.classList.remove('hidden');
    }

    function hideCountdownForm() { if (countdownForm) countdownForm.classList.add('hidden'); }

    if (editCountdownBtn) editCountdownBtn.addEventListener('click', showCountdownForm);
    if (cancelCountdownBtn) cancelCountdownBtn.addEventListener('click', hideCountdownForm);

    if (countdownForm) {
        countdownForm.addEventListener('submit', e => {
            e.preventDefault();
                const date = countdownDateInput ? countdownDateInput.value : '';
            const time = countdownTimeInput ? countdownTimeInput.value : '';
            const label = countdownLabelInput ? (countdownLabelInput.value || '').trim() : '';
            if (!date || !time) { alert('Please select both date and time'); return; }
            const iso = new Date(`${date}T${time}`).toISOString();
            setCountdownTargetFromISO(iso);
            if (label) setCountdownLabel(label);
            hideCountdownForm();
        });
    }
});
