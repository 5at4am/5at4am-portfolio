/**
 * Generate all portfolio images via Hugging Face Inference API.
 * Run: npm run generate-images
 * Output: public/images/*.png
 */
import { writeFile, mkdir } from "node:fs/promises";
import { generateImages } from "../src/lib/hf";
import { imagePrompts } from "../src/lib/data";

async function main() {
  console.log("🎨 Generating portfolio images...");

  const prompts = [
    { key: "hero", prompt: imagePrompts.hero },
    { key: "about", prompt: imagePrompts.about },
    { key: "mascot", prompt: imagePrompts.mascot },
    {
      key: "project-rag-data-explorer",
      prompt:
        "Futuristic data visualization dashboard, dark background, glowing orange data streams flowing through neural network nodes, CSV tables transforming into insights, cinematic lighting, premium tech aesthetic, black and orange color scheme",
    },
    {
      key: "project-ai-task-manager",
      prompt:
        "Futuristic AI task management interface, dark UI with glowing orange checkmarks and task cards, robot assistant organizing workflow, cinematic orange lighting on black background, premium tech aesthetic",
    },
  ];

  const results = await generateImages(prompts, 2);

  await mkdir("public/images", { recursive: true });

  let saved = 0;
  for (const [key, dataUrl] of Object.entries(results)) {
    const base64 = dataUrl.split(",")[1];
    const ext = dataUrl.includes("image/jpeg") ? "jpg" : "png";
    const file = `public/images/${key}.${ext}`;
    await writeFile(file, Buffer.from(base64, "base64"));
    console.log(`✅ ${file}`);
    saved++;
  }

  console.log(`\nDone. ${saved}/${prompts.length} images generated.`);
}

main().catch((err) => {
  console.error("Image generation failed:", err);
  process.exit(1);
});