window.notification_timer = 4001.0;

function copy_text_and_notify(text) {
  navigator.clipboard.writeText(text);
  window.notification_timer = 0;
  notification.innerHTML = text + " has been copied!";
}

setInterval(function () {
  if (window.notification_timer > 4000) {
    notification.style.display = "none";
  } else {
    notification.style.display = "block";
    window.notification_timer += 200;
  }
}, 200);
