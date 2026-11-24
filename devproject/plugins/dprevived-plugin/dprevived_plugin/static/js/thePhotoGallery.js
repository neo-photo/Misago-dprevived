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
    #pluginKeys = ["init","menuitems","lighttable","refresh"];
    #plugins = {};
    #started = false;   // initGallery() has run: a plugin registered later starts at once
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
    #zoom = 1;        // zoomed (.big): the image's scale (1 = its own pixel size)
    #pendingSpot = null;  // zoomed: the spot to show in the middle once the image's size is known
    #zoomLabelTimer = 0;  // hides the zoom level label
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
        this.transition = "pop";  // image change: "quick", "fade", "pop" or "morph"
        // Settings (changed with applySettings(), e.g. by the settings plugin): the
        // transition, its duration (s; Quick is fixed), slideshow time per image (s), the
        // display modes offered ("window" popup, "max" filling the browser window, "full"
        // whole screen), the mode to open in ("last" = last used), transparency of the
        // viewer's background (0 - 0.5), preloading the next full-size image, what the
        // mouse wheel does: "scroll" (scrolls the zoomed image; Ctrl + wheel zooms) or
        // "zoom" (zooms; no scrollbars).
        this.defaultSettings = {transition: "pop", duration: 0.7, slideTime: 3,
                                modes: ["window", "max", "full"], openIn: "last",
                                transparency: 0, preload: true, wheel: "scroll"};
        // zoom: the largest scale (1 = the image's own pixel size), and the factor between
        // the zoom levels (a mouse wheel notch, the + and - keys)
        this.maxZoom = 2;
        this.zoomStep = 1.25;
        this.settings = Object.assign({}, this.defaultSettings);
        this.transitionList = [["quick", "Quick"], ["fade", "Fade"], ["pop", "Pop"], ["morph", "Morph"]];
        // where settings and the last used display mode are kept: localStorage by default;
        // replace with {load: () => object, save: (changes) => {}} (e.g. a database)
        this.storageKey = "dp-image-viewer";
        this.storage = {load: () => this.#load(), save: (changes) => this.#save(changes)};
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
  
  // Plugins: registerPlugin(name, {init, menuitems, lighttable, refresh}), all optional:
  // init(gallery) is called once, menuitems [{element, click, contextmenu}] go into the
  // header (add2nav), lighttable [element] into the image area (add2lighttable), refresh()
  // after every refreshGallery(). A plugin registered after initGallery() starts at once.
  // A plugin's dialog in the image area should have the class "iv-modal" (and be hidden
  // with the hidden attribute): while one is shown the viewer's keys and the slideshow
  // wait, and close() hides it.
  add2nav(element, click = null , contextmenu = null) {
    // before the close button, which stays the last one
    let bar = document.querySelector("#" + this.myId + " div.nav-ov");
    bar.insertBefore(element, bar.querySelector("button[data-class='close']"));
    if (click != null) {
      element.addEventListener("click", click);
    }
    if (contextmenu != null) {
      element.addEventListener("contextmenu", contextmenu);
    }
  }

  add2lighttable(element){
      document.querySelector("#" + this.myId + " div.lighttable").append(element);
  }

  setTitle(value=""){
     document.querySelector("#" + this.myId + " .exifOverlay").innerHTML = value;
  }

  registerPlugin(name,values) {
    if (name in this.#plugins) console.warn("plugin already registrerd:",name)
    let plugin = {};
    this.#pluginKeys.forEach((key)=>{
      if (key in values) plugin[key] = values[key];
    });
    this.#plugins[name] = plugin;
    if (this.#started) this.#startPlugin(plugin);
  }

  #startPlugin(plugin) {
    if ("init" in plugin) {plugin.init(this)}
    if ("menuitems" in plugin) {
      plugin.menuitems.forEach((item)=>{this.add2nav(item.element, item.click, item.contextmenu)});
    }
    if ("lighttable" in plugin) {
      plugin.lighttable.forEach((item)=>{this.add2lighttable(item)});
    }
  }

  // a plugin's dialog (.iv-modal) is shown
  #modalOpen() {
    return !!document.querySelector("#" + this.myId + " .iv-modal:not([hidden])");
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
    // mouse wheel: Ctrl + wheel zooms (so does a touchpad's pinch, which browsers send as
    // Ctrl + wheel); the plain wheel zooms too when the setting says so ("zoom"), otherwise
    // it scrolls the zoomed image as usual. A wheel notch is one zoom step, a touchpad's
    // small steps zoom smoothly. The point under the mouse stays where it is.
    area.addEventListener('wheel', (e) => {
        if (ov.style.display == "none" || this.#modalOpen()) return;
        if (!ov.querySelector("div.album").classList.contains("hide")) return;
        if (!e.ctrlKey && this.settings.wheel != "zoom") return;
        e.preventDefault();                     // (with Ctrl: the browser's page zoom)
        let d = e.deltaY * (e.deltaMode == 1 ? 33 : e.deltaMode == 2 ? 800 : 1);
        if (!d) return;
        if (Math.abs(d) >= 40) { if (d < 0) this.zoomIn(e.clientX, e.clientY); else this.zoomOut(e.clientX, e.clientY); }
        else this.zoomBy(Math.pow(this.zoomStep, -d / 100), e.clientX, e.clientY);
    }, {passive: false});
    // the zoom level, shown briefly while zooming
    if (!area.querySelector(".iv-zoom")) {
        let label = document.createElement("div");
        label.className = "iv-zoom";
        area.appendChild(label);
    }
    // fullscreen: mouse movement near an edge (10% of the screen) shows the controls again,
    // any movement shows the mouse pointer
    ov.addEventListener('mousemove', (e) => {
        if (!ov.classList.contains("full")) return;
        this.#rest();
        let x = e.clientX / window.innerWidth, y = e.clientY / window.innerHeight;
        if (x < 0.1 || x > 0.9 || y < 0.1 || y > 0.9) this.#idle(true);
    });
    // leaving browser fullscreen (Esc, F11 ...) leaves the viewer's fullscreen too, for the
    // next offered mode that is not fullscreen (none offered: it stays dark, in the window)
    document.addEventListener('fullscreenchange', (e) => {
        if (!document.fullscreenElement && ov.classList.contains("full")) {
            let m = this.settings.modes.find((x) => x != "full");
            if (m) this.setMode(m);
        }
        else this.#restoreZoomSpot();
    });
    // keyboard: left/right arrow = previous/next image, Space = slideshow on/off, Esc =
    // close (in browser fullscreen the browser takes Esc itself and leaves fullscreen first),
    // + / - = zoom in / out, 0 = fit (not zoomed), 1 = 100 %, 2 = 200 %, * = 100 % or (from
    // 100 % and more) fit. In the gallery: left/right
    // move a selection over the thumbnails (.sel), Enter opens it, Esc closes the gallery.
    document.addEventListener('keydown', (e) => {
        if (ov.style.display == "none" || e.altKey || e.ctrlKey || e.metaKey) return;
        if (e.target.closest && e.target.closest("input, textarea, select, [contenteditable]")) return;
        if (this.#modalOpen()) return;          // a plugin's dialog handles its own keys
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
        else if (e.key == "+" || e.key == "=") { this.zoomIn(); e.preventDefault(); }
        else if (e.key == "-") { this.zoomOut(); e.preventDefault(); }
        else if (e.key == "0") { this.zoomTo("fit"); e.preventDefault(); }
        else if (e.key == "1") { this.zoomTo(1); e.preventDefault(); }
        else if (e.key == "2") { this.zoomTo(2); e.preventDefault(); }
        else if (e.key == "*") {
            this.zoomTo(ov.classList.contains("big") && this.#zoom >= 1 ? "fit" : 1);
            e.preventDefault();
        }
    });
    // settings: the saved ones over the defaults (this.transition / this.timeout set
    // before initGallery() count as defaults)
    this.defaultSettings.transition = this.transition;
    this.defaultSettings.slideTime = this.timeout / 1000;
    this.applySettings(Object.assign({}, this.defaultSettings, this.storage.load()), false);
    // header: position, poster and file name (.iv-info) before the EXIF line; the EXIF
    // line gets its full text as a tooltip (it is cut with "..." when too long)
    let head = ov.querySelector(".head");
    if (head && !head.querySelector(".iv-info")) {
        let info = document.createElement("div");
        info.className = "iv-info";
        head.insertBefore(info, head.firstChild);
    }
    let exifEl = ov.querySelector(".head .exifOverlay");
    if (exifEl) new MutationObserver(() => { exifEl.title = exifEl.textContent.replace(/\s+/g, " ").trim(); })
        .observe(exifEl, {childList: true, subtree: true});
    this.#started = true;
    Object.values(this.#plugins).forEach((plugin) => this.#startPlugin(plugin));
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
    let next = () => {
        if (!btn.classList.contains("active") || ov.style.display == "none") return;
        // a plugin's dialog is open: the image stays, a full time again after it closes
        if (this.#modalOpen()) { this.#slideTimer = setTimeout(next, this.timeout); return; }
        ov.querySelector("div.nav-next").click();
    };
    this.#slideTimer = setTimeout(next, wait);
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

  // Display mode: "window" (the popup), "max" (.max: the popup filling the browser window)
  // or "full" (.full: dark, and the whole screen where the browser allows it - Fullscreen
  // API). Zoomed, the same spot of the photo stays in the middle. The mode is remembered
  // for "open in: last used" unless save is false.
  setMode(mode, save = true) {
    let tElem = document.getElementById(this.myId);
    if (["window", "max", "full"].indexOf(mode) < 0) mode = "window";
    let full = mode == "full";
    this.#keepZoomSpot(() => {
        tElem.classList.toggle("full", full);
        tElem.classList.toggle("max", mode == "max");
    });
    if (full && !document.fullscreenElement && tElem.requestFullscreen) tElem.requestFullscreen().catch(() => {});
    if (!full && document.fullscreenElement) document.exitFullscreen().catch(() => {});
    this.#idle(full);
    this.#updateModeButton();
    if (save) this.storage.save({mode: mode});
  }

  // (older name) fullscreen on, or back to the first offered other mode
  setFull(on) {
    this.setMode(on ? "full" : (this.settings.modes.find((x) => x != "full") || "window"));
  }

  #mode() {
    let ov = document.getElementById(this.myId);
    return ov.classList.contains("full") ? "full" : ov.classList.contains("max") ? "max" : "window";
  }

  // the display button steps through the offered modes (window, max, full); hidden when
  // only one is offered; "on" in any mode but the window; its icon shows where the next
  // step goes: expand to a bigger mode (.off icon), or back to a smaller one (.shrink:
  // the .on icon)
  #nextMode() {
    let m = this.settings.modes;
    return m[(m.indexOf(this.#mode()) + 1) % m.length];
  }
  #updateModeButton() {
    let btn = document.querySelector("#" + this.myId + " button[data-class='full']");
    if (!btn) return;
    let names = {window: "window", max: "maximized", full: "fullscreen"};
    btn.style.display = this.settings.modes.length < 2 ? "none" : "";
    let order = ["window", "max", "full"];
    btn.classList.toggle("active", this.#mode() != "window");
    btn.classList.toggle("shrink", order.indexOf(this.#nextMode()) < order.indexOf(this.#mode()));
    btn.title = "display: " + names[this.#nextMode()];
  }

  // remembered settings (localStorage; quietly nothing where it is not available); the
  // older {full: true} counts as mode "full"
  #load() {
    let v;
    try { v = JSON.parse(localStorage.getItem(this.storageKey)) || {}; } catch (e) { v = {}; }
    if (!("mode" in v) && v.full) v.mode = "full";
    return v;
  }
  #save(values) {
    try { localStorage.setItem(this.storageKey, JSON.stringify(Object.assign(this.#load(), values))); } catch (e) {}
  }

  // Change settings (any of this.defaultSettings' keys): checked, applied at once and
  // saved (unless save is false). Values out of range are brought into it.
  applySettings(changes = {}, save = true) {
    let d = this.defaultSettings, s = Object.assign({}, this.settings);
    Object.keys(d).forEach((k) => { if (k in changes) s[k] = changes[k]; });
    let num = (v, lo, hi, def) => { v = parseFloat(v); return isFinite(v) ? Math.min(hi, Math.max(lo, v)) : def; };
    if (!this.transitionList.some(([k]) => k == s.transition)) s.transition = d.transition;
    s.duration = num(s.duration, 0.3, 3, d.duration);
    s.slideTime = num(s.slideTime, 1, 10, d.slideTime);
    s.transparency = num(s.transparency, 0, 0.5, d.transparency);
    let modes = Array.isArray(s.modes) ? s.modes : [];
    s.modes = ["window", "max", "full"].filter((m) => modes.indexOf(m) >= 0);
    if (!s.modes.length) s.modes = d.modes.slice();
    if (s.openIn != "last" && s.modes.indexOf(s.openIn) < 0) s.openIn = "last";
    s.preload = !!s.preload;
    if (["scroll", "zoom"].indexOf(s.wheel) < 0) s.wheel = d.wheel;
    this.settings = s;
    this.setTransition(s.transition, false);
    this.timeout = s.slideTime * 1000;
    let ov = document.getElementById(this.myId);
    if (ov) {
        ov.style.setProperty("--dp-iv-fade", s.duration + "s");
        ov.style.setProperty("--dp-iv-transparency", s.transparency);
        ov.classList.toggle("wheel-zoom", s.wheel == "zoom");   // (CSS: no scrollbars)
        // the open viewer's mode no longer offered: the first offered one
        if (ov.style.display != "none" && s.modes.indexOf(this.#mode()) < 0) this.setMode(s.modes[0], false);
        this.#updateModeButton();
    }
    if (save) this.storage.save(s);
  }

  // set the transition (and remember it, unless save is false)
  setTransition(t, save = true) {
    if (save) { this.applySettings({transition: t}); return; }
    if (!this.transitionList.some(([k]) => k == t)) t = "pop";
    this.transition = t;
    let ov = document.getElementById(this.myId);
    if (ov) ov.dataset.transition = t;
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
    this.#zoomSpot = ov.classList.contains("big") ? this.#spot() : null;
    change();
    this.#restoreZoomSpot();
  }

  #restoreZoomSpot() {
    if (!this.#zoomSpot) return;
    let spot = this.#zoomSpot;
    this.#showSpot(spot);                       // at once, and again when the size has settled
    requestAnimationFrame(() => this.#showSpot(spot));
  }

  // zoom: show the middle of the zoomed image
  centreZoom() {
    requestAnimationFrame(() => this.#showSpot([0.5, 0.5]));
  }

  // ---- zoom ----
  // Zoomed (.big) the image area (.backImage) scrolls over the image, shown at #zoom times
  // its own pixel size (--dp-iv-zw / --dp-iv-zh on the image; the CSS uses them only while
  // zoomed). Not zoomed, the image fits the area. Zoom spots are fractions of the image
  // ([0.5, 0.5] = its middle), so they also fit another image of a different size.

  #area() { return document.querySelector("#" + this.myId + " .backImage"); }
  #picture() { return this.#area().querySelector("img.picture"); }

  // the scale at which the shown image fits the image area; null while its size is unknown
  #fitScale(img = this.#picture()) {
    if (!img.naturalWidth || img.classList.contains("lost")) return null;
    let lt = document.querySelector("#" + this.myId + " .lighttable");
    return Math.min(lt.clientWidth / img.naturalWidth, lt.clientHeight / img.naturalHeight);
  }

  // zoomed: the spot of the image in the middle of the image area
  #spot() {
    let area = this.#area(), img = this.#picture();
    if (!img.clientWidth || !img.clientHeight) return [0.5, 0.5];
    let f = (v) => Math.min(1, Math.max(0, v));
    return [f((area.scrollLeft + area.clientWidth / 2 - img.offsetLeft - img.clientLeft) / img.clientWidth),
            f((area.scrollTop + area.clientHeight / 2 - img.offsetTop - img.clientTop) / img.clientHeight)];
  }

  // zoomed: scroll so that this spot of the image is in the middle (or at mx, my in the area)
  #showSpot([fx, fy], mx, my) {
    let area = this.#area(), img = this.#picture();
    if (mx == null) { mx = area.clientWidth / 2; my = area.clientHeight / 2; }
    area.scrollLeft = img.offsetLeft + img.clientLeft + fx * img.clientWidth - mx;
    area.scrollTop = img.offsetTop + img.clientTop + fy * img.clientHeight - my;
  }

  // the image's size at the zoom; false while its own size is unknown
  #sizePicture(img) {
    if (!img.naturalWidth || img.classList.contains("lost")) {
      img.style.removeProperty("--dp-iv-zw");
      img.style.removeProperty("--dp-iv-zh");
      return false;
    }
    img.style.setProperty("--dp-iv-zw", Math.round(img.naturalWidth * this.#zoom) + "px");
    img.style.setProperty("--dp-iv-zh", Math.round(img.naturalHeight * this.#zoom) + "px");
    return true;
  }

  // zoomed: give the shown image its size, and show the spot waiting for it (a new image
  // or the zoom button); called again when the image has loaded
  #applyZoom() {
    let ov = document.getElementById(this.myId);
    if (!ov.classList.contains("big")) return;
    if (!this.#sizePicture(this.#picture())) return;
    if (this.#pendingSpot) {
      this.#showSpot(this.#pendingSpot);
      this.#pendingSpot = null;
    }
    this.#updateZoomButton();
  }

  // a new image while zoomed: size it as soon as its own size is known (before it has
  // loaded), so it does not show at a wrong size first
  #sizeWhenKnown(img, token) {
    let check = () => {
      if (token != this.#sharpToken) return;
      if (img.naturalWidth) this.#applyZoom();
      else if (!img.complete) requestAnimationFrame(check);
    };
    requestAnimationFrame(check);
  }

  // zoom on (as the zoom button: the gallery and the slideshow end) or off
  #setBig(on) {
    let ov = document.getElementById(this.myId);
    let btn = ov.querySelector("button[data-class='big']");
    if (on && !ov.classList.contains("big")) {
      ov.querySelectorAll(".nav-ov button.radio-btn").forEach((b) => {
        b.classList.remove("active");
        ov.classList.remove(b.dataset.class);
      });
      ov.querySelector("div.album").classList.add("hide");
      ov.classList.add("big");
      if (btn) btn.classList.add("active");
    }
    else if (!on) {
      ov.classList.remove("big");
      if (btn) btn.classList.remove("active");
    }
  }

  // Zoom to a scale (1 = the image's own pixel size, at most maxZoom; "fit" = not zoomed),
  // keeping the image point under x, y (page coordinates, e.g. the mouse; default the
  // middle of the image area) where it is.
  zoomTo(z, x, y) {
    let ov = document.getElementById(this.myId);
    if (ov.style.display == "none") return;
    let area = this.#area(), img = this.#picture();
    let fit = this.#fitScale(img);
    if (fit == null) return;                    // (the image's size is not known yet)
    let big = ov.classList.contains("big");
    let r = area.getBoundingClientRect();
    let mx = x == null ? area.clientWidth / 2 : x - r.left;
    let my = y == null ? area.clientHeight / 2 : y - r.top;
    // the image point there, as fractions of the image
    let spot;
    if (big) {
      spot = [(area.scrollLeft + mx - img.offsetLeft - img.clientLeft) / img.clientWidth,
              (area.scrollTop + my - img.offsetTop - img.clientTop) / img.clientHeight];
    }
    else {
      let w = img.naturalWidth * fit, h = img.naturalHeight * fit;
      spot = [(mx - (area.clientWidth - w) / 2) / w, (my - (area.clientHeight - h) / 2) / h];
    }
    spot = spot.map((v) => Math.min(1, Math.max(0, v)));
    if (z == "fit") {
      this.#setBig(false);
      this.#pendingSpot = null;
    }
    else {
      this.#zoom = Math.min(z, this.maxZoom);
      this.#setBig(true);
      this.#pendingSpot = null;
      this.#sizePicture(img);
      this.#showSpot(spot, mx, my);
    }
    this.#showZoom();
  }

  // One zoom step in or out (a wheel notch, the + and - keys; position as zoomTo). The
  // levels are the powers of zoomStep (so 100 % is one), maxZoom and the fitting size; a
  // level less than 10% away from the current one is passed over.
  zoomIn(x, y) { this.#zoomLevelStep(1, x, y); }
  zoomOut(x, y) { this.#zoomLevelStep(-1, x, y); }

  #zoomLevelStep(dir, x, y) {
    let ov = document.getElementById(this.myId);
    let fit = this.#fitScale();
    if (fit == null) return;
    let big = ov.classList.contains("big");
    let z0 = big ? this.#zoom : fit;
    let near = 1.1, ln = Math.log(this.zoomStep);
    if (dir > 0) {
      let z1 = Math.pow(this.zoomStep, Math.ceil(Math.log(z0 * near) / ln - 1e-9));
      if (z1 * near > this.maxZoom) z1 = this.maxZoom;
      if (z1 <= z0 + 1e-9) { this.#showZoom(); return; }   // at the largest already
      this.zoomTo(z1, x, y);
    }
    else {
      let z1 = Math.pow(this.zoomStep, Math.floor(Math.log(z0 / near) / ln + 1e-9));
      if (z1 <= fit * near) { if (big) this.zoomTo("fit", x, y); else this.#showZoom(); return; }
      this.zoomTo(z1, x, y);
    }
  }

  // Zoom by a factor (as zoomTo; a touchpad's small steps). 100 % is a stop on the way;
  // zooming out to the fitting size or below ends the zoom.
  zoomBy(f, x, y) {
    let ov = document.getElementById(this.myId);
    let fit = this.#fitScale();
    if (fit == null) return;
    let big = ov.classList.contains("big");
    let z0 = big ? this.#zoom : fit;
    let z1 = z0 * f;
    if ((z0 - 1) * (z1 - 1) < 0) z1 = 1;
    if (f < 1 && z1 <= fit * 1.001) { if (big) this.zoomTo("fit", x, y); else this.#showZoom(); return; }
    z1 = Math.min(z1, this.maxZoom);
    if (f > 1 && z1 <= z0) { this.#showZoom(); return; }  // at the largest already
    this.zoomTo(z1, x, y);
  }

  // the zoom level now, as text: "150 %", "Fit · 23 %"
  #zoomText() {
    let ov = document.getElementById(this.myId);
    let pct = (z) => Math.round(z * 100) + " %";
    if (ov.classList.contains("big")) return pct(this.#zoom);
    let fit = this.#fitScale();
    return fit ? "Fit · " + pct(fit) : "Fit";
  }

  // the zoom button's tooltip: the zoom level now and what a click does
  #updateZoomButton() {
    let ov = document.getElementById(this.myId);
    let btn = ov.querySelector("button[data-class='big']");
    if (btn) btn.title = "zoom: " + this.#zoomText()
        + (ov.classList.contains("big") ? " (click: fit)" : " (click: 100 %)");
  }

  // the zoom level, shown for a moment (and in the zoom button's tooltip)
  #showZoom() {
    let ov = document.getElementById(this.myId);
    this.#updateZoomButton();
    let label = ov.querySelector(".iv-zoom");
    if (!label) return;
    label.textContent = this.#zoomText();
    label.classList.add("show");
    clearTimeout(this.#zoomLabelTimer);
    this.#zoomLabelTimer = setTimeout(() => label.classList.remove("show"), 1000);
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
      // the display mode is set again on the next opening; plugins' dialogs close
      tElem.classList.remove("max", "full");
      this.#idle(false);
      tElem.querySelectorAll(".iv-modal").forEach((m) => m.hidden = true);
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
    if (this.settings.preload && this.#bigOf(next) != next) this.#fullDone.then(() => {
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
    // zoomed: the new image keeps the zoom level, with the same spot (relative to the
    // image) in the middle
    let zoomSpot = wasOpen && iOvE.classList.contains("big") ? this.#spot() : null;
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
    if (freshOpen) {
        let m = this.settings.openIn == "last" ? this.storage.load().mode : this.settings.openIn;
        if (this.settings.modes.indexOf(m) < 0) m = this.settings.modes[0];
        this.setMode(m, false);
    }
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
    // zoomed: the new image gets its size (and the spot) as soon as its own size is known
    iOvImg.style.removeProperty("--dp-iv-zw");
    iOvImg.style.removeProperty("--dp-iv-zh");
    if (zoomSpot) {
        this.#pendingSpot = zoomSpot;
        this.#sizeWhenKnown(iOvImg, token);
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
        this.setMode(this.#nextMode());
    }
    else {
        document.querySelectorAll("#" + this.myId +" .nav-ov button.radio-btn").forEach((e)=>{e.classList.remove("active");tElem.classList.remove(e.dataset.class);});
        if (isActive) {
            if (elem.dataset.class == "album") {  document.querySelector("#" + this.myId +" div.album").classList.add("hide"); }   
        }
        else {
           tElem.classList.add(elem.dataset.class);
           elem.classList.add("active");
           // zoom: 100 %, the image's middle in the middle (sized now, or once its size is known)
           if (elem.dataset.class == "big") {
               this.#zoom = 1;
               this.#pendingSpot = [0.5, 0.5];
               this.#applyZoom();
           }
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
    if (action == "big") this.#showZoom();


}

 loadedOvImage(e){
    //console.log("loaded:",e.target.src);
    document.querySelector("#" + this.myId +"").classList.remove("progress");
    // zoomed: the image's size at the zoom (and the spot waiting for it); the zoom
    // button's tooltip with the new image's fitting size
    this.#applyZoom();
    this.#updateZoomButton();
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

