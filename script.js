// ============================================
// BeEngineer Programming Camp - Main Script
// ============================================



/** 定員到達時は true に変更（キャンセル待ちモードへ切り替え） */
const IS_REGISTRATION_WAITLIST = true;


/**
 * DOMContentLoaded イベント
 * ページ読み込み完了後に実行
 */
document.addEventListener('DOMContentLoaded', function() {
  
  // 持ち物チェックリスト機能を初期化
  initChecklistFeature();
  
  // スムーススクロール機能を初期化
  initSmoothScroll();
  
  // ハンバーガーメニュー機能を初期化
  initHamburgerMenu();

  // SP版固定CTAの表示制御を初期化
  initMobileFixedCta();

  // オンライン説明会バナー（6/12 0:00以降は申込案内を非表示）
  initInfoSessionBanner();

  // 定員到達時のキャンセル待ち切り替え
  initRegistrationWaitlist();

  // SP版ヒーロー直下・昨年度の様子・写真マーキー
  initHeroPhotoMarquee();
  initVoicePhotoMarquee();
  initPhotoLightbox();

  // 学習プログラムのトランプ配り演出
  initProgramDealAnimation();

  // 学習プログラム背景のトランプマーク演出
  initProgramSuitFloats();

  // プログラムカードのトグル機能を初期化（SP版のみ）
  initProgramCardToggle();
  
  // 学習プログラムのタブ機能を初期化（SP版のみ）
  initProgramTabs();
  
  // スケジュールのトグル機能を初期化（SP版のみ）
  initScheduleToggle();
  
  // アクセス方法のトグル機能を初期化（SP版のみ）
  initAccessToggle();
  
  // 持ち物リストのトグル機能を初期化（SP版のみ）
  initItemsToggle();
  
  // ブログメニューのサブメニュートグル機能を初期化（SP版のみ）
  initBlogSubmenuToggle();
  
  // フロアマップのトグル機能を初期化（SP版のみ）
  initFloormapToggle();
  
  // フロアマップのタブ機能を初期化（PC版）
  initFloormapTabs();
  
  // スクロールスパイ機能を初期化
  initScrollSpy();
  
  // スケジュールタブの切り替え機能を初期化
  initScheduleTabs();
  
  // アクセスタブの切り替え機能を初期化
  initAccessTabs();
  
  // ご案内セクションのトグル機能を初期化（SP版のみ）
  initGuideToggle();
  
  // LINEアカウントセクションのトグル機能を初期化（SP版のみ）
  initLineToggle();
  
  // ブログ更新セクションのトグル機能を初期化（SP版のみ）
  initBlogUpdateToggle();
  
  // フッターのキャラクター画像をSP版でロゴの隣に配置
  initFooterCharacters();

  // CTAボタンのクリック後に押下状態が残らないようにする
  initCtaButtonReset();
  
});

/**
 * CTAボタンの押下状態リセット
 * クリック後にフォーカスを外し、押し込み演出が残るのを防ぐ
 */
function initCtaButtonReset() {
  const ctaButtons = document.querySelectorAll('.hero-cta');

  ctaButtons.forEach(button => {
    button.addEventListener('click', function() {
      setTimeout(() => {
        this.blur();
      }, 0);
    });

    button.addEventListener('touchend', function() {
      setTimeout(() => {
        this.blur();
      }, 120);
    });
  });
}

/**
 * 持ち物チェックリスト機能
 * localStorageでチェック状態を保存・復元
 */
function initChecklistFeature() {
  const checklistItems = document.querySelectorAll('.checklist-item input[type="checkbox"]');
  
  if (checklistItems.length === 0) {
    // チェックリストが存在しない場合は処理をスキップ
    return;
  }
  
  // ページ読み込み時に保存された状態を復元
  checklistItems.forEach(item => {
    const itemKey = item.getAttribute('data-item');
    const savedState = localStorage.getItem(itemKey);
    
    if (savedState === 'true') {
      item.checked = true;
      item.parentElement.classList.add('checked');
    }
  });
  
  // チェック状態の変更を監視
  checklistItems.forEach(item => {
    item.addEventListener('change', function() {
      const itemKey = this.getAttribute('data-item');
      localStorage.setItem(itemKey, this.checked);
      
      if (this.checked) {
        this.parentElement.classList.add('checked');
      } else {
        this.parentElement.classList.remove('checked');
      }
    });
  });
}

/**
 * スムーススクロール機能
 * ページ内リンクをクリックした際に滑らかにスクロール
 */
function initSmoothScroll() {
  const anchorLinks = document.querySelectorAll('a[href^="#"]');
  
  anchorLinks.forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      
      // '#' のみ、または空の場合はスキップ
      if (href === '#' || href === '') {
        return;
      }
      
      e.preventDefault();
      const target = document.querySelector(href);
      
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
        
        // URLを更新（履歴に追加）
        if (history.pushState) {
          history.pushState(null, null, href);
        }
      }
    });
  });
}

/**
 * ハンバーガーメニュー機能（SP用）
 * サイドバーの開閉を制御
 */
