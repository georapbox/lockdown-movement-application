(function () {
  'use strict';

  var hostname = window.location.hostname;
  var isLocalEnv = hostname === '127.0.0.1' || hostname === 'localhost';
  var REPOSITORY = 'lockdown-movement-application'; // Github repository name, also the directory name when hosted as Github page
  var serviceWorkerPath = isLocalEnv ? '/sw.js' : '/' + REPOSITORY + '/sw.js';

  if('serviceWorker' in navigator && !isLocalEnv) {
    navigator.serviceWorker.register(serviceWorkerPath).catch(function (err) {
      console.error(err);
    });
  }

  var SMS_NUMBER = 13033;
  var shareButton = document.getElementById('share-btn');
  var themeSliderEl = document.getElementById('theme-slider');
  var form = document.forms['application-form'];
  var fullNameInput = form.elements['fullName'];
  var addressInput = form.elements['address'];
  var reasonRadios = form.elements['reason'];
  var userAgent = navigator.userAgent || navigator.vendor || window.opera;
  var isAndroid = /android/i.test(userAgent);
  var isIOS = /iPad|iPhone/.test(userAgent);
  var theme = localStorage.getItem('theme') || 'theme-light';

  function setTheme(themeName) {
    theme = themeName;
    document.documentElement.className = themeName;

    try {
      localStorage.setItem('theme', themeName);
    } catch (err) {
      // fail silently
    }
  }

  function toggleTheme() {
    if (theme === 'theme-dark') {
      setTheme('theme-light');
    } else {
      setTheme('theme-dark');
    }
  }

  document.body.classList.add('js');
  document.querySelector('[type="submit"]').disabled = false;

  try {
    fullNameInput.value = localStorage.getItem('fullName');
    addressInput.value = localStorage.getItem('address');
  } catch (err) {
    // fail silently
  }

  form.addEventListener('submit', function onSubmit (evt) {
    evt.preventDefault();

    if (!fullNameInput.value || !addressInput.value || !reasonRadios.value) {
      return alert('Όλα τα πεδία είναι υποχρεωτικά.');
    }

    if (!isAndroid && !isIOS) {
      return alert('Η εφαρμογή δουλεύει μόνο σε κινητά τηλέφωνα Android και iOS.');
    }

    var smsPath = isAndroid ? 'sms:' + SMS_NUMBER + '?body=' : 'sms://' + SMS_NUMBER + '&body=';
    var smsBody = encodeURIComponent(reasonRadios.value + ' ' + fullNameInput.value + ' ' + addressInput.value);
    var link = smsPath + smsBody;
    var anchor = document.createElement('a');

    anchor.href = link;
    anchor.click();
    anchor = null;

    Array.prototype.forEach.call(reasonRadios, function (el) {
      el.checked = false;
    });
  });

  form.addEventListener('change', function onChange (evt) {
    if (evt.srcElement && evt.srcElement.name === 'reason') {
      return;
    }

    try {
      localStorage.setItem('fullName', fullNameInput.value);
      localStorage.setItem('address', addressInput.value);
    } catch (err) {
      // fail silently
    }
  });

  if (navigator.share) {
    shareButton.style.display = 'block';

    shareButton.addEventListener('click', function () {
      navigator.share({
        title: document.title,
        text: document.querySelector('meta[name="description"]').content,
        url: document.location.href
      })
        .then(() => console.log('Successful share'))
        .catch((error) => console.log('Error sharing', error));
    }, false);
  }

  if (window.matchMedia('(prefers-color-scheme: dark)').matches && !localStorage.getItem('theme')) {
    setTheme('theme-dark');
  }

  if (theme === 'theme-dark') {
    setTheme('theme-dark');
    themeSliderEl.checked = true;
  } else {
    setTheme('theme-light');
    themeSliderEl.checked = false;
  }

  themeSliderEl.addEventListener('change', toggleTheme);
}());
