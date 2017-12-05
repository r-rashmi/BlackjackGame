var bets = new Bets();
//bets object - handles the amount of chips available and the current bet
function Bets() {
  this.totalChips = 500;
  this.pBet = 0;
  $('#pbet').text(0);//initial values on page
  $('#totalchips').text('$' + this.totalChips);
}

//methods for bet object
Bets.prototype.updateAmounts = function() {//updates values on page
  $('#pbet').text('$' + this.pBet);
  $('#totalchips').text('$' + this.totalChips);
};
Bets.prototype.potAmount = function() {//how many chips are left
  return this.totalChips;
};
Bets.prototype.betAmount = function() {//how much was bet
  return this.pBet;
};
Bets.prototype.disableDeal = function() {//disables the deal button 
  $('#dealbtn').addClass('disabled');
};
Bets.prototype.addBet = function(amount) {//making a bet
  if (this.totalChips >= amount) {//if there's enough money
    this.totalChips = this.totalChips - amount; //subtracts bet from chips
    this.pBet = this.pBet + amount; //adds bet to bet amt
    this.updateAmounts(); //updates values
    $('#dealbtn').removeClass('disabled');
  } else {//if there isn't enough money
    pLow();
  }
};
Bets.prototype.winner = function() {//when won
  this.totalChips = this.totalChips + (this.bet * 2);
  this.pBet = 0;
  this.updateAmounts();
  this.disableDeal();
};
Bets.prototype.loser = function() {//when lost
  this.pBet = 0;
  this.updateAmounts();
  this.disableDeal();
};
Bets.prototype.push = function() {
  this.totalChips = this.totalChips + this.pBet;
  this.pBet = 0;
  this.updateAmounts();
  this.disableDeal();
};
Bets.prototype.blackJackWinner = function() {//what happens when someone gets blackjack
  this.totalChips += parseInt(this.pBet * 2.5);
  this.pBet = 0;
  this.updateAmounts();
  this.disableDeal();
};

//card object
function Card(value, suit) {
  this.point = value;
  this.suit = suit;
}

// 
Card.prototype.getImageUrl = function() {
  var cardcolor = this.point;
//linking numerical values with card values
  if (this.point === 1) {
    cardcolor = 'ace';
  }
  if (this.point === 11) {
    cardcolor = 'jack';
  }
  if (this.point === 12) {
    cardcolor = 'queen';
  }
  if (this.point === 13) {
    cardcolor = 'king';
  }
//converts card values into image format, pulling from deck image folder (card faces are cited in sources file)
  return '<img src="deck/' + cardcolor + '_' + this.suit + '.png">';
};



//hand object
function Hand() {
  this.hand = [];
}
//methods for hand object
Hand.prototype.pushCard = function(card) {
  this.hand.push(card);
};//adds a card

Hand.prototype.cardCount = function() {
  return this.hand.length;
};//length of cards in hand
Hand.prototype.instantWin = function() {
  return (this.hand.length === 2 && this.getPoints() === 21);
};//evaluates if dealer or player got blackjack when dealt to

Hand.prototype.getPoints = function() {
  var sumCards;
  var ace;
  var handOrg = this.hand.slice(0).sort(function(a, b) {//organizes the hand
    return b.point - a.point;
  });
  var aceCounter = this.hand.reduce(function(accum, card) {
    if (card.point === 1) {
      ace = 1;
    } else {
      ace = 0;
    }
    return accum + ace;
  }, 0);

  sumCards = handOrg.reduce(function(currentSum, card) {
    var cardValue = card.point;
    if (card.point > 10) {
      cardValue = 10;
    }
    if (card.point === 1) {
      aceCounter--;
      if (currentSum + 11 + aceCounter > 21) {//determination of value of ace cards
        cardValue = 1;
      } else {
        cardValue = 11;
      }
    }
    return currentSum + cardValue;
  }, 0);
  return sumCards;
};
Hand.prototype.firstCard = function() {
  return this.hand[0];
};


//deck object and shuffling

var deck;
var countCards = true;

function Deck() {
  di = 0;//deck counter
  this.deck = [];//deck is an empty array
//shuffles cards by looping over each point value and suit
  for (var points = 1; points < 14; points++) {
    var suits = ['spades', 'hearts', 'clubs', 'diamonds'];
    for (var suit in suits) {
      //adds each point and suit to an array 
      this.deck.push(new Card(points, suits[suit]));
    }
  }
}
var dhand = [];
var pHand = [];
var currentHand;
//drawing a fresh card
Deck.prototype.newCard = function(target) {
  var temCardvar;
 //gets a random number (randInt) between 1 and whatever length the deck currently is
  var randInt = parseInt(Math.random() * (this.deck.length));
//turn randInt into a card
  temCardvar = this.deck[randInt];
  if (temCardvar.point >= 2 && temCardvar.point <= 6) {
    di = di + 1;

  } else if (temCardvar.point === 1 || temCardvar.point > 9) {
    di = di - 1;
  }
  if (target === 'player') {
    pHand.pushCard(temCardvar);//add card to page for player
    cardToPlay = temCardvar.getImageUrl();
    $('#phand').append(cardToPlay);
  } else {
    dhand.pushCard(temCardvar);//add card to page for dealer
    cardToPlay = temCardvar.getImageUrl();
    $('#dhand').append(cardToPlay);
  }
  //get card from random no 
  this.deck.splice(randInt, 1);
  return temCardvar;
};
Deck.prototype.cardsRemaining = function() {//how many cards are left in this deck
  return this.deck.length;
};

