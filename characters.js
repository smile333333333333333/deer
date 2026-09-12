/* =========================================================
   PINEWOOD — 1997
   FILE 5: characters.js

   Player, townspeople, animals and enemies
   ========================================================= */


/* ---------------------------------------------------------
   NPCs
   --------------------------------------------------------- */

const NPCs = [

    {
        id: "waitress",
        name: "Sarah",
        x: 455,
        y: 980,
        color: "#9b6b57",
        type: "townsperson",
        dialogueId: "waitress"
    },

    {
        id: "sheriff",
        name: "Sheriff Miller",
        x: 2070,
        y: 980,
        color: "#5b6670",
        type: "townsperson",
        dialogueId: "sheriff"
    },

    {
        id: "librarian",
        name: "Mrs. Carter",
        x: 1715,
        y: 970,
        color: "#75635d",
        type: "townsperson",
        dialogueId: "librarian"
    },

    {
        id: "marty",
        name: "Marty",
        x: 830,
        y: 970,
        color: "#536f55",
        type: "townsperson",
        dialogueId: "marty"
    },

    {
        id: "oldman",
        name: "Walter",
        x: 1140,
        y: 1120,
        color: "#77705f",
        type: "townsperson",
        dialogueId: "oldman"
    },

    {
        id: "teen",
        name: "Jamie",
        x: 1460,
        y: 1050,
        color: "#75566d",
        type: "townsperson",
        dialogueId: "teen"
    }

];


/* ---------------------------------------------------------
   ANIMALS
   --------------------------------------------------------- */

const Animals = [

    {
        id: "townDog",
        name: "Dog",
        x: 600,
        y: 1120,

        type: "animal",

        health: 25,
        maxHealth: 25,

        friendly: true,

        color: "#74543c",

        speed: 30,

        moving: false
    },

    {
        id: "deer1",
        name: "Deer",
        x: 460,
        y: 1770,

        type: "animal",

        health: 35,
        maxHealth: 35,

        friendly: false,

        color: "#806045",

        speed: 30,

        moving: true
    },

    {
        id: "deer2",
        name: "Deer",
        x: 1800,
        y: 1810,

        type: "animal",

        health: 35,
        maxHealth: 35,

        friendly: false,

        color: "#806045",

        speed: 28,

        moving: true
    },

    {
        id: "wolf1",
        name: "Wolf",
        x: 1150,
        y: 1880,

        type: "enemy",

        enemyType: "wolf",

        health: 50,
        maxHealth: 50,

        friendly: false,

        color: "#4a4b4b",

        speed: 55,

        moving: true,

        attackRange: 35
    },

    {
        id: "smilingDeer",
        name: "Smiling Deer",
        x: 2040,
        y: 1900,

        type: "enemy",

        enemyType: "smilingDeer",

        health: 75,
        maxHealth: 75,

        friendly: false,

        color: "#66503b",

        speed: 35,

        moving: true,

        attackRange: 38
    },

    {
        id: "longEared",
        name: "Long-Eared Experiment",
        x: 900,
        y: 2150,

        type: "enemy",

        enemyType: "longEared",

        health: 65,
        maxHealth: 65,

        friendly: false,

        color: "#6e6254",

        speed: 70,

        moving: true,

        attackRange: 35
    },

    {
        id: "rootedBoar",
        name: "Rooted Boar",
        x: 1580,
        y: 2130,

        type: "enemy",

        enemyType: "rootedBoar",

        health: 110,
        maxHealth: 110,

        friendly: false,

        color: "#584a3b",

        speed: 25,

        moving: true,

        attackRange: 42
    }

];


/* ---------------------------------------------------------
   ENEMY DEFINITIONS
   --------------------------------------------------------- */

