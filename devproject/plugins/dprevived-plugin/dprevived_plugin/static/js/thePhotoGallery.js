class thePhotoGallery {

    version = "1";
    #gMouseDownX = 0;
    #gMouseDownY = 0;
    #gMouseDownOffsetX = 0;
    #gMouseDownOffsetY = 0;
    #ovImages = {};
    #cache = {"exif":{}};
    #moveMouse = (e) => {this.divMove(e)};    
    
    constructor(selector = "article.misago-markup img") {
        // config Vars
        this.selector = selector;
        this.timeout = 1500;
        this.myId = "image-ov";
        this.errorImage = "/static/lost.jpg" 
        this.useExif = true;
        this.cylce = true;
        this.clearOnRefresh = true;
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

  initGallery(){
    //alert("g4");
    window.addEventListener('mouseup', (e) => {this.mouseUp()}, false);
    document.querySelector('#' + this.myId +' .backImage img.picture').addEventListener('mousedown',(e) =>{ this.mouseDown(e)}, false);
    document.querySelectorAll("#" + this.myId +" .backImage img.picture").forEach((e)=>{
        e.addEventListener('load', (e) => {this.loadedOvImage();});
        e.addEventListener('error',  (e) =>{let t = e.target;
                                            //console.log(t.src);
                                            if (document.querySelector("#" + this.myId +" button[data-class='slideshow']").classList.contains("active") ) {
                                             document.querySelector("#" + this.myId +" div.nav-next").click();}
                                            else {
                                                t.src= this.errorImage; //window.location.origin
                                                t.classList.add("lost");
                                                }
                                            });
        });

    document.querySelectorAll("#" + this.myId +" button.btn-css").forEach(
    (e) => { e.addEventListener('click',(e) =>{this.ovNavi(e);return false;});}
    );
    document.querySelectorAll("#" + this.myId +" div.nav").forEach(
    (e) => { e.addEventListener('click',(e) =>{this.switchImage(e);return false;});}
    );
    this.refreshGallery();
}

  mouseUp() {
    window.removeEventListener('mousemove', this.#moveMouse, true);
    let div = document.querySelector('#' + this.myId +' .backImage img.picture');
    div.style.cursor='inherit';
}

  mouseDown(e) {
    this.#gMouseDownX = e.clientX;
    this.#gMouseDownY = e.clientY;

    let div = document.querySelector('#' + this.myId +' .backImage img.picture');
    div.style.position = 'absolute';
    div.style.cursor='all-scroll';

    //The following block gets the X offset (the difference between where it starts and where it was clicked)
    let leftPart = "";
    if(!div.style.left)
        leftPart+="0px";    //In case this was not defined as 0px explicitly.
    else
        leftPart = div.style.left;
    let leftPos = leftPart.indexOf("px");
    let leftNumString = leftPart.slice(0, leftPos); // Get the X value of the object.
    this.#gMouseDownOffsetX = this.#gMouseDownX - parseInt(leftNumString,10);

    //The following block gets the Y offset (the difference between where it starts and where it was clicked)
    let topPart = "";
    if(!div.style.top)
        topPart+="0px";     //In case this was not defined as 0px explicitly.
    else
        topPart = div.style.top;
    let topPos = topPart.indexOf("px");
    let topNumString = topPart.slice(0, topPos);    // Get the Y value of the object.
    this.#gMouseDownOffsetY = this.#gMouseDownY - parseInt(topNumString,10);

    window.addEventListener('mousemove', this.#moveMouse, true);
}

 divMove(e){
    var div = document.querySelector('#' + this.myId +' .backImage img.picture');
    let topAmount = e.clientY - this.#gMouseDownOffsetY;
    div.style.top = topAmount + 'px';
    let leftAmount = e.clientX - this.#gMouseDownOffsetX;
    div.style.left = leftAmount + 'px';
}

 getImageSrc(e) {
    let aSrc = e.href;
    let imageSrc = "";
    //console.log(aSrc);
    //console.log(e)
    if (aSrc.indexOf("/a/")>-1) {
        imageSrc = aSrc;
    }
    else if ((aSrc.indexOf(".jpg")>-1)) {
        imageSrc = aSrc;    
    }
    else  {
        //console.log(e);
        imageSrc = e.querySelector("img").src;
    }
    //console.log(imageSrc);
    return imageSrc;
}

 openImage(e, src = "" ) {
    let div = document.querySelector("#" + this.myId +" .backImage img");
    div.style.top="0px";
    div.style.left="0px";
    document.querySelector("#" + this.myId +" div.album").classList.add("hide"); 
    document.querySelector("#" + this.myId +" button[data-class='album']").classList.remove("active");
    document.querySelectorAll("#" + this.myId +" .album img.cur").forEach((e)=>e.classList.remove("cur")); 
    let imageSrc = src;
    let iOvE = document.querySelector("#" + this.myId);
    let iOv = iOvE.querySelector("div.backImage");
    let mylink = iOvE.querySelector(".head .nav-ov a.ext");
    
    if (src == "")  {
        imageSrc = e.target.src;
        }
                
    let path = "#" + this.myId +" .album img[src='" + imageSrc + "']";
    //console.log(path);
    document.querySelectorAll(path).forEach((e)=>e.classList.add("cur")); 
    iOvE.querySelector(".exifOverlay").innerHTML = "";
    
    let bigSrc = imageSrc;
    
    if (this.#ovImages[imageSrc] != ""   ) {   
        bigSrc = this.#ovImages[imageSrc];
        mylink.href = imageSrc ;
        mylink.style.display = "block";
    }
    else {
        mylink.href = "#" ;
        mylink.style.display = "none";    
    }
    iOvE.querySelector(".layer2").style.backgroundImage = "url('"+ iOv.querySelector("img.picture").src +"')"; 
    iOvE.querySelector(".layer2").src = iOv.querySelector("img.picture").src;
    iOvE.style.display = "block";
    iOvE.classList.add("progress");
    iOv.querySelector("img.picture").classList.remove("lost");
    iOv.classList.remove("unhide");
    iOv.style.backgroundImage = "url('"+bigSrc+"')";
    iOvE.querySelector(".head .nav-ov a.download").href = bigSrc ;
    iOv.querySelector("img.picture").src = bigSrc ;
    
    let iPos = Object.keys(this.#ovImages).indexOf(imageSrc);
    //console.log(imageSrc,iPos);
    iOvE.dataset.pos = iPos;
    this.ivChangeNav(iPos, iOvE);
    this.makeExif(iOv);    
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
        this.openImage("", Object.keys(this.#ovImages)[iPos]);
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
    let tElem = document.getElementById("image-ov");
    let isActive = elem.classList.contains("active");
    let action = elem.dataset.class;
    let div = document.querySelector("#" + this.myId +" .backImage img");
    
    // reset
    document.querySelector("#" + this.myId +" div.album").classList.add("hide");       
    div.style.top="0px";
    div.style.left="0px"; 
    if (action == "close") {
        document.getElementById('image-ov').style.display='none';    
        document.querySelectorAll("#" + this.myId +" .nav-ov button.active").forEach((e)=>{
                            e.classList.remove("active");
                            tElem.classList.remove(e.dataset.class);
                          });
    }
    else if (action == "full") {
        if (isActive) {
            tElem.classList.remove(elem.dataset.class);
            elem.classList.remove("active");        
        }
        else {
           tElem.classList.add(elem.dataset.class);
           elem.classList.add("active");        
        }
    }
    else {
        document.querySelectorAll("#" + this.myId +" .nav-ov button.radio-btn").forEach((e)=>{e.classList.remove("active");tElem.classList.remove(e.dataset.class);});
        if (isActive) {
            if (elem.dataset.class == "album") {  document.querySelector("#" + this.myId +" div.album").classList.add("hide"); }   
        }
        else {
           tElem.classList.add(elem.dataset.class);
           elem.classList.add("active");
           if (elem.dataset.class == "slideshow" ) document.querySelector("#" + this.myId +" div.nav-next").click();
           if (elem.dataset.class == "album") {  document.querySelector("#" + this.myId +" div.album").classList.remove("hide"); }   
        }      
    }


}

 loadedOvImage(e){
    //console.log("loaded:",e.target.src);
    document.querySelector("#" + this.myId +" .backImage").classList.add("unhide");
    document.querySelector("#" + this.myId +"").classList.remove("progress");
    //e.addEventListener('load',loadedOvImage(e));
    //cursor: progress;
    //console.log(this.timeout);
    if (document.querySelector("#" + this.myId +" button[data-class='slideshow']").classList.contains("active") ) {
        setTimeout((e)=>{
              if (document.querySelector("#" + this.myId +" button[data-class='slideshow']").classList.contains("active") ) document.querySelector("#" + this.myId +" div.nav-next").click();
             }
             , this.timeout); 
    }
}

 addImage(src,big) {
     //console.log(src,big);
     if (!(src in this.#ovImages)) {
        this.#ovImages[src] = big; 
        let gal = document.querySelector("#" + this.myId +" div.album");
        let nImg = document.createElement("img");
        nImg.src = src;
        nImg.addEventListener('click',(e) =>{this.openImage("", src)});
        gal.appendChild(nImg);     
     }
}
    
 makeExif(elem) {
    //console.log(elem);
    let src;
    if (elem.tagName.toUpperCase()=="IMG" && (!elem.classList.contains("picture"))) {
        src = elem.src;
        elem = elem.parentElement;
    }
    else {
      while (elem.id!="image-ov") {elem = elem.parentElement;}
      src = elem.querySelector("div.backImage").style.backgroundImage.slice(5, -2);      
    }
    let spath = src.slice(src.search("://")+3);
    spath = spath.slice(spath.search("/"));
    //console.log(spath);
    let tDiv = elem.querySelector(".exifOverlay");
    if (src in this.#cache.exif) {
        //console.log("hit",src)
        if (this.#cache.exif[src]["ready"] == true) {
            let line1 = this.#cache.exif[src].line1;
            let line2 = this.#cache.exif[src].line2;
            tDiv.innerHTML = line1 + line2 ;
            }
            else {
                this.#cache.exif[src]["elems"].push(tDiv);
            }
    }
    else {
        //console.log("fail",src)
        this.#cache.exif[src] = {"ready":false,"line1":"", "line2":"", "elems": [tDiv]};
        let img = new Image();
        let exifCache = this.#cache.exif;
        img.onload =(item) => {
            console.log("exif",img.src);
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
            let tDivs = exifCache[img.src].elems;
            exifCache[img.src] = {"ready":true,"line1":line1, "line2":line2, "elems": []};
            tDivs.forEach((ediv)=>{ediv.innerHTML = line1 + line2 ;});
             
            });
        }
        img.addEventListener('load',(e)=>{img.onload(img)});
        img.src=src;
        if (img.complete) {
            console.log("exif ever?",img.scr)
            img.onload(img);
            }
        else {
            console.log("exif wrong?",spath);
            let prev = document.querySelector('a[href="' + spath + '"] div.exifOverlay');
            if (prev!= null) tDiv.innerHTML = prev.innerHTML;
        }
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
        //console.log("refresh images");
        document.querySelectorAll(this.selector).forEach(
        (e) => {
            let pe = e.parentElement;
            if (!e.classList.contains("exif")) {
                e.classList.add("exif");
                let newdiv = document.createElement("div");
                newdiv.classList.add("exifOverlay");           
                pe.appendChild(newdiv);
                this.makeExif(e);
                if (pe.tagName.toUpperCase()=="A") {
                    if ( (!pe.classList.contains("imageOv"))) //(e.href.indexOf("/a/")>-1) &&
                            {
                            pe.addEventListener('click',(e) =>{e.stopPropagation();e.preventDefault();this.openImage(e);return false;});
                            pe.classList.add("imageOv");
                            this.addImage(e.src, pe.href);
                            //console.log("big:",pe.href);
                            //console.log(pe.querySelector("img").src);
                            }
                }
                else {
                    e.addEventListener('click',(e) =>{e.stopPropagation();e.preventDefault();this.openImage(e);return false;});
                    this.addImage(e.src, "" );
                    //console.log("single",e.src);
                }
            }
           else {
                //console.log(e.src);
                if (pe.tagName.toUpperCase()=="A") {
                    if ( (!pe.classList.contains("imageOv"))) //(e.href.indexOf("/a/")>-1) &&
                            {
                            this.addImage(e.src, pe.href);
                            //console.log(e.src,pe.href);
                            }
                }
                else {
                    this.addImage(e.src, "" );
                    //console.log("single",e.src);
                }
           }
        }
    );
}

}


