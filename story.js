/* =========================================================
   PINEWOOD — 1997
   FILE 6: story.js

   FINAL GAME SYSTEM

   - Story progression
   - Dialogue
   - Buildings / interiors
   - Newspapers
   - Investigation
   - Cutscenes
   - Death / restart
   - Deer Man encounter
   - Browser-generated audio
   - Horror ambience
   ========================================================= */


/* =========================================================
   STORY STATE
   ========================================================= */

const Story = {

    day: 1,

    time: "4:32 PM",

    started: false,

    cryptidRumor: true,

    sheriffWarning: false,

    newspaperFound: false,

    laboratoryDiscovered: false,

    caveDiscovered: false,

    deerManFound: false,

    deerManDefeated: false,

    currentInterior: null,

    cutsceneRunning: false,

    dialogueRunning: false,

    investigated: [],

    defeatedEnemies: [],

    discoveredClues: [],

    flags: {}

};


/* =========================================================
   GAME STATE FALLBACKS
   ========================================================= */

if (typeof Game === "undefined") {

    window.Game = {

        mode: "explore",

        battleOpen: false,

        currentEnemy: null

    };

}


if (typeof Player === "undefined") {

    window.Player = {

        x: 1350,

        y: 1080,

        health: 100,

        maxHealth: 100,

        stamina: 100,

        maxStamina: 100,

        facing: "down"

    };

}


/* =========================================================
   AUDIO ENGINE
   ========================================================= */

const PinewoodAudio = {

    context: null,

    master: null,

    ambienceGain: null,

    ambienceTimer: null,

    initialized: false,

    muted: false,


    init() {

        if (this.initialized) {
            return;
        }


        try {

            this.context =
                new (
                    window.AudioContext ||
                    window.webkitAudioContext
                )();


            this.master =
                this.context.createGain();


            this.master.gain.value = 0.18;


            this.master.connect(
                this.context.destination
            );


            this.initialized = true;

        }

        catch (error) {

            console.log(
                "Audio could not initialize."
            );

        }

    },


    resume() {

        this.init();


        if (
            this.context &&
            this.context.state ===
            "suspended"
        ) {

            this.context.resume();

        }

    },


    tone(
        frequency,
        duration,
        type = "sine",
        volume = 0.08
    ) {

        if (
            this.muted ||
            !this.initialized
        ) {
            return;
        }


        const oscillator =
            this.context.createOscillator();


        const gain =
            this.context.createGain();


        oscillator.type = type;

        oscillator.frequency.value =
            frequency;


        gain.gain.setValueAtTime(
            0,
            this.context.currentTime
        );


        gain.gain.linearRampToValueAtTime(
            volume,
            this.context.currentTime + 0.015
        );


        gain.gain.exponentialRampToValueAtTime(
            0.001,
            this.context.currentTime +
            duration
        );


        oscillator.connect(gain);

        gain.connect(this.master);


        oscillator.start();

        oscillator.stop(
            this.context.currentTime +
            duration +
            0.02
        );

    },


    noise(
        duration = 0.2,
        volume = 0.08
    ) {

        if (
            this.muted ||
            !this.initialized
        ) {
            return;
        }


        const buffer =
            this.context.createBuffer(
                1,
                this.context.sampleRate *
                duration,
                this.context.sampleRate
            );


        const data =
            buffer.getChannelData(0);


        for (
            let i = 0;
            i < data.length;
            i++
        ) {

            data[i] =
                Math.random() * 2 - 1;

        }


        const source =
            this.context.createBufferSource();


        const gain =
            this.context.createGain();


        source.buffer = buffer;


        gain.gain.setValueAtTime(
            volume,
            this.context.currentTime
        );


        gain.gain.exponentialRampToValueAtTime(
            0.001,
            this.context.currentTime +
            duration
        );


        source.connect(gain);

        gain.connect(this.master);


        source.start();

    },


    step() {

        this.tone(
            90,
            0.06,
            "square",
            0.025
        );

    },


    hit() {

        this.noise(
            0.12,
            0.11
        );

        this.tone(
            65,
            0.12,
            "sawtooth",
            0.07
        );

    },


    attack() {

        this.tone(
            180,
            0.08,
            "square",
            0.07
        );

        setTimeout(() => {

            this.noise(
                0.09,
                0.08
            );

        }, 60);

    },


    heal() {

        this.tone(
            440,
            0.12,
            "sine",
            0.04
        );


        setTimeout(() => {

            this.tone(
                660,
                0.18,
                "sine",
                0.04
            );

        }, 100);

    },


    door() {

        this.tone(
            70,
            0.35,
            "sawtooth",
            0.04
        );

    },


    radio() {

        this.noise(
            0.25,
            0.08
        );


        setTimeout(() => {

            this.tone(
                520,
                0.05,
                "square",
                0.025
            );

        }, 100);

    },


    scare() {

        this.tone(
            42,
            1.1,
            "sawtooth",
            0.12
        );


        this.noise(
            0.7,
            0.12
        );

    },


    creature() {

        this.tone(
            55,
            0.8,
            "sawtooth",
            0.07
        );


        setTimeout(() => {

            this.tone(
                39,
                0.8,
                "sine",
                0.08
            );

        }, 300);

    },


    death() {

        this.tone(
            110,
            0.5,
            "sawtooth",
            0.07
        );


        setTimeout(() => {

            this.tone(
                55,
                0.9,
                "sine",
                0.08
            );

        }, 250);

    },


    radioVoiceEffect() {

        this.noise(
            0.4,
            0.07
        );


        this.tone(
            800,
            0.05,
            "square",
            0.015
        );

    },


    startAmbience() {

        if (
            this.ambienceTimer ||
            !this.initialized
        ) {
            return;
        }


        const play = () => {

            if (this.muted) {
                return;
            }


            const chance =
                Math.random();


            if (chance < 0.5) {

                this.tone(
                    55 +
                    Math.random() * 20,
                    2,
                    "sine",
                    0.012
                );

            }

            else {

                this.noise(
                    1.2,
                    0.008
                );

            }


            this.ambienceTimer =
                setTimeout(
                    play,
                    3500 +
                    Math.random() * 5000
                );

        };


        play();

    },


    stopAmbience() {

        clearTimeout(
            this.ambienceTimer
        );

        this.ambienceTimer = null;

    }

};