const EnemyTypes = {

    wolf: {

        name: "WOLF",

        attacks: [
            {
                name: "BITE",
                damage: 9
            },
            {
                name: "LUNGE",
                damage: 13
            }
        ],

        battleText:
            "The wolf watches your every movement.",

        defeat:
            "The wolf stumbles backward and collapses."
    },


    smilingDeer: {

        name: "SMILING DEER",

        attacks: [
            {
                name: "KICK",
                damage: 12
            },
            {
                name: "CHARGE",
                damage: 17
            }
        ],

        battleText:
            "The deer is smiling at you.",

        defeat:
            "The strange deer falls silent."
    },


    longEared: {

        name: "LONG-EARED EXPERIMENT",

        attacks: [
            {
                name: "LEAP",
                damage: 11
            },
            {
                name: "SCRATCH",
                damage: 15
            }
        ],

        battleText:
            "It moves far faster than it should.",

        defeat:
            "The creature stops moving."
    },


    rootedBoar: {

        name: "ROOTED BOAR",

        attacks: [
            {
                name: "CHARGE",
                damage: 18
            },
            {
                name: "TUSK",
                damage: 22
            }
        ],

        battleText:
            "Something seems to be growing through its hide.",

        defeat:
            "The enormous animal finally goes still."
    },


    deerMan: {

        name: "THE DEER MAN",

        attacks: [
            {
                name: "SLASH",
                damage: 18
            },
            {
                name: "CHARGE",
                damage: 24
            },
            {
                name: "ROAR",
                damage: 14
            }
        ],

        battleText:
            "It looks almost human.",

        defeat:
            "The creature finally stops fighting."
    }

};


/* ---------------------------------------------------------
   NPC UPDATE
   --------------------------------------------------------- */

function updateNPCs(delta) {

    for (const npc of NPCs) {

        /*
           NPCs don't wander constantly.
           This keeps the town readable while
           allowing story.js to change their positions.
        */

        npc.animationTime =
            (npc.animationTime || 0) +
            delta;

    }

}


/* ---------------------------------------------------------
   ANIMAL UPDATE
   --------------------------------------------------------- */

function updateAnimals(delta) {

    for (const animal of Animals) {

        if (!animal.moving) {
            continue;
        }


        /*
           Very simple wandering behavior.
        */

        if (!animal.directionTimer) {

            animal.directionTimer =
                Math.random() * 3 + 1;

            animal.direction =
                Math.floor(
                    Math.random() * 4
                );

        }


        animal.directionTimer -= delta;


        if (animal.directionTimer <= 0) {

            animal.directionTimer = 0;

        }


        let dx = 0;
        let dy = 0;


        if (animal.direction === 0) {
            dy = -1;
        }

        if (animal.direction === 1) {
            dy = 1;
        }

        if (animal.direction === 2) {
            dx = -1;
        }

        if (animal.direction === 3) {
            dx = 1;
        }


        const newX =
            animal.x +
            dx *
            animal.speed *
            delta;


        const newY =
            animal.y +
            dy *
            animal.speed *
            delta;


        if (
            typeof canPlayerMoveTo === "function" &&
            canPlayerMoveTo(
                newX,
                newY
            )
        ) {

            animal.x = newX;
            animal.y = newY;

        }

    }

}


/* ---------------------------------------------------------
   GET NEARBY NPC
   --------------------------------------------------------- */

function getNearbyNPC() {

    const distanceNeeded = 55;


    for (const npc of NPCs) {

        const distance =
            Math.hypot(
                Player.x - npc.x,
                Player.y - npc.y
            );


        if (distance <= distanceNeeded) {

            return npc;

        }

    }


    return null;

}


/* ---------------------------------------------------------
   GET NEARBY ANIMAL
   --------------------------------------------------------- */

function getNearbyAnimal() {

    const distanceNeeded = 55;


    for (const animal of Animals) {

        const distance =
            Math.hypot(
                Player.x - animal.x,
                Player.y - animal.y
            );


        if (distance <= distanceNeeded) {

            return animal;

        }

    }


    return null;

}


/* ---------------------------------------------------------
   ANIMAL INTERACTION
   --------------------------------------------------------- */

function interactWithAnimal(animal) {

    if (animal.friendly) {

        showWorldMessage(
            animal.name +
            " looks at you."
        );

        return;

    }


    /*
       A hostile animal starts battle.
    */

    if (animal.type === "enemy") {

        startBattle(animal);

        return;

    }


    showWorldMessage(
        "The " +
        animal.name.toLowerCase() +
        " watches you carefully."
    );

}


/* ---------------------------------------------------------
   ENEMY CONTACT
   --------------------------------------------------------- */

function checkEnemyContact() {

    for (const animal of Animals) {

        if (animal.type !== "enemy") {
            continue;
        }


        const distance =
            Math.hypot(
                Player.x - animal.x,
                Player.y - animal.y
            );


        if (distance <= animal.attackRange) {

            startBattle(animal);

            return;

        }

    }

}


