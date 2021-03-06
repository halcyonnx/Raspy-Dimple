angular.module('App')
  .controller('question_playerCtrl', function($scope, $state, $interval, $timeout, fireBaseFactory) {
    var game = fireBaseFactory.getGame();
    var playerKey = fireBaseFactory.getPlayerKey();

    // This freezes the player on their current view
    // after they've submitted their answer.
    // Changes to true on submit and display a
    // "WAITING FOR OTHER PLAYERS TO VOTE" div.
    $scope.holdView = false;

    game.$loaded()
      .then(function(data) {
        $scope.question = data.questions[data.currentRound];
        // get current round
        $scope.currentRound = data.currentRound;
        fireBaseFactory.getTimeLeft().$bindTo($scope,'timeLeft');
      });

    // Setting up an interval to poll Firebase and see if
    // we can automatically change views yet.
    // Store interval promise so that we can destroy it once we're done.
    var intPlayerQuestionPromise = $interval(function() {
      $scope.curView = fireBaseFactory.getCurrentView();
      //if ($scope.curView === 'voting'){
      if ($scope.curView !== 'question'){
        $scope.submitPlayerAnswer();
        $interval.cancel(intPlayerQuestionPromise); // Destroy our interval, now that we no longer need it.
        $state.go('voting_player');
      }
    },250,0);

    $scope.submitPlayerAnswer = function(answer) {
      $scope.holdView = true;
      
      var ref = new Firebase('https://exposeyourself.firebaseio.com/games/' + game.$id);
      if ($scope.answer !== undefined){
        answer = $scope.answer;
        ref.child('answers').child(playerKey).update({
          playerKey: playerKey,
          response: answer,
          votes: 0
        });
      }
    };
  });