/* =========================================================
   Shrutika & Somesh - Wedding Invitation (v2)
   1. Envelope opening
   2. Hide empty photo sections
   3. Scroll fade-in
   4. Countdown
   5. RSVP and wishes (sent through WhatsApp)
   ========================================================= */

/* ---------- SETTINGS YOU CAN EDIT ---------- */
// Wedding moment the countdown counts down to (India time, +05:30).
const WEDDING_TIME = "2027-02-10T11:45:00+05:30";

// RSVPs and wishes open WhatsApp with the message ready to send.
// Put a number here (country code first, digits only, e.g. "919876543210")
// to send them to one person. Leave it empty and the guest picks a chat.
const WHATSAPP_NUMBER = "";
/* ------------------------------------------- */

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- 1. Envelope ---------- */
const screenEl = document.getElementById("envelope-screen");
const envelope = document.getElementById("envelope");
const seal = document.getElementById("seal");
let opened = false;

function openEnvelope() {
  if (opened) return;
  opened = true;
  envelope.classList.add("open");
  screenEl.classList.add("opened");

  setTimeout(() => {
    screenEl.classList.add("hide");
    document.body.classList.remove("locked");
    document.body.classList.add("revealed");
    window.scrollTo(0, 0);
    setTimeout(() => { screenEl.style.display = "none"; }, 1100);
  }, reduceMotion ? 0 : 1900);
}
seal.addEventListener("click", openEnvelope);
envelope.addEventListener("click", openEnvelope);

/* ---------- 2. Hide empty photo sections ---------- */
function tidyPhotos() {
  // If the hero photo is missing, centre the text.
  const heroGrid = document.querySelector(".hero-grid");
  if (heroGrid && !heroGrid.querySelector(".hero-photo")) heroGrid.classList.add("no-photo");

  // A section marked data-needs-photo disappears if it has no photos left.
  document.querySelectorAll("[data-needs-photo]").forEach((section) => {
    if (!section.querySelector("figure.photo")) section.remove();
  });
}
window.addEventListener("load", tidyPhotos);
setTimeout(tidyPhotos, 2500);   // backup in case "load" is slow

/* ---------- 3. Scroll fade-in ---------- */
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
    }, { threshold: 0.12 });
    items.forEach((item) => observer.observe(item));
  } else {
    items.forEach((item) => item.classList.add("visible"));
  }
}
watchReveals();

/* ---------- 4. Countdown ---------- */
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
  const diff = target - Date.now();
  if (isNaN(target)) return;
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

/* ---------- 5. RSVP and wishes ---------- */
function sendToWhatsApp(text) {
  const base = WHATSAPP_NUMBER ? "https://wa.me/" + WHATSAPP_NUMBER : "https://wa.me/";
  window.open(base + "?text=" + encodeURIComponent(text), "_blank", "noopener");
}

const rsvpForm = document.getElementById("rsvp-form");
const rsvpThanks = document.getElementById("rsvp-thanks");

rsvpForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const f = rsvpForm.elements;
  const name = f["name"].value.trim();
  if (!name) return;

  const chosen = Array.from(rsvpForm.querySelectorAll('input[name="events"]:checked'))
    .map((box) => box.value);

  const text =
    "RSVP - Shrutika & Somesh\n" +
    "Name: " + name + "\n" +
    "Response: " + f["attend"].value + "\n" +
    "Guests: " + f["guests"].value + "\n" +
    "Events: " + (chosen.length ? chosen.join("; ") : "not specified");

  sendToWhatsApp(text);
  rsvpThanks.hidden = false;
  rsvpForm.reset();
});

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
    "To: " + f["to"].value + "\n\n" +
    message + "\n\n- " + name;

  sendToWhatsApp(text);
  wishThanks.hidden = false;
  wishForm.reset();
});
