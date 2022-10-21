const cards = document.querySelectorAll('.memory-card');

let hasFlippedCard = false;
let lockBoard = false;
let firstCard, secondCard;

let config = {
	countScore: 0,
	scorePercent: 0,

    countLevel: 0,
    currentLimit: 1000,

    countdownTimer: "",
    countdownLimitMinutes: 02,
    countdownLimitSeconds: 30,

    currentGift: 0,
    isRunning: 1
}

updateCountdown();

function flipCard() {
  if (lockBoard) return;
  if (this === firstCard) return;

  this.classList.add('flip');

  if (!hasFlippedCard) {
    // first click
    hasFlippedCard = true;
    firstCard = this;

    return;
  }

  // second click
  secondCard = this;

  checkForMatch();
}

function checkForMatch() {
  let isMatch = firstCard.dataset.framework === secondCard.dataset.framework;

  isMatch ? disableCards() : unflipCards();
}

function disableCards() {
  let bonus = 1;
  config.currentGift = 0;
  if (firstCard.dataset.framework == "i_g") {
    firstCard.classList.add("gift");
    secondCard.classList.add("gift");
    bonus = 2;
    createOverflowGift(0);
    if (config.countLevel == 7) {
      config.currentGift = 1;
    }
  }

  firstCard.removeEventListener('click', flipCard);
  secondCard.removeEventListener('click', flipCard);

  updateLevel();
  scoreInc(bonus);

  if (config.countLevel == 8) {
      config.countdownTimer.pause();
    if (config.currentGift == 0) {
      stopGame();
    }
    else {
      createOverflowGift(1);
    }
  }

  resetBoard();
}

function scoreInc ( status ) {
    if ( status == 2 ) {
		count = 250;
	} else if ( status == 1 ) {
		count = 125;
	} else {
	    count = -50;
	}

	config.countScore += count;
	config.scorePercent = config.countScore / config.currentLimit * 100;
	updateScore();
}

function updateScore () {
  document.getElementById('score').style.background = "linear-gradient(to right, #F7CA1A 0%, #F7CA1A " + config.scorePercent + "%, white " + config.scorePercent + "%, white 100%)";
  updateScoreBarLine();
}

function updateScoreBarLine () {
  document.getElementById('scorebar-line').innerHTML = config.countScore + "/" + config.currentLimit;
}

function updateLevel () {
	config.countLevel += 1;
	document.getElementById('level').innerHTML = config.countLevel;
	let cup = document.createElement("div");
	cup.classList.add("level-cup");
	document.getElementById('level').append(cup);
}

function unflipCards() {
  lockBoard = true;

  setTimeout(() => {
    firstCard.classList.remove('flip');
    secondCard.classList.remove('flip');

    resetBoard();
  }, 1500);

  scoreInc(0);
}

function resetBoard() {
  [hasFlippedCard, lockBoard] = [false, false];
  [firstCard, secondCard] = [null, null];
}

(function shuffle() {
  cards.forEach(card => {
    let randomPos = Math.floor(Math.random() * 16);
    card.style.order = randomPos;
  });
})();

cards.forEach(card => card.addEventListener('click', flipCard));

function updateCountdown () {
	document.getElementById('countdown').innerHTML = config.countdownLimitMinutes + ":" + config.countdownLimitSeconds;
	config.countdownTimer = countdownStart(config.countdownLimitSeconds + config.countdownLimitMinutes * 60, 'countdown', stopGame);
}

function countdownStart(seconds, container, oncomplete) {
    var startTime, timer, obj, ms = seconds*1000,
        display = document.getElementById(container);
    obj = {};
    obj.resume = function() {
        startTime = new Date().getTime();
        timer = setInterval(obj.step,250); // adjust this number to affect granularity
                            // lower numbers are more accurate, but more CPU-expensive
    };
    obj.pause = function() {
        ms = obj.step();
        clearInterval(timer);
    };
    obj.step = function() {
        let now = Math.max(0,ms-(new Date().getTime()-startTime)),
            m = Math.floor(now/60000), s = Math.floor(now/1000)%60;
        s = (s < 10 ? "0" : "")+s;
        display.innerHTML = m+":"+s;
        if( now == 0) {
            clearInterval(timer);
            obj.resume = function() {};
            if(oncomplete) oncomplete();
        }
        return now;
    };
    obj.resume();
    return obj;
}

function stopGame() {
  let playCards = document.getElementsByClassName("memory-card");
  for (i = 0; i < playCards.length; i++) {
    document.getElementsByClassName("memory-card")[i].style.pointerEvents = "none";
  }
  createOverflowBlock();
}

function createOverflowBlock() {
  document.getElementById("over-block").style.display = "flex";
  document.getElementById("real-gift").classList.add("hide");
  promoMenu = document.getElementById("menu_b");
  document.getElementById("continue_b").addEventListener('click', reloadGame);
  document.getElementById("score_info").innerHTML = "Ты закончил игру, набрав " + config.countScore + " очков!"
  if (promoMenu.classList.contains("hide")) {
    promoMenu.classList.remove("hide");
  }
}

function reloadGame() {
  location.reload();
  return false;
}

function createOverflowGift(status) {
  config.countdownTimer.pause();
  document.getElementById("over-block").style.display = "flex";
  promoMenu = document.getElementById("menu_g");
  if (status == 0) {
    document.getElementById("continue_g").addEventListener('click', continueGame);
  }
  else {
    document.getElementById("continue_g").addEventListener('click', stopGiftedGame);
  }
  if (promoMenu.classList.contains("hide")) {
    promoMenu.classList.remove("hide");
    document.getElementById("real-gift").classList.remove("hide");
  }
}

function continueGame() {
  document.getElementById("menu_g").classList.add("hide");
  document.getElementById("real-gift").style.animation = "bye 2s linear";
  document.getElementById("over-block").style.display = "none";
  config.countdownTimer.resume();
}

function stopGiftedGame() {
  document.getElementById("menu_g").classList.add("hide");
  document.getElementById("real-gift").classList.add("hide");
  document.getElementById("over-block").style.display = "none";
  stopGame();
}