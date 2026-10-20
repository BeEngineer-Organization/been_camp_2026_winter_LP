/* =========================================================
   冬合宿LP
   ========================================================= */

/**
 * ★ キャンセル待ち画面への切り替え ★
 * 定員に達したら true にするだけで、ページ全体がキャンセル待ちの表示になります。
 *   false: 通常の申し込み受付（合宿に申し込む／締切表示）
 *   true : キャンセル待ち（キャンセル待ちフォーム／キャンセル待ち受付中の表示）
 * 切り替わる要素は index.html の data-waitlist-html 属性（文言の差し替え）と
 * data-waitlist-only 属性（キャンセル待ちのときだけ表示）で指定しています。
 * 説明会の申し込みボタンには影響しません（説明会は BRIEFING_DATE で自動切り替え）。
 */
const isWaitlistMode = false;

// キャンセル待ちフォームのURL（キャンセル待ちモードのとき、合宿の申し込みボタンの移動先になります）。
// 空のままの場合はページ遷移せず、「準備中」の案内を表示します。
const WAITLIST_FORM_URL = "https://forms.gle/8P2VQheJ5FKdYU1W8";

/**
 * 申し込み先のURL。ここに URL を入れると、対応するボタン・リンクすべてに反映されます。
 * 空のままの場合はページ遷移せず、「準備中」の案内を表示します。
 */
// 合宿への申し込みページ（data-apply-link）
const APPLY_FORM_URL = "https://be-engineer.tech/event-list/514";
// 説明会への申し込み Googleフォーム（data-briefing-link）
const BRIEFING_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSf_3AdpF3JDJh3WRBll85fIAoghrh-oY9J5MlyVynWfEVRELw/viewform";

/**
 * 説明会の日時（日本時間）。表示は次の3段階で自動的に切り替わります。
 *   開催日の前日まで            : 申し込みボタン・説明文を表示（受付中）
 *   開催日 0:00 〜 BRIEFING_END_TIME : ボタンを隠し「所属校へお問い合わせください」を表示
 *   開催日 BRIEFING_END_TIME 以降  : 説明会に関する表示をすべて隠す
 * BRIEFING_DATE を空にすると切り替えは行わず、申し込みボタンを表示し続けます。
 */
const BRIEFING_DATE = "2026-11-06"; // 開催日 "YYYY-MM-DD"
const BRIEFING_END_TIME = "19:00"; // この時刻から説明会の表示をすべて隠す "HH:MM"

document.addEventListener("DOMContentLoaded", () => {
    initWaitlistMode(); // 申し込みボタンの設定より先に、文言を切り替える
    initApplyLinks();
    initBriefingSwitch();
    initMenu();
    initCarousel();
    initFaq();
    initFadeIn();
    initSnowfall();
});

/* ---------- 申し込みボタン ---------- */
function initApplyLinks() {
    const toast = document.querySelector("[data-apply-toast]");
    let toastTimer;

    const setup = (selector, url, pendingMessage) => {
        const links = document.querySelectorAll(selector);

        if (url) {
            links.forEach((link) => {
                link.href = url;
                link.target = "_blank";
                link.rel = "noopener noreferrer";
            });
            return;
        }

        // URL 未設定: 遷移させず案内を表示
        links.forEach((link) => {
            link.href = "#";
            link.removeAttribute("target");
            link.addEventListener("click", (event) => {
                event.preventDefault();
                if (!toast) return;
                toast.textContent = pendingMessage;
                toast.hidden = false;
                clearTimeout(toastTimer);
                toastTimer = setTimeout(() => {
                    toast.hidden = true;
                }, 2600);
            });
        });
    };

    if (isWaitlistMode) {
        setup("[data-apply-link]", WAITLIST_FORM_URL, "キャンセル待ちフォームは準備中です。公開までお待ちください。");
    } else {
        setup("[data-apply-link]", APPLY_FORM_URL, "合宿のお申し込みは準備中です。公開までお待ちください。");
    }
    setup("[data-briefing-link]", BRIEFING_FORM_URL, "説明会のお申し込みは準備中です。公開までお待ちください。");
}

/* ---------- キャンセル待ちモード ----------
   isWaitlistMode が true のとき、data-waitlist-html を持つ要素の中身をその値に差し替える
   （締切表示 → キャンセル待ち受付中、合宿の申し込みボタン → キャンセル待ちフォーム など） */
