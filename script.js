const navToggle = document.querySelector("[data-nav-toggle]");
const nav = document.querySelector("[data-nav]");
const header = document.querySelector("[data-header]");
const form = document.querySelector("[data-contact-form]");
const statusEl = document.querySelector("[data-form-status]");

if (navToggle && nav) {
  navToggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
    navToggle.setAttribute("aria-label", isOpen ? "メニューを閉じる" : "メニューを開く");
  });

  nav.addEventListener("click", (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      nav.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
      navToggle.setAttribute("aria-label", "メニューを開く");
    }
  });
}

if (header) {
  const setHeaderState = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 12);
  };

  setHeaderState();
  window.addEventListener("scroll", setHeaderState, { passive: true });
}

const backToTop = document.createElement("button");
backToTop.type = "button";
backToTop.className = "back-to-top";
backToTop.setAttribute("aria-label", "ページ上部へ戻る");
backToTop.textContent = "↑";
document.body.appendChild(backToTop);

const setBackToTopState = () => {
  const isMobile = window.matchMedia("(max-width: 620px)").matches;
  backToTop.classList.toggle("is-visible", isMobile && window.scrollY > 420);
};

backToTop.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

setBackToTopState();
window.addEventListener("scroll", setBackToTopState, { passive: true });
window.addEventListener("resize", setBackToTopState);

if (form && statusEl) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const type = formData.get("type") || "相談";
    const name = formData.get("name") || "";
    const tel = formData.get("tel") || "";
    const message = formData.get("message") || "";
    const body = [
      "有限会社稲建への相談です。",
      "",
      `相談種別: ${type}`,
      `お名前・会社名: ${name}`,
      `電話番号: ${tel}`,
      "",
      "相談内容:",
      message,
    ].join("\n");

    window.location.href = `mailto:inaken@email.plala.or.jp?subject=${encodeURIComponent("解体工事の相談")}&body=${encodeURIComponent(body)}`;
    statusEl.textContent = "メールソフトを開きました。開かない場合は電話またはメールアドレスから直接お問い合わせください。";
  });
}