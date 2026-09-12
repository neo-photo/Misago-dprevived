
function setCountdown(time) {
    
    setInterval( () => {
        let v = parseInt(document.getElementById('min').innerHTML);
        v -= 1;
        if (v <1) v=0;
        document.getElementById('min').innerHTML = v;
         }
        , 60000);
}

function catchEvent(e) {
    //console.log(e);
    if (e.detail.action=="updatePost") {
        //startup();
         document.querySelectorAll("#limitSwitch").forEach((ee) =>ee.addEventListener('change',(e) =>{e.stopPropagation();e.preventDefault();
                                                      let st = document.querySelector("#limitSwitch").selectedOptions[0].value;
                                                      if (st!="") setPostLimit(st);
                                                      return false;
                                                      }));
        console.log("reloaded");
    }
    else if (e.detail.action=="markThreadRead") {
        markThreadRead(e, e.detail.data.thread)
    }
    
    else if (e.detail.action=="markCategoryRead") {
        markCategoryRead(e, e.detail.data.category) 
    }
    else if (e.detail.action=="checkFreeSpace") {
        sendApiRequest('/api/check-free-space/', (res) =>{
            result = JSON.parse(res.target.response);
            document.querySelectorAll(".markup-editor-toolbar-space .usedSpace").forEach(
                (el)=>{
                    el.innerText = "used "+ (result.used/1024).toFixed(2) +"MB";
                    //el.attributes.title = "used "+ result.used/1024 +"MB";
                }
            );
            document.querySelectorAll(".markup-editor-toolbar-space .freeSpace").forEach(
                (el)=>{
                    el.innerText = "free "+ (result.free/1024).toFixed(2) +"MB";
                    //el.attributes.title = "free "+ (result.free/1024).toFixed(2) +"MB";
                }
            );
            document.querySelectorAll(".markup-editor-toolbar-space .maxSpace").forEach(
                (el)=>{
                    global["freeSpace"] = result.free;
                    let bg ="linear-gradient(to right ,red "+ result.usedp +"%, "+ result.usedp +"%,wheat)";
                    el.style.background = bg;
                    el.style.visibility = "visible";
                }
            );
        });
        
    }
    
}

function sendApiRequest(path, callback) {
    let cookie = document.cookie;
    let csrfToken = cookie.substring(cookie.indexOf('=') + 1);
	let request = new XMLHttpRequest();
	request.open('GET',path);
	request.setRequestHeader('Content-Type', 'application/json');
	request.setRequestHeader('X-CSRFToken', csrfToken);
	request.onload = (res) => {
		if (res.target.status >= 200 && res.target.status < 400) {
            console.log(res.target.response);
    		callback(res);
		}
	}
	request.onerror = (error) => {
		console.log(error);
	};
	request.send();
}
function setPostLimit(nr) {

    sendApiRequest('/api/set-post-limit/'+ nr +'/', (res) =>{
           let result = JSON.parse(res.target.response);
           if (result.error == 0 ) {
                let parts = window.location.pathname.split("/");
                if (parts[1]=="t" && parts.length>2) {
                    window.location.href="/t/"+parts[2]+"/"+parts[3]+"/";
                }
           }
        });
	return false;
}

function markThreadRead(ev, thread) {
    sendApiRequest('/api/mark-read-thread/'+ thread +'/', () =>{
        document.querySelectorAll("li.post .label-unread").forEach((el)=>{el.remove();});
        });
	document.querySelectorAll("li.post .label-unread").forEach((el)=>{el.style.opacity=0.2;});
	return false;
}

function markCategoryRead(ev, category) {
    sendApiRequest('/api/mark-read-category/'+ category +'/', () =>{
        document.querySelectorAll(".threads-list .threads-list-icon-new").forEach((el)=>{el.style.opacity=1;el.classList.remove("threads-list-icon-new");});
        }
    )
	document.querySelectorAll(".threads-list .threads-list-icon-new").forEach((el)=>{el.style.opacity=0.2;});
	return false;
}


