# API Testing Guide

## Prerequisites
- Development server running (`npm run dev`)
- Supabase project configured
- User authenticated and have access token

## Getting Your Auth Token

### Method 1: Browser Console (Recommended for Testing)
1. Open your app in browser
2. Open Developer Console (F12)
3. Run:
```javascript
const { data: { session } } = await window.supabase.auth.getSession();
console.log(session?.access_token);
```

### Method 2: Create a Test Script
Create `test-auth.ts`:
```typescript
import { supabase } from './src/lib/supabase';

async function getToken() {
  const { data: { session } } = await supabase.auth.getSession();
  console.log('Token:', session?.access_token);
}

getToken();
```

---

## Test 1: Manual Data Ingestion

### Using cURL
```bash
export TOKEN="your_user_token_here"

curl -X POST http://localhost:3000/api/ingest/manual \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "profile": {
      "full_name": "Jane Smith",
      "email": "jane.smith@example.com",
      "phone": "+1-555-0123",
      "linkedin_url": "https://linkedin.com/in/janesmith",
      "portfolio_url": "https://janesmith.dev",
      "summary_bio": "Experienced full-stack developer with 8+ years building scalable web applications",
      "languages": [
        {"language": "English", "level": "Native"},
        {"language": "Spanish", "level": "Professional"}
      ],
      "certifications": [
        {"name": "AWS Solutions Architect", "issuer": "Amazon", "year": "2023"},
        {"name": "React Advanced", "issuer": "Meta", "year": "2022"}
      ]
    },
    "work_experiences": [
      {
        "company": "TechCorp Inc",
        "job_title": "Senior Full-Stack Developer",
        "location": "San Francisco, CA",
        "start_date": "2020-03-01",
        "end_date": "2024-01-15",
        "is_current": false,
        "duties": "Led development of customer-facing web applications, mentored junior developers, participated in architecture decisions",
        "achievements": "Increased application performance by 45%, reduced AWS costs by $180K annually, led team of 5 developers to deliver 3 major features ahead of schedule"
      },
      {
        "company": "StartupXYZ",
        "job_title": "Full-Stack Developer",
        "location": "Remote",
        "start_date": "2017-06-01",
        "end_date": "2020-02-28",
        "is_current": false,
        "duties": "Built features across the stack, implemented CI/CD pipelines",
        "achievements": "Shipped 50+ features, improved deployment time from 2 hours to 15 minutes"
      }
    ],
    "educations": [
      {
        "institution": "Stanford University",
        "degree": "Master of Science",
        "field_of_study": "Computer Science",
        "start_date": "2015-09-01",
        "end_date": "2017-06-01"
      },
      {
        "institution": "UC Berkeley",
        "degree": "Bachelor of Science",
        "field_of_study": "Computer Engineering",
        "start_date": "2011-09-01",
        "end_date": "2015-06-01"
      }
    ],
    "skills": [
      {"name": "React", "category": "Hard", "proficiency": 95},
      {"name": "Node.js", "category": "Hard", "proficiency": 90},
      {"name": "TypeScript", "category": "Hard", "proficiency": 92},
      {"name": "PostgreSQL", "category": "Hard", "proficiency": 85},
      {"name": "AWS", "category": "Tool", "proficiency": 88},
      {"name": "Docker", "category": "Tool", "proficiency": 80},
      {"name": "Git", "category": "Tool", "proficiency": 90},
      {"name": "Leadership", "category": "Soft", "proficiency": 85},
      {"name": "Communication", "category": "Soft", "proficiency": 90},
      {"name": "Problem Solving", "category": "Soft", "proficiency": 95}
    ]
  }'
```

### Using JavaScript (fetch)
```javascript
const token = 'your_user_token_here';

const response = await fetch('http://localhost:3000/api/ingest/manual', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    profile: {
      full_name: "Jane Smith",
      email: "jane.smith@example.com",
      summary_bio: "Experienced developer"
    },
    work_experiences: [{
      company: "TechCorp",
      job_title: "Senior Developer",
      start_date: "2020-03-01",
      achievements: "Increased performance by 45%"
    }]
  })
});

const result = await response.json();
console.log(result);
```

### Expected Success Response
```json
{
  "success": true,
  "message": "Data ingested successfully",
  "results": {
    "profile": { /* profile object */ },
    "work_experiences": [ /* array of work experiences */ ],
    "educations": [ /* array of educations */ ],
    "skills": [ /* array of skills */ ]
  }
}
```

---

