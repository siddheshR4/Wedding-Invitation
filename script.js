/* =========================================================
   Shrutika & Somesh - Wedding Invitation (v3)
   1. Curtain opening
   2. Top menu
   3. Hide sections whose photos are missing
   4. Scroll fade-in
   5. Countdown
   6. Route planner and wishes
   7. Event info popups
   8. Background music
   ========================================================= */

/* ---------- SETTINGS YOU CAN EDIT ---------- */
// The countdown counts down to this moment (India time, +05:30).
const WEDDING_TIME = "2027-02-10T11:45:00+05:30";

// Wishes open WhatsApp with the message ready to send.
// Put a number here (country code first, digits only, e.g. "919876543210")
// to send them to one person. Leave it empty and the guest picks a chat.
const WHATSAPP_NUMBER = "919011125472";

// Where the route planner sends people.
const DESTINATION = "Matoshri Lawns Akole";
/* ------------------------------------------- */

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- 1. Curtain opening ---------- */
const screenEl = document.getElementById("curtain-screen");
const tassel = document.getElementById("tassel");
let opened = false;
let dragging = false;
let moved = false;
let startY = 0;
let pull = 0;                                   // how far the tassel is pulled, in px
let revealStarted = false;

const PULL_MAX = 150;                           // pull this far and the curtains are fully open

function startReveal() {
  if (revealStarted) return;
  revealStarted = true;
  document.body.classList.add("revealed");      // names rise in on the first page
}

function setPull(px) {
  pull = Math.max(0, Math.min(PULL_MAX, px));
  const p = pull / PULL_MAX;
  screenEl.style.setProperty("--dy", pull + "px");
  screenEl.style.setProperty("--p", p.toFixed(3));
  if (p > 0.5) startReveal();
}

function openCurtain() {
  if (opened) return;
  opened = true;
  startMusic();                                 // make sure the song is playing
  screenEl.classList.remove("dragging");
  screenEl.classList.add("opened");

  const slow = reduceMotion ? 0.01 : 2.2;
  screenEl.style.setProperty("--dur", slow + "s");
  setPull(PULL_MAX);                            // curtains glide apart

  setTimeout(startReveal, reduceMotion ? 0 : 900);
  setTimeout(() => {
    screenEl.classList.add("hide");             // fade away the gathered curtains
    document.body.classList.remove("locked");
    window.scrollTo(0, 0);
  }, reduceMotion ? 0 : slow * 1000 + 100);
  setTimeout(() => { screenEl.style.display = "none"; }, reduceMotion ? 50 : slow * 1000 + 1200);
}

/* drag the tassel down */
tassel.addEventListener("pointerdown", (event) => {
  if (opened) return;
  startMusic();                                 // song starts the moment the tassel is touched
  dragging = true;
  moved = false;
  startY = event.clientY - pull;
  tassel.setPointerCapture(event.pointerId);
  screenEl.classList.add("dragging");
  event.preventDefault();
});

tassel.addEventListener("pointermove", (event) => {
  if (!dragging) return;
  const dy = event.clientY - startY;
  if (Math.abs(dy) > 6) moved = true;
  setPull(dy);
});

function endDrag() {
  if (!dragging) return;
  dragging = false;
  screenEl.classList.remove("dragging");
  if (!moved || pull / PULL_MAX > 0.4) {
    openCurtain();                              // a tap, or a good pull, opens it
  } else {
    screenEl.style.setProperty("--dur", "0.6s");   // not far enough: it swings back
    setPull(0);
  }
}
tassel.addEventListener("pointerup", endDrag);
tassel.addEventListener("pointercancel", endDrag);

/* keyboard: Enter or Space opens it too */
tassel.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    openCurtain();
  }
});

/* ---------- 2. Top menu ---------- */
const topbar = document.getElementById("topbar");
const menuBtn = document.getElementById("menu-btn");

menuBtn.addEventListener("click", () => {
  const isOpen = topbar.classList.toggle("open");
  menuBtn.setAttribute("aria-expanded", String(isOpen));
});
document.querySelectorAll("#nav a").forEach((link) => {
  link.addEventListener("click", () => {
    topbar.classList.remove("open");
    menuBtn.setAttribute("aria-expanded", "false");
  });
});