function initHamburgerMenu() {
  const hamburger = document.getElementById('hamburger');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('overlay');
  const sidebarLinks = document.querySelectorAll('.sidebar-nav a');
  
  if (!hamburger || !sidebar || !overlay) {
    // 要素が存在しない場合は処理をスキップ
    return;
  }
  
  // ハンバーガーボタンクリック
  hamburger.addEventListener('click', function() {
    toggleMenu();
  });
  
  // オーバーレイクリック
  overlay.addEventListener('click', function() {
    closeMenu();
  });
  
  // サイドバーのリンククリック時にメニューを閉じる
  sidebarLinks.forEach(link => {
    link.addEventListener('click', function() {
      // SP表示の場合のみメニューを閉じる
      if (window.innerWidth <= 768) {
        // ブログメニュー（サブメニューを持つ親リンク）の場合は閉じない
        if (this.parentElement.classList.contains('has-submenu')) {
          return;
        }
        closeMenu();
      }
    });
  });
  
  // メニュー開閉の切り替え
  function toggleMenu() {
    hamburger.classList.toggle('active');
    sidebar.classList.toggle('active');
    overlay.classList.toggle('active');
    
    // body のスクロールを制御
    if (sidebar.classList.contains('active')) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    updateMobileFixedCta();
  }
  
  // メニューを閉じる
  function closeMenu() {
    hamburger.classList.remove('active');
    sidebar.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = '';

    updateMobileFixedCta();
  }
}

/** オンライン説明会の申込案内を非表示にする日時（日本時間・6/12 0:00） */
const INFO_SESSION_DEADLINE = new Date('2026-06-12T00:00:00+09:00');

const INFO_SESSION_AFTER_MESSAGE =
  'オンライン説明会をご参加希望の方は、各校舎へお問い合わせください。';

/**
 * オンライン説明会の案内表示制御
 * 2026年6月12日（金）0:00（JST）以降はバナー・ナビ・文中リンクを非表示
 */
function initInfoSessionBanner() {
  const targets = document.querySelectorAll(
    '[data-info-session-banner], [data-info-session-nav], [data-info-session-inline-link]'
  );

  if (targets.length === 0) {
    return;
  }

  function hideIfPastDeadline() {
    if (Date.now() < INFO_SESSION_DEADLINE.getTime()) {
      return;
    }

    targets.forEach((element) => {
      if (element.matches('[data-info-session-nav]')) {
        element.hidden = true;
        element.style.display = 'none';
        return;
      }

      if (element.matches('[data-info-session-inline-link]')) {
        const parent = element.closest('.section-note');
        if (parent) {
          parent.textContent =
            '現在BeEngineerに通っている生徒が対象です。' + INFO_SESSION_AFTER_MESSAGE;
        }
        return;
      }

      if (element.matches('[data-info-session-banner]')) {
        const card = element.querySelector('.lp-info-session-card');
        if (card && !card.dataset.infoSessionReplaced) {
          card.dataset.infoSessionReplaced = 'true';
          card.innerHTML =
            '<p class="lp-info-session-kicker">オンライン説明会</p>' +
            '<p class="lp-info-session-text">' +
            INFO_SESSION_AFTER_MESSAGE +
            '</p>';
        }
        return;
      }

      element.hidden = true;
      element.style.display = 'none';
    });
  }

  hideIfPastDeadline();
  window.setInterval(hideIfPastDeadline, 60000);
}


const REGISTRATION_APPLY_URL = 'https://be-engineer.tech/event-list/447';
const WAITLIST_FORM_URL = 'https://forms.gle/XFsLSMGvhCQYjpGT7';

const WAITLIST_NOTICE_LINE1 =
  '好評につき、定員に達しました。誠にありがとうございます。';
const WAITLIST_NOTICE_LINE2 =
  'キャンセル待ちをご希望される方は「キャンセル待ちフォーム」より登録をお願いします。';

function renderWaitlistNotice(element) {
  element.innerHTML = WAITLIST_NOTICE_LINE1 + '<br>' + WAITLIST_NOTICE_LINE2;
}

const WAITLIST_CAPACITY_LABEL = '定員に達しました（キャンセル待ち受付中）';

/**
 * 定員到達時に申込CTAをキャンセル待ちフォームへ切り替え
 */
function initRegistrationWaitlist() {
  if (!IS_REGISTRATION_WAITLIST) {
    return;
  }

  document.querySelectorAll('[data-registration-cta]').forEach(function(link) {
    link.href = WAITLIST_FORM_URL;

    if (link.classList.contains('character-speech-cta')) {
      const label = link.querySelector('span');
      if (label) {
        label.textContent = 'キャンセル待ち';
      }
      return;
    }

    if (link.classList.contains('mobile-fixed-cta')) {
      link.textContent = 'キャンセル待ちフォーム';
      return;
    }

    link.textContent = 'キャンセル待ちフォーム';
  });

  document.querySelectorAll('[data-capacity-status]').forEach(function(element) {
    element.textContent = WAITLIST_CAPACITY_LABEL;
  });

  const heroKicker = document.querySelector('.hero-kicker');
  if (heroKicker) {
    heroKicker.innerHTML = '2026年度 <br class="sp-br">キャンセル待ち受付';
  }

  const heroCtaGroup = document.querySelector('.hero-cta-group');
  if (heroCtaGroup && !document.querySelector('.hero-panel .lp-waitlist-notice')) {
    const notice = document.createElement('p');
    notice.className = 'lp-waitlist-notice';
    renderWaitlistNotice(notice);
    heroCtaGroup.parentElement.insertBefore(notice, heroCtaGroup);
  }

  const applyLead = document.querySelector('[data-apply-lead]');
  if (applyLead) {
    renderWaitlistNotice(applyLead);
  }

  const applyDetail = document.querySelector('[data-apply-detail]');
  if (applyDetail) {
    applyDetail.textContent = '下記ボタンからキャンセル待ちフォームへお進みください。';
  }

  const faqAnswer = document.querySelector('[data-faq-registration-answer]');
  if (faqAnswer) {
    renderWaitlistNotice(faqAnswer);
  }
}

