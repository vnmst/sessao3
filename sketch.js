// --- CONFIGURAÇÕES ---
let fundo;
let sons = {};
let palavras = {};
let frasesAtivas = [];
let startTime;

let delay;
let efeitoAtivo = false;
let glitchAtivo = false;
let glitchTempo = 0;

let flashImagens = {};
let flashAtivo = false;
let flashImagem = null;
let flashTimer = 0;

// Cores criadas no setup()
let cores = [];
let corIndex = 0;

let pitchGeral = 1.0;
let delayAmt = 0.0;
let audioIniciado = false;

function preload() {

  fundo = loadSound("fundo.mp3");

  sons = {
    'A': loadSound("som1.mp3"),
    'S': loadSound("som6.mp3"),
    'D': loadSound("som2.mp3"),
    'F': loadSound("som11.mp3"),
    'G': loadSound("som12.mp3"),
    'H': loadSound("som10.mp3"),
    'J': loadSound("som4.mp3"),
    'K': loadSound("som9.mp3"),
    'L': loadSound("som3.mp3"),
    'Q': loadSound("som5.mp3"),
    'W': loadSound("som7.mp3"),
    'E': loadSound("som8.mp3"),
  };

  // Flashs — garantir que EXISTEM
  for (let i = 1; i <= 12; i++) {
    if (i !== 11) {   // <-- pula o 11
      flashImagens[i] = loadImage(`flash${i}.png`);
    }
  }

  // 🔥 AQUI estava o erro! Agora está correto:
  palavras = {
    'A': "Atenção!!!",
    'S': "Você",
    'D': "Está Perdendo",
    'F': "Onde",
    'G': "Sua",
    'H': "Presença",
    'J': "Está",
    'K': "AGORA",
    'L': "Se",
    'Q': "Perdendo",
    'W': "ERROR!",
    'E': "Estamos"
  };
}

function setup() {
  createCanvas(width, height);
  background(0);

  fundo.loop();
  fundo.setVolume(0.4);

  delay = new p5.Delay();

  // Cores estilo Matrix > Roxo > Vermelho
  cores = [
    color(0,255,100),   // verde
    color(180,0,255),   // roxo
    color(255,40,40)    // vermelho
  ];

  startTime = millis();
}

function draw() {
  background(0);

  let elapsed = millis() - startTime;
  let intensidade = constrain(map(elapsed, 30000, 90000, 0, 1), 0, 1);

  // alternância de cores
  if (frameCount % 20 === 0) {
    corIndex = (corIndex + 1) % cores.length;
  }
  let corAtual = cores[corIndex];

  // Efeitos de delay e pitch mais intensos com o tempo
  delay.process(fundo, 0.2 * intensidade, 0.5 + 0.3 * intensidade, 1500 + 2000 * intensidade);
  fundo.rate(1 - 0.4 * intensidade);

  // Controle de pitch pelo mouse
  let mouseNormY = map(mouseY, 0, height, 1.5, 0.5);
  pitchGeral = constrain(mouseNormY, 0.5, 1.5);
  fundo.rate(pitchGeral);

  // Controle de delay pelo mouse X
  let mouseNormX = map(mouseX, 0, width, 0, 0.7);
  delayAmt = constrain(mouseNormX, 0, 0.7);
  delay.process(fundo, delayAmt, 0.7, 2000);

  //Mostrar frases
  for (let f of frasesAtivas) {
    fill(red(corAtual), green(corAtual), blue(corAtual), map(f.timeLeft, 0, 1500, 0, 255));
    textSize(32);
    textAlign(CENTER, CENTER);
    text(f.texto, width / 2, height / 2);
    f.timeLeft -= deltaTime;
  }
  frasesAtivas = frasesAtivas.filter(f => f.timeLeft > 0);

  // GLITCH
  if (glitchAtivo) glitchVisual(corAtual, intensidade);

  // FLASH
  if (flashAtivo && flashImagem) {
    push();
    translate(random(-15,15), random(-15,15));
    scale(1 + random(-0.1, 0.1));

    tint(
      red(corAtual) + random(-80,80),
      green(corAtual) + random(-80,80),
      blue(corAtual) + random(-80,80)
    );

    image(flashImagem, 0, 0, width, height);
    pop();

    flashTimer -= deltaTime;
    if (flashTimer <= 0) flashAtivo = false;
  }
}

function glitchVisual(cor, intensidade) {
  push();

  translate(random(-40 * intensidade, 40 * intensidade), random(-40 * intensidade, 40 * intensidade));
  scale(1 + random(-0.3 * intensidade, 0.3 * intensidade));

  blendMode(ADD);

  fill(red(cor),0,0,120); 
  rect(random(width), random(height), random(200,400), random(100,200));

  fill(0,green(cor),0,120); 
  rect(random(width), random(height), random(200,400), random(100,200));

  fill(0,0,blue(cor),120); 
  rect(random(width), random(height), random(200,400), random(100,200));

  blendMode(BLEND);

  pop();

  glitchTempo -= deltaTime;
  if (glitchTempo <= 0) glitchAtivo = false;
}

function keyPressed() {
  let tecla = key.toUpperCase();

  // Sons normais
  if (sons[tecla]) {
    let s = sons[tecla];
    s.play();

    glitchAtivo = true;
    glitchTempo = 400;

    delay.process(s, 0.3, 0.7, 2500);

    frasesAtivas.push({ texto: palavras[tecla], timeLeft: 1500 });
  }

  // FLASH KEYS (12 imagens)
  let flashMap = {
    'T': 1, 'Y': 2, 'U': 3, 'I': 4,
    'O': 5, 'P': 6, '[': 7, ']': 8,
    ';': 9, "'": 10, '2': 12
  }; 

  if (flashMap[tecla]) {
    flashImagem = flashImagens[flashMap[tecla]];
    flashAtivo = true;
    flashTimer = 200;

    glitchAtivo = true;
    glitchTempo = 500;
  }
}

function mousePressed() {
  if (!audioIniciado) {
    userStartAudio()
      .then(() => {
        console.log("Áudio liberado!");
        fundo.loop();       // Inicia o som de fundo
        fundo.setVolume(0.4);
        audioIniciado = true; // Marca que o áudio já foi iniciado
      })
      .catch(err => console.error("Erro ao iniciar áudio:", err));
  }
}
