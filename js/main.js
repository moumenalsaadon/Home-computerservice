/* ==========================================================
   HOME Computerservice — interacties
   - Mobiel menu (hamburger)
   - 3D parallax-achtergrond (muis + gyroscoop)
   - 3D tilt-effect op kaarten
   - Probleemkiezer → formulier voorinvullen
   - Formulieren → Supabase (database) + WhatsApp / e-mail
   - Actueel jaartal in footer
   ========================================================== */

(function () {
  "use strict";

  var WA_NUMMER = "31611357449";
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(pointer: fine)").matches;

  /* ========================================================
     1) Mobiel menu
     ======================================================== */
  var toggle = document.getElementById("menuToggle");
  var nav = document.getElementById("nav");

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
    });

    nav.addEventListener("click", function (event) {
      if (event.target.closest("a")) {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && nav.classList.contains("is-open")) {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.focus();
      }
    });
  }

  /* ========================================================
     2) 3D parallax-achtergrond
        Elke laag met data-depth beweegt in z'n eigen tempo:
        zo ontstaat echte diepte (3D-effect).
     ======================================================== */
  var lagen = Array.prototype.slice.call(document.querySelectorAll("[data-depth]"));

  if (lagen.length && !reducedMotion) {
    var targetX = 0, targetY = 0, currentX = 0, currentY = 0, rafId = null;

    function render() {
      // Lerp → vloeiende, dromerige beweging i.p.v. schokkerig
      currentX += (targetX - currentX) * 0.06;
      currentY += (targetY - currentY) * 0.06;

      lagen.forEach(function (laag) {
        var diepte = parseFloat(laag.getAttribute("data-depth")) || 0.2;
        var x = (-currentX * diepte * 60).toFixed(2);
        var y = (-currentY * diepte * 60).toFixed(2);
        laag.style.setProperty("--px", x + "px");
        laag.style.setProperty("--py", y + "px");
        laag.style.transform = "translate3d(" + x + "px," + y + "px,0)";
      });

      if (Math.abs(targetX - currentX) > 0.001 || Math.abs(targetY - currentY) > 0.001) {
        rafId = requestAnimationFrame(render);
      } else {
        rafId = null;
      }
    }

    function startRender() {
      if (!rafId) rafId = requestAnimationFrame(render);
    }

    // Desktop: muis
    if (finePointer) {
      window.addEventListener("mousemove", function (event) {
        targetX = event.clientX / window.innerWidth - 0.5;   // -0.5 … 0.5
        targetY = event.clientY / window.innerHeight - 0.5;
        startRender();
      }, { passive: true });
    }

    // Mobiel: gyroscoop (iOS ≥ 13 vraagt toestemming bij eerste tik)
    function koppelGyroscoop() {
      window.addEventListener("deviceorientation", function (event) {
        if (event.gamma == null) return;
        targetX = Math.max(-0.5, Math.min(0.5, event.gamma / 45));   // links-rechts
        targetY = Math.max(-0.5, Math.min(0.5, (event.beta - 45) / 45)); // omhoog-omlaag
        startRender();
      }, { passive: true });
    }

    if (window.DeviceOrientationEvent) {
      if (typeof DeviceOrientationEvent.requestPermission === "function") {
        document.body.addEventListener("touchend", function eenmalig() {
          DeviceOrientationEvent.requestPermission().then(function (status) {
            if (status === "granted") koppelGyroscoop();
          }).catch(function () { /* stil falen = geen probleem */ });
          document.body.removeEventListener("touchend", eenmalig);
        });
      } else {
        koppelGyroscoop();
      }
    }
  }

  /* ========================================================
     3) 3D tilt: kaarten kantelen mee met de muis
     ======================================================== */
  var tiltKaarten = document.querySelectorAll(".service-card, .tip-card, .review-card, .problem-grid a, .steps-grid li");

  if (finePointer && !reducedMotion) {
    tiltKaarten.forEach(function (kaart) {
      kaart.classList.add("tilt");

      kaart.addEventListener("mousemove", function (event) {
        var rect = kaart.getBoundingClientRect();
        var x = (event.clientX - rect.left) / rect.width - 0.5;   // -0.5 … 0.5
        var y = (event.clientY - rect.top) / rect.height - 0.5;
        kaart.classList.add("is-tilting");
        kaart.style.transform =
          "perspective(700px) rotateX(" + (-y * 8).toFixed(2) + "deg)" +
          " rotateY(" + (x * 10).toFixed(2) + "deg) translateY(-4px) scale(1.015)";
      }, { passive: true });

      kaart.addEventListener("mouseleave", function () {
        kaart.classList.remove("is-tilting");
        kaart.style.transform = "";
      });
    });
  }

  /* ========================================================
     4) Probleemkiezer → vult het terugbelformulier in
     ======================================================== */
  var vraagVeld = document.getElementById("f-vraag");

  document.querySelectorAll("[data-onderwerp]").forEach(function (tegel) {
    tegel.addEventListener("click", function () {
      if (vraagVeld && !vraagVeld.value.trim()) {
        vraagVeld.value = "Onderwerp: " + tegel.getAttribute("data-onderwerp") + " — ";
        setTimeout(function () {
          vraagVeld.focus();
          vraagVeld.setSelectionRange(vraagVeld.value.length, vraagVeld.value.length);
        }, 600);
      }
    });
  });

  /* ========================================================
     5) Formulieren: validatie + Supabase + WhatsApp/e-mail
     ======================================================== */

  function valideer(form) {
    var geldig = true;
    form.querySelectorAll("[required]").forEach(function (veld) {
      var field = veld.closest(".field");
      var error = field ? field.querySelector(".field__error") : null;
      var leeg = !veld.value.trim();
      var telOngeldig =
        veld.type === "tel" && !leeg && !/^[+\d][\d\s()-]{7,}$/.test(veld.value.trim());

      if (leeg || telOngeldig) {
        geldig = false;
        if (field) field.classList.add("is-invalid");
        if (error) error.hidden = false;
      } else {
        if (field) field.classList.remove("is-invalid");
        if (error) error.hidden = true;
      }
    });
    return geldig;
  }

  function waLink(tekst) {
    return "https://wa.me/" + WA_NUMMER + "?text=" + encodeURIComponent(tekst);
  }

  function mailLink(onderwerp, tekst) {
    return (
      "mailto:info@homecomputerservice.nl?subject=" +
      encodeURIComponent(onderwerp) +
      "&body=" +
      encodeURIComponent(tekst)
    );
  }

  /* ---------- Supabase: aanvraag opslaan in de database ----------
     Werkt zodra js/supabase-config.js is ingevuld.
     Zie docs/03-database-en-supabase.md voor de uitleg.     */
  function supabaseIngesteld() {
    return (
      window.HOME_SUPABASE &&
      window.HOME_SUPABASE.URL.indexOf("JOUW-PROJECT-ID") === -1 &&
      window.HOME_SUPABASE.ANON_KEY.indexOf("JOUW-ANON") === -1
    );
  }

  function slaOpInDatabase(gegevens) {
    if (!supabaseIngesteld()) return Promise.resolve("uit"); // niet ingesteld → overslaan

    return fetch(window.HOME_SUPABASE.URL + "/rest/v1/aanvragen", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: window.HOME_SUPABASE.ANON_KEY,
        Authorization: "Bearer " + window.HOME_SUPABASE.ANON_KEY,
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        naam: gegevens.naam,
        telefoon: gegevens.telefoon,
        vraag: gegevens.vraag,
        bron: gegevens.bron || "website",
      }),
    })
      .then(function (antwoord) { return antwoord.ok ? "opgeslagen" : "mislukt"; })
      .catch(function () { return "mislukt"; });
  }

  function statusRegel(successBlok, status) {
    // Kleine melding in het succesblok: waar de aanvraag terechtkwam
    var regel = successBlok.querySelector(".db-status");
    if (!regel) {
      regel = document.createElement("p");
      regel.className = "db-status";
      successBlok.appendChild(regel);
    }
    if (status === "opgeslagen") {
      regel.textContent = "✓ Uw aanvraag is ook opgeslagen in ons systeem.";
    } else {
      regel.textContent = "";
    }
  }

  function verwerkFormulier(form, velden, successId, whatsappId, mailId) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      if (!valideer(form)) return;

      var naam = document.getElementById(velden.naam).value.trim();
      var tel = document.getElementById(velden.tel).value.trim();
      var vraag = document.getElementById(velden.vraag).value.trim();

      var bericht =
        "Hallo Homam, via de website van HOME Computerservice.\n\nNaam: " + naam +
        "\nTelefoon: " + tel +
        "\nVraag: " + vraag;

      // 1) Opslaan in de database (op de achtergrond)
      var successBlok = document.getElementById(successId);
      slaOpInDatabase({ naam: naam, telefoon: tel, vraag: vraag, bron: successId }).then(
        function (status) { if (successBlok) statusRegel(successBlok, status); }
      );

      // 2) Direct contact: WhatsApp openen met het bericht klaargezet
      window.open(waLink(bericht), "_blank", "noopener");

      // 3) Succesblok tonen met WhatsApp (+ e-mail) als zichtbare opties
      document.getElementById(whatsappId).href = waLink(bericht);
      if (mailId) {
        document.getElementById(mailId).href = mailLink("Aanvraag website — " + naam, bericht);
      }
      if (successBlok) successBlok.hidden = false;
    });
  }

  var callbackForm = document.getElementById("callbackForm");
  if (callbackForm) {
    verwerkFormulier(
      callbackForm,
      { naam: "f-naam", tel: "f-tel", vraag: "f-vraag" },
      "formSuccess", "sendWhatsApp", "sendMail"
    );
  }

  var contactForm = document.getElementById("contactForm");
  if (contactForm) {
    verwerkFormulier(
      contactForm,
      { naam: "c-naam", tel: "c-tel", vraag: "c-vraag" },
      "contactSuccess", "contactWhatsApp", null
    );
  }

  /* ========================================================
     6) Jaartal
     ======================================================== */
  var jaar = document.getElementById("year");
  if (jaar) jaar.textContent = String(new Date().getFullYear());
})();
