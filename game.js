/* =========================================================
   PINEWOOD — 1997
   FILE 3: game.js

   Main game engine
   ========================================================= */


/* ---------------------------------------------------------
   CANVAS
   --------------------------------------------------------- */

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

ctx.imageSmoothingEnabled = false;


/* ---------------------------------------------------------
   GAME STATE
   --------------------------------------------------------- */

const Game = {

    running: false,

    paused: false,

    mode: "title",

    day: 1,

    time: 16 * 60 + 37,

    lastTime: 0,

    keys: {},

    camera: {
        x: 0,
        y: 0
    },

    dialogueOpen: false,

    battleOpen: false,

    cutsceneOpen: false,

    documentOpen: false,

    deathOpen: false,

    currentEnemy: null,

    currentNPC: null,

    currentBuilding: null,

    currentCutscene: null,

    cutsceneIndex: 0,

    messageTimer: 0,

    interactionText: ""

};


/* ---------------------------------------------------------
   PLAYER
   --------------------------------------------------------- */

const Player = {

    x: 420,

    y: 300,

    width: 18,

    height: 22,

    speed: 120,

    sprintSpeed: 190,

    health: 100,

    maxHealth: 100,

    stamina: 100,

    maxStamina: 100,

    facing: "down",

    moving: false,

    sprinting: false

};


/* ---------------------------------------------------------
   INPUT
   --------------------------------------------------------- */

window.addEventListener("keydown", function(event) {

    const key = event.key.toLowerCase();

    Game.keys[key] = true;


    /*
       Prevent the space bar from scrolling the page.
    */

    if (
        key === " " ||
        key === "arrowup" ||
        key === "arrowdown" ||
        key === "arrowleft" ||
        key === "arrowright"
    ) {
        event.preventDefault();
    }


    /*
       ENTER
       */

    if (key === "enter") {

        if (Game.cutsceneOpen) {

            if (typeof advanceCutscene === "function") {
                advanceCutscene();
            }

            return;
        }


        if (Game.dialogueOpen) {

            if (typeof advanceDialogue === "function") {
                advanceDialogue();
            }

            return;
        }

    }


    /*
       E
       */

    if (key === "e" && !event.repeat) {

        if (Game.mode === "explore") {

            interact();

        }

    }


    /*
       ESCAPE
       */

    if (key === "escape") {

        if (Game.documentOpen) {

            closeDocument();

        }

        else if (Game.dialogueOpen) {

            closeDialogue();

        }

    }

});


window.addEventListener("keyup", function(event) {

    Game.keys[event.key.toLowerCase()] = false;

});


/* ---------------------------------------------------------
   START BUTTON
   --------------------------------------------------------- */

const startButton =
    document.getElementById("startButton");


if (startButton) {

    startButton.addEventListener("click", function() {

        startGame();

    });

}


/* ---------------------------------------------------------
   START GAME
   --------------------------------------------------------- */

function startGame() {

    const title =
        document.getElementById("titleScreen");

    if (title) {
        title.style.display = "none";
    }


    Game.running = true;

    Game.mode = "explore";

    Game.paused = false;


    Player.health = Player.maxHealth;

    Player.stamina = Player.maxStamina;


    updateHUD();


    /*
       Story file will provide the opening scene.
    */

    if (typeof startOpeningStory === "function") {

        startOpeningStory();

    }


    Game.lastTime = performance.now();

    requestAnimationFrame(gameLoop);

}


/* ---------------------------------------------------------
   MAIN GAME LOOP
   --------------------------------------------------------- */

function gameLoop(timestamp) {

    if (!Game.running) {
        return;
    }


    let delta =
        (timestamp - Game.lastTime) / 1000;


    /*
       Prevent huge jumps if the browser tab
       was inactive.
    */

    delta = Math.min(delta, 0.05);

    Game.lastTime = timestamp;


    update(delta);

    draw();


    requestAnimationFrame(gameLoop);

}


/* ---------------------------------------------------------
   UPDATE
   --------------------------------------------------------- */

function update(delta) {

    if (Game.paused) {
        return;
    }


    /*
       Special screens stop normal movement.
    */

    if (
        Game.battleOpen ||
        Game.cutsceneOpen ||
        Game.dialogueOpen ||
        Game.documentOpen ||
        Game.deathOpen
    ) {

        updateSpecialScreens(delta);

        return;

    }


    if (Game.mode === "explore") {

        updatePlayer(delta);

        updateWorld(delta);

        updateCharacters(delta);

        updateCamera();

        updateTime(delta);

        checkWorldEvents();

    }


    updateHUD();

}


