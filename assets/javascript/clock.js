function renderClock() {
  $('#clock').text(moment().format('HH:mm:ss'));
}

$(document).ready(renderClock);
setInterval(renderClock, 1000);
