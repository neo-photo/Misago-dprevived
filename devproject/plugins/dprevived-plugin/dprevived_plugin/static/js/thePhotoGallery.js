class thePhotoGallery {

    version = "1";
    #gMouseDownX = 0;
    #gMouseDownY = 0;
    #gMouseDownOffsetX = 0;
    #gMouseDownOffsetY = 0;
    #ovImages = {};
    #cache = {"exif":{}};
    #moveMouse = (e) => {this.divMove(e)};
    #final = {};      // image address -> the address it redirects to (filled in by #resolve)
    #resolving = {};  // image address -> promise of that final address
    #prepared = {};   // final address -> promise, resolved when the image is loaded and decoded
    #openToken = 0;   // the latest openImage() call; an older one that is still waiting gives up
    #drag = {vx: 0, vy: 0, t: 0, x: 0, y: 0, glide: 0};  // zoom drag: speed (px/ms), last event, glide frame
    #zoomSpot = null; // zoomed: the photo's spot in the middle (fractions), kept over a size change
    #idleTimer = 0;   // fullscreen: hides the controls when the mouse rests
    #restTimer = 0;   // fullscreen: hides the mouse pointer when the mouse rests
    
    constructor(selector = "article.misago-markup img") {
        // config Vars
        this.selector = selector;
        this.timeout = 1500;
        this.myId = "image-ov";
        this.errorImage = "/static/lost.jpg" 
        this.useExif = true;
        this.addExif = false;
        this.cylce = true;
        this.clearOnRefresh = true;
        this.addDownload = true;
        this.addPreviewDownload = true;
        
        /*    
        //Private Vars
        this.gMouseDownX = 0;
        this.gMouseDownY = 0;
        this.gMouseDownOffsetX = 0;
        this.gMouseDownOffsetY = 0;
        this.ovImages = {};
        this.cache = {"exif":{}};
        this.moveMouse = (e) => {this.divMove(e)};
        */
    }

  bootstrap() {
  const template ='<!DOCTYPE html><html><body><div class="head">        <div class="exifOverlay"></div>        <div class="nav-ov">            <a href="" target="_blank" title="download preview version" style="display:none;" class="ext" ><button class="btn-default btn btn-outline btn-image-ov" ><span class="material-icon">picture_in_picture</span></button></a>            <a href="" target="_blank" title="download big version" class="download" ><button class="btn-default btn btn-outline btn-image-ov" ><span class="material-icon">file_download</span></button></a>            <button data-class="slideshow" title="run slideshow" class="btn-default btn-outline btn btn-image-ov btn-css radio-btn size"><span class="material-icon">slideshow</span></button>            <button data-class="album" title="show gallery" class="btn-default btn-outline btn btn-image-ov btn-css radio-btn size"><span class="material-icon">photo_album</span></button>            <button data-class="big" title="zoom in / out" class="btn-default btn-outline btn btn-image-ov btn-css radio-btn size"><span class="material-icon">zoom_in</span></button>            <button data-class="full" title="fullscreen mode" class="btn-default btn-outline  btn btn-image-ov btn-css"><span class="material-icon">fullscreen</span></button>            <button data-class="close" title="close popup" class="btn-default btn btn-block btn-image-ov btn-css"><span class="material-icon">close</span></button>        </div>    </div></body></html>';
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
  initGallery(){
    //alert("g4");
    if (document.querySelector('#' + this.myId) == undefined) {this.bootstrap();}
    window.addEventListener('mouseup', (e) => {this.mouseUp()}, false);
    document.querySelector('#' + this.myId +' .backImage img.picture').addEventListener('mousedown',(e) =>{ this.mouseDown(e)}, false);
    document.querySelector('#' + this.myId +' svg').addEventListener('click', (e) => {this.preview();});
    document.querySelectorAll("#" + this.myId +" .backImage img.picture").forEach((e)=>{
        e.addEventListener('load', (e) => {this.loadedOvImage();});
        e.addEventListener('error',  (e) =>{let t = e.target;
                                            //console.log(t.src);
                                            let small = document.querySelector("#" + this.myId +" .ext").href;
                                            if ((t.src == document.querySelector("#" + this.myId +" .download").href) && (document.querySelector("#" + this.myId +" .download").href!=small) && (small !="" )) {
                                              t.src = small;
                                              document.querySelector("#" + this.myId +" .backImage").style.backgroundImage = "url('"+small+"')";
                                            }
                                            else { 
                                              if (document.querySelector("#" + this.myId +" button[data-class='slideshow']").classList.contains("active") ) {
                                               document.querySelector("#" + this.myId +" div.nav-next").click();}
                                              else {
                                                  t.src= this.errorImage; //window.location.origin
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
    // keyboard: left/right arrow = previous/next image, Esc = close (in browser fullscreen
    // the browser takes Esc itself and leaves fullscreen first)
    document.addEventListener('keydown', (e) => {
        if (ov.style.display == "none" || e.altKey || e.ctrlKey || e.metaKey) return;
        if (e.target.closest && e.target.closest("input, textarea, select, [contenteditable]")) return;
        if (e.key == "ArrowLeft") { ov.querySelector("div.nav-prev").click(); e.preventDefault(); }
        else if (e.key == "ArrowRight") { ov.querySelector("div.nav-next").click(); e.preventDefault(); }
        else if (e.key == "Escape") { this.close(); }
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
        this.#prepared[url] = img.decode().then(() => url, () => url);
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
    document.querySelector("#" + this.myId +" div.album").classList.add("hide"); 
    document.querySelector("#" + this.myId +" button[data-class='album']").classList.remove("active");
    document.querySelectorAll("#" + this.myId +" .album img.cur").forEach((e)=>e.classList.remove("cur")); 
    let imageSrc = src;
    let iOvE = document.querySelector("#" + this.myId);
    let iOv = iOvE.querySelector("div.backImage");
    let iOvImg = iOv.querySelector("img.picture")
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
    let wasOpen = iOvE.style.display != "none";
    iOvE.querySelector(".layer2").style.backgroundImage = wasOpen ? (iOv.style.backgroundImage || "url('"+ iOvImg.src +"')") : "none";
    iOvE.querySelector(".layer2").src = iOvImg.src;
    iOvE.style.display = "block";
    iOv.classList.remove("unhide");
    iOvE.classList.add("progress");
    // restart the image change transition (CSS animations on .changing), independent of
    // how long loading takes
    iOvE.classList.remove("changing");
    void iOvE.offsetWidth;
    iOvE.classList.add("changing");

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
    
    // reset
    document.querySelector("#" + this.myId +" div.album").classList.add("hide");       
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
           if (elem.dataset.class == "slideshow" ) document.querySelector("#" + this.myId +" div.nav-next").click();
           if (elem.dataset.class == "album") {  document.querySelector("#" + this.myId +" div.album").classList.remove("hide"); }   
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
    if (document.querySelector("#" + this.myId +" button[data-class='slideshow']").classList.contains("active") ) {
        setTimeout((e)=>{
              if (document.querySelector("#" + this.myId +" button[data-class='slideshow']").classList.contains("active") ) document.querySelector("#" + this.myId +" div.nav-next").click();
             }
             , this.timeout); 
    }
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
        let gal = document.querySelector("#" + this.myId +" div.album");
        let nImg = document.createElement("img");
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


