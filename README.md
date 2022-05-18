# Download Tile Data

## Overview

This script will allow you to test the execution time for downloading the raw data for all tiles on a Looker dashboard.

## Requirements

-   [Node](https://nodejs.org/en/)

## Setup

-   Clone repo
-   In the root project directory, run `npm install`
-   Copy `.env.example` to `.env`. Edit values to match your environment.
-   Under line 26 of `src/download-tile-data.ts`, where it says "APPLY FILTERS HERE", add appropriate filters, following the format of the existing example.
-   In `src/download-tile-data.ts`, at the bottom of the file, change '13' to the dashboard id of your choice (must be a string).

## Execution

-   From the root project directory, run `npm run start`. The script will create the appropriate queries to query for the tile data, initiate each one as an asynchronous task, and poll for the results every 5 seconds.
-   After all results have been retrieved, the results will be printed and the overall execution time will appear at the bottom of the console output.
