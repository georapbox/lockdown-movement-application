(function () {
  'use strict';

  var SMS_NUMBER = 13033;
  var form = document.forms['application-form'];
  var fullName = form.elements['fullName'];
  var address = form.elements['address'];
  var reason = form.elements['reason'];
  var userAgent = navigator.userAgent || navigator.vendor || window.opera;
  var isAndroid = /android/i.test(userAgent);
  var isIOS = /iPad|iPhone|iPod/.test(userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

  try {
    fullName.value = localStorage.getItem('fullName');
    address.value = localStorage.getItem('address');
  } catch (err) {
    // fail silently
  }

  form.addEventListener('submit', function onSubmit (evt) {
    evt.preventDefault();

    if (!fullName.value || !address.value || !reason.value) {
      return alert('Όλα τα πεδία είναι υποχρεωτικά.');
    }

    if (!isAndroid && !isIOS) {
      return alert('Η εφαρμογή δουλεύει μόνο σε κινητά τηλέφωνα Android και iOS.');
    }

    var prefix = isAndroid ? '?' : '&';
    var smsPath = 'sms://' + SMS_NUMBER + '/' + prefix + 'body=';
    var smsBody = encodeURIComponent(reason.value + ' ' + fullName.value + ' ' + address.value);
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
      localStorage.setItem('fullName', fullName.value);
      localStorage.setItem('address', address.value);
    } catch (err) {
      // fail silently
    }
  });

  if('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./service-worker.js').catch(function (err) {
      console.error(err);
    });
  }
}());