/* ---------------------------------------------------------
   PLAYER MOVEMENT
   --------------------------------------------------------- */

function updatePlayer(delta) {

    let dx = 0;
    let dy = 0;


    if (Game.keys["w"] || Game.keys["arrowup"]) {

        dy -= 1;

        Player.facing = "up";

    }


    if (Game.keys["s"] || Game.keys["arrowdown"]) {

        dy += 1;

        Player.facing = "down";

    }


    if (Game.keys["a"] || Game.keys["arrowleft"]) {

        dx -= 1;

        Player.facing = "left";

    }


    if (Game.keys["d"] || Game.keys["arrowright"]) {

        dx += 1;

        Player.facing = "right";

    }


    Player.moving =
        dx !== 0 || dy !== 0;


    Player.sprinting =
        Game.keys["shift"] &&
        Player.moving &&
        Player.stamina > 0;


    if (Player.sprinting) {

        Player.stamina -= 25 * delta;

    }

    else {

        Player.stamina += 14 * delta;

    }


    Player.stamina =
        Math.max(
            0,
            Math.min(
                Player.maxStamina,
                Player.stamina
            )
        );


    if (dx !== 0 || dy !== 0) {

        const length =
            Math.sqrt(dx * dx + dy * dy);


        dx /= length;
        dy /= length;


        const speed =
            Player.sprinting
                ? Player.sprintSpeed
                : Player.speed;


        const newX =
            Player.x + dx * speed * delta;


        const newY =
            Player.y + dy * speed * delta;


        /*
           world.js will provide collision checking.
        */

        if (
            typeof canPlayerMoveTo !== "function" ||
            canPlayerMoveTo(newX, Player.y)
        ) {

            Player.x = newX;

        }


        if (
            typeof canPlayerMoveTo !== "function" ||
            canPlayerMoveTo(Player.x, newY)
        ) {

            Player.y = newY;

        }

    }


    /*
       Keep player inside the world.
    */

    if (typeof WORLD !== "undefined") {

        Player.x =
            Math.max(
                10,
                Math.min(
                    WORLD.width - 10,
                    Player.x
                )
            );


        Player.y =
            Math.max(
                10,
                Math.min(
                    WORLD.height - 10,
                    Player.y
                )
            );

    }

}


/* ---------------------------------------------------------
   WORLD UPDATE
   --------------------------------------------------------- */

function updateWorld(delta) {

    if (typeof updateWorldObjects === "function") {

        updateWorldObjects(delta);

    }

}


/* ---------------------------------------------------------
   CHARACTER UPDATE
   --------------------------------------------------------- */

function updateCharacters(delta) {

    if (typeof updateNPCs === "function") {

        updateNPCs(delta);

    }


    if (typeof updateAnimals === "function") {

        updateAnimals(delta);

    }


    /*
       Check whether an enemy has touched
       the player and started combat.
    */

    if (
        typeof checkEnemyContact === "function" &&
        !Game.battleOpen
    ) {

        checkEnemyContact();

    }

}


/* ---------------------------------------------------------
   CAMERA
   --------------------------------------------------------- */

function updateCamera() {

    if (typeof WORLD === "undefined") {
        return;
    }


    Game.camera.x =
        Player.x - canvas.width / 2;


    Game.camera.y =
        Player.y - canvas.height / 2;


    Game.camera.x =
        Math.max(
            0,
            Math.min(
                WORLD.width - canvas.width,
                Game.camera.x
            )
        );


    Game.camera.y =
        Math.max(
            0,
            Math.min(
                WORLD.height - canvas.height,
                Game.camera.y
            )
        );

}


/* ---------------------------------------------------------
   TIME
   --------------------------------------------------------- */

function updateTime(delta) {

    /*
       Game time moves faster than real time.

       1 real second = 12 game seconds.
    */

    Game.time += delta * 12;


    if (Game.time >= 24 * 60) {

        Game.time -= 24 * 60;

        Game.day++;

    }

}


/* ---------------------------------------------------------
   WORLD EVENTS
   --------------------------------------------------------- */

