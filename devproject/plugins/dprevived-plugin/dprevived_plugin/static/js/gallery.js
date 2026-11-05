
function initGallery(){
    //alert("g4");
    window.addEventListener('mouseup', mouseUp, false);
    document.querySelector('#image-ov .backImage img').addEventListener('mousedown', mouseDown, false);
    document.querySelectorAll("#image-ov .backImage img").forEach((e)=>{
        e.addEventListener('load',loadedOvImage);
        e.addEventListener('error',  (e) =>{let t = e.target;
                                            //console.log(t.src);
                                            if (document.querySelector("#image-ov button[data-class='slideshow']").classList.contains("active") ) {
                                             document.querySelector("#image-ov div.nav-next").click();}
                                            else {
                                                t.src= "/static/lost.jpg"; //window.location.origin
                                                t.classList.add("lost");
                                                }
                                            });
        });

    document.querySelectorAll("#image-ov button.btn-css").forEach(
    (e) => { e.addEventListener('click',(e) =>{ovNavi(e);return false;});}
    );
    document.querySelectorAll("#image-ov div.nav").forEach(
    (e) => { e.addEventListener('click',(e) =>{switchImage(e);return false;});}
    );
    refreshGallery();
}

function mouseUp() {
    window.removeEventListener('mousemove', divMove, true);
    var div = document.querySelector('#image-ov .backImage img');
    div.style.cursor='inherit';
}

function mouseDown(e) {
    global.gMouseDownX = e.clientX;
    global.gMouseDownY = e.clientY;

    var div = document.querySelector('#image-ov .backImage img');
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
    global.gMouseDownOffsetX = global.gMouseDownX - parseInt(leftNumString,10);

    //The following block gets the Y offset (the difference between where it starts and where it was clicked)
    let topPart = "";
    if(!div.style.top)
        topPart+="0px";     //In case this was not defined as 0px explicitly.
    else
        topPart = div.style.top;
    let topPos = topPart.indexOf("px");
    let topNumString = topPart.slice(0, topPos);    // Get the Y value of the object.
    global.gMouseDownOffsetY = global.gMouseDownY - parseInt(topNumString,10);

    window.addEventListener('mousemove', divMove, true);
}

function divMove(e){
    var div = document.querySelector('#image-ov .backImage img');
    let topAmount = e.clientY - global.gMouseDownOffsetY;
    div.style.top = topAmount + 'px';
    let leftAmount = e.clientX - global.gMouseDownOffsetX;
    div.style.left = leftAmount + 'px';
}

