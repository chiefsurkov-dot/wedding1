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

  const TZ = "Europe/Moscow";
  const fmt = (d, opts) => d.toLocaleDateString("ru-RU", { timeZone: TZ, ...opts });
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  // Именительный падеж: «август», а не «августа»
  const monthName = cap(
    new Intl.DateTimeFormat("ru-RU", { timeZone: TZ, month: "long", year: "numeric" })
      .format(date).replace(/\s*\d{4}.*$/, "")
  );

  const values = {
    groom: W.groom,
    bride: W.bride,
    greeting: W.greeting,
    invitation: W.invitation,
    month: monthName,
    day: fmt(date, { day: "2-digit" }),
    year: fmt(date, { year: "numeric" }),
    monthYear: `${monthName} ${fmt(date, { year: "numeric" })}`,
    dateShort: fmt(date, { day: "numeric", month: "long", year: "numeric" }).replace(/\s*г\.$/, ""),
    dateDots: fmt(date, { day: "2-digit", month: "2-digit", year: "numeric" }),
    startTime: date.toLocaleTimeString("ru-RU", { timeZone: TZ, hour: "2-digit", minute: "2-digit" }),
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

  // Календарь месяца свадьбы, неделя с понедельника
  const [y, m, d] = fmt(date, { year: "numeric", month: "2-digit", day: "2-digit" })
    .split(".").reverse().map(Number);
  const first = (new Date(Date.UTC(y, m - 1, 1)).getUTCDay() + 6) % 7;
  const days = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const cal = $("#calendar");
  for (let i = 0; i < first; i++) cal.append(el("li", "empty"));
  for (let i = 1; i <= days; i++) {
    const li = el("li", "", String(i));
    if (i === d) {
      li.className = "wed";
      li.innerHTML = `<svg aria-hidden="true"><use href="#heart"/></svg><span>${i}</span>`;
      li.setAttribute("aria-label", `${i} — день свадьбы`);
    }
    cal.append(li);
  }

  // Программа
  W.program.forEach((p) => {
    const li = el("li", "reveal");
    li.append(el("time", "", p.time), el("p", "tl-title", p.title));
    $("#timeline").append(li);
  });

  const iconCard = (item, cls) => {
    const li = el("li", cls + " reveal");
    li.append(el("span", "icon", item.icon));
    if (item.title) li.append(el("p", "card-title", item.title));
    li.append(el("p", "", item.text));
    return li;
  };
  W.venue.notes.forEach((n) => $("#venueNotes").append(iconCard(n, "note")));
  W.gifts.forEach((g) => $("#giftsList").append(iconCard(g, "gift")));

  W.dresscode.colors.forEach((c) => {
    const li = el("li");
    const sw = el("span", "swatch");
    sw.style.setProperty("--c", c.hex);
    li.append(sw, el("span", "", c.name));
    $("#palette").append(li);
  });

  W.contacts.forEach((c) => {
    const li = el("li", "reveal");
    const a = el("a", "", c.phone);
    a.href = "tel:" + c.phone.replace(/[^\d+]/g, "");
    li.append(el("p", "contact-name", c.name), a);
    $("#contactsList").append(li);
  });

  // Появление при прокрутке
  const items = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add("in");
        io.unobserve(e.target);
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    items.forEach((n) => {
      const sibs = [...n.parentElement.children].filter((c) => c.classList.contains("reveal"));
      n.style.setProperty("--delay", `${Math.min(sibs.indexOf(n), 5) * 90}ms`);
      io.observe(n);
    });
  } else {
    items.forEach((n) => n.classList.add("in"));
  }

  // Обратный отсчёт
  const cd = {};
  document.querySelectorAll("[data-cd]").forEach((n) => (cd[n.dataset.cd] = n));
  const pad = (n) => String(n).padStart(2, "0");
  let timer;
  function tick() {
    const diff = Math.max(0, date - Date.now());
    cd.d.textContent = Math.floor(diff / 864e5);
    cd.h.textContent = pad(Math.floor((diff / 36e5) % 24));
    cd.m.textContent = pad(Math.floor((diff / 6e4) % 60));
    cd.s.textContent = pad(Math.floor((diff / 1e3) % 60));
    if (!diff) {
      $("#countdown").hidden = true;
      clearInterval(timer);
    }
  }
  tick();
  timer = setInterval(tick, 1000);
})();
