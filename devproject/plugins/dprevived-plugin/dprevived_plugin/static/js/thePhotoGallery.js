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
    #pluginKeys = ["init","menuitems","lighttable","refresh","changed","closed","gesture"];
    #exifTags = {};   // preview address -> promise of its EXIF tags (exifData)
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
    #lastSpot = null;     // zoomed: the spot in the middle, kept up to date (window resizes)
    #afterFull = null;    // "only when zooming": what to do once the full-size image's size is known
    #touch = {pointers: new Map(), mode: "", lastTap: null, tapTimer: 0};  // touch gestures (#touchStart ...)
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
        // viewer's background (0 - 0.5), loading full-size images ("preload": the shown
        // one and the next one, "shown": the shown one, "zoom": only when zooming in - the
        // preview is shown until then), what the mouse wheel does: "scroll" (scrolls the
        // zoomed image; Ctrl + wheel zooms) or "zoom" (zooms; no scrollbars), what the
        // download button does: "save" (downloads the full-size file) or "open" (opens it
        // in a new tab; images from other sites always open).
        this.defaultSettings = {transition: "pop", duration: 0.7, slideTime: 3,
                                modes: ["window", "max", "full"], openIn: "last",
                                transparency: 0, load: "preload", wheel: "scroll", download: "save"};
        // the kind of device: "phone" (touch screen, small), "tablet" (touch screen,
        // bigger) or "desktop" (mouse or touchpad). Phones: only the maximized mode, the
        // download button downloads, full-size images load only when zooming (default);
        // touch screens: the controls do not hide by themselves. Can be set before
        // initGallery().
        this.device = thePhotoGallery.deviceKind();
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
  
  // Plugins: registerPlugin(name, {init, menuitems, lighttable, refresh, changed, closed,
  // gesture}), all optional: init(gallery) is called once, menuitems [{element, click,
  // contextmenu, place}] go into the header (add2nav; place "start": at the header's start,
  // before the position, else among the buttons), lighttable [element] into the image area
  // (add2lighttable), refresh() after every refreshGallery(), changed(info) after every
  // image change (info: {src, big, pos, total, name, postLink, fileName}), closed() when
  // the viewer closes, gesture(name) on a touch gesture on the image ("up", "down", "left",
  // "right" swipes, "tap"): returning true means the plugin handled it (the viewer then
  // does nothing). A plugin registered after initGallery() starts at once. A plugin's
  // dialog in the image area should have the class "iv-modal" (and be hidden with the
  // hidden attribute): while one is shown the viewer's keys and the slideshow wait, and
  // close() hides it. exifData(src) gives an image's EXIF tags.
  add2nav(element, click = null , contextmenu = null, place = "") {
    if (place == "start") {
      let head = document.querySelector("#" + this.myId + " .head");
      head.insertBefore(element, head.firstChild);
    }
    else {
      // before the close button, which stays the last one
      let bar = document.querySelector("#" + this.myId + " div.nav-ov");
      bar.insertBefore(element, bar.querySelector("button[data-class='close']"));
    }
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
      plugin.menuitems.forEach((item)=>{this.add2nav(item.element, item.click, item.contextmenu, item.place)});
    }
    if ("lighttable" in plugin) {
      plugin.lighttable.forEach((item)=>{this.add2lighttable(item)});
    }
  }

  // call a hook of every plugin that has it; true when one of them returned true
  #pluginCall(hook, ...args) {
    let handled = false;
    Object.values(this.#plugins).forEach((plugin) => {
      if (typeof plugin[hook] == "function") {
        try { if (plugin[hook](...args) === true) handled = true; }
        catch (e) { console.error("plugin", hook, e); }
      }
    });
    return handled;
  }

  // EXIF tags of an image (promise of an object: Make, Model, LensModel, FNumber,
  // ExposureTime, ISOSpeedRatings, FocalLength, FocalLengthIn35mmFilm, DateTimeOriginal,
  // PixelXDimension ...; {} when there are none). Read from the preview, which carries the
  // original's EXIF - no full-size download. Replace exifSource(src) to take them from
  // elsewhere (e.g. the forum's database).
  exifData(src) {
    if (!(src in this.#exifTags)) this.#exifTags[src] = Promise.resolve(this.exifSource(src)).catch(() => ({}));
    return this.#exifTags[src];
  }
  exifSource(src) {
    return new Promise((ok) => {
      if (typeof EXIF == "undefined") { ok({}); return; }
      let img = new Image();
      img.onload = () => { try { EXIF.getData(img, function () { ok(EXIF.getAllTags(this) || {}); }); } catch (e) { ok({}); } };
      img.onerror = () => ok({});
      img.src = src;
    });
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
        // loaded or failed: no backdrop any more; a "loading" label shows the result
        ["load", "error"].forEach((type) => e.addEventListener(type, () => {
            if (type == "load") e.style.removeProperty("--dp-iv-soft");
            // a zoom waiting for the size (#loadFull), if the size was not seen before
            if (type == "load" && e == this.#picture() && this.#afterFull) {
                let f = this.#afterFull;
                this.#afterFull = null;
                f();
            }
            let label = document.querySelector("#" + this.myId + " .iv-zoom");
            if (e == this.#picture() && label && label.dataset.loading) this.#showZoom();
        }));
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
    // touch screens: the viewer's own gestures on the image (#touchStart ...)
    area.addEventListener("pointerdown", (e) => this.#touchStart(e));
    area.addEventListener("pointermove", (e) => this.#touchMove(e));
    ["pointerup", "pointercancel"].forEach((t) => area.addEventListener(t, (e) => this.#touchEnd(e)));
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
    // zoomed: the spot in the middle stays when the window's size changes (a phone
    // turned): kept up to date while scrolling, shown again after a resize (the browser
    // has resized and clamped the scrolling by then)
    ov.querySelectorAll(".backImage, .bufferImage").forEach((l) => l.addEventListener("scroll", () => {
        if (l.classList.contains("backImage") && ov.classList.contains("big")) this.#lastSpot = this.#spot();
    }, {passive: true}));
    window.addEventListener("resize", () => {
        if (ov.style.display != "none" && ov.classList.contains("big") && this.#lastSpot) this.#showSpot(this.#lastSpot);
        if (!ov.querySelector("div.album").classList.contains("hide")) this.#albumLayout();
    });
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
    // phones: only maximized (fullscreen hides the controls, and a touch screen cannot
    // bring them back); phones and browsers set to save data: full-size images only when
    // zooming
    if (this.device == "phone") this.defaultSettings.modes = ["max"];
    if (this.device == "phone" || this.#saveData()) this.defaultSettings.load = "zoom";
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
    if (performance.now() - this.#drag.t > 80) return;  // had stopped before letting go
    this.#glide();
}

  // after a drag (mouse or finger) released while moving: the image glides on, slowing down
  #glide() {
    let d = this.#drag;
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
            // (the link in the post may carry ?shva=1, the attachment list's does not)
            let bare = (u) => u.split("?")[0];
            let att = Array.from(post.querySelectorAll("a.attachment-name")).find((a) => bare(a.href) == bare(link));
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
    return {name: name, postLink: postLink, fileName: fileName};
  }

  // the download button: downloads the full-size file under its original name, or (the
  // setting "open", and always for images from other sites, which browsers do not let a
  // page download) opens it in a new tab - with another icon
  #setDownload(src, fileName) {
    let a = document.querySelector("#" + this.myId + " .head .nav-ov a.download");
    if (!a) return;
    let url = new URL(src, document.baseURI);
    let save = this.settings.download == "save" && url.origin == location.origin;
    a.href = src;
    a.dataset.name = fileName || "";
    if (save) a.setAttribute("download", fileName || "");
    else a.removeAttribute("download");
    a.title = save ? "download the full-size image"
        : "open the full-size image in a new tab" + (url.origin == location.origin ? "" : " (another site)");
    let icon = a.querySelector(".material-icon");
    if (icon) icon.textContent = save ? "file_download" : "picture_in_picture";
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
    if (!("load" in v) && v.preload === false) v.load = "shown";   // the older checkbox
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
    if (["preload", "shown", "zoom"].indexOf(s.load) < 0) s.load = d.load;
    if (["save", "open"].indexOf(s.download) < 0) s.download = d.download;
    // phones: only maximized; the download button downloads
    if (this.device == "phone") { s.modes = ["max"]; s.download = "save"; }
    if (["scroll", "zoom"].indexOf(s.wheel) < 0) s.wheel = d.wheel;
    this.settings = s;
    this.setTransition(s.transition, false);
    this.timeout = s.slideTime * 1000;
    let ov = document.getElementById(this.myId);
    if (ov) {
        ov.style.setProperty("--dp-iv-fade", s.duration + "s");
        ov.style.setProperty("--dp-iv-transparency", s.transparency);
        ov.classList.toggle("wheel-zoom", s.wheel == "zoom");   // (CSS: no scrollbars)
        ov.classList.toggle("touch", this.device != "desktop"); // (CSS: phones and tablets)
        ov.classList.toggle("phone", this.device == "phone");   // (CSS: the gallery as a column)
        // the open viewer's mode no longer offered: the first offered one
        if (ov.style.display != "none" && s.modes.indexOf(this.#mode()) < 0) this.setMode(s.modes[0], false);
        let dl = ov.querySelector(".head .nav-ov a.download");
        if (dl && dl.getAttribute("href")) this.#setDownload(dl.getAttribute("href"), dl.dataset.name);
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
    // (touch screens: the controls stay - nothing would bring them back)
    if (on && this.device == "desktop") this.#idleTimer = setTimeout(() => ov.classList.add("idle"), 2500);
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
    this.#lastSpot = this.#spot();
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
    if (z != "fit" && this.#needFull()) { this.#loadFull(() => this.zoomTo(z, x, y)); return; }
    let area = this.#area(), img = this.#picture();
    let fit = this.#fitScale(img);
    if (fit == null) return;                    // (the image's size is not known yet)
    let [spot, mx, my] = this.#pointSpot(x, y, fit);
    this.#zoomAt(z, spot, mx, my);
  }

  // the image point at x, y (page coordinates; default the middle of the image area), as
  // fractions of the image, and x, y in the image area: [[fx, fy], mx, my]
  #pointSpot(x, y, fit = this.#fitScale()) {
    let ov = document.getElementById(this.myId);
    let area = this.#area(), img = this.#picture();
    let r = area.getBoundingClientRect();
    let mx = x == null ? area.clientWidth / 2 : x - r.left;
    let my = y == null ? area.clientHeight / 2 : y - r.top;
    let spot;
    if (ov.classList.contains("big")) {
      spot = [(area.scrollLeft + mx - img.offsetLeft - img.clientLeft) / img.clientWidth,
              (area.scrollTop + my - img.offsetTop - img.clientTop) / img.clientHeight];
    }
    else {
      let w = img.naturalWidth * fit, h = img.naturalHeight * fit;
      spot = [(mx - (area.clientWidth - w) / 2) / w, (my - (area.clientHeight - h) / 2) / h];
    }
    return [spot.map((v) => Math.min(1, Math.max(0, v))), mx, my];
  }

  // zoom to z ("fit" = not zoomed) with that image spot at mx, my in the image area
  #zoomAt(z, spot, mx, my) {
    if (z == "fit") {
      this.#setBig(false);
      this.#pendingSpot = null;
    }
    else {
      this.#zoom = Math.min(z, this.maxZoom);
      this.#setBig(true);
      this.#pendingSpot = null;
      this.#sizePicture(this.#picture());
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
    if (dir > 0 && this.#needFull()) { this.#loadFull(() => this.#zoomLevelStep(dir, x, y)); return; }
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
    if (f > 1 && this.#needFull()) { this.#loadFull(() => this.zoomBy(f, x, y)); return; }
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

  // Phones in portrait: the gallery is one column (CSS). Its thumbnail width (--dp-iv-col-w)
  // is chosen so that about four 3:2 images fit the height of the gallery, within 65 - 85%
  // of its width: phones differ more in height than in width, so the number of thumbnails
  // seen stays about the same. (The gap is 6% of the width: 0.06 below.)
  #albumLayout() {
    let album = document.querySelector("#" + this.myId + " div.album");
    let cs = getComputedStyle(album);
    let h = album.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
    let w = album.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    let col = Math.min(0.85 * w, Math.max(0.65 * w, h / 4 / (1 / 1.5 + 0.06)));
    album.style.setProperty("--dp-iv-col-w", Math.round(col) + "px");
  }

  // ---- touch gestures ----
  // On the image (touch and pen; the mouse keeps its own handling). The CSS turns the
  // browser's own touch handling off there (touch-action: none), so the page does not
  // zoom or scroll. Not zoomed: swipe left / right = next / previous image, swipe down =
  // close. Zoomed: one finger moves the image (and glides on when let go while moving).
  // Two fingers: pinch zoom around their middle, which also moves the image along. Double
  // tap: 100 % (from 100 % or more: fit) at that point. Single tap: header and arrows off
  // / on (.bare). The gallery, dialogs, arrows and buttons keep their own touch handling.

  #touchStart(e) {
    if (e.pointerType == "mouse") return;
    let ov = document.getElementById(this.myId);
    if (e.target.closest(".album, .iv-modal, .nav, button, a") || this.#modalOpen()) return;
    e.preventDefault();                         // (no mouse events made up from the touch)
    let t = this.#touch;
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch (err) {}
    t.pointers.set(e.pointerId, {x: e.clientX, y: e.clientY});
    cancelAnimationFrame(this.#drag.glide);
    if (t.pointers.size == 1) {
      let area = this.#area();
      t.mode = "press";
      t.start = {x: e.clientX, y: e.clientY, t: performance.now(),
                 left: area.scrollLeft, top: area.scrollTop};
      this.#drag = {vx: 0, vy: 0, t: performance.now(), x: e.clientX, y: e.clientY, glide: 0};
    }
    else if (t.pointers.size == 2) this.#pinchStart();
  }

  #touchMove(e) {
    let t = this.#touch;
    if (!t.pointers.has(e.pointerId)) return;
    t.pointers.set(e.pointerId, {x: e.clientX, y: e.clientY});
    let ov = document.getElementById(this.myId);
    if (t.mode == "pinch") { this.#pinchMove(); return; }
    if (t.mode != "press" && t.mode != "pan" && t.mode != "swipe") return;
    let dx = e.clientX - t.start.x, dy = e.clientY - t.start.y;
    if (t.mode == "press" && Math.hypot(dx, dy) > 10)
      t.mode = ov.classList.contains("big") ? "pan" : "swipe";
    if (t.mode == "pan") {
      let area = this.#area();
      area.scrollLeft = t.start.left - dx;
      area.scrollTop = t.start.top - dy;
      // speed of the last moves (smoothed), for the glide after letting go
      let d = this.#drag, now = performance.now(), dt = Math.max(now - d.t, 1);
      d.vx = 0.7 * (e.clientX - d.x) / dt + 0.3 * d.vx;
      d.vy = 0.7 * (e.clientY - d.y) / dt + 0.3 * d.vy;
      d.t = now; d.x = e.clientX; d.y = e.clientY;
    }
  }

  #touchEnd(e) {
    let t = this.#touch;
    if (!t.pointers.has(e.pointerId)) return;
    t.pointers.delete(e.pointerId);
    let ov = document.getElementById(this.myId);
    if (t.mode == "pinch") {
      // the pinch ends with the first finger lifted (the other one does nothing more)
      t.mode = "after";
      this.#pinchEnd();
      return;
    }
    if (t.pointers.size) return;
    let mode = t.mode;
    t.mode = "";
    if (e.type == "pointercancel" || mode == "after") return;
    let dx = e.clientX - t.start.x, dy = e.clientY - t.start.y;
    let dt = performance.now() - t.start.t;
    if (mode == "pan") {
      if (performance.now() - this.#drag.t <= 80) this.#glide();
    }
    else if (mode == "swipe") {
      if (dt > 800) return;                     // a slow drag is no swipe
      let dir = Math.abs(dx) > 50 && Math.abs(dx) > 1.5 * Math.abs(dy) ? (dx < 0 ? "left" : "right")
              : Math.abs(dy) > 80 && Math.abs(dy) > 1.5 * Math.abs(dx) ? (dy < 0 ? "up" : "down") : "";
      if (!dir || this.#pluginCall("gesture", dir)) return;     // (a plugin's first)
      if (dir == "left" || dir == "right") ov.querySelector(dir == "left" ? "div.nav-next" : "div.nav-prev").click();
      else if (dir == "down") this.close();
    }
    else if (mode == "press" && dt < 400) this.#tap(e.clientX, e.clientY);
  }

  // a tap: a second one soon after near the first = double tap (zoom), else after a moment
  // a single tap (controls off / on)
  #tap(x, y) {
    let t = this.#touch, now = performance.now();
    let ov = document.getElementById(this.myId);
    if (t.lastTap && now - t.lastTap.t < 300 && Math.hypot(x - t.lastTap.x, y - t.lastTap.y) < 40) {
      clearTimeout(t.tapTimer);
      t.lastTap = null;
      this.zoomTo(ov.classList.contains("big") && this.#zoom >= 1 ? "fit" : 1, x, y);
      return;
    }
    t.lastTap = {x: x, y: y, t: now};
    clearTimeout(t.tapTimer);
    t.tapTimer = setTimeout(() => {
      t.lastTap = null;
      if (this.#pluginCall("gesture", "tap")) return;            // (a plugin's first)
      // (the image area changes size on touch devices: a zoomed image keeps its spot)
      this.#keepZoomSpot(() => ov.classList.toggle("bare"));
    }, 300);
  }

  #pinchStart() {
    let t = this.#touch;
    t.mode = "pinch";
    t.pinch = null;
    // "only when zooming": the full-size image first; the pinch starts once its size is
    // known (#pinchMove waits for that)
    if (this.#needFull()) this.#loadFull(() => {});
  }

  // two fingers: the scale follows their distance, the image point that was between them
  // stays between them
  #pinchMove() {
    let t = this.#touch;
    let [a, b] = Array.from(t.pointers.values());
    if (!b) return;
    let mid = {x: (a.x + b.x) / 2, y: (a.y + b.y) / 2};
    let dist = Math.max(Math.hypot(a.x - b.x, a.y - b.y), 1);
    let fit = this.#fitScale();
    if (fit == null) return;                    // (the image's size is not known yet)
    let ov = document.getElementById(this.myId);
    if (!t.pinch) {
      let [spot] = this.#pointSpot(mid.x, mid.y, fit);
      t.pinch = {dist: dist, zoom: ov.classList.contains("big") ? this.#zoom : fit, spot: spot};
    }
    let z = Math.min(this.maxZoom, Math.max(fit, t.pinch.zoom * dist / t.pinch.dist));
    let r = this.#area().getBoundingClientRect();
    if (z <= fit * 1.001) { if (ov.classList.contains("big")) this.#zoomAt("fit"); return; }
    this.#zoomAt(z, t.pinch.spot, mid.x - r.left, mid.y - r.top);
  }

  // close to 100 % at the end of a pinch: 100 %
  #pinchEnd() {
    let ov = document.getElementById(this.myId);
    if (ov.classList.contains("big") && Math.abs(this.#zoom - 1) < 0.06 && this.#zoom != 1) {
      let [spot, mx, my] = this.#pointSpot();
      this.#zoomAt(1, spot, mx, my);
    }
  }

  // "only when zooming": the shown image's full-size image is not loaded yet
  #needFull() {
    let img = this.#picture();
    return !!img.dataset.wait && !img.getAttribute("src");
  }

  // load the shown image's full-size image, then (once its size is known) do then();
  // only the latest then() counts (a touchpad sends many zoom steps meanwhile)
  #loadFull(then) {
    let ov = document.getElementById(this.myId);
    let img = this.#picture(), token = this.#sharpToken;
    this.#afterFull = then;
    if (img.getAttribute("src")) return;        // loading already
    img.dataset.full = "1";                     // (for the error handler)
    img.src = img.dataset.wait;
    this.#showZoom();                           // "Loading full size..." 
    img.decode().then(() => { if (token == this.#sharpToken) img.classList.add("sharp"); }, () => {});
    let check = () => {
      if (token != this.#sharpToken) return;
      if (img.naturalWidth) { let f = this.#afterFull; this.#afterFull = null; if (f) f(); }
      else if (!img.complete) requestAnimationFrame(check);
    };
    requestAnimationFrame(check);
  }

  // the browser can show the viewer fullscreen (not e.g. iPhone Safari, nor in a frame)
  fullscreenOk() {
    return !!(document.fullscreenEnabled && document.documentElement.requestFullscreen);
  }

  // the browser is set to save data (Chrome on Android: data saver)
  #saveData() {
    return !!(navigator.connection && navigator.connection.saveData);
  }

  // phone, tablet or desktop: by what the device can do (a touch screen as the main
  // pointer, and its size), not by its name
  static deviceKind() {
    let mq = (q) => !!(window.matchMedia && window.matchMedia(q).matches);
    if (!mq("(pointer: coarse)")) return "desktop";
    return Math.min(screen.width, screen.height) < 600 ? "phone" : "tablet";
  }

  // the zoom level now, as text: "150 %", "Fit · 23 %"
  #zoomText() {
    let ov = document.getElementById(this.myId);
    let pct = (z) => Math.round(z * 100) + " %";
    let loading = this.#fullLoading();
    if (ov.classList.contains("big")) return pct(this.#zoom) + (loading ? " · loading full size…" : "");
    if (loading) return "Loading full size…";
    let fit = this.#fitScale();
    return fit ? "Fit · " + pct(fit) : "Fit";
  }

  // the shown image's full-size image is on its way
  #fullLoading() {
    let img = this.#picture();
    return !!img.dataset.full && !!img.getAttribute("src") && !img.complete;
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
    // while the full-size image loads the label stays (shown again when it has loaded)
    label.dataset.loading = this.#fullLoading() ? "1" : "";
    if (!label.dataset.loading) this.#zoomLabelTimer = setTimeout(() => label.classList.remove("show"), 1000);
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
      tElem.classList.remove("max", "full", "bare");
      this.#idle(false);
      tElem.querySelectorAll(".iv-modal").forEach((m) => m.hidden = true);
      this.#pluginCall("closed");
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
    if (this.settings.load == "preload" && this.#bigOf(next) != next) this.#fullDone.then(() => {
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
    // zoomed, while the full-size image is loading: the preview enlarged under it (the
    // CSS uses --dp-iv-soft only while zoomed; cleared when it has loaded)
    iOvImg.style.setProperty("--dp-iv-soft", "url('" + previewUrl + "')");
    // "only when zooming": the preview stays (the full-size address waits in data-wait,
    // #loadFull); zoomed already, the full-size image loads at once
    delete iOvImg.dataset.wait;
    let waitFull = bigSrc != imageSrc && this.settings.load == "zoom" && !iOvE.classList.contains("big");
    if (waitFull) {
        iOvImg.removeAttribute("src");
        iOvImg.dataset.wait = bigUrl;
        // (openImage has waited for the preview already: done, as when an image has loaded)
        setTimeout(() => { if (token == this.#sharpToken) this.loadedOvImage(); }, 0);
    }
    else if (bigSrc != imageSrc) {
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
    let details = this.#showInfo(imageSrc, iPos, iOvE) || {};
    this.#setDownload(bigSrc, details.fileName);
    this.#pluginCall("changed", Object.assign({src: imageSrc, big: bigSrc, pos: iPos,
        total: Object.keys(this.#ovImages).length}, details));
    // (the forum address as before, not the final one the image element now loads)
    // (from the preview: it carries the original's EXIF, and the post has read it already)
    if (this.useExif) this.makeExif(new URL(imageSrc, document.baseURI).href, iOvE.querySelector(".exifOverlay"));
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
               if (this.#needFull()) this.#loadFull(() => this.#applyZoom());
               else this.#applyZoom();
           }
           // slideshow: the next image at once (the current one has been seen); from
           // then on every image is timed by #scheduleSlide()
           if (elem.dataset.class == "slideshow" ) document.querySelector("#" + this.myId +" div.nav-next").click();
           if (elem.dataset.class == "album") {
               let album = document.querySelector("#" + this.myId +" div.album");
               album.classList.remove("hide");
               this.#albumLayout();
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

