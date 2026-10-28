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

/**
 * テーマ（季節イベントなどの見た目の切り替え）
 * localhost では常時、公開環境では ?theme=halloween を付けたときに <html data-theme="halloween"> になります
 * （判定は index.html の <head> 内。他のクエリパラメータと一緒でも動作します）。
 * テーマ専用の CSS は styles.css の :root[data-theme="halloween"] 以下に、
 * テーマ専用の処理は THEME_INITS に書きます。パラメータがなければ何も実行されません。
 */
const CURRENT_THEME = document.documentElement.dataset.theme || "";
const THEME_INITS = {
    halloween: () => {
        // 開いたときの暗転（CSS の body::before）は約1.35秒で消える。念のため2秒後に必ず外す
        setTimeout(() => document.documentElement.classList.add("is-curtain-done"), 2000);
        playHalloweenBats();
        initLanternSwitch();
        initTentCat();
    },
};

document.addEventListener("DOMContentLoaded", () => {
    initWaitlistMode(); // 申し込みボタンの設定より先に、文言を切り替える
    initApplyLinks();
    initBriefingSwitch();
    initMenu();
    initCarousel();
    initFaq();
    initFadeIn();
    initSnowfall();
    initTheme();
});

/* ---------- テーマ ---------- */
function initTheme() {
    const init = THEME_INITS[CURRENT_THEME];
    if (init) init();
}

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
    // ハロウィンのときだけ、雪にオレンジの光と小さなコウモリを混ぜる（通常テーマは雪のみ）
    const isHalloween = CURRENT_THEME === "halloween";
    let flakes = [];
    let width = 0;
    let height = 0;
    let rafId = 0;
    let last = 0;

    const random = (min, max) => min + Math.random() * (max - min);

    const createFlake = (y, kind = "snow") => {
        const base = {
            kind,
            x: random(0, width),
            y,
            phase: random(0, Math.PI * 2),
        };
        if (kind === "ember") return { ...base, ...createEmber() };
        if (kind === "bat") return { ...base, ...createMiniBat() };
        return {
            ...base,
            size: DOT * Math.ceil(random(0.5, 2.5)), // 2px または 4px（まれに 6px）
            speed: random(18, 48), // 落下速度（px/秒）
            drift: random(-8, 8), // 一定方向への流れ（風）
            sway: random(6, 22), // 横揺れの幅
            freq: random(0.3, 1.1), // 横揺れの速さ
            alpha: random(0.35, 0.75),
        };
    };

    // オレンジ〜黄色の光（ドットを組み合わせた形。ゆっくり降りながら、ほのかに明滅）
    const createEmber = () => ({
        shape: ["block", "plus", "plus", "big"][Math.floor(random(0, 4))],
        color: Math.random() < 0.6 ? "255, 140, 40" : "255, 196, 70",
        speed: random(10, 26),
        drift: random(-6, 6),
        sway: random(8, 24),
        freq: random(0.25, 0.8),
        alpha: random(0.7, 1),
        twinkle: random(0.8, 2), // 明滅の速さ
    });

    // 小さなコウモリ（左右に揺れたり斜めに流れたりしながら降りる）
    const createMiniBat = () => ({
        speed: random(14, 32),
        drift: random(-28, 28),
        sway: random(18, 40),
        freq: random(0.4, 0.9),
        alpha: random(0.75, 0.95),
        flap: random(5, 8), // 1秒あたりの羽ばたき回数
    });

    // 画面の広さに応じた数。ハロウィンは 雪 約50% / 光 約35% / コウモリ 約15%（多くなりすぎないよう上限あり）
    const buildFlakes = () => {
        const count = Math.min(140, Math.round((width * height) / 9000));
        if (!isHalloween) {
            return Array.from({ length: count }, () => createFlake(random(0, height)));
        }
        const maxBats = width < 768 ? 3 : 6;
        const kinds = [
            ...Array(Math.round(count * 0.5)).fill("snow"),
            ...Array(Math.round(count * 0.35)).fill("ember"),
            ...Array(Math.min(Math.round(count * 0.15), maxBats)).fill("bat"),
        ];
        return kinds.map((kind) => createFlake(random(0, height), kind));
    };

    const resize = () => {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        flakes = buildFlakes();
    };

    // 光の形（ドット単位）。c = 中心（明るい） / a = 外側（少し淡い）
    const EMBER_SHAPES = {
        block: ["cc", "cc"],
        plus: [".a.", "aca", ".a."],
        big: ["..a..", ".aca.", "accca", ".aca.", "..a.."],
    };

    const drawEmber = (f, x, y, time) => {
        const a = f.alpha * (0.55 + 0.45 * Math.sin(time * f.twinkle + f.phase));
        const shape = EMBER_SHAPES[f.shape];
        shape.forEach((row, ry) => {
            for (let rx = 0; rx < row.length; rx++) {
                const c = row[rx];
                if (c === ".") continue;
                ctx.fillStyle = `rgba(${f.color}, ${(c === "c" ? a : a * 0.55).toFixed(3)})`;
                ctx.fillRect(x + rx * DOT, y + ry * DOT, DOT, DOT);
            }
        });
    };

    const drawMiniBat = (f, x, y, time) => {
        const frame = MINI_BAT_FRAMES[Math.floor(time * f.flap + f.phase) % 2];
        ctx.fillStyle = `rgba(27, 14, 40, ${f.alpha})`;
        frame.forEach((row, ry) => {
            for (let rx = 0; rx < row.length; rx++) {
                if (row[rx] === "X") ctx.fillRect(x + rx * DOT, y + ry * DOT, DOT, DOT);
            }
        });
    };

    // 降ってくるコウモリの画面上の位置（描画と当たり判定で共通）
    const flakePos = (f, time) => ({
        x: Math.round((f.x + Math.sin(time * f.freq + f.phase) * f.sway) / DOT) * DOT,
        y: Math.round(f.y / DOT) * DOT,
    });

    const draw = (time) => {
        ctx.clearRect(0, 0, width, height);
        flakes.forEach((f) => {
            if (f.kind === "spider") {
                drawSpider(f, time);
                return;
            }
            const { x, y } = flakePos(f, time);
            if (f.kind === "ember") {
                drawEmber(f, x, y, time);
            } else if (f.kind === "bat") {
                drawMiniBat(f, x, y, time);
            } else {
                ctx.fillStyle = `rgba(255, 255, 255, ${f.alpha})`;
                ctx.fillRect(x, y, f.size, f.size);
            }
        });
    };

    const tick = (now) => {
        const dt = Math.min((now - last) / 1000, 0.1);
        last = now;
        flakes.forEach((f, i) => {
            if (f.kind === "spider") {
                // 蜘蛛は独自の動き。いなくなったら、その枠に新しいコウモリを上から降らせる
                if (!updateSpider(f, dt)) flakes[i] = createFlake(-24, "bat");
                return;
            }
            f.y += f.speed * dt;
            f.x += f.drift * dt;
            if (f.y > height + 24) {
                flakes[i] = createFlake(-24, f.kind);
            } else if (f.x < -40) {
                f.x += width + 80;
            } else if (f.x > width + 40) {
                f.x -= width + 80;
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

    if (isHalloween) initBatToSpider();

    resize();
    start();

    /* ---------- ハロウィン: 降ってくるコウモリを押すと蜘蛛に変身 ----------
       コウモリはゆっくり滑らかに降りるのに対し、蜘蛛は
         移動 → 急停止 → ほぼ逆方向へ素早く移動 → 急停止 → …
       をくり返してカサカサ這い回る。6〜8秒たつと画面の外へ逃げる。
       動きを減らす設定のときは、蜘蛛はその場で止まったまま少しして消える */
    function initBatToSpider() {
        // ボタンやリンク、カードの上は押しても反応させない（雪のキャンバスは一番奥にあるため）
        const BLOCK = "a, button, input, label, textarea, select, [role='button'], .pixel-card, .voice__card, .global-nav, .site-header, .site-footer";
        const HIT_PAD = 12; // 当たり判定を絵より少し広く（小さく動くので押しやすく）

        const findBat = (cx, cy) => {
            const time = performance.now() / 1000;
            return flakes.find((f) => {
                if (f.kind !== "bat") return false;
                const { x, y } = flakePos(f, time);
                return cx >= x - HIT_PAD && cx <= x + 11 * DOT + HIT_PAD && cy >= y - HIT_PAD && cy <= y + 5 * DOT + HIT_PAD;
            });
        };

        document.addEventListener("click", (event) => {
            if (event.target.closest(BLOCK)) return;
            const bat = findBat(event.clientX, event.clientY);
            if (!bat) return;
            const { x, y } = flakePos(bat, performance.now() / 1000);
            const i = flakes.indexOf(bat);
            flakes[i] = createSpider(x + 5.5 * DOT, y + 2.5 * DOT);
            if (reduceMotion.matches) {
                draw(0);
                setTimeout(() => {
                    const j = flakes.indexOf(flakes[i]);
                    if (flakes[j] && flakes[j].kind === "spider") flakes[j] = createFlake(random(0, height), "bat");
                    draw(0);
                }, 2500);
            }
        });

        // PC: コウモリの上ではカーソルを指の形に
        let hoverRaf = 0;
        document.addEventListener("mousemove", (event) => {
            if (hoverRaf) return;
            hoverRaf = requestAnimationFrame(() => {
                hoverRaf = 0;
                const over = !event.target.closest(BLOCK) && findBat(event.clientX, event.clientY);
                document.documentElement.classList.toggle("is-over-bat", Boolean(over));
            });
        });
    }

    function createSpider(cx, cy) {
        return {
            kind: "spider",
            cx,
            cy,
            state: "move", // move → stop → dash → pause → move …（flee = 逃げる）
            stateLeft: random(0.3, 0.6),
            angle: random(0, Math.PI * 2),
            speed: random(170, 230), // コウモリ（14〜32px/秒）よりずっと速い
            life: random(6, 8),
            legPhase: 0,
            puff: 0.28, // 変身したときの煙の残り時間
            alpha: 1,
        };
    }

    // 次に向かう方向が画面の外へ向かうなら、端からはね返る向きに直す
    function keepInside(sp, dist) {
        const m = 16;
        let dx = Math.cos(sp.angle) * dist;
        let dy = Math.sin(sp.angle) * dist;
        if (sp.cx + dx < m || sp.cx + dx > width - m) dx = -dx;
        if (sp.cy + dy < m || sp.cy + dy > height - m) dy = -dy;
        sp.angle = Math.atan2(dy, dx);
    }

    // 戻り値 false = 画面から消えた
    function updateSpider(sp, dt) {
        if (sp.puff > 0) sp.puff -= dt;
        sp.life -= dt;
        if (sp.life <= 0 && sp.state !== "flee") {
            // 一番近い画面の端へ一気に逃げる
            const ex = sp.cx < width / 2 ? -40 : width + 40;
            const ey = sp.cy < height / 2 ? -40 : height + 40;
            sp.angle = Math.abs(ex - sp.cx) < Math.abs(ey - sp.cy) ? (ex < 0 ? Math.PI : 0) : (ey < 0 ? -Math.PI / 2 : Math.PI / 2);
            sp.angle += random(-0.3, 0.3);
            sp.state = "flee";
            sp.speed = 320;
        }

        if (sp.state === "move" || sp.state === "dash" || sp.state === "flee") {
            sp.cx += Math.cos(sp.angle) * sp.speed * dt;
            sp.cy += Math.sin(sp.angle) * sp.speed * dt;
            sp.legPhase += dt * 14; // 移動中だけ脚を動かす
        }
        if (sp.state === "flee") {
            return sp.cx > -40 && sp.cx < width + 40 && sp.cy > -40 && sp.cy < height + 40;
        }

        sp.stateLeft -= dt;
        if (sp.stateLeft > 0) return true;

        // 状態の切り替え（減速せず、その瞬間にピタッと止まる／走り出す）
        if (sp.state === "move") {
            sp.state = "stop";
            sp.stateLeft = Math.random() < 0.2 ? random(0.45, 0.8) : random(0.1, 0.3); // ときどき長めに止まる
        } else if (sp.state === "stop") {
            sp.state = "dash"; // ほぼ逆方向へ、さらに速く
            sp.angle += Math.PI + random(-0.45, 0.45);
            sp.speed = random(260, 340);
            sp.stateLeft = random(0.15, 0.4);
            keepInside(sp, sp.speed * sp.stateLeft);
        } else if (sp.state === "dash") {
            sp.state = "pause";
            sp.stateLeft = random(0.1, 0.25);
        } else {
            sp.state = "move"; // 新しい方向（上下左右・斜め）
            sp.angle = Math.floor(random(0, 8)) * (Math.PI / 4) + random(-0.25, 0.25);
            sp.speed = random(170, 230);
            sp.stateLeft = random(0.3, 0.6);
            keepInside(sp, sp.speed * sp.stateLeft);
        }
        return true;
    }

    function drawSpider(sp, time) {
        const frame = SPIDER_FRAMES[Math.floor(sp.legPhase) % 2];
        const ox = Math.round((sp.cx - 5.5 * DOT) / DOT) * DOT;
        const oy = Math.round((sp.cy - 3.5 * DOT) / DOT) * DOT;
        frame.forEach((row, ry) => {
            for (let rx = 0; rx < row.length; rx++) {
                const c = row[rx];
                if (c === ".") continue;
                ctx.fillStyle = c === "o" ? "rgba(255, 177, 74, 0.95)" : "rgba(24, 12, 36, 0.95)";
                ctx.fillRect(ox + rx * DOT, oy + ry * DOT, DOT, DOT);
            }
        });
        // 変身の煙（ドットが外へ広がって消える）
        if (sp.puff > 0) {
            const t = 1 - sp.puff / 0.28;
            ctx.fillStyle = `rgba(217, 206, 244, ${(1 - t).toFixed(2)})`;
            for (let k = 0; k < 8; k++) {
                const a = (k / 8) * Math.PI * 2;
                const r = 6 + t * 18;
                ctx.fillRect(Math.round((sp.cx + Math.cos(a) * r) / DOT) * DOT, Math.round((sp.cy + Math.sin(a) * r) / DOT) * DOT, DOT * 2, DOT * 2);
            }
        }
    }
}

// コウモリが変身する蜘蛛（11×7 ドット、2枚で脚が動く。o = 目）
const SPIDER_FRAMES = [
    [
        "X.X.....X.X",
        ".X.X...X.X.",
        "..XXXXXXX..",
        "XXXoXXXoXXX",
        "..XXXXXXX..",
        ".X.X...X.X.",
        "X...X.X...X",
    ],
    [
        ".X.X...X.X.",
        "X..X...X..X",
        "..XXXXXXX..",
        "XXXoXXXoXXX",
        "..XXXXXXX..",
        "X.X.....X.X",
        ".X..X.X..X.",
    ],
];

// 降ってくる小さなコウモリ（11×5 ドット、2枚で羽ばたき）
const MINI_BAT_FRAMES = [
    [
        "X.........X",
        "XX..X.X..XX",
        ".XXXXXXXXX.",
        "...XXXXX...",
        "....X.X....",
    ],
    [
        "....X.X....",
        "....XXX....",
        ".XXXXXXXXX.",
        "XX..XXX..XX",
        "X.........X",
    ],
];

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

/* ---------- ハロウィン: FV のコウモリ登場アニメーション ----------
   ページを開いたときに1回だけ、今見えている画面の奥（中央）から手前へコウモリが飛んでくる
   （再読み込みでページの途中が表示されていても、その画面の上で再生する）。
   動きは CSS（styles.css の .bat-intro）で、コウモリごとの方向・速さ・出現タイミング・拡大率を
   CSS 変数でランダムに渡す。終わったら要素ごと削除する。動きを減らす設定のときは再生しない */
const BAT_FRAMES = {
    // 16×9 ドット（X = 体・翼の縁 / w = 翼の膜）。2枚を交互に表示して羽ばたかせる
    up: [
        "X..............X",
        "XX............XX",
        "XwX...X..X...XwX",
        "XwwX..XXXX..XwwX",
        "XwwwXXXXXXXXwwwX",
        ".XwwwXXXXXXwwwX.",
        "..XXX.XXXX.XXX..",
        ".......XX.......",
        "................",
    ],
    down: [
        "................",
        "......X..X......",
        "......XXXX......",
        "..XXXXXXXXXXXX..",
        ".XwwwXXXXXXwwwX.",
        "XwwwX.XXXX.XwwwX",
        "XwwX...XX...XwwX",
        "XwX..........XwX",
        "X..............X",
    ],
};

// ドット絵をそのまま SVG の四角形に変換（ぼかしなしで拡大できる）
function batFrameSvg(rows, cls) {
    const paths = { X: "", w: "" };
    rows.forEach((row, y) => {
        [...row].forEach((c, x) => {
            if (paths[c] !== undefined) paths[c] += `M${x} ${y}h1v1h-1z`;
        });
    });
    return `<g class="${cls}"><path class="bat__body" d="${paths.X}"/><path class="bat__wing" d="${paths.w}"/></g>`;
}

function playHalloweenBats() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const isSp = window.matchMedia("(max-width: 767px)").matches;
    const count = isSp ? 9 : 14;
    const random = (min, max) => min + Math.random() * (max - min);
    const svg = `<svg viewBox="0 0 16 9" aria-hidden="true">${batFrameSvg(BAT_FRAMES.up, "bat__up")}${batFrameSvg(BAT_FRAMES.down, "bat__down")}</svg>`;

    const layer = document.createElement("div");
    layer.className = "bat-intro";
    layer.setAttribute("aria-hidden", "true");

    let total = 0;
    for (let i = 0; i < count; i++) {
        const bat = document.createElement("div");
        bat.className = "bat-intro__bat";
        // 方向を均等に散らし（少しずつ揺らす）、画面の外まで飛ばす
        const angle = (i / count) * Math.PI * 2 + random(-0.35, 0.35);
        const dist = random(70, 95); // 画面の長辺に対する %（vmax 単位）
        // 暗転が明けはじめる 0.25 秒後から、順番に少しずつずらして飛び出す
        const delay = 0.25 + (i / count) * 0.45 + random(0, 0.12);
        const dur = random(1.4, 1.75);
        total = Math.max(total, delay + dur);
        bat.style.cssText = [
            `--x0: ${random(-6, 6).toFixed(1)}vmin`,
            `--y0: ${random(-4, 4).toFixed(1)}vmin`,
            `--tx: ${(Math.cos(angle) * dist).toFixed(1)}vmax`,
            `--ty: ${(Math.sin(angle) * dist * 0.75).toFixed(1)}vmax`,
            `--s1: ${random(2, 3.4).toFixed(2)}`,
            `--rot: ${random(-18, 18).toFixed(0)}deg`,
            `--dur: ${dur.toFixed(2)}s`,
            `--delay: ${delay.toFixed(2)}s`,
            `--flap: ${random(0.16, 0.24).toFixed(2)}s`,
        ].join(";");
        bat.innerHTML = svg;
        layer.appendChild(bat);
    }

    document.body.appendChild(layer);
    // 全員が飛び去ったら削除（最大でも約2.6秒）
    setTimeout(() => layer.remove(), (total + 0.1) * 1000);
}

/* ---------- ハロウィン: ランタンで夜にする ----------
   ランタンを押す（クリック・タップ・Enter/Space）たびに、点灯 ⇔ 消灯を切り替える。
   状態は <html data-lantern="on|off"> で持ち、消灯のときは CSS（body::after）が画面全体に暗い幕を重ねる。
   再読み込みすると点灯（初期状態）に戻る。
   火が消えたランタンの画像を用意したら、LANTERN_OFF_SRC に指定すると画像も連動して切り替わる */
const LANTERN_OFF_SRC = "images/冬合宿LP＿イラスト＿svg＿ハロウィン/ランタン＿消灯＿h.svg";

function initLanternSwitch() {
    const lantern = document.querySelector(".schedule__lantern");
    if (!lantern) return;
    const root = document.documentElement;
    const onSrc = lantern.dataset.halloweenSrc || lantern.getAttribute("src");

    // 画像をボタンとして扱う（キーボード操作・読み上げに対応）
    lantern.setAttribute("role", "button");
    lantern.setAttribute("tabindex", "0");
    lantern.setAttribute("aria-label", "ランタンの明かりを切り替える");

    const setLit = (lit) => {
        root.dataset.lantern = lit ? "on" : "off";
        lantern.setAttribute("aria-pressed", String(!lit));
        if (LANTERN_OFF_SRC) lantern.src = lit ? onSrc : LANTERN_OFF_SRC;
    };
    const toggle = () => setLit(root.dataset.lantern === "off");

    lantern.addEventListener("click", toggle);
    lantern.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            toggle();
        }
    });

    setLit(true);
}

