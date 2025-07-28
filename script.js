const charPrompts = [
  "a ninja blob with red eyes",
  "a spiky hedgehog with electric aura",
  "a flying robot with wings",
  "a cat astronaut in space suit",
  "a round creature with a beak and tiny limbs"
];

const bgPrompts = [
  "a neon cyberpunk city",
  "a haunted forest with fog",
  "a medieval castle interior",
  "a pixel beach sunset",
  "a retro 80s city skyline"
];

const obsPrompts = [
  "spinning laser traps",
  "falling icicles",
  "electric fences",
  "fire shooting cannons",
  "slime puddles with spikes"
];

function getRandomPrompt(type) {
  if (type === "char") return charPrompts[Math.floor(Math.random() * charPrompts.length)];
  if (type === "bg") return bgPrompts[Math.floor(Math.random() * bgPrompts.length)];
  if (type === "obs") return obsPrompts[Math.floor(Math.random() * obsPrompts.length)];
  return "a pixel object";
}

async function generateImage(prompt, previewId, transparent = false, type = "preview", gameType = "Flappy Bird") {
  const img = document.getElementById(previewId);
  img.src = 'http://placehold.co/300x100?text=Loading...';

  try {
    const response = await fetch("http://127.0.0.1:5000/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, transparent, type, gameType })
    });

    const data = await response.json();

    if (data.image_url) {
      const testImage = new Image();
      testImage.onload = () => {
        img.src = `${data.image_url}?t=${Date.now()}`;
      };
      testImage.onerror = () => {
        img.src = 'http://placehold.co/300x100?text=Placeholder';
      };
      testImage.src = `${data.image_url}?t=${Date.now()}`;
    } else {
      img.src = 'http://placehold.co/300x100?text=Error';
    }
  } catch (err) {
    img.src = 'http://placehold.co/300x100?text=API+Error';
  }
}

function setupButtons() {
  const gameTypeSelect = document.getElementById('gameSelect');

  document.getElementById('charGenBtn').onclick = () => {
    const prompt = document.getElementById('charPrompt').value;
    generateImage(prompt, 'charPreview', true, 'char', gameTypeSelect.value);
  };

  document.getElementById('bgGenBtn').onclick = () => {
    const prompt = document.getElementById('bgPrompt').value;
    generateImage(prompt, 'bgPreview', false, 'bg', gameTypeSelect.value);
  };

  document.getElementById('obsGenBtn').onclick = () => {
    const prompt = document.getElementById('obsPrompt').value;
    generateImage(prompt, 'obsPreview', true, 'obs', gameTypeSelect.value);
  };

  document.getElementById('charLuckyBtn').onclick = () => {
    const prompt = getRandomPrompt("char");
    document.getElementById('charPrompt').value = prompt;
  };

  document.getElementById('bgLuckyBtn').onclick = () => {
    const prompt = getRandomPrompt("bg");
    document.getElementById('bgPrompt').value = prompt;
  };

  document.getElementById('obsLuckyBtn').onclick = () => {
    const prompt = getRandomPrompt("obs");
    document.getElementById('obsPrompt').value = prompt;
  };

  document.getElementById('createGameBtn').onclick = async () => {
    const logic = document.getElementById("gameLogic").value.trim();
    const difficulty = document.getElementById("difficultyRange").value;
    const gameType = gameTypeSelect.value;
    const btn = document.getElementById("createGameBtn");

    btn.disabled = true;
    btn.textContent = "Creating...";

    try {
      const response = await fetch("http://127.0.0.1:5000/generate-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logic, difficulty, gameType })
      });

      const data = await response.json();

      if (data.success) {
        document.getElementById("gamePreview").src = `generated_game/game.html?t=${Date.now()}`;
      } else {
        alert("Game generation failed.");
      }
    } catch (err) {
      alert("Something went wrong.");
    }

    btn.disabled = false;
    btn.textContent = "Create Customization";
  };

  document.getElementById("downloadZipBtn").onclick = () => {
    window.location.href = "http://127.0.0.1:5000/download-zip";
  };

  document.getElementById("mobileToggleBtn").onclick = () => {
    const iframe = document.getElementById("gamePreview");
    const button = document.getElementById("mobileToggleBtn");

    if (iframe.classList.contains("mobile")) {
      iframe.classList.remove("mobile");
      iframe.style.width = "100%";
      iframe.style.height = "calc(100% - 100px)";
      button.textContent = "Mobile View";
    } else {
      iframe.classList.add("mobile");
      iframe.style.width = "375px";
      iframe.style.height = "667px";
      button.textContent = "Desktop View";
    }
  };
}

window.onload = setupButtons;