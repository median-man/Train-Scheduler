// initialize firebase
var config = {
    apiKey: "AIzaSyAxCprBNLeexnqlsV_U50u6Ww59qKbgTLE",
    authDomain: "trains-d07e7.firebaseapp.com",
    databaseURL: "https://trains-d07e7.firebaseio.com",
    projectId: "trains-d07e7",
    storageBucket: "",
    messagingSenderId: "355097569856"
};
firebase.initializeApp(config);

var database = firebase.database();

// render table whenever data changes. on with "child_added" runs callback
// for each child of node when on is first called and any time a child is
// added. each child is an object containing data for one train.
database.ref().on("child_added", function(trainSnap, prevTrainKey) {

	// TODO:
	// finish adding trains and render them
	var myTrain = {

	};
	console.log(trainSnap.val());
});

// get form data and save it to the database whenever user clicks submit
$("#btnSubNewTrain").on("click", function(event) {

	// prevent form from attempting to submit form and reloading the
	// page
	event.preventDefault();


	// get data from the form
	var train = {};
	train.name = $("#txtTrainName").val().trim();
	train.dest = $("#txtDestination").val().trim();
	train.firstTime = $("#txtFirstTrain").val().trim();
	train.freq = $("#txtFrequency").val().trim();

	// reset the form
	$("txtTrainName, #txtDestination, #txtFirstTrain, #txtFrequency").val("");

	// handle form data
	addNewTrain(train);
});

// Adds train to database
function addNewTrain(train) {
	database.ref().push(train);
	console.log(train);
}