/** SP版ヒーロー直下マーキー用（hero 14枚） */
const HERO_MARQUEE_PHOTOS = [
  { src: 'assets/photos/hero/hero-01.jpg', alt: '合宿の様子' },
  { src: 'assets/photos/hero/hero-02.jpg', alt: '合宿の様子' },
  { src: 'assets/photos/hero/hero-03.jpg', alt: '合宿の様子' },
  { src: 'assets/photos/hero/hero-04.jpg', alt: '合宿の様子' },
  { src: 'assets/photos/hero/hero-05.jpg', alt: '合宿の様子' },
  { src: 'assets/photos/hero/hero-06.jpg', alt: '合宿の様子' },
  { src: 'assets/photos/hero/hero-07.jpg', alt: '合宿の様子' },
  { src: 'assets/photos/hero/hero-08.jpg', alt: '合宿の様子' },
  { src: 'assets/photos/hero/hero-09.jpg', alt: '合宿の様子' },
  { src: 'assets/photos/hero/hero-10.jpg', alt: '合宿の様子' },
  { src: 'assets/photos/hero/hero-11.jpg', alt: '合宿の様子' },
  { src: 'assets/photos/hero/hero-12.jpg', alt: '合宿の様子' },
  { src: 'assets/photos/hero/hero-13.jpg', alt: '合宿の様子' },
  { src: 'assets/photos/hero/hero-14.jpg', alt: '合宿の様子' }
];

/** 昨年度の様子マーキー用写真（hero + voice） */
const VOICE_MARQUEE_PHOTOS = HERO_MARQUEE_PHOTOS.map(function(photo) {
  return { src: photo.src, alt: '昨年度合宿の様子' };
}).concat([
  { src: 'assets/photos/voice/voice-01.jpg', alt: '昨年度合宿：プログラミングの様子' },
  { src: 'assets/photos/voice/voice-02.jpg', alt: '昨年度合宿：学習の様子' },
  { src: 'assets/photos/voice/voice-03.jpg', alt: '昨年度合宿：参加者の様子' },
  { src: 'assets/photos/voice/voice-04.jpg', alt: '昨年度合宿：参加者の様子' },
  { src: 'assets/photos/voice/voice-05.jpg', alt: '昨年度合宿：参加者の様子' },
  { src: 'assets/photos/voice/voice-06.jpg', alt: '昨年度合宿：参加者の様子' }
]);

/**
 * 写真マーキーのトラックを生成
 */
function buildPhotoMarquee(track, photos) {
  if (!track || photos.length === 0) {
    return;
  }

  const loopPhotos = photos.concat(photos);

  loopPhotos.forEach(function(photo, index) {
    const isDuplicate = index >= photos.length;
    const item = document.createElement('li');
    item.className = 'lp-photo-marquee-item';

    if (isDuplicate) {
      item.setAttribute('aria-hidden', 'true');
    }

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'lp-photo-marquee-thumb';
    button.setAttribute('aria-label', isDuplicate ? '写真を拡大表示' : `${photo.alt}（拡大表示）`);

    const image = document.createElement('img');
    image.src = photo.src;
    image.alt = isDuplicate ? '' : photo.alt;
    image.width = 128;
    image.height = 86;
    image.decoding = 'async';

    if (index > 0) {
      image.loading = 'lazy';
    }

    button.appendChild(image);
    item.appendChild(button);
    track.appendChild(item);
  });

  const durationSeconds = Math.max(60, photos.length * 7);
  track.style.setProperty('--marquee-duration', `${durationSeconds}s`);
}

/**
 * SP版・ヒーロー直下の写真マーキー
 */
function initHeroPhotoMarquee() {
  buildPhotoMarquee(
    document.querySelector('[data-hero-marquee-track]'),
    HERO_MARQUEE_PHOTOS
  );
}

/**
 * 昨年度の様子・写真マーキー（hero と voice の全写真をループ表示）
 */
function initVoicePhotoMarquee() {
  buildPhotoMarquee(
    document.querySelector('[data-voice-marquee-track]'),
    VOICE_MARQUEE_PHOTOS
  );
}

/**
 * マーキー写真クリックで拡大表示（スクロール位置を維持）
 */
function initPhotoLightbox() {
  const marquees = document.querySelectorAll('.lp-photo-marquee');

  if (marquees.length === 0) {
    return;
  }

  let activeLightbox = null;
  let activeLightboxImage = null;
  let activeMarquee = null;

  function closeLightbox() {
    if (!activeLightbox || !activeLightboxImage) {
      return;
    }

    activeLightbox.hidden = true;
    activeLightbox.setAttribute('aria-hidden', 'true');
    activeLightboxImage.removeAttribute('src');

    if (activeMarquee && activeLightbox.parentElement === document.body) {
      activeMarquee.appendChild(activeLightbox);
    }

    activeMarquee?.classList.remove('is-paused');
    activeLightbox = null;
    activeLightboxImage = null;
    activeMarquee = null;
  }

  marquees.forEach(function(marquee) {
    const lightbox = marquee.querySelector('[data-photo-lightbox]');
    const lightboxImage = lightbox?.querySelector('[data-lightbox-image]');
    const track = marquee.querySelector('.lp-photo-marquee-track');

    if (!lightbox || !lightboxImage || !track) {
      return;
    }

    track.addEventListener('click', function(event) {
      const thumb = event.target.closest('.lp-photo-marquee-thumb');

      if (!thumb) {
        return;
      }

      const image = thumb.querySelector('img');

      if (!image) {
        return;
      }

      event.preventDefault();
      closeLightbox();
      activeLightbox = lightbox;
      activeLightboxImage = lightboxImage;
      activeMarquee = marquee;
      document.body.appendChild(lightbox);
      lightboxImage.src = image.currentSrc || image.src;
      lightboxImage.alt = image.alt || '合宿の様子';
      lightbox.hidden = false;
      lightbox.setAttribute('aria-hidden', 'false');
      marquee.classList.add('is-paused');
    });

    lightbox.querySelectorAll('[data-lightbox-close]').forEach(function(closeButton) {
      closeButton.addEventListener('click', closeLightbox);
    });

    lightbox.addEventListener('click', function(event) {
      if (event.target === lightbox) {
        closeLightbox();
      }
    });
  });

  document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' && activeLightbox) {
      closeLightbox();
    }
  });
}

