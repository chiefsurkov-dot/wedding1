(function () {
  const W = window.WEDDING;
  const date = new Date(W.date);
  const $ = (s) => document.querySelector(s);
  const el = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text) n.textContent = text;
    return n;
  };

  const fmt = (d, opts) => d.toLocaleDateString("ru-RU", { timeZone: "Europe/Moscow", ...opts });
  const values = {
    groom: W.groom,
    bride: W.bride,
    greeting: W.greeting,
    invitation: W.invitation,
    dateLong: fmt(date, { weekday: "long", day: "numeric", month: "long", year: "numeric" }),
    dateShort: fmt(date, { day: "numeric", month: "long", year: "numeric" }),
    startTime: date.toLocaleTimeString("ru-RU", { timeZone: "Europe/Moscow", hour: "2-digit", minute: "2-digit" }),
    venueName: W.venue.name,
    venueHall: W.venue.hall,
    venueAddress: W.venue.address,
    dresscodeText: W.dresscode.text,
    rsvpDeadline: fmt(new Date(W.rsvpDeadline), { day: "numeric", month: "long" })
  };
  document.querySelectorAll("[data-bind]").forEach((n) => {
    n.textContent = values[n.dataset.bind] || "";
  });
  document.title = `${W.groom} & ${W.bride} — свадьба`;

  $("#photo").src = W.photo;
  $("#mapLink").href = W.venue.mapUrl;
  $("#siteLink").href = W.venue.siteUrl;
  $("#dressImage").src = W.dresscode.image;
  $("#rsvpFrame").src = W.rsvpForm + "/?iframe=1";
  $("#rsvpLink").href = W.rsvpForm;
  $("#chatLink").href = W.chat.url;
  $("#chatQr").src = W.chat.qr;

  W.program.forEach((p) => {
    const li = el("li");
    li.append(el("time", "", p.time), el("p", "tl-title", p.title));
    $("#timeline").append(li);
  });

  W.venue.notes.forEach((t) => $("#venueNotes").append(el("li", "", t)));
  W.gifts.forEach((t) => $("#giftsList").append(el("li", "", t)));

  W.dresscode.colors.forEach((c) => {
    const li = el("li");
    const sw = el("span", "swatch");
    sw.style.background = c.hex;
    li.append(sw, el("span", "", c.name));
    $("#palette").append(li);
  });

  W.contacts.forEach((c) => {
    const li = el("li");
    const a = el("a", "", c.phone);
    a.href = "tel:" + c.phone.replace(/[^\d+]/g, "");
    li.append(el("p", "card-title", c.name), a);
    $("#contactsList").append(li);
  });

  // Обратный отсчёт
  const cd = {};
  document.querySelectorAll("[data-cd]").forEach((n) => (cd[n.dataset.cd] = n));
  function tick() {
    const diff = Math.max(0, date - Date.now());
    cd.d.textContent = Math.floor(diff / 864e5);
    cd.h.textContent = Math.floor((diff / 36e5) % 24);
    cd.m.textContent = Math.floor((diff / 6e4) % 60);
    if (!diff) $("#countdown").hidden = true;
  }
  tick();
  setInterval(tick, 30000);
})();
