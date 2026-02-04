const yesBtn = document.getElementById("yesBtn");
const noBtn = document.getElementById("noBtn");
const reactionText = document.getElementById("reactionText");

const mainCard = document.getElementById("mainCard");
const successScreen = document.getElementById("successScreen");
const finalLines = document.getElementById("finalLines");

const heartsLayer = document.getElementById("heartsLayer");
const confettiLayer = document.getElementById("confettiLayer");

const romanticAudio = document.getElementById("romanticAudio");
const noAudio = document.getElementById("noAudio"); // 🔊 tambahan
const playingText = document.getElementById("playingText");


let noClicks = 0;
let yesScale = 1;

let noOffsetX = 0;
let noOffsetY = 0;

let locked = false;

const noReactions = [
  "DIBILANG TEKEN YES",
  "BATU JINK",
  "PENCET YES JINKKK",
  "TEKEN YG KIRI LOH MASA GATAU TOMBOL YESS",
  "GUA BANTAI LU",
  "TEKEN YES SAYANGGG",
  "AH PLISSSSSSSS",
  "YG BENEERRRRRR",
];

const yesFinalMessages = [
  "makasih uda pencet yes yaa sayangg",
  "I love you so muchhhhhh",
  "Jgn ngambek muluuuuu",
  "aku sayang kamu",
  "Mwahhh",
  "love uuuuuu",
  "mauu sama kamu selamanyaaa",
];

// --- Helpers ---
function clamp(n, min, max){
  return Math.max(min, Math.min(max, n));
}

function popReaction(text){
  reactionText.textContent = text;
  reactionText.classList.remove("pop");
  // force reflow for restart animation
  void reactionText.offsetWidth;
  reactionText.classList.add("pop");
}

function vibrateTiny(){
  if (navigator.vibrate) navigator.vibrate(50);
}

function setYesScale(scale){
  yesScale = scale;
  yesBtn.style.transform = `scale(${yesScale})`;
}

function moveNoButtonPlayful(){
  // random small movement but still clickable
  const maxMove = 18; // px
  const dx = (Math.random() * 2 - 1) * maxMove;
  const dy = (Math.random() * 2 - 1) * (maxMove * 0.6);

  noOffsetX = clamp(noOffsetX + dx, -40, 40);
  noOffsetY = clamp(noOffsetY + dy, -24, 24);

  noBtn.style.transform = `translate(${noOffsetX}px, ${noOffsetY}px)`;
}

function updateNoVisibility(){
  // After several clicks, NO starts fading then disappears
  if (noClicks >= 5 && noClicks < 8) {
    noBtn.classList.add("fading");
  }
  if (noClicks >= 8) {
    noBtn.classList.add("hidden");
  }
}

function spawnTinyHeart(){
  // keep max 10-15 hearts at a time
  const currentHearts = heartsLayer.querySelectorAll(".heart").length;
  if (currentHearts >= 12) return;

  const heart = document.createElement("div");
  heart.className = "heart";
  heart.textContent = Math.random() > 0.5 ? "💗" : "💖";

  const x = Math.random() * window.innerWidth;
  const y = window.innerHeight - 40 - Math.random() * 80;

  const dur = 2200 + Math.random() * 900;

  heart.style.left = `${x}px`;
  heart.style.top = `${y}px`;
  heart.style.animationDuration = `${dur}ms`;

  heartsLayer.appendChild(heart);

  heart.addEventListener("animationend", () => {
    heart.remove();
  });
}

function spawnConfettiBurst(){
  // very light burst (max 14)
  const pieces = 14;
  for (let i = 0; i < pieces; i++){
    const c = document.createElement("div");
    c.className = "confetti";

    const x = (window.innerWidth * 0.5) + (Math.random() * 140 - 70);
    const y = (window.innerHeight * 0.35) + (Math.random() * 40 - 20);

    const dur = 900 + Math.random() * 500;

    c.style.left = `${x}px`;
    c.style.top = `${y}px`;
    c.style.animationDuration = `${dur}ms`;

    // random slight size variation (still light)
    const w = 6 + Math.random() * 6;
    const h = 8 + Math.random() * 8;
    c.style.width = `${w}px`;
    c.style.height = `${h}px`;

    confettiLayer.appendChild(c);

    c.addEventListener("animationend", () => c.remove());
  }
}

function typeFinalLines(){
  finalLines.innerHTML = "";

  const lines = [
    "LOVE uu cantikkkk",
    ...yesFinalMessages
  ];

  let idx = 0;
  const showNext = () => {
    if (idx >= lines.length) return;

    const el = document.createElement("div");
    el.className = "line";
    el.textContent = lines[idx];

    finalLines.appendChild(el);

    // animate in
    requestAnimationFrame(() => {
      el.classList.add("show");
    });

    idx++;
    setTimeout(showNext, 520);
  };

  showNext();
}

function playSongAfterYes(){
  playingText.textContent = "🔊 Playing...";
  romanticAudio.volume = 0.95;

  const p = romanticAudio.play();
  if (p && typeof p.then === "function"){
    p.then(() => {
      // ok
    }).catch(() => {
      playingText.textContent = "🔇 Tap again to enable sound";
      // allow tap to retry
      successScreen.addEventListener("click", () => {
        romanticAudio.play().then(() => {
          playingText.textContent = "🔊 Playing...";
        }).catch(() => {
          playingText.textContent = "🔇 Sound blocked by browser";
        });
      }, { once: true });
    });
  }
}

// --- Ambient hearts (super light) ---
setInterval(() => {
  if (locked) return;
  spawnTinyHeart();

}, 900);
function unlockAudio(){
  // trigger kecil biar audio kebuka di HP
  romanticAudio.play().then(() => {
    romanticAudio.pause();
    romanticAudio.currentTime = 0;
  }).catch(()=>{});

  noAudio.play().then(() => {
    noAudio.pause();
    noAudio.currentTime = 0;
  }).catch(()=>{});
}

// --- NO click ---
noBtn.addEventListener("click", () => {
  if (locked) return;

  // 🔊 backsound tiap pencet NO
  noAudio.currentTime = 0;
  noAudio.play().catch(() => {});

  noClicks++;


  vibrateTiny();

  // Reaction text rotates
  const reaction = noReactions[(noClicks - 1) % noReactions.length];
  popReaction(reaction);

  // YES grows
  setYesScale(1 + noClicks * 0.15);

  // Move NO away playfully
  moveNoButtonPlayful();

  // After several NO clicks, NO fades then disappears
  updateNoVisibility();

  // small cute heart spawn (lightweight)
  spawnTinyHeart();
});

// --- YES click ---
yesBtn.addEventListener("click", () => {
  if (locked) return;
  locked = true;

  // disable buttons
  yesBtn.disabled = true;
  noBtn.disabled = true;
  noBtn.classList.add("hidden");

  // small haptic
  if (navigator.vibrate) navigator.vibrate([40, 40, 60]);

  // show success screen
  successScreen.classList.remove("hidden");

  // tiny confetti burst + few hearts
  spawnConfettiBurst();
  for (let i = 0; i < 6; i++) spawnTinyHeart();

  // show final lines one by one
  typeFinalLines();

  // play song after click (autoplay safe)
  playSongAfterYes();
});

// keep layout stable on resize
window.addEventListener("resize", () => {
  noOffsetX = clamp(noOffsetX, -40, 40);
  noOffsetY = clamp(noOffsetY, -24, 24);
});
