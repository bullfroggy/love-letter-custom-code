// ---------- Safe refs ----------
const win = (typeof window !== 'undefined' && window.parent) ? window.parent : window;
let doc; try { doc = win.document || document; } catch { doc = document; }

// ---------- Small utils ----------
const $  = (s, r = doc) => r.querySelector(s);
const qq = (s, r = doc) => Array.from(r.querySelectorAll(s));
const onceStyle = (id, css) => {
  let el = doc.getElementById(id);
  if (!el) { el = doc.createElement('style'); el.id = id; doc.head.appendChild(el); }
  el.textContent = css;
  return el;
};

const isHome = () => {
  try { return (win.location?.pathname || '/').replace(/\/+$/, '/') === '/'; }
  catch { return false; }
};
const hasPDP = () =>
  !!($('.product__wrapper') && $('.product-gallery__wrapper') && $('.product-meta__wrapper'));

// ---------- 1) Install global stylesheet exactly once ----------
(function installStyles(){
  let css = `
    /* Global decor */
    .w-block-header > .w-block-background { box-shadow: rgba(0,0,0,.25) 0 5px 15px; }
    .w-block-wrapper[data-block-purpose="footer"] { box-shadow: rgba(0,0,0,.25) 0 -5px 15px; z-index: 1; }
    .embed-code-1 { display: none; }

    /* PDP scope gate */
    [data-llc-scope="pdp"]{
      --llc-header-offset: 0px;
      --llc-crumbs-gap: 16px;
    }
    [data-llc-scope="pdp"] .w-cell.fullwidth-mobile.no-overflow.row,
    [data-llc-scope="pdp"] .product__wrapper,
    [data-llc-scope="pdp"] .product-detail-page { overflow: visible !important; }

    [data-llc-scope="pdp"] .product__wrapper { padding-top: 0 !important; }
    [data-llc-scope="pdp"] .add-to-cart__wrapper { padding: 0 !important; }
    [data-llc-scope="pdp"] .product-gallery__wrapper { margin: 0 !important; }
    [data-llc-scope="pdp"] [data-llc-clear-mt] { margin-top: 0 !important; }

    /* Breadcrumb spacing in the gallery column */
    [data-llc-scope="pdp"] .breadcrumb-align {
      padding-top: 34px !important;
      padding-bottom: 56px !important;
    }

    /* Sticky gallery (>=600). */
    @media (min-width: 600px){
      [data-llc-scope="pdp"] .product-gallery__wrapper{
        position: sticky;
        top: var(--llc-header-offset);
        align-self: start;
      }
      [data-llc-scope="pdp"] .product-gallery__wrapper .breadcrumb-align{
        position: static !important;
        margin: 0 0 var(--llc-crumbs-gap) !important;
        padding-left: 0 !important;
        padding-right: 0 !important;
        background: transparent !important;
        box-shadow: none !important;
        width: 100%;
      }
    }

    /* Header sticky up to 839px; PDP top padding between 600–839px */
    @media (max-width: 839px){
      header { position: sticky; top: 0; z-index: var(--z-index-header, 1000); }
    }
    @media (min-width: 600px) and (max-width: 839px){
      [data-llc-scope="pdp"] .product__wrapper { padding-top: 24px !important; }
    }

    /* Conditional stacking ONLY between 600–839px */
    @media (min-width: 600px) and (max-width: 839px){
      [data-llc-scope="pdp"][data-llc-lightbox-open="1"] .product-gallery__wrapper {
        z-index: var(--z-index-lightbox) !important;
      }
      [data-llc-scope="pdp"]:not([data-llc-lightbox-open="1"]) .product-gallery__wrapper {
        z-index: calc(var(--z-index-header, 1000) - 1) !important;
      }
    }

    /* Sticky offset = 200px for 600–759 */
    @media (min-width: 600px) and (max-width: 759px){
      [data-llc-scope="pdp"]{
        --llc-header-offset: 200px;
      }
    }

    /* Sticky offset = 160px for 760–839 */
    @media (min-width: 760px) and (max-width: 839px){
      [data-llc-scope="pdp"]{
        --llc-header-offset: 160px;
      }
    }

    /* Desktop (≥840): restore original behavior (overlay wins) */
    @media (min-width: 840px){
      [data-llc-scope="pdp"] .product-gallery__wrapper {
        z-index: var(--z-index-lightbox) !important;
      }
      [data-llc-scope="pdp"] .product-meta__wrapper{
        position: static;
        max-height: none;
        overflow: visible;
        padding-top: 117px !important;
      }
    }

    /* Mobile: no sticky */
    @media (max-width: 599px){
      [data-llc-scope="pdp"] .product-gallery__wrapper{ position: static; top: 0; }
    }

    /* Allergen accordion */
    [data-llc-scope="pdp"] [data-llc-allergen="true"] { padding-top: var(--space-x3); }
    [data-llc-scope="pdp"] .llc-accordion-panel {
      overflow: hidden;
      max-height: 0;
      transition: max-height 0.32s ease;
      will-change: max-height;
    }
    [data-llc-scope="pdp"] .llc-accordion-button .icon svg { transform: rotate(180deg); transition: none !important; }
    [data-llc-scope="pdp"] .llc-accordion-button[aria-expanded="true"] .icon svg { transform: rotate(0deg); }
  `;
  if (isHome()) css += `.📚19-10-1rI2oH .image__wrapper { display: none; }`;
  onceStyle('llc-universal-styles', css);
})();

