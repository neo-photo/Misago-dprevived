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
    #pluginKeys = ["init","menuitems","lightable","refresh"];
    #plugins = {};    
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
    #sharpToken = 0;    // the latest image change; an older full-size swap still waiting gives up
    #fullDone = Promise.resolve();  // the shown full-size image is loaded (or failed)

    
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
        this.transitions = ['flip','none','fade','slide','drop'];
        this.curTransition = 'flip';
        
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
  const template2='<!DOCTYPE html><html><body>    <div class="lighttable">        <div class="album hide"></div>        <div class="nav nav-prev dprev-btn" ><span class="material-icon left">keyboard_arrow_left</span><span class="hide material-icon down">keyboard_arrow_down</span></div>        <div class="nav nav-next dprev-btn" ><span class="material-icon right">keyboard_arrow_right</span><span class="hide material-icon up">keyboard_arrow_up</span></div>            <div class="backImage">            <img class="picture" draggable="false" >        </div>         <div class="bufferImage"><img class="picture" draggable="false" > <svg version="1.1" viewBox="-58 -58 116 116" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"> <!-- https://freesvg.org/1544764567 -->   <style>.shadow {font-size:12px;filter: drop-shadow(3px 3px 5px rgb(255,255,255));}</style> <text x="-20" y="5" class="shadow" fill="#000">preview</text> <g stroke-linecap="round" stroke-width="15"> <path id="a" d="m0 35 0,14"/> <use transform="rotate(210)" xlink:href="#a" stroke="#f0f0f0"/> <use transform="rotate(240)" xlink:href="#a" stroke="#ebebeb"/> <use transform="rotate(270)" xlink:href="#a" stroke="#d3d3d3"/> <use transform="rotate(300)" xlink:href="#a" stroke="#bcbcbc"/> <use transform="rotate(330)" xlink:href="#a" stroke="#a4a4a4"/> <use transform="rotate(0)" xlink:href="#a" stroke="#8d8d8d"/> <use transform="rotate(30)" xlink:href="#a" stroke="#757575"/> <use transform="rotate(60)" xlink:href="#a" stroke="#5e5e5e"/> <use transform="rotate(90)" xlink:href="#a" stroke="#464646"/> <use transform="rotate(120)" xlink:href="#a" stroke="#2f2f2f"/> <use transform="rotate(150)" xlink:href="#a" stroke="#171717"/> <use transform="rotate(180)" xlink:href="#a" stroke="#33a"/> <animateTransform attributeName="transform" begin="0s" dur="16s" type="rotate" from="0 0 0" to="360 0 0" repeatCount="indefinite" /> </g> </svg>       </div>    </div></body></html>';
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
  
  add2nav(element, click = null , contextmenu = null) {
    document.querySelector("#" + this.myId + " div.nav-ov").append.Element(element);
    if (click != null) {
      element.addEventListener("click", click);
    }
    if (context != null) {
      element.addEventListener("contextmenu", contextmenu);
    }
  }
  
  add2lighttable(element){
      document.querySelector("#" + this.myId + " div.lightable").append.Element(element);  
  }

  setTitle(value=""){
     document.querySelector("#" + this.myId + ".exifoverlay").innerHTML = value;
  }

  registerPlugin(name,values) {
    if (name in this.#plugins) console.warn("plugin already registrerd:",name)
    this.#plugins[name] = {};
    this.#pluginKeys.forEach((key)=>{
      if (key in values) this.#plugins[name] = values[key]
    });
  }
  
  initGallery(){
    //alert("g4");
    if (this.absPath[0] in [".","/"]) {console.error("Error wrong absPath:",this.absPath)}
    if (this.bootstrap.indexOf("html")>-1 && document.querySelector('#' + this.myId) == undefined) {this.bootstrapHtml();}
    if (this.bootstrap.indexOf("css")>-1) {this.bootstrapCss()}
    if (this.bootstrap.indexOf("font")>-1) {this.bootstrapFont()}
    
    window.addEventListener('mouseup', (e) => {this.mouseUp()}, false);
    // both image layers: they swap roles on every image change (#showImage)
    document.querySelectorAll('#' + this.myId +' .backImage img.picture, #' + this.myId +' .bufferImage img.picture').forEach((e)=>
        e.addEventListener('mousedown',(e) =>{ this.mouseDown(e)}, false));
    document.querySelector('#' + this.myId +' svg').addEventListener('click', (e) => {this.preview();});
    document.querySelectorAll("#" + this.myId +" .backImage img.picture, #" + this.myId +" .bufferImage img.picture").forEach((e)=>{
        e.addEventListener('load', (e) => {this.loadedOvImage();});
        e.addEventListener('error',  (e) =>{let t = e.target;
                                            //console.log(t.src);
                                            let small = document.querySelector("#" + this.myId +" .ext").href;
                                            //console.log(t.src, small, this.absPath + this.errorImage);
                                            // the full-size image failed: the preview instead
                                            if (t.dataset.full && (document.querySelector("#" + this.myId +" .download").href!=small) && (small !="" )) {
                                              delete t.dataset.full;
                                              t.src = small;
                                              t.parentElement.style.backgroundImage = "url('"+small+"')";
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
    Object.values(this.#plugins).forEach((plugin) => {
      if ("init" in plugin) {plugin.init()}
      if ("menuitems" in plugin) {
        plugin.menuitems.forEach((item=>{this.menuitem(item.element,item.click,item.conetxtmenu)}))
      }
      if ("lighttable" in plugin) {
        plugin.lighttable.forEach((item=>{this.add2lighttable(item)})
      )}
    });
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

  // Morph: the old image's rectangle turns into the new one's (a scale, so photos of other
  // proportions are squeezed on the way); the old one stays underneath, the new one fades
  // in on top. Both layers keep their normal full-area "contain" setup and are only
  // scaled (both images are centred, so a scale about the middle does it): nothing is
  // redrawn while the change runs.
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
    let newFrom = "scale(" + (a.w / b.w) + ", " + (a.h / b.h) + ")";   // new image on the old rectangle
    // old image on the new rectangle, ending a little inside it: its edges are drawn at
    // whole pixels and then scaled, so at exactly the same size a line of it could show
    // beside the new image (half a pixel times the scale, plus one for the smoothing)
    let inX = 1 + 0.5 * b.w / a.w, inY = 1 + 0.5 * b.h / a.h;
    let oldTo = "scale(" + ((b.w - 2 * inX) / a.w) + ", " + ((b.h - 2 * inY) / a.h) + ")";
    let timing = {duration: this.#fadeMs(), easing: "ease-in-out"};
    this.#morphAnims.push(
        ov.querySelector(".backImage").animate([{transform: newFrom, opacity: 0}, {transform: "none", opacity: 1}], timing),
        ov.querySelector(".bufferImage").animate([{transform: "none", opacity: 1}, {transform: oldTo, opacity: 1}], timing));
    let anims = this.#morphAnims;
    Promise.all(anims.map((x) => x.finished)).then(() => { if (anims === this.#morphAnims) this.#endMorph(); }, () => {});
  }

  // stop a Morph (finished, or a new change began): layers back to normal
  #endMorph() {
    this.#morphAnims.forEach((x) => x.cancel());
    this.#morphAnims = [];
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
    document.querySelector("#" + this.myId +" .bufferImage").classList.add("dohide");
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
  // so that prev/next can start at once. The next full-size image only after the shown one
  // has arrived (on a slow line it would take bandwidth from it), and not when the image
  // has changed again meanwhile.
  #preloadAround(iPos) {
    let keys = Object.keys(this.#ovImages);
    if (keys.length < 2) return;
    let next = keys[(iPos + 1) % keys.length];
    let prev = keys[(iPos - 1 + keys.length) % keys.length];
    this.#prepare(next);
    this.#prepare(prev);
    let token = this.#sharpToken;
    if (this.#bigOf(next) != next) this.#fullDone.then(() => {
        if (token == this.#sharpToken) this.#resolve(this.#bigOf(next)).then((url) => this.#prepare(url));
    });
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
    // The two layers swap roles: the one showing the current image becomes .bufferImage (the
    // previous image, animated out) and keeps everything it has drawn; the other becomes
    // .backImage and gets the new image. (Copying the previous image into the other layer
    // meant redrawing a full-size image as the change starts: the change stuttered.)
    // When the viewer is just being opened (or the image is picked in the gallery) there
    // is no previous image: the new one appears from the viewer's background.
    let freshOpen = iOvE.style.display == "none";
    let wasOpen = !freshOpen && !fromAlbum;
    let oldL = iOvE.querySelector("div.backImage");
    let iOv = iOvE.querySelector("div.bufferImage");
    oldL.classList.replace("backImage", "bufferImage");
    iOv.classList.replace("bufferImage", "backImage");
    let oldImg = oldL.querySelector("img.picture");
    if (!wasOpen) {
        oldL.style.backgroundImage = "none";
        oldImg.classList.remove("sharp", "lost");
    }
    // a full-size image still loading is not needed any more (and would take bandwidth)
    if (!wasOpen || !oldImg.complete) oldImg.removeAttribute("src");
    let iOvImg = iOv.querySelector("img.picture")
    iOvImg.classList.remove("lost", "sharp");   // an error on an earlier image does not stay
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
    oldL.classList.remove("dohide");
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

    // The change runs on the preview only (small, decoded by now in openImage): drawing a
    // full-size image while the change runs makes it stutter, even one already decoded
    // (tested). The full-size image (img.picture, over the preview) is shown when it is
    // decoded and the change is over. The final addresses (after the forum's redirect)
    // need no round trip to the forum.
    let token = ++this.#sharpToken;
    delete iOvImg.dataset.full;
    this.#fullDone = Promise.resolve();
    iOv.style.backgroundImage = "url('"+previewUrl+"')";
    if (bigSrc != imageSrc) {
        iOvImg.dataset.full = "1";      // for the error handler: the full-size image failed
        iOvImg.src = bigUrl;
        let changeOver = Math.max(0, this.#changeStart + this.#fadeMs() - performance.now());
        let decoded = iOvImg.decode();
        this.#fullDone = decoded.catch(() => {});
        Promise.all([decoded, new Promise((ok) => setTimeout(ok, changeOver))]).then(() => {
            if (token == this.#sharpToken) iOvImg.classList.add("sharp");
        }, () => {});                       // not loaded (error handler) or replaced
    }
    else {
        iOvImg.src = bigSrc ;
    }
    iOvE.querySelector(".head .nav-ov a.download").href = bigSrc ;
    
    let iPos = Object.keys(this.#ovImages).indexOf(imageSrc);
    //console.log(imageSrc,iPos);
    iOvE.dataset.pos = iPos;
    this.ivChangeNav(iPos, iOvE);
    this.#showInfo(imageSrc, iPos, iOvE);
    // (the forum address as before, not the final one the image element now loads)
    if (this.useExif) this.makeExif(new URL(bigSrc, document.baseURI).href, iOvE.querySelector(".exifOverlay"));
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
      document.querySelector("#" + this.myId +" .bufferImage").classList.add("dohide");
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
        //if (document.querySelectorAll(".exif").length>0) return;
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
                        e.parentElement.after(newdiv);
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
    Object.values(this.#plugins).forEach((plugin) => {
      if ("refresh" in plugin) {plugin.refresh()}
    });
}

}
function thePhotoGalleryBootstrap(selector) {
  thePhotoGalleryReady((e)=>{let gallery = new thePhotoGallery(selector); gallery.initGallery()});
}
// bootstrap single file only 
//thePhotoGalleryBootstrap(".slide img");

