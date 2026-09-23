// EN is the page's own text; PT lives in data-pt / data-alt-pt.
(function () {
  var texts = document.querySelectorAll('[data-pt]');
  var alts = document.querySelectorAll('[data-alt-pt]');
  var buttons = document.querySelectorAll('.lang button');
  var titles = {
    en: document.title,
    pt: 'Thiago Gonçalves: pintura e ilustração'
  };

  for (var i = 0; i < texts.length; i++) texts[i].dataset.en = texts[i].textContent;
  for (var j = 0; j < alts.length; j++) alts[j].dataset.altEn = alts[j].alt;

  function apply(lang) {
    document.documentElement.lang = lang === 'pt' ? 'pt-BR' : 'en';
    document.title = titles[lang];
    for (var i = 0; i < texts.length; i++) texts[i].textContent = texts[i].dataset[lang];
    for (var j = 0; j < alts.length; j++) {
      alts[j].alt = lang === 'pt' ? alts[j].dataset.altPt : alts[j].dataset.altEn;
    }
    for (var k = 0; k < buttons.length; k++) {
      buttons[k].setAttribute('aria-pressed', String(buttons[k].dataset.lang === lang));
    }
  }

  function saved() {
    try { return localStorage.getItem('lang'); } catch (e) { return null; }
  }

  for (var k = 0; k < buttons.length; k++) {
    buttons[k].addEventListener('click', function () {
      var lang = this.dataset.lang;
      apply(lang);
      try { localStorage.setItem('lang', lang); } catch (e) {}
    });
  }

  var param = new URLSearchParams(location.search).get('lang');
  var start = param || saved();
  if (start === 'pt') apply('pt');
})();
