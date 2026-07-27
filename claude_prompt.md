# Persona 3-Inspired Portfolio: Claude Code Implementation Guide

Here is a comprehensive prompt and design guide you can provide to Claude Code to help it build your portfolio exactly like the prototype I designed.

## The Claude Code Prompt

Copy and paste the following prompt into Claude Code:

> **System Prompt / Task Request:**
> I want to build a personal Computer Science portfolio website with a UI heavily inspired by the video game *Persona 3 Reload*. The design should be stylish, moody, and technological, utilizing dark navy backgrounds, electric cyan (#51eefc) and cobalt blue (#1269cc) accents, and sharp geometric shapes.
> 
> **Key Layout & Navigation Feature:**
> Instead of a traditional navbar, the central piece of the UI must be a **spinning dial/radial menu** (inspired by the weapon shop/battle UI in Persona 3). 
> - The screen should be split into three columns: Left (Hero/Bio), Center (The Dial), Right (Dynamic Content Panel).
> - The dial should have 5 segments (About, Projects, Skills, Experience, Contact).
> - The dial must be interactive: dragging, scrolling, or clicking a segment rotates the dial so the active segment is at the top (0 degrees).
> - As the dial rotates, the right panel content should smoothly fade/slide in to match the active section.
> 
> **Visual Aesthetic Requirements:**
> 1. **Color Palette:**
>    - Backgrounds: Deep navy (`#070e1a`) to dark blue (`#0d1f38`).
>    - Primary Accents: Electric cyan (`#51eefc`) and cobalt blue (`#1269cc`).
>    - Secondary Accent: Persona 3 red (`#e8003d`) used sparingly for section numbers or highlights.
>    - Text: Off-white (`#f0f8ff`) for main text, dim blue (`#4a7a9b`) for labels.
> 2. **Typography:**
>    - Use Google Fonts: `Rajdhani` (body), `Barlow Condensed` (headers, uppercase, bold, sometimes italicized for that Persona slant), and `Share Tech Mono` (for small system labels, timestamps, and numbers).
> 3. **UI Elements:**
>    - Include a CRT scanline overlay (`pointer-events: none`).
>    - Add floating, slow-moving geometric shapes (triangles, diamonds, thin rings) in the background with very low opacity.
>    - Include a bottom "Status Bar" with a live clock and a "System Ready" label.
>    - Use sharp, angular cuts for buttons and cards (using CSS `clip-path: polygon(...)`).
> 4. **The Dial:**
>    - The dial should have an outer SVG ring with 60 tick marks.
>    - The center should have a glowing cyan core.
>    - Add spring-physics to the dial rotation so it snaps satisfyingly to the nearest section when dragged and released.
> 
> Please generate the full `index.html`, `style.css`, and `script.js` for this portfolio. Make the code modular, well-commented, and ensure the dial rotation math properly maps the 5 sections to 72-degree increments.

---

## Design Asset Implementation Notes

When Claude generates the code, it will likely use pure CSS for the dial. To get the **exact** high-fidelity look of the prototype I built for you, you will want to replace the background of the dial element with the AI-generated asset I created.

Tell Claude:
> "For the central dial element (`.dial`), set its background to an image (`url('assets/dial_bg.png')`) and use CSS `box-shadow` to add outer glows, rather than building the complex inner rings purely with CSS gradients."

## Interaction Logic (For Claude)
If Claude struggles with the dial math, you can provide it this hint for the JS:
- Sections are at `0, 72, 144, 216, 288` degrees.
- Track `currentAngle` and `targetAngle`.
- Use `requestAnimationFrame` to lerp `currentAngle` toward `targetAngle` using a spring formula: `currentAngle += (targetAngle - currentAngle) * springConstant * deltaTime`.
- On drag, update `currentAngle` directly, track `velocity`, and on release, add velocity to the angle and snap to the nearest multiple of 72.