/* ---------- ハロウィン: テントを押すと黒猫が出てきて歩き去る ----------
   猫は images/…ハロウィン/猫/cat_1〜cat_10.svg の10枚を順に切り替えるコマ送り（約10fps）。
   ① テントの後ろから歩いて出てくる
   ② 0.5秒ほど立ち止まる（静止コマ cat_5）
   ③ そのまま左へ歩いて画面の外へ（SP は少し小さく表示）
   原画の向き（左向き）のまま、テントの左の裾から出て左へ進む。
   移動はコマ送りと連動（1コマで CAT_STEP ドット前進）させ、足が地面を滑らないようにする。
   猫がいる間はテントを押しても新しい猫は出さない */
const CAT_DIR = "images/冬合宿LP＿イラスト＿svg＿ハロウィン/猫/";
// 各コマの大きさ（ドット数。原画の 1 ドット = viewBox の 7）と、耳の先の列。
// 原画はコマごとに絵ぴったりで切り抜かれているため、耳の先の列と足元（下端）をそろえて重ねる
const CAT_ART = [
    { w: 35, h: 30, ear: 3 },
    { w: 34, h: 31, ear: 3 },
    { w: 37, h: 31, ear: 6 },
    { w: 33, h: 30, ear: 3 },
    { w: 33, h: 28, ear: 3 },
    { w: 33, h: 30, ear: 3 },
    { w: 35, h: 32, ear: 5 },
    { w: 38, h: 34, ear: 3 },
    { w: 34, h: 33, ear: 3 },
    { w: 35, h: 31, ear: 3 },
];
const CAT_FRAMES = CAT_ART.length;
const CAT_EAR = Math.max(...CAT_ART.map((a) => a.ear)); // 共通の表示領域での耳の先の列
const CAT_W = Math.max(...CAT_ART.map((a) => CAT_EAR - a.ear + a.w)); // 共通の表示領域（ドット数）
const CAT_H = Math.max(...CAT_ART.map((a) => a.h));
const CAT_NOSE = CAT_EAR - 3; // 鼻先の列（原画の向き＝左向きで数える）
const CAT_FRAME_MS = 100; // 1コマの長さ（10fps、10コマで1周約1秒）
const CAT_FAST_MS = 55; // 立ち止まったあとの1コマの長さ（約18fps）。コマ送りを速めて歩調を上げる（1コマの歩幅は同じなので足は滑らない）
const CAT_SPEEDUP = 10; // 立ち止まったあと、何コマかけて CAT_FAST_MS まで速めるか
const CAT_STEP = 2.5; // 1コマで進むドット数（接地している足が原画で1コマに動く量の平均）
const CAT_STILL = 4; // 立ち止まるときのコマ（cat_5）
const CAT_BACK = CAT_EAR - CAT_ART[CAT_STILL].ear + CAT_ART[CAT_STILL].w; // 静止コマのお尻・しっぽ側の端の列
const CAT_SP_SCALE = 0.7; // SP の大きさ（PC 比）

