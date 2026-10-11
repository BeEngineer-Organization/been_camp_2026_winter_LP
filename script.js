/* =========================================================
   冬合宿LP
   ========================================================= */

/**
 * 申し込みフォーム（Googleフォーム）のURL。
 * ここに URL を入れると、data-apply-link が付いたすべてのボタン・リンクに反映されます。
 * 空のままの場合はページ遷移せず、「準備中」の案内を表示します。
 */
const APPLY_FORM_URL = "";

document.addEventListener("DOMContentLoaded", () => {
    initApplyLinks();
    initMenu();
    initCarousel();
    initVoice();
    initFaq();
    initFadeIn();
});

/* ---------- 申し込みボタン ---------- */
function initApplyLinks() {
    const links = document.querySelectorAll("[data-apply-link]");
    const toast = document.querySelector("[data-apply-toast]");
    let toastTimer;

    if (APPLY_FORM_URL) {
        links.forEach((link) => {
            link.href = APPLY_FORM_URL;
            link.target = "_blank";
            link.rel = "noopener noreferrer";
        });
        return;
    }

    // URL 未設定: href="#" のボタンは遷移させず案内を表示（ページ内リンクはそのまま動作）
    links.forEach((link) => {
        if (link.getAttribute("href") !== "#") return;
        link.addEventListener("click", (event) => {
            event.preventDefault();
            if (!toast) return;
            toast.hidden = false;
            clearTimeout(toastTimer);
            toastTimer = setTimeout(() => {
                toast.hidden = true;
            }, 2600);
        });
    });
}

/* ---------- ハンバーガーメニュー（1023px 以下） ---------- */
function initMenu() {
    const toggle = document.getElementById("menu-toggle");
    const nav = document.getElementById("global-nav");
    if (!toggle || !nav) return;

    const setOpen = (open) => {
        toggle.setAttribute("aria-expanded", String(open));
        toggle.setAttribute("aria-label", open ? "メニューを閉じる" : "メニューを開く");
        nav.classList.toggle("is-open", open);
        document.body.classList.toggle("is-menu-open", open);
    };

    toggle.addEventListener("click", () => {
        setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });

    nav.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => setOpen(false));
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && nav.classList.contains("is-open")) {
            setOpen(false);
            toggle.focus();
        }
    });

    window.matchMedia("(min-width: 1024px)").addEventListener("change", (event) => {
        if (event.matches) setOpen(false);
    });
}

/* ---------- 前回の合宿の様子：写真カルーセル ---------- */
function initCarousel() {
    const root = document.querySelector("[data-carousel]");
    if (!root) return;

    const slides = Array.from(root.querySelectorAll(".gallery__slide"));
    const caption = root.querySelector("[data-carousel-caption]");
    const stage = root.querySelector(".gallery__stage");
    const total = slides.length;
    let current = 0;
    let captionTimer;

    // 「！」の後ろで改行して2行に収める
    const renderCaption = (text) => {
        caption.textContent = "";
        const parts = text.split(/(?<=！)/);
        parts.forEach((part, i) => {
            if (i > 0) caption.appendChild(document.createElement("br"));
            caption.appendChild(document.createTextNode(part));
        });
    };

    const update = (animateCaption) => {
        slides.forEach((slide, i) => {
            // current を 0 として -3〜2 の相対位置を割り当てる
            const pos = ((i - current + total + Math.floor(total / 2)) % total) - Math.floor(total / 2);
            slide.dataset.pos = String(pos);
            slide.setAttribute("aria-hidden", String(pos !== 0));
        });

        const text = slides[current].dataset.caption;
        if (!animateCaption) {
            renderCaption(text);
            return;
        }
        caption.classList.add("is-changing");
        clearTimeout(captionTimer);
        captionTimer = setTimeout(() => {
            renderCaption(text);
            caption.classList.remove("is-changing");
        }, 150);
    };

    const go = (step) => {
        current = (current + step + total) % total;
        update(true);
    };

    root.querySelector("[data-carousel-prev]").addEventListener("click", () => go(-1));
    root.querySelector("[data-carousel-next]").addEventListener("click", () => go(1));

    // 左右の写真をクリックでも移動
    slides.forEach((slide) => {
        slide.addEventListener("click", () => {
            const pos = Number(slide.dataset.pos);
            if (pos === -1 || pos === 1) go(pos);
        });
    });

    // スワイプ
    let startX = null;
    stage.addEventListener("pointerdown", (event) => {
        startX = event.clientX;
    });
    stage.addEventListener("pointerup", (event) => {
        if (startX === null) return;
        const dx = event.clientX - startX;
        startX = null;
        if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
    });
    stage.addEventListener("pointercancel", () => {
        startX = null;
    });

    root.addEventListener("keydown", (event) => {
        if (event.key === "ArrowLeft") go(-1);
        if (event.key === "ArrowRight") go(1);
    });

    update(false);
}

