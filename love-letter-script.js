/* LLC v31.8.4-sticky-bg-steal — sticky miniheader (no fixed), steal header bg then clear it, LIGHTBOX-only watcher
   Step 1 tweak: hide .embed-code-1 */
(function(){
  if (window.__LLC_V31__) {
    try { window.__LLC_V31__.rebind && window.__LLC_V31__.rebind(); } catch(_){}
    return;
  }

  window.__LLC_V31__ = { version: '31.8.7-sticky-bg-steal+embed-container+miniportal-state-machine' };

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

  // simple viewport helper
  function isDesktop(){
    try {
      return !!(win.matchMedia && win.matchMedia('(min-width:840px)').matches);
    } catch(_){
      return (win.innerWidth || 0) >= 840;
    }
  }

  // toggle home flag on <html> so CSS can react across routes
  function updateHomeFlag(){
    try{
      if (isHome()) HTML.setAttribute('data-llc-home','1');
      else HTML.removeAttribute('data-llc-home');
    } catch(_){}
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

#llc-miniportal{
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  display: none;
  pointer-events: none;
  z-index: 3;
}
#llc-miniportal.llc-portal-active{
  display: block;
}
#llc-miniportal.llc-portal-fixed{
  position: fixed !important;
  top: 0 !important;
  left: 0;
  right: 0;
}
#llc-miniportal #llc-miniheader{
  position: relative !important;
  top: 0 !important;
  margin-top: 0 !important;
  padding-top: 0 !important;
  pointer-events: auto;
}
html[data-llc-overlay="on"] #llc-miniportal{
  z-index: 1 !important;
  pointer-events: none !important;
}

html, body{ overflow-x: clip; }

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

/* Remove default section padding inside embed-code blocks */
[class^="embed-code-"] .container,
[class*=" embed-code-"] .container{
  padding-left: 0 !important;
  padding-right: 0 !important;
  padding-top: 0 !important;
  padding-bottom: 0 !important;
}

