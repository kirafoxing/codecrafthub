# CodeCraftHub

CodeCraftHub is a simple REST API for tracking personal learning goals and courses. It is built with Node.js and Express and stores course data in a local `courses.json` file instead of using a database.

## Features

- Create new courses
- View all courses
- View a specific course
- Update existing courses
- Delete courses
- Automatically generated numeric course IDs
- Automatically generated creation timestamps
- Course status validation
- Target date validation using the `YYYY-MM-DD` format
- Automatic creation of `courses.json`
- JSON file-based data storage
- Helpful error responses for invalid requests and missing courses

## Course fields

Each course contains the following fields:

|
 Field 
|
 Description 
|

|
---
|
---
|

|
 
`id`
 
|
 Automatically generated numeric ID 
|

|
 
`name`
 
|
 Course name 
|

|
 
`description`
 
|
 Course description 
|

|
 
`target_date`
 
|
 Target completion date in 
`YYYY-MM-DD`
 format 
|

|
 
`status`
 
|
 
`Not Started`
, 
`In Progress`
, or 
`Completed`
 
|

|
 
`created_at`
 
|
 Automatically generated timestamp 
|


## Project structure

```text
codecrafthub/
├── app.js
├── courses.json
├── package.json
└── README.md

The

courses.json

file is created automatically when the application starts if it does not already exist.
Installation
Prerequisites

Make sure Node.js and npm are installed:

node --version
npm --version

Install the project

Clone or download the project, then move into its directory:

cd codecrafthub

Install the project dependencies:

npm install

This installs Express using the dependencies defined in

package.json

.
How to run the application

Start the server with:

npm start

The API runs on port

5000

:

http://localhost:5000

You should see a message similar to:

CodeCraftHub API is running on port 5000

API documentation

Base URL:

http://localhost:5000/api

All request bodies must use JSON and include this header:

Content-Type: application/json

Create a course

POST /api/courses

Request

curl -X POST http://localhost:5000/api/courses \
  -H "Content-Type: application/json" \
  -d '{
    "name": "REST API Fundamentals",
    "description": "Learn the basics of REST APIs and HTTP methods.",
    "target_date": "2026-12-31",
    "status": "Not Started"
  }'

Example response

{
  "id": 1,
  "name": "REST API Fundamentals",
  "description": "Learn the basics of REST APIs and HTTP methods.",
  "target_date": "2026-12-31",
  "status": "Not Started",
  "created_at": "2026-10-09T12:00:00.000Z"
}

Required fields

    name

    description

    target_date

    status

Valid status values

Not Started
In Progress
Completed

Get all courses

GET /api/courses

Request

curl http://localhost:5000/api/courses

Example response

[
  {
    "id": 1,
    "name": "REST API Fundamentals",
    "description": "Learn the basics of REST APIs and HTTP methods.",
    "target_date": "2026-12-31",
    "status": "Not Started",
    "created_at": "2026-10-09T12:00:00.000Z"
  }
]

If no courses exist, the API returns an empty array:

[]

Get a specific course

GET /api/courses/:id

Replace

:id

with the course ID.
Request

curl http://localhost:5000/api/courses/1

Example response

{
  "id": 1,
  "name": "REST API Fundamentals",
  "description": "Learn the basics of REST APIs and HTTP methods.",
  "target_date": "2026-12-31",
  "status": "Not Started",
  "created_at": "2026-10-09T12:00:00.000Z"
}

Course not found response

{
  "error": "Course not found"
}

Update a course

PUT /api/courses/:id

The request must include all required course fields. The

id

and

created_at

values are preserved by the API.
Request

curl -X PUT http://localhost:5000/api/courses/1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Advanced REST API Fundamentals",
    "description": "Build and improve REST APIs with Node.js and Express.",
    "target_date": "2027-01-15",
    "status": "In Progress"
  }'

Example response

{
  "id": 1,
  "name": "Advanced REST API Fundamentals",
  "description": "Build and improve REST APIs with Node.js and Express.",
  "target_date": "2027-01-15",
  "status": "In Progress",
  "created_at": "2026-10-09T12:00:00.000Z"
}

Delete a course

DELETE /api/courses/:id

Request

curl -X DELETE http://localhost:5000/api/courses/1

Example response

{
  "message": "Course deleted successfully",
  "course": {
    "id": 1,
    "name": "REST API Fundamentals",
    "description": "Learn the basics of REST APIs and HTTP methods.",
    "target_date": "2026-12-31",
    "status": "Not Started",
    "created_at": "2026-10-09T12:00:00.000Z"
  }
}

HTTP status codes
Status code	Meaning

200

	Request completed successfully

201

	Course created successfully

400

	Invalid request or missing required fields

404

	Course or route not found

500

	Server or file read/write error
Troubleshooting

npm: command not found

Node.js and npm may not be installed. Install Node.js from:

https://nodejs.org/

Then verify the installation:

node --version
npm --version

Cannot find module 'express'

Install the project dependencies:

npm install

If necessary, install Express directly:

npm install express

Port 5000 is already in use

Another application may already be using port

5000

. Stop that application, or change the

PORT

value in

app.js

.

For example:

const PORT = 5001;

courses.json

is missing

The application creates

courses.json

automatically when it starts. If the file is missing, restart the application:

npm start

You can also create it manually with the following contents:

[]

Unable to read course data

Check that:

    courses.json

    contains valid JSON
    The file contains an array
    The application has permission to read the file

A valid empty

courses.json

file looks like this:

[]

Unable to save course data

Check that:

    The application has permission to write to the project directory

    courses.json

    is not locked by another process
    The disk is not full

Invalid status error

The

status

value must be exactly one of the following:

Not Started
In Progress
Completed

For example:

{
  "status": "In Progress"
}

Invalid date error

The

target_date

must use the

YYYY-MM-DD

format and represent a valid date.

Valid example:

2026-12-31

Invalid examples:

31-12-2026
2026/12/31
2026-02-30

Invalid JSON error

Make sure the request body contains valid JSON. For example:

{
  "name": "Node.js Fundamentals",
  "description": "Learn Node.js basics.",
  "target_date": "2026-12-31",
  "status": "Not Started"
}

Also include the request header:

Content-Type: application/json

Data storage note

This project uses a JSON file for simplicity. It is suitable for learning and small personal projects, but it is not designed for high traffic, multiple simultaneous users, or large datasets. A database would be more appropriate for a production application.

undefined