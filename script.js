window.addEventListener('DOMContentLoaded', function () {

    function getValidName(playerLabel) {
        let name;
        while (true) {
            name = prompt(`Enter ${playerLabel}'s name:`);
            if (!name || name.trim() === '') {
                alert(`${playerLabel}'s name cannot be empty. Using default name.`);
                return playerLabel;
            }
            name = name.trim();
            if (name.length > 10) {
                alert(`${playerLabel}'s name is too long. Please enter again.`);
                continue;
            }
            if (name.length < 3) {
                alert(`${playerLabel}'s name is too short. Please enter again.`);
                continue;
            }
            return name;
        }
    }
    let a = getValidName("Player 1");

    let playerHand = document.getElementById("player-hand");
    let computerHand = document.getElementById("computer-hand");

    let startbtn = document.getElementById("start-button");
    let onerunbtn = document.getElementById("1-button");
    let tworunbtn = document.getElementById("2-button");
    let threerunbtn = document.getElementById("3-button");
    let fourrunbtn = document.getElementById("4-button");
    let fiverunbtn = document.getElementById("5-button");
    let sixrunbtn = document.getElementById("6-button");

    let tossMsg = document.getElementById("toss-msg");

    let tossbtn = document.getElementById("toss-button");
    let headbtn = document.getElementById("heads");
    let tailbtn = document.getElementById("tails");

    let resetBtn = document.getElementById("reset-button");

    let playerScore = document.getElementById("player-score");
    let computerScore = document.getElementById("computer-score");

    let runsLeft = document.getElementById("runs-left");
    let wicketsLeft = document.getElementById("wickets-left");
    let oversLeft = document.getElementById("overs-left");

    let tossResult = document.getElementById("toss-status");
    let inningsInfo = document.getElementById("innings-info");
    let targetScore = document.getElementById("targetscore");

    let selectWkts = document.getElementById("wickets");
    let selectOvers = document.getElementById("overs");

    let batBowlContainer = document.getElementById("toss-decision");
    let batBtn = batBowlContainer.querySelector(".bat-bowl-btn:nth-child(1)");
    let bowlBtn = batBowlContainer.querySelector(".bat-bowl-btn:nth-child(2)");

    let images = {
        runHands: {
            1: "assets/1-fing.png",
            2: "assets/2-fing.png",
            3: "assets/3-fing.png",
            4: "assets/4-fing.png",
            5: "assets/5-fing.png",
            6: "assets/6-fing.png"
        },
        staticHands: {
            playerHand: "assets/statichand.png",
            computerHand: "assets/statichandREV.png"
        }
    };

    let gameStarted = false;
    let tossChoices = ["heads", "tails"];

    let playerScoreVal = 0;
    let computerScoreVal = 0;
    let runsToWinVal = 0;
    let wicketsLeftVal = 0;
    let oversLeftVal = 0;
    let ballsLeftInCurrentOver = 6;

    let firstInnings = true;
    let targetVal = 0;

    let playerBatting = false;

    // Adaptive AI state (when player is batting)
    let recentPicks = [];
    let lastPickVal = null;
    let repeatStreak = 0;

    function disablebtns() {
        onerunbtn.disabled = true;
        tworunbtn.disabled = true;
        threerunbtn.disabled = true;
        fourrunbtn.disabled = true;
        fiverunbtn.disabled = true;
        sixrunbtn.disabled = true;
        resetBtn.disabled = false;
    }

    function enablebtns() {
        onerunbtn.disabled = false;
        tworunbtn.disabled = false;
        threerunbtn.disabled = false;
        fourrunbtn.disabled = false;
        fiverunbtn.disabled = false;
        sixrunbtn.disabled = false;
        resetBtn.disabled = false;
    }

    disablebtns();

    startbtn.addEventListener("click", function () {
        if (!firstInnings) {
            tossMsg.textContent = "2nd Innings Started!";
            enablebtns();
            startbtn.disabled = true;
            return;
        }

        tossMsg.textContent = "Game Started! Choose Heads or Tails";
        gameStarted = true;
        tossbtn.style.display = "flex";
        disablebtns();

        wicketsLeftVal = parseInt(selectWkts.value);
        oversLeftVal = parseInt(selectOvers.value);
        ballsLeftInCurrentOver = 6;

        playerScoreVal = 0;
        computerScoreVal = 0;
        playerScore.textContent = 0;
        computerScore.textContent = 0;

        wicketsLeft.textContent = wicketsLeftVal;
        oversLeft.textContent = `${oversLeftVal}.0`;
        tossResult.textContent = "Toss Status : N/A";
        inningsInfo.textContent = "Innings Info : N/A";
        targetScore.textContent = `${a} VS Computer`;
        runsLeft.textContent = "N/A";
    });


    function handleToss(choice) {
        let computerChoice = tossChoices[Math.floor(Math.random() * 2)];

        if (choice === computerChoice) {
            tossMsg.textContent = `${a} won the Toss! Choose Bat or Bowl.`;
            tossResult.textContent = `${a} won the Toss`;
            tossbtn.style.display = "none";
            batBowlContainer.style.display = "flex";
            startbtn.disabled = true;
        } else {
            tossMsg.textContent = "Computer won the Toss!";
            tossResult.textContent = "Computer won the Toss";
            tossbtn.style.display = "none";
            startbtn.disabled = true;

            setTimeout(() => {
                let compDecision = Math.random() < 0.5 ? "Batting" : "Bowling";
                tossMsg.textContent = `Computer chose ${compDecision}.`;
                inningsInfo.textContent = `Computer : ${compDecision}`;
                playerBatting = (compDecision === "Bowling");
                enablebtns();
            }, 2000);
        }
    }

    headbtn.addEventListener("click", () => handleToss("heads"));
    tailbtn.addEventListener("click", () => handleToss("tails"));

    batBtn.addEventListener("click", () => {
        tossMsg.textContent = `${a} chose to Bat first.`;
        tossResult.textContent = `${a} won the Toss`;
        inningsInfo.textContent = `${a} : Batting`;
        batBowlContainer.style.display = "none";
        playerBatting = true; // ✅ player bats
        enablebtns();
    });

    bowlBtn.addEventListener("click", () => {
        tossMsg.textContent = `${a} chose to Bowl first.`;
        tossResult.textContent = `${a} : won the Toss`;
        inningsInfo.textContent = `${a} : Bowling`;
        batBowlContainer.style.display = "none";
        playerBatting = false; // ✅ computer bats
        enablebtns();
    });

    function playRun(playerRun) {
        disablebtns();
        let computerRun;

        if (playerBatting) {
            // ✅ weighted AI when player bats
            repeatStreak = (lastPickVal === playerRun) ? repeatStreak + 1 : 1;
            lastPickVal = playerRun;
            const WINDOW = 8;
            recentPicks.push(playerRun);
            if (recentPicks.length > WINDOW) recentPicks.shift();
            const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
            for (const v of recentPicks) counts[v]++;
            const runs = [1, 2, 3, 4, 5, 6];
            const BASE = 1.0, ALPHA = 0.6, BETA = 0.9;
            const weights = runs.map(r => BASE + (ALPHA * counts[r]) + ((r === playerRun) ? (BETA * repeatStreak) : 0));
            let total = 0, cumulative = [];
            for (let i = 0; i < weights.length; i++) { total += weights[i]; cumulative.push(total); }
            const rand = Math.random() * total;
            for (let i = 0; i < cumulative.length; i++) { if (rand < cumulative[i]) { computerRun = runs[i]; break; } }
            if (!computerRun) computerRun = 6;
        } else {

            computerRun = Math.floor(Math.random() * 6) + 1;
        }

        playerHand.src = images.runHands[playerRun];
        computerHand.src = images.runHands[computerRun];

        if (playerBatting) {
            if (playerRun === computerRun) tossMsg.textContent = `${a} is OUT!`;
            else tossMsg.textContent = `${a} played ${playerRun} run(s)!`;
        } else {
            if (playerRun === computerRun) tossMsg.textContent = `Computer is OUT!`;
            else tossMsg.textContent = `Computer played ${computerRun} run(s)!`;
        }

        setTimeout(() => {
            playerHand.src = images.staticHands.playerHand;
            computerHand.src = images.staticHands.computerHand;

            if (playerBatting) {
                if (playerRun === computerRun) {
                    wicketsLeftVal--;
                    wicketsLeft.textContent = wicketsLeftVal;
                    if (wicketsLeftVal <= 0) return endInnings();
                } else {
                    playerScoreVal += playerRun;
                    playerScore.textContent = playerScoreVal;
                }
                if (!firstInnings) {
                    if (playerScoreVal < targetVal) {
                        runsLeft.textContent = `${targetVal - playerScoreVal}`;
                    }
                    if (playerScoreVal >= targetVal) {
                        tossMsg.textContent = ` 😄 ${a} wins the match! 😄`;
                        runsLeft.textContent = "0";
                        disablebtns();
                        return;
                    }
                }
            } else {
                if (playerRun === computerRun) {
                    wicketsLeftVal--;
                    wicketsLeft.textContent = wicketsLeftVal;
                    if (wicketsLeftVal <= 0) return endInnings();
                } else {
                    computerScoreVal += computerRun;
                    computerScore.textContent = computerScoreVal;
                }
                if (!firstInnings) {
                    if (computerScoreVal < targetVal) {
                        runsLeft.textContent = `${targetVal - computerScoreVal}`;
                    }
                    if (computerScoreVal >= targetVal) {
                        tossMsg.textContent = " 😢 Computer wins the match! 😢";
                        runsLeft.textContent = "0";
                        disablebtns();
                        return;
                    }
                }
            }

            ballsLeftInCurrentOver--;
            if (ballsLeftInCurrentOver > 0) oversLeft.textContent = `${oversLeftVal - 1}.${ballsLeftInCurrentOver}`;
            else {
                oversLeftVal--; ballsLeftInCurrentOver = 6;
                oversLeft.textContent = `${oversLeftVal}.0`;
            }

            if (oversLeftVal <= 0 && ballsLeftInCurrentOver === 6) endInnings();
            enablebtns();
        }, 1500);
    }

    onerunbtn.addEventListener("click", () => playRun(1));
    tworunbtn.addEventListener("click", () => playRun(2));
    threerunbtn.addEventListener("click", () => playRun(3));
    fourrunbtn.addEventListener("click", () => playRun(4));
    fiverunbtn.addEventListener("click", () => playRun(5));
    sixrunbtn.addEventListener("click", () => playRun(6));

    function endInnings() {
        disablebtns();
        if (firstInnings) {
            tossMsg.textContent = "1st Innings Ended! Click Start to begin 2nd Innings.";
            firstInnings = false;
            targetVal = playerBatting ? (playerScoreVal + 1) : (computerScoreVal + 1);
            runsLeft.textContent = `${targetVal}`;
            inningsInfo.textContent = playerBatting ? "Computer : Batting" : `${a} : Batting`;
            playerBatting = !playerBatting;
            wicketsLeftVal = parseInt(selectWkts.value);
            oversLeftVal = parseInt(selectOvers.value);
            ballsLeftInCurrentOver = 6;
            wicketsLeft.textContent = wicketsLeftVal;
            oversLeft.textContent = `${oversLeftVal}.0`;
            startbtn.disabled = false;
        } else {
            // ✅ Final result
            if (playerScoreVal === computerScoreVal) {
                tossMsg.textContent = "🤝 It's a tie! 🤝";
            } else if (playerBatting) {
                if (playerScoreVal >= targetVal) {
                    tossMsg.textContent = ` 😄 ${a} wins the match! 😄`;
                } else {
                    tossMsg.textContent = " 😢 Computer wins the match! 😢";
                }
            } else {
                if (computerScoreVal >= targetVal) {
                    tossMsg.textContent = " 😢 Computer wins the match! 😢";
                } else {
                    tossMsg.textContent = ` 😄 ${a} wins the match! 😄`;
                }
            }
        }
    }

    function resetGame() {
        playerScoreVal = 0;
        computerScoreVal = 0;
        wicketsLeftVal = parseInt(selectWkts.value);
        oversLeftVal = parseInt(selectOvers.value);
        ballsLeftInCurrentOver = 6;
        firstInnings = true;
        targetVal = 0;
        playerBatting = false;

        playerScore.textContent = 0;
        computerScore.textContent = 0;
        wicketsLeft.textContent = wicketsLeftVal;
        oversLeft.textContent = `${oversLeftVal}.0`;

        tossMsg.textContent = "Game reset. Click Start to begin.";
        tossResult.textContent = "Toss Status : N/A";
        inningsInfo.textContent = "Innings Info : N/A";
        targetScore.textContent = `${a} VS Computer`;
        runsLeft.textContent = "N/A";

        playerHand.src = images.staticHands.playerHand;
        computerHand.src = images.staticHands.computerHand;

        disablebtns();
        tossbtn.style.display = "none";
        batBowlContainer.style.display = "none";
        startbtn.disabled = false;
    }

    resetBtn.addEventListener("click", resetGame);

});