// ---------- 2) PDP helpers ----------
function moveBreadcrumbs(scope, galleryWrap){
  const crumbs =
    $('.w-cell.display-desktop.breadcrumb-align.row') ||
    $('.breadcrumb-align.row.display-desktop') ||
    $('.breadcrumb-align');
  if (!crumbs) return;

  let marker = $('#llc-crumbs-marker');
  if (!marker) {
    marker = doc.createElement('div');
    marker.id = 'llc-crumbs-marker';
    crumbs.parentElement?.insertBefore(marker, crumbs);
  }
  const place = () => {
    const vw = win.innerWidth || 1024;
    if (vw >= 600) {
      if (crumbs.parentElement !== galleryWrap) galleryWrap.insertBefore(crumbs, galleryWrap.firstChild);
    } else {
      if (crumbs.parentElement !== marker.parentElement) marker.parentElement.insertBefore(crumbs, marker.nextSibling);
    }
  };
  place();
  win.addEventListener('resize', place, { passive: true });
}

// ---------- Allergen (stable, no re-renders) ----------
function findDescriptionGroup(metaWrap){
  if (!metaWrap) return null;
  // Prefer button containing <p.form-label> "Description"
  const btn = Array.from(metaWrap.querySelectorAll('button')).find(b => {
    const p = b.querySelector('p.form-label');
    return p && /description/i.test((p.textContent || '').replace(/\s+/g,' ').trim());
  });
  if (btn) return btn.parentElement || btn.closest('.w-wrapper') || btn;

  // Fallback: wrapper that contains “Description” + a button
  return Array.from(metaWrap.querySelectorAll('.w-wrapper')).find(w =>
    /description/i.test((w.textContent || '').replace(/\s+/g,' ').trim()) && w.querySelector('button')
  ) || null;
}

