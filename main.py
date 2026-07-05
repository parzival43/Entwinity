from flask import request
import subprocess
import os
import requests
from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv


load_dotenv() 
app = Flask(__name__)
CORS(app) 

def sendmail(data):
    if "BREVO_API_KEY" not in os.environ:
        print("Missing BREVO_API_KEY. Exiting function.")
        return

    if "RECEIVER_EMAIL" not in os.environ:
        print("Missing RECEIVER_EMAIL. Exiting function.")
        return
    BREVO_API_KEY = os.environ.get("BREVO_API_KEY")
    RECEIVER_EMAIL = os.environ.get("RECEIVER_EMAIL")

    url = "https://api.brevo.com/v3/smtp/email"
    subject = data["subject"]
    html = data["htmlContent"]
    # print(subject)
    headers = {
        "accept": "application/json",
        "api-key": BREVO_API_KEY,
        "content-type": "application/json"
    }

    payload = {
        "sender": {
            "name": "Entwinity Website",
            "email": RECEIVER_EMAIL      # Must be a verified sender in Brevo
        },
        "to": [
            {
                "email": RECEIVER_EMAIL,
                "name": "Entwinity Team"
            }
        ],
        "subject": subject,
        "htmlContent": html
    }

    response = requests.post(url, json=payload, headers=headers)

    print(response.status_code)
    print(response.text)
    
@app.route('/', methods=['GET', 'POST']) 
def send():
    data = request.get_json() 
    # print(data)
    sendmail(data)
    
    return {'success': True}

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=4000)

