import torch
import segmentation_models_pytorch as smp
import os
import sys

def load_model(model_path):
    """
    Loads a model based on the filename.
    Supports: DeepLabV3+, Unet++, Attention Unet (via Unet)
    """
    if not os.path.exists(model_path):
        # Write to stderr so we don't corrupt stdout JSON
        sys.stderr.write(f"Model file not found at {model_path}\n")
        return None
    
    filename = os.path.basename(model_path).lower()
    
    # Determine Architecture
    try:
        if "deeplabv3plus" in filename:
            model = smp.DeepLabV3Plus(
                encoder_name="resnet18",
                encoder_weights=None,
                in_channels=8,
                classes=2
            )
        elif "unetplusplus" in filename:
            model = smp.UnetPlusPlus(
                encoder_name="resnet18",
                encoder_weights=None,
                in_channels=8,
                classes=2
            )
        elif "attention_unet" in filename:
            # Assuming standard Unet for Attention Unet if SMP doesn't have explicit class
            # Or Unet with attention type. For now, try standard Unet.
            model = smp.Unet(
                encoder_name="resnet18",
                encoder_weights=None,
                decoder_attention_type='scse', # Common attention mechanism in SMP
                in_channels=8,
                classes=2
            )
        else:
            # Default fallback
            model = smp.DeepLabV3Plus(
                encoder_name="resnet18",
                encoder_weights=None,
                in_channels=8,
                classes=2
            )
            
        # Load weights
        state_dict = torch.load(model_path, map_location=torch.device('cpu'))
        
        # Handle if wrapped in 'state_dict' key
        if isinstance(state_dict, dict) and 'state_dict' in state_dict:
            state_dict = state_dict['state_dict']
            
        model.load_state_dict(state_dict)
        model.eval()
        return model

    except Exception as e:
        sys.stderr.write(f"Error loading state dict for {filename}: {e}\n")
        # Do NOT raise, just return None so inference can proceed with other models
        return None
