import fs from 'fs';
import zlib from 'zlib';

function createMoonPng(outputPath = 'public/assets/moon.png', size = 1024) {
  const width = size;
  const height = size;
  const cx = width / 2.0;
  const cy = height / 2.0;
  const radius = size * 0.465;

  const rgba = Buffer.alloc(width * height * 4);

  // Perlin/Simplex-like noise table
  const gridSize = 64;
  const noiseGrid = [];
  let seed = 42;
  function pseudoRandom() {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  }

  for (let y = 0; y <= gridSize; y++) {
    const row = [];
    for (let x = 0; x <= gridSize; x++) {
      row.push(pseudoRandom());
    }
    noiseGrid.push(row);
  }

  function sampleNoise(x, y, scale = 1.0) {
    const gx = ((x * scale) / width) % 1.0 * (gridSize - 1);
    const gy = ((y * scale) / height) % 1.0 * (gridSize - 1);
    const ix = Math.floor(gx);
    const iy = Math.floor(gy);
    const fx = gx - ix;
    const fy = gy - iy;

    const sx = fx * fx * (3.0 - 2.0 * fx);
    const sy = fy * fy * (3.0 - 2.0 * fy);

    const n00 = noiseGrid[iy][ix];
    const n10 = noiseGrid[iy][ix + 1];
    const n01 = noiseGrid[iy + 1][ix];
    const n11 = noiseGrid[iy + 1][ix + 1];

    return (n00 * (1 - sx) + n10 * sx) * (1 - sy) + (n01 * (1 - sx) + n11 * sx) * sy;
  }

  function fbm(x, y) {
    return (
      sampleNoise(x, y, 2.0) * 0.5 +
      sampleNoise(x, y, 4.0) * 0.25 +
      sampleNoise(x, y, 8.0) * 0.15 +
      sampleNoise(x, y, 16.0) * 0.1
    );
  }

  // Maria definitions: (center_x, center_y, radius_x, radius_y, rotation_deg, depth)
  const maria = [
    // Mare Crisium (Upper right isolated circular/oval basin)
    { mx: cx + radius * 0.65, my: cy - radius * 0.32, mrx: radius * 0.12, mry: radius * 0.09, mrot: -20, mdepth: 0.85 },
    // Mare Serenitatis (Upper right central circular basin)
    { mx: cx + radius * 0.22, my: cy - radius * 0.42, mrx: radius * 0.23, mry: radius * 0.20, mrot: 10, mdepth: 0.78 },
    // Mare Tranquillitatis (Connected middle right dark basin)
    { mx: cx + radius * 0.38, my: cy - radius * 0.08, mrx: radius * 0.26, mry: radius * 0.22, mrot: -15, mdepth: 0.82 },
    // Mare Fecunditatis & Nectaris (Lower right plains)
    { mx: cx + radius * 0.48, my: cy + radius * 0.28, mrx: radius * 0.22, mry: radius * 0.24, mrot: 25, mdepth: 0.75 },
    { mx: cx + radius * 0.32, my: cy + radius * 0.36, mrx: radius * 0.12, mry: radius * 0.12, mrot: 0, mdepth: 0.70 },
    // Mare Imbrium (Major upper left circular basin)
    { mx: cx - radius * 0.28, my: cy - radius * 0.38, mrx: radius * 0.36, mry: radius * 0.32, mrot: -10, mdepth: 0.80 },
    // Mare Frigoris (Northern strip)
    { mx: cx - radius * 0.05, my: cy - radius * 0.74, mrx: radius * 0.45, mry: radius * 0.08, mrot: 5, mdepth: 0.65 },
    // Oceanus Procellarum (Expansive western plain)
    { mx: cx - radius * 0.55, my: cy - radius * 0.08, mrx: radius * 0.35, mry: radius * 0.45, mrot: 15, mdepth: 0.75 },
    // Mare Nubium (South central plain)
    { mx: cx - radius * 0.16, my: cy + radius * 0.32, mrx: radius * 0.24, mry: radius * 0.22, mrot: -10, mdepth: 0.75 },
    // Mare Humorum (Left lower circular plain)
    { mx: cx - radius * 0.52, my: cy + radius * 0.30, mrx: radius * 0.13, mry: radius * 0.13, mrot: 0, mdepth: 0.78 },
    // Sinus Medii & Central connectors
    { mx: cx - radius * 0.02, my: cy - radius * 0.02, mrx: radius * 0.16, mry: radius * 0.14, mrot: 0, mdepth: 0.68 }
  ];

  // Precompute cos and sin for maria
  maria.forEach((m) => {
    const rad = (m.mrot * Math.PI) / 180.0;
    m.cos = Math.cos(rad);
    m.sin = Math.sin(rad);
  });

  // Major Impact Ray Craters
  const tycho = { cx: cx - radius * 0.11, cy: cy + radius * 0.55, cr: radius * 0.04, int: 1.25, len: radius * 1.25 };
  const copernicus = { cx: cx - radius * 0.31, cy: cy - radius * 0.18, cr: radius * 0.035, int: 0.95, len: radius * 0.55 };
  const kepler = { cx: cx - radius * 0.58, cy: cy - radius * 0.12, cr: radius * 0.02, int: 0.85, len: radius * 0.35 };
  const aristarchus = { cx: cx - radius * 0.55, cy: cy - radius * 0.38, cr: radius * 0.018, int: 1.15, len: radius * 0.25 };
  const rayCraters = [tycho, copernicus, kepler, aristarchus];

  for (let y = 0; y < height; y++) {
    const dy = y - cy;
    for (let x = 0; x < width; x++) {
      const dx = x - cx;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Outside circular moon edge: pure transparency
      if (dist > radius + 1.0) {
        continue;
      }

      let edgeAlpha = 1.0;
      if (dist > radius - 1.0) {
        edgeAlpha = Math.max(0.0, Math.min(1.0, (radius + 1.0 - dist) / 2.0));
      }

      const normDist = dist / radius;

      // 3D Spherical volume & limb darkening
      const lx = x - (cx - radius * 0.2);
      const ly = y - (cy - radius * 0.2);
      const lightDist = Math.sqrt(lx * lx + ly * ly) / (radius * 1.2);
      let sphereShading = 1.0 - lightDist * 0.2;
      if (normDist > 0.85) {
        sphereShading -= (normDist - 0.85) * 0.65;
      }

      // Base highland regolith color: warm cream/ivory (#FAF7EE to #E4D8BE)
      const baseNoise = fbm(x, y);
      let r = 250.0 - normDist * 18.0 + baseNoise * 12.0;
      let g = 244.0 - normDist * 22.0 + baseNoise * 10.0;
      let b = 230.0 - normDist * 35.0 + baseNoise * 8.0;

      // Mare Volcanic Basins
      let mareIntensity = 0.0;
      for (let i = 0; i < maria.length; i++) {
        const m = maria[i];
        const mdx = x - m.mx;
        const mdy = y - m.my;
        const rxLocal = mdx * m.cos + mdy * m.sin;
        const ryLocal = -mdx * m.sin + mdy * m.cos;

        const noiseOffset = (fbm(x * 1.5, y * 1.5) - 0.5) * 0.35;
        const ellDist = Math.sqrt((rxLocal / m.mrx) ** 2 + (ryLocal / m.mry) ** 2) + noiseOffset;

        if (ellDist < 1.0) {
          const weight = (1.0 - ellDist) * m.mdepth;
          if (weight > mareIntensity) mareIntensity = weight;
        }
      }

      if (mareIntensity > 0.0) {
        mareIntensity = Math.min(1.0, mareIntensity * 1.45);
        // Slate-taupe basalt tones
        let mr = 145.0 + baseNoise * 20.0;
        let mg = 132.0 + baseNoise * 18.0;
        let mb = 118.0 + baseNoise * 15.0;

        if (mareIntensity > 0.6) {
          const coreFactor = (mareIntensity - 0.6) / 0.4;
          mr -= coreFactor * 35.0;
          mg -= coreFactor * 32.0;
          mb -= coreFactor * 28.0;
        }

        r = r * (1.0 - mareIntensity) + mr * mareIntensity;
        g = g * (1.0 - mareIntensity) + mg * mareIntensity;
        b = b * (1.0 - mareIntensity) + mb * mareIntensity;
      }

      // Crater Rays
      let rayBoost = 0.0;
      for (let i = 0; i < rayCraters.length; i++) {
        const rc = rayCraters[i];
        const cdx = x - rc.cx;
        const cdy = y - rc.cy;
        const cdist = Math.sqrt(cdx * cdx + cdy * cdy);

        if (cdist < rc.cr * 1.8) {
          if (cdist < rc.cr * 0.4) {
            const pitWeight = 1.0 - cdist / (rc.cr * 0.4);
            r -= pitWeight * 25.0;
            g -= pitWeight * 25.0;
            b -= pitWeight * 25.0;
          } else {
            const rimWeight = 1.0 - Math.abs(cdist - rc.cr) / (rc.cr * 0.8);
            rayBoost += Math.max(0.0, rimWeight) * 0.6 * rc.int;
          }
        }

        if (cdist > rc.cr * 0.5 && cdist < rc.len) {
          const angle = Math.atan2(cdy, cdx);
          const numRays = 18;
          const spoke = Math.sin(angle * numRays + sampleNoise(x * 0.5, y * 0.5, 4.0) * 3.0);
          if (spoke > 0.3) {
            const distFalloff = 1.0 - cdist / rc.len;
            const spokeIntensity = ((spoke - 0.3) / 0.7) * distFalloff * 0.45 * rc.int;
            rayBoost += spokeIntensity;
          }
        }
      }

      if (rayBoost > 0.0) {
        rayBoost = Math.min(0.65, rayBoost);
        r = r * (1.0 - rayBoost) + 255.0 * rayBoost;
        g = g * (1.0 - rayBoost) + 252.0 * rayBoost;
        b = b * (1.0 - rayBoost) + 240.0 * rayBoost;
      }

      const finalR = Math.min(255, Math.max(0, Math.floor(r * sphereShading)));
      const finalG = Math.min(255, Math.max(0, Math.floor(g * sphereShading)));
      const finalB = Math.min(255, Math.max(0, Math.floor(b * sphereShading)));
      const finalA = Math.min(255, Math.max(0, Math.floor(255 * edgeAlpha)));

      const idx = (y * width + x) * 4;
      rgba[idx] = finalR;
      rgba[idx + 1] = finalG;
      rgba[idx + 2] = finalB;
      rgba[idx + 3] = finalA;
    }
  }

  // PNG Construction with zlib
  function makeCrcTable() {
    let c;
    const crcTable = [];
    for (let n = 0; n < 256; n++) {
      c = n;
      for (let k = 0; k < 8; k++) {
        c = (c & 1) ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      }
      crcTable[n] = c;
    }
    return crcTable;
  }

  const crcTable = makeCrcTable();
  function crc32(buf) {
    let crc = 0 ^ -1;
    for (let i = 0; i < buf.length; i++) {
      crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xff];
    }
    return (crc ^ -1) >>> 0;
  }

  function makeChunk(typeStr, dataBuf) {
    const typeBuf = Buffer.from(typeStr, 'ascii');
    const lenBuf = Buffer.alloc(4);
    lenBuf.writeUInt32BE(dataBuf.length, 0);

    const typeAndData = Buffer.concat([typeBuf, dataBuf]);
    const crcVal = crc32(typeAndData);
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeUInt32BE(crcVal, 0);

    return Buffer.concat([lenBuf, typeAndData, crcBuf]);
  }

  const header = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // 8-bit depth
  ihdrData[9] = 6; // Color type 6 (RGBA)
  ihdrData[10] = 0; // Compression
  ihdrData[11] = 0; // Filter
  ihdrData[12] = 0; // Interlace
  const ihdr = makeChunk('IHDR', ihdrData);

  // Raw Scanlines with filter byte 0 (None)
  const rawScanlines = Buffer.alloc(height * (1 + width * 4));
  const rowStride = width * 4;
  for (let y = 0; y < height; y++) {
    const rawOffset = y * (1 + rowStride);
    rawScanlines[rawOffset] = 0; // Filter None
    rgba.copy(rawScanlines, rawOffset + 1, y * rowStride, (y + 1) * rowStride);
  }

  const compressedData = zlib.deflateSync(rawScanlines, { level: 9 });
  const idat = makeChunk('IDAT', compressedData);
  const iend = makeChunk('IEND', Buffer.alloc(0));

  const pngFile = Buffer.concat([header, ihdr, idat, iend]);
  fs.writeFileSync(outputPath, pngFile);
  console.log(`Wrote image file: ${outputPath} (${pngFile.length} bytes)`);
}

createMoonPng('public/assets/moon.png', 1024);
