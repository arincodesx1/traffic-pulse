# Traffic Pulse

Build a Real-Time AI Traffic Dashboard Frontend

Build a sleek, modern, responsive frontend for a real-time AI traffic monitoring and traffic-signal recommendation dashboard.

Important Backend Constraint

The backend has already been fully implemented by my partner using FastAPI/Python.

Do NOT create, modify, replace, mock, or regenerate the backend.

The existing backend is running locally at:

http://localhost:8000

CORS is already enabled for all origins (*).

The frontend must communicate directly with this existing FastAPI backend using absolute URLs beginning with http://localhost:8000.

Do not use relative API URLs such as /api/....

Technology

Use:

React

TypeScript if appropriate

Modern CSS/Tailwind

Leaflet.js or another suitable open-source mapping library

OpenStreetMap tiles for the map

Browser HTML5 Geolocation API

Fetch API for backend communication

The application should be a polished dashboard rather than a basic demo.

Core User Flow

When the application loads:

Ask the user for HTML5 Geolocation permission.

Obtain the user's latitude and longitude.

Display a map centered on the user's coordinates.

Immediately send a POST request to the FastAPI backend.

Parse the JSON response.

Display the returned traffic information on the map.

Display emergency vehicles when applicable.

Display the AI recommendation in a prominent dashboard panel.

Automatically call the API every 5 seconds.

Update the map and dashboard with the latest response.

Clean up the interval when the component unmounts.

Do not require the user to manually refresh the page.

API

Endpoint

Use exactly:

POST http://localhost:8000/api/v1/dashboard/analyze

Request

Send JSON in this format:

{
  "latitude": 28.6139,
  "longitude": 77.2090,
  "radius_km": 5
}


The latitude and longitude must come from the user's actual browser geolocation.

Use a default radius of 5 km.

Set the appropriate request header:

Content-Type: application/json


Example:

fetch("http://localhost:8000/api/v1/dashboard/analyze", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    latitude,
    longitude,
    radius_km: 5
  })
});


Expected Response

The API returns JSON similar to:

{
  "success": true,
  "location": {
    "latitude": 28.6139,
    "longitude": 77.2090
  },
  "traffic": {
    "data_source": "simulation",
    "overall_congestion": "HIGH",
    "roads": [
      {
        "road_id": "road_001",
        "latitude": 28.62,
        "longitude": 77.21,
        "congestion_level": "SEVERE"
      }
    ]
  },
  "emergency": {
    "active": true,
    "events": [
      {
        "vehicle_type": "AMBULANCE",
        "latitude": 28.61,
        "longitude": 77.20
      }
    ]
  },
  "recommendations": {
    "priority_direction": "NORTH",
    "recommended_green_duration_seconds": 45,
    "reason": "Emergency vehicle override active."
  }
}


Do not hard-code these example values into the UI. Always render the actual values returned by the API.

Map

Create a full-screen interactive map as the main visual element.

Use Leaflet with OpenStreetMap tiles.

The map should initially center on the user's geolocation.

Use a clean modern map style.

Allow:

Zooming

Panning

Standard Leaflet map controls

Do not use a fake/static map image.

Traffic Visualization

Display the roads returned in:

traffic.roads

Each road should be represented visually on the map.

Because the backend response currently provides a latitude and longitude for each road rather than a full road geometry, represent each road using a clear map marker/circle or short visual road segment centered at the returned coordinates.

Structure the code so that it can easily be changed to a Polyline later if the backend starts returning road geometry.

Each road must be color-coded according to congestion_level.

Use:

CongestionColor LOWGreen MEDIUMYellow HIGHOrange SEVERERed

Make the congestion visualization visually obvious even when there are many roads.

Each road marker/segment should have a popup containing:

Road ID

Congestion level

Appropriate color/status indicator

Example:

ROAD_001

SEVERE CONGESTION

Overall Congestion

Display traffic.overall_congestion prominently in the dashboard.

Use the same color semantics:

LOW → green

MEDIUM → yellow

HIGH → orange

SEVERE → red

Create a modern congestion status card such as:

Overall Traffic

HIGH

The status should update every 5 seconds.

Also display the API's:

traffic.data_source

For example:

Data source: SIMULATION

Emergency Vehicle Visualization

Use:

emergency.active

If it is true, display emergency events from:

emergency.events

For each event, place a marker at:

event.latitude

event.longitude

The marker should clearly represent an emergency vehicle.

For an ambulance, use a visually recognizable ambulance/siren icon.

The emergency marker should have a flashing/pulsing siren effect using CSS animation.

For example:

Red outer glow

Pulsing circle

Ambulance/siren icon in the center

Do not use an external image that could fail to load. Prefer an icon library or inline SVG/CSS.

The marker popup should show:

Vehicle type

Latitude

Longitude

Emergency status

Example:

🚑 AMBULANCE

EMERGENCY ACTIVE

If emergency.active is false, remove/hide emergency markers.

If there are multiple events, display all of them.

AI Recommendation Dashboard

Create a floating dashboard panel over the map.

Position it on the right side of the screen on desktop.

On mobile, make it responsive and place it at the bottom or as a collapsible panel.

This is an important part of the application because judges need to immediately understand the AI's decision-making.

The panel should prominently display:

AI Traffic Recommendation

Priority Direction

Display:

recommendations.priority_direction

Example:

NORTH

Make the direction visually prominent.

Recommended Green Duration

Display:

recommendations.recommended_green_duration_seconds

Example:

45 seconds

Use a large number.

Decision Reason

Display:

recommendations.reason

Example:

Emergency vehicle override active.

This should be clearly labeled:

AI Decision Reason

The reason should be easy to read.

Dashboard Layout

Create a professional dashboard with approximately this hierarchy:

Top Header

Include:

Application name, e.g. TrafficAI

Small status indicator

LIVE indicator

Backend connection status

Example:

● LIVE

When API requests are succeeding, show:

Backend Connected

When requests fail, show:

Backend Offline

Use green/red visual indicators.

Main Map

The map should occupy most of the screen.

Floating Right Panel

Show:

Overall congestion

Data source

AI recommendation

Priority direction

Recommended green duration

AI decision reason

Emergency status

Optional Bottom Status Bar

Show:

Current user latitude

Current user longitude

Search radius: 5 km

Last updated time

Auto-refresh: 5 seconds

Real-Time Updates

Set up an automatic polling mechanism.

Call:

POST http://localhost:8000/api/v1/dashboard/analyze

every 5 seconds.

Important:

Make the first API request immediately after geolocation succeeds.

Then poll every 5 seconds.

Do not create multiple intervals accidentally.

Clean up the interval when the component unmounts.

Prevent stale traffic markers from accumulating.

Before rendering the latest response, remove/update the previous traffic visualization.

Update emergency markers as well.

Update the recommendation panel.

Update overall congestion.

Update the last-updated timestamp.

The map itself should not unnecessarily reinitialize every 5 seconds. Keep the same Leaflet map instance and update its layers/markers.

User Geolocation

Use:

navigator.geolocation.getCurrentPosition(...)


Request high accuracy if appropriate.

Handle these cases gracefully:

Permission granted

Continue normally.

Permission denied

Show a friendly UI explaining:

Location permission is required to analyze traffic around you.

Provide a retry button.

Location unavailable

Show an error state.

Loading

Before location is available, show a polished loading screen such as:

Detecting your location...

Do not silently fall back to hard-coded Delhi coordinates.

The coordinates in the API example are only examples.

Error Handling

The frontend must gracefully handle backend failures.

If the API is unavailable:

Do not crash the application.

Keep the map visible.

Show a clear backend connection error.

Change the status indicator to Backend Offline.

Allow the next 5-second polling attempt to retry automatically.

Display a subtle toast/banner such as:

Unable to connect to traffic analysis service. Retrying...

Do not replace real API data with fake/mock traffic data.

Loading State

When waiting for the first API response, display a polished loading state.

Example:

Analyzing traffic around you...

Use a subtle animated spinner.

After data arrives, show the dashboard.

During subsequent 5-second updates, do not block the entire interface with a full-screen loader. Instead show a small:

Updating...

indicator in the header.

Visual Design

The UI should look like a modern AI-powered operations dashboard.

Use:

Dark theme

Glassmorphism cards

Subtle gradients

Rounded corners

Soft shadows

Clear typography

High contrast

Smooth transitions

Minimal visual clutter

Suggested palette:

Background: #0B1120

Card: rgba(15, 23, 42, 0.85)

Green: #22C55E

Yellow: #EAB308

Orange: #F97316

Red: #EF4444

Blue accent: #38BDF8

The map should remain highly visible.

Make the floating cards semi-transparent so the map remains visible behind them.

Responsive Design

The application must work well on:

Desktop

Laptop

Tablet

Mobile

Desktop:

Map takes most of the screen.

Dashboard panel floats on the right.

Mobile:

Map remains usable.

Dashboard becomes a bottom sheet/card.

Avoid covering the entire map.

Make cards scrollable if necessary.

Architecture

Organize the frontend cleanly.

Suggested structure:

src/
  components/
    TrafficMap.tsx
    DashboardPanel.tsx
    CongestionCard.tsx
    EmergencyMarker.tsx
    StatusHeader.tsx
  services/
    api.ts
  hooks/
    useGeolocation.ts
    useTrafficPolling.ts
  types/
    traffic.ts
  App.tsx
  main.tsx


You may adjust this structure if a better architecture is appropriate.

Create TypeScript interfaces/types matching the API response.

For example:

interface Road {
  road_id: string;
  latitude: number;
  longitude: number;
  congestion_level: "LOW" | "MEDIUM" | "HIGH" | "SEVERE";
}

interface EmergencyEvent {
  vehicle_type: string;
  latitude: number;
  longitude: number;
}

interface Recommendations {
  priority_direction: string;
  recommended_green_duration_seconds: number;
  reason: string;
}


Create a complete response type for the entire API response.

API Service

Keep backend communication in a dedicated API/service function.

For example:

const API_URL =
  "http://localhost:8000/api/v1/dashboard/analyze";

export async function analyzeTraffic(
  latitude: number,
  longitude: number
) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      latitude,
      longitude,
      radius_km: 5,
    }),
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json();
}


The important requirement is that the URL remains:

http://localhost:8000/api/v1/dashboard/analyze

Do not proxy this through a frontend /api route.

Map Layer Management

Implement map layers carefully.

Use separate Leaflet layer groups for:

Traffic roads

Emergency events

User location

When new API data arrives:

Remove/update the old traffic layer.

Render the latest roads.

Remove/update old emergency markers.

Render the latest emergency events.

Do not cause duplicated markers every 5 seconds.

User Location Marker

Show the user's current location on the map using a distinct blue marker.

Add a popup:

Your Location

Optionally display:

Latitude: ...

Longitude: ...

Do not confuse the user location marker with traffic or emergency markers.

Legend

Add a small map legend explaining:

🟢 Low

🟡 Medium

🟠 High

🔴 Severe

🚑 Emergency

Make the legend

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/5da28cd1-236c-4308-913d-81659ca687aa).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
