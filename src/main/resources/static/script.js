let score = 0;

let calmMusicStarted = false;
let scaryModeActive = false;
let tensionStarted = false;
let jumpScareTriggered = false;

let isTyping = false;
let skipTyping = false;

function generateStory() {

    if (isTyping) {
        skipTyping = true;
        return;
    }

    startCalmMusicOnce();
    playButtonSound();

    const data = {
        noun: document.getElementById("noun").value,
        verb: document.getElementById("verb").value,
        adjective: document.getElementById("adjective").value,
        place: document.getElementById("place").value
    };

    fetch("/api/story", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    })
        .then(response => response.text())
        .then(story => {

            let isEasterEgg = false;

            if (story.startsWith("[EASTER_EGG]")) {
                isEasterEgg = true;
                story = story.replace("[EASTER_EGG]", "").trim();

                if (!scaryModeActive) {
                    scaryModeActive = true;
                    triggerScaryMode();
                }
            }

            typeWriter(story, "result", isEasterEgg ? 55 : 22, isEasterEgg);

            score++;
            document.getElementById("score").innerText = score;
        })
        .catch(error => {
            document.getElementById("result").innerText = "Something went wrong.";
            console.error(error);
        });
}


function typeWriter(text, elementId, speed, isEgg) {

    const element = document.getElementById(elementId);
    element.innerText = "";

    let i = 0;

    isTyping = true;
    skipTyping = false;

    function typing() {

        if (skipTyping) {
            element.innerText = text;
            isTyping = false;

            if (isEgg) {
                showHauntedPopup();
                if (!tensionStarted) startTensionMode();
            }

            return;
        }

        if (i < text.length) {

            const char = text.charAt(i);
            element.innerText += char;

            i++;

            if (char === "." || char === "!" || char === "?") {
                setTimeout(typing, speed + 450);
            } else if (char === ",") {
                setTimeout(typing, speed + 180);
            } else {
                setTimeout(typing, speed);
            }

        } else {

            isTyping = false;

            if (isEgg) {
                showHauntedPopup();
                if (!tensionStarted) startTensionMode();
            }

        }
    }

    typing();
}


function randomWords() {

    startCalmMusicOnce();
    playButtonSound();

    const nouns = ["dragon","robot","teacher","pirate","rabbit","monster"];
    const verbs = ["dance","run","sing","fight","crawl","whisper"];
    const adjectives = ["crazy","tiny","funny","angry","creepy","glowing"];
    const places = ["school","castle","forest","beach","basement","moon"];

    document.getElementById("noun").value =
        nouns[Math.floor(Math.random()*nouns.length)];

    document.getElementById("verb").value =
        verbs[Math.floor(Math.random()*verbs.length)];

    document.getElementById("adjective").value =
        adjectives[Math.floor(Math.random()*adjectives.length)];

    document.getElementById("place").value =
        places[Math.floor(Math.random()*places.length)];
}


function resetGame() {

    playButtonSound();

    document.getElementById("noun").value = "";
    document.getElementById("verb").value = "";
    document.getElementById("adjective").value = "";
    document.getElementById("place").value = "";

    document.getElementById("result").innerText =
        "Your funny story will appear here...";

    scaryModeActive = false;
    tensionStarted = false;
    jumpScareTriggered = false;
    isTyping = false;
    skipTyping = false;

    document.body.className = "";
    document.body.style.filter = "";
    document.body.style.background = "";

    const ghost = document.getElementById("ghost");
    if (ghost) {
        ghost.style.opacity = "0";
        ghost.style.right = "-260px";
        ghost.style.transform = "translateY(-50%) scale(0.9)";
    }

    const jump = document.getElementById("jumpscare");
    if (jump) {
        jump.style.opacity = "0";
    }

    const scary = document.getElementById("scarySound");
    if (scary) {
        scary.pause();
        scary.currentTime = 0;
    }

    const scream = document.getElementById("screamSound");
    if (scream) {
        scream.pause();
        scream.currentTime = 0;
    }

    const calm = document.getElementById("backgroundMusic");
    if (calm) {
        calm.pause();
        calm.currentTime = 0;
        calm.playbackRate = 1;
        calm.volume = 0.35;
        calmMusicStarted = false;
    }
}


