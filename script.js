const FIREBASE_CONFIG = {
  apiKey: "AIzaSyCzP_60t1fSztGgk654IwVVEibr3mY_ink",
  authDomain: "my-invitation-guestbook.firebaseapp.com",
  projectId: "my-invitation-guestbook",
  storageBucket: "my-invitation-guestbook.firebasestorage.app",
  messagingSenderId: "703555846491",
  appId: "1:703555846491:web:a885740ef77349a7469a7e",
  measurementId: "G-6ZJ5HJ96SZ"
};

const galleryButtons = document.querySelectorAll("[data-photo]");
const lightbox = document.querySelector(".lightbox");
const lightboxImage = lightbox.querySelector("img");
const closeLightbox = lightbox.querySelector(".lightbox__close");
const prevLightbox = lightbox.querySelector(".lightbox__prev");
const nextLightbox = lightbox.querySelector(".lightbox__next");
const lightboxCounter = lightbox.querySelector(".lightbox__counter");
const galleryPhotos = [...galleryButtons].map((button) => ({
  src: button.dataset.photo,
  alt: button.querySelector("img").alt,
}));
let currentPhotoIndex = 0;
let touchStartX = 0;
const cleanUrl = window.location.pathname + window.location.search;

if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}

history.replaceState({ invitationTop: true }, "", cleanUrl);

window.addEventListener("popstate", () => {
  window.scrollTo({ top: 0, behavior: "auto" });
});

document.querySelectorAll("[data-scroll-target]").forEach((control) => {
  control.addEventListener("click", () => {
    const targetId = control.dataset.scrollTarget;
    const target = targetId === "top" ? document.body : document.getElementById(targetId);

    if (!target) return;

    if (targetId === "top") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      history.replaceState({ invitationTop: true }, "", cleanUrl);
    } else {
      if (history.state?.invitationNav) {
        history.replaceState({ invitationNav: true }, "", cleanUrl);
      } else {
        history.pushState({ invitationNav: true }, "", cleanUrl);
      }
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
});

galleryButtons.forEach((button, index) => {
  button.addEventListener("click", () => {
    showPhoto(index);
  });
});

const showPhoto = (index) => {
  currentPhotoIndex = (index + galleryPhotos.length) % galleryPhotos.length;
  const photo = galleryPhotos[currentPhotoIndex];

  lightboxImage.src = photo.src;
  lightboxImage.alt = photo.alt;
  lightboxCounter.textContent = `${currentPhotoIndex + 1} / ${galleryPhotos.length}`;
  lightbox.hidden = false;
  document.body.classList.add("lightbox-open");
};

const showNextPhoto = () => showPhoto(currentPhotoIndex + 1);
const showPrevPhoto = () => showPhoto(currentPhotoIndex - 1);

const hideLightbox = () => {
  lightbox.hidden = true;
  lightboxImage.removeAttribute("src");
  document.body.classList.remove("lightbox-open");
};

closeLightbox.addEventListener("click", hideLightbox);
nextLightbox.addEventListener("click", showNextPhoto);
prevLightbox.addEventListener("click", showPrevPhoto);
lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) hideLightbox();
});

lightbox.addEventListener("touchstart", (event) => {
  touchStartX = event.changedTouches[0].clientX;
}, { passive: true });

lightbox.addEventListener("touchend", (event) => {
  const distance = event.changedTouches[0].clientX - touchStartX;

  if (Math.abs(distance) < 45) return;
  if (distance < 0) showNextPhoto();
  else showPrevPhoto();
}, { passive: true });

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !lightbox.hidden) hideLightbox();
  if (event.key === "ArrowRight" && !lightbox.hidden) showNextPhoto();
  if (event.key === "ArrowLeft" && !lightbox.hidden) showPrevPhoto();
});

const commentsRoot = document.querySelector("#comments");
const firebaseReady = FIREBASE_CONFIG.apiKey && FIREBASE_CONFIG.projectId && FIREBASE_CONFIG.appId;

