## Hosted Version

https://ncgamesapp.herokuapp.com/api

## Summary

A backend API of board game reviews with comments, users, and categories

## Installation

- git clone https://github.com/Joe-Fuller/BE-Project.git
- npm install
- npm run setup-dbs
- set up .env files (detailed below)
- npm run seed

Run tests:

- npm test

Start server:

- npm start

## .env files information

This project requires .env files which have been omitted from the github repo. You will need to create two .env files - .env.test and .env.development. Into each, add PGDATABASE=<database_name_here>, with the correct database name for that environment. Ensure that these files are gitignored.

## Minimum Requirements

- Node v18.9
- PostgreSQL v14.5