## Test 2: Document Upload

### Using cURL
```bash
export TOKEN="your_user_token_here"

curl -X POST http://localhost:3000/api/ingest/document \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/path/to/your/resume.pdf"
```

### Using JavaScript (FormData)
```javascript
const token = 'your_user_token_here';
const fileInput = document.querySelector('input[type="file"]');
const file = fileInput.files[0];

const formData = new FormData();
formData.append('file', file);

const response = await fetch('http://localhost:3000/api/ingest/document', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});

const result = await response.json();
console.log(result);
```

### Expected Success Response
```json
{
  "success": true,
  "message": "Document uploaded successfully",
  "data": {
    "id": "uuid-here",
    "file_url": "https://[project].supabase.co/storage/v1/object/public/resumes/[user_id]/[timestamp]_resume.pdf",
    "uploaded_at": "2026-01-14T12:30:00.000Z",
    "has_parsed_text": false
  }
}
```

### Get Uploaded Documents (GET)
```bash
curl -X GET http://localhost:3000/api/ingest/document \
  -H "Authorization: Bearer $TOKEN"
```

---

## Test 3: AI Resume Generation

### Using cURL (with manual data)
```bash
export TOKEN="your_user_token_here"

curl -X POST http://localhost:3000/api/generate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "jobDescription": "We are seeking a Senior Full-Stack Developer with strong experience in React, Node.js, and AWS. The ideal candidate will have:\n\n- 5+ years of experience in web development\n- Expert knowledge of React and modern JavaScript\n- Experience with Node.js and REST APIs\n- AWS deployment and infrastructure management\n- Strong leadership and mentoring skills\n- Track record of delivering high-quality, scalable applications\n\nResponsibilities:\n- Lead development of customer-facing features\n- Architect scalable solutions\n- Mentor junior developers\n- Optimize application performance\n- Collaborate with product and design teams",
    "useDocuments": false
  }'
```

### Using cURL (with uploaded documents)
```bash
curl -X POST http://localhost:3000/api/generate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "jobDescription": "Your job description here...",
    "useDocuments": true
  }'
```

### Using JavaScript
```javascript
const token = 'your_user_token_here';

const jobDescription = `
We are seeking a Senior Full-Stack Developer with strong experience in React, 
Node.js, and AWS. The ideal candidate will have 5+ years of experience...
`;

const response = await fetch('http://localhost:3000/api/generate', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    jobDescription,
    useDocuments: false
  })
});

const result = await response.json();
console.log(result);
```

### Expected Success Response
```json
{
  "success": true,
  "generatedAt": "2026-01-14T12:45:00.000Z",
  "tailoredResume": {
    "summary": "Results-driven Senior Full-Stack Developer with 8+ years of experience specializing in React, Node.js, and AWS cloud architecture. Proven track record of leading high-performing teams and delivering scalable applications that drive business growth. Expert in performance optimization, having achieved 45% improvements while reducing infrastructure costs by $180K annually.",
    "workExperiences": [
      {
        "company": "TechCorp Inc",
        "jobTitle": "Senior Full-Stack Developer",
        "location": "San Francisco, CA",
        "startDate": "2020-03",
        "endDate": "2024-01",
        "highlights": [
          "Architected and led development of customer-facing React applications serving 500K+ monthly users",
          "Optimized application performance by 45% through code splitting and lazy loading strategies",
          "Reduced AWS infrastructure costs by $180K annually through resource optimization and serverless migration",
          "Mentored and led team of 5 junior developers, implementing code review best practices",
          "Delivered 3 major features ahead of schedule through Agile methodologies and sprint planning"
        ]
      },
      {
        "company": "StartupXYZ",
        "jobTitle": "Full-Stack Developer",
        "location": "Remote",
        "startDate": "2017-06",
        "endDate": "2020-02",
        "highlights": [
          "Built and shipped 50+ features using React and Node.js stack",
          "Implemented CI/CD pipeline reducing deployment time from 2 hours to 15 minutes",
          "Developed REST APIs serving 100K+ daily requests with 99.9% uptime"
        ]
      }
    ],
    "skills": {
      "technical": [
        "React",
        "Node.js",
        "TypeScript",
        "JavaScript",
        "PostgreSQL",
        "REST APIs"
      ],
      "tools": [
        "AWS (EC2, S3, Lambda, CloudFront)",
        "Docker",
        "Git",
        "CI/CD"
      ],
      "soft": [
        "Leadership & Mentoring",
        "Problem Solving",
        "Communication",
        "Agile Methodologies"
      ]
    },
    "education": [
      {
        "institution": "Stanford University",
        "degree": "Master of Science",
        "field": "Computer Science",
        "graduationDate": "2017-06"
      },
      {
        "institution": "UC Berkeley",
        "degree": "Bachelor of Science",
        "field": "Computer Engineering",
        "graduationDate": "2015-06"
      }
    ],
    "matchScore": 92,
    "keyStrengths": [
      "8+ years of full-stack development experience exceeds job requirement",
      "Expert proficiency in required technologies: React (95%), Node.js (90%), AWS (88%)",
      "Proven leadership experience with team mentoring and project delivery",
      "Strong track record of performance optimization and cost reduction",
      "Advanced degree from top-tier university demonstrates technical depth"
    ],
    "recommendations": [
      "Emphasize specific AWS services used (EC2, Lambda, S3) in resume bullets",
      "Quantify team size and project scope in leadership examples",
      "Add more details about REST API design and scalability achievements",
      "Consider highlighting any microservices architecture experience",
      "Include any relevant open-source contributions or technical blog posts"
    ]
  }
}
```

