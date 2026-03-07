import requests
import json

# Replace with your actual ngrok URL
MODEL_URL = "https://your-ngrok-url.ngrok-free.app"

def test_model(question):
    print(f"Asking: {question}")
    print("Waiting for response...\n")
    
    try:
        response = requests.post(
            f"{MODEL_URL}/ask",
            json={"question": question},
            timeout=180  # 3 minutes timeout
        )
        
        if response.status_code == 200:
            data = response.json()
            print("✅ SUCCESS!")
            print(f"\nAnswer:\n{data['answer']}\n")
        else:
            print(f"❌ Error: {response.status_code}")
            print(response.json())
    
    except requests.exceptions.Timeout:
        print("❌ Request timed out - model took too long")
    except Exception as e:
        print(f"❌ Error: {e}")

# Test questions
test_model("What are the fundamental rights under the Indian Constitution?")