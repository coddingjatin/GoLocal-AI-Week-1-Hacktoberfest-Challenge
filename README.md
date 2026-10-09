<div align="center">

# 🌿 GoLocal AI

### Get out of the algorithm. Get into the real world.

**An open-source AI-powered outdoor companion that turns everyday walks into meaningful little adventures.**

<p>
  <img src="https://img.shields.io/badge/AI-Open--Weight%20Models-315C45?style=for-the-badge" alt="Open-weight AI" />
  <img src="https://img.shields.io/badge/Experience-Offline--First-DAE8D5?style=for-the-badge&labelColor=315C45" alt="Offline first" />
  <img src="https://img.shields.io/badge/Built%20for-Hacktoberfest%202026-F4C76B?style=for-the-badge&labelColor=315C45" alt="Hacktoberfest 2026" />
</p>

**Choose a mission. Step outside. Put your phone away. Come back with a story.**

</div>


## What is GoLocal AI?

Most apps are designed to keep you scrolling. **GoLocal AI is designed to help you stop.**

GoLocal is an outdoor exploration companion that uses open-weight AI to create personalized, safe, real-world missions based on your interests, available time, preferred environment, and activity level.

Whether you're taking a walk, exploring a park, trying birdwatching, or simply noticing your surroundings, GoLocal gives you a small reason to look up and experience the world around you.

> [!IMPORTANT]
> **Our core idea:** the best app session might be the one where you close the app and go outside.

## Features

| Feature | What it does |
|---|---|
| **Personalized Missions** | Create outdoor challenges based on activity, duration, difficulty, environment, and interests. |
| **Explore Your World** | Choose from walks, nature exploration, running, gardening, birdwatching, and more. |
| **Phone Down Mode** | A distraction-free mission screen with a countdown timer and task checklist. |
| **Reflect & Discover** | Capture what you noticed and turn your reflection into a memorable discovery entry. |
| **Exploration Journal** | Keep a personal history of completed missions, observations, and optional photos. |
| **Open-Weight AI** | Connect a compatible local model through Ollama for mission generation and reflection support. |
| **Demo-Friendly Experience** | Explore the main journey with sample missions even when an AI model is unavailable. |
| **Local-First by Design** | Keep personal reflections in local storage when using the browser-based journal. |
| **Responsive Interface** | A nature-inspired experience designed for both desktop and mobile screens. |

> Feature availability depends on the current implementation and configuration. Check the setup section below for AI and demo-mode details.

## The GoLocal Journey

</div>

1. **Choose your adventure:** Select an activity, duration, difficulty, and environment.
2. **Generate a mission:** GoLocal creates a set of simple, achievable outdoor tasks.
3. **Enter Phone Down Mode:** take your mission outside and spend less time looking at your screen.
4. **Reflect on the experience:** write what you noticed, or use supported voice input.
5. **Save your discovery:** keep a personal journal of small moments you might otherwise miss.

## Example Mission

### The Things You Walk Past

**Duration:** 30 minutes · **Difficulty:** Curious · **Environment:** Park

- Find two leaves with different shapes.
- Pause and notice three sounds around you.
- Find something in nature that looks older than you.
- Observe one detail you would normally walk past.
- Spend the final ten minutes without checking your phone.

*Mission tasks are suggestions. Adapt them to your location, accessibility needs, and safety.*

## Open-Source AI at the Core

GoLocal is designed to use an open-weight model as a practical engine for creating outdoor missions and summarizing personal reflections—not just as a chatbot bolted onto a landing page.

### Intended AI workflow

```text
Your preferences
      │
      ▼
Mission Generator
      │
      ▼
Configured Open-Weight Model
(e.g. through Ollama)
      │
      ▼
Structured Outdoor Mission
      │
      ▼
Explore → Reflect → Journal
```

### Why open innovation?