/**
 * SP版固定CTA（参加申し込みへ）の表示制御
 * - FV（ヒーロー）表示中は非表示
 * - 申込概要（#entry）までスクロールしたら表示
 * - ハンバーガーメニュー開閉中は非表示
 */
function initMobileFixedCta() {
  const ctaBar = document.getElementById('mobile-fixed-cta-bar');
  const hero = document.getElementById('hero');
  const entry = document.getElementById('entry');

  if (!ctaBar || !hero || !entry) {
    return;
  }

  const sectionObserver = new IntersectionObserver(
    () => {
      updateMobileFixedCta();
    },
    {
      root: null,
      rootMargin: '0px 0px -20% 0px',
      threshold: [0, 0.25, 0.5, 0.75, 1]
    }
  );

  sectionObserver.observe(hero);
  sectionObserver.observe(entry);

  window.addEventListener('scroll', updateMobileFixedCta, { passive: true });
  window.addEventListener('resize', updateMobileFixedCta);

  updateMobileFixedCta();
}

/**
 * SP版固定CTAの表示状態を更新
 */
function updateMobileFixedCta() {
  const ctaBar = document.getElementById('mobile-fixed-cta-bar');
  const sidebar = document.getElementById('sidebar');
  const hero = document.getElementById('hero');
  const entry = document.getElementById('entry');

  if (!ctaBar || !hero || !entry) {
    return;
  }

  const isMobile = window.innerWidth <= 768;
  const menuOpen = sidebar && sidebar.classList.contains('active');

  if (!isMobile) {
    ctaBar.classList.remove('is-visible');
    ctaBar.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('has-mobile-cta');
    return;
  }

  const heroRect = hero.getBoundingClientRect();
  const entryRect = entry.getBoundingClientRect();
  const onFv = heroRect.bottom > window.innerHeight * 0.55;
  const entryInView = entryRect.top < window.innerHeight * 0.75;

  const entryReached =
    entryInView && !onFv;

  const shouldShow = entryReached && !menuOpen;

  ctaBar.classList.toggle('is-visible', shouldShow);
  ctaBar.setAttribute('aria-hidden', shouldShow ? 'false' : 'true');
  document.body.classList.toggle('has-mobile-cta', shouldShow);
}

/**
 * 学習プログラムセクションのトランプ配り演出
 * 山札が画面下1/3に到達したタイミングでカードを順番に並べる
 */
function initProgramDealAnimation() {
  const hand = document.querySelector('[data-program-deal]');
  const deck = hand?.querySelector('.program-deal-deck');
  const fallbackTarget = hand?.querySelector('.program-card-hand-core') || hand;

  if (!hand || !fallbackTarget) {
    return;
  }

  let triggered = false;

  const revealHand = () => {
    hand.classList.add('is-dealt');
  };

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    revealHand();
    return;
  }

  const triggerTarget =
    deck && window.getComputedStyle(deck).display !== 'none' ? deck : fallbackTarget;

  const isInBottomThird = (rect) => {
    const bottomThirdStart = window.innerHeight * (2 / 3);
    return rect.bottom > bottomThirdStart && rect.top < window.innerHeight;
  };

  const startDeal = () => {
    if (triggered) {
      return;
    }
    triggered = true;
    observer.unobserve(triggerTarget);
    // 山札が下1/3に来てから少し見せてから配る
    window.setTimeout(revealHand, 250);
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          startDeal();
        }
      });
    },
    {
      threshold: 0,
      // 画面下1/3（上67%を除いた領域）に入ったら発火
      rootMargin: '-67% 0px 0px 0px'
    }
  );

  observer.observe(triggerTarget);

  // ページ内リンク等ですでに下1/3にある場合
  requestAnimationFrame(() => {
    const rect = triggerTarget.getBoundingClientRect();

    if (isInBottomThird(rect)) {
      startDeal();
    }
  });
}

/**
 * 学習プログラムセクション背景のトランプマーク演出
 * スート・ランク・カードをランダムな位置で薄く表示し、フェードアウトさせる
 */