/* =========================================================
   INITIALIZE AUDIO ON FIRST PLAYER INPUT
   ========================================================= */

window.addEventListener(
    "keydown",
    function() {

        PinewoodAudio.resume();

        PinewoodAudio.startAmbience();

    },
    { once: true }
);


/* =========================================================
   DIALOGUE DATA
   ========================================================= */

const Dialogue = {

    waitress: [

        "You: Hey. Have you heard people talking about the woods?",

        "Sarah: Everybody's heard about the woods.",

        "You: What are they saying?",

        "Sarah: Depends who you ask.",

        "Sarah: Some people say it's a deer.",

        "Sarah: Some say it's a man.",

        "You: A man?",

        "Sarah: Don't go looking for it.",

        "Sarah: Seriously."

    ],


    sheriff: [

        "You: Sheriff?",

        "Sheriff Miller: Yeah?",

        "You: What's actually happening in the woods?",

        "Sheriff Miller: Nothing.",

        "You: People keep saying they've seen something.",

        "Sheriff Miller: People say a lot of things.",

        "You: Then why are there missing-person posters?",

        "Sheriff Miller: Go home.",

        "Sheriff Miller: Stay away from the forest after dark."

    ],


    librarian: [

        "You: Do you have anything about the Pinewood woods?",

        "Mrs. Carter: History books are in the back.",

        "You: I'm looking for something specific.",

        "Mrs. Carter: Aren't we all?",

        "Mrs. Carter: Try the newspaper archives.",

        "Mrs. Carter: Some things were never meant to disappear."

    ],


    marty: [

        "You: You believe in the cryptid?",

        "Marty: I believe somebody's out there.",

        "You: That's not really an answer.",

        "Marty: My brother went into those woods.",

        "Marty: He came back three days later.",

        "You: What happened?",

        "Marty: He wouldn't talk.",

        "Marty: He just kept smiling."

    ],


    oldman: [

        "Walter: You kids shouldn't be wandering around out there.",

        "You: Why?",

        "Walter: Because the forest remembers.",

        "You: What does that mean?",

        "Walter: I don't know.",

        "Walter: That's the problem."

    ],


    teen: [

        "You: Have you seen anything weird?",

        "Jamie: Maybe.",

        "You: What did you see?",

        "Jamie: Antlers.",

        "You: On a deer?",

        "Jamie: No.",

        "Jamie: That's why I'm not going back."

    ]

};