- **Choice:** configure a compatible model for your needs.
- **Customization:** adapt prompts and mission-generation behavior.
- **Privacy potential:** local inference can keep prompts on your own machine when the entire processing path stays local.
- **Accessibility:** a demo fallback makes it possible to explore the experience without configuring a model first.

**Transparency matters:** local AI is available only when a compatible model and inference service are configured. Demo-generated missions are not evidence of live model inference. Any feature that uses an external service may have different privacy and connectivity characteristics.

## Tech Stack

The project is designed around the following technologies; the exact components used depend on the implementation in this repository.

| Layer | Technology |
|---|---|
| Frontend | React, TypeScript, Vite |
| Styling | Tailwind CSS |
| Icons | Lucide |
| AI inference | Ollama + a compatible open-weight model, when configured |
| Optional backend | Python + FastAPI |
| Local persistence | Browser storage; SQLite if the backend persistence layer is implemented |

## Getting Started

### Prerequisites

- Node.js and npm
- Git
- Optional: Python and pip, if this repository includes the FastAPI backend
- Optional: Ollama and a compatible model, for local AI inference

### 1. Install frontend dependencies

```bash
npm install
```

### 2. Configure environment variables

If the repository includes an `.env.example`, copy it to the appropriate local environment file and fill in only the settings required by the project.

```bash
cp .env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Do not commit secrets or private API keys. If the project runs without environment variables in demo mode, you can skip this step.

### 3. Start the frontend

```bash
npm run dev
```

Open the local URL printed by Vite in your terminal.

### 4. Optional: enable local AI with Ollama

Install Ollama from its official website, start the Ollama service, and download a model compatible with your machine.

For example, if you choose a Gemma model supported by your Ollama installation:

```bash
ollama pull gemma3
```

Then configure GoLocal using the model and endpoint expected by your implementation. Check the project's environment example and backend instructions before setting variable names or starting services.

> Model names, hardware requirements, and supported context lengths vary. Local inference may be slow on machines without suitable resources.

### 5. Optional: run the backend

If a FastAPI backend is included, follow its folder-specific instructions. A typical setup may look like this:

```bash
python -m venv .venv
```

Activate the environment, then install the backend requirements file provided by the repository and start the documented FastAPI application. The exact command depends on the backend entry point, so use the command specified in the project's README or configuration.

## Demo Mode

Want to explore GoLocal without setting up a local model?

Use the application's demo or fallback mode, if enabled in the current build. It should allow you to experience the core journey with sample missions and reflection examples.

Demo mode is useful for:
- Hackathon presentations and judging.
- Testing the interface without model setup.
- Trying the mission flow on machines with limited resources.

**Demo mode uses sample or fallback content; it should not be described as live AI inference.**


## Privacy & Safety

- Keep personal reflections private and avoid entering sensitive information.
- Verify where inference happens before assuming data stays on your device.
- Treat AI-generated mission suggestions as general ideas, not professional safety advice.
- Stay aware of traffic and your surroundings.
- Respect local rules, private property, wildlife, and the natural environment.
- Skip any task that feels unsafe or inaccessible.
- Do not use your phone while walking in traffic or in other situations that require full attention.

## Contributing

Contributions, feedback, and new ideas are welcome!

1. Fork the repository.
2. Create a feature branch: `git checkout -b feat/your-feature`.
3. Make a focused change and test it.
4. Commit your changes: `git commit -m "feat: describe your change"`.
5. Push your branch and open a pull request.

For larger changes, open an issue first to discuss the proposal. Keep contributions focused, accessible, and aligned with the goal of helping people spend more meaningful time outdoors.

## The Philosophy

> Technology should help us experience more of life, not replace life itself.

GoLocal AI explores a different kind of AI experience: one where intelligence helps you reconnect with the world beyond your screen.

**Less scrolling. More noticing. More living.**


<div align="center">

### 🌿 GoLocal AI

**Get out of the algorithm. Get into the real world.**

Built for the Hacktoberfest 2026 Open-Source AI Challenge · Week 1: *Touch Grass*

</div>