function initProgramSuitFloats() {
  const section = document.getElementById('program');
  const container = section?.querySelector('[data-program-suit-floats]');

  if (!section || !container) {
    return;
  }

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  const FLOAT_PEAK = 0.13;
  const suits = [
    { char: '♠', tone: 'black' },
    { char: '♣', tone: 'black' },
    { char: '♥', tone: 'red' },
    { char: '♦', tone: 'red' }
  ];
  const ranks = ['A', 'K', 'Q', 'J', '10', '9'];
  const floatTypes = ['suit', 'rank', 'cardFace', 'cardBack'];

  let isActive = false;
  let spawnTimer = null;
  const maxFloats = window.innerWidth <= 768 ? 7 : 12;

  const randomBetween = (min, max) => Math.random() * (max - min) + min;

  const applyFloatMotion = (el, left, top, duration, rotate, rotateEnd) => {
    el.style.left = `${left}%`;
    el.style.top = `${top}%`;
    el.style.setProperty('--float-duration', `${duration}s`);
    el.style.setProperty('--float-rotate', `${rotate}deg`);
    el.style.setProperty('--float-rotate-end', `${rotateEnd}deg`);
    el.style.setProperty('--float-peak', String(FLOAT_PEAK));
  };

  const createCardFace = (suit, rank) => {
    const el = document.createElement('div');
    el.className = `program-suit-float program-suit-float--card program-suit-float--face program-suit-float--${suit.tone}`;

    const corner = document.createElement('span');
    corner.className = 'program-suit-float-card-corner';
    corner.textContent = rank;

    const cornerSuit = document.createElement('span');
    cornerSuit.textContent = suit.char;
    corner.appendChild(cornerSuit);

    const center = document.createElement('span');
    center.className = 'program-suit-float-card-center';
    center.textContent = suit.char;

    el.append(corner, center);
    return el;
  };

  const spawnFloat = () => {
    if (!isActive || container.children.length >= maxFloats) {
      return;
    }

    const suit = suits[Math.floor(Math.random() * suits.length)];
    const floatType = floatTypes[Math.floor(Math.random() * floatTypes.length)];
    const left = randomBetween(3, 97);
    const top = randomBetween(5, 95);
    const duration = randomBetween(2.8, 6);
    const rotate = randomBetween(-40, 40);
    const rotateEnd = rotate + randomBetween(-18, 18);

    let el;

    if (floatType === 'cardFace') {
      const rank = ranks[Math.floor(Math.random() * ranks.length)];
      el = createCardFace(suit, rank);
      el.style.setProperty('--card-width', `${randomBetween(4.2, 7.2)}rem`);
      el.style.fontSize = `${randomBetween(1.8, 2.6)}rem`;
    } else if (floatType === 'cardBack') {
      el = document.createElement('div');
      el.className = 'program-suit-float program-suit-float--card program-suit-float--back';
      el.style.setProperty('--card-width', `${randomBetween(4.2, 7.2)}rem`);
    } else if (floatType === 'rank') {
      const rank = ranks[Math.floor(Math.random() * ranks.length)];
      el = document.createElement('span');
      el.className = `program-suit-float program-suit-float--rank program-suit-float--${suit.tone}`;
      el.textContent = `${rank}${suit.char}`;
      el.style.fontSize = `${randomBetween(1.8, 3.2)}rem`;
    } else {
      el = document.createElement('span');
      el.className = `program-suit-float program-suit-float--${suit.tone}`;
      el.textContent = suit.char;
      el.style.fontSize = `${randomBetween(3, 7)}rem`;
    }

    applyFloatMotion(el, left, top, duration, rotate, rotateEnd);
    container.appendChild(el);
    el.addEventListener('animationend', () => el.remove(), { once: true });
  };

  const startFloats = () => {
    if (isActive) {
      return;
    }
    isActive = true;

    for (let i = 0; i < 6; i += 1) {
      window.setTimeout(spawnFloat, i * 350);
    }

    spawnTimer = window.setInterval(spawnFloat, 850);
  };

  const stopFloats = () => {
    isActive = false;

    if (spawnTimer) {
      window.clearInterval(spawnTimer);
      spawnTimer = null;
    }
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          startFloats();
        } else {
          stopFloats();
          container.replaceChildren();
        }
      });
    },
    { threshold: 0.08 }
  );

  observer.observe(section);

  window.addEventListener('resize', () => {
    if (!isActive) {
      return;
    }
    stopFloats();
    startFloats();
  }, { passive: true });
}

/**
 * プログラムカードのトグル機能（SP版のみ）
 * カードヘッダーをタップして内容の表示/非表示を切り替え
 */
function initProgramCardToggle() {
  const programCards = document.querySelectorAll('[data-program-card]');
  
  if (programCards.length === 0) {
    // プログラムカードが存在しない場合は処理をスキップ
    return;
  }
  
  programCards.forEach(card => {
    const cardHeader = card.querySelector('.card-header');
    
    if (!cardHeader) {
      return;
    }
    
    // カードヘッダーをクリックした時の処理
    cardHeader.addEventListener('click', function() {
      // SP版（768px以下）の場合のみトグル機能を有効化
      if (window.innerWidth <= 768) {
        card.classList.toggle('active');
      }
    });
  });
  
  // ウィンドウリサイズ時にPC版に戻った場合は、全てのカードを開いた状態にする
  window.addEventListener('resize', function() {
    if (window.innerWidth > 768) {
      programCards.forEach(card => {
        card.classList.remove('active');
      });
    }
  });
}

/**
 * スケジュールのトグル機能（SP版のみ）
 * SP版でもPC版と同じデザインを保持
 */
function initScheduleToggle() {
  // SP版では特別な処理は不要（CSSで制御）
  return;
}

/**
 * アクセス方法のトグル機能（SP版のみ）
 * 各項目をタップして詳細の表示/非表示を切り替え
 */
function initAccessToggle() {
  const accessItems = document.querySelectorAll('[data-access-item]');
  
  if (accessItems.length === 0) {
    // アクセス項目が存在しない場合は処理をスキップ
    return;
  }
  
  accessItems.forEach(item => {
    const header = item.querySelector('.access-item-header');
    
    if (!header) {
      return;
    }
    
    // ヘッダーをクリックした時の処理
    header.addEventListener('click', function() {
      // SP版（768px以下）の場合のみトグル機能を有効化
      if (window.innerWidth <= 768) {
        item.classList.toggle('active');
      }
    });
  });
  
  // ウィンドウリサイズ時にPC版に戻った場合は、全ての項目を閉じる
  window.addEventListener('resize', function() {
    if (window.innerWidth > 768) {
      accessItems.forEach(item => {
        item.classList.remove('active');
      });
    }
  });
}

/**
 * 持ち物リストのトグル機能（SP版のみ）
 * ヘッダーをタップして詳細の表示/非表示を切り替え
 */
