  // ==================================================
  // 22. 3D 아이소메트릭 복셀 마을 (마을 화면 리메이크)
  // ==================================================
  const V_W = 720, V_H = 470;
  const V_TW = 56, V_TH = 28, V_BH = 15;
  const V_OX = 360, V_OY = 66, V_N = 11, V_C = 5.5, V_R = 5.2;

  const V_SITES = [
    { key: "shop", gx: 2.4, gy: 4.0, w: 2.2, d: 2.0, lz: 2.1 },
    { key: "portal", gx: 4.4, gy: 4.4, w: 2.2, d: 2.2, lz: 2.2 },
    { key: "forge", gx: 1.6, gy: 7.4, w: 2.1, d: 1.7, lz: 2.0 },
    { key: "town", gx: 7.0, gy: 2.4, w: 2.4, d: 1.9, lz: 2.2 }
  ];

  // 아이소메트릭 좌표 -> 화면 좌표 (gx,gy: 격자 단위, gz: 블록 높이 단위)
  function vp(gx, gy, gz) {
    const x = V_OX + (gx - gy) * V_TW / 2;
    const y = V_OY + (gx + gy) * V_TH / 2 - (gz || 0) * V_BH;
    return [Math.round(x * 10) / 10, Math.round(y * 10) / 10];
  }
  function vpoly(pts, fill, extra) {
    let d = "";
    for (let i = 0; i < pts.length; i++) d += (i ? " " : "") + pts[i][0] + "," + pts[i][1];
    return '<polygon points="' + d + '" fill="' + fill + '"' + (extra || "") + "/>";
  }
  function vhash(a, b, c) {
    let h = Math.imul(a + 17, 374761393) ^ Math.imul(b + 31, 668265263) ^ Math.imul((c || 0) + 7, 1274126177);
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    h = h ^ (h >>> 16);
    return (h >>> 0) / 4294967296;
  }
  // 섬 형태 (초타원 + 가장자리 요철)
  function vInside(xc, yc) {
    const dx = Math.abs(xc - V_C) / V_R;
    const dy = Math.abs(yc - V_C) / V_R;
    const d = Math.cbrt(dx * dx * dx + dy * dy * dy);
    const jag = (vhash(Math.floor(xc), Math.floor(yc), 1) - 0.5) * 0.2;
    return d <= 1 + jag;
  }
  // 복셀 상자 (윗면 + 좌면 + 우면)
  function vbox(gx, gy, gz, w, d, h, c) {
    const z0 = gz, z1 = gz + h;
    return vpoly([vp(gx, gy + d, z1), vp(gx + w, gy + d, z1), vp(gx + w, gy + d, z0), vp(gx, gy + d, z0)], c.left || c.top) +
      vpoly([vp(gx + w, gy, z1), vp(gx + w, gy + d, z1), vp(gx + w, gy + d, z0), vp(gx + w, gy, z0)], c.right || c.top) +
      vpoly([vp(gx, gy, z1), vp(gx + w, gy, z1), vp(gx + w, gy + d, z1), vp(gx, gy + d, z1)], c.top);
  }

  /* ---------- 소품 ---------- */
  function vTree(gx, gy, s) {
    const trunk = { top: "#8a5f3a", left: "#774d2c", right: "#63401f" };
    const leaves = [
      { top: "#63b342", left: "#54a137", right: "#42842c" },
      { top: "#71c14d", left: "#5cab3e", right: "#498e30" },
      { top: "#80cf5a", left: "#68b647", right: "#529538" }
    ];
    return vbox(gx - 0.08, gy - 0.08, 0, 0.16, 0.16, 0.85 * s, trunk) +
      vbox(gx - 0.42 * s, gy - 0.42 * s, 0.8 * s, 0.84 * s, 0.84 * s, 0.5 * s, leaves[0]) +
      vbox(gx - 0.33 * s, gy - 0.33 * s, 1.2 * s, 0.66 * s, 0.66 * s, 0.44 * s, leaves[1]) +
      vbox(gx - 0.22 * s, gy - 0.22 * s, 1.58 * s, 0.44 * s, 0.44 * s, 0.38 * s, leaves[2]);
  }
  function vRock(gx, gy, s) {
    return vbox(gx - 0.24 * s, gy - 0.24 * s, 0, 0.48 * s, 0.48 * s, 0.26 * s, { top: "#9aa4b4", left: "#7d8797", right: "#68717f" }) +
      vbox(gx - 0.06 * s, gy - 0.06 * s, 0.26 * s, 0.26 * s, 0.26 * s, 0.16 * s, { top: "#b3bdcb", left: "#8f99a8", right: "#788290" });
  }
  function vFlower(gx, gy, col) {
    const p = vp(gx, gy, 0.06);
    return '<circle cx="' + (p[0] - 4) + '" cy="' + (p[1] - 1) + '" r="1.9" fill="' + col + '"/>' +
      '<circle cx="' + (p[0] + 4) + '" cy="' + (p[1] + 1) + '" r="1.6" fill="' + col + '" opacity="0.9"/>' +
      '<circle cx="' + p[0] + '" cy="' + (p[1] - 3) + '" r="1.4" fill="#fff6a8" opacity="0.85"/>';
  }
  function vLamp(gx, gy) {
    const p = vp(gx, gy, 1.62);
    return vbox(gx - 0.06, gy - 0.06, 0, 0.12, 0.12, 1.55, { top: "#93a7c9", left: "#7386a6", right: "#5c6c88" }) +
      '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="20" fill="#ffbe0b" opacity="0.18" filter="url(#vBlurSm)"/>' +
      '<circle class="lampBulb" cx="' + p[0] + '" cy="' + p[1] + '" r="5.4" fill="#ffe9a8" opacity="0.25" stroke="#ffbe0b" stroke-width="1.1"/>';
  }

  /* ---------- 상점 (시장 노점) ---------- */
  function vShop(gx, gy) {
    const wood = { top: "#b98147", left: "#9c6a39", right: "#7f542c" };
    const woodD = { top: "#8f6234", left: "#7a5129", right: "#654021" };
    const cream = { top: "#f4e9d4", left: "#e4d7bd", right: "#cfc0a0" };
    let s = "";
    s += vbox(gx - 0.05, gy - 0.05, 0, 2.3, 2.1, 0.18, woodD);           // 데크
    s += vbox(gx, gy + 0.03, 0.18, 2.2, 0.14, 1.15, cream);              // 뒷벽
    s += vbox(gx, gy, 0.18, 0.14, 0.14, 1.48, wood);
    s += vbox(gx + 2.06, gy, 0.18, 0.14, 0.14, 1.48, wood);
    s += vbox(gx, gy + 1.9, 0.18, 0.14, 0.14, 1.24, wood);
    s += vbox(gx + 2.06, gy + 1.9, 0.18, 0.14, 0.14, 1.24, wood);
    // 줄무늬 차양
    const zBack = 1.66, zFront = 1.3, seg = 2.2 / 6;
    for (let i = 0; i < 6; i++) {
      const c = i % 2 === 0 ? "#e63946" : "#f7f3e9";
      s += vpoly([vp(gx + i * seg, gy - 0.06, zBack), vp(gx + (i + 1) * seg, gy - 0.06, zBack),
        vp(gx + (i + 1) * seg, gy + 2.13, zFront), vp(gx + i * seg, gy + 2.13, zFront)], c, ' stroke="#00000012" stroke-width="0.7"');
      s += vpoly([vp(gx + i * seg, gy + 2.13, zFront), vp(gx + (i + 1) * seg, gy + 2.13, zFront),
        vp(gx + (i + 1) * seg, gy + 2.13, zFront - 0.16), vp(gx + i * seg, gy + 2.13, zFront - 0.16)], c, ' opacity="0.92"');
    }
    // 카운터
    s += vbox(gx + 0.14, gy + 1.22, 0.18, 1.9, 0.52, 0.44, wood);
    s += vpoly([vp(gx + 0.14, gy + 1.22, 0.62), vp(gx + 2.04, gy + 1.22, 0.62), vp(gx + 2.04, gy + 1.74, 0.62), vp(gx + 0.14, gy + 1.74, 0.62)], "#d99a55");
    // 상자 · 통
    s += vbox(gx + 0.16, gy + 0.28, 0.18, 0.42, 0.42, 0.36, { top: "#c8a05e", left: "#ab8547", right: "#8d6b37" });
    s += vbox(gx + 0.62, gy + 0.3, 0.18, 0.36, 0.36, 0.28, { top: "#c8a05e", left: "#ab8547", right: "#8d6b37" });
    s += vbox(gx + 1.55, gy + 0.34, 0.18, 0.4, 0.4, 0.44, { top: "#a8753f", left: "#8d5f31", right: "#734c25" });
    // 카운터 위 물약
    s += vbox(gx + 0.34, gy + 1.36, 0.62, 0.11, 0.11, 0.2, { top: "#7be0ff", left: "#38b6ff", right: "#1f8fd6" });
    s += vbox(gx + 0.62, gy + 1.36, 0.62, 0.11, 0.11, 0.2, { top: "#ff9db5", left: "#ff5c86", right: "#d63c66" });
    s += vbox(gx + 0.9, gy + 1.36, 0.62, 0.11, 0.11, 0.2, { top: "#b6f28a", left: "#7ed957", right: "#5fa93c" });
    // 현수막 표지판
    s += vbox(gx + 0.62, gy + 2.0, 1.06, 0.96, 0.08, 0.34, { top: "#ffd166", left: "#e0a72f", right: "#c08c1e" });
    return s;
  }

  /* ---------- 대장간 ---------- */
  function vForge(gx, gy) {
    const stone = { top: "#818b99", left: "#6a727f", right: "#565d69" };
    const stoneD = { top: "#5f6874", left: "#4f5763", right: "#414852" };
    const slate = { top: "#414754", left: "#363c47", right: "#2c313b" };
    let s = "";
    s += vbox(gx, gy, 0, 2.1, 1.7, 1.02, stone);
    s += vbox(gx - 0.12, gy - 0.12, 1.02, 2.34, 1.94, 0.16, slate);
    s += vbox(gx + 1.46, gy + 0.22, 1.18, 0.4, 0.4, 0.86, stoneD);
    // 화로 입구
    s += vpoly([vp(gx + 0.62, gy + 1.7, 0.66), vp(gx + 1.4, gy + 1.7, 0.66), vp(gx + 1.4, gy + 1.7, 0.06), vp(gx + 0.62, gy + 1.7, 0.06)], "#22140d");
    const fm = vp(gx + 1.01, gy + 1.7, 0.36);
    s += '<ellipse class="v-fire" cx="' + fm[0] + '" cy="' + fm[1] + '" rx="14" ry="7" fill="#ff8a1f" opacity="0.85"/>' +
      '<ellipse class="v-fire2" cx="' + fm[0] + '" cy="' + fm[1] + '" rx="7" ry="4" fill="#ffe08a" opacity="0.9"/>';
    // 굴뚝 연기
    const ch = vp(gx + 1.66, gy + 0.42, 2.1);
    s += '<circle class="smoke-particle" cx="' + ch[0] + '" cy="' + ch[1] + '" r="4.2" fill="#c9d4e6" opacity="0.5"/>' +
      '<circle class="smoke-particle smoke-2" cx="' + (ch[0] + 2) + '" cy="' + (ch[1] - 2) + '" r="3.4" fill="#c9d4e6" opacity="0.4"/>';
    // 모루와 망치
    s += vbox(gx + 1.42, gy + 2.02, 0, 0.26, 0.24, 0.2, { top: "#4b525f", left: "#3c424d", right: "#31363f" });
    s += vbox(gx + 1.34, gy + 1.96, 0.2, 0.44, 0.36, 0.13, { top: "#5b6371", left: "#49505c", right: "#3b414b" });
    // 불티
    const sp = vp(gx + 0.8, gy + 1.95, 1.0);
    s += '<circle class="v-spark" cx="' + sp[0] + '" cy="' + sp[1] + '" r="1.7" fill="#ffd166"/>' +
      '<circle class="v-spark2" cx="' + (sp[0] + 9) + '" cy="' + (sp[1] + 6) + '" r="1.4" fill="#ff8a1f"/>';
    return s;
  }

  /* ---------- 포탈 ---------- */
  function vPortal(gx, gy) {
    const cx = gx + 1.1, cy = gy + 1.1;
    const base = vp(cx, cy, 0.46);
    const ringW = 30, ringH = 38;
    const rcx = base[0], rcy = base[1] - 6 - ringH;
    let s = "";
    // 뒤 광휘
    s += '<ellipse cx="' + rcx + '" cy="' + rcy + '" rx="' + (ringW + 40) + '" ry="' + (ringH + 34) + '" fill="url(#vPortalGlow)" filter="url(#vBlur)"/>';
    // 기단
    s += vbox(gx, gy, 0, 2.2, 2.2, 0.28, { top: "#6a7182", left: "#565d6c", right: "#474d5a" });
    s += vbox(gx + 0.2, gy + 0.2, 0.28, 1.8, 1.8, 0.18, { top: "#7d859a", left: "#666e80", right: "#545a6b" });
    // 링
    s += '<ellipse cx="' + rcx + '" cy="' + rcy + '" rx="' + ringW + '" ry="' + ringH + '" fill="none" stroke="#6e7789" stroke-width="9"/>';
    s += '<ellipse cx="' + rcx + '" cy="' + rcy + '" rx="' + ringW + '" ry="' + ringH + '" fill="none" stroke="#a9b4c8" stroke-width="2.4" opacity="0.75"/>';
    s += '<ellipse cx="' + rcx + '" cy="' + rcy + '" rx="' + (ringW - 4.5) + '" ry="' + (ringH - 4.5) + '" fill="url(#vPortal)"/>';
    // 소용돌이
    s += '<g><animateTransform attributeName="transform" type="rotate" from="0 ' + rcx + ' ' + rcy + '" to="360 ' + rcx + ' ' + rcy + '" dur="10s" repeatCount="indefinite"/>';
    for (let i = 0; i < 3; i++) {
      const k = 0.34 + i * 0.2;
      s += '<ellipse cx="' + rcx + '" cy="' + rcy + '" rx="' + ((ringW - 8) * k).toFixed(1) + '" ry="' + ((ringH - 8) * k).toFixed(1) +
        '" fill="none" stroke="#d6fffa" stroke-width="1.6" opacity="0.6" stroke-dasharray="' + (7 + i * 4) + " " + (5 + i * 3) + '"/>';
    }
    s += "</g>";
    // 회전하는 룬
    s += '<g><animateTransform attributeName="transform" type="rotate" from="360 ' + rcx + ' ' + rcy + '" to="0 ' + rcx + ' ' + rcy + '" dur="16s" repeatCount="indefinite"/>';
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI * 2 * i) / 6;
      const rx2 = (ringW + 9) * Math.cos(a), ry2 = (ringH + 9) * Math.sin(a);
      s += '<circle cx="' + (rcx + rx2).toFixed(1) + '" cy="' + (rcy + ry2).toFixed(1) + '" r="2.6" fill="#9cf6ea" opacity="0.85"/>';
    }
    s += "</g>";
    // 기단 위 빛무리
    s += '<ellipse class="lampBulb" cx="' + base[0] + '" cy="' + (base[1] + 2) + '" rx="' + (ringW + 16) + '" ry="9" fill="#00f5d4" opacity="0.25"/>';
    return { svg: s, anchor: [rcx, rcy - ringH - 16] };
  }

  /* ---------- 마을 (집 여러 채 + 광장) ---------- */
  function vTown(gx, gy) {
    const wallA = { top: "#e8dcc4", left: "#d5c8ac", right: "#c0b294" };
    const wallB = { top: "#dcd2e8", left: "#c9bfd8", right: "#b3a9c4" };
    const wallC = { top: "#e6d6c2", left: "#d2c0aa", right: "#bda992" };
    const roof = { light: "#ffc94a", mid: "#f0a92b", dark: "#c98a1e" };
    const roof2 = { light: "#ff9d6b", mid: "#ef7f4b", dark: "#c96433" };
    let s = "";
    // 뒤쪽 집
    s += vHouse(7.05, 2.45, 1.05, 0.85, 0.78, 0.52, wallA, roof);
    s += vWindows(7.05, 2.45, 1.05, 0.85, 0.78);
    // 오른쪽 큰 집
    s += vHouse(8.28, 2.58, 1.0, 0.8, 0.92, 0.58, wallB, roof);
    s += vWindows(8.28, 2.58, 1.0, 0.8, 0.92);
    // 앞쪽 집
    s += vHouse(7.55, 3.5, 0.95, 0.75, 0.66, 0.48, wallC, roof2);
    s += vWindows(7.55, 3.5, 0.95, 0.75, 0.66);
    // 깃대
    s += vbox(8.62, 3.18, 0, 0.09, 0.09, 1.75, { top: "#cfd6e2", left: "#a9b1c0", right: "#8d94a3" });
    const fp = vp(8.71, 3.22, 1.72);
    s += '<path class="v-flag" d="M' + fp[0] + ',' + fp[1] + ' l17,5 l-17,6 z" fill="#7ed957" opacity="0.95"/>';
    // 광장 우물
    s += vbox(7.02, 3.62, 0, 0.5, 0.5, 0.26, { top: "#8b93a3", left: "#767e8d", right: "#626a78" });
    s += vpoly([vp(7.08, 3.68, 0.27), vp(7.46, 3.68, 0.27), vp(7.46, 4.06, 0.27), vp(7.08, 4.06, 0.27)], "#3fa9e0");
    return s;
  }

  function vHouse(gx, gy, w, d, wh, rh, wall, roof) {
    let s = vbox(gx, gy, 0, w, d, wh, wall);
    const apex = vp(gx + w / 2, gy + d / 2, wh + rh);
    const p1 = vp(gx, gy, wh), p2 = vp(gx + w, gy, wh), p3 = vp(gx + w, gy + d, wh), p4 = vp(gx, gy + d, wh);
    s += vpoly([p1, p2, apex], roof.dark);
    s += vpoly([p4, p1, apex], roof.dark);
    s += vpoly([p2, p3, apex], roof.mid);
    s += vpoly([p3, p4, apex], roof.light);
    return s;
  }
  function vWindows(gx, gy, w, d, wh) {
    let s = "";
    s += vpoly([vp(gx + w * 0.2, gy + d, wh * 0.74), vp(gx + w * 0.44, gy + d, wh * 0.74),
      vp(gx + w * 0.44, gy + d, wh * 0.32), vp(gx + w * 0.2, gy + d, wh * 0.32)], "#ffd76a", ' class="windowLight" opacity="0.1"');
    s += vpoly([vp(gx + w, gy + d * 0.18, wh * 0.74), vp(gx + w, gy + d * 0.44, wh * 0.74),
      vp(gx + w, gy + d * 0.44, wh * 0.32), vp(gx + w, gy + d * 0.18, wh * 0.32)], "#ffd76a", ' class="windowLight" opacity="0.1"');
    s += vpoly([vp(gx + w * 0.58, gy + d, wh * 0.82), vp(gx + w * 0.84, gy + d, wh * 0.82),
      vp(gx + w * 0.84, gy + d, 0), vp(gx + w * 0.58, gy + d, 0)], "#5a3a22");
    return s;
  }

  function vBuildingGroup(kind, label, inner, padPt) {
    return '<g class="v-building" data-kind="' + kind + '" role="button" tabindex="0" aria-label="' + label + ' 열기">' +
      '<g class="v-building-body">' +
      '<ellipse class="v-pad" cx="' + padPt[0] + '" cy="' + padPt[1] + '" rx="74" ry="30" fill="#00f5d4" opacity="0.16" filter="url(#vBlurSm)"/>' +
      inner + "</g></g>";
  }

  /* ---------- 마을 전체 SVG ---------- */
  function buildVillageSvg() {
    const pathSet = new Set();
    for (let x = 0; x < V_N; x++) {
      for (let y = 0; y < V_N; y++) {
        if (Math.abs((x + 0.5) - V_C) <= 1.0 || Math.abs((y + 0.5) - V_C) <= 1.0) pathSet.add(x + "," + y);
      }
    }
    V_SITES.forEach(s => {
      for (let x = Math.floor(s.gx - 0.7); x <= Math.ceil(s.gx + s.w + 0.6); x++)
        for (let y = Math.floor(s.gy - 0.7); y <= Math.ceil(s.gy + s.d + 0.6); y++) pathSet.add(x + "," + y);
    });
    const nearSite = (x, y) => V_SITES.some(s => x + 0.5 > s.gx - 1.0 && x + 0.5 < s.gx + s.w + 1.0 && y + 0.5 > s.gy - 1.0 && y + 0.5 < s.gy + s.d + 1.0);

    const GRASS = ["#8fd35f", "#7fc64f", "#9adc6b", "#86cc57"];
    const PATH = ["#d6bd92", "#cdb083", "#e0c99e"];
    const DIRT_L = ["#8a6440", "#7a5736", "#6b4a2d", "#5c3f26"];
    const DIRT_R = ["#77532f", "#684728", "#5b3d22", "#4e331b"];

    const cells = [];
    for (let x = 0; x < V_N; x++) for (let y = 0; y < V_N; y++) if (vInside(x + 0.5, y + 0.5)) cells.push([x, y]);
    cells.sort((a, b) => (a[0] + a[1]) - (b[0] + b[1]) || a[0] - b[0]);

    let terrain = "";
    const decos = [];
    cells.forEach(([x, y]) => {
      const isPath = pathSet.has(x + "," + y);
      const topC = isPath ? PATH[Math.floor(vhash(x, y, 5) * 3)] : GRASS[Math.floor(vhash(x, y, 4) * 4)];
      const depth = 4 + (vhash(x, y, 9) > 0.5 ? 1 : 0);
      for (let k = 0; k < depth; k++) {
        const zt = -k, zb = -k - 1;
        const lc = k === 0 ? (isPath ? "#b99668" : "#6da340") : DIRT_L[Math.min(3, k - 1)];
        const rc = k === 0 ? (isPath ? "#a9875b" : "#5c9038") : DIRT_R[Math.min(3, k - 1)];
        terrain += vpoly([vp(x, y + 1, zt), vp(x + 1, y + 1, zt), vp(x + 1, y + 1, zb), vp(x, y + 1, zb)], lc);
        terrain += vpoly([vp(x + 1, y, zt), vp(x + 1, y + 1, zt), vp(x + 1, y + 1, zb), vp(x + 1, y, zb)], rc);
      }
      terrain += vpoly([vp(x, y, 0), vp(x + 1, y, 0), vp(x + 1, y + 1, 0), vp(x, y + 1, 0)], topC,
        ' stroke="' + (isPath ? "#b2925f" : "#71a844") + '" stroke-width="0.7" stroke-opacity="0.55"');

      if (!isPath && !nearSite(x, y)) {
        const r = vhash(x, y, 21);
        const cx2 = x + 0.5, cy2 = y + 0.5;
        if (r < 0.17) decos.push({ d: x + y, s: vTree(cx2, cy2, 0.85 + vhash(x, y, 31) * 0.4) });
        else if (r < 0.26) decos.push({ d: x + y, s: vFlower(cx2 + 0.1, cy2 - 0.1, vhash(x, y, 41) > 0.5 ? "#ff7aa2" : "#ffe066") });
        else if (r < 0.3) decos.push({ d: x + y, s: vRock(cx2, cy2, 0.9) });
      }
    });
    decos.sort((a, b) => a.d - b.d);
    const decoStr = decos.map(o => o.s).join("");

    // 별
    let stars = "";
    for (let i = 0; i < 54; i++) {
      const sx = Math.round(vhash(i, 1, 3) * V_W);
      const sy = Math.round(vhash(i, 2, 3) * (V_H * 0.62));
      const r = (0.8 + vhash(i, 3, 3) * 1.7).toFixed(1);
      const cls = i % 3 === 1 ? " star-2" : i % 3 === 2 ? " star-3" : "";
      stars += '<circle class="star-twinkle' + cls + '" cx="' + sx + '" cy="' + sy + '" r="' + r +
        '" fill="#ffffff" opacity="' + (0.3 + vhash(i, 4, 3) * 0.5).toFixed(2) + '"/>';
    }

    const shopSite = V_SITES[0], forgeSite = V_SITES[2], townSite = V_SITES[3];
    const shopPad = vp(shopSite.gx + shopSite.w / 2, shopSite.gy + shopSite.d / 2, 0.05);
    const forgePad = vp(forgeSite.gx + forgeSite.w / 2, forgeSite.gy + forgeSite.d / 2, 0.05);
    const townPad = vp(townSite.gx + townSite.w / 2, townSite.gy + townSite.d / 2, 0.05);
    const portalSite = V_SITES[1];
    const portalPad = vp(portalSite.gx + portalSite.w / 2, portalSite.gy + portalSite.d / 2, 0.05);

    const portal = vPortal(portalSite.gx, portalSite.gy);

    // 건물 배치 (뒤 -> 앞)
    const buildList = [
      { d: shopSite.gx + shopSite.gy, s: vBuildingGroup("shop", "상점", vShop(shopSite.gx, shopSite.gy), shopPad) },
      { d: portalSite.gx + portalSite.gy, s: vBuildingGroup("portal", "포탈", portal.svg, portalPad) },
      { d: forgeSite.gx + forgeSite.gy, s: vBuildingGroup("forge", "대장간", vForge(forgeSite.gx, forgeSite.gy), forgePad) },
      { d: townSite.gx + townSite.gy, s: vBuildingGroup("town", "마을", vTown(townSite.gx, townSite.gy), townPad) }
    ].sort((a, b) => a.d - b.d).map(o => o.s).join("");

    const svg = '<svg class="villageArt tod-day" viewBox="0 0 ' + V_W + " " + V_H + '" xmlns="http://www.w3.org/2000/svg" ' +
      'role="img" aria-label="코덱스 3D 아이소메트릭 마을" preserveAspectRatio="xMidYMid meet">' +
      '<defs>' +
      '<linearGradient id="vSky" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0%" stop-color="#0a1230"/><stop offset="45%" stop-color="#152246"/><stop offset="100%" stop-color="#070a18"/>' +
      "</linearGradient>" +
      '<radialGradient id="vVoid" cx="50%" cy="60%" r="55%">' +
      '<stop offset="0%" stop-color="#2f6bff" stop-opacity="0.5"/><stop offset="55%" stop-color="#7b2cbf" stop-opacity="0.18"/>' +
      '<stop offset="100%" stop-color="#000000" stop-opacity="0"/></radialGradient>' +
      '<radialGradient id="vPortal" cx="50%" cy="50%" r="50%">' +
      '<stop offset="0%" stop-color="#eafffb" stop-opacity="0.95"/><stop offset="35%" stop-color="#00f5d4" stop-opacity="0.85"/>' +
      '<stop offset="70%" stop-color="#7b2cbf" stop-opacity="0.8"/><stop offset="100%" stop-color="#12062a" stop-opacity="0.92"/></radialGradient>' +
      '<radialGradient id="vPortalGlow" cx="50%" cy="50%" r="50%">' +
      '<stop offset="0%" stop-color="#00f5d4" stop-opacity="0.55"/><stop offset="60%" stop-color="#7b2cbf" stop-opacity="0.22"/>' +
      '<stop offset="100%" stop-color="#000000" stop-opacity="0"/></radialGradient>' +
      '<filter id="vBlur" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="10"/></filter>' +
      '<filter id="vBlurSm" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="4"/></filter>' +
      "</defs>" +
      '<rect width="' + V_W + '" height="' + V_H + '" fill="url(#vSky)"/>' +
      '<ellipse cx="' + (V_W / 2) + '" cy="' + (V_H * 0.68) + '" rx="' + (V_W * 0.52) + '" ry="' + (V_H * 0.46) + '" fill="url(#vVoid)"/>' +
      "<g>" + stars + "</g>" +
      '<circle id="skyGlow" cx="600" cy="58" r="42" fill="#ffbe0b" opacity="0.45" filter="url(#vBlur)"/>' +
      '<circle id="skyBody" cx="600" cy="58" r="20" fill="#fff6cf"/>' +
      '<ellipse cx="' + (V_W / 2) + '" cy="' + (V_H - 40) + '" rx="250" ry="26" fill="#000000" opacity="0.35" filter="url(#vBlur)"/>' +
      "<g>" + terrain + decoStr +
      vLamp(3.9, 6.6) + vLamp(6.9, 3.85) + vLamp(6.6, 7.2) +
      "</g>" + buildList +
      '<rect class="v-tint v-tint-morning" width="' + V_W + '" height="' + V_H + '" fill="#ff9d5c" fill-opacity="0.14"/>' +
      '<rect class="v-tint v-tint-day" width="' + V_W + '" height="' + V_H + '" fill="#ffe9a8" fill-opacity="0.05"/>' +
      '<rect class="v-tint v-tint-afternoon" width="' + V_W + '" height="' + V_H + '" fill="#ffb168" fill-opacity="0.1"/>' +
      '<rect class="v-tint v-tint-evening" width="' + V_W + '" height="' + V_H + '" fill="#ff6b3d" fill-opacity="0.2"/>' +
      '<rect class="v-tint v-tint-night" width="' + V_W + '" height="' + V_H + '" fill="#0b1a45" fill-opacity="0.52"/>' +
      "</svg>";

    const anchors = {
      shop: vp(shopSite.gx + shopSite.w / 2, shopSite.gy + shopSite.d / 2, 2.15),
      portal: portal.anchor,
      forge: vp(forgeSite.gx + forgeSite.w / 2, forgeSite.gy + forgeSite.d / 2, 2.05),
      town: vp(townSite.gx + townSite.w / 2, townSite.gy + townSite.d / 2, 2.15)
    };
    return { svg: svg, anchors: anchors };
  }

  /* ---------- 마을 조립 & 라벨 ---------- */
  function buildVillage() {
    const stage = document.getElementById("villageStage");
    if (!stage || stage.querySelector(".villageArt")) return;
    const built = buildVillageSvg();
    stage.insertAdjacentHTML("afterbegin", built.svg);
    const svg = stage.querySelector(".villageArt");
    attachVillageHits(svg);
    buildVillageLabels(built.anchors);
    const loading = document.getElementById("villageLoading");
    if (loading) loading.remove();
  }

  function attachVillageHits(svg) {
    if (!svg) return;
    const names = { shop: "상점", forge: "대장간", portal: "포탈", town: "마을" };
    svg.querySelectorAll(".v-building").forEach(g => {
      const kind = g.getAttribute("data-kind");
      g.addEventListener("click", e => {
        e.stopPropagation();
        window.villageTap(kind);
      });
      g.addEventListener("keydown", e => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          window.villageTap(kind);
        }
      });
      let bb = null;
      try { bb = g.getBBox(); } catch (err) { bb = null; }
      if (!bb || !bb.width) return;
      const pad = 6;
      const r = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      r.setAttribute("x", (bb.x - pad).toFixed(1));
      r.setAttribute("y", (bb.y - pad).toFixed(1));
      r.setAttribute("width", (bb.width + pad * 2).toFixed(1));
      r.setAttribute("height", (bb.height + pad * 2).toFixed(1));
      r.setAttribute("class", "v-hit");
      r.setAttribute("aria-hidden", "true");
      g.insertBefore(r, g.firstChild);
    });
  }

  function buildVillageLabels(anchors) {
    const box = document.getElementById("villageLabels");
    if (!box || !anchors) return;
    const defs = [
      { key: "shop", icon: "🛒", name: "상점" },
      { key: "forge", icon: "⚒️", name: "대장간" },
      { key: "portal", icon: "🌀", name: "포탈" },
      { key: "town", icon: "🏘️", name: "마을" }
    ];
    box.innerHTML = "";
    defs.forEach(d => {
      const a = anchors[d.key];
      if (!a) return;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "village-label " + d.key;
      btn.innerHTML = '<span class="lb-ico">' + d.icon + '</span><span>' + d.name + '</span>';
      btn.style.left = (a[0] / V_W * 100).toFixed(2) + "%";
      btn.style.top = (a[1] / V_H * 100).toFixed(2) + "%";
      btn.setAttribute("aria-label", d.name + " 열기");
      btn.addEventListener("click", e => {
        e.preventDefault();
        e.stopPropagation();
        window.villageTap(d.key);
      });
      box.appendChild(btn);
    });
  }

  /* ---------- 마을 조작 ---------- */
  window.villageTap = function (kind) {
    if (!getCurrentUser()) {
      openAuthModal();
      return;
    }
    Sound.click();
    if (kind === "shop") window.openShopView("sell");
    else if (kind === "forge") window.openShopView("forge");
    else if (kind === "portal") { closeVillageView(); show("map"); }
    else window.openVillageView();
  };

  function setShopView(view) {
    const forge = document.getElementById("forgeSection");
    const sell = document.getElementById("sellSection");
    if (!forge || !sell) return;
    sell.style.display = (view === "sell" || view === "all") ? "" : "none";
    forge.style.display = (view === "forge" || view === "all") ? "" : "none";
    document.querySelectorAll(".shop-view-tab").forEach(b => {
      b.classList.toggle("active", b.getAttribute("data-view") === view);
    });
  }
  window.setShopView = setShopView;

  window.openShopView = function (view) {
    show("shop");
    const target = document.getElementById("shop");
    if (!target || !target.classList.contains("active")) return;
    setShopView(view === "forge" ? "forge" : "sell");
    const section = document.getElementById(view === "forge" ? "forgeSection" : "sellSection");
    if (!section) return;
    setTimeout(() => {
      try { section.scrollIntoView({ behavior: "smooth", block: "start" }); } catch (e) { }
      section.classList.remove("shop-flash");
      void section.offsetWidth;
      section.classList.add("shop-flash");
      setTimeout(() => section.classList.remove("shop-flash"), 1300);
    }, 140);
  };

  window.openVillageView = function () {
    const ov = document.getElementById("villageViewOverlay");
    if (!ov) return;
    const job = getCurrentJob();
    const upg = getJobUpgrade(job.id);
    const st = getPlayerStats();
    const period = getTodPeriod(new Date().getHours());
    const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
    set("vmLevel", "Lv." + state.level);
    set("vmTokens", "🪙 " + state.tokens);
    set("vmJob", job.icon + " " + getJobFullTitle(job, upg));
    set("vmAtkDef", "⚔️ " + st.atk + " / 🛡️ " + st.def);
    set("vmRecord", state.lastEvent || "모험을 시작해보세요.");
    const tod = document.getElementById("vmTod");
    if (tod) {
      tod.textContent = TOD_CONFIG[period].badge;
      tod.className = "vm-tod vm-tod-" + period;
    }
    ov.style.display = "flex";
  };
  window.closeVillageView = function () {
    const ov = document.getElementById("villageViewOverlay");
    if (ov) ov.style.display = "none";
  };
  window.villageViewBackdrop = function (e) {
    if (e.target && e.target.id === "villageViewOverlay") window.closeVillageView();
  };
