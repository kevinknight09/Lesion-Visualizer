import requests
from reportlab.pdfgen import canvas
import io
import time

def create_dummy_pdf():
    buffer = io.BytesIO()
    c = canvas.Canvas(buffer)
    c.drawString(100, 750, "Patient Name: John Doe")
    c.drawString(100, 730, "Diagnosis: 2cm hypodense lesion in the right lobe of the liver.")
    c.save()
    buffer.seek(0)
    return buffer

def test_api():
    print("Creating a dummy PDF document...")
    pdf_buffer = create_dummy_pdf()
    
    # Give the server a second if it just started
    time.sleep(1)

    url = 'http://localhost:5201/api/ScanReport/upload'
    files = {'file': ('dummy_prescription.pdf', pdf_buffer, 'application/pdf')}
    
    print(f"Uploading document to {url}...")
    try:
        response = requests.post(url, files=files)
        print("\n--- Response ---")
        print(f"Status Code: {response.status_code}")
        try:
            print("Response JSON:", response.json())
        except ValueError:
            print("Response Text:", response.text)
    except Exception as e:
        print(f"Error testing API: {e}")

if __name__ == '__main__':
    test_api()