function initItemsToggle() {
  const itemsMobile = document.querySelector('[data-items-mobile]');
  
  if (!itemsMobile) {
    // 持ち物リストのモバイル版が存在しない場合は処理をスキップ
    return;
  }
  
  const header = itemsMobile.querySelector('.items-mobile-header');
  
  if (!header) {
    return;
  }
  
  // ヘッダーをクリックした時の処理
  header.addEventListener('click', function() {
    // SP版（768px以下）の場合のみトグル機能を有効化
    if (window.innerWidth <= 768) {
      itemsMobile.classList.toggle('active');
    }
  });
  
  // ウィンドウリサイズ時にPC版に戻った場合は、閉じる
  window.addEventListener('resize', function() {
    if (window.innerWidth > 768) {
      itemsMobile.classList.remove('active');
    }
  });
}

/**
 * ブログメニューのサブメニュートグル機能（SP版のみ）
 * ブログメニューをタップしてサブメニューの表示/非表示を切り替え
 */
function initBlogSubmenuToggle() {
  const blogMenuItem = document.querySelector('.sidebar-nav .has-submenu');
  
  if (!blogMenuItem) {
    // ブログメニューが存在しない場合は処理をスキップ
    return;
  }
  
  const blogLink = blogMenuItem.querySelector('a');
  
  if (!blogLink) {
    return;
  }
  
  // ブログメニューリンクをクリックした時の処理
  blogLink.addEventListener('click', function(e) {
    // SP版（768px以下）の場合のみトグル機能を有効化
    if (window.innerWidth <= 768) {
      e.preventDefault();
      blogMenuItem.classList.toggle('active');
      
      // サブメニューが開いた場合、スクロールして画面内に表示
      if (blogMenuItem.classList.contains('active')) {
        // アニメーション完了後にスクロール
        setTimeout(() => {
          const submenu = blogMenuItem.querySelector('.submenu');
          
          if (submenu) {
            // サブメニューの最後の項目（3日目）を取得
            const lastItem = submenu.querySelector('li:last-child');
            
            if (lastItem) {
              // 最後の項目を画面内に表示
              lastItem.scrollIntoView({
                behavior: 'smooth',
                block: 'end',
                inline: 'nearest'
              });
            }
          }
        }, 150);
      }
    }
  });
  
  // ウィンドウリサイズ時にPC版に戻った場合は、閉じる
  window.addEventListener('resize', function() {
    if (window.innerWidth > 768) {
      blogMenuItem.classList.remove('active');
    }
  });
}

/**
 * フロアマップのトグル機能
 * SP版でフロアマップをアコーディオン形式で開閉
 */
function initFloormapToggle() {
  const floormapItems = document.querySelectorAll('[data-floormap-item]');
  
  if (floormapItems.length === 0) {
    return;
  }
  
  floormapItems.forEach(item => {
    const header = item.querySelector('[data-floormap-header]');
    
    if (!header) return;
    
    header.addEventListener('click', function() {
      // SP版でのみ動作（768px以下）
      if (window.innerWidth <= 768) {
        // クリックされたアイテムの開閉を切り替え
        item.classList.toggle('active');
      }
    });
  });
  
  // ウィンドウリサイズ時にPC版に戻った場合は、全て開く
  window.addEventListener('resize', function() {
    if (window.innerWidth > 768) {
      floormapItems.forEach(item => {
        item.classList.remove('active');
      });
    }
  });
}

/**
 * フロアマップのタブ機能（PC版）
 * タブをクリックして各階を切り替え（アクセスと同じ形式）
 */
function initFloormapTabs() {
  const tabButtons = document.querySelectorAll('.floormap-tab-btn');
  const floormapItems = document.querySelectorAll('[data-floor-content]');
  
  if (tabButtons.length === 0 || floormapItems.length === 0) {
    return;
  }
  
  // 初期状態でPC版の場合、1Fを表示
  if (window.innerWidth > 768) {
    const firstTab = document.querySelector('.floormap-tab-btn[data-floor="floor-1f"]');
    const firstContent = document.querySelector('[data-floor-content="floor-1f"]');
    if (firstTab && firstContent) {
      firstTab.classList.add('active');
      firstContent.classList.add('active');
    }
  }
  
  // タブボタンをクリックした時の処理
  tabButtons.forEach(button => {
    button.addEventListener('click', function() {
      // PC版（768px超）の場合のみタブ機能を有効化
      if (window.innerWidth > 768) {
        const floorId = this.getAttribute('data-floor');
        const targetContent = document.querySelector(`[data-floor-content="${floorId}"]`);
        
        // すべてのタブとコンテンツから active クラスを削除
        tabButtons.forEach(btn => btn.classList.remove('active'));
        floormapItems.forEach(item => item.classList.remove('active'));
        
        // クリックされたタブと対応するコンテンツに active クラスを追加
        this.classList.add('active');
        if (targetContent) {
          targetContent.classList.add('active');
        }
      }
    });
  });
  
  // ウィンドウリサイズ時の処理
  window.addEventListener('resize', function() {
    if (window.innerWidth <= 768) {
      // SP版に戻った場合は、タブのactiveクラスをリセット
      tabButtons.forEach(btn => btn.classList.remove('active'));
      floormapItems.forEach(item => item.classList.remove('active'));
    } else {
      // PC版に戻った場合は、1Fをデフォルト表示
      const hasActive = Array.from(floormapItems).some(item => item.classList.contains('active'));
      if (!hasActive) {
        const firstTab = document.querySelector('.floormap-tab-btn[data-floor="floor-1f"]');
        const firstContent = document.querySelector('[data-floor-content="floor-1f"]');
        if (firstTab && firstContent) {
          firstTab.classList.add('active');
          firstContent.classList.add('active');
        }
      }
    }
  });
}

