// Veegkaarten met bolletjes eronder op de telefoon (31-10-2026): Zo werkt Novi en Huishouden
// op de homepagina, en de vier blokken op de Privacy-pagina. De bolletjes zeggen waar je bent
// en springen bij een tik naar die kaart. Op de laptop staan de kaarten naast of onder elkaar
// en zijn de bolletjes verborgen (zie .stippen in style.css).
(function () {
  function veegkaarten(rij, kaartje, naam) {
    if (!rij) return;
    var kaarten = Array.prototype.slice.call(rij.querySelectorAll(kaartje));
    var stippen = document.createElement('div');
    stippen.className = 'stippen';
    var knoppen = kaarten.map(function (kaart, i) {
      var knop = document.createElement('button');
      knop.type = 'button';
      knop.setAttribute('aria-label', naam + ' ' + (i + 1));
      knop.addEventListener('click', function () {
        rij.scrollTo({ left: kaart.offsetLeft - kaarten[0].offsetLeft, behavior: 'smooth' });
      });
      stippen.appendChild(knop);
      return knop;
    });
    rij.after(stippen);
    function zet() {
      var breed = kaarten[0].getBoundingClientRect().width + 12;
      var hier = Math.min(kaarten.length - 1, Math.max(0, Math.round(rij.scrollLeft / breed)));
      knoppen.forEach(function (knop, i) {
        knop.setAttribute('aria-current', i === hier ? 'true' : 'false');
      });
    }
    rij.addEventListener('scroll', function () { requestAnimationFrame(zet); }, { passive: true });
    zet();
  }

  // De telefoon bovenaan de homepagina (23-11-2026, Wouter): veeg van Home naar Inzichten,
  // Score, Sparen en Budgetten. Met de vinger en het trackpad doet de browser het zelf
  // (scroll-snap in style.css); met de muis sleep je, en dan springt hij na het loslaten naar
  // het volgende of vorige tabblad. Een tik op een tab gaat er meteen heen. De tab van het
  // tabblad dat in beeld is, licht op.
  function tabbladen(bladen) {
    if (!bladen) return;
    var aantal = bladen.querySelectorAll('.blad').length;
    var tabs = Array.prototype.slice.call(
      bladen.parentNode.querySelectorAll('.tabbalk .tab')
    );
    function binnen(i) {
      return Math.min(aantal - 1, Math.max(0, i));
    }
    function hier() {
      return binnen(Math.round(bladen.scrollLeft / bladen.clientWidth));
    }
    function naar(i) {
      bladen.scrollTo({ left: binnen(i) * bladen.clientWidth, behavior: 'smooth' });
    }
    function zet() {
      var i = hier();
      tabs.forEach(function (tab, j) {
        tab.classList.toggle('aan', j === i);
      });
      stippen.forEach(function (stip, j) {
        stip.classList.toggle('aan', j === i);
      });
    }
    bladen.addEventListener('scroll', function () { requestAnimationFrame(zet); }, { passive: true });
    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () { naar(i); });
    });
    // De bolletjes onder de telefoon (24-11-2026): één per tabblad, en een klik gaat erheen.
    var stippen = [];
    var plek = document.querySelector('.veegwijzer .schermstippen');
    if (plek) {
      for (var k = 0; k < aantal; k++) {
        var stip = document.createElement('span');
        stip.addEventListener('click', naar.bind(null, k));
        plek.appendChild(stip);
        stippen.push(stip);
      }
    }

    var sleep = null;
    bladen.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      e.preventDefault();
      // De telefoon is verkleind (zoom in style.css): een muisbeweging is in het scherm
      // groter, anders loopt het tabblad achter de muis aan.
      var breed = bladen.getBoundingClientRect().width;
      sleep = {
        x: e.clientX,
        links: bladen.scrollLeft,
        van: hier(),
        schaal: breed > 0 ? bladen.clientWidth / breed : 1,
      };
      bladen.classList.add('slepen');
      bladen.setPointerCapture(e.pointerId);
    });
    bladen.addEventListener('pointermove', function (e) {
      if (!sleep) return;
      bladen.scrollLeft = sleep.links - (e.clientX - sleep.x) * sleep.schaal;
    });
    function los(e) {
      if (!sleep) return;
      var verschoven = e.clientX - sleep.x;
      var doel = sleep.van + (verschoven < -30 ? 1 : verschoven > 30 ? -1 : 0);
      sleep = null;
      bladen.classList.remove('slepen');
      naar(doel);
    }
    bladen.addEventListener('pointerup', los);
    bladen.addEventListener('pointercancel', los);
    zet();
  }

  tabbladen(document.querySelector('.telefoon .bladen'));
  veegkaarten(document.querySelector('#hoe .stappen'), '.stap', 'Stap');
  veegkaarten(document.querySelector('#samen .samen-raster'), '.zij', 'Kaart');
  veegkaarten(document.querySelector('.privacy-punten .blokken'), '.blok', 'Kaart');
})();
