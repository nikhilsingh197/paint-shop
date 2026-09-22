const fs = require('fs');

function categorizeHex(hex) {
    hex = hex.replace('#', '');
    let r = parseInt(hex.substring(0, 2), 16) / 255;
    let g = parseInt(hex.substring(2, 4), 16) / 255;
    let b = parseInt(hex.substring(4, 6), 16) / 255;
    
    let max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    
    if(max == min){
        h = s = 0; // achromatic
    } else {
        let d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch(max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    
    h = h * 360;
    s = s * 100;
    l = l * 100; 

    if (l < 15) return "greys";
    if (l > 90 && s < 15) return "whites";
    if (s < 12) return "greys";

    if (h < 15 || h >= 340) {
      if (l < 45) return "browns";
      if (s < 40 && l > 70) return "pinks";
      if (l > 65) return "pinks";
      return "reds";
    }
    if (h < 45) {
      if (l < 45) return "browns";
      return "oranges";
    }
    if (h < 70) {
      if (l < 45) return "browns";
      return "yellows";
    }
    if (h < 165) return "greens";
    if (h < 260) return "blues";
    if (h < 315) return "purples";
    if (h < 340) return "pinks";
    
    return "reds";
}

const csvPath = 'C:\\Users\\singh\\.gemini\\antigravity\\brain\\57b0c40e-e627-4bd4-b5da-0cea6fc691e8\\.user_uploaded\\media_1790071585533.csv';
const csvContent = fs.readFileSync(csvPath, 'utf8');
const lines = csvContent.split('\n');

let sqlOutput = `-- Auto-generated SQL script to fix Berger Paints color families\nBEGIN;\n`;
let updatedCount = 0;

for (let i = 1; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) continue;

  const parts = line.split(',');
  if (parts.length < 6) continue;

  const hexCode = parts[parts.length - 2];
  const shadeCode = parts[parts.length - 3];
  const brandName = parts[0];
  const originalFamily = parts[1];
  
  if (brandName === "Berger Paints" && originalFamily === "General") {
    const newFamily = categorizeHex(hexCode);
    const safeShadeCode = shadeCode.replace(/'/g, "''");
    
    sqlOutput += `UPDATE shades SET color_family = '${newFamily}' WHERE shade_code = '${safeShadeCode}';\n`;
    updatedCount++;
  }
}

sqlOutput += `COMMIT;\n`;

fs.writeFileSync('c:/Users/singh/Downloads/paint-shop-main/paint-shop-main/fix_berger_families.sql', sqlOutput);
console.log(`Successfully generated fix_berger_families.sql with ${updatedCount} statements.`);
