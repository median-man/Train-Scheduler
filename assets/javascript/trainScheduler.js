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

// Format user input and add to database
function addNewTrain(train) {
  database.ref().push(train);
}

// Function to calculate and format minutes to next train and next train time
function getTimes(tsFirst, frequency) {
  // calculate minutes to next train and next train time
  const mFirstTrain = moment.unix(tsFirst);
  const minElapsed = moment().diff(mFirstTrain, 'minutes');
  const minToNext = frequency - minElapsed % frequency;
  const timeNext = moment().add(minToNext, 'm').format('h:mm A');
  return { minToNext, timeNext };
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
      $($nextTime, $minutes).fadeOut(200, () => {
        $nextTime.text(times.timeNext);
        $minutes.text(times.minToNext);
        $($nextTime, $minutes).fadeIn();
      });
    }    
  });
}

// Appends train to table
function trainAddedToSchedule(train) {
  // get times to display
  const times = getTimes(train.firstTime, train.freq);

  // add row to table
  const $row = $('<tr>')
    // store data for updating displayed times
    .data({ tsFirstTrain: train.firstTime, frequency: train.freq })
    .addClass('train')
    .hide()
    .appendTo('tbody');
  $('<td>').text(train.name).appendTo($row);
  $('<td>').text(train.dest).appendTo($row);
  $('<td>').text(train.freq).appendTo($row);
  $('<td>').text(times.timeNext).appendTo($row);
  $('<td>').text(times.minToNext).appendTo($row);
  $row.fadeIn();
}

$(document).ready(() => {
  // display new trains when added to database
  database.ref().on('child_added', trainSnap => trainAddedToSchedule(trainSnap.val()));

  // update train times every 5 seconds
  setInterval(updateTimes, 5000);

  // get form data and save it to the database whenever user clicks submit
  $('#btnSubNewTrain').on('click', (event) => {
    event.preventDefault();

    // convert time to unix timestamp
    let firstTime = $('#txtFirstTrain').val().trim();
    firstTime = moment(firstTime, 'H:mm').unix();
    
    // get user input and pass it to handler 
    addNewTrain({
      name: $('#txtTrainName').val().trim(),
      dest: $('#txtDestination').val().trim(),
      firstTime,
      freq: parseInt($('#txtFrequency').val().trim()),
    });

    // reset the form
    $('#txtTrainName, #txtDestination, #txtFirstTrain, #txtFrequency').val('');
  });
});

// TODO Bug Fix:
//    Bug where next arrival is inccorrect. Current time was 7:41 AM. Added train with first 
//    time of 7:43 and interval of 10 min. Scheduled a next arrival of 7:52 AM. with minutes away of 11.
//    * round times off to the minute before saving them.
//    * check math for cases where start time falls after current time. (start time - now < interval and start time - now > interval)
