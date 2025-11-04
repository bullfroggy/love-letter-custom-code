/* LLC v31.8.4-sticky-bg-steal — sticky miniheader (no fixed), steal header bg then clear it, LIGHTBOX-only watcher
   + Allergen Info accordion (added, no other behavior changed)
   Step 1 tweak: hide .embed-code-1 */
(function(){
  if (window.__LLC_V31__) {
    try { window.__LLC_V31__.rebind && window.__LLC_V31__.rebind(); } catch(_){}
    return;
  }

  window.__LLC_V31__ = { version: '31.8.4-sticky-bg-steal+allergen' };

  var win  = window;
  var doc  = document;
  var HTML = doc.documentElement;
  var MINI_BASE_H = 57;

  function $(s, r){ return (r||doc).querySelector(s); }
  function onceStyle(id, css){
    var el = doc.getElementById(id);
    if (!el){ el = doc.createElement('style'); el.id = id; doc.head.appendChild(el); }
    el.textContent = css; return el;
  }
  function isHome(){ try { return (win.location && (win.location.pathname || '/')).replace(/\/+$/, '/') === '/'; } catch(_){ return false; } }
  function getFirstHeader(){ var list = doc.querySelectorAll('header'); return list.length ? list[0] : doc.querySelector('.w-block-wrapper.header') || null; }
  function markMainHeader(){
    var all = Array.prototype.slice.call(doc.querySelectorAll('header'));
    all.forEach(function(h){ h.removeAttribute('data-llc-mainheader'); });
    var first = getFirstHeader();
    if (first) first.setAttribute('data-llc-mainheader','1');
    return first;
  }

  /* ---------------- Styles ---------------- */
  (function installStyles(){
    var css = `
:root { --llc-gap: 12px; }

#llc-spacer{
  height: var(--llc-carrypad, 0px) !important;
  pointer-events: none !important;
  width: 100% !important;
  display: block !important;
}

/* keep footer shadow; header bg shadow is removed once miniheader is active */
.w-block-wrapper[data-block-purpose="footer"] { box-shadow: rgba(0,0,0,.25) 0 -5px 15px; z-index: 1; }

/* Footer: keep shadow normally, but sit under lightbox when overlay is on */
.w-block-wrapper[data-block-purpose="footer"]{
  position: relative;
  z-index: var(--llc-footer-z, 1);
  box-shadow: rgba(0,0,0,.25) 0 -5px 15px;
}

/* When lightbox is present, drop footer below it (and prevent click-through) */
html[data-llc-overlay="on"] .w-block-wrapper[data-block-purpose="footer"]{
  --llc-footer-z: 0 !important;
  pointer-events: none !important;
}

/* Miniheader */
#llc-miniheader{
  position: sticky;
  left: 0;
  right: 0;
  top: calc(var(--llc-carrypad, 0px) * -1) !important;
  padding-top: var(--llc-carrypad, 0px) !important;
  margin-top: calc(var(--llc-carrypad, 0px) * -1) !important;
  width: calc(100% + 16px) !important;
  margin-left: -8px;
  display: grid !important;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  align-items: center;
  padding: 0 16px;
  background-color: transparent !important;
  color: #fff;
  box-shadow: rgba(0,0,0,.25) 0 5px 15px;
  pointer-events: auto;
  z-index: 3;
  isolation: isolate;
  background-position: var(--bg-position, 50% 50%);
}
#llc-miniheader.is-stuck{}
html[data-llc-overlay="on"] #llc-miniheader{ z-index: 1 !important; box-shadow: none !important; }
@media (max-width: 839px){ #llc-miniheader{ box-shadow: 0 6px 16px rgba(0,0,0,.22) !important; } }

#llc-miniheader .llc-mini-left,
#llc-miniheader .llc-mini-center,
#llc-miniheader .llc-mini-right { display:flex; align-items:center; min-width:0; }
#llc-miniheader .llc-mini-left  { grid-column:1; justify-self:start; gap:var(--llc-gap); }
#llc-miniheader .llc-mini-center{ grid-column:2; justify-self:center; overflow:visible; }
#llc-miniheader .llc-mini-right { grid-column:3; justify-self:end;   gap:var(--llc-gap); }

#llc-miniheader .llc-mini-center .w-nav{
  display:flex; align-items:center; justify-content:center;
  white-space:nowrap !important;
  padding-top:var(--gutter-row-sm) !important;
  padding-bottom:var(--gutter-row-sm) !important;
  padding-left:0 !important; padding-right:0 !important;
}
#llc-miniheader .llc-mini-center .w-nav *{ flex-shrink:0; }

#llc-miniheader .llc-slot-ph { display:none !important; width:0; height:0; margin:0; }

#llc-miniheader .header__icons{ display:flex; align-items:center; gap:var(--llc-gap); height:100%; overflow:visible; }
#llc-miniheader .header__icons .w-wrapper{ margin:0 !important; }
#llc-miniheader .header__cart button{ padding:1px 6px !important; display:inline-flex; align-items:center; justify-content:center; line-height:1; }
#llc-miniheader .w-sitelogo{ display:flex; align-items:center; min-width:0; }
#llc-miniheader .w-sitelogo img{ display:block; object-fit:contain; height:auto; width:auto; max-height:${MINI_BASE_H}px; }

#llc-miniheader .w-sitelogo, #llc-miniheader .w-sitelogo a{ position: relative; z-index: 2; pointer-events: auto !important; }

header[data-llc-mainheader] .header__icons{ display:flex; align-items:center; gap:var(--llc-gap); }
header[data-llc-mainheader] .header__icons .w-wrapper{ margin:0 !important; }
header[data-llc-mainheader] .header__account{ margin-right:0 !important; }
header[data-llc-mainheader] .header__cart button{ padding:1px 6px !important; display:inline-flex; align-items:center; justify-content:center; line-height:1; }
header[data-llc-mainheader]{ position: absolute; width: calc(100% - 16px) !important; }

/* Click layering */
html[data-llc-miniheader="on"] header[data-llc-mainheader]{ pointer-events: none; }
html[data-llc-miniheader="on"] header[data-llc-mainheader] .w-sitelogo,
html[data-llc-miniheader="on"] header[data-llc-mainheader] .header__icons,
html[data-llc-miniheader="on"] header[data-llc-mainheader] .header__button,
html[data-llc-miniheader="on"] header[data-llc-mainheader] .header__cart,
html[data-llc-miniheader="on"] header[data-llc-mainheader] .header__account,
html[data-llc-miniheader="on"] header[data-llc-mainheader] a,
html[data-llc-miniheader="on"] header[data-llc-mainheader] button{ pointer-events: auto; }
html[data-llc-miniheader="on"] header[data-llc-mainheader] .w-nav{ pointer-events: none; }

#llc-miniheader .llc-mini-left, #llc-miniheader .llc-mini-right { opacity: 0; transition: opacity .18s ease; }
#llc-miniheader.has-sides .llc-mini-left, #llc-miniheader.has-sides .llc-mini-right { opacity: 1; }

/* Mobile layout for the miniheader bar itself */
@media (max-width: 839px){
  #llc-miniheader{
    padding: 0 12px !important;
    display: flex !important;
    align-items: center; justify-content: space-between;
    gap: var(--llc-gap); height: 57px;
  }
  #llc-miniheader .llc-mini-left, #llc-miniheader .llc-mini-right{ flex: 0 0 auto; white-space: nowrap; }
  #llc-miniheader .header__cart button{ margin: 0 0 0 6px !important; padding: 1px 0 !important; }
  #llc-miniheader .llc-mini-center{ flex: 1 1 auto; min-width: 0; display:flex; align-items:center; justify-content:center; overflow:visible; }
  #llc-miniheader .w-sitelogo{ max-width: 100%; }
  #llc-miniheader .w-sitelogo img{ max-width: 100%; height: auto; max-height: 57px; object-fit: contain; width: auto; }
}

/* === PDP layout (cleaned) === */
[data-llc-scope="pdp"]{ --llc-header-offset:0px; --llc-crumbs-gap:16px; }
[data-llc-scope="pdp"] .w-cell.fullwidth-mobile.no-overflow.row,
[data-llc-scope="pdp"] .product__wrapper,
[data-llc-scope="pdp"] .product-detail-page{ overflow:visible !important; }
[data-llc-scope="pdp"] .add-to-cart__wrapper{ padding:0 !important; }
[data-llc-scope="pdp"] .product-gallery__wrapper{ margin:0 !important; }
[data-llc-scope="pdp"] [data-llc-clear-mt]{ margin-top:0 !important; }
[data-llc-scope="pdp"] .breadcrumb-align{ padding-top:34px !important; padding-bottom:56px !important; }

/* 0–599: no sticky */
@media (max-width:599px){
  html{ overflow-x:hidden; }
  [data-llc-scope="pdp"] .product-gallery__wrapper{ position:static; top:0; }
}

/* 600–839: sticky with MINI_BASE_H + 24px */
@media (min-width:600px) and (max-width:839px){
  [data-llc-scope="pdp"] .product__wrapper{ padding-top:24px !important; }
  [data-llc-scope="pdp"] .product-gallery__wrapper{
    position: sticky;
    top: calc(${MINI_BASE_H}px + 24px) !important;
    align-self: start;
    z-index: calc(var(--z-index-header, 1000) - 2) !important;
  }
  [data-llc-scope="pdp"] .product-gallery__wrapper .breadcrumb-align{
    position:static !important; margin:0 0 var(--llc-crumbs-gap) !important;
    padding-left:0 !important; padding-right:0 !important; background:transparent !important; box-shadow:none !important; width:100%;
  }
}

/* ≥840: sticky with header offset + 56px */
@media (min-width:840px){
  [data-llc-scope="pdp"] .product-meta__wrapper{ position:static; max-height:none; overflow:visible; padding-top:117px !important; }
  [data-llc-scope="pdp"] .product-gallery__wrapper{
    position: sticky;
    top: calc(var(--llc-header-offset, 0px) + 56px) !important;
    align-self: start;
    z-index: calc(var(--z-index-header, 1000) - 2) !important;
  }
  [data-llc-scope="pdp"] .product-gallery__wrapper .breadcrumb-align{
    position:static !important; margin:0 0 var(--llc-crumbs-gap) !important;
    padding-left:0 !important; padding-right:0 !important; background:transparent !important; box-shadow:none !important; width:100%;
  }
}

/* Mobile header presence */
@media (max-width:839px){
  header[data-llc-mainheader]{ display:none !important; }
}

/* Allergen accordion (styles only; DOM built by JS below) */
[data-llc-scope="pdp"] [data-llc-allergen="true"] { padding-top: var(--space-x3); }
[data-llc-scope="pdp"] .llc-accordion-panel { overflow:hidden; max-height:0; transition:max-height .32s ease; will-change:max-height; }
[data-llc-scope="pdp"] .llc-accordion-button .icon svg { transform: rotate(180deg); transition: none !important; }
[data-llc-scope="pdp"] .llc-accordion-button[aria-expanded="true"] .icon svg { transform: rotate(0deg); }

/* home tweak */
${ isHome() ? '.📚19-10-1rI2oH .image__wrapper{display:none;}' : '' }
`;
    onceStyle('llc-v31-styles', css);
  })();

  /* ---------------- DOM (spacer + mini) ---------------- */
  function ensureSpacer(){
    var sp = doc.getElementById('llc-spacer');
    if (sp) return sp;
    sp = doc.createElement('div');
    sp.id = 'llc-spacer';
    sp.style.height = '0px';
    sp.style.pointerEvents = 'none';
    return sp;
  }
  function ensureMiniBar(){
    var bar = doc.getElementById('llc-miniheader');
    if (bar) return bar;
    bar = doc.createElement('div');
    bar.id = 'llc-miniheader';
    bar.innerHTML = '<div class="llc-mini-left"></div><div class="llc-mini-center"></div><div class="llc-mini-right"></div>';
    return bar;
  }
  function ensureMiniGroup(){
    var bar = ensureMiniBar();
    var sp  = ensureSpacer();
    var mainHeader = getFirstHeader();
    if (mainHeader && mainHeader.parentNode){
      if (sp.parentNode !== mainHeader.parentNode) mainHeader.parentNode.insertBefore(sp, mainHeader);
      if (bar.parentNode !== mainHeader.parentNode || bar.previousSibling !== sp) mainHeader.parentNode.insertBefore(bar, mainHeader);
    } else {
      if (!sp.parentNode) doc.body.appendChild(sp);
      if (!bar.parentNode) doc.body.appendChild(bar);
    }
    return { bar, sp };
  }

  /* ---------------- Size / carrypad ---------------- */
  function updateMiniHeightVar(){
    var bar = ensureMiniBar();
    var h = Math.round((bar.getBoundingClientRect().height || MINI_BASE_H));
    HTML.style.setProperty('--llc-mini-h', h + 'px');
    return h;
  }
  function computeCarrypad(){
    var header = getFirstHeader(), group = ensureMiniGroup();
    var bar = group.bar, spacer = group.sp;
    if (!bar || !header || !spacer) return 0;
    var H  = Math.round(header.getBoundingClientRect().height || 0);
    var cp = Math.max(0, H - MINI_BASE_H);
    spacer.style.height = cp + 'px';
    HTML.style.setProperty('--llc-carrypad', cp + 'px');
    bar.style.setProperty('--llc-carrypad', cp + 'px');
    return cp;
  }
  function initCarrypadRobust(){
    computeCarrypad();
    win.requestAnimationFrame(function(){ win.requestAnimationFrame(computeCarrypad); });
    if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', computeCarrypad, {once:true});
    win.addEventListener('load', computeCarrypad, {once:true});
    if (doc.fonts && doc.fonts.ready && typeof doc.fonts.ready.then === 'function'){
      doc.fonts.ready.then(function(){ computeCarrypad(); });
    }
    var header = getFirstHeader();
    if (header && 'ResizeObserver' in win){
      var ro = new ResizeObserver(function(){ computeCarrypad(); });
      ro.observe(header);
    }
  }

  /* ---------------- Hoist/restore ---------------- */
  var SLOT_REG = new Map();
  function makePlaceholder(node){
    var r=node.getBoundingClientRect(), ph=doc.createElement('div');
    ph.className='llc-slot-ph'; ph.style.width=r.width+'px'; ph.style.height=r.height+'px';
    ph.style.margin=getComputedStyle(node).margin; return ph;
  }
  function hoist(k,n,t){
    if(!n||!t)return; if(SLOT_REG.has(k)){t.appendChild(n);return;}
    var ph=makePlaceholder(n); if(n.parentNode)n.parentNode.insertBefore(ph,n);
    t.appendChild(n); SLOT_REG.set(k,{node:n,placeholder:ph});
  }
  function restoreKey(k){
    var rec = SLOT_REG.get(k);
    if(!rec) return;
    if(rec.placeholder && rec.placeholder.parentNode){
      rec.placeholder.parentNode.replaceChild(rec.node, rec.placeholder);
    }
    SLOT_REG.delete(k);
  }
  function restoreAll(){ SLOT_REG.forEach(function(_,k){ restoreKey(k); }); }

  /* ---------------- Finders ---------------- */
  function findLogo(h){ if (!h) return null; var a = h.querySelector('a.w-sitelogo, .w-sitelogo a, a .w-sitelogo'); return a?(a.closest('a')||a):h.querySelector('.w-sitelogo'); }
  function findDesktopNavContainer(h){return h&&(h.querySelector('.w-nav.nav--desktop')||h.querySelector('.w-nav')); }
  function findHamburger(h){return h&&(h.querySelector('button[aria-label*="menu" i]')||h.querySelector('.hamburger, .menu-toggle')); }
  function findOrderContainer(h){return h&&(h.querySelector('.header__button')||h.querySelector('a[href*="order"]')?.closest('.w-wrapper')); }
  function findIconsWrap(h){return h&&h.querySelector('.header__icons'); }

  /* ---------------- Background: capture -> apply -> clear header ---------------- */
  function getHeaderBgElement(header){
    return (header &&
      (header.querySelector('.w-block-background.w-image-block') ||
       header.querySelector('.w-block-background .w-image-block') ||
       header.querySelector('.w-block-background'))) || header;
  }
  function captureHeaderBg(){
    var header = getFirstHeader();
    if (!header) return null;
    var bgEl = getHeaderBgElement(header);
    var cs = getComputedStyle(bgEl);
    var varSrc = (cs.getPropertyValue('--bg-img-src') || '').trim();
    var varOv  = (cs.getPropertyValue('--bg-img-overlay') || '').trim();
    var rawImg = cs.backgroundImage;
    var bgImg  = '';
    if (varSrc && varSrc.toLowerCase().indexOf('url(') >= 0){
      bgImg = varOv ? (varOv + ', ' + varSrc) : varSrc;
    } else if (rawImg && rawImg !== 'none'){
      bgImg = rawImg;
    }
    return {
      hasImage: !!bgImg,
      image: bgImg,
      repeat: cs.backgroundRepeat || 'no-repeat',
      size: cs.backgroundSize   || 'cover',
      position: (cs.getPropertyValue('--bg-position') || '').trim() || (cs.backgroundPosition || '50% 50%'),
      color: cs.backgroundColor
    };
  }
  function applyMiniBg(styles){
    var bar = ensureMiniBar();
    if (!styles){
      // No styles yet – don't wipe anything, just keep existing state
      return;
    }
    if (styles.hasImage){
      bar.style.backgroundImage  = styles.image;
      bar.style.backgroundRepeat = styles.repeat;
      bar.style.backgroundSize   = styles.size;
      bar.style.backgroundPosition = styles.position;
    } else {
      bar.style.backgroundImage = 'none';
    }
    if (styles.color && styles.color !== 'rgba(0, 0, 0, 0)' && styles.color !== 'transparent'){
      bar.style.backgroundColor = styles.color;
    } else {
      bar.style.removeProperty('backgroundColor');
    }
  }
  function clearHeaderBg(){
    var header = getFirstHeader();
    if (!header) return;
    var bgEl = getHeaderBgElement(header);
    bgEl.style.backgroundImage = 'none';
    bgEl.style.backgroundColor = 'transparent';
  }

  // Local retry (up to ~3 frames) instead of global counters
  function stealAndPaintBgNow(){
    var attempts = 0;

    function doSteal(){
      attempts++;
      var styles = captureHeaderBg();
      var ready = styles && (
        styles.hasImage ||
        (styles.color && styles.color !== 'rgba(0, 0, 0, 0)' && styles.color !== 'transparent')
      );

      if (!ready){
        if (attempts < 3){
          win.requestAnimationFrame(doSteal);
        }
        return;
      }

      applyMiniBg(styles);
      win.requestAnimationFrame(function(){ clearHeaderBg(); });
    }

    doSteal();
  }

  /* ---------------- Desktop staged/stuck (content hoisting only) ---------------- */
  function stageMiniDesktop(){
    var group=ensureMiniGroup(), bar=group.bar, header=markMainHeader(); if(!header) return;
    var left=bar.querySelector('.llc-mini-left'), center=bar.querySelector('.llc-mini-center'), right=bar.querySelector('.llc-mini-right');
    hoist('nav', findDesktopNavContainer(header), center);
    ['logo','order','icons','hamburger'].forEach(restoreKey);
    bar.classList.remove('is-stuck','has-sides');
    HTML.setAttribute('data-llc-miniheader','on');
    updateMiniHeightVar();
  }
  function stickMiniDesktop(){
    var group=ensureMiniGroup(), bar=group.bar, header=markMainHeader(); if(!header) return;
    var left=bar.querySelector('.llc-mini-left'), center=bar.querySelector('.llc-mini-center'), right=bar.querySelector('.llc-mini-right');
    hoist('nav',   findDesktopNavContainer(header), center);
    hoist('logo',  findLogo(header),                left);
    hoist('order', findOrderContainer(header),      right);
    hoist('icons', findIconsWrap(header),           right);
    bar.classList.add('is-stuck','has-sides');
    updateMiniHeightVar();
  }

  /* ---------------- Scroll binding (threshold) ---------------- */
  function bindControllers(){
    var mq  = win.matchMedia('(min-width:840px)');
    var raf = 0;

    function pastThreshold(){
      var header = markMainHeader();
      if (!header) return false;
      return (header.getBoundingClientRect().bottom || 0) <= MINI_BASE_H;
    }

    function update(){
      raf = 0;

      if (!mq.matches){
        // Mobile: painted from the start, hoist everything (no full nav)
        var group  = ensureMiniGroup();
        var bar    = group.bar;
        var header = markMainHeader();
        if (header){
          hoist('hamburger', findHamburger(header),      bar.querySelector('.llc-mini-left'));
          hoist('logo',      findLogo(header),           bar.querySelector('.llc-mini-center'));
          hoist('order',     findOrderContainer(header), bar.querySelector('.llc-mini-right'));
          hoist('icons',     findIconsWrap(header),      bar.querySelector('.llc-mini-right'));
        }
        bar.classList.add('is-stuck','has-sides');
        HTML.setAttribute('data-llc-miniheader','on');
        updateMiniHeightVar();
        return;
      }

      // Desktop: only content hoisting toggles now (bg already on miniheader)
      if (pastThreshold()) stickMiniDesktop();
      else                 stageMiniDesktop();
    }

    function scroll(){
      if (!raf) raf = win.requestAnimationFrame(update);
    }

    // 🔧 rebind: restore everything BEFORE measuring header height
    function rebind(){
      restoreAll();
      ensureMiniGroup();
      computeCarrypad();
      markMainHeader();
      stealAndPaintBgNow();
      update();
    }

    if (!window.__LLC_V31__) window.__LLC_V31__ = {};
    window.__LLC_V31__.rebind = rebind;

    // If already bound for this document, just run per-route rebind
    if (window.__LLC_V31__.controllersBound){
      rebind();
      return;
    }
    window.__LLC_V31__.controllersBound = true;

    // First-time setup
    initCarrypadRobust();

    mq.addEventListener && mq.addEventListener('change', rebind);
    win.addEventListener('scroll', scroll, { passive:true });
    win.addEventListener('resize', function(){
      computeCarrypad();
      updateMiniHeightVar();
      stealAndPaintBgNow();
    }, { passive:true });
    win.addEventListener('orientationchange', function(){
      computeCarrypad();
      updateMiniHeightVar();
      stealAndPaintBgNow();
    }, { passive:true });

    // Initial run
    rebind();
  }

  /* ---------------- LIGHTBOX-only watcher ---------------- */
  function initLightboxWatcher(){
    if (win.__llcLBInt) return;
    function present(){ var lb = doc.querySelector('.lightbox'); return !!(lb && lb.isConnected); }
    function update(){ if (present()) HTML.setAttribute('data-llc-overlay','on'); else HTML.removeAttribute('data-llc-overlay'); }
    update();
    win.__llcLBInt = setInterval(update, 150);
    ['click','keydown','transitionend','resize','scroll'].forEach(function(ev){
      (ev==='resize'||ev==='scroll'?win:doc).addEventListener(ev, update, { passive:true });
    });
    if ('MutationObserver' in win){
      var mo = new MutationObserver(update);
      mo.observe(doc.body || doc, { attributes:true, childList:true, subtree:true });
    }
  }

  /* ---------------- PDP helpers ---------------- */
  function hasPDP(){ return !!($('.product__wrapper') && $('.product-gallery__wrapper') && $('.product-meta__wrapper')); }
  function moveBreadcrumbs(scopeEl, galleryWrap){
    var crumbs = doc.querySelector('.w-cell.display-desktop.breadcrumb-align.row') || doc.querySelector('.breadcrumb-align.row.display-desktop') || doc.querySelector('.breadcrumb-align');
    if (!crumbs) return;
    var marker = doc.getElementById('llc-crumbs-marker');
    if (!marker){ marker = doc.createElement('div'); marker.id = 'llc-crumbs-marker'; crumbs.parentElement && crumbs.parentElement.insertBefore(marker, crumbs); }
    function place(){ var vw = win.innerWidth || 1024;
      if (vw >= 600){ if (galleryWrap && crumbs.parentElement !== galleryWrap) galleryWrap.insertBefore(crumbs, galleryWrap.firstChild); }
      else { if (marker.parentElement && crumbs.parentElement !== marker.parentElement) marker.parentElement.insertBefore(crumbs, marker.nextSibling); }
    }
    place(); win.addEventListener('resize', place, { passive:true });
  }

  /* ---------------- Allergen accordion (added) ---------------- */

  // single retry timer so we don't stack intervals
  var allergenRetryId = null;

  function findDescriptionGroup(metaWrap){
    if (!metaWrap) return null;
    var btn = Array.from(metaWrap.querySelectorAll('button')).find(function(b){
      var p = b.querySelector('p.form-label');
      return p && /description/i.test((p.textContent || '').replace(/\s+/g,' ').trim());
    });
    if (btn) return btn.parentElement || btn.closest('.w-wrapper') || btn;
    return Array.from(metaWrap.querySelectorAll('.w-wrapper')).find(function(w){
      return /description/i.test((w.textContent || '').replace(/\s+/g,' ').trim()) && w.querySelector('button');
    }) || null;
  }
  function buildAllergenNode(D){
    var uid  = 'llc-allergen-'+Math.random().toString(36).slice(2,9);
    var wrap = D.createElement('div');
    wrap.id = 'llc-allergen-wrap';
    wrap.setAttribute('data-llc-allergen','true');
    var btn  = D.createElement('button');
    btn.type = 'button';
    btn.id   = uid+'-header';
    btn.className = '📚19-10-1IAuGr 📚19-10-1zAswq llc-accordion-button';
    btn.setAttribute('aria-controls', uid+'-panel');
    btn.setAttribute('aria-expanded', 'false');
    btn.innerHTML = '\n    <div class="📚19-10-1agDbH"><div>\n      <p class="form-label 📚19-10-1uGevg 📚19-10-1EEwzY"\n        style="line-height:1.1;letter-spacing:0.01em;--mobile-base-font-size:16;--mobile-font-size-scale:1.15;font-family:Larsseit;font-weight:bold;color:#fff;">\n        Allergen Info\n      </p>\n    </div></div>\n    <div class="📚19-10-1k6MzQ">\n      <span class="icon 📚19-10-1vCfSe" style="--color:currentColor;--icon-size:16px;--fill:currentColor;">\n        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16">\n          <path fill="currentColor" fill-rule="evenodd"\n            d="M7.3 4.3a1 1 0 0 1 1.4 0l6 6-1.4 1.4L8 6.42l-5.3 5.3-1.4-1.42 6-6Z"\n            clip-rule="evenodd"></path>\n        </svg>\n      </span>\n    </div>';
    var panel = D.createElement('div');
    panel.id = uid+'-panel';
    panel.setAttribute('role','region');
    panel.setAttribute('aria-labelledby', uid+'-header');
    panel.className = '📚19-10-1pynEn llc-accordion-panel';
    panel.style.maxHeight = '0px';
    panel.innerHTML = '\n    <div class="w-product-description__wrapper" showsubtitle="true" positiontop="true">\n      <div class="text-component w-product-description 📚19-10-1uGevg 📚19-10-1EEwzY"\n          style="line-height:1.3; letter-spacing:0; --mobile-base-font-size:16; --mobile-font-size-scale:1.15; font-family:Larsseit; font-weight:400; color:#fff;">\n        <span>\n          <p>All truffles contain <strong>dairy</strong></p>\n          <br>\n          <div style="opacity:.9; line-height:1.5">\n            <strong>Legend</strong><br>\n            [G] = contains gluten<br>\n            [P] = contains peanuts<br>\n            [T] = contains tree nuts<br>\n            [F] = gluten & nut free\n          </div>\n        </span>\n      </div>\n    </div>';
    function openPanel(){ btn.setAttribute('aria-expanded','true'); panel.style.maxHeight = panel.scrollHeight + 'px'; }
    function closePanel(){ btn.setAttribute('aria-expanded','false'); panel.style.maxHeight = panel.scrollHeight + 'px'; void panel.offsetHeight; panel.style.maxHeight = '0px'; }
    panel.addEventListener('transitionend', function(e){ if (e.propertyName !== 'max-height') return; if (btn.getAttribute('aria-expanded') === 'true') panel.style.maxHeight = 'unset'; });
    btn.addEventListener('click', function(e){ e.preventDefault(); (btn.getAttribute('aria-expanded') === 'true') ? closePanel() : openPanel(); });
    wrap.appendChild(btn); wrap.appendChild(panel); return wrap;
  }

  function ensureAllergen(metaWrap){
    if (!metaWrap) return false;

    // If we've already placed the allergen block on this PDP, don't touch DOM again.
    if (metaWrap.hasAttribute('data-llc-allergen-ready')) return true;

    var group = findDescriptionGroup(metaWrap);
    if (!group || !group.parentElement) return false;

    var anchor = doc.getElementById('llc-allergen-anchor');
    if (!anchor){
      anchor = doc.createElement('div');
      anchor.id = 'llc-allergen-anchor';
    }

    // Ensure anchor sits right after the description group
    if (group.nextSibling) {
      group.parentElement.insertBefore(anchor, group.nextSibling);
    } else {
      group.parentElement.appendChild(anchor);
    }

    var wrap = doc.getElementById('llc-allergen-wrap');
    if (!wrap) wrap = buildAllergenNode(doc);

    // Only insert if it's not already exactly where we want it
    if (anchor.parentNode && wrap !== anchor.nextSibling){
      anchor.parentNode.insertBefore(wrap, anchor.nextSibling);
    }

    // Mark this meta wrapper as "done" so we don't keep touching it
    metaWrap.setAttribute('data-llc-allergen-ready', 'true');

    return true;
  }

  function setupAllergen(metaWrap){
    if (!metaWrap) return;

    // Clear any previous retry loop (from a previous PDP)
    if (allergenRetryId) {
      clearInterval(allergenRetryId);
      allergenRetryId = null;
    }

    // Try once immediately
    if (ensureAllergen(metaWrap)) return;

    // Then start a light polling loop to handle slow PDP content / description load
    var tries = 0;
    var MAX_TRIES = 120; // 120 * 100ms = 12s

    allergenRetryId = setInterval(function(){
      tries++;

      // PDP might have been torn down; stop if it's gone
      if (!hasPDP()) {
        if (tries > MAX_TRIES) {
          clearInterval(allergenRetryId);
          allergenRetryId = null;
        }
        return;
      }

      // meta wrapper might have been re-rendered; re-grab it if possible
      var currentMeta = $('.product-meta__wrapper') || metaWrap;

      if (ensureAllergen(currentMeta) || tries > MAX_TRIES) {
        clearInterval(allergenRetryId);
        allergenRetryId = null;
      }
    }, 100);
  }

  function bootPDP(){
    if (!hasPDP()) return false;
    var productWrapper = $('.product__wrapper');
    var galleryWrap    = $('.product-gallery__wrapper');
    var metaWrap       = $('.product-meta__wrapper');
    var scopeEl = (productWrapper && (productWrapper.closest('.w-block[id]') || productWrapper.closest('.w-block') || productWrapper)) || null;
    if (scopeEl) scopeEl.setAttribute('data-llc-scope','pdp');
    if (productWrapper && productWrapper.parentElement) productWrapper.parentElement.setAttribute('data-llc-clear-mt','');
    moveBreadcrumbs(scopeEl, galleryWrap);
    setupAllergen(metaWrap);
    return true;
  }

  // -------------- Robust boot helper (waits for header) --------------  
  var __llcBootDone = false;

  function fullBoot(){
    if (__llcBootDone) return;
    // Don't boot until the main header actually exists
    if (!getFirstHeader()) return;

    __llcBootDone = true;

    // First pass: get everything wired up
    markMainHeader();
    ensureMiniGroup();
    computeCarrypad();
    stealAndPaintBgNow();
    bindControllers();
    initLightboxWatcher();

    // PDP: keep your existing “retry until PDP DOM is ready” behavior
    var boots = 0;
    var bootTimer = setInterval(function(){
      boots++;
      if (bootPDP() || boots > 80) clearInterval(bootTimer);
    }, 50);

    // 🔁 Extra safety passes
    setTimeout(function(){
      if (window.__LLC_V31__ && typeof window.__LLC_V31__.rebind === 'function'){
        window.__LLC_V31__.rebind();
      }
    }, 250);

    setTimeout(function(){
      if (window.__LLC_V31__ && typeof window.__LLC_V31__.rebind === 'function'){
        window.__LLC_V31__.rebind();
      }
    }, 900);
  }

  /* ---------------- Route + header watcher ---------------- */
  var lastHref = '';

  function onRouteChange(){
    __llcBootDone = false;

    try { restoreAll(); } catch(_){}

    // Stop any allergen retry tied to old PDP
    if (allergenRetryId) {
      clearInterval(allergenRetryId);
      allergenRetryId = null;
    }

    try {
      var currentScroll = win.scrollY || win.pageYOffset || 0;
      if (currentScroll > MINI_BASE_H){
        win.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      }
    } catch(_){}

    // 🧩 Re-apply the header/miniheader layout with nav items back in place
    try {
      if (window.__LLC_V31__ && typeof window.__LLC_V31__.rebind === 'function') {
        window.__LLC_V31__.rebind();
      }
    } catch(_){}
  }

  function tick(){
    var href = (win.location && win.location.href) || '';

    if (href !== lastHref){
      lastHref = href;
      onRouteChange();
    }

    fullBoot();
  }

  if (window.__LLC_V31__._tickId) clearInterval(window.__LLC_V31__._tickId);
  window.__LLC_V31__._tickId = setInterval(tick, 150);
  tick(); // kick it once immediately

  // Extra safety: once everything is loaded, try one more time to steal bg
  win.addEventListener('load', function(){
    stealAndPaintBgNow();
  });
})();