const navToggle = document.querySelector("[data-nav-toggle]");
const nav = document.querySelector("[data-nav]");
const header = document.querySelector("[data-header]");
let form = null;
let statusEl = null;


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



// --- 3. safeStorage オブジェクトの実装 ---
const safeStorage = {
  getItem(key) {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.warn('LocalStorage is not accessible:', e);
      return null;
    }
  },
  setItem(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.warn('LocalStorage is not accessible:', e);
    }
  }
};

// --- 4. 文字サイズ調整機能 ---
function applyFontSize(size) {
  const html = document.documentElement;
  html.classList.remove('font-size-small', 'font-size-medium', 'font-size-large');
  html.classList.add(`font-size-${size}`);
  
  // ボタンの active クラスを更新
  document.querySelectorAll('.font-size-btn').forEach(btn => {
    if (btn.getAttribute('data-size') === size) {
      btn.classList.add('is-active');
      btn.setAttribute('aria-pressed', 'true');
    } else {
      btn.classList.remove('is-active');
      btn.setAttribute('aria-pressed', 'false');
    }
  });
}

// 初期化とリスナー設定
document.addEventListener('DOMContentLoaded', () => {
  form = document.querySelector("[data-contact-form]");
  statusEl = document.querySelector("[data-form-status]");

  if (form && statusEl) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      
      const GAS_API_URL = "https://script.google.com/macros/s/AKfycbwzjxjtelUWIwufZ2htqu9UO8124R_GNebdEAY_-SO5qppIvi3egRdHmkOMULno95T1Ww/exec";
      const submitBtn = form.querySelector("[data-submit-btn]");
      
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "送信中...";
      }
      statusEl.textContent = "送信中...";
      statusEl.style.color = "#0c4a6e";
      
      grecaptcha.ready(() => {
        grecaptcha.execute('6LeDLzotAAAAAP1iaZhwhhdH1zfldN_fMGAuXQR6', {action: 'submit'}).then((token) => {
          const formData = new FormData(form);
          const payload = {
            source: "inaken",
            type: formData.get("type") || "解体相談",
            name: formData.get("name") || "",
            tel: formData.get("tel") || "",
            email: formData.get("email") || "",
            message: formData.get("message") || "",
            recaptchaToken: token
          };
          
          fetch(GAS_API_URL, {
            method: "POST",
            mode: "no-cors",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
          })
          .then(() => {
            statusEl.textContent = "送信が完了しました。ありがとうございました。";
            statusEl.style.color = "green";
            form.reset();
            // 送信完了後にフォームプレースホルダーをリセット
            const typeSelect = form.querySelector("select[name='type']");
            const messageArea = form.querySelector("textarea[name='message']");
            const nameLabelText = document.querySelector("[data-name-label-text]");
            if (nameLabelText) nameLabelText.textContent = "お名前・会社名";
            if (messageArea) messageArea.placeholder = "対象施設、所在地、希望時期、既存資料の有無など";
          })
          .catch((error) => {
            console.error("Submission error:", error);
            statusEl.textContent = "送信中にエラーが発生しました。お電話にてお問い合わせください。";
            statusEl.style.color = "#c00000";
          })
          .finally(() => {
            if (submitBtn) {
              submitBtn.disabled = false;
              submitBtn.textContent = "送信する";
            }
          });
        }).catch((error) => {
          console.error("reCAPTCHA execution error:", error);
          statusEl.textContent = "セキュリティ検証に失敗しました。ページを再読み込みして再度お試しください。";
          statusEl.style.color = "#c00000";
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = "送信する";
          }
        });
      });
    });
  }

  const savedSize = safeStorage.getItem('preferred-font-size') || 'medium';
  applyFontSize(savedSize);

  // イベントデリゲーションで文字サイズ調整ボタンを検知
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.font-size-btn');
    if (btn) {
      const size = btn.getAttribute('data-size');
      if (size) {
        applyFontSize(size);
        safeStorage.setItem('preferred-font-size', size);
      }
    }
  });

  // 複数タブ・PWA同期
  window.addEventListener('storage', (event) => {
    if (event.key === 'preferred-font-size' && event.newValue) {
      applyFontSize(event.newValue);
    }
  });

  // 問い合わせフォームの求人対応とパラメータ検知
  const activeForm = document.querySelector("[data-contact-form]");
  if (activeForm) {
    const typeSelect = activeForm.querySelector("select[name='type']");
    const messageArea = activeForm.querySelector("textarea[name='message']");
    const nameLabelText = document.querySelector("[data-name-label-text]");

    const updateFormFields = () => {
      if (!typeSelect) return;
      const selectedType = typeSelect.value;
      if (selectedType === "求人への応募・採用について") {
        if (nameLabelText) nameLabelText.textContent = "お名前";
        if (messageArea) {
          messageArea.placeholder = "ご希望の職種（施工管理、運行管理など）、ご年齢、これまでのご経験、その他ご質問などを記入してください。";
        }
      } else {
        if (nameLabelText) nameLabelText.textContent = "お名前・会社名";
        if (messageArea) {
          messageArea.placeholder = "対象施設、所在地、希望時期、既存資料の有無など";
        }
      }
    };

    if (typeSelect) {
      typeSelect.addEventListener("change", updateFormFields);

      // URLパラメータの解析と適用
      const urlParams = new URLSearchParams(window.location.search);
      const job = urlParams.get('job');

      if (job) {
        // 相談種別を求人に設定
        typeSelect.value = "求人への応募・採用について";
        updateFormFields();

        // 職種に応じたメッセージ初期値を挿入
        if (messageArea) {
          if (job === 'construction') {
            messageArea.value = "【希望職種】 建設業 施工管理（現場監督）\n\n・ご年齢：\n・これまでのご経験・資格等：\n・自己PR・ご質問等：\n";
          } else if (job === 'logistics') {
            messageArea.value = "【希望職種】 運行管理・配車スタッフ（重機回送）\n\n・ご年齢：\n・これまでのご経験・資格等：\n・自己PR・ご質問等：\n";
          }
        }
      }
    }
  }
});