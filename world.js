/* =========================================================
   PINEWOOD — 1997
   FILE 4: world.js

   Town, woods, buildings, scenery and collisions
   ========================================================= */


/* ---------------------------------------------------------
   WORLD
   --------------------------------------------------------- */

const WORLD = {

    width: 3200,

    height: 2400,

    name: "Pinewood"

};


/* ---------------------------------------------------------
   WORLD OBJECTS
   --------------------------------------------------------- */

const worldObjects = [

    /* =========================
       TOWN CENTER
       ========================= */

    {
        type: "road",
        x: 0,
        y: 1000,
        width: 2100,
        height: 180
    },

    {
        type: "road",
        x: 1250,
        y: 0,
        width: 180,
        height: 1450
    },


    /* =========================
       TOWN BUILDINGS
       ========================= */

    {
        type: "building",
        id: "diner",
        name: "Pinewood Diner",
        x: 300,
        y: 720,
        width: 330,
        height: 220,
        color: "#8a5b42"
    },

    {
        type: "building",
        id: "store",
        name: "Pinewood General Store",
        x: 720,
        y: 690,
        width: 300,
        height: 250,
        color: "#596f59"
    },

    {
        type: "building",
        id: "library",
        name: "Pinewood Library",
        x: 1570,
        y: 680,
        width: 300,
        height: 260,
        color: "#686b62"
    },

    {
        type: "building",
        id: "sheriff",
        name: "Sheriff's Office",
        x: 1930,
        y: 690,
        width: 300,
        height: 260,
        color: "#555b61"
    },

    {
        type: "building",
        id: "gas",
        name: "Pinewood Gas",
        x: 2300,
        y: 830,
        width: 330,
        height: 230,
        color: "#7b4e3d"
    },

    {
        type: "building",
        id: "clinic",
        name: "Pinewood Clinic",
        x: 1590,
        y: 1120,
        width: 300,
        height: 230,
        color: "#707b76"
    },


    /* =========================
       HOUSES
       ========================= */

    {
        type: "house",
        id: "house1",
        name: "Miller House",
        x: 260,
        y: 1250,
        width: 260,
        height: 210,
        color: "#806b59"
    },

    {
        type: "house",
        id: "house2",
        name: "Green House",
        x: 650,
        y: 1320,
        width: 270,
        height: 210,
        color: "#68745f"
    },

    {
        type: "house",
        id: "house3",
        name: "Taylor House",
        x: 1010,
        y: 1280,
        width: 260,
        height: 220,
        color: "#75655a"
    },


    /* =========================
       ABANDONED PROPERTY
       ========================= */

    {
        type: "building",
        id: "abandonedHouse",
        name: "Abandoned House",
        x: 2200,
        y: 1260,
        width: 300,
        height: 250,
        color: "#45453f"
    },


    /* =========================
       OLD LABORATORY
       ========================= */

    {
        type: "building",
        id: "laboratory",
        name: "Pinewood Research Facility",
        x: 2600,
        y: 1680,
        width: 440,
        height: 330,
        color: "#454b49"
    },


    /* =========================
       FOREST CLEARING
       ========================= */

    {
        type: "clearing",
        x: 350,
        y: 1700,
        width: 650,
        height: 430
    },

    {
        type: "clearing",
        x: 1450,
        y: 1600,
        width: 600,
        height: 450
    },


    /* =========================
       CREEK
       ========================= */

    {
        type: "water",
        x: 1050,
        y: 1550,
        width: 270,
        height: 850
    },


    /* =========================
       CAVE ENTRANCE
       ========================= */

    {
        type: "cave",
        id: "cave",
        name: "Dark Cave",
        x: 700,
        y: 1980,
        width: 190,
        height: 120
    }

];


/* ---------------------------------------------------------
   TREES
   --------------------------------------------------------- */

const trees = [];

