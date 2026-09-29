// Canvas 2D drawing that follows img/example-ui.png (FR-10): sketchy sky, drifting clouds,
// green pipes with caps, Ghosty and the bottom score bar.
(function (root) {
  'use strict';
  const FK = root.FlappyKiro || (root.FlappyKiro = {});
  const isNode = typeof module === 'object' && module.exports;
  const dep = (name) => (isNode ? require('./' + name + '.js') : FK[name]);
  const walls = dep('walls');
  const difficulty = dep('difficulty');
  const { createRng } = dep('rng');
  const strings = dep('strings');

  const COLORS = {
    sky: '#8ccfea',
    skyLight: 'rgba(255,255,255,0.18)',
    skyDark: 'rgba(40,110,160,0.14)',
    pipe: '#39a33a',
    pipeLight: '#5cc25a',
    pipeDark: '#1f6e24',
    cap: '#2e8c31',
    ground: '#2d3e50',
    groundLine: 'rgba(255,255,255,0.08)',
    text: '#ffffff',
    cloud: 'rgba(255,255,255,0.92)',
    cloudGlow: 'rgba(255,255,255,0.55)',
  };

  const SCORE_POP_TIME = 0.25;

  function createCanvas(doc, w, h) {
    const c = doc.createElement('canvas');
    c.width = w;
    c.height = h;
    return c;
  }

  // Background texture drawn once: many short, mostly vertical pencil strokes.
  function paintSky(canvas, cfg) {
    const ctx = canvas.getContext('2d');
    const sx = canvas.width / cfg.width;
    const sy = canvas.height / cfg.playHeight;
    ctx.setTransform(sx, 0, 0, sy, 0, 0);
    ctx.fillStyle = COLORS.sky;
    ctx.fillRect(0, 0, cfg.width, cfg.playHeight);
    const rng = createRng(7);
    ctx.lineCap = 'round';
    for (let i = 0; i < 900; i++) {
      const x = rng() * cfg.width;
      const y = rng() * cfg.playHeight;
      const len = 10 + rng() * 60;
      const lean = (rng() - 0.5) * 8;
      ctx.strokeStyle = rng() < 0.5 ? COLORS.skyLight : COLORS.skyDark;
      ctx.lineWidth = 0.6 + rng() * 1.2;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + lean, y + len);
      ctx.stroke();
    }
  }

  function paintGround(canvas, cfg) {
    const ctx = canvas.getContext('2d');
    const h = cfg.height - cfg.playHeight;
    ctx.setTransform(canvas.width / cfg.width, 0, 0, canvas.height / h, 0, 0);
    ctx.fillStyle = COLORS.ground;
    ctx.fillRect(0, 0, cfg.width, h);
    const rng = createRng(11);
    ctx.strokeStyle = COLORS.groundLine;
    for (let i = 0; i < 160; i++) {
      const x = rng() * cfg.width;
      const y = rng() * h;
      ctx.lineWidth = 0.5 + rng();
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + 20 + rng() * 40, y + (rng() - 0.5) * 4);
      ctx.stroke();
    }
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(0, 0, cfg.width, 3);
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function createRenderer({ canvas, cfg, doc, ghostyImage }) {
    const ctx = canvas.getContext('2d');
    let pixelScale = 1;
    let sky = null;
    let ground = null;
    const rng = createRng(3);
    const clouds = Array.from({ length: 6 }, (_, i) => ({
      x: (i / 6) * cfg.width + rng() * 80,
      y: 40 + rng() * (cfg.playHeight - 160),
      w: 60 + rng() * 50,
      h: 36 + rng() * 14,
      depth: 0.15 + rng() * 0.2, // parallax factor relative to wall speed
    }));
    let lastScore = 0;
    let popTimer = 0;

    function resize(scale) {
      pixelScale = Math.max(0.25, scale);
      canvas.width = Math.round(cfg.width * pixelScale);
      canvas.height = Math.round(cfg.height * pixelScale);
      sky = createCanvas(doc, canvas.width, Math.round(cfg.playHeight * pixelScale));
      ground = createCanvas(doc, canvas.width, canvas.height - sky.height);
      paintSky(sky, cfg);
      paintGround(ground, cfg);
    }

    function updateClouds(game, dt, reducedMotion) {
      if (reducedMotion) return;
      const speed = game.state === 'PLAYING' ? difficulty.speedFor(game.score, cfg) : 20;
      const moving = game.state === 'PLAYING' || game.state === 'START' || game.state === 'SETTINGS';
      if (!moving) return;
      for (const c of clouds) {
        c.x -= speed * c.depth * dt;
        if (c.x + c.w < -20) {
          c.x = cfg.width + 20 + rng() * 60;
          c.y = 40 + rng() * (cfg.playHeight - 160);
        }
      }
    }

    function drawClouds() {
      ctx.save();
      ctx.shadowColor = COLORS.cloudGlow;
      ctx.shadowBlur = 14 * pixelScale;
      ctx.fillStyle = COLORS.cloud;
      for (const c of clouds) {
        roundRect(ctx, c.x, c.y, c.w, c.h, c.h / 2.4);
        ctx.fill();
      }
      ctx.restore();
    }

    function drawPipes(game) {
      for (const pair of game.pairs) {
        const [topBody, topCap, bottomCap, bottomBody] = walls.rectsFor(pair, cfg);
        for (const body of [topBody, bottomBody]) {
          if (body.h <= 0) continue;
          ctx.fillStyle = COLORS.pipe;
          ctx.fillRect(body.x, body.y, body.w, body.h);
          ctx.fillStyle = COLORS.pipeLight;
          ctx.fillRect(body.x + 8, body.y, 8, body.h);
          ctx.strokeStyle = COLORS.pipeDark;
          ctx.lineWidth = 2;
          ctx.strokeRect(body.x, body.y, body.w, body.h);
        }
        for (const cap of [topCap, bottomCap]) {
          ctx.fillStyle = COLORS.cap;
          ctx.fillRect(cap.x, cap.y, cap.w, cap.h);
          ctx.strokeStyle = COLORS.pipeDark;
          ctx.lineWidth = 2;
          ctx.strokeRect(cap.x, cap.y, cap.w, cap.h);
        }
      }
    }

    // Used when assets/ghosty.png fails to load (NFR-6.1).
    function drawFallbackGhosty(w, h) {
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = 'rgba(0,0,0,0.25)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, -h * 0.12, w / 2, Math.PI, 0);
      ctx.lineTo(w / 2, h / 2);
      for (let i = 0; i < 4; i++) {
        const x0 = w / 2 - (i * w) / 4;
        ctx.quadraticCurveTo(x0 - w / 8, h / 2 - 8, x0 - w / 4, h / 2);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#111111';
      ctx.beginPath();
      ctx.ellipse(-w * 0.12, -h * 0.12, 3, 4.5, 0, 0, Math.PI * 2);
      ctx.ellipse(w * 0.14, -h * 0.12, 3, 4.5, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    function drawGhosty(game, reducedMotion) {
      const g = cfg.ghosty;
      let y = game.ghosty.y;
      let angle = 0;
      if (!reducedMotion) {
        if (game.state === 'START' || (game.state === 'SETTINGS' && game.returnTo === 'START')) {
          y += Math.sin(game.time * 3) * 8; // idle bob on the start screen
        } else {
          angle = Math.max(-0.45, Math.min(0.8, (game.ghosty.vy / cfg.maxFallSpeed) * 0.9));
        }
      }
      ctx.save();
      ctx.translate(game.ghosty.x, y);
      ctx.rotate(angle);
      // Soft outline so white Ghosty stays visible against the white clouds.
      ctx.shadowColor = 'rgba(20, 50, 80, 0.55)';
      ctx.shadowBlur = 6 * pixelScale;
      if (ghostyImage.ready) {
        ctx.drawImage(ghostyImage.image, -g.drawWidth / 2, -g.drawHeight / 2, g.drawWidth, g.drawHeight);
      } else {
        drawFallbackGhosty(g.drawWidth, g.drawHeight);
      }
      ctx.restore();
    }

    function drawScoreBar(game, dt, reducedMotion) {
      ctx.drawImage(ground, 0, cfg.playHeight, cfg.width, cfg.height - cfg.playHeight);
      if (game.score > lastScore && !reducedMotion) popTimer = SCORE_POP_TIME;
      lastScore = game.score;
      popTimer = Math.max(0, popTimer - dt);
      const scale = 1 + 0.3 * (popTimer / SCORE_POP_TIME);
      ctx.save();
      ctx.translate(cfg.width / 2, cfg.playHeight + (cfg.height - cfg.playHeight) / 2);
      ctx.scale(scale, scale);
      ctx.fillStyle = COLORS.text;
      ctx.font = 'bold 22px system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(strings.scoreBar(game.score, game.highScore), 0, 1);
      ctx.restore();
    }

    function draw(game, dt, { reducedMotion }) {
      if (!sky) resize(pixelScale);
      updateClouds(game, dt, reducedMotion);
      ctx.setTransform(pixelScale, 0, 0, pixelScale, 0, 0);
      ctx.drawImage(sky, 0, 0, cfg.width, cfg.playHeight);
      drawClouds();
      drawPipes(game);
      drawGhosty(game, reducedMotion);
      drawScoreBar(game, dt, reducedMotion);
    }

    return { resize, draw };
  }

  const api = { createRenderer };
  if (isNode) module.exports = api;
  else FK.renderer = api;
})(typeof window !== 'undefined' ? window : globalThis);