function runInit(){
    initStyles();
    startup();
    document.querySelector("body").addEventListener("dprevived", (e) => {catchEvent(e);});
    //Test url
    if (document.location.pathname.search("/2599/")>0) document.querySelectorAll("#fire div").forEach((e)=>e.classList.add("firework"));
    if (new URL(document.location).searchParams.get("test")=="1" || document.location.pathname.search("/2493/")>0){
        document.querySelectorAll(".panel-post").forEach((e) => {e.style.backgroundColor="rgba('255,255,255,0.9')";});
        let bodyElement = document.querySelector("#page-mount");
        bodyElement.style.backgroundImage = "url('https://dprevived.com/a/thumb/wP5aSh59NzYXCozaG1v3pWaHcYb79R9UAIRmPoULlkCUHZASyR2PeDVUgmvH0JrR/3367/?shva=1')";
        bodyElement.dataset.bgurl = "url('https://dprevived.com/a/wP5aSh59NzYXCozaG1v3pWaHcYb79R9UAIRmPoULlkCUHZASyR2PeDVUgmvH0JrR/3367/?shva=1')";
        bodyElement.style.backgroundRepeat = "repeat-y";
        bodyElement.style.backgroundSize = "cover";
        document.querySelector("#bg-ov").style.display="block";
        let images = document.querySelector("#bg-ov div.images");
        document.querySelector("#bg-ov div button").addEventListener('click',(e) =>{e.stopPropagation();e.preventDefault();swichBgOpt();return false;});;
        document.querySelectorAll("#bg-ov .images div.dprev-btn").forEach((e) => {e.addEventListener('click',(e) =>{e.stopPropagation();e.preventDefault();swichBg(e);return false;});});
        document.querySelectorAll("a.post-thumbnail").forEach((e) => {
                let newdiv = document.createElement("div");
                newdiv.classList.add("dprev-btn");
                newdiv.style.backgroundImage = e.style.backgroundImage;
                newdiv.dataset.bgurl = "url('"+ e.href +"')";
                newdiv.addEventListener('click',(e) =>{e.stopPropagation();e.preventDefault();swichBg(e);return false;});
                images.appendChild(newdiv);
            });
    }
}

function swichBg(e) {
    let elem = e.target;
    while (!elem.classList.contains("dprev-btn")) {elem = elem.parentElement;}
    console.log(elem);
    let bodyElement = document.querySelector("#page-mount");
    document.querySelectorAll("#bg-ov div.images div.dprev-btn").forEach((e) => {e.style.borderColor='black'});
    elem.style.borderColor='gold';
    bodyElement.style.backgroundImage = elem.dataset.bgurl;
}

function switchStyle(cvalue) {
    let d= new (Date)
    d.setTime(d.getTime() + (365 * 24 * 60 * 60 * 1000));
    document.cookie ="dpreviedBGSet=" + cvalue + ";" + "expires="+d.toUTCString() + ";path=/;samesite=strict";
    changeStyle(global.styles[cvalue]);
}