/* ---------------------------------------------------------
   START BATTLE
   --------------------------------------------------------- */

function startBattle(enemy) {

    if (Game.battleOpen) {
        return;
    }


    Game.battleOpen = true;

    Game.mode = "battle";

    Game.currentEnemy = enemy;


    const battleScreen =
        document.getElementById(
            "battleScreen"
        );


    const enemyName =
        document.getElementById(
            "enemyName"
        );


    const message =
        document.getElementById(
            "battleMessage"
        );


    const artwork =
        document.getElementById(
            "enemyArtwork"
        );


    const definition =
        EnemyTypes[
            enemy.enemyType
        ];


    if (battleScreen) {

        battleScreen.style.display =
            "block";

    }


    if (enemyName) {

        enemyName.textContent =
            definition
                ? definition.name
                : enemy.name.toUpperCase();

    }


    if (message && definition) {

        message.textContent =
            definition.battleText;

        message.style.display =
            "block";


        setTimeout(function() {

            if (message) {

                message.style.display =
                    "none";

            }

        }, 2200);

    }


    /*
       Artwork is currently drawn as a
       placeholder. Later, we can give every
       creature its own detailed illustration
       without changing the battle system.
    */

    if (artwork) {

        artwork.textContent =
            "[" +
            enemy.name +
            " BATTLE ART" +
            "]";

    }


    updateBattleHUD();

}


/* ---------------------------------------------------------
   BATTLE ACTION
   --------------------------------------------------------- */

function playerBattleAttack(
    attackType
) {

    if (!Game.currentEnemy) {
        return;
    }


    let staminaCost = 0;

    let damage = 0;

    let attackName = "";


    if (attackType === "quick") {

        staminaCost = 5;

        damage =
            randomDamage(7, 10);

        attackName =
            "QUICK ATTACK";

    }


    if (attackType === "heavy") {

        staminaCost = 15;

        damage =
            randomDamage(15, 21);

        attackName =
            "HEAVY ATTACK";

    }


    if (attackType === "special") {

        staminaCost = 25;

        damage =
            randomDamage(25, 34);

        attackName =
            "SPECIAL ATTACK";

    }


    if (attackType === "rest") {

        Player.stamina =
            Math.min(
                Player.maxStamina,
                Player.stamina + 20
            );


        battleMessage(
            "You take a moment to recover."
        );


        enemyTurn();

        updateBattleHUD();

        return;

    }


    if (attackType === "run") {

        attemptEscape();

        return;

    }


    if (
        Player.stamina <
        staminaCost
    ) {

        battleMessage(
            "Not enough stamina."
        );

        return;

    }


    Player.stamina -= staminaCost;


    Game.currentEnemy.health -= damage;


    battleMessage(
        attackName +
        " dealt " +
        damage +
        " damage."
    );


    updateBattleHUD();


    if (
        Game.currentEnemy.health <= 0
    ) {

        defeatEnemy();

        return;

    }


    /*
       Enemy gets its turn.
    */

    enemyTurn();

}


/* ---------------------------------------------------------
   RANDOM DAMAGE
   --------------------------------------------------------- */

function randomDamage(min, max) {

    return Math.floor(
        Math.random() *
        (max - min + 1)
    ) + min;

}


/* ---------------------------------------------------------
   ENEMY TURN
   --------------------------------------------------------- */

function enemyTurn() {

    if (!Game.currentEnemy) {
        return;
    }


    const definition =
        EnemyTypes[
            Game.currentEnemy.enemyType
        ];


    if (
        !definition ||
        !definition.attacks
    ) {

        damagePlayer(8);

        battleMessage(
            "The creature attacks."
        );

        return;

    }


    const attack =
        definition.attacks[
            Math.floor(
                Math.random() *
                definition.attacks.length
            )
        ];


    damagePlayer(
        attack.damage
    );


    battleMessage(
        attack.name +
        " hits you for " +
        attack.damage +
        "."
    );


    updateBattleHUD();

}


/* ---------------------------------------------------------
   ESCAPE
   --------------------------------------------------------- */

