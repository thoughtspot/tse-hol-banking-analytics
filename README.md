# Bankalytics — ThoughtSpot Banking Analytics Hands-On Lab

Bankalytics is a sample banking analytics portal for ThoughtSpot hands-on labs. It covers credit cards, checking, savings, and lending, and it's built with Next.js, React, and the ThoughtSpot Visual Embed SDK.

## Prerequisites

- [Node.js](https://nodejs.org/) 20.9 or later (includes `npm`)
- [Git](https://git-scm.com/downloads)
- A code editor, such as [VS Code](https://code.visualstudio.com/)
- Access to a ThoughtSpot instance

Check your versions:

```bash
node --version
npm --version
git --version
```

## Download

Clone the repository:

```bash
git clone https://github.com/thoughtspot/tse-hol-banking-analytics.git
cd tse-hol-banking-analytics
```

If you don't have Git, use **Code → Download ZIP** on the GitHub repository page, unzip the file, and open a terminal in the unzipped folder.

## Install

Install the dependencies:

```bash
npm install
```

## Configure

Create a `.env.local` file in the project root, and set it to the URL of your ThoughtSpot instance:

```bash
NEXT_PUBLIC_THOUGHTSPOT_HOST=https://your-instance.thoughtspot.cloud
```

`.env.local` is ignored by Git. Don't commit it.

## Run

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. When you edit a file, the page reloads automatically.

To stop the server, press `Ctrl+C` in the terminal.

## Other commands

| Command         | Description                                  |
| --------------- | -------------------------------------------- |
| `npm run build` | Create a production build                    |
| `npm run start` | Serve the production build (run `build` first) |
| `npm run lint`  | Run ESLint                                   |

## Troubleshooting

- **Port 3000 is already in use:** run `npm run dev -- -p 3001` and open `http://localhost:3001`.
- **`npm install` fails:** confirm that you're on Node.js 20.9 or later, delete `node_modules`, and run `npm install` again.