/**
 * スクロールスパイ機能
 * ページをスクロールした際に、現在表示されているセクションに対応するメニューをハイライト
 */
function initScrollSpy() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.sidebar-nav a[href^="#"]');
  
  if (sections.length === 0 || navLinks.length === 0) {
    return;
  }
  
  // 各セクションのIDとメニューリンクのマップを作成
  const linkMap = new Map();
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href && href !== '#') {
      linkMap.set(href.substring(1), link);
    }
  });
  
  // Intersection Observer のオプション
  const observerOptions = {
    root: null,
    rootMargin: '-20% 0px -70% 0px', // 上部20%、下部70%の範囲でトリガー
    threshold: 0
  };
  
  // 現在アクティブなセクションを追跡
  let currentActiveSection = null;
  
  // Intersection Observer のコールバック
  const observerCallback = (entries) => {
    entries.forEach(entry => {
      const sectionId = entry.target.id;
      const link = linkMap.get(sectionId);
      
      if (!link) return;
      
      if (entry.isIntersecting) {
        // セクションが表示されている場合
        // 既存のアクティブ状態をクリア
        navLinks.forEach(navLink => navLink.classList.remove('active'));
        
        // 現在のセクションのリンクをアクティブに
        link.classList.add('active');
        currentActiveSection = sectionId;
      }
    });
  };
  
  // Intersection Observer を作成
  const observer = new IntersectionObserver(observerCallback, observerOptions);
  
  // 各セクションを監視
  sections.forEach(section => {
    observer.observe(section);
  });
  
  // メニューをクリックした時にもアクティブ状態を更新
  navLinks.forEach(link => {
    link.addEventListener('click', function() {
      const href = this.getAttribute('href');
      if (href && href !== '#') {
        // 全てのアクティブ状態をクリア
        navLinks.forEach(navLink => navLink.classList.remove('active'));
        // クリックされたリンクをアクティブに
        this.classList.add('active');
      }
    });
  });
  
  // ページ読み込み時に初期状態を設定
  setTimeout(() => {
    const scrollPosition = window.scrollY;
    let foundActive = false;
    
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      
      if (scrollPosition >= sectionTop - 100 && scrollPosition < sectionTop + sectionHeight - 100) {
        const link = linkMap.get(section.id);
        if (link) {
          navLinks.forEach(navLink => navLink.classList.remove('active'));
          link.classList.add('active');
          foundActive = true;
        }
      }
    });
    
    // どのセクションにも該当しない場合は、最初のリンク（トップ）をアクティブに
    if (!foundActive && navLinks.length > 0) {
      navLinks[0].classList.add('active');
    }
  }, 100);
}

/**
 * スケジュールタブの切り替え機能
 */
function initScheduleTabs() {
  const tabButtons = document.querySelectorAll('.schedule-tabs .tab-btn');
  const tabContents = document.querySelectorAll('.schedule-row.tab-content');
  
  if (tabButtons.length === 0 || tabContents.length === 0) return;
  
  tabButtons.forEach(button => {
    button.addEventListener('click', function() {
      const targetTab = this.getAttribute('data-tab');
      const targetContent = document.getElementById(targetTab);
      
      // 同じタブを押した場合は閉じる（トグル機能）
      if (this.classList.contains('active')) {
        this.classList.remove('active');
        updateScheduleTabEmoji(this, false);
        if (targetContent) {
          targetContent.classList.remove('active');
        }
      } else {
        // すべてのタブボタンの絵文字を📅に戻す
        tabButtons.forEach(btn => {
          btn.classList.remove('active');
          updateScheduleTabEmoji(btn, false);
        });
        tabContents.forEach(content => content.classList.remove('active'));
        
        // クリックされたタブボタンとそのコンテンツにactiveクラスを追加
        this.classList.add('active');
        updateScheduleTabEmoji(this, true);
        if (targetContent) {
          targetContent.classList.add('active');
        }
      }
    });
  });
}

/**
 * スケジュールタブボタンの絵文字を更新
 * @param {HTMLElement} button - タブボタン要素
 * @param {boolean} isActive - アクティブ状態かどうか
 */
function updateScheduleTabEmoji(button, isActive) {
  const emojiSpan = button.querySelector('.tab-emoji');
  if (emojiSpan) {
    emojiSpan.textContent = isActive ? '🍁' : '📅';
  }
}

/**
 * アクセスタブの切り替え機能
 * お車/電車・バス/京都駅からのアクセス情報をタブで切り替え
 */
function initAccessTabs() {
  const tabButtons = document.querySelectorAll('.access-tab-btn');
  const tabContents = document.querySelectorAll('.access-tab-content');
  
  if (tabButtons.length === 0 || tabContents.length === 0) return;
  
  tabButtons.forEach(button => {
    button.addEventListener('click', function() {
      const targetTab = this.getAttribute('data-access-tab');
      
      // すべてのタブボタンとコンテンツからactiveクラスを削除
      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabContents.forEach(content => content.classList.remove('active'));
      
      // クリックされたタブボタンとそのコンテンツにactiveクラスを追加
      this.classList.add('active');
      const targetContent = document.getElementById('access-' + targetTab);
      if (targetContent) {
        targetContent.classList.add('active');
      }
    });
  });
}

/**
 * ご案内セクションのトグル機能（SP版のみ）
 * ヘッダーをタップして詳細の表示/非表示を切り替え
 */
