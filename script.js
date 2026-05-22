const GISCUS_CONFIG = {
  repo: "TYoungK/invitation",
  repoId: "R_kgDOSkiLdA",
  category: "Announcements",
  categoryId: "DIC_kwDOSkiLdM4C9lTs",
};

const galleryButtons = document.querySelectorAll("[data-photo]");
const lightbox = document.querySelector(".lightbox");
const lightboxImage = lightbox.querySelector("img");
const closeLightbox = lightbox.querySelector("button");

galleryButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const src = button.dataset.photo;
    lightboxImage.src = src;
    lightboxImage.alt = button.querySelector("img").alt;
    lightbox.hidden = false;
  });
});

const hideLightbox = () => {
  lightbox.hidden = true;
  lightboxImage.removeAttribute("src");
};

closeLightbox.addEventListener("click", hideLightbox);
lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) hideLightbox();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !lightbox.hidden) hideLightbox();
});

const commentsRoot = document.querySelector("#comments");
const giscusReady = Object.values(GISCUS_CONFIG).every(Boolean);

if (giscusReady) {
  const script = document.createElement("script");
  script.src = "https://giscus.app/client.js";
  script.async = true;
  script.crossOrigin = "anonymous";
  script.setAttribute("data-repo", GISCUS_CONFIG.repo);
  script.setAttribute("data-repo-id", GISCUS_CONFIG.repoId);
  script.setAttribute("data-category", GISCUS_CONFIG.category);
  script.setAttribute("data-category-id", GISCUS_CONFIG.categoryId);
  script.setAttribute("data-mapping", "pathname");
  script.setAttribute("data-strict", "0");
  script.setAttribute("data-reactions-enabled", "1");
  script.setAttribute("data-emit-metadata", "0");
  script.setAttribute("data-input-position", "top");
  script.setAttribute("data-theme", "light");
  script.setAttribute("data-lang", "ko");
  commentsRoot.append(script);
} else {
  renderLocalGuestbook();
}

function renderLocalGuestbook() {
  commentsRoot.innerHTML = `
    <form class="local-comment">
      <p>GitHub Discussions 설정 전에는 이 브라우저에만 저장되는 미리보기 방명록으로 동작합니다.</p>
      <label for="guest-name">이름</label>
      <input id="guest-name" name="name" maxlength="24" autocomplete="name" required />
      <label for="guest-message">메시지</label>
      <textarea id="guest-message" name="message" maxlength="300" required></textarea>
      <button type="submit">축하 메시지 남기기</button>
      <div class="messages" aria-live="polite"></div>
    </form>
  `;

  const form = commentsRoot.querySelector("form");
  const list = commentsRoot.querySelector(".messages");
  const storageKey = "wedding-local-messages";
  const messages = JSON.parse(localStorage.getItem(storageKey) || "[]");

  const draw = () => {
    list.innerHTML = messages
      .map((item) => `
        <article class="message">
          <strong>${escapeHtml(item.name)}</strong>
          <span>${escapeHtml(item.date)}</span>
          <p>${escapeHtml(item.message)}</p>
        </article>
      `)
      .join("");
  };

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

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  })[char]);
}
