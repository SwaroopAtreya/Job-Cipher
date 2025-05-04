import requests
import requests
import json
url = "http://13.201.102.52:5001/extract"
files = {"file": open("your_pdf.pdf", "rb")}
response = requests.post(url, files=files)

print(response.json())
parsed_data=response.json()
# parsed_data = json.loads(response.json())

# Extract the 'extracted_info' string
info_text = parsed_data["extracted_info"]

# Split lines and extract key-value pairs
info_lines = info_text.split("\n")[2:]  # Skip first two lines

info_dict = {}
for line in info_lines:
    if ": " in line:
        key, value = line.split(": ", 1)
        info_dict[key.strip("* ")] = value.strip()

# Print extracted details
print(info_dict)
name = info_dict.get("Applicant Name", "N/A")
branch = info_dict.get("Branch", "CSE")
college = info_dict.get("College", "N/A")
skill = info_dict.get("Most Relevant Skill", "Python")
location = info_dict.get("Location", "India")
# AWS EC2 Public IP
AWS_SERVER_URL = "http://13.201.102.52:5000/job-search"

# Job search parameters
job_data = {
    "name":name,
    "college":college,
    "branch":branch,
    "keyword": skill,
    "location": location,
    "experience": 0,
    "job_type": "fulltime",
    "remote": "on-site",
    "date_posted": "1 week",
    "company": "",
    "industry": "",
    "ctc_filters": "",
    "radius": "10"
}

# Send request to AWS
response = requests.post(AWS_SERVER_URL, json=job_data)

if response.status_code == 200:
    # Save CSV file
    with open("job_results.csv", "w", encoding="utf-8") as f:
        f.write(response.text)
    
    print("CSV file downloaded: job_results.csv")
else:
    print("Error:", response.text)