/* ---------- 参加者の声：切り替え ---------- */
function initVoice() {
    const root = document.querySelector("[data-voice]");
    if (!root) return;

    const entries = Array.from(root.querySelectorAll("[data-voice-entry]"));
    const minis = Array.from(root.querySelectorAll("[data-voice-mini]"));
    let current = entries.findIndex((entry) => !entry.hidden);

    // 下のカードには「次の声」を順番に表示する
    const renderMinis = () => {
        minis.forEach((mini, i) => {
            const target = (current + i + 1) % entries.length;
            const entry = entries[target];
            const title = entry.querySelector(".voice__title").textContent.trim();
            const label = entry.querySelector(".voice__label").textContent.trim();
            mini.dataset.target = String(target);
            mini.querySelector("img").src = entry.dataset.avatar;
            mini.querySelector(".voice__mini-text").textContent = title;
            mini.setAttribute("aria-label", `${label}の声を見る：${title}`);
        });
    };

    const show = (index) => {
        entries[current].hidden = true;
        entries[current].classList.remove("is-active", "is-entering");
        current = index;
        const entry = entries[current];
        entry.hidden = false;
        entry.classList.add("is-active", "is-entering");
        renderMinis();

        // SP で本文が画面外に出た場合は先頭へ戻す
        const top = root.getBoundingClientRect().top;
        if (top < 0) root.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    minis.forEach((mini) => {
        mini.addEventListener("click", () => show(Number(mini.dataset.target)));
    });

    root.addEventListener("animationend", (event) => {
        event.target.closest("[data-voice-entry]")?.classList.remove("is-entering");
    });

    renderMinis();
}

/* ---------- よくある質問：アコーディオン ---------- */
function initFaq() {
    document.querySelectorAll(".faq__item").forEach((item) => {
        const button = item.querySelector(".faq__button");
        const answer = item.querySelector(".faq__a");

        const setOpen = (open) => {
            item.classList.toggle("is-open", open);
            button.setAttribute("aria-expanded", String(open));
            answer.inert = !open;
        };

        setOpen(item.classList.contains("is-open"));
        button.addEventListener("click", () => setOpen(!item.classList.contains("is-open")));
    });
}

/* ---------- スクロール時のフェードイン ---------- */
function initFadeIn() {
    if (!("IntersectionObserver" in window)) return;

    const targets = document.querySelectorAll(
        ".section-title, .section-lead, .overview__card, .features__card, .program__panel, .schedule__card, .gallery__carousel, .voice__body, .faq__item, .apply__card"
    );

    const observer = new IntersectionObserver(
        (records) => {
            records.forEach((record) => {
                if (!record.isIntersecting) return;
                record.target.classList.add("is-visible");
                observer.unobserve(record.target);
            });
        },
        { rootMargin: "0px 0px -10% 0px" }
    );

    targets.forEach((target) => {
        target.classList.add("fade-in");
        observer.observe(target);
    });
}
