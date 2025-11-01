// globals

window.wp_endpoint = {
  "articles": "/wp-json/a-plat/v1/interview/",
  "articles-cat": "/wp-json/a-plat/v1/taxs/articles-cat/",
  "news": "/wp-json/a-plat/v1/news/",
  "event": "/wp-json/a-plat/v1/event/",
  "measures": "/wp-json/a-plat/v1/measures/",
  "ap-db": "/wp-json/a-plat/v1/ap-db/", /*Omnibrain*/
  "ministry": "/wp-json/a-plat/v1/ministry/",
  "institute_informatio": "/wp-json/a-plat/v1/institute_informatio/",
  "torikumi": "/wp-json/a-plat/v1/torikumi/",
  "private_sector": "/wp-json/a-plat/v1/private_sector/",
  "faq": "/wp-json/a-plat/v1/faq/",
  "plan-list": "/wp-json/a-plat/v1/plan-list/",
  "movie": "/wp-json/a-plat/v1/movie/",
  "bunya": "/wp-json/a-plat/v1/taxs/bunya/",
  "area-list": "/wp-json/a-plat/v1/taxs/area-list/",
  "business_classification": "/wp-json/a-plat/v1/taxs/business_classification/",
  "ministry-list": "/wp-json/a-plat/v1/taxs/ministry-list/",
  "institute-list": "/wp-json/a-plat/v1/taxs/institute-list/",
  "fiscal-year": "/wp-json/a-plat/v1/taxs/fiscal-year/",
  "go-sector": "/wp-json/a-plat/v1/taxs/go-sector/",
  "category": "/wp-json/a-plat/v1/taxs/category/",
  "post-tag": "/wp-json/a-plat/v1/taxs/post-tag/",
  "go-cln": "/wp-json/a-plat/v1/taxs/go-cln/",
  "prefectures": "/wp-json/a-plat/v1/taxs/prefectures/",
}

class Header {
  constructor(_el) {
    this.menu = _el;
    if (!this.menu) return;
    this.init();
  }

  init() {
    this.triggers = document.querySelectorAll('.js-header-trigger');
    this.event();
    this.hideItem();
  }

  event() {
    this.triggers.forEach(trigger => {
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        this.toggle();
      });
    });

    const headerBackground = document.querySelector('.js-header-bg');
    headerBackground?.addEventListener('click', () => this.close());
  }

  toggle() {
    this.menu.classList.contains('js-active') ? this.close() : this.open();
  }

  open() {
    this.menu.classList.add('js-active');
    this.bodyOffsetY = window.scrollY;
    document.body.style.top = `${-this.bodyOffsetY}px`;
    document.body.style.position = 'fixed';
    document.body.style.overflowY = 'scroll';
  }

  close() {
    this.menu.classList.remove('js-active');
    document.body.style.top = '';
    document.body.style.position = '';
    document.documentElement.style.scrollBehavior = 'auto';
    window.scrollTo(0, this.bodyOffsetY);
    requestAnimationFrame(() => {
      document.documentElement.style.scrollBehavior = 'smooth';
    });
  }

  hideItem() {
    const headerWrap = document.querySelector('.l-header__wrap');

    if (headerWrap) {
      gsap.to(headerWrap, {
        scrollTrigger: {
          start: 700, // ← ここを変更：600pxスクロールで発火
          end: 701,
          scrub: true,
          onEnter: () => headerWrap.classList.add('js-hidden'),
          onLeaveBack: () => headerWrap.classList.remove('js-hidden'),
        }
      });
    }
  }
}


class AnchorLink {
  constructor({ delay = 500 } = {}) {
    this.delay = delay;
    window.addEventListener('load', this.handleLoad());
  }

  handleLoad() {
    const query = window.location.search;

    if (query.startsWith('?')) {
      // 遅延ジャンプ
      setTimeout(() => {
        const id = query.slice(1);
        const targetElement = document.querySelector(`#${id}`);

        if (targetElement) {
          // クエリを消す
          const url = new URL(window.location.href);
          history.replaceState(null, '', url.pathname + url.hash);

          location.href = `#${id}`;
        }
      }, this.delay);
    }
  }

  destroy() {
    // イベント解除などクリーンアップしたいとき用
    window.removeEventListener('load', this.handleLoad);
  }
}

class Side {
  constructor(_el) {
    this.side = _el;
    if (!this.side) return;
    this.init();
  }

  init() {
    this.triggers = this.side.querySelectorAll('.js-side-menu-trigger');
    this.closeTrigger = this.side.querySelector('.js-side-menu-close-trigger');
    this.sideMenus = this.side.querySelectorAll('.js-side-menu');
    this.closeBtns = this.side.querySelectorAll('.js-side-menu-close');
    this.sideBackground = this.side.querySelector('.l-side__bg');
    this.sideState = -1;
    this.hoverTimeout = null;
    this.slideValue = -20;

    this.setActiveMenu();
    this.prepareMenus();
    this.bindEvents();
  }

  prepareMenus() {
    this.sideMenus.forEach(menu => {
      gsap.set(menu, { x: this.slideValue, opacity: 0, visibility: 'hidden' });
    });
  }

