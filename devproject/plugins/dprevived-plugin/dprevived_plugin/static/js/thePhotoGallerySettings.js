/* thePhotoGallery settings: a gear button in the viewer's header opens a dialog over the
   image with the viewer's settings (gallery.settings). Save applies and stores them
   (gallery.applySettings), Cancel, Esc or a click beside the dialog leaves them as they
   were, Defaults fills in the defaults (still to be saved).

   A plugin of thePhotoGallery, registered after the gallery is created:
       gallery.registerPlugin("settings", thePhotoGallerySettings());
   Styles: thePhotoGallerySettings.css (in the viewer's --dp-iv-* colours, so light, dark
   and fullscreen follow).

   The dialog is built from the list of options below: a new setting is one more entry
   there (and its effect in the viewer's applySettings). */
function thePhotoGallerySettings() {
  let gallery = null;
  let controls = [];              // {o: option, get(), set(v), update(values)}

  const modeNames = [["window", "Window"], ["max", "Maximized"], ["full", "Fullscreen"]];

  // group: a heading; type: "select" (choices: list, or a function of the form's values),
  // "range" (min, max, step, format), "checks" (several of choices), "check"; disabled:
  // a function of the form's values; title: tooltip; note: a line of text under the label
  // before it
  const options = () => [
    {group: "Image change"},
    {key: "transition", label: "Transition", type: "select", choices: gallery.transitionList,
     title: "zoomed images use Pop instead of Morph"},
    {key: "duration", label: "Duration", type: "range", min: 0.3, max: 3, step: 0.1,
     format: (v) => v.toFixed(1) + " s", disabled: (f) => f.transition == "quick",
     title: "Quick always takes 0.15 s"},
    {key: "preload", label: "Preload next full-size image", type: "check"},
    {group: "Slideshow"},
    {key: "slideTime", label: "Time per image", type: "range", min: 1, max: 10, step: 0.5,
     format: (v) => (v % 1 ? v.toFixed(1) : v) + " s"},
    {group: "Display"},
    {key: "modes", label: "Modes offered", type: "checks", choices: modeNames,
     title: "the display button steps through them"},
    {key: "openIn", label: "Open in", type: "select",
     choices: (f) => [["last", "Last used"]].concat(modeNames.filter(([k]) => f.modes.indexOf(k) >= 0))},
    {key: "transparency", label: "Background transparency", type: "range", min: 0, max: 0.5, step: 0.05,
     format: (v) => Math.round(v * 100) + " %"},
    {group: "Zoom"},
    {key: "wheel", label: "Mouse wheel", type: "select",
     choices: [["scroll", "Scrolls the zoomed image"], ["zoom", "Zooms (no scrollbars)"]]},
    {note: "Ctrl + wheel always zooms"},
  ];

  const el = (tag, cls, text) => {
    let e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  };

  // the dialog: a dimmed layer over the image area with the panel in the middle
  let box = el("div", "iv-settings iv-modal");
  box.hidden = true;
  let form = el("form", "iv-settings-panel");
  form.setAttribute("role", "dialog");
  form.setAttribute("aria-label", "Viewer settings");
  box.appendChild(form);

  let gear = el("button", "btn-default btn btn-outline btn-image-ov iv-gear");
  gear.type = "button";
  gear.title = "settings";
  gear.appendChild(el("span", "material-icon", "settings"));

  // one select's options (keeps the value when it is still offered, else the first)
  const setChoices = (select, choices) => {
    let v = select.value;
    select.textContent = "";
    choices.forEach(([k, label]) => {
      let opt = el("option", null, label);
      opt.value = k;
      select.appendChild(opt);
    });
    select.value = choices.some(([k]) => k == v) ? v : choices[0][0];
  };

  const makeControl = (o, cell, id) => {
    if (o.type == "select") {
      let s = el("select");
      s.id = id;
      cell.appendChild(s);
      if (typeof o.choices != "function") setChoices(s, o.choices);
      return {get: () => s.value,
              set: (v) => { if (typeof o.choices == "function") setChoices(s, o.choices(values())); s.value = v; },
              update: (f) => { if (typeof o.choices == "function") setChoices(s, o.choices(f)); }};
    }
    if (o.type == "range") {
      let r = el("input");
      r.type = "range";
      r.id = id;
      r.min = o.min; r.max = o.max; r.step = o.step;
      let out = el("output");
      cell.append(r, out);
      // the value beside it, and the thumb's position as --p (the CSS fills the track to it)
      let show = () => {
        let v = parseFloat(r.value);
        out.textContent = o.format ? o.format(v) : r.value;
        r.style.setProperty("--p", ((v - o.min) / (o.max - o.min) * 100) + "%");
      };
      r.addEventListener("input", show);
      return {get: () => parseFloat(r.value),
              set: (v) => { r.value = v; show(); },
              update: (f) => { let off = !!(o.disabled && o.disabled(f)); r.disabled = off; cell.classList.toggle("off", off); }};
    }
    if (o.type == "checks") {
      let boxes = o.choices.map(([k, label]) => {
        let l = el("label", "iv-settings-choice");
        let c = el("input");
        c.type = "checkbox";
        c.value = k;
        // at least one stays checked
        c.addEventListener("change", () => { if (!boxes.some((b) => b.checked)) c.checked = true; });
        l.append(c, document.createTextNode(label));
        cell.appendChild(l);
        return c;
      });
      return {get: () => boxes.filter((b) => b.checked).map((b) => b.value),
              set: (v) => boxes.forEach((b) => { b.checked = v.indexOf(b.value) >= 0; }),
              update: () => {}};
    }
    // "check"
    let c = el("input");
    c.type = "checkbox";
    c.id = id;
    cell.appendChild(c);
    return {get: () => c.checked, set: (v) => { c.checked = !!v; }, update: () => {}};
  };

  const build = () => {
    form.textContent = "";
    controls = [];
    form.appendChild(el("div", "iv-settings-title", "Viewer settings"));
    let grid = el("div", "iv-settings-grid");
    options().forEach((o) => {
      if (o.group) { grid.appendChild(el("div", "iv-settings-group", o.group)); return; }
      if (o.note) { grid.appendChild(el("div", "iv-settings-note", o.note)); return; }
      let id = "iv-set-" + o.key;
      let label = el(o.type == "checks" ? "span" : "label", "iv-settings-label", o.label);
      if (o.type != "checks") label.htmlFor = id;
      let cell = el("div", "iv-settings-ctl");
      if (o.title) { label.title = o.title; cell.title = o.title; }
      let c = makeControl(o, cell, id);
      c.o = o;
      controls.push(c);
      grid.append(label, cell);
    });
    form.appendChild(grid);
    let buttons = el("div", "iv-settings-buttons");
    let defaults = el("button", "iv-defaults", "Defaults");
    let cancel = el("button", "iv-cancel", "Cancel");
    let save = el("button", "iv-save", "Save");
    defaults.type = cancel.type = "button";
    save.type = "submit";
    defaults.addEventListener("click", () => fill(gallery.defaultSettings));
    cancel.addEventListener("click", close);
    buttons.append(defaults, cancel, save);
    form.appendChild(buttons);
    form.addEventListener("input", refresh);
    form.addEventListener("change", refresh);
  };

  // the form's values, as a settings object
  function values() {
    let f = {};
    controls.forEach((c) => { f[c.o.key] = c.get(); });
    return f;
  }
  // controls depending on others (disabled duration, the modes "open in" offers)
  function refresh() {
    let f = values();
    controls.forEach((c) => c.update(f));
  }
  function fill(s) {
    controls.forEach((c) => { if (c.o.type != "select" || typeof c.o.choices != "function") c.set(s[c.o.key]); });
    controls.forEach((c) => { if (c.o.type == "select" && typeof c.o.choices == "function") c.set(s[c.o.key]); });
    refresh();
  }

  function open() {
    fill(gallery.settings);
    box.hidden = false;
    gear.classList.add("active");
    let first = form.querySelector("select, input");
    if (first) first.focus();
  }
  function close() {
    box.hidden = true;
    gear.classList.remove("active");
    gear.blur();
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    gallery.applySettings(values());
    close();
  });
  box.addEventListener("keydown", (e) => {
    if (e.key == "Escape") { e.preventDefault(); e.stopPropagation(); close(); }
    // Enter saves (also on sliders and checkboxes, which do not submit by themselves)
    else if (e.key == "Enter" && ["BUTTON", "SELECT"].indexOf(e.target.tagName) < 0) {
      e.preventDefault();
      form.requestSubmit ? form.requestSubmit() : form.dispatchEvent(new Event("submit", {cancelable: true}));
    }
  });
  // a click beside the panel cancels
  box.addEventListener("mousedown", (e) => { if (e.target == box) close(); });

  return {
    init: (g) => { gallery = g; build(); },
    menuitems: [{element: gear, click: () => (box.hidden ? open() : close())}],
    lighttable: [box],
  };
}