if (firebaseReady) {
  renderFirebaseGuestbook();
} else {
  renderLocalGuestbook();
}

async function renderFirebaseGuestbook() {
  commentsRoot.innerHTML = guestbookMarkup("축하 메시지는 모든 방문자에게 함께 표시됩니다.");

  const form = commentsRoot.querySelector("form");
  const list = commentsRoot.querySelector(".messages");
  const submit = form.querySelector("button");

  try {
    const [{ initializeApp }, firestore] = await Promise.all([
      import("https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js"),
      import("https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js"),
    ]);
    const {
      addDoc,
      collection,
      getFirestore,
      limit,
      onSnapshot,
      orderBy,
      query,
      serverTimestamp,
    } = firestore;

    const app = initializeApp(FIREBASE_CONFIG);
    const db = getFirestore(app);
    const messagesRef = collection(db, "guestbookMessages");
    const messagesQuery = query(messagesRef, orderBy("createdAt", "desc"), limit(50));

    onSnapshot(
      messagesQuery,
      (snapshot) => {
        drawMessages(list, snapshot.docs.map((doc) => doc.data()));
      },
      () => {
        list.innerHTML = `<p class="guestbook__error">메시지를 불러오지 못했습니다. Firebase 설정과 보안 규칙을 확인해 주세요.</p>`;
      },
    );

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const formData = new FormData(form);
      const name = String(formData.get("name")).trim();
      const message = String(formData.get("message")).trim();

      if (!name || !message) return;

      submit.disabled = true;
      submit.textContent = "등록 중";

      try {
        await addDoc(messagesRef, {
          name,
          message,
          createdAt: serverTimestamp(),
        });
        form.reset();
      } finally {
        submit.disabled = false;
        submit.textContent = "축하 메시지 남기기";
      }
    });
  } catch (error) {
    list.innerHTML = `<p class="guestbook__error">Firebase 연결에 실패했습니다. 설정값을 확인해 주세요.</p>`;
  }
}

function renderLocalGuestbook() {
  commentsRoot.innerHTML = guestbookMarkup("Firebase 설정 전에는 이 브라우저에만 저장되는 미리보기 방명록으로 동작합니다.");

  const form = commentsRoot.querySelector("form");
  const list = commentsRoot.querySelector(".messages");
  const storageKey = "wedding-local-messages";
  const messages = JSON.parse(localStorage.getItem(storageKey) || "[]");

  const draw = () => drawMessages(list, messages);

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    messages.unshift({
      name: String(formData.get("name")).trim(),
      message: String(formData.get("message")).trim(),
      date: new Intl.DateTimeFormat("ko-KR", { dateStyle: "medium" }).format(new Date()),
    });
    localStorage.setItem(storageKey, JSON.stringify(messages.slice(0, 30)));
    form.reset();
    draw();
  });

  draw();
}

function guestbookMarkup(helpText) {
  return `
    <form class="local-comment">
      <p>${helpText}</p>
      <label for="guest-name">이름</label>
      <input id="guest-name" name="name" maxlength="24" autocomplete="name" required />
      <label for="guest-message">메시지</label>
      <textarea id="guest-message" name="message" maxlength="300" required></textarea>
      <button type="submit">축하 메시지 남기기</button>
      <div class="messages" aria-live="polite"></div>
    </form>
  `;
}

function drawMessages(list, messages) {
  if (!messages.length) {
    list.innerHTML = `<p class="guestbook__empty">첫 축하 메시지를 남겨 주세요.</p>`;
    return;
  }

  list.innerHTML = messages
    .map((item) => `
      <article class="message">
        <strong>${escapeHtml(item.name || "익명")}</strong>
        <span>${formatDate(item.createdAt || item.date)}</span>
        <p>${escapeHtml(item.message || "")}</p>
      </article>
    `)
    .join("");
}

function formatDate(value) {
  if (typeof value === "string") return escapeHtml(value);

  const date = value?.toDate?.() || new Date();
  return new Intl.DateTimeFormat("ko-KR", { dateStyle: "medium" }).format(date);
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  })[char]);
}