function initTentCat() {
    const tent = document.querySelector(".fv__tent");
    const scene = tent && tent.parentElement;
    if (!tent || !scene) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let active = false;

    // 10枚を先に読み込んでおき、切り替えたときのちらつきを防ぐ
    const srcs = CAT_ART.map((_, i) => `${CAT_DIR}cat_${i + 1}.svg`);
    srcs.forEach((src) => {
        const img = new Image();
        img.src = src;
    });

    tent.classList.add("is-cat-tent");

    tent.addEventListener("click", () => {
        if (active) return; // 連打しても1匹だけ
        active = true;

        // テントの位置を基準に計算（テントの画像は左右反転して表示している）
        const sr = scene.getBoundingClientRect();
        const tr = tent.getBoundingClientRect();
        const tentLeft = tr.left - sr.left;
        // テントの左の裾（テント本体の左端 = 幅の12%、裾の高さ = 高さの63%）から出て、BBQ の後ろを左へ
        const tentEdge = tentLeft + tr.width * 0.12;
        const isSp = window.matchMedia("(max-width: 767px)").matches;
        let ground = tr.top - sr.top + tr.height * 0.63;
        // PC は BBQ の人の帽子（てっぺんは BBQ 画像の高さの約6.4%）より上を通し、立ち止まったときに足元が隠れないようにする
        const bbq = scene.querySelector(".fv__bbq");
        if (!isSp && bbq) {
            const br = bbq.getBoundingClientRect();
            ground = Math.min(ground, br.top - sr.top + br.height * 0.064 - 2);
        }
        // 1ドットを端末の整数ピクセルにして輪郭をくっきり
        const dpr = window.devicePixelRatio || 1;
        const snap = (v) => Math.round(v * dpr) / dpr;
        const baseDot = Math.max(2, Math.round((tr.width * 0.12) / 30 / 2) * 2);
        const dot = isSp ? Math.max(1, Math.round(baseDot * CAT_SP_SCALE * dpr)) / dpr : baseDot;
        const catW = dot * CAT_W;
        const catH = dot * CAT_H;
        // はじめはテントの後ろに隠れている（鼻先が左の斜面の少し内側）
        const startLeft = tentLeft + tr.width * 0.2 - CAT_NOSE * dot;

        const cat = document.createElement("div");
        cat.className = "hw-cat";
        cat.style.cssText = `left:${snap(startLeft)}px;top:${snap(ground - dot - catH)}px;width:${catW}px;height:${catH}px`;
        cat.innerHTML = `<div class="hw-cat__sprite">${CAT_ART.map(
            (a, i) =>
                `<img src="${srcs[i]}" alt="" width="${a.w * dot}" height="${a.h * dot}" style="left:${(CAT_EAR - a.ear) * dot}px">`
        ).join("")}</div>`;
        // テント横の雪の結晶・テント・BBQ より奥、木より手前に置く（テントの後ろから出て、BBQ の後ろを通って去る。FV のタイトル・看板よりも奥）
        scene.insertBefore(cat, scene.querySelector(".fv__flake-right") || tent);

        const frames = [...cat.querySelectorAll("img")];
        let x = 0; // 進んだドット数
        let f = 0;
        let timer = 0;
        let done = false;
        const show = (n) => frames.forEach((el, i) => el.classList.toggle("is-on", i === n));
        const place = () => (cat.style.transform = `translate3d(${snap(-x * dot)}px, 0, 0)`);
        const finish = () => {
            if (done) return;
            done = true;
            clearTimeout(timer);
            cat.remove();
            active = false;
        };

        // 立ち止まる位置: SP はしっぽ側の端がテントから出たところ。
        // PC は FV のタイトルのすぐ右（鼻先がタイトルの右端から1ドット離れる位置）で全身を見せる。
        // どちらも体がテントから出きる位置より手前では止まらない
        const tentOutDots = Math.ceil((startLeft + CAT_BACK * dot - tentEdge) / dot);
        const title = document.querySelector(".fv__title img");
        const titleRight = title && title.getBoundingClientRect().right - sr.left;
        const outDots =
            isSp || !title ? tentOutDots : Math.max(tentOutDots, Math.round((startLeft + CAT_NOSE * dot - (titleRight + dot)) / dot));

        if (reduceMotion.matches) {
            // 動きを減らす設定: テントの横に立っているだけで、少しして消える
            x = outDots;
            place();
            show(CAT_STILL);
            timer = setTimeout(finish, 1600);
            return;
        }

        // 歩く: 1コマごとに step ドット前進して次のコマへ。コマの長さは msAt(i)（i = 何コマ目か）。until() を満たしたら next()
        const walk = (step, msAt, until, next) => {
            let i = 0;
            const tick = () => {
                if (done) return;
                x += step;
                f = (f + 1) % CAT_FRAMES;
                place();
                show(f);
                if (until()) return next();
                i += 1;
                timer = setTimeout(tick, msAt(i));
            };
            timer = setTimeout(tick, msAt(0));
        };

        // ① ちょうど cat_5 で立ち止まる位置に着くよう、歩き出しのコマと1コマの歩幅を合わせる
        const inFrames = Math.max(1, Math.round(outDots / CAT_STEP));
        f = (((CAT_STILL - inFrames) % CAT_FRAMES) + CAT_FRAMES) % CAT_FRAMES;
        place();
        show(f);
        // 体が画面の外へ出きるまでのドット数
        const visibleLeft = Math.max(sr.left, 0) - sr.left;
        const exitDots = Math.ceil((startLeft + catW - visibleLeft) / dot) + 1;

        walk(
            outDots / inFrames,
            () => CAT_FRAME_MS,
            () => x >= outDots - 0.01,
            () => {
                // ② 立ち止まる
                timer = setTimeout(() => {
                    // ③ 歩調を少しずつ速めながら、歩いて画面の外へ
                    walk(
                        CAT_STEP,
                        (i) => CAT_FRAME_MS - (CAT_FRAME_MS - CAT_FAST_MS) * Math.min(1, i / CAT_SPEEDUP),
                        () => x >= exitDots,
                        finish
                    );
                }, 500);
            }
        );
    });
}
