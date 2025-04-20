import os
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM
import gradio as gr
from unsloth import FastModel

# Set environment for Hugging Face Spaces
os.environ['CUDA_LAUNCH_BLOCKING'] = '1'

# Load the model from Hugging Face Model Hub
model_repo_id = 'adarsh3601/my_gemma3_pt'

# Load model and tokenizer using FastModel
model, tokenizer = FastModel.from_pretrained(
    model_name=model_repo_id,
    max_seq_length=2048,
    load_in_4bit=True,  # Load model with 4-bit quantization
    load_in_8bit=False,
    full_finetuning=False
)

# Function to generate text based on user input
def generate_text(user_input):
    # Prepare the input as per the model's expected format
    messages = [{
        "role": "user",
        "content": [{"type" : "text", "text" : user_input}]
    }]
    
    text = tokenizer.apply_chat_template(
        messages,
        add_generation_prompt=True,  # Must add for generation
    )
    
    # Generate output with model
    with torch.no_grad():
        output = model.generate(
            **tokenizer([text], return_tensors="pt").to("cuda"),
            max_new_tokens=512,  # Adjust if you need more tokens
            temperature=1.0,
            top_p=0.95,
            top_k=64,
            streamer=None  # You can set a streamer if needed
        )
    
    # Decode the model output and return the result
    decoded_output = tokenizer.decode(output[0], skip_special_tokens=True)

    index = decoded_output.lower().find("model")
    if index != -1:
        return decoded_output[index + len("model"):].strip()

    # Fallback: return full decoded output if structure is unexpected
    return decoded_output

# Build the Gradio interface
iface = gr.Interface(
    fn=generate_text, 
    inputs=gr.Textbox(lines=2, placeholder="Enter your text here..."), 
    outputs=gr.Textbox(lines=2, placeholder="Generated text will appear here..."),
    title="Gemma-3 Model",
    description="This is a simple interface to interact with the Gemma-3 model. Enter a prompt and see the generated response."
)

# Launch the app
if __name__ == "__main__":
    iface.launch(share=True)