/* home tweak via html flag */
html[data-llc-home="1"] .📚19-10-1rI2oH .image__wrapper{display:none;}
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
  function ensureMiniPortal(){
    var portal = doc.getElementById('llc-miniportal');
    if (portal) return portal;
    portal = doc.createElement('div');
    portal.id = 'llc-miniportal';
    doc.body.appendChild(portal);
    return portal;
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

  var MINI_FLOW = {
    state: 'home',
    lastY: 0,
    anchorTop: 0,
    headerBottom: 0
  };

  function currentScrollY(){
    return Math.max(0, win.scrollY || win.pageYOffset || 0);
  }

  function miniHeight(){
    var raw = parseFloat(getComputedStyle(HTML).getPropertyValue('--llc-mini-h'));
    return Math.max(1, Math.round(raw || updateMiniHeightVar() || MINI_BASE_H));
  }

  function headerDocBottom(){
    var header = markMainHeader();
    if (!header) return 0;
    var rect = header.getBoundingClientRect();
    return Math.max(0, Math.round(currentScrollY() + (rect.bottom || 0)));
  }

  function portalSet(state, topPx){
    var portal = ensureMiniPortal();
    MINI_FLOW.state = state;
    MINI_FLOW.anchorTop = Math.round(topPx || 0);

    portal.className = 'llc-portal-active';
    if (state === 'fixed') portal.className += ' llc-portal-fixed';

    if (state === 'fixed') portal.style.top = '0px';
    else portal.style.top = MINI_FLOW.anchorTop + 'px';
  }

  function portalOff(){
    var portal = doc.getElementById('llc-miniportal');
    if (portal){
      portal.className = '';
      portal.style.top = '0px';
    }
    MINI_FLOW.state = 'home';
    MINI_FLOW.anchorTop = 0;
  }

  function configureMiniContent(){
    var header = markMainHeader();
    var bar = ensureMiniBar();
    if (!header || !bar) return false;

    var left   = bar.querySelector('.llc-mini-left');
    var center = bar.querySelector('.llc-mini-center');
    var right  = bar.querySelector('.llc-mini-right');

    if (isDesktop()){
      hoist('nav',   findDesktopNavContainer(header), center);
      hoist('logo',  findLogo(header),                left);
      hoist('order', findOrderContainer(header),      right);
      hoist('icons', findIconsWrap(header),           right);
      restoreKey('hamburger');
    } else {
      restoreKey('nav');
      hoist('hamburger', findHamburger(header),      left);
      hoist('logo',      findLogo(header),           center);
      hoist('order',     findOrderContainer(header), right);
      hoist('icons',     findIconsWrap(header),      right);
    }

    bar.classList.add('is-stuck','has-sides');
    HTML.setAttribute('data-llc-miniheader','on');
    if (window.__LLC_V31__) window.__LLC_V31__.desktopStuck = isDesktop();
    updateMiniHeightVar();
    return true;
  }

  function moveMiniToPortal(){
    var portal = ensureMiniPortal();
    var bar = ensureMiniBar();
    configureMiniContent();
    if (bar.parentNode !== portal) portal.appendChild(bar);
    return bar;
  }

  function moveMiniHome(){
    var group = ensureMiniGroup();
    var bar = ensureMiniBar();

    if (bar.parentNode !== group.sp.parentNode || bar.previousSibling !== group.sp){
      group.sp.parentNode.insertBefore(bar, group.sp.nextSibling);
    }

    portalOff();
    MINI_FLOW.lastY = currentScrollY();
  }

  function resetMiniFlow(){
    MINI_FLOW.lastY = currentScrollY();
    MINI_FLOW.headerBottom = headerDocBottom();
    if (currentScrollY() <= MINI_FLOW.headerBottom) moveMiniHome();
    else portalOff();
  }

  function startApproach(y){
    moveMiniToPortal();
    portalSet('approach', y - miniHeight());
  }

  function startFixed(){
    moveMiniToPortal();
    portalSet('fixed', 0);
  }

  function startExit(y){
    moveMiniToPortal();
    portalSet('exit', y);
  }

  function updateMiniPortalFlow(){
    var y = currentScrollY();
    var dy = y - MINI_FLOW.lastY;
    MINI_FLOW.lastY = y;

    var hb = headerDocBottom();
    MINI_FLOW.headerBottom = hb;

    if (HTML.getAttribute('data-llc-overlay') === 'on'){
      return false;
    }

    if (y <= hb){
      moveMiniHome();
      return false;
    }

    if (Math.abs(dy) < 1){
      return MINI_FLOW.state !== 'home';
    }

    if (MINI_FLOW.state === 'home'){
      if (dy < 0) startApproach(y);
      else {
        portalOff();
        return false;
      }
    }

    if (MINI_FLOW.state === 'approach'){
      if (y <= MINI_FLOW.anchorTop){
        startFixed();
      } else if (dy > 0 && y >= MINI_FLOW.anchorTop + miniHeight()){
        portalOff();
        return false;
      }
      return true;
    }

    if (MINI_FLOW.state === 'fixed'){
      if (dy > 0) startExit(y);
      return true;
    }

    if (MINI_FLOW.state === 'exit'){
      if (dy < 0 && y <= MINI_FLOW.anchorTop){
        startFixed();
      } else if (dy > 0 && y >= MINI_FLOW.anchorTop + miniHeight()){
        portalOff();
        return false;
      }
      return true;
    }

    return MINI_FLOW.state !== 'home';
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

  // helper: has desktop miniheader actually gone into "stuck" mode (left/right hoisted)
  function miniHeaderWasStuck(){
    return !!(window.__LLC_V31__ && window.__LLC_V31__.desktopStuck);
  }

  // ensure everything is back in the header + miniheader reset
  function restoreHeaderToFull(){
    try { restoreAll(); } catch(_){}
    try {
      moveMiniHome();
      var bar = doc.getElementById('llc-miniheader');
      if (bar) bar.classList.remove('is-stuck','has-sides');
      HTML.removeAttribute('data-llc-miniheader');
    } catch(_){}
  }

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
    // desktop miniheader is not stuck in this mode
    window.__LLC_V31__.desktopStuck = false;
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
    HTML.setAttribute('data-llc-miniheader','on');
    // desktop miniheader has now entered stuck mode
    window.__LLC_V31__.desktopStuck = true;
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

      var y = currentScrollY();
      var hb = headerDocBottom();

      if (y > hb){
        if (updateMiniPortalFlow()) return;

        // Below the real header region, the miniheader should be gone unless re-entering.
        HTML.removeAttribute('data-llc-miniheader');
        if (window.__LLC_V31__) window.__LLC_V31__.desktopStuck = false;
        return;
      }

      // In the real header region, use the normal in-flow sticky header.
      moveMiniHome();

      if (!mq.matches){
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

    function rebind(){
      ensureMiniGroup();

      // NEW: if we navigated while mobile, and are now on desktop,
      // run a one-time restore so the header can expand fully before measuring.
      if (isDesktop() && window.__LLC_V31__ && window.__LLC_V31__.needsDesktopRestore){
        restoreHeaderToFull();
        window.__LLC_V31__.needsDesktopRestore = false;
      }

      computeCarrypad();
      restoreAll();
      resetMiniFlow();
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
      resetMiniFlow();
      stealAndPaintBgNow();
    }, { passive:true });
    win.addEventListener('orientationchange', function(){
      computeCarrypad();
      updateMiniHeightVar();
      resetMiniFlow();
      stealAndPaintBgNow();
    }, { passive:true });

    // Initial run
    resetMiniFlow();
    update();
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

  function bootPDP(){
    if (!hasPDP()) return false;
    var productWrapper = $('.product__wrapper');
    var galleryWrap    = $('.product-gallery__wrapper');
    var scopeEl = (productWrapper && (productWrapper.closest('.w-block[id]') || productWrapper.closest('.w-block') || productWrapper)) || null;
    if (scopeEl) scopeEl.setAttribute('data-llc-scope','pdp');
    if (productWrapper && productWrapper.parentElement) productWrapper.parentElement.setAttribute('data-llc-clear-mt','');
    moveBreadcrumbs(scopeEl, galleryWrap);
    return true;
  }

  // -------------- Robust boot helper (waits for header) --------------  
  var __llcBootDone = false;

  function fullBoot(){
    if (__llcBootDone) return;
    // Don't boot until the main header actually exists
    if (!getFirstHeader()) return;

    __llcBootDone = true;

    // Home flag for this route
    updateHomeFlag();

    // First pass: get everything wired up
    markMainHeader();
    ensureMiniGroup();
    computeCarrypad();
    stealAndPaintBgNow();
    bindControllers();
    initLightboxWatcher();

    // PDP: retry until PDP DOM is ready
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

  /* ---------------- Route interceptors: restore before SPA nav ---------------- */
  (function installRouteInterceptors(){
    if (window.__LLC_V31__.routeInterceptorsInstalled) return;
    window.__LLC_V31__.routeInterceptorsInstalled = true;

    // ensure flag exists
    window.__LLC_V31__.needsDesktopRestore = false;

    function preRoute(){
      // DESKTOP: restore immediately if miniheader had actually stuck
      if (isDesktop()) {
        if (miniHeaderWasStuck()) {
          restoreHeaderToFull();
          window.__LLC_V31__.needsDesktopRestore = false;
        }
      } else {
        // MOBILE: don't restore now (keeps miniheader content),
        // but remember that the next time we hit desktop we should restore once.
        window.__LLC_V31__.needsDesktopRestore = true;
      }
    }

    // History API (pushState / replaceState)
    var _push = history.pushState, _replace = history.replaceState;
    history.pushState = function(){
      preRoute();
      return _push.apply(this, arguments);
    };
    history.replaceState = function(){
      preRoute();
      return _replace.apply(this, arguments);
    };

    // Browser nav
    win.addEventListener('popstate', preRoute, { passive:true });
    win.addEventListener('hashchange', preRoute, { passive:true });

    // In-app same-origin link clicks (capture so we run before router)
    doc.addEventListener('click', function(e){
      if (e.defaultPrevented) return;
      var a = e.target && e.target.closest && e.target.closest('a[href]');
      if (!a) return;
      try {
        var url = new URL(a.href, win.location.href);
        if (url.origin !== win.location.origin) return; // external
        if (url.href !== win.location.href) preRoute();
      } catch(_){}
    }, true);
  })();

  /* ---------------- Route + header watcher ---------------- */
  var lastHref = '';

  function onRouteChange(){
    __llcBootDone = false;

    // Update home flag for the new route
    updateHomeFlag();
    try { resetMiniFlow(); } catch(_){}

    // DESKTOP: if miniheader was stuck, restore immediately
    if (isDesktop() && miniHeaderWasStuck()) {
      restoreHeaderToFull();
      if (window.__LLC_V31__) window.__LLC_V31__.needsDesktopRestore = false;
    } else if (!isDesktop()) {
      // MOBILE: mark that when we next become desktop, we should do a one-time restore
      if (window.__LLC_V31__) window.__LLC_V31__.needsDesktopRestore = true;
    }

    // If we were scrolled down, jump back to top so new header can fully expand
    try {
      var currentScroll = win.scrollY || win.pageYOffset || 0;
      if (currentScroll > MINI_BASE_H){
        win.scrollTo({ top: 0, left: 0, behavior: 'auto' });
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
    // and re-assert the home flag if needed
    updateHomeFlag();
  });
})();