function generateTrees() {

    trees.length = 0;


    /*
       Fixed-looking pseudo-random placement.
       Because the seed is deterministic, the forest
       stays in the same place every time.
    */

    let seed = 83721;


    function random() {

        seed =
            (seed * 9301 + 49297) % 233280;

        return seed / 233280;

    }


    for (let i = 0; i < 240; i++) {

        const x =
            Math.floor(
                random() * WORLD.width
            );

        const y =
            Math.floor(
                random() * WORLD.height
            );


        /*
           Keep the central town somewhat open.
        */

        if (
            x > 100 &&
            x < 2400 &&
            y > 550 &&
            y < 1550
        ) {

            if (random() < 0.82) {
                continue;
            }

        }


        /*
           Don't put trees directly inside water.
        */

        if (
            x > 1030 &&
            x < 1340 &&
            y > 1500
        ) {

            continue;

        }


        trees.push({

            x,
            y,

            size:
                25 + Math.floor(random() * 20)

        });

    }

}


generateTrees();


/* ---------------------------------------------------------
   EXTRA SCENERY
   --------------------------------------------------------- */

const scenery = [

    {
        type: "telephonePole",
        x: 110,
        y: 940
    },

    {
        type: "telephonePole",
        x: 520,
        y: 940
    },

    {
        type: "telephonePole",
        x: 920,
        y: 940
    },

    {
        type: "telephonePole",
        x: 1510,
        y: 940
    },

    {
        type: "telephonePole",
        x: 1850,
        y: 940
    },

    {
        type: "telephonePole",
        x: 2220,
        y: 940
    },

    {
        type: "bench",
        x: 1100,
        y: 900
    },

    {
        type: "bench",
        x: 1450,
        y: 900
    },

    {
        type: "sign",
        x: 1180,
        y: 880,
        text: "PINEWOOD"
    },

    {
        type: "sign",
        x: 2550,
        y: 1550,
        text: "RESEARCH AREA"
    }

];


/* ---------------------------------------------------------
   COLLISION
   --------------------------------------------------------- */

function canPlayerMoveTo(x, y) {

    const radius = 9;


    /*
       World boundary.
    */

    if (
        x - radius < 0 ||
        y - radius < 0 ||
        x + radius > WORLD.width ||
        y + radius > WORLD.height
    ) {

        return false;

    }


    /*
       Buildings are solid from the outside.
       Doors/interiors will be handled separately.
    */

    for (const object of worldObjects) {

        if (
            object.type === "building" ||
            object.type === "house"
        ) {

            if (
                circleRectangleCollision(
                    x,
                    y,
                    radius,
                    object.x,
                    object.y,
                    object.width,
                    object.height
                )
            ) {

                return false;

            }

        }

    }


    /*
       Water is solid.
    */

    for (const object of worldObjects) {

        if (object.type === "water") {

            if (
                pointInsideRectangle(
                    x,
                    y,
                    object.x,
                    object.y,
                    object.width,
                    object.height
                )
            ) {

                return false;

            }

        }

    }


    /*
       Cave entrance is passable.
       Story.js will eventually control entering it.
    */


    return true;

}


/* ---------------------------------------------------------
   COLLISION HELPERS
   --------------------------------------------------------- */

function pointInsideRectangle(
    px,
    py,
    x,
    y,
    width,
    height
) {

    return (
        px >= x &&
        px <= x + width &&
        py >= y &&
        py <= y + height
    );

}


function circleRectangleCollision(
    cx,
    cy,
    radius,
    rx,
    ry,
    rw,
    rh
) {

    const closestX =
        Math.max(
            rx,
            Math.min(
                cx,
                rx + rw
            )
        );


    const closestY =
        Math.max(
            ry,
            Math.min(
                cy,
                ry + rh
            )
        );


    const dx =
        cx - closestX;

    const dy =
        cy - closestY;


    return (
        dx * dx +
        dy * dy <
        radius * radius
    );

}


/* ---------------------------------------------------------
   NEARBY BUILDING
   --------------------------------------------------------- */

function getNearbyBuilding() {

    const interactionDistance = 70;


    for (const building of worldObjects) {

        if (
            building.type !== "building" &&
            building.type !== "house"
        ) {

            continue;

        }


        const centerX =
            building.x +
            building.width / 2;

        const centerY =
            building.y +
            building.height / 2;


        const distance =
            Math.hypot(
                Player.x - centerX,
                Player.y - centerY
            );


        if (distance <= interactionDistance) {

            return building;

        }

    }


    return null;

}


