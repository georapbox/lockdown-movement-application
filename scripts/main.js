(function () {
  'use strict';

  var hostname = window.location.hostname;
  var isLocalEnv = hostname === '127.0.0.1' || hostname === 'localhost';
  var REPOSITORY = 'lockdown-movement-application'; // Github repository name, also the directory name when hosted as Github page
  var serviceWorkerPath = isLocalEnv ? '/sw.js' : '/' + REPOSITORY + '/sw.js';
  var SMS_NUMBER = 13033;
  var shareButton = document.getElementById('share-btn');
  var speechBtn = document.getElementById('speech-btn');
  var themeSliderEl = document.getElementById('theme-slider');
  var form = document.forms['application-form'];
  var fullNameInput = form.elements['fullName'];
  var addressInput = form.elements['address'];
  var reasonRadios = form.elements['reason'];
  var userAgent = navigator.userAgent || navigator.vendor || window.opera;
  var isAndroid = /android/i.test(userAgent);
  var isIOS = /iPad|iPhone/.test(userAgent);
  var theme = localStorage.getItem('theme') || 'theme-light';
  var speechRecognition;

  var logger = {
    info: function () {
      if (!isLocalEnv) return;
      return console.log.apply(void 0, arguments);
    },
    error: function error() {
      if (!isLocalEnv) return;
      return console.error.apply(void 0, arguments);
    }
  };

  if('serviceWorker' in navigator && !isLocalEnv) {
    navigator.serviceWorker.register(serviceWorkerPath).catch(function (err) {
      console.error(err);
    });
  }

  function setTheme(themeName) {
    theme = themeName;
    document.documentElement.className = themeName;

    try {
      localStorage.setItem('theme', themeName);
    } catch (err) {
      // fail silently
      logger.error('Error in setting theme');
    }
  }

  function toggleTheme() {
    if (theme === 'theme-dark') {
      setTheme('theme-light');
    } else {
      setTheme('theme-dark');
    }
  }

  // eslint-disable-next-line no-unused-vars
  function initialiseSpeechRecognition() {
    try {
      speechRecognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
      speechRecognition.lang = 'el';
      speechRecognition.interimResults = false;
      speechRecognition.continuous = false;
      speechRecognition.maxAlternatives = 5;

      speechBtn.parentElement.classList.remove('d-none');

      speechBtn.addEventListener('click', function () {
        try {
          speechRecognition.start();
          speechBtn.classList.add('active');
        } catch (e) {
          logger.error(e);
        }
      });

      speechRecognition.onresult = function onRecognitionResult(evt) {
        console.log(evt);
        var found = false;
        var resultsList = evt.results[0];
        var mapReasonValueToSpeechValues = {
          1: ['αποστολή 1', 'αποστολή ένα', '1 αποστολή', 'ένα αποστολή', 'send 1', 'send one'],
          2: ['αποστολή 2', 'αποστολή δύο', '2 αποστολή', 'δύο αποστολή', 'send 2', 'send two'],
          3: ['αποστολή 3', 'αποστολή τρία', '3 αποστολή', 'τρία αποστολή', 'send 3', 'send three'],
          4: ['αποστολή 4', 'αποστολή τέσσερα', '4 αποστολή', 'τέσσερα αποστολή', 'send 4', 'send four'],
          5: ['αποστολή 5', 'αποστολή πέντε', '5 αποστολή', 'πέντε αποστολή', 'send 5', 'send five'],
          6: ['αποστολή 6', 'αποστολή έξι', '6 αποστολή', 'έξι αποστολή', 'send 6', 'send six']
        };

        for (var i = 0; i < resultsList.length; i++) {
          logger.info(resultsList[i]);

          for (var key = 1; key <= Object.keys(mapReasonValueToSpeechValues).length; key++) {
            if (mapReasonValueToSpeechValues[key].indexOf(resultsList[i].transcript.toLowerCase()) > -1) {
              reasonRadios.value = key;
              document.querySelector('[type="submit"]').click();
              found = true;
              break;
            }
          }

          if (found) {
            break;
          }
        }
      };

      speechRecognition.onend = function onRecognitionEnd() {
        speechBtn.classList.remove('active');
      };
    } catch (err) {
      logger.error('Speech recognition API might not be supported.');
      logger.error(err);
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
      logger.error('Error in saving in localStorage');
    }
  });

  if (navigator.share) {
    shareButton.style.display = 'block';

    shareButton.addEventListener('click', function () {
      navigator.share({
        title: document.title,
        text: document.querySelector('meta[name="description"]').content,
        url: document.location.href
      }).then(function () {
        logger.info('Successful share');
      }).catch(function (err) {
        logger.error('Error sharing', err);
      });
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
