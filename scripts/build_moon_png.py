import zlib
import struct
import math
import random

def create_moon_png(output_path="public/assets/moon.png", size=1024):
    width = size
    height = size
    cx = width / 2.0
    cy = height / 2.0
    radius = (size * 0.465)  # Circular boundary
    
    # Initialize RGBA buffer
    rgba = bytearray(width * height * 4)
    
    # Set seed for reproducible fine grain surface texture
    rng = random.Random(42)
    
    # Perlin / Simplex like multi-octave noise approximation
    # Generate 2D noise grid for fractal lunar regolith
    grid_size = 64
    noise_grid = [[rng.random() for _ in range(grid_size + 1)] for _ in range(grid_size + 1)]
    
    def sample_noise(x, y, scale=1.0):
        gx = (x * scale / width) % 1.0 * (grid_size - 1)
        gy = (y * scale / height) % 1.0 * (grid_size - 1)
        ix = int(gx)
        iy = int(gy)
        fx = gx - ix
        fy = gy - iy
        # Smooth interpolation
        sx = fx * fx * (3.0 - 2.0 * fx)
        sy = fy * fy * (3.0 - 2.0 * fy)
        
        n00 = noise_grid[iy][ix]
        n10 = noise_grid[iy][ix + 1]
        n01 = noise_grid[iy + 1][ix]
        n11 = noise_grid[iy + 1][ix + 1]
        
        return (n00 * (1 - sx) + n10 * sx) * (1 - sy) + (n01 * (1 - sx) + n11 * sx) * sy

    def fbm(x, y):
        return (sample_noise(x, y, 2.0) * 0.5 + 
                sample_noise(x, y, 4.0) * 0.25 + 
                sample_noise(x, y, 8.0) * 0.15 + 
                sample_noise(x, y, 16.0) * 0.1)

    # Maria definitions: (center_x, center_y, radius_x, radius_y, rotation_deg, depth)
    maria = [
        # Mare Crisium (Distinct upper right isolated basin)
        (cx + radius * 0.65, cy - radius * 0.32, radius * 0.12, radius * 0.09, -20, 0.75),
        # Mare Serenitatis (Upper right central basin)
        (cx + radius * 0.22, cy - radius * 0.42, radius * 0.23, radius * 0.20, 10, 0.70),
        # Mare Tranquillitatis (Connected middle right basin)
        (cx + radius * 0.38, cy - radius * 0.08, radius * 0.26, radius * 0.22, -15, 0.75),
        # Mare Fecunditatis (Lower right plain)
        (cx + radius * 0.48, cy + radius * 0.28, radius * 0.22, radius * 0.24, 25, 0.68),
        # Mare Nectaris (Lower right small circular basin)
        (cx + radius * 0.32, cy + radius * 0.36, radius * 0.12, radius * 0.12, 0, 0.65),
        # Mare Imbrium (Major upper left circular basin)
        (cx - radius * 0.28, cy - radius * 0.38, radius * 0.36, radius * 0.32, -10, 0.72),
        # Mare Frigoris (Northern strip)
        (cx - radius * 0.05, cy - radius * 0.74, radius * 0.45, radius * 0.08, 5, 0.60),
        # Oceanus Procellarum (Expansive western plain)
        (cx - radius * 0.55, cy - radius * 0.08, radius * 0.35, radius * 0.45, 15, 0.68),
        # Mare Nubium (South central plain)
        (cx - radius * 0.16, cy + radius * 0.32, radius * 0.24, radius * 0.22, -10, 0.68),
        # Mare Humorum (Left lower circular plain)
        (cx - radius * 0.52, cy + radius * 0.30, radius * 0.13, radius * 0.13, 0, 0.70),
        # Sinus Medii & Vaporum (Center connector)
        (cx - radius * 0.02, cy - radius * 0.02, radius * 0.16, radius * 0.14, 0, 0.62)
    ]

    # Major Ray Craters: (center_x, center_y, crater_radius, ray_intensity, ray_length)
    tycho_x = cx - radius * 0.11
    tycho_y = cy + radius * 0.55
    tycho_r = radius * 0.04

    copernicus_x = cx - radius * 0.31
    copernicus_y = cy - radius * 0.18
    copernicus_r = radius * 0.035

    kepler_x = cx - radius * 0.58
    kepler_y = cy - radius * 0.12
    kepler_r = radius * 0.02

    aristarchus_x = cx - radius * 0.55
    aristarchus_y = cy - radius * 0.38
    aristarchus_r = radius * 0.018

    ray_craters = [
        (tycho_x, tycho_y, tycho_r, 1.2, radius * 1.2),
        (copernicus_x, copernicus_y, copernicus_r, 0.9, radius * 0.55),
        (kepler_x, kepler_y, kepler_r, 0.8, radius * 0.35),
        (aristarchus_x, aristarchus_y, aristarchus_r, 1.1, radius * 0.25)
    ]

    for y in range(height):
        dy = y - cy
        for x in range(width):
            dx = x - cx
            dist = math.sqrt(dx * dx + dy * dy)
            
            # Pure transparency outside moon disc with 1.5px antialiasing
            if dist > radius + 1.0:
                continue
            
            edge_alpha = 1.0
            if dist > radius - 1.0:
                edge_alpha = (radius + 1.0 - dist) / 2.0
                edge_alpha = max(0.0, min(1.0, edge_alpha))

            # Base lunar surface normalized distance
            norm_dist = dist / radius
            
            # Subtle 3D Spherical volume / limb-darkening
            # Illumination centered slightly top-left (35% 35%)
            lx = x - (cx - radius * 0.2)
            ly = y - (cy - radius * 0.2)
            light_dist = math.sqrt(lx * lx + ly * ly) / (radius * 1.2)
            sphere_shading = 1.0 - (light_dist * 0.22)
            if norm_dist > 0.85:
                sphere_shading -= (norm_dist - 0.85) * 0.6  # Soft rim falloff

            # Base highland color: warm cream/beige (#FAF7EE to #E4D8BE)
            base_noise = fbm(x, y)
            r = 250.0 - (norm_dist * 18.0) + (base_noise * 12.0)
            g = 244.0 - (norm_dist * 22.0) + (base_noise * 10.0)
            b = 230.0 - (norm_dist * 35.0) + (base_noise * 8.0)

            # Check Mare Influence
            mare_intensity = 0.0
            for mx, my, mrx, mry, mrot, mdepth in maria:
                rad = math.radians(mrot)
                cos_r = math.cos(rad)
                sin_r = math.sin(rad)
                mdx = x - mx
                mdy = y - my
                rx_local = mdx * cos_r + mdy * sin_r
                ry_local = -mdx * sin_r + mdy * cos_r
                
                # Elliptical distance with fractal distortion for natural jagged edges
                noise_offset = (fbm(x * 1.5, y * 1.5) - 0.5) * 0.35
                ell_dist = math.sqrt((rx_local / mrx) ** 2 + (ry_local / mry) ** 2) + noise_offset
                
                if ell_dist < 1.0:
                    weight = (1.0 - ell_dist) * mdepth
                    mare_intensity = max(mare_intensity, weight)

            # Blend Mare volcanic basalts (Warm grey / slate-taupe tone: ~120, 108, 95)
            if mare_intensity > 0.0:
                mare_intensity = min(1.0, mare_intensity * 1.4)
                # Mare color gradient
                mr = 145.0 + (base_noise * 20.0)
                mg = 132.0 + (base_noise * 18.0)
                mb = 118.0 + (base_noise * 15.0)
                
                # Deep basin core
                if mare_intensity > 0.6:
                    core_factor = (mare_intensity - 0.6) / 0.4
                    mr -= core_factor * 35.0
                    mg -= core_factor * 32.0
                    mb -= core_factor * 28.0

                r = r * (1.0 - mare_intensity) + mr * mare_intensity
                g = g * (1.0 - mare_intensity) + mg * mare_intensity
                b = b * (1.0 - mare_intensity) + mb * mare_intensity

            # Calculate Crater Ray Ejecta systems (bright high-albedo streaks)
            ray_boost = 0.0
            for rcx, rcy, rcr, rint, rlen in ray_craters:
                cdx = x - rcx
                cdy = y - rcy
                cdist = math.sqrt(cdx * cdx + cdy * cdy)
                
                # Crater central bowl & bright rim
                if cdist < rcr * 1.8:
                    if cdist < rcr * 0.4:
                        # Central pit
                        pit_weight = 1.0 - (cdist / (rcr * 0.4))
                        r -= pit_weight * 25.0
                        g -= pit_weight * 25.0
                        b -= pit_weight * 25.0
                    else:
                        # Bright elevated rim
                        rim_weight = 1.0 - abs(cdist - rcr) / (rcr * 0.8)
                        ray_boost += max(0.0, rim_weight) * 0.6 * rint

                # Radiating filament rays
                if cdist > rcr * 0.5 and cdist < rlen:
                    angle = math.atan2(cdy, cdx)
                    # Number of ray spokes
                    num_rays = 18
                    spoke = math.sin(angle * num_rays + sample_noise(x * 0.5, y * 0.5, 4.0) * 3.0)
                    if spoke > 0.3:
                        dist_falloff = 1.0 - (cdist / rlen)
                        spoke_intensity = ((spoke - 0.3) / 0.7) * dist_falloff * 0.45 * rint
                        ray_boost += spoke_intensity

            if ray_boost > 0.0:
                ray_boost = min(0.65, ray_boost)
                r = r * (1.0 - ray_boost) + 255.0 * ray_boost
                g = g * (1.0 - ray_boost) + 252.0 * ray_boost
                b = b * (1.0 - ray_boost) + 240.0 * ray_boost

            # Apply final 3D illumination
            r = min(255, max(0, int(r * sphere_shading)))
            g = min(255, max(0, int(g * sphere_shading)))
            b = min(255, max(0, int(b * sphere_shading)))
            a = min(255, max(0, int(255 * edge_alpha)))

            idx = (y * width + x) * 4
            rgba[idx] = r
            rgba[idx + 1] = g
            rgba[idx + 2] = b
            rgba[idx + 3] = a

    # PNG Encoding (RFC 2083 standard)
    def chunk(tag, data):
        return struct.pack('>I', len(data)) + tag + data + struct.pack('>I', zlib.crc32(tag + data) & 0xffffffff)
    
    header = b'\x89PNG\r\n\x1a\n'
    ihdr = chunk(b'IHDR', struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0))
    raw_data = bytearray()
    stride = width * 4
    for y in range(height):
        raw_data.append(0) # Filter byte: None
        raw_data.extend(rgba[y*stride:(y+1)*stride])
    
    idat = chunk(b'IDAT', zlib.compress(bytes(raw_data), 9))
    iend = chunk(b'IEND', b'')
    
    png_bytes = header + ihdr + idat + iend
    with open(output_path, 'wb') as f:
        f.write(png_bytes)
    
    print(f"Successfully generated static image asset: {output_path} ({len(png_bytes)} bytes)")

if __name__ == "__main__":
    create_moon_png("public/assets/moon.png", 1024)