function buildAllergenNode(D){
  const uid  = `llc-allergen-${Math.random().toString(36).slice(2,9)}`;
  const wrap = D.createElement('div');
  wrap.id = 'llc-allergen-wrap';
  wrap.setAttribute('data-llc-allergen','true');

  const btn  = D.createElement('button');
  btn.type = 'button';
  btn.id   = `${uid}-header`;
  btn.className = '📚19-10-1IAuGr 📚19-10-1zAswq llc-accordion-button';
  btn.setAttribute('aria-controls', `${uid}-panel`);
  btn.setAttribute('aria-expanded', 'false');
  btn.innerHTML = `
    <div class="📚19-10-1agDbH"><div>
      <p class="form-label 📚19-10-1uGevg 📚19-10-1EEwzY"
        style="line-height:1.1;letter-spacing:0.01em;--mobile-base-font-size:16;--mobile-font-size-scale:1.15;font-family:Larsseit;font-weight:bold;color:#fff;">
        Allergen Info
      </p>
    </div></div>
    <div class="📚19-10-1k6MzQ">
      <span class="icon 📚19-10-1vCfSe" style="--color:currentColor;--icon-size:16px;--fill:currentColor;">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16">
          <path fill="currentColor" fill-rule="evenodd"
            d="M7.3 4.3a1 1 0 0 1 1.4 0l6 6-1.4 1.4L8 6.42l-5.3 5.3-1.4-1.42 6-6Z"
            clip-rule="evenodd"></path>
        </svg>
      </span>
    </div>`;

  const panel = D.createElement('div');
  panel.id = `${uid}-panel`;
  panel.setAttribute('role','region');
  panel.setAttribute('aria-labelledby', `${uid}-header`);
  panel.className = '📚19-10-1pynEn llc-accordion-panel';
  panel.style.maxHeight = '0px';
  panel.innerHTML = `
    <div class="w-product-description__wrapper" showsubtitle="true" positiontop="true">
      <div class="text-component w-product-description 📚19-10-1uGevg 📚19-10-1EEwzY"
          style="line-height:1.3; letter-spacing:0; --mobile-base-font-size:16; --mobile-font-size-scale:1.15; font-family:Larsseit; font-weight:400; color:#fff;">
        <span>
          <p>All truffles contain <strong>dairy</strong></p>
          <br>
          <div style="opacity:.9; line-height:1.5">
            <strong>Legend</strong><br>
            [G] = contains gluten<br>
            [P] = contains peanuts<br>
            [T] = contains tree nuts<br>
            [F] = gluten &amp; nut free
          </div>
        </span>
      </div>
    </div>`;

  // Accordion behavior
  const openPanel  = () => { btn.setAttribute('aria-expanded','true');  panel.style.maxHeight = panel.scrollHeight + 'px'; };
  const closePanel = () => {
    btn.setAttribute('aria-expanded','false');
    panel.style.maxHeight = panel.scrollHeight + 'px';
    void panel.offsetHeight;
    panel.style.maxHeight = '0px';
  };
  panel.addEventListener('transitionend', (e) => {
    if (e.propertyName !== 'max-height') return;
    if (btn.getAttribute('aria-expanded') === 'true') panel.style.maxHeight = 'unset';
  });
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    (btn.getAttribute('aria-expanded') === 'true') ? closePanel() : openPanel();
  });

  wrap.appendChild(btn);
  wrap.appendChild(panel);
  return wrap;
}

/**
 * Ensures:
 *  - a stable anchor just after the Description group
 *  - a single canonical #llc-allergen-wrap (reused, not rebuilt)
 *  - duplicates removed without touching the canonical one
 */
function ensureAllergen(metaWrap){
  if (!metaWrap) return false;

  const group = findDescriptionGroup(metaWrap);
  if (!group || !group.parentElement) return false;

  // Stable anchor right after Description group
  let anchor = doc.getElementById('llc-allergen-anchor');
  if (!anchor) {
    anchor = doc.createElement('div');
    anchor.id = 'llc-allergen-anchor';
  }
  if (group.nextSibling) group.parentElement.insertBefore(anchor, group.nextSibling);
  else group.parentElement.appendChild(anchor);

  // Canonical wrapper (re-use if present)
  let wrap = doc.getElementById('llc-allergen-wrap');
  if (!wrap) wrap = buildAllergenNode(doc);

  // Place canonical wrapper immediately after anchor (no rebuild => no flicker)
  if (anchor.parentNode && wrap !== anchor.nextSibling) {
    anchor.parentNode.insertBefore(wrap, anchor.nextSibling);
  }

  // Remove any other stray allergen blocks inside this meta column
  Array.from(metaWrap.querySelectorAll('[data-llc-allergen="true"]'))
    .filter(el => el !== wrap)
    .forEach(el => el.remove());

  return true;
}

