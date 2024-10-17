# LEAP Documentation
## Introduction

The Land Engagement Adjudication Platform is a web application developed by C1Cs Michaela Kovalsky, Kieran McCauley, Aaron Eakins, Luke Kuklis (Class of 2025) for the United State Air Force Academy's Multi-Domain Laboratory. Development and testing took place in June 2024 at the Air Force Research Laboratory's Gaming Research Integration for Learning Laboratory.

## Quick Start
Locate and open STARTUP.bat in the project's root directory. This will start the local applicaton and the database simultaneously. The local applicaton will automatically launch in the computer's default browser but can also be found at the browser URL "http://localhost:3000/". The database must be previously configured locally for this to work. Additonally, an IP Adress URL will populate in the terminal where the application was launched. This URL can be inserted to web browsers on other computers on the same network to access the application.

## Manual Start
Step One. Open a terminal and navigate to the backend folder from the root of the project folder. Run "node server.js". The database will now be running. The database must be previously configured locally for this to work.

Step Two. Open a new terminal tab or separate blank terminal. Run "npm start". Do not close this terminal. This will start the local applicaton. The local applicaton will automatically launch in the computer's default browser but can also be found at the browser URL "http://localhost:3000/". Additonally, IP Adress URL will populate in the terminal where the application was launched. This URL can be inserted to web browsers on other computers on the same network to access the application.

## Tools
Frontend: React App
UI Components: Mantine
Backend: NodeJS, Axios
Database: PostgreSQL
Resources: GRILL team, tool documentation, ChatGPT