/* ---------- 3. Hide sections whose photos are missing ---------- */
function tidyPhotos() {
  // A section marked data-needs-photo disappears if no photos are left in it.
  document.querySelectorAll("[data-needs-photo]").forEach((section) => {
    if (!section.querySelector("figure.photo")) {
      const id = section.id;
      section.remove();
      // also remove its menu link
      document.querySelectorAll('#nav a[data-target="' + id + '"]').forEach((a) => a.remove());
    }
  });

  // Venue without a photo: centre the text above the map.
  const venueGrid = document.querySelector(".venue-grid");
  if (venueGrid && !venueGrid.querySelector("#venue-photo")) venueGrid.classList.add("no-photo");
}
window.addEventListener("load", tidyPhotos);
setTimeout(tidyPhotos, 2500);   // backup in case "load" is slow

/* ---------- 4. Scroll fade-in ---------- */
function watchReveals() {
  const items = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    items.forEach((item) => observer.observe(item));
  } else {
    items.forEach((item) => item.classList.add("visible"));
  }
}
watchReveals();

/* ---------- 5. Countdown ---------- */
const cd = {
  days: document.getElementById("cd-days"),
  hours: document.getElementById("cd-hours"),
  mins: document.getElementById("cd-mins"),
  secs: document.getElementById("cd-secs")
};
const countGrid = document.getElementById("count-grid");
const countDone = document.getElementById("count-done");
const target = new Date(WEDDING_TIME).getTime();

function pad(n) { return String(n).padStart(2, "0"); }

function tick() {
  if (isNaN(target)) return;
  const diff = target - Date.now();
  if (diff <= 0) {
    countGrid.hidden = true;
    countDone.hidden = false;
    return;
  }
  const s = Math.floor(diff / 1000);
  cd.days.textContent = Math.floor(s / 86400);
  cd.hours.textContent = pad(Math.floor((s % 86400) / 3600));
  cd.mins.textContent = pad(Math.floor((s % 3600) / 60));
  cd.secs.textContent = pad(s % 60);
}
tick();
setInterval(tick, 1000);

/* ---------- 6a. Route planner ---------- */
const routeForm = document.getElementById("route-form");
routeForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const from = document.getElementById("route-from").value.trim();
  let url = "https://www.google.com/maps/dir/?api=1&destination=" + encodeURIComponent(DESTINATION);
  if (from) url += "&origin=" + encodeURIComponent(from);
  window.open(url, "_blank", "noopener");
});

/* ---------- 6b. Wishes (sent through WhatsApp) ---------- */
const wishForm = document.getElementById("wish-form");
const wishThanks = document.getElementById("wish-thanks");

wishForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const f = wishForm.elements;
  const name = f["name"].value.trim();
  const message = f["message"].value.trim();
  if (!name || !message) return;

  const text =
    "Wishes for Shrutika & Somesh\n" +
    "\n" +
    message + "\n\n- " + name;

  const base = WHATSAPP_NUMBER ? "https://wa.me/" + WHATSAPP_NUMBER : "https://wa.me/";
  window.open(base + "?text=" + encodeURIComponent(text), "_blank", "noopener");
  wishThanks.hidden = false;
  wishForm.reset();
});

