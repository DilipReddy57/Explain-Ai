import requests
import sys

def test_api():
    try:
        r = requests.get("http://localhost:8000/api/")
        print(f"Root endpoint: {r.status_code}")
        print(r.json())
        if r.status_code == 200:
            print("Backend is running!")
        else:
            print("Backend returned error status")
            sys.exit(1)
    except Exception as e:
        print(f"Failed to connect: {e}")
        sys.exit(1)

if __name__ == "__main__":
    test_api()