function initGuideToggle() {
  const guideWrapper = document.querySelector('[data-guide-toggle]');
  
  if (!guideWrapper) {
    // ご案内セクションが存在しない場合は処理をスキップ
    return;
  }
  
  const header = guideWrapper.querySelector('.guide-toggle-header');
  
  if (!header) {
    return;
  }
  
  // ヘッダーをクリックした時の処理
  header.addEventListener('click', function() {
    // SP版（768px以下）の場合のみトグル機能を有効化
    if (window.innerWidth <= 768) {
      guideWrapper.classList.toggle('active');
    }
  });
  
  // ウィンドウリサイズ時にPC版に戻った場合は、開いた状態にする
  window.addEventListener('resize', function() {
    if (window.innerWidth > 768) {
      guideWrapper.classList.remove('active');
    }
  });
}

/**
 * LINEアカウントセクションのトグル機能（SP版のみ）
 * ヘッダーをタップして詳細の表示/非表示を切り替え
 */
function initLineToggle() {
  const lineBox = document.querySelector('[data-line-toggle]');
  
  if (!lineBox) {
    // LINEアカウントセクションが存在しない場合は処理をスキップ
    return;
  }
  
  const header = lineBox.querySelector('.line-toggle-header');
  
  if (!header) {
    return;
  }
  
  // ヘッダーをクリックした時の処理（PC版・SP版両方で有効）
  header.addEventListener('click', function() {
    lineBox.classList.toggle('active');
  });
}

/**
 * ブログ更新セクションのトグル機能（SP版のみ）
 * ヘッダーをクリックしてコンテンツの表示/非表示を切り替え
 */
function initBlogUpdateToggle() {
  const blogUpdateBox = document.querySelector('[data-blog-update-toggle]');
  
  if (!blogUpdateBox) {
    // ブログ更新セクションが存在しない場合は処理をスキップ
    return;
  }
  
  const header = blogUpdateBox.querySelector('.blog-update-header');
  
  if (!header) {
    return;
  }
  
  // ヘッダーをクリックした時の処理
  header.addEventListener('click', function() {
    // SP版（768px以下）の場合のみトグル機能を有効化
    if (window.innerWidth <= 768) {
      blogUpdateBox.classList.toggle('active');
    }
  });
  
  // ウィンドウリサイズ時にPC版に戻った場合は、開いた状態にする
  window.addEventListener('resize', function() {
    if (window.innerWidth > 768) {
      blogUpdateBox.classList.remove('active');
    }
  });
}

/**
 * 学習プログラムのタブ機能（SP版のみ）
 * タブをクリックして各CHAPTERの表示/非表示を切り替え
 */
function initProgramTabs() {
  const tabButtons = document.querySelectorAll('.program-tab-btn');
  const tabContents = document.querySelectorAll('.program-card[data-tab-content]');
  
  if (tabButtons.length === 0 || tabContents.length === 0) {
    return;
  }
  
  // タブボタンをクリックした時の処理
  tabButtons.forEach(button => {
    button.addEventListener('click', function() {
      // SP版（768px以下）の場合のみタブ機能を有効化
      if (window.innerWidth <= 768) {
        const tabNumber = this.getAttribute('data-tab');
        const targetContent = document.querySelector(`.program-card[data-tab-content="${tabNumber}"]`);
        
        // 同じタブを押した場合は非表示に（トグル機能）
        if (this.classList.contains('active')) {
          this.classList.remove('active');
          if (targetContent) {
            targetContent.classList.remove('active');
          }
        } else {
          // すべてのタブとコンテンツから active クラスを削除
          tabButtons.forEach(btn => btn.classList.remove('active'));
          tabContents.forEach(content => content.classList.remove('active'));
          
          // クリックされたタブと対応するコンテンツに active クラスを追加
          this.classList.add('active');
          if (targetContent) {
            targetContent.classList.add('active');
          }
        }
      }
    });
  });
  
  // ウィンドウリサイズ時にPC版に戻った場合は、すべてのカードを表示
  window.addEventListener('resize', function() {
    if (window.innerWidth > 768) {
      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabContents.forEach(content => content.classList.remove('active'));
    }
  });
}

/**
 * フッターのキャラクター画像をSP版でロゴの隣に配置
 */
function initFooterCharacters() {
  const logoWrapper = document.querySelector('.footer-logo-wrapper');
  const footerContent = document.querySelector('.footer-content');
  const charLeft = document.querySelector('.footer-character-left');
  const charRight = document.querySelector('.footer-character-right');
  
  if (!logoWrapper || !footerContent || !charLeft || !charRight) {
    return;
  }
  
  // 元の位置を記憶
  const originalParent = footerContent;
  
  function arrangeCharacters() {
    if (window.innerWidth <= 768) {
      // SP版：キャラクター画像をロゴの隣に移動
      if (charLeft.parentElement !== logoWrapper) {
        logoWrapper.insertBefore(charLeft, logoWrapper.firstChild);
      }
      if (charRight.parentElement !== logoWrapper) {
        logoWrapper.appendChild(charRight);
      }
    } else {
      // PC版：キャラクター画像を元の位置に戻す
      if (charLeft.parentElement !== originalParent) {
        originalParent.insertBefore(charLeft, originalParent.firstChild);
      }
      if (charRight.parentElement !== originalParent) {
        originalParent.appendChild(charRight);
      }
    }
  }
  
  // 初期配置
  arrangeCharacters();
  
  // ウィンドウリサイズ時に再配置
  window.addEventListener('resize', arrangeCharacters);
}

/**
 * チェックリストをリセット（デバッグ用）
 * 必要に応じてコンソールから実行: resetChecklist()
 */
function resetChecklist() {
  const checklistItems = document.querySelectorAll('.checklist-item input[type="checkbox"]');
  
  checklistItems.forEach(item => {
    const itemKey = item.getAttribute('data-item');
    localStorage.removeItem(itemKey);
    item.checked = false;
    item.parentElement.classList.remove('checked');
  });
  
  console.log('チェックリストがリセットされました');
}