function openImage(e) {
    let elem = e.target;
    while (elem.tagName.toUpperCase()!="A") {elem = elem.parentElement;}
    let iOvE = document.querySelector("#image-ov");
    let iOv = iOvE.querySelector("div.backImage");
    iOvE.querySelector(".exifOverlay").innerHTML = "";
    iOvE.querySelector(".head .nav-ov a").href = elem.href ;
    iOv.style.backgroundImage = "url('"+elem.href+"')";
    iOv.querySelector("img.picture").src = elem.href ;
    iOvE.style.display = "block";
    if (! ("ovImages" in global) ) {
     global.ovImages = []; 
     let urls = []
     document.querySelectorAll("article.misago-markup a.imageOv").forEach((item)=> {
        if (!(item.href in urls)) {urls.push(item.href); global.ovImages.push(item); }
        }
     );
    }
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
    let iOv = iOvE.querySelector("div.backImage");
    let curHref = iOv.style.backgroundImage.slice(5, -2);
    let nextHref = "";
    let startHref = "";
    let targetHref = "";
    let prevHref ="";
    //console.log("cur:",curHref);
    global.ovImages.forEach((item) => {
        if ( startHref == "") startHref = item.href;
        let myHref = item.href;
        if (targetHref != "") {
            nextHref = myHref; targetHref = "";
        }
        else if (myHref==curHref) {
            if (direction == "next"){
                targetHref = "1";
            }
            else {
                nextHref = prevHref;
            }
        }
        prevHref = myHref;
    });
    //console.log(direction,nextHref)
    if (nextHref=="" && startHref != "" ) nextHref=startHref;
    if (nextHref!="") {
        iOvE.querySelector(".exifOverlay").innerHTML = "";
        iOv.style.backgroundImage = "url('"+nextHref+"')";
        iOv.querySelector("img.picture").src = nextHref ;
        iOvE.querySelector(".head .nav-ov a").href = nextHref ;
        makeExif(iOv);
    }

}

function changeCss(e) {
    let elem = e.target;
    while (elem.tagName.toUpperCase()!="BUTTON") {elem = elem.parentElement;}
    let old = "smallImage";
    let tElem = document.getElementById("image-ov");
    if (elem.dataset.class=="full") {
        tElem.classList.toggle(elem.dataset.class);
        elem.classList.toggle("active");
    }
    else {
        tElem.classList.forEach((cname)=>{ if (cname!="full") old = cname; });
        if (old!= elem.dataset.class) {
            tElem.classList.replace(old, elem.dataset.class);
            document.querySelectorAll("#image-ov button.size").forEach((el)=> {if (el==elem) {el.classList.add("active")} else {el.classList.remove("active")};});
        }
    }
}

function swichBgOpt() {
    let opts = {"opacity":"",
             "bgurl":"",
            "size":"",
            "repeat":"",
            "color":"",
            "fgcolor":"",
            "bgurl":document.querySelector("#page-mount").dataset.bgurl
            }
   document.querySelectorAll("#bg-ov select").forEach((e) => {
        let cl = e.classList[0];
        let op = e.selectedOptions[0];
        let val = op.value;//e.querySelector('option[selected="selected"]').value;
        let valText = op.textContent;
        if (cl == "opacity") {
            opts.opacity = val ;
        }
        if (cl == "size") {
            opts.size = valText;
        }
        if (cl == "repeat") {
            opts.repeat = valText;
        }
        if (cl == "color") {
            opts.color = valText;
        }
        if (cl == "fgcolor") {
           opts.fgcolor = valText;
        }
    });
  changeStyle(opts);
}

function changeStyle(opts) {
    let bodyElement = document.querySelector("#page-mount");
     Object.entries(opts).forEach(([cl,val]) => {
        if (cl == "opacity" && val!="") {
            document.querySelectorAll(".panel-post").forEach((e) => {
            let vx="rgba(255,255,255," + val +")";
            e.style.backgroundColor=vx;
            });
        }
        if (cl == "size" && val!="") {
            bodyElement.style.backgroundSize = val;
        }
        if (cl == "repeat" && val!="") {
            bodyElement.style.backgroundRepeat = val;
        }
        if (cl == "color" && val!="") {
           bodyElement.style.backgroundColor = val;
        }
        if (cl == "fgcolor" && val!="") {
            let bodyElement = document.querySelector("body");
            let old = bodyElement.dataset.sclass;
            if (old!=undefined && old !='' ) {
               document.querySelector("body").classList.remove(old);
            }
            document.querySelector("body").classList.add(val);
            document.querySelector("body").dataset.sclass = val;
        }
        if (cl == "bgurl") {
            if (val!="") {
               bodyElement.style.background = "url('"+ val +"')";
            }
            else {
                  bodyElement.style.background = "";
            }
        }
    });
}