---

## Error Responses

### 401 Unauthorized
```json
{
  "error": "Unauthorized"
}
```

### 400 Bad Request
```json
{
  "error": "Job description is required"
}
```

### 404 Not Found
```json
{
  "error": "No user data found. Please add your information first."
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error",
  "details": "Specific error message"
}
```

---

## Postman Collection

Import this into Postman for easy testing:

```json
{
  "info": {
    "name": "Resume Tailoring API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:3000"
    },
    {
      "key": "token",
      "value": "YOUR_TOKEN_HERE"
    }
  ],
  "item": [
    {
      "name": "Manual Ingestion",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          }
        ],
        "url": "{{baseUrl}}/api/ingest/manual",
        "body": {
          "mode": "raw",
          "raw": "{ /* your JSON payload */ }"
        }
      }
    },
    {
      "name": "Document Upload",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          }
        ],
        "url": "{{baseUrl}}/api/ingest/document",
        "body": {
          "mode": "formdata",
          "formdata": [
            {
              "key": "file",
              "type": "file",
              "src": "/path/to/resume.pdf"
            }
          ]
        }
      }
    },
    {
      "name": "Generate Resume",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          }
        ],
        "url": "{{baseUrl}}/api/generate",
        "body": {
          "mode": "raw",
          "raw": "{\"jobDescription\": \"Your job description\", \"useDocuments\": false}"
        }
      }
    }
  ]
}
```

---

## Automated Testing Script

Create `test-api.js`:

```javascript
const BASE_URL = 'http://localhost:3000';
const TOKEN = process.env.USER_TOKEN;

async function testManualIngest() {
  console.log('Testing manual ingestion...');
  const response = await fetch(`${BASE_URL}/api/ingest/manual`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      profile: { full_name: 'Test User', email: 'test@example.com' }
    })
  });
  
  const result = await response.json();
  console.log('✓ Manual ingest:', response.status, result.success ? '✓' : '✗');
  return result;
}

async function testGenerate() {
  console.log('Testing resume generation...');
  const response = await fetch(`${BASE_URL}/api/generate`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      jobDescription: 'Looking for a senior developer',
      useDocuments: false
    })
  });
  
  const result = await response.json();
  console.log('✓ Generate:', response.status, result.success ? '✓' : '✗');
  return result;
}

async function runTests() {
  await testManualIngest();
  await testGenerate();
}

runTests();
```

Run: `USER_TOKEN=your_token node test-api.js`

---

## Troubleshooting

### Common Issues

1. **401 Unauthorized**
   - Verify token is valid and not expired
   - Check Authorization header format: `Bearer <token>`

2. **CORS Errors**
   - Make sure you're testing from localhost:3000
   - Check Next.js is running

3. **Empty Response**
   - Ensure database has data before calling /generate
   - Check Supabase connection

4. **File Upload Fails**
   - Verify 'resumes' bucket exists in Supabase
   - Check file size < 10MB
   - Verify file type is allowed

---

## Performance Testing

```bash
# Install Apache Bench
apt-get install apache2-utils

# Test manual ingestion (100 requests, 10 concurrent)
ab -n 100 -c 10 -H "Authorization: Bearer $TOKEN" \
   -p payload.json -T application/json \
   http://localhost:3000/api/ingest/manual

# Monitor response times
```

---

Happy Testing! 🚀
