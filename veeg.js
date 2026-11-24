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

  // De telefoon bovenaan de homepagina (23-11-2026, Wouter): van Home naar Inzichten, Score,
  // Sparen en Budgetten. Sinds 24-11-2026 schuift er niets meer (Wouter: in Novi schiet het
  // gewoon naar het nieuwe tabblad). Er staat één tabblad in beeld. Een veeg met de vinger,
  // met twee vingers op het trackpad of slepen met de muis springt naar het volgende of
  // vorige; een tik op een tab of een bolletje gaat er meteen heen. De tab en het bolletje
  // van het tabblad dat in beeld is, lichten op.
  function tabbladen(bladen) {
    if (!bladen) return;
    var bladenLijst = Array.prototype.slice.call(bladen.querySelectorAll('.blad'));
    var aantal = bladenLijst.length;
    var tabs = Array.prototype.slice.call(
      bladen.parentNode.querySelectorAll('.tabbalk .tab')
    );
    var stippen = [];
    var nu = 0;
    function naar(i) {
      nu = Math.min(aantal - 1, Math.max(0, i));
      bladenLijst.forEach(function (blad, j) {
        blad.hidden = j !== nu;
      });
      tabs.forEach(function (tab, j) {
        tab.classList.toggle('aan', j === nu);
      });
      stippen.forEach(function (stip, j) {
        stip.classList.toggle('aan', j === nu);
      });
    }
    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () { naar(i); });
    });
    // De bolletjes onder de telefoon (24-11-2026): één per tabblad, en een klik gaat erheen.
    var plek = document.querySelector('.veegwijzer .schermstippen');
    if (plek) {
      for (var k = 0; k < aantal; k++) {
        var stip = document.createElement('span');
        stip.addEventListener('click', naar.bind(null, k));
        plek.appendChild(stip);
        stippen.push(stip);
      }
    }

    // Vinger en muis: meer dan 30 px opzij, en meer opzij dan omhoog. Omhoog en omlaag blijft
    // gewoon de pagina scrollen (touch-action: pan-y in style.css); dan breekt de browser
    // het gebaar af en gebeurt hier niets.
    var begin = null;
    bladen.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'mouse') {
        if (e.button !== 0) return;
        e.preventDefault();
        bladen.setPointerCapture(e.pointerId);
      }
      begin = { x: e.clientX, y: e.clientY };
    });
    bladen.addEventListener('pointerup', function (e) {
      if (!begin) return;
      var opzij = e.clientX - begin.x;
      var omhoog = e.clientY - begin.y;
      begin = null;
      if (Math.abs(opzij) > 30 && Math.abs(opzij) > Math.abs(omhoog)) naar(nu + (opzij < 0 ? 1 : -1));
    });
    bladen.addEventListener('pointercancel', function () {
      begin = null;
    });

    // Het trackpad: één veeg opzij is één sprong. Na een sprong lopen er nog een tel
    // gebeurtenissen na (de uitloop van macOS); die tellen niet, tot het even stil is.
    var opgeteld = 0;
    var laatste = 0;
    var rustTot = 0;
    bladen.addEventListener(
      'wheel',
      function (e) {
        if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
        e.preventDefault();
        var tijd = performance.now();
        if (tijd - laatste > 250) opgeteld = 0;
        laatste = tijd;
        if (tijd < rustTot) {
          rustTot = tijd + 250;
          return;
        }
        opgeteld += e.deltaX;
        if (Math.abs(opgeteld) > 40) {
          naar(nu + (opgeteld > 0 ? 1 : -1));
          opgeteld = 0;
          rustTot = tijd + 250;
        }
      },
      { passive: false }
    );
    naar(0);
  }

  tabbladen(document.querySelector('.telefoon .bladen'));
  veegkaarten(document.querySelector('#hoe .stappen'), '.stap', 'Stap');
  veegkaarten(document.querySelector('#samen .samen-raster'), '.zij', 'Kaart');
  veegkaarten(document.querySelector('.privacy-punten .blokken'), '.blok', 'Kaart');
})();