function startup(){ 
    document.querySelectorAll(".hoveropen").forEach((e)=>{e.addEventListener('click', (ev) => {
        let t = ev.target;
        //console.log(t);
        while (!t.classList.contains("hoveropen")) { 
            if (t.tagName.toUpperCase() == "A" && !t.classList.contains("dummy")) {return true};
            t = t.parentElement;
        }
        ev.stopPropagation();ev.preventDefault();
        if (t.classList.contains("lev1") || t.classList.contains("lev2")) {
            t.parentElement.querySelectorAll(".open").forEach((e)=>{if (e!=t) e.classList.toggle("open");});
        }
        t.classList.toggle("open");
    })});
    document.querySelectorAll(".quickmenu").forEach((el) =>{
        el.addEventListener('mouseleave', 
            (ev) => {
               document.querySelectorAll(".quickmenu.open,.quickmenu .open ").forEach((el)=>{
                    el.classList.remove("open");
                    });
         });
        //el.addEventListener('mouseout', (ev) => { document.querySelectorAll(".quickmenu .open").forEach((el)=>{el.classList.remove("open");});});
    });
    let dpreviedBGSet="";
    document.cookie.split(';').forEach((e)=> {let [name,value] = e.split("=",2); if (name.trim()=="dpreviedBGSet") dpreviedBGSet=value;});
    if (dpreviedBGSet!="") 
        {changeStyle(global.styles[dpreviedBGSet]);}
    else if (document.location.pathname.search("/2599/")>0) {
        document.querySelector("body").classList.add("dark");
    }
    
    if (1==1){//(new URL(document.location).searchParams.get("test")=="1"){
        document.querySelectorAll("article.misago-markup img").forEach(
            (e) => {
                let newdiv = document.createElement("div");
                newdiv.classList.add("exifOverlay");
                e.parentElement.appendChild(newdiv);
                makeExif(e);
            }
        );
        document.querySelectorAll("article.misago-markup a").forEach(
        (e) => {if (e.href.indexOf("/a/")>-1)
            {
            e.addEventListener('click',(e) =>{e.stopPropagation();e.preventDefault();openImage(e);return false;});
            e.classList.add("imageOv");
         }
        });
        addImageOv();
        let selectElement = document.querySelector("#styleSwitch");
        Object.entries(global.styles).forEach(([key,val]) => {
            let newdiv = document.createElement("option");
            newdiv.value = key;
            newdiv.appendChild(document.createTextNode(val.name));
            selectElement.appendChild(newdiv);
        });
        selectElement.style.display="block";
        selectElement.addEventListener('change',(e) =>{e.stopPropagation();e.preventDefault();
                                                      let st = document.querySelector("#styleSwitch").selectedOptions[0].value;
                                                      if (st!="") switchStyle(st);
                                                      return false;
                                                      });
        // set limit
         document.querySelectorAll("#limitSwitch").forEach((ee) =>ee.addEventListener('change',(e) =>{e.stopPropagation();e.preventDefault();
                                                      let st = document.querySelector("#limitSwitch").selectedOptions[0].value;
                                                      if (st!="") setPostLimit(st);
                                                      return false;
                                                      }));
    }
}

function addImageOv(){
        document.querySelectorAll("#image-ov button.btn-css").forEach(
        (e) => { e.addEventListener('click',(e) =>{changeCss(e);return false;});}
        );
        document.querySelectorAll("#image-ov div.nav").forEach(
        (e) => { e.addEventListener('click',(e) =>{switchImage(e);return false;});}
        );
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
    //console.log(src);
    
    let tDiv = elem.querySelector(".exifOverlay");
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
                if (fmm35 != undefined && fmm35 != fmm  && fmm35 != 0 ){ 
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

         tDiv.innerHTML = line1 + line2 ;
        })
    }
    img.addEventListener('load',(e)=>{img.onload(img)});
    img.src=src;
    if (img.complete) {
        img.onload(img);
        }
}