function startCalmMusicOnce() {

    if (calmMusicStarted || scaryModeActive) return;

    const music = document.getElementById("backgroundMusic");
    if (!music) return;

    music.volume = 0.35;

    music.play()
        .then(() => calmMusicStarted = true)
        .catch(err => console.log("Music blocked:", err));
}


function playButtonSound() {

    if (scaryModeActive) return;

    const buttonSound = document.getElementById("buttonSound");
    if (!buttonSound) return;

    buttonSound.currentTime = 0;
    buttonSound.volume = 0.5;

    buttonSound.play().catch(() => {});
}


function distortCalmMusic(callback) {

    const music = document.getElementById("backgroundMusic");

    if (!music) {
        setTimeout(callback,1200);
        return;
    }

    let distortion = setInterval(() => {

        if (music.playbackRate > 0.55) {

            music.playbackRate -= 0.03;
            music.volume = Math.max(0,music.volume - 0.02);
            music.currentTime += Math.random()*0.04;

        } else {

            clearInterval(distortion);

            setTimeout(() => {
                music.pause();
                music.currentTime = 0;
                music.playbackRate = 1;
                callback();
            },900);
        }

    },120);
}


function triggerScaryMode() {

    distortCalmMusic(() => {

        document.body.classList.add("ghost-horror");

        const ghost = document.getElementById("ghost");
        const scary = document.getElementById("scarySound");

        if (ghost) {

            ghost.style.transition = "none";
            ghost.style.opacity = "0";
            ghost.style.right = "-260px";

            setTimeout(() => {

                ghost.style.transition =
                    "right 1.5s ease-out, opacity 1.2s ease, transform 1.5s ease";

                ghost.style.opacity = "0.95";
                ghost.style.right = "30px";
                ghost.style.transform = "translateY(-50%) scale(1)";

                setTimeout(() => {

                    ghost.style.opacity = "0";
                    ghost.style.right = "-260px";

                },2000);

            },50);
        }

        if (scary) {
            scary.volume = 0.6;
            scary.loop = true;
            tryPlay(scary);
        }
    });
}


function startTensionMode() {

    if (tensionStarted) return;

    tensionStarted = true;

    document.body.classList.add("horror-mode");

    const delay = Math.floor(Math.random()*2000)+3000;

    setTimeout(triggerJumpScare,delay);
}


function triggerJumpScare() {

    if (jumpScareTriggered) return;

    jumpScareTriggered = true;

    const jump = document.getElementById("jumpscare");
    const scream = document.getElementById("screamSound");

    document.body.style.filter = "brightness(2)";

    setTimeout(()=>{

        document.body.style.filter="";

        if(jump){
            jump.style.opacity="1";
            jump.style.transform="scale(1.2)";
        }

        if(scream){
            scream.volume=1;
            tryPlay(scream);
        }

        setTimeout(()=>{

            document.body.style.background="black";
            document.body.innerHTML=
                "<h1 style='color:red;font-family:Arial,sans-serif;font-size:64px;text-align:center;margin-top:40vh;'>YOU SHOULD HAVE LISTENED.</h1>";

        },2000);

    },60);
}


function showHauntedPopup() {

    const popup=document.createElement("div");

    popup.innerText="⚠ Be careful... some stories should not be told.";

    popup.style.position="fixed";
    popup.style.top="40%";
    popup.style.left="50%";
    popup.style.transform="translate(-50%,-50%)";
    popup.style.background="black";
    popup.style.color="red";
    popup.style.padding="30px";
    popup.style.fontSize="26px";
    popup.style.border="2px solid red";
    popup.style.boxShadow="0 0 20px red";
    popup.style.borderRadius="12px";
    popup.style.zIndex="10000";

    document.body.appendChild(popup);

    setTimeout(()=>popup.remove(),5000);
}


function tryPlay(audioElement){

    const playPromise=audioElement.play();

    if(playPromise!==undefined){
        playPromise.catch(()=>{});
    }
}