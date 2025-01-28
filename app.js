import Stylesheet from "./style.css";

// References to buttons and containers
const rulesBtn = document.getElementById("rules-btn");
const scoringBtn = document.getElementById("scoring-btn");
const rulesContainer = document.getElementById("rules-container");
const scoringContainer = document.getElementById("scoring-container");
const rollBtn = document.getElementById("roll-btn");
const bankBtn = document.getElementById("bank-btn");
const dice = document.querySelectorAll(".die"); // Select all dice elements

// Game state variables
let currentScore = 0;
let roundScore = 0;
let playerScore = 0;
let computerScore = 0;
let heldDice = new Set(); // Track held dice by their index
let allDiceScored = false; // Track if all dice have been scored
let isPlayerTurn = true; // Track whose turn it is

// Function to toggle visibility of a single container
const toggleContainer = container => {
  container.style.display =
    container.style.display === "none" ? "block" : "none";
};

// Add event listeners to buttons
rulesBtn?.addEventListener("click", () => toggleContainer(rulesContainer));
scoringBtn?.addEventListener("click", () => toggleContainer(scoringContainer));

// Function to roll dice with animation
const rollDice = () => {
  if (!isPlayerTurn) return; // Prevent rolling during the computer's turn

  if (heldDice.size === dice.length && allDiceScored) {
    heldDice.clear();
    allDiceScored = false;
    dice.forEach(die => {
      die.classList.remove("held");
      die.style.backgroundColor = ""; // Reset background color
    });
  }

  let rollCount = 0;
  const rollInterval = setInterval(() => {
    dice.forEach((die, index) => {
      if (!heldDice.has(index)) {
        const roll = Math.floor(Math.random() * 6) + 1; // Random number between 1 and 6
        die.textContent = roll; // Display the roll on the die
        die.dataset.value = roll; // Store the roll value
      }
    });

    rollCount++;
    if (rollCount >= 10) {
      // Stop after 10 iterations
      clearInterval(rollInterval);
      evaluateScore();

      if (currentScore === 0) {
        alert(
          "No scoring dice rolled. Your turn is over! You forfeit all accumulated points this turn."
        );
        roundScore = 0;
        endPlayerTurn();
      }
    }
  }, 100); // Short interval for quick animation
};

// Function to evaluate the score based on dice values
const evaluateScore = () => {
  const counts = Array(7).fill(0); // Counts for dice values (1-6)

  dice.forEach(die => {
    const value = parseInt(die.dataset.value, 10);
    if (!isNaN(value)) counts[value]++;
  });

  let score = 0;

  // Scoring rules
  if (counts.slice(1).every(count => count === 1)) score += 1500;
  // Straight (1-6)
  else if (counts.filter(count => count === 2).length === 3) score += 1500;
  // Three sets of doubles
  else {
    for (let i = 1; i <= 6; i++) {
      if (counts[i] >= 3) {
        score += i === 1 ? 1000 : i * 100; // Three of a kind
        if (counts[i] === 4) score += i === 1 ? 2000 : i * 200; // Four of a kind
        if (counts[i] === 5) score += i === 1 ? 3000 : i * 300; // Five of a kind
        if (counts[i] === 6) score += i === 1 ? 4000 : i * 400; // Six of a kind
      }
    }
    score += (counts[1] % 3) * 100; // Single 1s
  }

  currentScore = score;
  roundScore += score; // Add to the round score

  // Check if all dice are used to score
  allDiceScored = dice.every(die => {
    const value = parseInt(die.dataset.value, 10);
    return (
      heldDice.has([...dice].indexOf(die)) || value === 1 || counts[value] >= 3
    );
  });

  updateScores();
};

// Function to update scores in the UI
const updateScores = () => {
  document.getElementById("round-value").textContent = roundScore;
  document.getElementById("player-score").textContent = playerScore;
  document.getElementById("computer-score").textContent = computerScore;
};

// Function to bank the score and reset round
const bankScore = () => {
  if (!isPlayerTurn) return;

  if (roundScore < 1000 && playerScore === 0) {
    alert(
      "You must score at least 1000 points in the first round to continue!"
    );
    resetRound();
    return;
  }

  if (currentScore === 0) {
    alert("No points to bank. Roll again!");
    return;
  }

  playerScore += roundScore;
  roundScore = 0;
  currentScore = 0;
  heldDice.clear();

  dice.forEach(die => {
    die.textContent = "";
    die.classList.remove("held");
    die.style.backgroundColor = "";
  });

  updateScores();

  if (playerScore >= 10000) {
    alert("Congratulations! You win with 10,000 points!");
    resetGame();
  } else {
    endPlayerTurn();
  }
};

// Function to handle end of player's turn
const endPlayerTurn = () => {
  isPlayerTurn = false;
  computerTurn();
};

// Function to handle the computer's turn
const computerTurn = () => {
  // Computer logic goes here (not modified in this cleanup)
  isPlayerTurn = true; // Return turn to player
};

// Add roll button functionality
rollBtn?.addEventListener("click", rollDice);

// Add bank button functionality
bankBtn?.addEventListener("click", bankScore);

// Add event listeners to dice for holding functionality
dice.forEach((die, index) => {
  die.addEventListener("click", () => {
    if (!isPlayerTurn) return;

    if (heldDice.has(index)) {
      heldDice.delete(index);
      die.classList.remove("held");
      die.style.backgroundColor = "";
    } else {
      heldDice.add(index);
      die.classList.add("held");
      die.style.backgroundColor = "#ffa700";
    }

    // Update round score based on held dice
    roundScore = 0;
    heldDice.forEach(heldIndex => {
      const value = parseInt(dice[heldIndex].dataset.value, 10);
      if (value === 1) roundScore += 100;
      else if (value === 5) roundScore += 50;
    });

    updateScores();
  });
});

// Function to reset the game
const resetGame = () => {
  playerScore = 0;
  computerScore = 0;
  roundScore = 0;
  currentScore = 0;
  heldDice.clear();
  updateScores();
};

// Define resetRound function
const resetRound = () => {
  roundScore = 0;
  currentScore = 0;
  heldDice.clear();
  dice.forEach(die => {
    die.textContent = "";
    die.classList.remove("held");
    die.style.backgroundColor = "";
  });
  updateScores();
};