//deal function
function deal() {

  // create a fresh deck if there are no cards in the player's hand
  if ($('#phand').children().length === 0) {
    deck = new Deck();
  }
  //refresh deck if card count dips below sixteen
  if (deck.cardsRemaining() <= 16) {
    deck = new Deck();
  }
  //reset hands for dealer and player
  $('#phand').children().remove();
  $('#dhand').children().remove();
  dhand = new Hand();
  pHand = new Hand();

  // deal a four card hand
  deck.newCard('player');
  deck.newCard('dealer');
  $('#dhand :first-child').attr('src', 'img/cardback.png');
  deck.newCard('player');
  deck.newCard('dealer');

  // Update score for player
  newPscore();
  //clear dealer's score 
  $('#dlabel').text('Dealer:');

  // Change message to play, disable deal button and enable other buttons
  $('#dealbtn').addClass('disabled');
  $('#hitbtn').removeClass('disabled');
  $('#standbtn').removeClass('disabled');
  $('.chips div').addClass('disabled');

  if (phand.instantWin) {
    dTurn();
    $('$msg').text("");
  }

}
function hit() {
  //updates player's card count when player draws
  deck.newCard('player');
  newPscore();
  //when player busts
  if (pHand.getPoints() >= 21) {
    $('#hitbtn').addClass('disabled');
    $('#standbtn').addClass('disabled');
    dTurn();
  }
}
// flipping over dealer's hole card, which already exists in the array
function flipHoleCard() {
  var holeCard = dhand.firstCard();
  var cardcolor = holeCard.point;
  if (holeCard.point === 1) {
    cardcolor = 'ace';
  }
  if (holeCard.point === 11) {
    cardcolor = 'jack';
  }
  if (holeCard.point === 12) {
    cardcolor = 'queen';
  }
  if (holeCard.point === 13) {
    cardcolor = 'king';
  }

  var holeCardSrc = 'deck/' + cardcolor + '_' + holeCard.suit + '.png';
  $('#dhand :first-child').attr('src', holeCardSrc);
}

//what happens when it's the dealer's turn
function dTurn() {
  var gameOver = false;
  var revealHoleCard = true;
  var ppoints = pHand.getPoints();
  var dPoints = dhand.getPoints();


  // if player's points > 21 then game is over
  if (ppoints > 21) {
    revealHoleCard = false;
    gameOver = true;
    $('#msg').html('You bust! Click a chip to try again.');
    bets.loser();
  } else {
    flipHoleCard();
  }
  var pinstantWin = pHand.instantWin();
  var dinstantWin = dhand.instantWin();
  if (gameOver === false) {
    //when someone gets blackjack
    if (pinstantWin && dinstantWin) {
      gameOver = true;
      bets.push();
    } else if (pinstantWin) { //if player got blackjack
      gameOver = true;
      $('#msg').html('You got blackjack! Congratulations!');
      bets.blackJackWinner();
    } else if (dinstantWin) { //if dealer got blackjack
      gameOver = true;
      $('#msg').html('Dealer got blackjack. Luck of the draw.');
      bets.loser();
    }
  }
  if (gameOver === false) {
    //loops, dealer draws until d has at least 17 points
    while (dPoints < 17) {
      deck.newCard('dealer');
      dPoints = dhand.getPoints();
    }
    // once dealer has hit at least 17 points, evaluates winner
    if (dPoints < ppoints) {
      $('#msg').html('Player wins! Congratulations!');
      bets.winner();
    } else if (dPoints > 21) {
      $('#msg').html('Hah! Dealer busted!');
      bets.winner();
    } else if (dPoints === ppoints) {
      bets.push();
    } else if (dPoints > ppoints) {
      $('#msg').html('Dealer wins!');
      bets.loser();
    }
  }

  // Disable all buttons until player bets again
  $('#hitbtn').addClass('disabled');
  $('#standbtn').addClass('disabled');
  // enable chips so player can bet
  $('.chips div').removeClass('disabled');
  //update dealer's score when hole card is flipped
  if (revealHoleCard === true) {
    newDscore();
  }
  //if there's less than five dollars in the pot, player is broke
  if (bets.potAmount() <= 5) {
    pBroke();
  }
}



// Change score display
function newPscore() { //for player
  var ppoints = pHand.getPoints();
  $('#plabel').text('Player: ' + ppoints);
}

function newDscore() { //for dealer
  var dPoints = dhand.getPoints();
  $('#dlabel').text('Dealer: ' + dPoints);
}



// used an external library to style alert windows
//alert window functions
function pBroke() {
  swal({
      title: "You're broke!",
      text: "Would you like to play again?",
    },
    function(isConfirm) { //if yes, restarts game
      if (isConfirm) {
        bets = new Bets();
        $('#phand').children().remove();
        $('#dhand').children().remove();
      }
    });
}

function pLow() {
  swal({
    title: "Not enough chips!",
    text: "You don't have enough chips for that bet!",
  });
}

// Document Ready
//initial instructions
$(document).ready(function() {
  $('#msgbubble').show();
  $('#msg').html("Welcome to Blackjack! Click any chip to start betting.");
  //disabling irrelevant buttons when buttons are clicked and triggering functions
  $('#dealbtn').click(deal).addClass('disabled');
  $('#hitbtn').click(hit);
  $('#standbtn').click(dTurn);

  //events when clicking on individual chips to bet
  $('#five').click(function() {
    bets.addBet(5);
    $('#msgbubble').show();
    $('#msg').html("You just bet $5!");
  });
  $('#ten').click(function() {
    bets.addBet(10);
    $('#msgbubble').show();
    $('#msg').html("You just bet $10!");
  });
  $('#fifteen').click(function() {
    bets.addBet(15);
    $('#msgbubble').show();
    $('#msg').html("You just bet $15!");
  });
  $('#fifty').click(function() {
    bets.addBet(50);
    $('#msgbubble').show();
    $('#msg').html("You just bet $50!");
  });
});