function getImageSrc(e) {
    let aSrc = e.href;
    let imageSrc = "";
    //console.log(aSrc);
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

function openImage(e, src = "" ) {
    document.querySelector("#image-ov div.album").classList.add("hide"); 
    document.querySelector("#image-ov button[data-class='album']").classList.remove("active");
    document.querySelectorAll("#image-ov .album img.cur").forEach((e)=>e.classList.remove("cur")); 
    let imageSrc = src;
    let iOvE = document.querySelector("#image-ov");
    let iOv = iOvE.querySelector("div.backImage");
    let mylink = iOvE.querySelector(".head .nav-ov a.ext");
    
    if (src == "")  {
        imageSrc = e.target.src;
        }
                
    let path = "#image-ov .album img[src='" + imageSrc + "']";
    console.log(path);
    document.querySelectorAll(path).forEach((e)=>e.classList.add("cur")); 
    iOvE.querySelector(".exifOverlay").innerHTML = "";
    
    let bigSrc = imageSrc;
    
    if (global.ovImages[imageSrc] != ""   ) {   
        bigSrc = global.ovImages[imageSrc];
        mylink.href = bigSrc ;
        mylink.style.display = "block";
    }
    else {
        mylink.href = "#" ;
        mylink.style.display = "none";    
    }

    iOvE.querySelector(".head .nav-ov a.download").href = bigSrc ;
    iOv.style.backgroundImage = "url('"+bigSrc+"')";
    iOv.querySelector("img.picture").src = bigSrc ;
    iOvE.classList.add("progress");
    iOv.querySelector("img.picture").classList.remove("lost");
    iOvE.style.display = "block";
    let iPos = Object.keys(global.ovImages).indexOf(imageSrc);
    //console.log(imageSrc,iPos);
    iOvE.dataset.pos = iPos;
    ivChangeNav(iPos, iOvE);
    makeExif(iOv);    
}

function switchImage(e) {
     let elem = e.target;
     while (!elem.classList.contains("dprev-btn")) {elem = elem.parentElement;}
     let direction ="next";
     if (elem.classList.contains("nav-prev")){
         direction ="prev";
     }
    let iOvE = document.querySelector("#image-ov");
    let cPos = parseInt(iOvE.dataset.pos);

    /* STOP 
    if (direction == "next"){
         iPos = Math.min(cPos+1, global.ovImages.length-1);
    }
    else {
         iPos = Math.max(0, cPos-1);
    }
    */
    
    // cycle
    if (direction == "next") {
        iPos = cPos >= Object.keys(global.ovImages).length-1 ? 0 : cPos+1;
    }
    else {
         iPos = cPos <= 0 ? Object.keys(global.ovImages).length-1 : cPos-1;
    }
        
    if (iPos!=cPos) {
        openImage("", Object.keys(global.ovImages)[iPos]);
    }

}

function ivChangeNav(iPos, iOvE) {
    if (iPos == 0) {
         iOvE.querySelector("div.nav .left").classList.add("hide");
         iOvE.querySelector("div.nav .down").classList.remove("hide");
    }
    else {
         iOvE.querySelector("div.nav .down").classList.add("hide");
         iOvE.querySelector("div.nav .left").classList.remove("hide");
    }
    if (iPos == Object.keys(global.ovImages).length-1) {
         iOvE.querySelector("div.nav .right").classList.add("hide");
         iOvE.querySelector("div.nav .up").classList.remove("hide");
    }
    else {
         iOvE.querySelector("div.nav .up").classList.add("hide");
         iOvE.querySelector("div.nav .right").classList.remove("hide");
    }
}

function ovNavi(e) {
    // slideshow album big full close
    let elem = e.target;
    while (elem.tagName.toUpperCase()!="BUTTON") {elem = elem.parentElement;}
    let tElem = document.getElementById("image-ov");
    let isActive = elem.classList.contains("active");
    let action = elem.dataset.class;
    let div = document.querySelector('#image-ov img');
    
    // reset
    document.querySelector("#image-ov div.album").classList.add("hide");
    div.style.top="0px";
    div.style.left="0px";
        
    if (action == "close") {
        document.getElementById('image-ov').style.display='none';    
        document.querySelectorAll("#image-ov .nav-ov button.active").forEach((e)=>{
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
        document.querySelectorAll("#image-ov .nav-ov button.radio-btn").forEach((e)=>{e.classList.remove("active");tElem.classList.remove(e.dataset.class);});
        if (isActive) {
            if (elem.dataset.class == "album") {  document.querySelector("#image-ov div.album").classList.add("hide"); }   
        }
        else {
           tElem.classList.add(elem.dataset.class);
           elem.classList.add("active");
           if (elem.dataset.class == "slideshow" ) document.querySelector("#image-ov div.nav-next").click();
           if (elem.dataset.class == "album") {  document.querySelector("#image-ov div.album").classList.remove("hide"); }   
        }      
    }


}

function loadedOvImage(e){
    //console.log("loaded:",e.target.src);
    document.querySelector("#image-ov").classList.remove("progress");
    //e.addEventListener('load',loadedOvImage(e));
    //cursor: progress;
    if (document.querySelector("#image-ov button[data-class='slideshow']").classList.contains("active") ) {
        setTimeout((e)=>{
              if (document.querySelector("#image-ov button[data-class='slideshow']").classList.contains("active") ) document.querySelector("#image-ov div.nav-next").click();
             }
             , 2000); 
    }
}

function addImage(src,big) {
     //console.log(src,big);
     //console.log(src in global.ovImages);
     if (!(src in global.ovImages)) {
        global.ovImages[src] = big; 
        let gal = document.querySelector("#image-ov div.album");
        let nImg = document.createElement("img");
        nImg.src = src;
        nImg.addEventListener('click',(e) =>{openImage("", src)});
        gal.appendChild(nImg);     
     }
}
    
function makeExif(elem) {
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
    if (src in global.cache.exif) {
        //console.log("hit",src)
        if (global.cache.exif[src]["ready"] == true) {
            let line1 = global.cache.exif[src].line1;
            let line2 = global.cache.exif[src].line2;
            tDiv.innerHTML = line1 + line2 ;
            }
            else {
                global.cache.exif[src]["elems"].push(tDiv);
            }
    }
    else {
        //console.log("fail",src)
        global.cache.exif[src] = {"ready":false,"line1":"", "line2":"", "elems": [tDiv]};
        let img = new Image();
        img.onload = function(item) {
            //console.log("exif",img.src,tDiv);
            EXIF.getData(img, (el)=> {
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
            let tDivs = global.cache.exif[img.src].elems;
            global.cache.exif[img.src] = {"ready":true,"line1":line1, "line2":line2, "elems": []};
            tDivs.forEach((ediv)=>{ediv.innerHTML = line1 + line2 ;});
             
            });
        }
        img.addEventListener('load',(e)=>{img.onload(img)});
        img.src=src;
        if (img.complete) {
            img.onload(img);
            }
        else {
            //console.log(spath);
            
            let prev = document.querySelector('a[href="' + spath + '"] div.exifOverlay');
            if (prev!= null) tDiv.innerHTML = prev.innerHTML;
        }
    }
}

function refreshGallery(){
        if (document.querySelectorAll(".exif").length>0) return;
        global.ovImages = {}; 
        document.querySelector("#image-ov div.album").innerHTML = "";
        //console.log("refresh images");
        document.querySelectorAll("article.misago-markup img").forEach(
        (e) => {
            let pe = e.parentElement;
            if (!e.classList.contains("exif")) {
                e.classList.add("exif");
                let newdiv = document.createElement("div");
                newdiv.classList.add("exifOverlay");           
                pe.appendChild(newdiv);
                makeExif(e);
                if (pe.tagName.toUpperCase()=="A") {
                    if ( (!pe.classList.contains("imageOv"))) //(e.href.indexOf("/a/")>-1) &&
                            {
                            pe.addEventListener('click',(e) =>{e.stopPropagation();e.preventDefault();openImage(e);return false;});
                            pe.classList.add("imageOv");
                            addImage(e.src, pe.href);
                            //console.log("big:",pe.href);
                            //console.log(pe.querySelector("img").src);
                            }
                }
                else {
                    e.addEventListener('click',(e) =>{e.stopPropagation();e.preventDefault();openImage(e);return false;});
                    addImage(e.src, "" );
                    //console.log("single",e.src);
                }
            }
           else {
                //console.log(e.src);
                if (pe.tagName.toUpperCase()=="A") {
                    if ( (!pe.classList.contains("imageOv"))) //(e.href.indexOf("/a/")>-1) &&
                            {
                            addImage(e.src, pe.href);
                            //console.log(e.src,pe.href);
                            }
                }
                else {
                    addImage(e.src, "" );
                    //console.log("single",e.src);
                }
           }
        }
    );
    /*document.querySelectorAll("article.misago-markup a:has(img)").forEach(
    (e) => {if ( (!e.classList.contains("imageOv"))) //(e.href.indexOf("/a/")>-1) &&
        {
        e.addEventListener('click',(e) =>{e.stopPropagation();e.preventDefault();openImage(e);return false;});
        e.classList.add("imageOv");
        }
    });
    */
}