/* =========================================================
   DIALOGUE SYSTEM
   ========================================================= */

let activeDialogue = null;

let dialogueIndex = 0;

let dialogueTimer = null;


function startDialogue(id) {

    if (
        !Dialogue[id] ||
        Story.dialogueRunning
    ) {
        return;
    }


    PinewoodAudio.resume();

    activeDialogue =
        Dialogue[id];

    dialogueIndex = 0;

    Story.dialogueRunning = true;

    Game.mode = "dialogue";


    showDialogueLine();

}


function showDialogueLine() {

    if (
        !activeDialogue ||
        dialogueIndex >=
        activeDialogue.length
    ) {

        endDialogue();

        return;

    }


    const box =
        getOrCreateDialogueBox();


    box.style.display =
        "block";


    box.textContent =
        activeDialogue[
            dialogueIndex
        ];


    PinewoodAudio.tone(
        260,
        0.025,
        "square",
        0.012
    );

}


function advanceDialogue() {

    if (!Story.dialogueRunning) {
        return;
    }


    dialogueIndex++;

    showDialogueLine();

}


function endDialogue() {

    Story.dialogueRunning = false;

    activeDialogue = null;

    dialogueIndex = 0;

    Game.mode = "explore";


    const box =
        document.getElementById(
            "storyDialogue"
        );


    if (box) {

        box.style.display =
            "none";

    }

}


function getOrCreateDialogueBox() {

    let box =
        document.getElementById(
            "storyDialogue"
        );


    if (box) {
        return box;
    }


    box =
        document.createElement(
            "div"
        );


    box.id =
        "storyDialogue";


    box.style.position =
        "fixed";


    box.style.left =
        "5%";


    box.style.right =
        "5%";


    box.style.bottom =
        "20px";


    box.style.padding =
        "20px";


    box.style.background =
        "rgba(10,12,10,.94)";


    box.style.border =
        "2px solid #89946c";


    box.style.color =
        "#e8e8d8";


    box.style.fontFamily =
        "Courier New, monospace";


    box.style.fontSize =
        "16px";


    box.style.zIndex =
        "1000";


    box.style.cursor =
        "pointer";


    box.style.display =
        "none";


    box.addEventListener(
        "click",
        advanceDialogue
    );


    document.body.appendChild(box);


    return box;

}


/* =========================================================
   KEYBOARD DIALOGUE CONTROL
   ========================================================= */

document.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key === " " ||
            event.key === "Enter"
        ) {

            if (
                Story.dialogueRunning
            ) {

                event.preventDefault();

                advanceDialogue();

            }

        }

    }
);


/* =========================================================
   TALK TO NPC
   ========================================================= */

function talkToNPC(npc) {

    if (!npc) {
        return;
    }


    startDialogue(
        npc.dialogueId
    );

}


/* =========================================================
   BUILDING INTERIORS
   ========================================================= */

const Interiors = {

    diner: {

        name: "Pinewood Diner",

        description:
            "The diner smells like coffee and old grease.",

        people: [
            "Sarah is wiping down the counter."
        ]

    },


    store: {

        name: "Pinewood General Store",

        description:
            "The fluorescent lights buzz overhead.",

        people: [
            "A radio plays quietly behind the counter."
        ]

    },


    library: {

        name: "Pinewood Library",

        description:
            "Rows of old books disappear into the darkness.",

        people: [
            "Mrs. Carter is organizing newspapers."
        ]

    },


    sheriff: {

        name: "Sheriff's Office",

        description:
            "The building is unusually quiet.",

        people: [
            "A wall is covered with missing-person notices."
        ]

    },


    clinic: {

        name: "Pinewood Clinic",

        description:
            "The lights flicker every few seconds.",

        people: [
            "Nobody is at the front desk."
        ]

    },


    abandonedHouse: {

        name: "Abandoned House",

        description:
            "The house has been empty for years.",

        people: []

    },


    laboratory: {

        name: "Pinewood Research Facility",

        description:
            "The building doesn't appear on any town map.",

        people: []

    }

};


