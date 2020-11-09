(function () {
  'use strict';

  var SMS_NUMBER = 13033;
  var form = document.forms['application-form'];
  var fullName = form.elements['fullName'];
  var address = form.elements['address'];
  var reason = form.elements['reason'];
  var send = document.getElementById('send');
  var userAgent = navigator.userAgent || navigator.vendor || window.opera;
  var isAndroid = userAgent.match(/Android/i);
  var isIOS = userAgent.match(/iPad/i) || userAgent.match(/iPhone/i) || userAgent.match(/iPod/i);

  function debounce(func, wait, immediate) {
    var timerId = null;

    if (typeof func !== 'function') {
      throw new TypeError('Expected a function for first argument');
    }

    return function debounced() {
      var context = this;
      var args = arguments;
      clearTimeout(timerId);

      if (immediate && !timerId) {
        func.apply(context, args);
      }

      timerId = setTimeout(function () {
        timerId = null;
        if (!immediate) func.apply(context, args);
      }, wait);
    };
  }

  function onInput(evt) {
    console.log(evt);
    try {
      localStorage.setItem('fullName', fullName.value);
      localStorage.setItem('address', address.value);
    } catch (err) {
      // fail silently
    }

    var smsPath = (function () {
      if (isAndroid) {
        return 'sms://' + SMS_NUMBER + '/?body=';
      } else if (isIOS) {
        return 'sms://' + SMS_NUMBER + '/&body=';
      } else {
        return '';
      }
    }());

    if (!smsPath) {
      return;
    }

    var smsBody = encodeURIComponent(reason.value + ' ' + fullName.value + ' ' + address.value);
    var link = smsPath + smsBody;

    send.href = link;
  }

  var onInputDebounced = debounce(onInput, 250);

  try {
    fullName.value = localStorage.getItem('fullName');
    address.value = localStorage.getItem('address');
  } catch (err) {
    // fail silently
  }

  form.addEventListener('input', onInputDebounced);

  send.addEventListener('click', function (evt) {
    if (!fullName.value || !address.value || !reason.value) {
      evt.preventDefault();
      return alert('Όλα τα πεδία είναι υποχρεωτικά.');
    }
  });

  if('serviceWorker' in navigator) {
    navigator.serviceWorker.register('../service-worker.js').catch(function (err) {
      console.error(err);
    });
  }
}());