function checkWorldEvents() {

    /*
       Story.js will eventually use this for:

       - first cryptid sighting
       - newspaper discoveries
       - VHS tapes
       - laboratory discovery
       - creature encounters
       - day/night events
    */


    if (typeof checkStoryEvents === "function") {

        checkStoryEvents();

    }

}


/* ---------------------------------------------------------
   INTERACTION
   --------------------------------------------------------- */

function interact() {

    /*
       Characters get first priority.
    */

    if (typeof getNearbyNPC === "function") {

        const npc = getNearbyNPC();

        if (npc) {

            if (typeof startNPCDialogue === "function") {

                startNPCDialogue(npc);

            }

            return;

        }

    }


    /*
       Animals can also be interacted with.
    */

    if (typeof getNearbyAnimal === "function") {

        const animal = getNearbyAnimal();

        if (animal) {

            if (typeof interactWithAnimal === "function") {

                interactWithAnimal(animal);

            }

            return;

        }

    }


    /*
       Buildings.
    */

    if (typeof getNearbyBuilding === "function") {

        const building =
            getNearbyBuilding();

        if (building) {

            if (typeof enterBuilding === "function") {

                enterBuilding(building);

            }

            return;

        }

    }


    /*
       Investigatable objects.
    */

    if (typeof getNearbyInvestigation === "function") {

        const object =
            getNearbyInvestigation();

        if (object) {

            if (typeof investigateObject === "function") {

                investigateObject(object);

            }

            return;

        }

    }

}


/* ---------------------------------------------------------
   SPECIAL SCREEN UPDATES
   --------------------------------------------------------- */

function updateSpecialScreens(delta) {

    /*
       Story systems can use this later.
    */

    if (Game.battleOpen) {

        if (typeof updateBattle === "function") {

            updateBattle(delta);

        }

    }

}


/* ---------------------------------------------------------
   HUD
   --------------------------------------------------------- */

function updateHUD() {

    const healthBar =
        document.getElementById("healthBar");

    const staminaBar =
        document.getElementById("staminaBar");


    if (healthBar) {

        const healthPercent =
            (Player.health / Player.maxHealth) * 100;

        healthBar.style.width =
            Math.max(0, healthPercent) + "%";

    }


    if (staminaBar) {

        const staminaPercent =
            (Player.stamina / Player.maxStamina) * 100;

        staminaBar.style.width =
            Math.max(0, staminaPercent) + "%";

    }


    const dayDisplay =
        document.getElementById("dayDisplay");


    if (dayDisplay) {

        dayDisplay.textContent =
            "DAY " + Game.day;

    }


    const timeDisplay =
        document.getElementById("timeDisplay");


    if (timeDisplay) {

        timeDisplay.textContent =
            formatTime(Game.time);

    }


    if (Game.battleOpen) {

        updateBattleHUD();

    }

}


/* ---------------------------------------------------------
   TIME DISPLAY
   --------------------------------------------------------- */

function formatTime(minutes) {

    minutes = Math.floor(minutes);


    let hour =
        Math.floor(minutes / 60);

    const minute =
        minutes % 60;


    const suffix =
        hour >= 12
            ? "PM"
            : "AM";


    hour =
        hour % 12;


    if (hour === 0) {
        hour = 12;
    }


    return (
        hour +
        ":" +
        String(minute).padStart(2, "0") +
        " " +
        suffix
    );

}


/* ---------------------------------------------------------
   DAMAGE PLAYER
   --------------------------------------------------------- */

function damagePlayer(amount) {

    if (Game.deathOpen) {
        return;
    }


    Player.health -= amount;


    Player.health =
        Math.max(
            0,
            Player.health
        );


    updateHUD();


    if (Player.health <= 0) {

        playerDeath();

    }

}


/* ---------------------------------------------------------
   PLAYER DEATH
   --------------------------------------------------------- */

function playerDeath() {

    Game.deathOpen = true;

    Game.mode = "death";


    const deathScreen =
        document.getElementById("deathScreen");


    const deathMessage =
        document.getElementById("deathMessage");


    if (deathMessage) {

        deathMessage.textContent =
            getDeathMessage();

    }


    if (deathScreen) {

        deathScreen.style.display =
            "flex";

    }

}


/* ---------------------------------------------------------
   RANDOM DEATH MESSAGES
   --------------------------------------------------------- */

