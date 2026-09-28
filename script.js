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

  const fmt = (d, opts) => d.toLocaleDateString("ru-RU", opts);
  const values = {
    groom: W.groom,
    bride: W.bride,
    greeting: W.greeting,
    invitation: W.invitation,
    dateLong: fmt(date, { weekday: "long", day: "numeric", month: "long", year: "numeric" }),
    dateShort: fmt(date, { day: "numeric", month: "long", year: "numeric" }),
    startTime: date.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }),
    venueName: W.venue.name,
    venueAddress: W.venue.address,
    venueNote: W.venue.note,
    dresscodeText: W.dresscode.text,
    rsvpDeadline: fmt(new Date(W.rsvpDeadline), { day: "numeric", month: "long" })
  };
  document.querySelectorAll("[data-bind]").forEach((n) => {
    n.textContent = values[n.dataset.bind] || "";
  });
  document.title = `${W.groom} & ${W.bride} — свадьба`;
  $("#mapLink").href = W.venue.mapUrl;

  // Программа
  W.program.forEach((p) => {
    const li = el("li");
    li.append(el("time", "", p.time));
    const body = el("div");
    body.append(el("p", "tl-title", p.title));
    if (p.text) body.append(el("p", "tl-text", p.text));
    li.append(body);
    $("#timeline").append(li);
  });

  // Палитра
  W.dresscode.colors.forEach((c) => {
    const li = el("li");
    const sw = el("span", "swatch");
    sw.style.background = c.hex;
    li.append(sw, el("span", "", c.name));
    $("#palette").append(li);
  });

  W.wishes.forEach((w) => $("#wishesList").append(el("li", "", w)));

  W.drinks.forEach((d) => {
    const l = el("label");
    const i = el("input");
    i.type = "checkbox";
    i.name = "drinks";
    i.value = d;
    l.append(i, el("span", "", d));
    $("#drinks").append(l);
  });

  W.contacts.forEach((c) => {
    const li = el("li");
    li.append(el("p", "card-title", `${c.name}`), el("p", "note", c.role));
    const links = el("div", "contact-links");
    if (c.phone) {
      const a = el("a", "", c.phone);
      a.href = "tel:" + c.phone.replace(/[^\d+]/g, "");
      links.append(a);
    }
    if (c.telegram) {
      const a = el("a", "", "Telegram");
      a.href = "https://t.me/" + c.telegram.replace(/^@/, "");
      a.target = "_blank";
      a.rel = "noopener";
      links.append(a);
    }
    li.append(links);
    $("#contactsList").append(li);
  });
  if (!W.contacts.some((c) => c.phone || c.telegram)) $("#contacts").hidden = true;

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

  // RSVP
  const form = $("#rsvpForm");
  const status = $("#formStatus");
  const toggleAttending = () => {
    const yes = form.attend.value === "Да";
    form.querySelectorAll("[data-when-attending]").forEach((n) => (n.hidden = !yes));
  };
  form.addEventListener("change", toggleAttending);
  toggleAttending();

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!form.name.value.trim()) {
      status.textContent = "Пожалуйста, укажите имя.";
      form.name.focus();
      return;
    }
    const data = {
      name: form.name.value.trim(),
      attend: form.attend.value,
      plusOne: form.attend.value === "Да" ? form.plusOne.value.trim() : "",
      drinks: form.attend.value === "Да"
        ? [...form.querySelectorAll("[name=drinks]:checked")].map((i) => i.value).join(", ")
        : "",
      comment: form.comment.value.trim()
    };

    if (W.rsvp.endpoint) {
      status.textContent = "Отправляем…";
      try {
        const res = await fetch(W.rsvp.endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error(res.status);
        form.reset();
        toggleAttending();
        status.textContent = "Спасибо! Ответ получен.";
      } catch {
        status.textContent = "Не получилось отправить. Попробуйте ещё раз или напишите нам.";
      }
      return;
    }

    const body = [
      `Имя: ${data.name}`,
      `Приду: ${data.attend}`,
      data.plusOne && `Спутник: ${data.plusOne}`,
      data.drinks && `Напитки: ${data.drinks}`,
      data.comment && `Комментарий: ${data.comment}`
    ].filter(Boolean).join("\n");
    location.href = `mailto:${W.rsvp.email}?subject=${encodeURIComponent("Ответ на приглашение")}&body=${encodeURIComponent(body)}`;
    status.textContent = "Откроется почта с готовым ответом — просто отправьте письмо.";
  });
})();