/* =========================================================
   ENTER BUILDING
   ========================================================= */

function startBuildingInterior(
    building
) {

    if (!building) {
        return;
    }


    PinewoodAudio.resume();

    PinewoodAudio.door();


    Story.currentInterior =
        building.id;


    const interior =
        Interiors[
            building.id
        ];


    if (!interior) {

        showWorldMessage(
            building.name
        );

        return;

    }


    showInteriorScreen(
        interior
    );

}


function showInteriorScreen(
    interior
) {

    let screen =
        document.getElementById(
            "interiorScreen"
        );


    if (!screen) {

        screen =
            document.createElement(
                "div"
            );


        screen.id =
            "interiorScreen";


        screen.style.position =
            "fixed";


        screen.style.inset =
            "0";


        screen.style.background =
            "#171914";


        screen.style.color =
            "#dedec9";


        screen.style.zIndex =
            "900";


        screen.style.padding =
            "50px";


        screen.style.fontFamily =
            "Courier New, monospace";


        document.body.appendChild(
            screen
        );

    }


    screen.innerHTML = "";


    const title =
        document.createElement(
            "h1"
        );


    title.textContent =
        interior.name;


    screen.appendChild(
        title
    );


    const description =
        document.createElement(
            "p"
        );


    description.textContent =
        interior.description;


    screen.appendChild(
        description
    );


    for (
        const person
        of interior.people
    ) {

        const p =
            document.createElement(
                "p"
            );


        p.textContent =
            person;


        screen.appendChild(p);

    }


    const exit =
        document.createElement(
            "button"
        );


    exit.textContent =
        "LEAVE";


    exit.style.padding =
        "12px 25px";


    exit.addEventListener(
        "click",
        leaveBuilding
    );


    screen.appendChild(
        exit
    );


    screen.style.display =
        "block";


    Game.mode =
        "interior";

}


/* =========================================================
   LEAVE BUILDING
   ========================================================= */

function leaveBuilding() {

    const screen =
        document.getElementById(
            "interiorScreen"
        );


    if (screen) {

        screen.style.display =
            "none";

    }


    Story.currentInterior =
        null;


    Game.mode =
        "explore";

}


/* =========================================================
   NEWSPAPERS
   ========================================================= */

const Newspapers = [

    {

        title:
            "PINEWOOD TIMES",

        date:
            "October 14, 1997",

        headline:
            "HIKER STILL MISSING",

        body:
            "Local authorities continue searching the forest. Officials say there is currently no evidence of foul play."

    },


    {

        title:
            "PINEWOOD TIMES",

        date:
            "October 21, 1997",

        headline:
            "STRANGE ANIMAL REPORTS CONTINUE",

        body:
            "Several residents claim to have heard unusual noises coming from the northern woods."

    },


    {

        title:
            "PINEWOOD TIMES",

        date:
            "November 2, 1997",

        headline:
            "RESEARCH FACILITY DENIES INVOLVEMENT",

        body:
            "Officials at a private research facility outside Pinewood deny any connection to recent disappearances."

    },


    {

        title:
            "PINEWOOD TIMES",

        date:
            "November 8, 1997",

        headline:
            "LOCAL MAN RETURNS AFTER DISAPPEARING",

        body:
            "The man was found near the forest. He refused to speak with investigators."

    }

];


function showNewspaper(index) {

    const paper =
        Newspapers[index];


    if (!paper) {
        return;
    }


    Story.newspaperFound =
        true;


    addClue(
        "newspaper_" + index
    );


    PinewoodAudio.radi
