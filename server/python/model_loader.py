import torch
import segmentation_models_pytorch as smp
import os

def load_model(model_path):
    """
    Loads a DeepLabV3+ model with ResNet18 encoder and 2 classes.
    """
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model file not found at {model_path}")
    
    # Initialize architecture
    model = smp.DeepLabV3Plus(
        encoder_name="resnet18",
        encoder_weights=None, # Loading from local file
        in_channels=8,
        classes=2
    )

    # Load weights
    try:
        # Load state dict (map_location needed for CPU usage if trained on GPU)
        state_dict = torch.load(model_path, map_location=torch.device('cpu'))
        
        # Handle if wrapped in 'state_dict' key
        if isinstance(state_dict, dict) and 'state_dict' in state_dict:
            state_dict = state_dict['state_dict']
            
        model.load_state_dict(state_dict)
        model.eval()
        return model
    except Exception as e:
        print(f"Error loading state dict: {e}")
        raise e