  bindEvents() {
    this.triggers.forEach((trigger, i) => {
      trigger.addEventListener('click', () => this.toggle(i));

      trigger.addEventListener('mouseenter', () => {
        clearTimeout(this.hoverTimeout);
        this.hoverTimeout = setTimeout(() => this.toggle(i), 500);
      });

      trigger.addEventListener('mouseleave', () => {
        clearTimeout(this.hoverTimeout);
      });

      trigger.addEventListener('focus', () => this.open(i));

      const focusableElements = this.sideMenus[i].querySelectorAll(
        'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      this.sideMenus[i].addEventListener('focusin', () => {
        this.side.classList.add('js-active');
      });

      this.sideMenus[i].addEventListener('focusout', () => {
        setTimeout(() => {
          if (!this.sideMenus[i].contains(document.activeElement)) {
            this.close(i);
          }
        }, 10);
      });

      this.sideMenus[i].addEventListener('keydown', (e) => {
        if (e.key === 'Tab' && e.shiftKey && document.activeElement === focusableElements[0]) {
          this.close(i);
        }
      });
    });

    this.closeTrigger?.addEventListener('mouseenter', () => {
      clearTimeout(this.hoverTimeout);
      this.hoverTimeout = setTimeout(() => this.allClose(), 500);
    });

    this.closeBtns.forEach((close, i) => {
      close.addEventListener('click', (e) => {
        e.preventDefault();
        this.close(i);
      });
    });

    this.sideBackground?.addEventListener('click', () => {
      this.close(this.sideState);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.close(this.sideState);
      }
    });
  }

  toggle(i) {
    if (this.sideState === i) {
      this.close(i);
    } else {
      this.close(this.sideState);
      this.open(i);
      this.sideState = i;
    }
  }

  open(i) {
    this.side.classList.add('js-active');
    gsap.to(this.sideMenus[i], {
      x: 0,
      opacity: 1,
      visibility: 'visible',
      duration: 0.3,
      ease: 'power3.in',
    });
    this.sideState = i;
  }

  close(i) {
    this.side.classList.remove('js-active');
    if (i !== null && this.sideMenus[i]) {
      gsap.to(this.sideMenus[i], {
        x: this.slideValue,
        opacity: 0,
        visibility: 'hidden',
        duration: 0.3,
        delay: 0.3,
        ease: 'power3.in',
      });
    }
    this.sideState = null;
  }

  allClose() {
    clearTimeout(this.hoverTimeout);
    this.side.classList.remove('js-active');
    this.sideMenus.forEach(menu => {
      gsap.to(menu, {
        x: this.slideValue,
        opacity: 0,
        visibility: 'hidden',
        duration: 0.3,
        ease: 'power3.in',
      });
    });
    this.sideState = null;
  }

  setActiveMenu() {
    const links = document.querySelectorAll('.js-side-current');
    const currentPath = `/${window.location.pathname.split('/')[1]}`;

    links.forEach(item => {
      const itemPath = item.getAttribute('href').replace(/\/index.html/, '');
      const isActive =
        currentPath === itemPath ||
        (currentPath === '/webgis' && itemPath === '/data') ||
        (currentPath === '/archive' && itemPath === '/ccca');

      item.classList.toggle('-active', isActive);
    });
  }
}

class ContentManager {
  constructor(options = {}) {
    this.el = document.querySelector(options.selector);
    if (!this.el) return;

    const origin = window.location.origin;
    this.urls = options.urls.reduce((acc, key) => {
      acc[key] = `${origin}${wp_endpoint[key]}`;
      return acc;
    }, {});
    this.dataMap = {};
    this.init();
  }

  async init() {
    try {
      await this.fetchData();
      this.afterInit();
    } catch (error) {
      console.error('Error fetching data:', error);
      this.el.innerHTML = '<p>データの取得に失敗しました。</p>';
    }
  }

fetchData() {
  const entries = Object.entries(this.urls);
  return Promise.all(
    entries.map(([key, url]) => {
      const noCacheUrl = `${url}?_=${Date.now()}`;
      return fetch(noCacheUrl)
        .then(response => {
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
          return response.json();
        })
        .then(data => {
          this.dataMap[key] = data;
        })
        .catch(error => {
          console.error(`Error fetching ${key}:`, error);
          this.dataMap[key] = null; // エラー時は null をセット
        });
    })
  );
}
afterInit() {
  if (this.dataMap['js-related-articles']) {
    this.renderMeasures(this.dataMap['js-related-articles']);
  } else {
    console.warn('js-related-articles の取得に失敗しました');
    document.querySelector('.js-related-articles').innerHTML = '<p>このセクションのデータ取得に失敗しました。</p>';
  }

  if (this.dataMap['js-private-sector']) {
    this.renderPrivateSector(this.dataMap['js-private-sector']);
  } else {
    console.warn('js-private-sector の取得に失敗しました');
    document.querySelector('.js-private-sector').innerHTML = '<p>このセクションのデータ取得に失敗しました。</p>';
  }

  // 他のセクションも同様に処理可能
}
  formatDate(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
  }
}

// 初期化処理
document.addEventListener('DOMContentLoaded', () => {
  const observer = new MutationObserver((mutations, obs) => {
    const side = document.querySelector('.js-side');
    const menu = document.querySelector('.js-header');

    if (side && menu) {
      obs.disconnect();
      new Side(side);
      new Header(menu);
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
});

// ページ全体の読み込み完了時
window.addEventListener('load', () => {
  new AnchorLink();
  window.dispatchEvent(new Event('loading'));
});

// カスタム loading イベント後の処理（Side の再初期化は不要なら削除可）
window.addEventListener('loading', () => {
  // new Side(); ← MutationObserver で初期化済みなら不要
});
