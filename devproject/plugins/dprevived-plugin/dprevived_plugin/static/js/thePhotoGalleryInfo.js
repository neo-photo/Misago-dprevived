/* thePhotoGallery image details: an info button at the start of the viewer's header opens
   a panel at the bottom of the image area with the image's details - camera, lens,
   exposure, focal length, date (EXIF), file name, poster (a link to the post). It follows
   the image while open (prev / next), so a series can be compared.

   Opened and closed by the button, the "i" key, and on touch screens by swiping up / down
   on the image. Also closed by Esc (before the viewer), a click or tap on the image, and a
   click on the panel itself - unless text was selected there (the panel's text can be
   selected and copied) or the click was on the post link.

   A plugin of thePhotoGallery, registered after the gallery is created:
       gallery.registerPlugin("info", thePhotoGalleryInfo());
   Styles: thePhotoGalleryInfo.css. The EXIF tags come from gallery.exifData(src) (today
   read from the preview; the forum's database can take that over). */
function thePhotoGalleryInfo() {
  let gallery = null;
  let current = null;             // the shown image's details (the viewer's changed(info))

  const el = (tag, cls, text) => {
    let e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  };

  let button = el("button", "btn-default btn btn-outline btn-image-ov iv-info-btn");
  button.type = "button";
  button.title = "image details (i)";
  button.appendChild(el("span", "material-icon", "info_outline"));

  let panel = el("div", "iv-panel");
  panel.hidden = true;
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-label", "Image details");

  const isOpen = () => !panel.hidden;

  // EXIF values as text
  const num = (v) => (v == null || v === "" ? NaN : Number(v));
  const round = (v, d) => String(Math.round(v * Math.pow(10, d)) / Math.pow(10, d));
  const camera = (t) => {
    let make = (t.Make || "").trim(), model = (t.Model || "").trim();
    if (!model) return make;
    // "Canon" + "Canon EOS R5": the model says it already
    return make && model.toLowerCase().indexOf(make.split(" ")[0].toLowerCase()) < 0 ? make + " " + model : model;
  };
  const exposure = (t) => {
    let parts = [];
    let ex = num(t.ExposureTime);
    if (ex > 0) parts.push(ex < 1 ? "1/" + Math.round(1 / ex) + " s" : round(ex, 1) + " s");
    let f = num(t.FNumber);
    if (f > 0) parts.push("f/" + round(f, 1));
    let iso = Array.isArray(t.ISOSpeedRatings) ? t.ISOSpeedRatings[0] : t.ISOSpeedRatings;
    if (iso) parts.push("ISO " + iso);
    let bias = num(t.ExposureBias);
    if (bias) parts.push((bias > 0 ? "+" : "") + round(bias, 1) + " EV");
    return parts.join(" · ");
  };
  const focal = (t) => {
    let fl = num(t.FocalLength), f35 = num(t.FocalLengthIn35mmFilm);
    if (!(fl > 0)) return "";
    let s = round(fl, 1) + " mm";
    if (f35 > 0 && Math.round(f35) != Math.round(fl)) s += " (" + Math.round(f35) + " mm in 35 mm terms)";
    return s;
  };
  const taken = (t) => {
    let d = String(t.DateTimeOriginal || t.DateTime || "");
    let m = d.match(/^(\d{4}):(\d\d):(\d\d)[ T](\d\d):(\d\d)/);
    return m ? m[1] + "-" + m[2] + "-" + m[3] + " " + m[4] + ":" + m[5] : "";
  };

  // the panel's content: rows of label and value; the EXIF part once it is known
  function render(tags) {
    panel.textContent = "";
    if (!current) return;
    if (current.fileName) panel.appendChild(el("div", "iv-panel-title", current.fileName));
    let list = el("div", "iv-panel-list");
    let row = (label, value) => {
      if (!value) return;
      list.appendChild(el("div", "iv-panel-label", label));
      let v = el("div", "iv-panel-value");
      if (typeof value == "string") v.textContent = value;
      else v.appendChild(value);
      list.appendChild(v);
    };
    if (tags == null) row("EXIF", "reading...");
    else if (!Object.keys(tags).length) row("EXIF", "none in this image");
    else {
      row("Camera", camera(tags));
      row("Lens", (tags.LensModel || "").trim());
      row("Exposure", exposure(tags));
      row("Focal length", focal(tags));
      row("Taken", taken(tags));
    }
    if (current.name) {
      let who = el(current.postLink ? "a" : "span", null, current.name);
      if (current.postLink) {
        who.href = current.postLink;
        who.addEventListener("click", () => gallery.close());   // (the post, on this page)
      }
      row("Posted by", who);
    }
    row("Image", (current.pos + 1) + " of " + current.total);
    panel.appendChild(list);
  }

  // show the current image's details (EXIF as soon as it is read)
  function update() {
    if (!isOpen() || !current) return;
    let shown = current;
    render(null);
    gallery.exifData(shown.src).then((tags) => { if (shown == current && isOpen()) render(tags || {}); });
  }

  function open() {
    panel.hidden = false;
    button.classList.add("active");
    update();
  }
  function close() {
    panel.hidden = true;
    button.classList.remove("active");
    button.blur();
  }
  const toggle = () => (isOpen() ? close() : open());

  // keys while the viewer is open (not in fields, not over a dialog): "i" opens / closes,
  // Esc closes the panel before the viewer (capture phase: ahead of the viewer's own keys)
  document.addEventListener("keydown", (e) => {
    if (e.altKey || e.ctrlKey || e.metaKey || !gallery) return;
    if (e.key != "i" && !(e.key == "Escape" && isOpen())) return;
    let ov = document.getElementById(gallery.myId);
    if (!ov || ov.style.display == "none") return;
    if (e.target.closest && e.target.closest("input, textarea, select, [contenteditable]")) return;
    if (ov.querySelector(".iv-modal:not([hidden])")) return;
    if (e.key == "Escape") { close(); e.stopImmediatePropagation(); }
    else toggle();
    e.preventDefault();
  }, true);

  // mouse: a click on the image (not a drag of a zoomed one) or on the panel closes it -
  // on the panel not after selecting text, nor on its link
  let down = null;
  const clickClose = (e) => {
    if (!isOpen() || e.button != 0 || !down || Math.hypot(e.clientX - down.x, e.clientY - down.y) > 5) return;
    if (e.target.closest("a, button, .nav, .album, .iv-modal")) return;
    if (panel.contains(e.target) && String(window.getSelection && window.getSelection()).trim()) return;
    close();
  };

  return {
    init: (g) => {
      gallery = g;
      let area = document.querySelector("#" + g.myId + " .lighttable");
      area.addEventListener("mousedown", (e) => { down = {x: e.clientX, y: e.clientY}; }, true);
      area.addEventListener("click", clickClose);
    },
    menuitems: [{element: button, click: toggle, place: "start"}],
    lighttable: [panel],
    changed: (info) => { current = info; update(); },
    closed: () => close(),
    // touch: swipe up opens, swipe down or a tap closes it (before the viewer's own use)
    gesture: (name) => {
      if (name == "up") { if (!isOpen()) open(); return true; }
      if ((name == "down" || name == "tap") && isOpen()) { close(); return true; }
      return false;
    },
  };
}
