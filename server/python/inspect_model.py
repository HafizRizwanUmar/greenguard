import torch
import os
import sys

MODEL_PATH = os.path.join(os.path.dirname(__file__), '../../model/deeplabv3plus_best.pth')

def inspect():
    if not os.path.exists(MODEL_PATH):
        print(f"Error: Model not found at {MODEL_PATH}")
        return

    try:
        # Load on CPU
        checkpoint = torch.load(MODEL_PATH, map_location=torch.device('cpu'))
        print(f"Type: {type(checkpoint)}")
        
        if isinstance(checkpoint, dict):
            # Handle if it's nested under 'state_dict' or just the dict
            state_dict = checkpoint.get('state_dict', checkpoint)
            
            print("Keys found: ", len(state_dict.keys()))
            keys = list(state_dict.keys())
            print("First 5 keys:", keys[:5])

            # Heuristics to guess encoder
            if any('encoder.layer4' in k for k in keys):
                print("Has layer4 -> Likely ResNet")
                # Check for bottleneck (layer1.0.conv3 exists in Bottleneck, not BasicBlock)
                if any('encoder.layer1.0.conv3.weight' in k for k in keys):
                    print("Structure: Bottleneck (ResNet50/101/152)")
                else:
                    print("Structure: BasicBlock (ResNet18/34)")
                    if any('encoder.layer4.2' in k for k in keys):
                        print("Depth: ResNet34 (Found layer4.2)")
                    else:
                        print("Depth: ResNet18 (No layer4.2)")
            
            if any('encoder.features' in k for k in keys):
                print("Has encoder.features -> Likely MobileNet or VGG")

            # Check number of classes from segmentation head
            head_weight = state_dict.get('segmentation_head.0.weight')
            if head_weight is not None:
                print(f"Segmentation Head Output Channels (Classes): {head_weight.shape[0]}")
            else:
                 # Try to find last layer
                print("Could not find segmentation_head.0.weight direct match")


        else:
            print("Model Object Loaded (Full Model)")
            print(checkpoint)

    except Exception as e:
        print(f"Error loading model: {e}")

if __name__ == "__main__":
    inspect()