function attemptEscape() {

    /*
       Stronger creatures are harder to escape from.
    */

    const chance =
        Game.currentEnemy.enemyType ===
        "deerMan"
            ? 0.25
            : 0.65;


    if (Math.random() < chance) {

        battleMessage(
            "You escaped!"
        );


        setTimeout(
            endBattle,
            650
        );

    }

    else {

        battleMessage(
            "You couldn't get away!"
        );


        enemyTurn();

    }

}


/* ---------------------------------------------------------
   DEFEAT ENEMY
   --------------------------------------------------------- */

function defeatEnemy() {

    const enemy =
        Game.currentEnemy;


    const definition =
        EnemyTypes[
            enemy.enemyType
        ];


    /*
       Remove ordinary enemies from the
       overworld.
    */

    enemy.defeated = true;


    battleMessage(
        definition
            ? definition.defeat
            : "The creature is defeated."
    );


    /*
       Give story.js control over custom
       defeat scenes.
    */

    setTimeout(function() {

        if (
            typeof playEnemyDeathScene ===
            "function"
        ) {

            playEnemyDeathScene(
                enemy
            );

        }

        else {

            endBattle();

        }

    }, 900);

}


/* ---------------------------------------------------------
   END BATTLE
   --------------------------------------------------------- */

function endBattle() {

    Game.battleOpen = false;

    Game.mode = "explore";

    Game.currentEnemy = null;


    const battleScreen =
        document.getElementById(
            "battleScreen"
        );


    if (battleScreen) {

        battleScreen.style.display =
            "none";

    }


    updateBattleHUD();

}


/* ---------------------------------------------------------
   BATTLE MESSAGE
   --------------------------------------------------------- */

function battleMessage(text) {

    const message =
        document.getElementById(
            "battleMessage"
        );


    if (!message) {
        return;
    }


    message.textContent = text;

    message.style.display = "block";


    clearTimeout(
        battleMessage.timeout
    );


    battleMessage.timeout =
        setTimeout(function() {

            message.style.display =
                "none";

        }, 1600);

}


/* ---------------------------------------------------------
   BATTLE MENU BUTTONS
   --------------------------------------------------------- */

const battleButtons =
    document.querySelectorAll(
        "#battleMenu button"
    );


battleButtons.forEach(function(button) {

    button.addEventListener(
        "click",
        function() {

            const action =
                button.dataset.action;


            if (!Game.battleOpen) {
                return;
            }


            playerBattleAttack(
                action
            );

        }
    );

});


/* ---------------------------------------------------------
   DRAW ALL CHARACTERS
   --------------------------------------------------------- */

function drawCharacters(
    context,
    camera
) {

    /*
       Draw NPCs first.
    */

    for (const npc of NPCs) {

        drawNPC(
            context,
            npc,
            camera
        );

    }


    /*
       Draw animals.
    */

    for (const animal of Animals) {

        if (animal.defeated) {
            continue;
        }


        drawAnimal(
            context,
            animal,
            camera
        );

    }


    /*
       Draw player last so they are visible
       over scenery.
    */

    drawPlayer(
        context,
        camera
    );

}


/* ---------------------------------------------------------
   DRAW PLAYER
   --------------------------------------------------------- */

function drawPlayer(
    context,
    camera
) {

    const x =
        Player.x -
        camera.x;

    const y =
        Player.y -
        camera.y;


    /*
       Shadow.
    */

    context.fillStyle =
        "rgba(0,0,0,.3)";


    context.beginPath();

    context.ellipse(
        x,
        y + 11,
        12,
        5,
        0,
        0,
        Math.PI * 2
    );

    context.fill();


    /*
       Body.
    */

    context.fillStyle =
        "#35536b";


    context.fillRect(
        x - 8,
        y - 2,
        16,
        18
    );


    /*
       Head.
    */

    context.fillStyle =
        "#d0a17e";


    context.fillRect(
        x - 7,
        y - 17,
        14,
        14
    );


    /*
       Hair.
    */

    context.fillStyle =
        "#302820";


    context.fillRect(
        x - 8,
        y - 19,
        16,
        6
    );


    /*
       Direction indicator.
    */

    context.fillStyle =
        "#eeeeee";


    if (Player.facing === "up") {

        context.fillRect(
            x - 2,
            y - 18,
            4,
            2
        );

    }

    else if (Player.facing === "down") {

        context.fillRect(
            x - 2,
            y - 5,
            4,
            2
        );

    }

}


/* ---------------------------
