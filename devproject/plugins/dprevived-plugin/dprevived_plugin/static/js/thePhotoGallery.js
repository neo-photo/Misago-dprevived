function thePhotoGalleryReady(fn) {
  if (document.readyState != 'loading'){
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}

class thePhotoGallery {

    version = "1";
    #gMouseDownX = 0;
    #gMouseDownY = 0;
    #gMouseDownOffsetX = 0;
    #gMouseDownOffsetY = 0;
    #ovImages = {};
    #cache = {"exif":{}};
    #moveMouse = (e) => {this.divMove(e)};    
    #fallBackErrorSvG = '<svg viewBox="-10 -10 80 40" fill="none" xmlns="http://www.w3.org/2000/svg" ><g id="SVGRepo_iconCarrier"> <path  stroke="#ff0000" d="M0 11.25L4.75 16H11.25L16 11.25V4.75L11.25 0H4.75L0 4.75V11.25Z" fill="#fff"></path> </g><text y="9.5" x="1.5" fill="#f00"  font-size="5">Error</text></svg>';
    #fallBackError = "data:image/svg+xml;base64," +  btoa(unescape(encodeURIComponent(this.#fallBackErrorSvG)));
    #fallBackCss = "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";
    #decompress = base64string => {
    const bytes = Uint8Array.from(atob(base64string), c => c.charCodeAt(0));
    const cs = new DecompressionStream('gzip');
    const writer = cs.writable.getWriter();
    writer.write(bytes);
    writer.close();
    return new Response(cs.readable).arrayBuffer().then(function (arrayBuffer) {
        return new TextDecoder().decode(arrayBuffer);
    });
}
    #final = {};      // image address -> the address it redirects to (filled in by #resolve)
    #resolving = {};  // image address -> promise of that final address
    #prepared = {};   // final address -> promise, resolved when the image is loaded and decoded
    #openToken = 0;   // the latest openImage() call; an older one that is still waiting gives up
    #drag = {vx: 0, vy: 0, t: 0, x: 0, y: 0, glide: 0};  // zoom drag: speed (px/ms), last event, glide frame
    #zoomSpot = null; // zoomed: the photo's spot in the middle (fractions), kept over a size change
    #idleTimer = 0;   // fullscreen: hides the controls when the mouse rests
    #restTimer = 0;   // fullscreen: hides the mouse pointer when the mouse rests
    #slideTimer = 0;  // slideshow: the next image
    #changeStart = 0; // when the last image change (transition) started
    #ovEls = {};      // image address -> its <img> in the page (the first one), for the header info
    #sizes = {};      // final preview address -> its pixel size {w, h} (known once decoded)
    #shownSize = null;  // pixel size of the image shown now (for the Morph transition)
    #morphAnims = [];   // the running Morph animations

    
    constructor(selector = "article.misago-markup img") {
        // config Vars
        this.selector = selector;
        this.timeout = 3000;  // slideshow: how long an image is shown (after its transition)
        this.transition = "pop";  // image change: "quick", "fade", "pop" or "morph"; the
                                  // viewer's chooser overrides it with the user's last choice
        this.storageKey = "dp-image-viewer";  // localStorage: last transition, fullscreen
        this.myId = "image-ov";
        this.useExif = true;
        this.addExif = false;
        this.cylce = true;
        this.clearOnRefresh = true;
        this.addDownload = true;
        this.addPreviewDownload = true;
        this.bootstrap = ["css", "html" , "font"];
        this.absPath = "."; // must not contain host because of same orgin policy
        this.errorImage = "/img/lost.webp" ;
        this.fontUrl = '/font/MaterialIcons-Regular.woff2';
        this.css = '/css/thePhotoGallery.css';
        
    }

  bootstrapCss() {
  
    let foundCss = false;
    //console.log(this.absPath +this.css);
    for (const sheet of document.styleSheets) {
      if (sheet.href != null )
      { if(sheet.ownerNode.attributes.href.value.split("?")[0] == this.absPath + this.css) foundCss = true;}
    }
    //console.log(foundCss);
    if (foundCss == false) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.addEventListener('error',  (e) =>{
         const css = document.createElement('style');
        Promise.resolve(this.#fallBackCss)
        .then(v => this.#decompress(v))
        .then(v => {css.innerHTML = v;document.head.appendChild(css);})
        .catch(e => console.log("Got a promise error when decompressing  css: " + e));         
      });
      link.href = this.absPath + this.css; 
      document.head.appendChild(link);
    }
  }

  bootstrapHtml() {
  const template ='<!DOCTYPE html><html><body><div class="head">        <div class="exifOverlay"></div>        <div class="nav-ov">            <a href="" target="_blank" title="download preview version" style="display:none;" class="ext" ><button class="btn-default btn btn-outline btn-image-ov" ><span class="material-icon">picture_in_picture</span></button></a>            <a href="" target="_blank" title="download big version" class="download" ><button class="btn-default btn btn-outline btn-image-ov" ><span class="material-icon">file_download</span></button></a>            <button data-class="slideshow" title="run slideshow" class="btn-default btn-outline btn btn-image-ov btn-css radio-btn size"><span class="material-icon off">play_circle_outline</span><span class="material-icon on">pause_circle_outline</span></button>            <button data-class="album" title="show gallery" class="btn-default btn-outline btn btn-image-ov btn-css radio-btn size"><span class="material-icon">dashboard</span></button>            <button data-class="big" title="zoom in / out" class="btn-default btn-outline btn btn-image-ov btn-css radio-btn size"><span class="material-icon off">add_circle_outline</span><span class="material-icon on">remove_circle_outline</span></button>            <button data-class="full" title="fullscreen mode" class="btn-default btn-outline  btn btn-image-ov btn-css"><span class="material-icon off">fullscreen</span><span class="material-icon on">fullscreen_exit</span></button>            <button data-class="close" title="close popup" class="btn-default btn btn-block btn-image-ov btn-css"><span class="material-icon">close</span></button>        </div>    </div></body></html>';
  const template2='<!DOCTYPE html><html><body>    <div class="lighttable">        <div class="album hide"></div>        <div class="nav nav-prev dprev-btn" ><span class="material-icon left">keyboard_arrow_left</span><span class="hide material-icon down">keyboard_arrow_down</span></div>        <div class="nav nav-next dprev-btn" ><span class="material-icon right">keyboard_arrow_right</span><span class="hide material-icon up">keyboard_arrow_up</span></div>            <div class="backImage">            <img class="picture" draggable="false" >        </div>         <div class="layer2"><img class="picture" draggable="false" > <svg version="1.1" viewBox="-58 -58 116 116" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"> <!-- https://freesvg.org/1544764567 -->   <style>.shadow {font-size:12px;filter: drop-shadow(3px 3px 5px rgb(255,255,255));}</style> <text x="-20" y="5" class="shadow" fill="#000">preview</text> <g stroke-linecap="round" stroke-width="15"> <path id="a" d="m0 35 0,14"/> <use transform="rotate(210)" xlink:href="#a" stroke="#f0f0f0"/> <use transform="rotate(240)" xlink:href="#a" stroke="#ebebeb"/> <use transform="rotate(270)" xlink:href="#a" stroke="#d3d3d3"/> <use transform="rotate(300)" xlink:href="#a" stroke="#bcbcbc"/> <use transform="rotate(330)" xlink:href="#a" stroke="#a4a4a4"/> <use transform="rotate(0)" xlink:href="#a" stroke="#8d8d8d"/> <use transform="rotate(30)" xlink:href="#a" stroke="#757575"/> <use transform="rotate(60)" xlink:href="#a" stroke="#5e5e5e"/> <use transform="rotate(90)" xlink:href="#a" stroke="#464646"/> <use transform="rotate(120)" xlink:href="#a" stroke="#2f2f2f"/> <use transform="rotate(150)" xlink:href="#a" stroke="#171717"/> <use transform="rotate(180)" xlink:href="#a" stroke="#33a"/> <animateTransform attributeName="transform" begin="0s" dur="16s" type="rotate" from="0 0 0" to="360 0 0" repeatCount="indefinite" /> </g> </svg>       </div>    </div></body></html>';
    let parser = new DOMParser();
    let code = parser.parseFromString(template, 'text/html');
    let newdiv = document.createElement("div");
    newdiv.style.display = "none";
    newdiv.id = this.myId;
    newdiv.appendChild(code.body.firstElementChild);
    code = parser.parseFromString(template2, 'text/html');
    newdiv.appendChild(code.body.firstElementChild);
    document.body.insertBefore(newdiv,document.body.firstChild);
  }
  
  bootstrapFont() {
    if ((document.fonts.status == "loaded") && (!document.fonts.check("12px Material"))) {
      const font = new FontFace("Material", 'url('+ this.absPath +this.fontUrl + ')'); 
      document.fonts.add(font);
      }
    else {
      document.fonts.addEventListener("loaded", (v) => { 
      if (!document.fonts.check("12px Material")) {
        const font = new FontFace("Material", 'url('+ this.absPath +this.fontUrl + ')'); 
        document.fonts.add(font);
        }
      });
   }
  }
  
  initGallery(){
    //alert("g4");
    if (this.absPath[0] in [".","/"]) {console.error("Error wrong absPath:",this.absPath)}
    if (this.bootstrap.indexOf("html")>-1 && document.querySelector('#' + this.myId) == undefined) {this.bootstrapHtml();}
    if (this.bootstrap.indexOf("css")>-1) {this.bootstrapCss()}
    if (this.bootstrap.indexOf("font")>-1) {this.bootstrapFont()}
    
    window.addEventListener('mouseup', (e) => {this.mouseUp()}, false);
    document.querySelector('#' + this.myId +' .backImage img.picture').addEventListener('mousedown',(e) =>{ this.mouseDown(e)}, false);
    document.querySelector('#' + this.myId +' svg').addEventListener('click', (e) => {this.preview();});
    document.querySelectorAll("#" + this.myId +" .backImage img.picture").forEach((e)=>{
        e.addEventListener('load', (e) => {this.loadedOvImage();});
        e.addEventListener('error',  (e) =>{let t = e.target;
                                            //console.log(t.src);
                                            let small = document.querySelector("#" + this.myId +" .ext").href;
                                            //console.log(t.src, small, this.absPath + this.errorImage);
                                            if ((t.src == document.querySelector("#" + this.myId +" .download").href) && (document.querySelector("#" + this.myId +" .download").href!=small) && (small !="" )) {
                                              t.src = small;
                                              document.querySelector("#" + this.myId +" .backImage").style.backgroundImage = "url('"+small+"')";
                                            }
                                            else { 
                                              if (document.querySelector("#" + this.myId +" button[data-class='slideshow']").classList.contains("active") ) {
                                               document.querySelector("#" + this.myId +" div.nav-next").click();}
                                              else if (t.getAttribute("src") != this.absPath + this.errorImage) {
                                                  console.log(t.src, this.absPath + this.errorImage);
                                                  t.src = this.absPath + this.errorImage; //window.location.origin
                                                  t.classList.add("lost");
                                                  }
                                              else {
                                                console.log("error Image not found");
                                                t.src = this.#fallBackError;
                                                t.classList.add("lost");
                                              }
                                             }
                                              });
        });

    document.querySelectorAll("#" + this.myId +" button.btn-css").forEach(
    (e) => { e.addEventListener('click',(e) =>{this.ovNavi(e);return false;});}
    );
    document.querySelectorAll("#" + this.myId +" div.nav").forEach(
    (e) => { e.addEventListener('click',(e) =>{this.switchImage(e);return false;});}
    );
    // mouse in the left/right 10% of the image area: .near-prev / .near-next on the
    // viewer, so CSS can make that arrow more visible
    let area = document.querySelector("#" + this.myId + " .lighttable");
    let ov = document.getElementById(this.myId);
    area.addEventListener('mousemove', (e) => {
        let r = area.getBoundingClientRect();
        let x = (e.clientX - r.left) / r.width;
        ov.classList.toggle("near-prev", x < 0.1);
        ov.classList.toggle("near-next", x > 0.9);
    });
    area.addEventListener('mouseleave', (e) => { ov.classList.remove("near-prev", "near-next"); });
    // fullscreen: mouse movement near an edge (10% of the screen) shows the controls again,
    // any movement shows the mouse pointer
    ov.addEventListener('mousemove', (e) => {
        if (!ov.classList.contains("full")) return;
        this.#rest();
        let x = e.clientX / window.innerWidth, y = e.clientY / window.innerHeight;
        if (x < 0.1 || x > 0.9 || y < 0.1 || y > 0.9) this.#idle(true);
    });
    // leaving browser fullscreen (Esc, F11 ...) leaves the viewer's fullscreen too
    document.addEventListener('fullscreenchange', (e) => {
        if (!document.fullscreenElement && ov.classList.contains("full")) this.setFull(false);
        else this.#restoreZoomSpot();
    });
    // keyboard: left/right arrow = previous/next image, Space = slideshow on/off, Esc =
    // close (in browser fullscreen the browser takes Esc itself and leaves fullscreen first). In the gallery: left/right
    // move a selection over the thumbnails (.sel), Enter opens it, Esc closes the gallery.
    document.addEventListener('keydown', (e) => {
        if (ov.style.display == "none" || e.altKey || e.ctrlKey || e.metaKey) return;
        if (e.target.closest && e.target.closest("input, textarea, select, [contenteditable]")) return;
        let menu = ov.querySelector(".iv-trans-menu");
        if (menu && !menu.hidden) { if (e.key == "Escape") { menu.hidden = true; e.preventDefault(); } return; }
        // a viewer button clicked before keeps the focus, and a key press would make the
        // browser show its focus outline: release it for the keys handled here
        if (["ArrowLeft", "ArrowRight", "Enter", "Escape", " "].includes(e.key)
            && document.activeElement && ov.contains(document.activeElement)
            && document.activeElement.tagName == "BUTTON") document.activeElement.blur();
        let album = ov.querySelector("div.album");
        if (!album.classList.contains("hide")) { this.#albumKey(e, album); return; }
        if (e.key == "ArrowLeft") { ov.querySelector("div.nav-prev").click(); e.preventDefault(); }
        else if (e.key == "ArrowRight") { ov.querySelector("div.nav-next").click(); e.preventDefault(); }
        else if (e.key == "Escape") { this.close(); }
        else if (e.key == " ") {                       // Space: slideshow on / off
            let btn = ov.querySelector("button[data-class='slideshow']");
            if (btn) { btn.click(); e.preventDefault(); }
        }
    });
    // header: position, poster and file name (.iv-info) before the EXIF line; the EXIF
    // line gets its full text as a tooltip (it is cut with "..." when too long)
    this.#buildTransitionChooser(ov);
    let saved = this.#load();
    if (saved.transition) this.transition = saved.transition;
    this.setTransition(this.transition, false);
    let head = ov.querySelector(".head");
    if (head && !head.querySelector(".iv-info")) {
        let info = document.createElement("div");
        info.className = "iv-info";
        head.insertBefore(info, head.firstChild);
    }
    let exifEl = ov.querySelector(".head .exifOverlay");
    if (exifEl) new MutationObserver(() => { exifEl.title = exifEl.textContent.replace(/\s+/g, " ").trim(); })
        .observe(exifEl, {childList: true, subtree: true});
    this.refreshGallery();
}

  // Zoom: dragging the image scrolls the image area, so dragging and the scrollbars are
  // one mechanism (the image edges are the limits; CSS adds a little room around the
  // image for looking at its edges). .dragging on the viewer while dragging, for the cursor.
  // Released while moving, the image glides on and slows down (mouse only: touch screens
  // scroll the area natively, with their own momentum).
  mouseUp() {
    window.removeEventListener('mousemove', this.#moveMouse, true);
    let ov = document.getElementById(this.myId);
    if (!ov.classList.contains("dragging")) return;
    ov.classList.remove("dragging");
    let d = this.#drag;
    if (performance.now() - d.t > 80) return;          // had stopped before letting go
    let area = document.querySelector('#' + this.myId +' .backImage');
    let last = performance.now();
    let step = (now) => {
        let dt = Math.min(now - last, 50);
        last = now;
        area.scrollLeft -= d.vx * dt;
        area.scrollTop -= d.vy * dt;
        let slow = Math.pow(0.995, dt);                // about 8% less speed per frame
        d.vx *= slow;
        d.vy *= slow;
        if (Math.abs(d.vx) + Math.abs(d.vy) > 0.02) d.glide = requestAnimationFrame(step);
    };
    d.glide = requestAnimationFrame(step);
}

  mouseDown(e) {
    e.preventDefault();
    let area = document.querySelector('#' + this.myId +' .backImage');
    cancelAnimationFrame(this.#drag.glide);
    this.#gMouseDownX = e.clientX;
    this.#gMouseDownY = e.clientY;
    this.#gMouseDownOffsetX = area.scrollLeft;
    this.#gMouseDownOffsetY = area.scrollTop;
    this.#drag = {vx: 0, vy: 0, t: performance.now(), x: e.clientX, y: e.clientY, glide: 0};
    document.getElementById(this.myId).classList.add("dragging");
    window.addEventListener('mousemove', this.#moveMouse, true);
}

 divMove(e){
    let area = document.querySelector('#' + this.myId +' .backImage');
    area.scrollLeft = this.#gMouseDownOffsetX - (e.clientX - this.#gMouseDownX);
    area.scrollTop = this.#gMouseDownOffsetY - (e.clientY - this.#gMouseDownY);
    // speed of the last moves (smoothed), for the glide after letting go
    let d = this.#drag, now = performance.now(), dt = Math.max(now - d.t, 1);
    d.vx = 0.7 * (e.clientX - d.x) / dt + 0.3 * d.vx;
    d.vy = 0.7 * (e.clientY - d.y) / dt + 0.3 * d.vy;
    d.t = now; d.x = e.clientX; d.y = e.clientY;
}

  // Header info: "3 / 6 · name". The name is the quoted author for an image in a quote,
  // else the poster; it links to the post the image is in, as an anchor on this page
  // (#post-<id>: no page reload; the gallery only has this page's images anyway).
  // Tooltip: the file's original name (from the post's attachment list), else the last
  // part of its address.
  #showInfo(src, iPos, ov) {
    let info = ov.querySelector(".iv-info");
    if (!info) return;
    info.textContent = "";
    let total = Object.keys(this.#ovImages).length;
    let pos = document.createElement("span");
    pos.className = "iv-pos";
    pos.textContent = (iPos + 1) + " / " + total;   // thin spaces around the slash
    info.appendChild(pos);
    let el = this.#ovEls[src];
    let name = "", fileName = "", postLink = "";
    if (el) {
        let quote = el.closest("blockquote[data-author]");
        let post = el.closest("li.post");
        if (post && post.id) postLink = location.href.split("#")[0] + "#" + post.id;
        if (quote) name = quote.dataset.author.replace(/^@/, "");
        else if (post) {
            let a = post.querySelector("a.item-title[href*='/u/']");
            if (a) name = a.textContent.trim();
        }
        let link = el.parentElement && el.parentElement.href;
        if (link && post) {
            let att = Array.from(post.querySelectorAll("a.attachment-name")).find((a) => a.href == link);
            if (att) fileName = att.textContent.trim();
        }
    }
    if (!fileName) {
        let parts = src.split("?")[0].split("/").filter((p) => p);
        fileName = decodeURIComponent(parts[parts.length - 1] || "");
        if (/^\d+$/.test(fileName)) fileName = "";     // /a/thumb/<secret>/<id>/: no name
    }
    if (name) {
        let sep = document.createElement("span");
        sep.className = "iv-sep";
        sep.textContent = "·";
        let a = document.createElement(postLink ? "a" : "span");
        a.className = "iv-name";
        a.textContent = name;
        if (postLink) {
            a.href = postLink;
            a.addEventListener("click", (e) => { this.close(); });
        }
        info.appendChild(sep);
        info.appendChild(a);
    }
    info.title = fileName;
  }

  // length of the image change transition (the CSS variable --dp-iv-fade), in ms
  #fadeMs() {
    let ov = document.getElementById(this.myId);
    let f = getComputedStyle(ov).getPropertyValue(ov.classList.contains("t-quick") ? "--dp-iv-quick" : "--dp-iv-fade").trim();
    return parseFloat(f) * (f.endsWith("ms") ? 1 : 1000) || 0;
  }

  // Morph: both layers are put exactly on the new image's rectangle (picture stretched to
  // fill it) and animated together from the old image's rectangle to the new one (a move
  // and a scale, so photos of other proportions are squeezed on the way); the old one
  // stays underneath, the new one fades in on top. At the end the layers go back to
  // their normal full-area "contain" setup, which draws the same rectangle.
  #morph(o, n) {
    this.#endMorph();
    let ov = document.getElementById(this.myId);
    let area = ov.querySelector(".lighttable");
    let W = area.clientWidth, H = area.clientHeight;
    let fit = (s) => {
        let k = Math.min(W / s.w, H / s.h);
        let w = s.w * k, h = s.h * k;
        return {x: (W - w) / 2, y: (H - h) / 2, w: w, h: h};
    };
    let a = fit(o), b = fit(n);
    let from = "translate(" + ((a.x + a.w / 2) - (b.x + b.w / 2)) + "px, " + ((a.y + a.h / 2) - (b.y + b.h / 2))
             + "px) scale(" + (a.w / b.w) + ", " + (a.h / b.h) + ")";
    let timing = {duration: this.#fadeMs(), easing: "ease-in-out"};
    let layers = [ov.querySelector(".backImage"), ov.querySelector(".layer2")];
    layers.forEach((l, i) => {
        Object.assign(l.style, {left: b.x + "px", top: b.y + "px", width: b.w + "px", height: b.h + "px",
                                backgroundSize: "100% 100%"});
        let frames = i == 0 ? [{transform: from, opacity: 0}, {transform: "none", opacity: 1}]
                            : [{transform: from, opacity: 1}, {transform: "none", opacity: 1}];
        this.#morphAnims.push(l.animate(frames, timing));
    });
    let anims = this.#morphAnims;
    Promise.all(anims.map((x) => x.finished)).then(() => { if (anims === this.#morphAnims) this.#endMorph(); }, () => {});
  }

  // stop a Morph (finished, or a new change began): layers back to normal
  #endMorph() {
    this.#morphAnims.forEach((x) => x.cancel());
    this.#morphAnims = [];
    let ov = document.getElementById(this.myId);
    if (!ov) return;
    ov.querySelectorAll(".backImage, .layer2").forEach((l) => {
        l.style.left = l.style.top = l.style.width = l.style.height = l.style.backgroundSize = "";
    });
    // (.morph stays until the next change: removing it now would start the Pop animation)
  }

  // Slideshow: the next image this.timeout ms after the current one is fully there (its
  // transition over), whatever loading took; started again by every image change, so
  // prev/next by hand restart the time. Stops when the slideshow button is not active.
  #scheduleSlide() {
    clearTimeout(this.#slideTimer);
    let ov = document.getElementById(this.myId);
    let btn = ov.querySelector("button[data-class='slideshow']");
    if (!btn || !btn.classList.contains("active")) return;
    let fade = this.#fadeMs();
    let wait = Math.max(0, this.#changeStart + fade - performance.now()) + this.timeout;
    this.#slideTimer = setTimeout(() => {
        if (btn.classList.contains("active") && ov.style.display != "none") ov.querySelector("div.nav-next").click();
    }, wait);
  }

  // gallery keys: left/right move .sel (starting from the current image), Enter opens the
  // selected thumbnail, Esc closes the gallery (back to the image)
  #albumKey(e, album) {
    let thumbs = Array.from(album.querySelectorAll("img"));
    if (!thumbs.length) return;
    let i = thumbs.findIndex((t) => t.classList.contains("sel"));
    if (i < 0) i = thumbs.findIndex((t) => t.classList.contains("cur"));
    if (e.key == "ArrowLeft" || e.key == "ArrowRight") {
        e.preventDefault();
        i = i < 0 ? 0 : (i + (e.key == "ArrowRight" ? 1 : -1) + thumbs.length) % thumbs.length;
        thumbs.forEach((t) => t.classList.remove("sel"));
        let sel = thumbs[i];
        sel.classList.add("sel");
        // keep it in view
        if (sel.offsetTop < album.scrollTop) album.scrollTop = sel.offsetTop - 20;
        else if (sel.offsetTop + sel.offsetHeight > album.scrollTop + album.clientHeight)
            album.scrollTop = sel.offsetTop + sel.offsetHeight - album.clientHeight + 20;
    }
    else if (e.key == "Enter" && i >= 0) { e.preventDefault(); thumbs[i].click(); }
    else if (e.key == "Escape") {
        e.preventDefault();
        let btn = document.querySelector("#" + this.myId + " button[data-class='album']");
        if (btn) btn.click();
    }
  }

  // Fullscreen: the viewer fills the window (.full) and, where the browser allows, the
  // whole screen (Fullscreen API). Zoomed, the same spot of the photo stays in the middle.
  setFull(on) {
    let tElem = document.getElementById(this.myId);
    let btn = tElem.querySelector("button[data-class='full']");
    this.#keepZoomSpot(() => {
        tElem.classList.toggle("full", on);
        if (btn) btn.classList.toggle("active", on);
    });
    if (on && !document.fullscreenElement && tElem.requestFullscreen) tElem.requestFullscreen().catch(() => {});
    if (!on && document.fullscreenElement) document.exitFullscreen().catch(() => {});
    this.#idle(on);
    this.#save({full: on});
  }

  // remembered settings (localStorage; quietly nothing where it is not available)
  #load() {
    try { return JSON.parse(localStorage.getItem(this.storageKey)) || {}; } catch (e) { return {}; }
  }
  #save(values) {
    try { localStorage.setItem(this.storageKey, JSON.stringify(Object.assign(this.#load(), values))); } catch (e) {}
  }

  // Transition chooser: a button with the current mode's letter at the left of the header
  // buttons, opening a small menu. Q quick fade, F fade, P pop (fade + grow), M morph.
  #buildTransitionChooser(ov) {
    let bar = ov.querySelector(".nav-ov");
    if (!bar || bar.querySelector(".iv-trans")) return;
    let box = document.createElement("div");
    box.className = "iv-trans";
    let btn = document.createElement("button");
    btn.className = "btn-default btn btn-image-ov iv-trans-btn";
    btn.title = "image change: Quick, Fade, Pop, Morph (zoomed: Pop instead of Morph)";
    let menu = document.createElement("ul");
    menu.className = "iv-trans-menu";
    menu.hidden = true;
    [["quick", "Q", "Quick"], ["fade", "F", "Fade"], ["pop", "P", "Pop"], ["morph", "M", "Morph"]].forEach(([key, letter, label]) => {
        let li = document.createElement("li");
        li.dataset.t = key;
        if (key == "morph") li.title = "zoomed images use Pop";
        let b = document.createElement("b");
        b.textContent = letter;
        li.appendChild(b);
        li.appendChild(document.createTextNode(label));
        li.addEventListener("click", (e) => { this.setTransition(key); menu.hidden = true; });
        menu.appendChild(li);
    });
    btn.addEventListener("click", (e) => { menu.hidden = !menu.hidden; });
    document.addEventListener("click", (e) => { if (!box.contains(e.target)) menu.hidden = true; });
    box.appendChild(btn);
    box.appendChild(menu);
    bar.insertBefore(box, bar.firstChild);
  }

  // set the transition mode (and remember it, unless save is false)
  setTransition(t, save = true) {
    if (["quick", "fade", "pop", "morph"].indexOf(t) < 0) t = "pop";
    this.transition = t;
    let ov = document.getElementById(this.myId);
    let btn = ov && ov.querySelector(".iv-trans-btn");
    if (btn) btn.textContent = t[0].toUpperCase();
    if (ov) ov.dataset.transition = t;     // CSS dims M while zoomed (Pop is used there)
    if (ov) ov.querySelectorAll(".iv-trans-menu li").forEach((li) => li.classList.toggle("cur", li.dataset.t == t));
    if (save) this.#save({transition: t});
  }

  // fullscreen: .idle on the viewer 2.5 s after the controls were shown (CSS hides the
  // header and arrows then); #idle(true) shows them and starts that time again
  #idle(on) {
    let ov = document.getElementById(this.myId);
    clearTimeout(this.#idleTimer);
    ov.classList.remove("idle");
    if (on) this.#idleTimer = setTimeout(() => ov.classList.add("idle"), 2500);
    this.#rest(on);
  }

  // fullscreen: .resting on the viewer 2.5 s after the last mouse movement (CSS hides the
  // mouse pointer then)
  #rest(on = true) {
    let ov = document.getElementById(this.myId);
    clearTimeout(this.#restTimer);
    ov.classList.remove("resting");
    if (on) this.#restTimer = setTimeout(() => ov.classList.add("resting"), 2500);
  }

  // zoomed: remember which spot of the photo is in the middle, change the size, show that
  // spot again (once more on 'fullscreenchange', when the screen size has settled)
  #keepZoomSpot(change) {
    let ov = document.getElementById(this.myId);
    let area = ov.querySelector(".backImage");
    this.#zoomSpot = ov.classList.contains("big") && area.scrollWidth
        ? [(area.scrollLeft + area.clientWidth / 2) / area.scrollWidth,
           (area.scrollTop + area.clientHeight / 2) / area.scrollHeight]
        : null;
    change();
    this.#restoreZoomSpot();
  }

  #restoreZoomSpot() {
    if (!this.#zoomSpot) return;
    let [fx, fy] = this.#zoomSpot;
    let area = document.querySelector('#' + this.myId +' .backImage');
    requestAnimationFrame(() => {
        area.scrollLeft = fx * area.scrollWidth - area.clientWidth / 2;
        area.scrollTop = fy * area.scrollHeight - area.clientHeight / 2;
    });
  }

  // zoom: show the middle of the zoomed image
  centreZoom() {
    let area = document.querySelector('#' + this.myId +' .backImage');
    requestAnimationFrame(() => {
      area.scrollLeft = (area.scrollWidth - area.clientWidth) / 2;
      area.scrollTop = (area.scrollHeight - area.clientHeight) / 2;
    });
  }

  preview() {
    console.log("preview");
    document.querySelector("#" + this.myId +" .backImage").classList.add("unhide");
    document.querySelector("#" + this.myId +" .layer2").classList.add("dohide");
  }

  open() {
     document.querySelector("#" + this.myId).display= "block";
  }

  close() {
      let tElem = document.getElementById(this.myId);
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
      tElem.style.display='none';    
      document.querySelectorAll("#" + this.myId +" .nav-ov button.active").forEach((e)=>{
                          e.classList.remove("active");
                          tElem.classList.remove(e.dataset.class);
                        });
  }

  // The forum's image addresses (/a/..., /a/thumb/...) redirect to the file under /media/.
  // Browsers cache the file but not the redirect, so every new use of the address (a
  // background image, an <img>) costs a round trip to the forum first. Ask once where an
  // address leads (HEAD request) and use the final address from then on.
  #resolve(src) {
    if (!(src in this.#resolving)) {
      this.#resolving[src] = fetch(src, {method: "HEAD", credentials: "same-origin"})
        .then((r) => (r.ok && r.url) ? r.url : src)
        .catch(() => src)       // other sites (no CORS) and errors: the address as it is
        .then((url) => { this.#final[src] = url; return url; });
    }
    return this.#resolving[src];
  }

  // Load and decode an image, so it can be drawn at once; resolves with its final address.
  #prepare(src) {
    return this.#resolve(src).then((url) => {
      if (!(url in this.#prepared)) {
        let img = new Image();
        img.src = url;
        this.#prepared[url] = img.decode().then(() => {
            if (img.naturalWidth) this.#sizes[url] = {w: img.naturalWidth, h: img.naturalHeight};
            return url;
        }, () => url);
      }
      return this.#prepared[url];
    });
  }

  // the full-size address of an image (the link around it), or its own address
  #bigOf(src) {
    return this.#ovImages[src] ? this.#ovImages[src] : src;
  }

  // Prepare the neighbours of image number iPos (previews, and the next full-size image),
  // so that prev/next can start at once.
  #preloadAround(iPos) {
    let keys = Object.keys(this.#ovImages);
    if (keys.length < 2) return;
    let next = keys[(iPos + 1) % keys.length];
    let prev = keys[(iPos - 1 + keys.length) % keys.length];
    this.#prepare(next);
    this.#prepare(prev);
    if (this.#bigOf(next) != next) this.#resolve(this.#bigOf(next)).then((url) => this.#prepare(url));
  }

  // Open an image: the position is updated at once (so quick prev/next clicks count), the
  // visible change starts when the new preview is decoded and the full-size address is
  // known, or after 300 ms at the latest; so the transition does not start with nothing
  // to show. A newer openImage() call in the meantime cancels this one.
  openImage(src) {
    let iOvE = document.querySelector("#" + this.myId);
    let iPos = Object.keys(this.#ovImages).indexOf(src);
    iOvE.dataset.pos = iPos;
    let token = ++this.#openToken;
    let big = this.#bigOf(src);
    let ready = Promise.all([this.#prepare(src), this.#resolve(big)]);
    let limit = new Promise((ok) => setTimeout(ok, 300));
    Promise.race([ready, limit]).then(() => {
      if (token != this.#openToken) return;
      this.#showImage(src, this.#final[src] || src, this.#final[big] || big);
      this.#preloadAround(iPos);
    });
  }

 #showImage(src, previewUrl, bigUrl) {
    let div = document.querySelector("#" + this.myId +" .backImage img");
    div.style.top="0px";
    div.style.left="0px";
    // opened from the gallery: the new image appears from the background (as on a fresh
    // open), not over the image shown before the gallery
    let fromAlbum = !document.querySelector("#" + this.myId +" div.album").classList.contains("hide");
    document.querySelector("#" + this.myId +" div.album").classList.add("hide"); 
    document.querySelector("#" + this.myId +" button[data-class='album']").classList.remove("active");
    document.querySelectorAll("#" + this.myId +" .album img.cur, #" + this.myId +" .album img.sel").forEach((e)=>e.classList.remove("cur", "sel")); 
    let imageSrc = src;
    let iOvE = document.querySelector("#" + this.myId);
    let iOv = iOvE.querySelector("div.backImage");
    let iOvImg = iOv.querySelector("img.picture")
    iOvImg.classList.remove("lost");      // an error on the previous image does not stay
    let mylink = iOvE.querySelector(".head .nav-ov a.ext");
    //console.log(src);
    let path = "#" + this.myId +" .album img[src='" + imageSrc + "']";
    document.querySelectorAll(path).forEach((e)=>e.classList.add("cur")); 
    iOvE.querySelector(".exifOverlay").innerHTML = "";
    
    let bigSrc = imageSrc;
    //console.log(this.#ovImages[imageSrc] );
    if (this.#ovImages[imageSrc] != ""   ) {   
        bigSrc = this.#ovImages[imageSrc];
        if (this.addPreviewDownload) {
            mylink.href = imageSrc ;
            mylink.style.display = "block";
        }
        else {
            mylink.href = "" ;
            mylink.style.display = "none";    
       }
    }
    //console.log(imageSrc, bigSrc, iOvImg.src);
    iOvE.querySelector(".layer2").classList.remove("dohide");
    // the previous image waits on layer2: take over what the image layer showed (full-size
    // image and preview), not only the full-size image, which may not have loaded yet.
    // When the viewer is just being opened there is no previous image: the new one
    // appears from the viewer's background (not from the image shown last time).
    let freshOpen = iOvE.style.display == "none";
    let wasOpen = !freshOpen && !fromAlbum;
    iOvE.querySelector(".layer2").style.backgroundImage = wasOpen ? (iOv.style.backgroundImage || "url('"+ iOvImg.src +"')") : "none";
    iOvE.querySelector(".layer2").src = iOvImg.src;
    iOvE.style.display = "block";
    // opened again in fullscreen if it was left in fullscreen (the click that opened it
    // still counts as the user's action the browser requires for real fullscreen)
    if (freshOpen && this.#load().full && !iOvE.classList.contains("full")) this.setFull(true);
    iOv.classList.remove("unhide");
    iOvE.classList.add("progress");
    // restart the image change transition (CSS animations on .changing), independent of
    // how long loading takes
    // Morph instead of Pop when both sizes are known (not on a fresh open, not from the
    // gallery, not zoomed)
    let newSize = this.#sizes[previewUrl] || null;
    let morph = this.transition == "morph" && wasOpen && this.#shownSize && newSize
                && !iOvE.classList.contains("big");
    iOvE.classList.toggle("morph", !!morph);
    // Quick and Fade are CSS animations on .t-quick / .t-fade; Morph without a previous
    // image (first opening, from the gallery) fades in, and zoomed it uses Pop (both
    // change the geometry); Pop is the default
    let zoomed = iOvE.classList.contains("big");
    iOvE.classList.toggle("t-quick", this.transition == "quick");
    iOvE.classList.toggle("t-fade", this.transition == "fade" || (this.transition == "morph" && !morph && !zoomed));
    iOvE.classList.remove("changing");
    void iOvE.offsetWidth;
    iOvE.classList.add("changing");
    this.#changeStart = performance.now();
    if (morph) this.#morph(this.#shownSize, newSize);
    else this.#endMorph();
    this.#shownSize = newSize;

    // full-size image over the preview: the preview is decoded by now (openImage), so it
    // shows at once and the full-size image builds up over it. The final addresses (after
    // the forum's redirect) need no round trip to the forum.
    iOv.style.backgroundImage = (bigSrc != imageSrc) ? "url('"+bigUrl+"'), url('"+previewUrl+"')" : "url('"+previewUrl+"')";
    iOvE.querySelector(".head .nav-ov a.download").href = bigSrc ;
    iOvImg.src = bigSrc ;
    
    let iPos = Object.keys(this.#ovImages).indexOf(imageSrc);
    //console.log(imageSrc,iPos);
    iOvE.dataset.pos = iPos;
    this.ivChangeNav(iPos, iOvE);
    this.#showInfo(imageSrc, iPos, iOvE);
    if (this.useExif) this.makeExif(iOvImg.src, iOvE.querySelector(".exifOverlay"));    
}

 switchImage(e) {
     let elem = e.target;
     let iPos = 0;
     while (!elem.classList.contains("dprev-btn")) {elem = elem.parentElement;}
     let direction ="next";
     if (elem.classList.contains("nav-prev")){
         direction ="prev";
     }
    let iOvE = document.querySelector("#" + this.myId +"");
    let cPos = parseInt(iOvE.dataset.pos);

    if (this.cylce == true) {
        // cycle
        if (direction == "next") {
            iPos = cPos >= Object.keys(this.#ovImages).length-1 ? 0 : cPos+1;
        }
        else {
             iPos = cPos <= 0 ? Object.keys(this.#ovImages).length-1 : cPos-1;
        }
    }
    else {

        // STOP 
        if (direction == "next"){
             iPos = Math.min(cPos+1, this.#ovImages.length-1);
        }
        else {
             iPos = Math.max(0, cPos-1);
        }
    }
    
        
    if (iPos!=cPos) {
        this.openImage(Object.keys(this.#ovImages)[iPos]);
    }

}

 ivChangeNav(iPos, iOvE) {
    if (iPos == 0) {
         iOvE.querySelector("div.nav .left").classList.add("hide");
         iOvE.querySelector("div.nav .down").classList.remove("hide");
    }
    else {
         iOvE.querySelector("div.nav .down").classList.add("hide");
         iOvE.querySelector("div.nav .left").classList.remove("hide");
    }
    if (iPos == Object.keys(this.#ovImages).length-1) {
         iOvE.querySelector("div.nav .right").classList.add("hide");
         iOvE.querySelector("div.nav .up").classList.remove("hide");
    }
    else {
         iOvE.querySelector("div.nav .up").classList.add("hide");
         iOvE.querySelector("div.nav .right").classList.remove("hide");
    }
}

 ovNavi(e) {
    // slideshow album big full close
    let elem = e.target;
    while (elem.tagName.toUpperCase()!="BUTTON") {elem = elem.parentElement;}
    let tElem = document.getElementById(this.myId);
    let isActive = elem.classList.contains("active");
    let action = elem.dataset.class;
    let div = document.querySelector("#" + this.myId +" .backImage img");
    
    // reset (switching fullscreen keeps the gallery open)
    if (action != "full") document.querySelector("#" + this.myId +" div.album").classList.add("hide");       
    div.style.top="0px";
    div.style.left="0px"; 
    if (action == "close") {
      this.close();
    }
    else if (action == "full") {
        this.setFull(!isActive);
    }
    else {
        document.querySelectorAll("#" + this.myId +" .nav-ov button.radio-btn").forEach((e)=>{e.classList.remove("active");tElem.classList.remove(e.dataset.class);});
        if (isActive) {
            if (elem.dataset.class == "album") {  document.querySelector("#" + this.myId +" div.album").classList.add("hide"); }   
        }
        else {
           tElem.classList.add(elem.dataset.class);
           elem.classList.add("active");
           if (elem.dataset.class == "big") this.centreZoom();
           // slideshow: the next image at once (the current one has been seen); from
           // then on every image is timed by #scheduleSlide()
           if (elem.dataset.class == "slideshow" ) document.querySelector("#" + this.myId +" div.nav-next").click();
           if (elem.dataset.class == "album") {
               let album = document.querySelector("#" + this.myId +" div.album");
               album.classList.remove("hide");
               album.querySelectorAll("img.sel").forEach((t) => t.classList.remove("sel"));
               // the current image's thumbnail selected, in the middle of the gallery
               let cur = album.querySelector("img.cur");
               if (cur) cur.classList.add("sel");
               if (cur) album.scrollTop = cur.offsetTop - (album.clientHeight - cur.offsetHeight) / 2;
           }
        }      
    }


}

 loadedOvImage(e){
    //console.log("loaded:",e.target.src);
    document.querySelector("#" + this.myId +"").classList.remove("progress");
    if (document.querySelector("#" + this.myId).classList.contains("big")) this.centreZoom();
    //e.addEventListener('load',loadedOvImage(e));
    //cursor: progress;
    //console.log(this.timeout);
    this.#scheduleSlide();
    setTimeout((e)=>{
      document.querySelector("#" + this.myId +" .layer2").classList.add("dohide");
      document.querySelector("#" + this.myId +" .backImage").classList.remove("lost");    
      document.querySelector("#" + this.myId +" .backImage").classList.add("unhide");
      },10);
}

 addImage(el) {
     //console.log(src,big);
     if (!(el.src in this.#ovImages)) {
        let pe = el.parentElement;
        let big = "";
        if (pe.hasAttribute("href")) big = pe.href;
        this.#ovImages[el.src] = big; 
        this.#ovEls[el.src] = el;
        let gal = document.querySelector("#" + this.myId +" div.album");
        let nImg = document.createElement("img");
        // an image that cannot be loaded (dead link, file missing) is left out of the
        // gallery and of prev/next
        nImg.addEventListener('error', (e) => { delete this.#ovImages[el.src]; nImg.remove(); });
        // its proportion (width / height) as --r, for the gallery's CSS
        nImg.addEventListener('load', (e) => { if (nImg.naturalHeight) nImg.style.setProperty("--r", nImg.naturalWidth / nImg.naturalHeight); });
        nImg.src = el.src;
        nImg.addEventListener('click',(e) =>{this.openImage(el.src)});
        gal.appendChild(nImg);     
     }
}
    
 makeExif(src, elem) {
    if (src in this.#cache.exif) {
      if (elem!= null) {
        if (this.#cache.exif[src]["ready"] == true) {
            let line1 = this.#cache.exif[src].line1;
            let line2 = this.#cache.exif[src].line2;
            elem.innerHTML = line1 + line2 ;
            }
            else {
                this.#cache.exif[src].elems.push(elem);
            }
      }
    }
    else {
        //console.log("fail",src)
        this.#cache.exif[src] = {"ready":false,"line1":"", "line2":"", "elems": []};
        if (elem!= null) {this.#cache.exif[src].elems.push(elem)};
        let img = new Image();
        let exifCache = this.#cache.exif;
        img.onload =(item) => {
            //console.log("exif",img.src);
            EXIF.getData(img, function() {
                //console.log(JSON.stringify(EXIF.getAllTags(this), null, "\t"));
                let iso = EXIF.getTag(this, "ISOSpeedRatings");
                let fmm = EXIF.getTag(this, "FocalLength");
                let brand = EXIF.getTag(this, "Make");
                let fmm35 = EXIF.getTag(this, "FocalLengthIn35mmFilm");
                let fnr = EXIF.getTag(this, "FNumber");
                let ex = EXIF.getTag(this, "ExposureTime");
                let model = EXIF.getTag(this, "Model");
                let line1 = "";
                let line2 = "";
                
                if (model!=undefined || brand!=undefined) {
                	if (model!=undefined && brand!=undefined) {
                	 	line1 = `<span>Camera: ${model}/${brand} </span>` ;
                	}
                	else {
                		line1 = `<span>Camera: ${model}${brand} </span>` ;
                	}
                
                }

                if (iso !=undefined ) {
                    line2 = `ISO${iso} ` ;
                }
                
                if (fmm != undefined){ 
                	line2 += `${fmm}mm `;
                    if (fmm35 != undefined && fmm35 != fmm && fmm35 != 0 ){ 
                	line2 += `(35mm eq. ${fmm35}mm) `;
                    }
                }
                if (ex != undefined){ 
                	if (ex<1) {
                    	ex = (1/ex).toFixed(0);
                    	ex = "1/" + ex;
    				    }
  				    line2 += `${ex}s `;
                }            
                
             if (fnr != undefined) {
                    fnr =fnr.toFixed(1);
                    line2 += `𝑓/${fnr}`;
             	}   
             	
    		    if (line2 != '') line2 = `<span>` + line2 +`</span>`;    
    		    
    		    exifCache[img.src].line1 = line1;
    		    exifCache[img.src].line2 = line2;
    		    exifCache[img.src].ready = true;
    		    while (exifCache[img.src].elems.length>0) {
      		    let ediv = exifCache[img.src].elems.pop();
              ediv.innerHTML = line1 + line2;
              }
             
            });
        }
        // (a second 'load' listener calling img.onload again was removed: it ran EXIF.getData
        // twice per image, and each run read the whole file again)
        img.src=src;
        /*if (img.complete) {
            console.log("exif ever?",img.scr)
            img.onload(img);
            }
       else {
            console.log("exif wrong?",spath);
            let prev = document.querySelector('a[href="' + spath + '"] div.exifOverlay');
            if (prev!= null) tDiv.innerHTML = prev.innerHTML;
        }*/
    }
}

  resetGallery(){
    this.#ovImages = {}; 
    document.querySelector("#" + this.myId +" div.album").innerHTML = "";
    this.refreshGallery()
  }

 refreshGallery(){
        if (document.querySelectorAll(".exif").length>0) return;
        if (this.clearOnRefresh) {
            this.#ovImages = {}; 
            document.querySelector("#" + this.myId +" div.album").innerHTML = "";
        }
        //console.log("refresh images",this.selector);
        document.querySelectorAll(this.selector).forEach(
        (e) => {
            if (e.hasAttribute("src") && !e.classList.contains("exif")) {
                e.classList.add("exif");
                let newdiv = null;
                if (this.useExif) {
                    if (this.addExif) {
                        newdiv = document.createElement("div");
                        newdiv.classList.add("exifOverlay");           
                        e.parentElement.appendChild(newdiv);
                    }
                    this.makeExif(e.src, newdiv);
                }
                e.addEventListener('click',(e) =>{  e.stopPropagation();e.preventDefault();
                this.openImage(e.target.src);return false;});
                this.addImage(e);
                //console.log("single",e.src);
            }
        }
    );
}

}
function thePhotoGalleryBootstrap(selector) {
  thePhotoGalleryReady((e)=>{let gallery = new thePhotoGallery(selector); gallery.initGallery()});
}
// bootstrap single file only 
//thePhotoGalleryBootstrap(".slide img");

