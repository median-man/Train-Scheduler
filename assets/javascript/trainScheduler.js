// initialize firebase
const config = {
  apiKey: 'AIzaSyAxCprBNLeexnqlsV_U50u6Ww59qKbgTLE',
  authDomain: 'trains-d07e7.firebaseapp.com',
  databaseURL: 'https://trains-d07e7.firebaseio.com',
  projectId: 'trains-d07e7',
  storageBucket: '',
  messagingSenderId: '355097569856',
};
firebase.initializeApp(config);

// globals
const database = firebase.database();
const firstTrainTooltipOpts = {
  animation: true,
  title: 'First scheduled train.',
  placement: 'auto',
  container: 'body',
};

// Format user input and add to database
function addNewTrain(train) {
  database.ref().push(train);
}

// Function to calculate and format minutes to next train and next train time
function getTimes(tsFirst, frequency) {
  // calculate minutes to next train and next train time
  const mNow = moment();
  const mFirstTrain = moment.unix(tsFirst);
  const minElapsed = mNow.diff(mFirstTrain, 'minutes');
  let minToNext = frequency - (minElapsed % frequency);
  let timeNext = mNow.add(minToNext, 'm');
  const isFirst = mNow.isBefore(mFirstTrain, 'minute');
  if (isFirst) {
    timeNext = mFirstTrain;
    minToNext = -minElapsed;
  }
  timeNext = timeNext.format('h:mm A');
  return { minToNext, timeNext, isFirst };
}

// Function to update train times for every row from data stored in element
function updateTimes() {
  $('.train').each(function updateRow() {
    const $row = $(this);

    // calculate times from data
    const trainData = $row.data();
    const $nextTime = $row.children().eq(3);
    const $minutes = $row.children().eq(4);
    const times = getTimes(trainData.tsFirstTrain, trainData.frequency);

    // update text with fade in/out if value changed
    if ($nextTime.text() !== times.timeNext) {
      $nextTime.fadeOut(200, () => {
        if (times.isFirst) {
          $nextTime.addClass('first-train').tooltip(firstTrainTooltipOpts);
        } else {
          $nextTime.removeClass('first-train').tooltip('destroy');
        }
        $nextTime.text(times.timeNext).fadeIn();
      });
    }
    if (parseInt($minutes.text(), 10) !== times.minToNext) {
      $minutes.fadeOut(200, () => {
        $minutes.text(times.minToNext).fadeIn();
      });
    }
  });
}

// Appends train to table
function trainAddedToSchedule(trainData, key) {
  const train = trainData;

  // convert time to time stamp
  train.firstTime = moment(train.firstTime, 'H:mm').unix();

  // get times to display
  const times = getTimes(train.firstTime, train.freq);

  // add row to table and store train data with the row
  const $row = $('<tr>', {
    id: key,
    css: { display: 'none' },
    class: 'train',
  })
    .data({ tsFirstTrain: train.firstTime, frequency: train.freq })
    .appendTo('tbody');
  $('<td>').text(train.name).appendTo($row);
  $('<td>').text(train.dest).appendTo($row);
  $('<td>').text(train.freq).appendTo($row);
  if (times.isFirst) {
    $('<td>')
      .text(times.timeNext)
      .appendTo($row)
      .addClass('first-train')
      .tooltip(firstTrainTooltipOpts);
  } else {
    $('<td>').text(times.timeNext).appendTo($row);
  }

  $('<td>').text(times.minToNext).appendTo($row);
  $('<td>').append('<span class="glyphicon glyphicon-remove pointer" aria-hidden="true"></span>').appendTo($row);
  $row.fadeIn('slow');
}

// Function to remove a row from the train table.
function trainRemoved(key) {
  $(`#${key}`).fadeOut('slow', () => $(`#${key}`).remove());
}

// Remove train from database when remove icon is clicked.
$(document).on('click', '.glyphicon-remove', function handleRemoveClick() {
  // the id of the containing row is the key for the database record
  const key = $(this).parents('tr').attr('id');
  database.ref(key).remove();
});

$(document).ready(() => {
  // display new trains when added to database
  database.ref().on('child_added', trainSnap => trainAddedToSchedule(trainSnap.val(), trainSnap.key));

  // remove train from display if train remove from database
  database.ref().on('child_removed', trainSnap => trainRemoved(trainSnap.key));

  // update train times every 5 seconds
  setInterval(updateTimes, 5000);

  // get form data and save it to the database whenever user clicks submit
  $('#btnSubNewTrain').on('click', (event) => {
    event.preventDefault();

    // get user input and pass it to handler
    addNewTrain({
      name: $('#txtTrainName').val().trim(),
      dest: $('#txtDestination').val().trim(),
      firstTime: $('#txtFirstTrain').val().trim(),
      freq: parseInt($('#txtFrequency').val().trim(), 10),
    });

    // reset the form
    $('#txtTrainName, #txtDestination, #txtFirstTrain, #txtFrequency').val('');
  });
});
