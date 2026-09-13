const HF_TOKEN = process.env.HUGGINGFACE_TOKEN;

export interface GenerateImageOptions {
  prompt: string;
  model?: string;
  width?: number;
  height?: number;
  negativePrompt?: string;
}

const DEFAULT_MODEL = "stabilityai/sdxl-turbo";
const FALLBACK_MODELS = [
  "black-forest-labs/FLUX.1-schnell",
  "stabilityai/stable-diffusion-xl-base-1.0",
];

/**
 * Generate an image via the Hugging Face Inference API.
 * Tries the primary model, then falls back through a list.
 * Returns a data URL (base64) of the generated image.
 */
export async function generateImage(
  options: GenerateImageOptions
): Promise<string> {
  const { prompt, model = DEFAULT_MODEL, width = 1024, height = 1024, negativePrompt } = options;

  const models = [model, ...FALLBACK_MODELS.filter((m) => m !== model)];

  let lastError: unknown = null;

  for (const candidate of models) {
    try {
      const body: Record<string, unknown> = {
        inputs: prompt,
        parameters: {
          width,
          height,
          negative_prompt: negativePrompt ?? "low quality, blurry, watermark, text, logo",
          num_inference_steps: 4,
          guidance_scale: 0,
        },
      };

      const res = await fetch(`https://api-inference.huggingface.co/models/${candidate}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${HF_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(120_000),
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => "");
        lastError = new Error(`HF ${candidate} failed (${res.status}): ${errText.slice(0, 200)}`);
        continue;
      }

      const contentType = res.headers.get("content-type") ?? "";
      if (contentType.includes("application/json")) {
        // Model is loading — wait and retry once
        const json = (await res.json()) as { error?: string };
        if (json.error?.includes("loading")) {
          await new Promise((r) => setTimeout(r, 15_000));
          lastError = new Error(`Model ${candidate} still loading`);
          continue;
        }
        lastError = new Error(`Unexpected JSON response: ${JSON.stringify(json).slice(0, 200)}`);
        continue;
      }

      const buffer = await res.arrayBuffer();
      const base64 = Buffer.from(buffer).toString("base64");
      return `data:${contentType || "image/png"};base64,${base64}`;
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError ?? new Error("Image generation failed");
}

/**
 * Generate multiple images in parallel with a concurrency limit.
 */
export async function generateImages(
  prompts: { key: string; prompt: string }[],
  concurrency = 2
): Promise<Record<string, string>> {
  const results: Record<string, string> = {};
  let index = 0;

  async function worker() {
    while (index < prompts.length) {
      const current = prompts[index++];
      try {
        results[current.key] = await generateImage({ prompt: current.prompt });
      } catch (err) {
        console.error(`Failed to generate "${current.key}":`, err);
      }
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, prompts.length) }, () => worker());
  await Promise.all(workers);
  return results;
}