function initWaitlistMode() {
    if (!isWaitlistMode) return;
    document.documentElement.classList.add("is-waitlist");
    document.querySelectorAll("[data-waitlist-html]").forEach((el) => {
        el.innerHTML = el.dataset.waitlistHtml;
    });
    document.querySelectorAll("[data-waitlist-only]").forEach((el) => {
        el.hidden = false;
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

    // 「！」の後ろで改行して2行に収める。data-caption 内の改行（&#10;）の位置でも改行する（PC・SP 共通）
    const renderCaption = (text) => {
        caption.textContent = "";
        text.split("\n").forEach((line, j) => {
            if (j > 0) {
                const br = document.createElement("br");
                caption.appendChild(br);
            }
            line.split(/(?<=！)/).forEach((part, i) => {
                if (i > 0) caption.appendChild(document.createElement("br"));
                caption.appendChild(document.createTextNode(part));
            });
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

/* ---------- 背景の雪 ----------
   淡いピクセル調の粒（正方形）を、粒ごとに速さ・揺れ幅・揺れの周期をランダムにして降らせる。
   座標は1ドット単位に丸めてピクセルらしい動きに。動きを減らす設定のときは止めたまま表示する */
function initSnowfall() {
    const canvas = document.querySelector("[data-snowfall]");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const DOT = 2; // 1ドットの大きさ（CSS px）
    let flakes = [];
    let width = 0;
    let height = 0;
    let rafId = 0;
    let last = 0;

    const random = (min, max) => min + Math.random() * (max - min);

    const createFlake = (y) => ({
        x: random(0, width),
        y,
        size: DOT * Math.ceil(random(0.5, 2.5)), // 2px または 4px（まれに 6px）
        speed: random(18, 48), // 落下速度（px/秒）
        drift: random(-8, 8), // 一定方向への流れ（風）
        sway: random(6, 22), // 横揺れの幅
        freq: random(0.3, 1.1), // 横揺れの速さ
        phase: random(0, Math.PI * 2),
        alpha: random(0.35, 0.75),
    });

    const resize = () => {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        const count = Math.min(140, Math.round((width * height) / 9000));
        flakes = Array.from({ length: count }, () => createFlake(random(0, height)));
    };

    const draw = (time) => {
        ctx.clearRect(0, 0, width, height);
        flakes.forEach((f) => {
            const x = Math.round((f.x + Math.sin(time * f.freq + f.phase) * f.sway) / DOT) * DOT;
            const y = Math.round(f.y / DOT) * DOT;
            ctx.fillStyle = `rgba(255, 255, 255, ${f.alpha})`;
            ctx.fillRect(x, y, f.size, f.size);
        });
    };

    const tick = (now) => {
        const dt = Math.min((now - last) / 1000, 0.1);
        last = now;
        flakes.forEach((f, i) => {
            f.y += f.speed * dt;
            f.x += f.drift * dt;
            if (f.y > height + 8) {
                flakes[i] = createFlake(-8);
            } else if (f.x < -30) {
                f.x += width + 60;
            } else if (f.x > width + 30) {
                f.x -= width + 60;
            }
        });
        draw(now / 1000);
        rafId = requestAnimationFrame(tick);
    };

    const start = () => {
        cancelAnimationFrame(rafId);
        if (reduceMotion.matches) {
            draw(0);
            return;
        }
        last = performance.now();
        rafId = requestAnimationFrame(tick);
    };

    let resizeTimer;
    window.addEventListener("resize", () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            resize();
            start();
        }, 150);
    });
    reduceMotion.addEventListener("change", start);

    resize();
    start();
}

/* ---------- 説明会の表示の自動切り替え ----------
   [data-briefing-open]   : 受付中だけ表示（申し込みボタン・説明文）
   [data-briefing-closed] : 問い合わせ案内の期間だけ表示
   [data-briefing-topic]  : 説明会そのものの話題（FAQ など）。説明会の終了後に隠す
   hidden にした要素は画面に出ず、キーボード操作でもフォーカスされない */

/**
 * 指定した時刻（ミリ秒）での説明会の表示状態を返す。
 * "open"（受付中） / "inquiry"（問い合わせ案内） / "ended"（終了・すべて非表示） / null（日付未設定）
 * テスト時は getBriefingState(new Date("2026-11-06T19:00:00+09:00").getTime()) のように呼べる
 */
function getBriefingState(nowMs) {
    const times = getBriefingTimes();
    if (!times) return null;
    if (nowMs >= times.endAt) return "ended";
    if (nowMs >= times.closeAt) return "inquiry";
    return "open";
}

// 切り替え時刻（日本時間 = UTC+9 で計算するので、端末の時間帯設定に左右されない）
function getBriefingTimes() {
    if (!BRIEFING_DATE) return null;
    const closeAt = new Date(`${BRIEFING_DATE}T00:00:00+09:00`).getTime();
    const endAt = new Date(`${BRIEFING_DATE}T${BRIEFING_END_TIME || "23:59"}:00+09:00`).getTime();
    if (Number.isNaN(closeAt) || Number.isNaN(endAt)) return null;
    return { closeAt, endAt };
}

function initBriefingSwitch() {
    const times = getBriefingTimes();
    if (!times) return;

    const openEls = document.querySelectorAll("[data-briefing-open]");
    const inquiryEls = document.querySelectorAll("[data-briefing-closed]");
    const topicEls = document.querySelectorAll("[data-briefing-topic]");
    const MAX_TIMEOUT = 2 ** 31 - 1; // setTimeout の上限（約24.8日）
    let timer;

    const update = () => {
        const now = Date.now();
        const state = getBriefingState(now);
        openEls.forEach((el) => {
            el.hidden = state !== "open";
        });
        inquiryEls.forEach((el) => {
            el.hidden = state !== "inquiry";
        });
        topicEls.forEach((el) => {
            el.hidden = state === "ended";
        });

        // ページを開いたまま次の切り替え時刻を迎えた場合も更新する
        clearTimeout(timer);
        const next = state === "open" ? times.closeAt : state === "inquiry" ? times.endAt : null;
        if (next) timer = setTimeout(update, Math.min(next - now + 500, MAX_TIMEOUT));
    };

    // スリープ復帰やタブの切り替え後にも判定し直す
    document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") update();
    });

    update();
}
