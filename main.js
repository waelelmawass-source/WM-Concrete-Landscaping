(() => {
  "use strict";
  const S = window.SITE || {};
  const CATS = window.CATEGORIES || [];
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const catByFolder = Object.fromEntries(CATS.map(c => [c.folder, c]));
  const waNumber = String(S.whatsapp || "").replace(/\D/g, "");
  const waLink = text => `https://wa.me/${waNumber}?text=${encodeURIComponent(text)}`;
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* ---------- Fill in business details ---------- */
  $$("[data-bind]").forEach(el => {
    const v = S[el.dataset.bind];
    if (v) el.textContent = v; else if (el.dataset.bind === "abn") el.remove();
  });
  $$("[data-link]").forEach(el => {
    const k = el.dataset.link;
    if (k === "phone") el.href = "tel:" + String(S.phone || "").replace(/[^\d+]/g, "");
    else if (k === "email") el.href = "mailto:" + S.email;
    else if (k === "whatsapp") { el.href = waLink(S.whatsappMessage || "Hi! "); el.target = "_blank"; el.rel = "noopener"; }
    else if (S[k]) { el.href = S[k]; el.hidden = false; el.target = "_blank"; el.rel = "noopener"; }
  });
  if (S.businessName) document.title = `${S.businessName} | Concreting & Landscaping`;
  $("#year").textContent = new Date().getFullYear();

  /* ---------- Mobile nav ---------- */
  const toggle = $("#navToggle");
  const setNav = open => { document.body.classList.toggle("nav-open", open); toggle.setAttribute("aria-expanded", open); };
  toggle.addEventListener("click", () => setNav(!document.body.classList.contains("nav-open")));
  $$("#nav a").forEach(a => a.addEventListener("click", () => setNav(false)));

  /* ---------- Services + quote service picker ---------- */
  ["landscaping", "concrete"].forEach(group => {
    const list = $("#services-" + group);
    const picks = $("#svcPicks");
    picks.insertAdjacentHTML("beforeend", `<span class="svc-group-label">${group === "concrete" ? "Concrete" : "Landscaping"}</span>`);
    CATS.filter(c => c.group === group).forEach(c => {
      list.insertAdjacentHTML("beforeend",
        `<article class="service-card"><h4>${esc(c.title)}</h4><a href="#work" data-show-cat="${c.folder}">See photos →</a><p>${esc(c.desc)}</p></article>`);
      picks.insertAdjacentHTML("beforeend",
        `<label class="svc-pick"><input type="checkbox" value="${esc(c.title)}"><span>${esc(c.title)}</span></label>`);
    });
  });
  $("#svcPicks").insertAdjacentHTML("beforeend",
    `<span class="svc-group-label">Other</span><label class="svc-pick"><input type="checkbox" value="Something else"><span>Something else</span></label>`);

  /* ---------- Gallery ---------- */
  const galleryEl = $("#gallery"), emptyEl = $("#galleryEmpty"), catFilters = $("#catFilters");
  let photos = [], shown = [], filter = "all";

  fetch("gallery.json", { cache: "no-cache" })
    .then(r => (r.ok ? r.json() : []))
    .catch(() => [])
    .then(data => { photos = Array.isArray(data) ? data : []; renderGallery(); });

  function matches(p, f) {
    if (f === "all") return true;
    if (f.startsWith("group:")) return catByFolder[p.category]?.group === f.slice(6);
    return p.category === f;
  }

  function renderCatChips() {
    const group = filter.startsWith("group:") ? filter.slice(6) : (catByFolder[filter]?.group || null);
    const cats = CATS.filter(c => (!group || c.group === group) && photos.some(p => p.category === c.folder));
    catFilters.innerHTML = cats.length > 1
      ? cats.map(c => `<button class="chip${filter === c.folder ? " is-active" : ""}" data-filter="${c.folder}">${esc(c.title)}</button>`).join("")
      : "";
  }

  function renderGallery() {
    $$("#groupFilters .chip").forEach(b => {
      const f = b.dataset.filter;
      b.classList.toggle("is-active", f === filter || (f.startsWith("group:") && catByFolder[filter]?.group === f.slice(6)));
    });
    renderCatChips();
    shown = photos.filter(p => matches(p, filter));
    emptyEl.hidden = shown.length > 0;
    if (!shown.length && photos.length) {
      emptyEl.querySelector("p strong").textContent = "No photos in this category yet.";
    }
    galleryEl.innerHTML = shown.map((p, i) => {
      const label = p.caption || catByFolder[p.category]?.title || "";
      return `<button class="g-item" data-i="${i}" aria-label="View ${esc(label)}">
        <img src="${esc(p.thumb)}" alt="${esc(label)}" loading="lazy" decoding="async">
        ${label ? `<span>${esc(label)}</span>` : ""}</button>`;
    }).join("");
  }

  document.addEventListener("click", e => {
    const f = e.target.closest("[data-filter]");
    if (f) { filter = f.dataset.filter; renderGallery(); return; }
    const sc = e.target.closest("[data-show-cat]");
    if (sc) { filter = photos.some(p => p.category === sc.dataset.showCat) ? sc.dataset.showCat : "group:" + catByFolder[sc.dataset.showCat].group; renderGallery(); }
  });

  /* Lightbox */
  const lb = $("#lightbox"), lbImg = $("#lbImg"), lbCap = $("#lbCap");
  let lbIndex = 0;
  const openLb = i => {
    lbIndex = (i + shown.length) % shown.length;
    const p = shown[lbIndex];
    lbImg.src = p.full; lbImg.alt = p.caption || "";
    lbCap.textContent = [p.caption, catByFolder[p.category]?.title].filter(Boolean).filter((v, i, a) => a.indexOf(v) === i).join(" · ");
    lb.hidden = false; document.body.style.overflow = "hidden";
  };
  const closeLb = () => { lb.hidden = true; document.body.style.overflow = ""; lbImg.src = ""; };
  galleryEl.addEventListener("click", e => { const b = e.target.closest(".g-item"); if (b) openLb(+b.dataset.i); });
  $("#lbClose").onclick = closeLb;
  $("#lbPrev").onclick = () => openLb(lbIndex - 1);
  $("#lbNext").onclick = () => openLb(lbIndex + 1);
  lb.addEventListener("click", e => { if (e.target === lb) closeLb(); });
  document.addEventListener("keydown", e => {
    if (lb.hidden) return;
    if (e.key === "Escape") closeLb();
    if (e.key === "ArrowLeft") openLb(lbIndex - 1);
    if (e.key === "ArrowRight") openLb(lbIndex + 1);
  });
  let touchX = null;
  lb.addEventListener("touchstart", e => { touchX = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener("touchend", e => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX; touchX = null;
    if (Math.abs(dx) > 50) openLb(lbIndex + (dx < 0 ? 1 : -1));
  });

  /* ---------- Image helper: shrink photos before upload ---------- */
  async function compress(file, max = 1600, quality = 0.82) {
    const url = URL.createObjectURL(file);
    try {
      const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = url; });
      const scale = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
      const c = document.createElement("canvas");
      c.width = Math.round(img.naturalWidth * scale);
      c.height = Math.round(img.naturalHeight * scale);
      const ctx = c.getContext("2d");
      ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, c.width, c.height);
      ctx.drawImage(img, 0, 0, c.width, c.height);
      return await new Promise(res => c.toBlob(res, "image/jpeg", quality));
    } finally { URL.revokeObjectURL(url); }
  }
  const blobToBase64 = blob => new Promise(res => {
    const r = new FileReader(); r.onload = () => res(String(r.result).split(",")[1]); r.readAsDataURL(blob);
  });

  /* ---------- AI visualiser ---------- */
  const vizFile = $("#vizFile"), vizPreview = $("#vizPreview"), vizPrompt = $("#vizPrompt");
  const vizBtn = $("#vizBtn"), vizStatus = $("#vizStatus"), vizDrop = $("#vizDrop");
  const vizBefore = $("#vizBefore"), vizAfter = $("#vizAfter");
  let vizBlob = null, vizResultBlob = null;

  vizFile.addEventListener("change", async () => {
    const f = vizFile.files[0]; if (!f) return;
    try {
      vizBlob = await compress(f, 1280, 0.85);
      const u = URL.createObjectURL(vizBlob);
      vizPreview.src = u; vizBefore.src = u;
      vizPreview.hidden = false; $("#vizDropText").hidden = true;
      setVizStatus("");
    } catch { setVizStatus("Sorry, we couldn't read that photo. Try a JPG or PNG.", true); }
  });
  ["dragenter", "dragover"].forEach(ev => vizDrop.addEventListener(ev, e => { e.preventDefault(); vizDrop.classList.add("is-drag"); }));
  ["dragleave", "drop"].forEach(ev => vizDrop.addEventListener(ev, () => vizDrop.classList.remove("is-drag")));
  vizDrop.addEventListener("drop", e => {
    e.preventDefault();
    if (e.dataTransfer.files.length) { vizFile.files = e.dataTransfer.files; vizFile.dispatchEvent(new Event("change")); }
  });

  $("#vizIdeas").addEventListener("click", e => {
    const b = e.target.closest(".idea"); if (!b) return;
    const t = vizPrompt.value.trim();
    vizPrompt.value = t ? `${t.replace(/[.,]$/, "")}, ${b.textContent.toLowerCase()}` : b.textContent;
    vizPrompt.focus();
  });

  function setVizStatus(msg, err = false) { vizStatus.textContent = msg; vizStatus.classList.toggle("is-error", err); }
  function showViz(which) {
    vizAfter.hidden = which !== "after"; vizBefore.hidden = which !== "before";
    $$("#vizTabs .chip").forEach(b => b.classList.toggle("is-active", b.dataset.show === which));
  }
  $("#vizTabs").addEventListener("click", e => { const b = e.target.closest("[data-show]"); if (b) showViz(b.dataset.show); });

  $("#vizForm").addEventListener("submit", async e => {
    e.preventDefault();
    if (!vizBlob) return setVizStatus("Please upload a photo first.", true);
    const prompt = vizPrompt.value.trim();
    if (prompt.length < 5) return setVizStatus("Please describe what you'd like it to look like.", true);

    vizBtn.disabled = true; setVizStatus("");
    $("#vizLoading").hidden = false; $("#vizPlaceholder").hidden = true;
    try {
      const res = await fetch("/api/visualise", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ image: await blobToBase64(vizBlob), mimeType: "image/jpeg", prompt })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.image) throw new Error(data.error || "The AI visualiser isn't available right now.");
      const bin = Uint8Array.from(atob(data.image), c => c.charCodeAt(0));
      vizResultBlob = new Blob([bin], { type: data.mimeType || "image/png" });
      const u = URL.createObjectURL(vizResultBlob);
      vizAfter.src = u; $("#vizDownload").href = u;
      $("#vizTabs").hidden = false; $("#vizActions").hidden = false;
      showViz("after");
      setVizStatus("Done! Tap 'Original' to compare.");
    } catch (err) {
      $("#vizPlaceholder").hidden = !vizAfter.hidden;
      setVizStatus(err.message || "Something went wrong, please try again.", true);
    } finally {
      vizBtn.disabled = false; $("#vizLoading").hidden = true;
    }
  });

  $("#vizQuote").addEventListener("click", () => {
    const d = $("#qDesc");
    if (!d.value.includes(vizPrompt.value.trim())) {
      d.value = `${d.value ? d.value + "\n\n" : ""}From the AI visualiser: ${vizPrompt.value.trim()}`;
    }
    const add = [];
    if (vizBlob) add.push({ blob: vizBlob, name: "original.jpg" });
    if (vizResultBlob) add.push({ blob: vizResultBlob, name: "ai-concept.png" });
    add.forEach(a => { if (quotePhotos.length < MAX_PHOTOS) quotePhotos.push(a); });
    renderThumbs();
    $("#quote").scrollIntoView({ behavior: "smooth" });
  });

  /* ---------- Quote form ---------- */
  const MAX_PHOTOS = 4;
  const form = $("#quoteForm"), thumbs = $("#qThumbs"), qError = $("#qError");
  let quotePhotos = [];

  $("#qPhotoPicker").addEventListener("change", async e => {
    const files = [...e.target.files];
    e.target.value = "";
    for (const f of files) {
      if (quotePhotos.length >= MAX_PHOTOS) { showError(`You can attach up to ${MAX_PHOTOS} photos. Send more on WhatsApp after submitting.`); break; }
      try { quotePhotos.push({ blob: await compress(f), name: f.name.replace(/\.\w+$/, "") + ".jpg" }); }
      catch { showError(`Couldn't read "${f.name}". Please use a JPG or PNG photo.`); }
    }
    renderThumbs();
  });

  function renderThumbs() {
    thumbs.innerHTML = "";
    quotePhotos.forEach((p, i) => {
      const d = document.createElement("div"); d.className = "thumb";
      const img = document.createElement("img"); img.src = URL.createObjectURL(p.blob); img.alt = "";
      const x = document.createElement("button"); x.type = "button"; x.textContent = "×"; x.setAttribute("aria-label", "Remove photo");
      x.onclick = () => { quotePhotos.splice(i, 1); renderThumbs(); };
      d.append(img, x); thumbs.append(d);
    });
  }

  function showError(msg) { qError.textContent = msg; qError.hidden = !msg; }

  form.addEventListener("submit", async e => {
    e.preventDefault();
    showError("");
    $$(".is-invalid", form).forEach(el => el.classList.remove("is-invalid"));

    const services = $$("#svcPicks input:checked").map(i => i.value);
    $("#qServices").value = services.join(", ");

    const need = ["#qDesc", "#qName", "#qSuburb"].map(s => $(s)).filter(el => !el.value.trim());
    const phone = $("#qPhone"), email = $("#qEmail");
    const problems = [];
    if (need.length) { need.forEach(el => el.classList.add("is-invalid")); problems.push("please fill in the required fields"); }
    if (!phone.value.trim() && !email.value.trim()) { phone.classList.add("is-invalid"); email.classList.add("is-invalid"); problems.push("add a phone number or email"); }
    else if (email.value.trim() && !/^\S+@\S+\.\S+$/.test(email.value.trim())) { email.classList.add("is-invalid"); problems.push("check your email address"); }
    if (problems.length) {
      showError("Almost there: " + problems.join(" and ") + ".");
      $(".is-invalid", form)?.focus();
      return;
    }

    const btn = $("#qSubmit"); btn.disabled = true; btn.textContent = "Sending…";
    try {
      const fd = new FormData(form);
      for (let i = 1; i <= MAX_PHOTOS; i++) fd.delete("photo" + i);
      quotePhotos.forEach((p, i) => fd.append("photo" + (i + 1), p.blob, p.name));
      const res = await fetch("/", { method: "POST", body: fd });
      if (!res.ok) throw new Error();

      const summary = `Hi, I just sent a quote request on your website.\nName: ${fd.get("name")}\nSuburb: ${fd.get("suburb")}\nJob: ${services.join(", ") || "see description"}`;
      $("#successWa").href = waLink(summary);
      form.hidden = true; $("#quoteSuccess").hidden = false;
      $("#quoteSuccess").scrollIntoView({ behavior: "smooth", block: "center" });
    } catch {
      showError("Sorry, your request couldn't be sent. Please try again, or contact us on WhatsApp or by phone.");
    } finally {
      btn.disabled = false; btn.textContent = "Send quote request";
    }
  });
})();