function setupAllergen(metaWrap){
  if (!metaWrap) return;

  // First attempt + short retry until Description exists
  let ok = ensureAllergen(metaWrap);
  let tries = 0;
  const retry = setInterval(() => {
    if (ok || tries++ > 120) { clearInterval(retry); return; } // ~6s
    ok = ensureAllergen(metaWrap);
  }, 50);

  // Observe SPA churn; only *reposition* existing node instead of rebuilding
  let rafId = null;
  const mo = new MutationObserver(() => {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(() => {
      ensureAllergen(metaWrap);
    });
  });
  mo.observe(metaWrap, { childList: true, subtree: true });
}

// ---------- 3) Lightbox watcher: toggles data-llc-lightbox-open ----------
function startLightboxWatcher(){
  // Only one interval globally
  if (win.__llcLBInt) clearInterval(win.__llcLBInt);
  const getScope = () => $('[data-llc-scope="pdp"]') || doc.body;
  const check = () => {
    const scope = getScope();
    const lb = doc.querySelector('.lightbox');
    if (lb && lb.isConnected) scope.setAttribute('data-llc-lightbox-open', '1');
    else scope.removeAttribute('data-llc-lightbox-open');
  };
  check();
  win.__llcLBInt = setInterval(check, 150);
  ['click','keydown','transitionend','resize','scroll'].forEach(ev =>
    (ev === 'resize' || ev === 'scroll' ? win : doc).addEventListener(ev, () => setTimeout(check, 0), { passive: true })
  );
}

// ---------- 4) PDP bootstrap ----------
function bootPDP(){
  if (!hasPDP()) return false;

  const productWrapper = $('.product__wrapper');
  const galleryWrap    = $('.product-gallery__wrapper');
  const metaWrap       = $('.product-meta__wrapper');

  // Scope & clamp parent margin
  const scopeEl =
    productWrapper.closest('.w-block[id]') ||
    productWrapper.closest('.w-block') ||
    productWrapper;
  scopeEl?.setAttribute('data-llc-scope','pdp');
  productWrapper.parentElement?.setAttribute('data-llc-clear-mt','');

  moveBreadcrumbs(scopeEl, galleryWrap);
  setupAllergen(metaWrap);
  startLightboxWatcher();

  return true;
}

// ---------- 5) Router-agnostic trigger ----------
let lastURL = '';
const tick = () => {
  const href = (win.location && win.location.href) || '';
  if (href !== lastURL) {
    lastURL = href;
    let boots = 0, bootTimer = setInterval(() => {
      boots++;
      if (bootPDP() || boots > 80) clearInterval(bootTimer); // ~4s window
    }, 50);
  }
};
const urlWatch = setInterval(tick, 150);
tick(); // run immediately

if (doc.readyState === 'complete') bootPDP();
else win.addEventListener('load', () => bootPDP(), { once: true });

['pushState','replaceState'].forEach(m => {
  const orig = win.history?.[m];
  if (!orig || orig.__llcWrapped) return;
  function wrapped(){ const r = orig.apply(this, arguments); setTimeout(tick, 50); return r; }
  wrapped.__llcWrapped = true;
  try { win.history[m] = wrapped; } catch {}
});
win.addEventListener('popstate', () => setTimeout(tick, 50));
win.addEventListener('hashchange', () => setTimeout(tick, 50));

console.log('[LLC] universal script: styles ready, router watcher active, PDP bootstrap auto + lightbox z-index sync.');