function getDeathMessage() {

    const messages = [

        "You should have stayed out of the woods.",

        "Pinewood kept its secret.",

        "Nobody heard you call for help.",

        "Something was waiting in the dark.",

        "You weren't prepared for what you found.",

        "The woods are quiet again."

    ];


    return messages[
        Math.floor(
            Math.random() * messages.length
        )
    ];

}


/* ---------------------------------------------------------
   RESTART
   --------------------------------------------------------- */

const restartButton =
    document.getElementById("restartButton");


if (restartButton) {

    restartButton.addEventListener(
        "click",
        restartGame
    );

}


function restartGame() {

    Game.deathOpen = false;

    Game.mode = "explore";

    Game.battleOpen = false;

    Game.dialogueOpen = false;

    Game.cutsceneOpen = false;

    Game.documentOpen = false;


    Player.health =
        Player.maxHealth;

    Player.stamina =
        Player.maxStamina;


    /*
       story.js can restore the player's
       latest checkpoint.
    */

    if (
        typeof restoreCheckpoint === "function"
    ) {

        restoreCheckpoint();

    }


    const deathScreen =
        document.getElementById("deathScreen");


    if (deathScreen) {

        deathScreen.style.display =
            "none";

    }


    updateHUD();

}


/* ---------------------------------------------------------
   DOCUMENTS
   --------------------------------------------------------- */

function openDocument(title, date, headline, body) {

    const viewer =
        document.getElementById("documentViewer");

    const titleElement =
        document.getElementById("newspaperTitle");

    const dateElement =
        document.getElementById("newspaperDate");

    const headlineElement =
        document.getElementById("newspaperHeadline");

    const bodyElement =
        document.getElementById("newspaperBody");


    if (titleElement) {
        titleElement.textContent = title;
    }


    if (dateElement) {
        dateElement.textContent = date;
    }


    if (headlineElement) {
        headlineElement.textContent = headline;
    }


    if (bodyElement) {
        bodyElement.innerHTML = body;
    }


    if (viewer) {

        viewer.style.display =
            "flex";

    }


    Game.documentOpen = true;

}


function closeDocument() {

    const viewer =
        document.getElementById("documentViewer");


    if (viewer) {

        viewer.style.display =
            "none";

    }


    Game.documentOpen = false;

}


/* ---------------------------------------------------------
   DIALOGUE HELPERS
   --------------------------------------------------------- */

function closeDialogue() {

    const box =
        document.getElementById("dialogueBox");


    if (box) {

        box.style.display =
            "none";

    }


    Game.dialogueOpen = false;

    Game.currentNPC = null;

}


/* ---------------------------------------------------------
   BATTLE HUD
   --------------------------------------------------------- */

function updateBattleHUD() {

    const healthBar =
        document.getElementById(
            "battleHealthBar"
        );


    const staminaBar =
        document.getElementById(
            "battleStaminaBar"
        );


    if (healthBar) {

        healthBar.style.width =
            (
                Player.health /
                Player.maxHealth *
                100
            ) + "%";

    }


    if (staminaBar) {

        staminaBar.style.width =
            (
                Player.stamina /
                Player.maxStamina *
                100
            ) + "%";

    }


    if (
        Game.currentEnemy &&
        Game.currentEnemy.maxHealth > 0
    ) {

        const enemyBar =
            document.getElementById(
                "enemyHealthBar"
            );


        if (enemyBar) {

            enemyBar.style.width =
                (
                    Game.currentEnemy.health /
                    Game.currentEnemy.maxHealth *
                    100
                ) + "%";

        }

    }

}


/* ---------------------------------------------------------
   DRAW
   --------------------------------------------------------- */

function draw() {

    /*
       Clear screen.
    */

    ctx.fillStyle = "#101510";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    /*
       world.js handles the actual environment.
    */

    if (typeof drawWorld === "function") {

        drawWorld(
            ctx,
            Game.camera,
            canvas
        );

    }


    /*
       characters.js handles people,
       animals and the player.
    */

    if (typeof drawCharacters === "function") {

        drawCharacters(
            ctx,
            Game.camera
        );

    }


    /*
       Final player fallback.
       This means the game still shows
       something before characters.js exists.
    */

    if (
        typeof drawCharacters !== "function" &&
        Game.mode === "explore"
    ) {

        drawBasicPlayer();

    }

}


/* ------------------------------
