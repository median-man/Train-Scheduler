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

const database = firebase.database();

// render table whenever data changes. on with "child_added" runs callback
// for each child of node when on is first called and any time a child is
// added. each child is an object containing data for one train.
database.ref().on('child_added', (trainSnap, prevTrainKey) => {
  // notify train added
  trainAddedToSchedule(trainSnap.toJSON());
});


// Adds train to database
function addNewTrain(train) {
  // convert first train time into a mommentjs object
  train.firstTime = moment(train.firstTime, 'H:mm').unix();

  // convert frequency to an integer
  train.freq = parseInt(train.freq);

  // add train to the database
  database.ref().push(train);
}

// Appends train to table
function trainAddedToSchedule(train) {
  const mNow = moment();

  // moment for first train time
  const mFirstTrain = moment.unix(train.firstTime);

  // time since first train
  const minElapsed = moment().diff(mFirstTrain, 'minutes');

  // time until next train
  const minToNext = train.freq - minElapsed % train.freq;

  // time of next train
  const timeNext = moment().add(minToNext, 'm').format('h:mm A');

  // create a new row
  const row = $('<tr>');

  // add data to the row
  $('<td>').text(train.name).appendTo(row);
  $('<td>').text(train.dest).appendTo(row);
  $('<td>').text(train.freq).appendTo(row);
  $('<td>').text(timeNext).appendTo(row);
  $('<td>').text(minToNext).appendTo(row);

  // append the row
  $('tbody').append(row);
}

$(document).ready(() => {
  // get form data and save it to the database whenever user clicks submit
  $('#btnSubNewTrain').on('click', (event) => {
    // prevent form from attempting to submit form and reloading the
    // page
    event.preventDefault();

    // get data from the form
    const train = {};
    train.name = $('#txtTrainName').val().trim();
    train.dest = $('#txtDestination').val().trim();
    train.firstTime = $('#txtFirstTrain').val().trim();
    train.freq = $('#txtFrequency').val().trim();

    // reset the form
    $('txtTrainName, #txtDestination, #txtFirstTrain, #txtFrequency').val('');

    // handle form data
    addNewTrain(train);
  });
});
