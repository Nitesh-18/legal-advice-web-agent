"""
Simple script to test the Legal Advice API endpoints
"""

import requests
import json
import sys

API_URL = "http://localhost:8000/api"


def test_health():
    """Test the health endpoint"""
    print("\n🔍 Testing Model Health...")
    try:
        response = requests.get(f"{API_URL}/model-health/")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Error: {e}")
        return False


def test_analyze_case():
    """Test case analysis endpoint"""
    print("\n🔍 Testing Case Analysis...")
    
    case_text = """
    I am a tenant in Mumbai. My landlord is refusing to return my security deposit
    of Rs. 50,000 even though I vacated the apartment 2 months ago and there was
    no damage to the property. The rent agreement has expired. What are my legal options?
    """
    
    try:
        response = requests.post(
            f"{API_URL}/analyze-case/",
            json={"case_text": case_text}
        )
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"\n✅ Analysis received!")
            print(f"Response time: {data.get('response_time', 'N/A')}s")
            print(f"\nAnalysis:\n{data.get('analysis', 'No analysis')[:500]}...")
            return True
        else:
            print(f"❌ Error: {response.json()}")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False


def test_ask_question():
    """Test general question endpoint"""
    print("\n🔍 Testing General Question...")
    
    question = "What are the fundamental rights under the Indian Constitution?"
    
    try:
        response = requests.post(
            f"{API_URL}/ask-legal-question/",
            json={"question": question}
        )
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"\n✅ Answer received!")
            print(f"Response time: {data.get('response_time', 'N/A')}s")
            print(f"\nAnswer:\n{data.get('answer', 'No answer')[:500]}...")
            return True
        else:
            print(f"❌ Error: {response.json()}")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False


def test_stats():
    """Test stats endpoint"""
    print("\n🔍 Testing Stats...")
    try:
        response = requests.get(f"{API_URL}/stats/")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Error: {e}")
        return False


def main():
    print("=" * 60)
    print("Legal Advice API - Test Suite")
    print("=" * 60)
    
    print("\n⚠️  Make sure:")
    print("1. Django server is running (python manage.py runserver)")
    print("2. Your model API is running (Colab/HF Spaces)")
    print("3. MODEL_API_URL is set correctly in .env")
    
    input("\nPress Enter to continue...")
    
    # Run tests
    results = {
        "Health Check": test_health(),
        "Stats": test_stats(),
        "Case Analysis": test_analyze_case(),
        "General Question": test_ask_question(),
    }
    
    # Summary
    print("\n" + "=" * 60)
    print("Test Results Summary")
    print("=" * 60)
    
    for test_name, passed in results.items():
        status = "✅ PASSED" if passed else "❌ FAILED"
        print(f"{test_name}: {status}")
    
    total = len(results)
    passed = sum(results.values())
    print(f"\nTotal: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n🎉 All tests passed!")
        sys.exit(0)
    else:
        print("\n⚠️  Some tests failed. Check the output above.")
        sys.exit(1)


if __name__ == "__main__":
    main()
