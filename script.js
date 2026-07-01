/* ---------- NAV HAMBURGER ---------- */
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');
hamburger.addEventListener('click', () => navLinks.classList.toggle('open'));
navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navLinks.classList.remove('open')));

/* ---------- SCROLL REVEAL ---------- */
const reveals = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); } });
}, { threshold: .12 });
reveals.forEach(r => observer.observe(r));

/* ---------- COUNTER ANIMATION ---------- */
function animateCounters() {
  document.querySelectorAll('[data-count]').forEach(el => {
    const target = +el.dataset.count;
    let current = 0;
    const step = target / 60;
    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      el.textContent = Math.round(current) + (target >= 100 ? '%' : '%');
      if (current >= target) clearInterval(timer);
    }, 20);
  });
}
const heroObserver = new IntersectionObserver(entries => {
  if (entries[0].isIntersecting) { animateCounters(); heroObserver.disconnect(); }
}, { threshold: .5 });
heroObserver.observe(document.getElementById('hero'));

/* ---------- DETECTOR SIMULATOR ---------- */
let selectedIsReal = false;
function selectFace(el, isReal) {
  document.querySelectorAll('.face-option').forEach(o => o.classList.remove('selected'));
  el.classList.add('selected');
  selectedIsReal = isReal;
  // reset
  document.getElementById('labelReal').style.opacity = 0;
  document.getElementById('labelFake').style.opacity = 0;
  document.getElementById('detectorScore').style.opacity = 0;
  document.getElementById('detectorHint').textContent = 'Clique em Analisar para iniciar';
  document.getElementById('detectorResult').style.display = 'none';
  document.getElementById('analyzeBtn').textContent = 'Analisar Mídia';
  clearCanvas();
}

function clearCanvas() {
  const canvas = document.getElementById('scanCanvas');
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#0a1520';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawGrid(ctx, canvas.width, canvas.height);
}

function drawGrid(ctx, w, h) {
  ctx.strokeStyle = 'rgba(0,229,255,0.06)';
  ctx.lineWidth = 1;
  for (let x = 0; x < w; x += 20) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
  for (let y = 0; y < h; y += 20) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
}

clearCanvas();

