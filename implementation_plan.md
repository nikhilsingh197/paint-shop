# Virtual Painter & Shade Matching Tool

This document outlines the architecture for the new "Visualizer & Color Match" feature, which allows customers to upload/capture photos, extract colors from the real world, and virtually paint their walls.

## Features

1. **Camera / Photo Upload Integration**:
   - Utilize standard `<input type="file" accept="image/*" capture="environment" />` to allow users to either take a photo with their mobile camera or upload from the gallery.

2. **Color Match Mode (Extract Shade from Photo)**:
   - When a user taps on a specific pixel in their uploaded photo, the app will read the RGB values of that pixel using an HTML5 Canvas `getImageData()`.
   - The app will then compute the Euclidean distance in the RGB (or HSL) color space against all Asian Paints/Berger shades stored in your Supabase `shades` table to find the nearest mathematical match.
   - It will display a popup with the recommended shade and a button to view products for that shade.

3. **Virtual Painter Mode (Test Shades on Wall)**:
   - The user selects a shade from the database.
   - When they tap a wall in their photo, we will run a **Flood-Fill Algorithm** in JavaScript.
   - This algorithm will detect continuous pixels of similar color (the wall) and overlay the selected shade's RGB color. 
   - We will use an advanced HSL (Hue, Saturation, Lightness) blending mode so that the wall's natural shadows and lighting textures are preserved, making the paint look realistic rather than a flat digital block.

## Proposed Changes

### [NEW] `src/components/VirtualPainter.tsx`
- A full-screen modal component.
- Contains the Canvas rendering logic, Flood-Fill algorithm, and Nearest-Color matching algorithm.
- Contains UI for zooming, panning, and switching between "Color Match" and "Virtual Paint" modes.

### [MODIFY] `src/App.tsx`
- Add a new "Visualizer" button to the Sidebar and MobileBottomNav.
- Add state to manage the `VirtualPainter` modal.

### [MODIFY] `src/lib/shadeApi.ts` (or similar utility)
- Add a helper function to fetch all shades from Supabase and cache them in memory to ensure real-time color matching without network delay on every tap.

## Open Questions for You
1. **Performance vs Accuracy**: True wall segmentation (where the AI automatically detects edges of the wall perfectly, ignoring windows/doors) requires a heavy Machine Learning backend. Our approach will use "Flood-fill with tolerance" (similar to the Magic Wand tool in Photoshop), which works great but might bleed into adjacent areas if the colors are too similar. Is this acceptable for your current needs?
2. **Where to place the button?**: I plan to add a "Visualizer" or "Camera" icon to the bottom navigation bar and sidebar. Does that sound good?

## User Review Required
Please read through this plan. If you approve of this approach (HTML5 Canvas + Flood-fill + Supabase Shade Matching), click **Proceed** and I will build it immediately!
