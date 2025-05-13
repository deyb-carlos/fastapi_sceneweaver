from diffusers import StableDiffusionXLPipeline, AutoencoderKL, UniPCMultistepScheduler
import torch, os
from PIL import Image
from io import BytesIO
import models
from database import SessionLocal
from text_processor import get_resolved_sentences
from s3 import upload_image_to_s3

vae = AutoencoderKL.from_pretrained(
    "madebyollin/sdxl-vae-fp16-fix", torch_dtype=torch.float16, use_safetensors=True
)

pipe = StableDiffusionXLPipeline.from_pretrained(
    "stabilityai/stable-diffusion-xl-base-1.0",
    vae=vae,
    torch_dtype=torch.float16,
    variant="fp16",
    use_safetensors=True,
).to("cuda")

pipe.scheduler = UniPCMultistepScheduler.from_config(pipe.scheduler.config)
pipe.enable_model_cpu_offload()

# Load LoRA weights
pipe.load_lora_weights(
    "safetensors/Storyboard_sketch.safetensors", adapter_name="sketch"
)
pipe.load_lora_weights("safetensors/anglesv2.safetensors", adapter_name="angles")
pipe.set_adapters(["sketch", "angles"], adapter_weights=[0.5, 0.5])

generator = torch.Generator(device="cuda")


def get_dimensions(resolution: str) -> tuple[int, int]:
    resolution_map = {
        "16:9": (1024, 576),
        "1:1": (1024, 1024),
        "9:16": (576, 1024),
    }
    return resolution_map.get(resolution, (1024, 1024))


def generate_batch_images(story: str, storyboard_id: int, resolution: str = "1:1"):
    db = SessionLocal()
    try:
        prompts = get_resolved_sentences(story)
        width, height = get_dimensions(resolution)

        for num, prompt in enumerate(prompts):
            result = pipe(
                prompt=f"Storyboard sketch of {prompt}, black and white, cinematic, high quality",
                negative_prompt="ugly, deformed, disfigured, poor details, bad anatomy, abstract, bad physics",
                guidance_scale=8.5,
                height=height,
                width=width,
                num_inference_steps=30,
                generator=generator,
            )

            image = result.images[0]
            buf = BytesIO()
            image.save(buf, format="JPEG")
            buf.seek(0)

            s3_url = upload_image_to_s3(
                buf.read(), f"image_{num + 1}.jpg", folder=f"storyboards/{storyboard_id}"
            )

            db_image = models.Image(
                storyboard_id=storyboard_id, image_path=s3_url, caption=prompt
            )
            db.add(db_image)
            db.commit()  # Commit after each image
            db.refresh(db_image)  # Optional, in case you want to return/use it immediately

    except Exception as e:
        print(f"Error during image generation: {e}")
        db.rollback()
    finally:
        db.close()