/* ---------- 7. Event info popups ---------- */
// Edit the wording of any popup here.
const EVENT_INFO = {
  devkarya: {
    title: "Dev Karya",
    text: "Dev Karya is the first sacred step of the wedding. The family invites its deities and ancestors with prayers, asking for their blessings so that every ceremony that follows goes smoothly and auspiciously."
  },
  mehendi: {
    title: "Mehendi",
    text: "Intricate henna designs are applied to the bride's hands and feet. Mehendi stands for joy, love and good fortune, and the day is filled with songs, laughter and the company of family and friends."
  },
  simant: {
    title: "Simant Pujan",
    text: "A traditional ritual in which the bride's family welcomes the groom and his family with prayers, tilak and gifts. It honours the groom's side and marks the joining of two families."
  },
  engagement: {
    title: "Engagement Ceremony",
    text: "The couple exchange rings in front of their loved ones, formally promising themselves to each other. It is a happy, intimate moment shared with both families."
  },
  sangeet: {
    title: "Sangeet",
    text: "An evening of music, song and dance. Family and friends perform and celebrate together, filling the night with joy before the wedding day."
  },
  haldi: {
    title: "Haldi",
    text: "A paste of turmeric is gently applied to the bride and groom by their family. It is said to bless them with a healthy glow and good luck, and it is one of the most cheerful rituals of the celebrations."
  },
  vedic: {
    title: "Vedic Vidhi & Wedding Ceremony",
    text: "The sacred heart of the wedding. Guided by Vedic mantras and a priest, the couple take their vows before the holy fire at the auspicious Muhurta, and begin life together with the blessings of all."
  },
  jhal: {
    title: "Jhal",
    text: "A traditional Marathi custom that follows the wedding rites. Family gather around the newly married couple for light-hearted customs and blessings, celebrating their first moments together as husband and wife."
  },
  sunmukh: {
    title: "Sunmukh",
    text: "A tender Marathi tradition in which the groom's family welcomes the new bride into their home. They see her face for the first time as their daughter-in-law and bless her with love and gifts."
  }
};

const infoModal = document.getElementById("info-modal");
const infoTitle = document.getElementById("info-title");
const infoText = document.getElementById("info-text");
const infoClose = document.getElementById("info-close");
let infoOpener = null;

function openInfo(key, opener) {
  const info = EVENT_INFO[key];
  if (!info) return;
  infoTitle.textContent = info.title;
  infoText.textContent = info.text;
  infoOpener = opener || null;
  infoModal.hidden = false;
  requestAnimationFrame(() => infoModal.classList.add("show"));
  infoClose.focus();
}
function closeInfo() {
  infoModal.classList.remove("show");
  setTimeout(() => { infoModal.hidden = true; }, reduceMotion ? 0 : 300);
  if (infoOpener) infoOpener.focus();
}
document.querySelectorAll(".info-btn").forEach((btn) => {
  btn.addEventListener("click", () => openInfo(btn.dataset.info, btn));
});
infoClose.addEventListener("click", closeInfo);
infoModal.addEventListener("click", (event) => { if (event.target === infoModal) closeInfo(); });
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !infoModal.hidden) closeInfo();
});

/* ---------- 8. Background music ---------- */
// Put your song in the same folder as index.html and name it song.mp3.
// It starts the moment the tassel is touched, and loops from the same second.
const MUSIC_START = 71;    // second where the song starts (1:11 = the drop)

const bgm = document.getElementById("bgm");
bgm.volume = 0.6;
let musicWanted = false;   // true once the tassel has been touched
let musicSeeked = false;   // true once we have jumped to MUSIC_START

function jumpToStart() {
  if (musicSeeked) return;
  try { bgm.currentTime = MUSIC_START; musicSeeked = true; } catch (e) {}
}

function tryPlay() {
  if (bgm.readyState >= 1) jumpToStart();
  const p = bgm.play();
  if (p && p.catch) {
    p.catch(() => {
      // phone refused sound: play silently now, sound comes on at the next tap
      bgm.muted = true;
      bgm.play().catch(() => {});
    });
  }
}

function startMusic() {
  musicWanted = true;
  tryPlay();
}

// start downloading the song as soon as the page opens (curtain still closed)
bgm.preload = "auto";
bgm.load();

// the file is ready: jump to the drop now, so it is waiting for the pull
bgm.addEventListener("loadedmetadata", () => {
  jumpToStart();
  if (musicWanted) tryPlay();
});
bgm.addEventListener("canplay", () => {
  if (musicWanted && bgm.paused) tryPlay();
});

// any tap or release counts as permission: turn the sound on
["pointerup", "touchend", "click"].forEach((type) => {
  document.addEventListener(type, () => {
    if (!musicWanted) return;
    if (bgm.muted) bgm.muted = false;
    if (bgm.paused) tryPlay();
  }, { passive: true });
});

// when the song ends, start again from the same second
bgm.addEventListener("ended", () => {
  try { bgm.currentTime = MUSIC_START; } catch (e) {}
  bgm.play().catch(() => {});
});