/* ---------------------------------------------------------
   ENTER BUILDING
   --------------------------------------------------------- */

function enterBuilding(building) {

    /*
       The actual interior system will be expanded
       through story.js.

       For now, display the building name.
    */

    showWorldMessage(
        "ENTERED: " + building.name
    );


    if (
        typeof startBuildingInterior === "function"
    ) {

        startBuildingInterior(building);

    }

}


/* ---------------------------------------------------------
   WORLD MESSAGE
   --------------------------------------------------------- */

let worldMessageTimer = 0;


function showWorldMessage(text) {

    const prompt =
        document.getElementById(
            "interactionPrompt"
        );


    if (!prompt) {
        return;
    }


    prompt.textContent = text;

    prompt.style.display = "block";


    worldMessageTimer = 2;

}


/* ---------------------------------------------------------
   WORLD UPDATE
   --------------------------------------------------------- */

function updateWorldObjects(delta) {

    if (worldMessageTimer > 0) {

        worldMessageTimer -= delta;

        if (worldMessageTimer <= 0) {

            const prompt =
                document.getElementById(
                    "interactionPrompt"
                );


            if (prompt) {

                prompt.style.display =
                    "none";

            }

        }

    }

}


/* ---------------------------------------------------------
   INVESTIGATION OBJECTS
   --------------------------------------------------------- */

const investigationObjects = [

    {
        id: "town_sign",
        x: 1180,
        y: 880,
        radius: 55,

        text:
            "WELCOME TO PINEWOOD. POPULATION 1,842."
    },

    {
        id: "research_sign",
        x: 2550,
        y: 1550,
        radius: 55,

        text:
            "AUTHORIZED PERSONNEL ONLY."
    },

    {
        id: "cave_markings",
        x: 790,
        y: 2010,
        radius: 70,

        text:
            "There are deep scratches around the cave entrance."
    }

];


/* ---------------------------------------------------------
   NEARBY INVESTIGATION
   --------------------------------------------------------- */

function getNearbyInvestigation() {

    for (
        const object
        of investigationObjects
    ) {

        const distance =
            Math.hypot(
                Player.x - object.x,
                Player.y - object.y
            );


        if (distance <= object.radius) {

            return object;

        }

    }


    return null;

}


/* ---------------------------------------------------------
   INVESTIGATE
   --------------------------------------------------------- */

function investigateObject(object) {

    if (
        typeof showInvestigation === "function"
    ) {

        showInvestigation(object);

        return;

    }


    showWorldMessage(
        object.text
    );

}


/* ---------------------------------------------------------
   DRAW WORLD
   --------------------------------------------------------- */

function drawWorld(
    context,
    camera,
    gameCanvas
) {

    /*
       Base ground.
    */

    context.fillStyle = "#314832";

    context.fillRect(
        0,
        0,
        gameCanvas.width,
        gameCanvas.height
    );


    /*
       Draw the actual world relative to camera.
    */

    drawGroundTexture(
        context,
        camera
    );


    drawWater(
        context,
        camera
    );


    drawRoads(
        context,
        camera
    );


    drawClearing(
        context,
        camera
    );


    drawBuildings(
        context,
        camera
    );


    drawScenery(
        context,
        camera
    );


    drawTrees(
        context,
        camera
    );

}


/* ---------------------------------------------------------
   GROUND
   --------------------------------------------------------- */

function drawGroundTexture(
    context,
    camera
) {

    /*
       Small grass marks make large areas
       feel less empty.
    */

    const spacing = 45;


    const startX =
        Math.floor(camera.x / spacing) *
        spacing;


    const startY =
        Math.floor(camera.y / spacing) *
        spacing;


    context.fillStyle = "#405b3d";


    for (
        let x = startX;
        x < camera.x + 960;
        x += spacing
    ) {

        for (
            let y = startY;
            y < camera.y + 540;
            y += spacing
        ) {

            const screenX =
                x - camera.x;

            const screenY =
                y - camera.y;


            context.fillRect(
                screenX,
                screenY,
                2,
                6
            );

        }

    }

}


