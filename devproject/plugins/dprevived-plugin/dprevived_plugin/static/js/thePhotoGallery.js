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
        // viewer's background (0 - 0.5), preloading the next full-size image.
        this.defaultSettings = {transition: "pop", duration: 0.7, slideTime: 3,
                                modes: ["window", "max", "full"], openIn: "last",
                                transparency: 0, preload: true};
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
    // close (in browser fullscreen the browser takes Esc itself and leaves fullscreen first). In the gallery: left/right
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
    this.settings = s;
    this.setTransition(s.transition, false);
    this.timeout = s.slideTime * 1000;
    let ov = document.getElementById(this.myId);
    if (ov) {
        ov.style.setProperty("--dp-iv-fade", s.duration + "s");
        ov.style.setProperty("--dp-iv-transparency", s.transparency);
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

