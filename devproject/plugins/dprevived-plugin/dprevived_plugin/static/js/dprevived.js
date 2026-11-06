
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
         refreshGallery();
         document.querySelectorAll("#limitSwitch").forEach((ee) =>ee.addEventListener('change',(e) =>{e.stopPropagation();e.preventDefault();
                                                      let st = document.querySelector("#limitSwitch").selectedOptions[0].value;
                                                      if (st!="") setPostLimit(st);
                                                      return false;
                                                      }));
        //console.log("reloaded");
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

function sendApiRequest(path, callback, onFailure) {
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
		else if (onFailure) onFailure(res);
	}
	request.onerror = (error) => {
		console.log(error);
		if (onFailure) onFailure(error);
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

// The React app keeps its own copy of the thread lists and never learns about these
// endpoints, so after a successful call reload the page to show the new read state.
// Pages the browser brings back with Back/Forward are shown as they were when first
// loaded, so remember when something was marked read and reload those too.
const READ_AT_KEY = "dprevivedMarkedReadAt";

function markReadRequest(path, selector, opacity) {
    let dimmed = document.querySelectorAll(selector);
    dimmed.forEach((el)=>{el.style.opacity=opacity;});
    sendApiRequest(path, () =>{
            try { sessionStorage.setItem(READ_AT_KEY, Date.now()); } catch (e) {}
            window.location.reload();
        },
        () =>{ dimmed.forEach((el)=>{el.style.opacity="";}); });
	return false;
}

window.addEventListener("pageshow", (e) => {
    let readAt = 0;
    try { readAt = parseInt(sessionStorage.getItem(READ_AT_KEY)) || 0; } catch (err) {}
    if (!readAt) return;
    let nav = performance.getEntriesByType("navigation")[0];
    // e.persisted: the old document itself was restored, so its load time is known.
    // A back_forward load may come from the HTTP cache, whose age is unknown.
    let stale = e.persisted ? readAt > performance.timeOrigin : (nav && nav.type == "back_forward");
    if (stale) window.location.reload();
});

function markThreadRead(ev, thread) {
    return markReadRequest('/api/mark-read-thread/'+ thread +'/', "li.post .label-unread", 0.2);
}

// Fades the whole list, not the unread icons: a list can show threads from other
// categories (globally pinned ones), which "mark all read" here leaves unread.
function markCategoryRead(ev, category) {
    return markReadRequest('/api/mark-read-category/'+ category +'/', ".threads-list", 0.5);
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
    let hamburger = document.querySelector("#navbar-site-nav-link");
    if (hamburger != null) {
    	hamburger.addEventListener('click',(e) =>{return hamburgerEvent(e,hamburger);});
    }
}

function swichBg(e) {
    let elem = e.target;
    while (!elem.classList.contains("dprev-btn")) {elem = elem.parentElement;}
    //console.log(elem);
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
    //alert("3");
    initGallery();
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
        {   
        changeStyle(global.styles[dpreviedBGSet]);
        document.getElementById("styleSwitch").value = dpreviedBGSet;
        }
    else if (document.location.pathname.search("/2599/")>0) {
        document.querySelector("body").classList.add("dark");
    }
    else if (window.matchMedia('(prefers-color-scheme:dark').matches) {
        switchStyle('dark');
        document.getElementById("styleSwitch").value = 'dark';
    }
    
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

function hamburgerEvent(e,elem) {
	console.log(e.target.tagName);
	if (e.target.tagName.toLowerCase() =="a") {return true;}
	else {
		let button;
		button = document.querySelector("#navbar-site-nav-link button");
		e.stopPropagation();
		e.preventDefault();
		if (button.classList.contains("active"))
		{
		button.classList.remove("active");
		elem.classList.remove("open");
		} 
		else 
		{
		button.classList.add("active");
		elem.classList.add("open");
		}
		return false;
	}
}