/* ---------------------------------------------------------
   ROADS
   --------------------------------------------------------- */

function drawRoads(
    context,
    camera
) {

    for (const object of worldObjects) {

        if (object.type !== "road") {
            continue;
        }


        context.fillStyle = "#4b4840";


        context.fillRect(
            object.x - camera.x,
            object.y - camera.y,
            object.width,
            object.height
        );


        /*
           Road markings.
        */

        context.strokeStyle = "#9a8e66";

        context.lineWidth = 3;

        context.setLineDash([25, 20]);


        if (object.width > object.height) {

            context.beginPath();

            context.moveTo(
                object.x - camera.x,
                object.y -
                camera.y +
                object.height / 2
            );

            context.lineTo(
                object.x -
                camera.x +
                object.width,
                object.y -
                camera.y +
                object.height / 2
            );

            context.stroke();

        }

        else {

            context.beginPath();

            context.moveTo(
                object.x -
                camera.x +
                object.width / 2,
                object.y -
                camera.y
            );

            context.lineTo(
                object.x -
                camera.x +
                object.width / 2,
                object.y -
                camera.y +
                object.height
            );

            context.stroke();

        }


        context.setLineDash([]);

    }

}


/* ---------------------------------------------------------
   WATER
   --------------------------------------------------------- */

function drawWater(
    context,
    camera
) {

    for (const object of worldObjects) {

        if (object.type !== "water") {
            continue;
        }


        context.fillStyle = "#263f50";


        context.fillRect(
            object.x - camera.x,
            object.y - camera.y,
            object.width,
            object.height
        );


        /*
           Water lines.
        */

        context.strokeStyle = "#46697a";

        context.lineWidth = 2;


        for (
            let y = object.y;
            y < object.y + object.height;
            y += 35
        ) {

            context.beginPath();

            context.moveTo(
                object.x - camera.x + 15,
                y - camera.y
            );

            context.lineTo(
                object.x -
                camera.x +
                object.width -
                15,
                y - camera.y
            );

            context.stroke();

        }

    }

}


/* ---------------------------------------------------------
   CLEARINGS
   --------------------------------------------------------- */

function drawClearing(
    context,
    camera
) {

    for (const object of worldObjects) {

        if (object.type !== "clearing") {
            continue;
        }


        context.fillStyle = "#526747";


        context.fillRect(
            object.x - camera.x,
            object.y - camera.y,
            object.width,
            object.height
        );

    }

}


/* ---------------------------------------------------------
   BUILDINGS
   --------------------------------------------------------- */

function drawBuildings(
    context,
    camera
) {

    for (const building of worldObjects) {

        if (
            building.type !== "building" &&
            building.type !== "house"
        ) {

            continue;

        }


        const x =
            building.x - camera.x;

        const y =
            building.y - camera.y;


        /*
           Shadow.
        */

        context.fillStyle =
            "rgba(0,0,0,.3)";


        context.fillRect(
            x + 8,
            y + 10,
            building.width,
            building.height
        );


        /*
           Building.
        */

        context.fillStyle =
            building.color || "#666";


        context.fillRect(
            x,
            y,
            building.width,
            building.height
        );


        /*
           Roof.
        */

        context.fillStyle = "#292b28";


        context.beginPath();

        context.moveTo(
            x - 12,
            y
        );

        context.lineTo(
            x +
            building.width / 2,
            y - 45
        );

        context.lineTo(
            x +
            building.width +
            12,
            y
        );

        context.closePath();

        context.fill();


        /*
           Windows.
        */

        context.fillStyle = "#aab19a";


        const windowY =
            y + 65;


        context.fillRect(
            x + 30,
            windowY,
            45,
            45
        );


        context.fillRect(
            x +
            building.width -
            75,
            windowY,
            45,
            45
        );


        /*
           Door.
        */

        context.fillStyle = "#302b25";


        context.fillRect(
            x