function runAnalysis() {
  const btn = document.getElementById('analyzeBtn');
  btn.textContent = 'Analisando...';
  btn.disabled = true;

  document.getElementById('labelReal').style.opacity = 0;
  document.getElementById('labelFake').style.opacity = 0;
  document.getElementById('detectorScore').style.opacity = 0;
  document.getElementById('detectorResult').style.display = 'none';
  document.getElementById('detectorHint').textContent = 'Processando camadas neurais...';

  const canvas = document.getElementById('scanCanvas');
  const ctx = canvas.getContext('2d');
  let frame = 0;

  const anim = setInterval(() => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#0a1520'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawGrid(ctx, canvas.width, canvas.height);

    // scanning line
    const scanY = (frame * 3) % canvas.height;
    const grad = ctx.createLinearGradient(0, scanY - 20, 0, scanY + 20);
    grad.addColorStop(0, 'transparent');
    grad.addColorStop(.5, 'rgba(0,229,255,.5)');
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad; ctx.fillRect(0, scanY - 20, canvas.width, 40);

    // random anomaly dots
    if (!selectedIsReal && Math.random() > .7) {
      for (let i = 0; i < 4; i++) {
        ctx.fillStyle = 'rgba(255,59,78,' + (.4 + Math.random() * .5) + ')';
        ctx.beginPath();
        ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, 2 + Math.random() * 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    frame++;
    if (frame > 80) {
      clearInterval(anim);
      showResult();
    }
  }, 16);
}

function showResult() {
  const confidence = selectedIsReal ? (82 + Math.floor(Math.random() * 15)) : (88 + Math.floor(Math.random() * 11));
  const labelReal = document.getElementById('labelReal');
  const labelFake = document.getElementById('labelFake');
  const score = document.getElementById('detectorScore');
  const hint = document.getElementById('detectorHint');
  const result = document.getElementById('detectorResult');
  const btn = document.getElementById('analyzeBtn');

  score.textContent = confidence + '%';
  score.style.opacity = 1;
  score.style.color = selectedIsReal ? 'var(--green)' : 'var(--red)';

  if (selectedIsReal) {
    labelReal.style.opacity = 1;
    hint.textContent = 'Nenhuma anomalia detectada';
    result.innerHTML = '<strong style="color:var(--green)">✓ Conteúdo autêntico.</strong> Metadados consistentes, sem artefatos de manipulação neural detectados. Iluminação e sombras coerentes com o ambiente declarado.';
  } else {
    labelFake.style.opacity = 1;
    hint.textContent = 'Anomalias detectadas nas bordas faciais';
    result.innerHTML = '<strong style="color:var(--red)">⚠ Possível deepfake.</strong> Artefatos detectados: bordas faciais inconsistentes, padrão de piscadas abaixo do normal (4x/min vs. 15-20x/min humano), e compressão diferencial na região dos olhos.';
  }

  result.style.display = 'block';
  btn.textContent = 'Analisar novamente';
  btn.disabled = false;
}

/* ---------- QUIZ ---------- */
const questions = [
  {
    q: "Você recebe um vídeo no WhatsApp de um político fazendo uma declaração polêmica. Qual é a primeira atitude correta?",
    opts: ["Compartilhar imediatamente para alertar os amigos", "Verificar a fonte original e buscar confirmação em veículos confiáveis", "Acreditar se vier de um contato de confiança", "Deletar o vídeo sem ver"],
    correct: 1,
    feedback: "✓ Correto! Antes de compartilhar qualquer conteúdo, especialmente vídeos políticos, é essencial verificar a fonte original. Use o Google para buscar se o evento foi coberto por veículos jornalísticos confiáveis.",
    wrongFeedback: "✗ Incorreto. A atitude correta é sempre verificar a fonte antes de compartilhar. Mesmo vídeos vindos de pessoas de confiança podem ser deepfakes que elas mesmas receberam sem saber."
  },
  {
    q: "Quais características de um rosto em vídeo podem indicar um deepfake?",
    opts: ["Cabelos coloridos e maquiagem exagerada", "Piscadas irregulares, bordas do cabelo borradas e iluminação inconsistente", "Falar muito rápido ou muito devagar", "Usar óculos ou chapéu"],
    correct: 1,
    feedback: "✓ Correto! Deepfakes frequentemente apresentam piscadas fora do ritmo natural, bordas do rosto e cabelo com artefatos digitais, e iluminação do rosto inconsistente com o ambiente ao redor.",
    wrongFeedback: "✗ Incorreto. Os sinais técnicos de deepfake incluem piscadas irregulares (menos de 5x por minuto vs. 15-20 normal), bordas borradas no cabelo/orelhas, e inconsistência na iluminação facial."
  },
  {
    q: "O que é uma 'GAN' no contexto de deepfakes?",
    opts: ["Um aplicativo de edição de vídeo profissional", "Um tipo de câmera de alta resolução", "Rede Generativa Adversarial — dois sistemas de IA que competem para criar e detectar falsificações", "Um protocolo de segurança da internet"],
    correct: 2,
    feedback: "✓ Correto! GANs (Generative Adversarial Networks) são a tecnologia central dos deepfakes. Uma rede 'geradora' cria imagens falsas, enquanto uma rede 'discriminadora' tenta detectar a falsificação. O processo se repete até produzir resultados hiper-realistas.",
    wrongFeedback: "✗ Incorreto. GANs (Redes Generativas Adversariais) consistem em duas IAs que competem: uma gera conteúdo falso e a outra tenta detectar. Essa competição é o que torna os deepfakes tão convincentes."
  },
  {
    q: "Uma foto 'chocante' viral mostra um evento que não aparece em nenhum veículo de notícias conhecido. O mais provável é:",
    opts: ["O evento é tão recente que a imprensa ainda não cobriu", "A imagem foi gerada por IA ou retirada de contexto", "É uma conspiração da mídia para esconder a verdade", "O evento aconteceu em local muito remoto"],
    correct: 1,
    feedback: "✓ Correto! Se um evento importante não aparece em nenhum veículo confiável, a probabilidade de ser desinformação é alta. Sempre faça busca reversa da imagem e pesquise em múltiplas fontes jornalísticas.",
    wrongFeedback: "✗ Incorreto. A ausência de cobertura por veículos confiáveis é um sinal importante. Use a busca reversa de imagem do Google para verificar a origem real da foto."
  },
  {
    q: "Qual dessas práticas NÃO protege sua identidade contra uso indevido de IA?",
    opts: ["Restringir quem pode ver suas fotos nas redes sociais", "Usar o mesmo e-mail e senha em todos os sites para não esquecer", "Ativar autenticação em dois fatores (2FA)", "Usar um gerenciador de senhas"],
    correct: 1,
    feedback: "✓ Correto! Reutilizar senhas é perigoso: se um site vazar, todas as suas contas ficam expostas. Use senhas únicas e um gerenciador como Bitwarden (gratuito) para manter tudo seguro.",
    wrongFeedback: "✗ Incorreto. Usar a mesma senha em todos os sites é uma prática altamente arriscada. Um único vazamento compromete todas as contas. Use senhas únicas e um gerenciador de senhas."
  }
];

let currentQ = 0, score = 0, answered = false;

function loadQuestion() {
  const q = questions[currentQ];
  document.getElementById('quizCounter').textContent = `Pergunta ${currentQ + 1} de ${questions.length}`;
  document.getElementById('quizFill').style.width = ((currentQ / questions.length) * 100) + '%';
  document.getElementById('quizQuestion').textContent = q.q;
  document.getElementById('quizFeedback').style.display = 'none';
  document.getElementById('quizNext').style.display = 'none';
  answered = false;

  const opts = document.getElementById('quizOptions');
  opts.innerHTML = '';
  q.opts.forEach((opt, i) => {
    const div = document.createElement('div');
    div.className = 'quiz-option';
    div.innerHTML = `<div class="option-letter">${String.fromCharCode(65 + i)}</div>${opt}`;
    div.addEventListener('click', () => selectAnswer(i));
    opts.appendChild(div);
  });
}

function selectAnswer(idx) {
  if (answered) return;
  answered = true;
  const q = questions[currentQ];
  const opts = document.querySelectorAll('.quiz-option');
  opts.forEach(o => o.classList.add('disabled'));
  opts[idx].classList.add(idx === q.correct ? 'correct' : 'wrong');
  if (idx !== q.correct) opts[q.correct].classList.
