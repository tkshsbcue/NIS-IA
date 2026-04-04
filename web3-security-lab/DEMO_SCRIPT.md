# Web3 Security Lab — Interactive Demo Script

> **Purpose:** Step-by-step walkthrough script for demonstrating all features of the Web3 Security Lab platform. Follow this guide while clicking through the app to showcase each capability.

---

## Pre-Demo Setup

1. Open terminal in `web3-security-lab/` and run:
   ```bash
   npm run dev
   ```
2. Open `http://localhost:5173` in **Google Chrome** with **MetaMask** installed.
3. Ensure MetaMask has a Sepolia testnet account with some test ETH.
4. Keep the browser in full-screen for best visual impact.

---

## Demo Flow (16 Steps)

### Step 1 — Welcome & First Impression

**What to show:** The full application layout.

**Talking points:**
- This is **Web3 Security Lab**, an interactive platform for learning smart contract security.
- Inspired by OpenZeppelin's Ethernaut — but with an integrated editor, guided exploits, and security education all in one place.
- Notice the **dark developer-themed UI** — split-screen layout with a sidebar, code editor on the left, and console on the right.
- Built with React, TypeScript, Vite, TailwindCSS, ethers.js, and Monaco Editor.

**Action:** Point out the three main regions — Header, Sidebar, Main Content area.

---

### Step 2 — Header Bar

**What to show:** Top bar of the application.

**Talking points:**
- The **W3 Security Lab** logo with the shield icon identifies the platform.
- The **Demo Tour** button (gradient cyan/blue) launches an interactive guided tour that highlights every feature — useful for first-time users.
- The **network badge** shows "Sepolia" in green when correctly connected, or "Wrong Network" in red.
- The **wallet section** on the right handles MetaMask connectivity.

**Action:** Hover over the Demo Tour button to show the hover effect.

---

### Step 3 — Wallet Connection

**What to show:** Click **"Connect Wallet"** button.

**Talking points:**
- The platform uses **ethers.js v6** to interface with MetaMask.
- On clicking Connect, MetaMask pops up requesting account access.
- Once connected, the UI shows:
  - **Truncated wallet address** (e.g., `0x1234...5678`)
  - **ETH balance** on Sepolia
  - **Green "Sepolia" badge** confirming correct network
- If on the wrong network, a **"Switch to Sepolia"** button appears that auto-adds and switches the network in MetaMask.
- Account and chain changes are auto-detected — switching accounts in MetaMask instantly updates the UI.

**Action:** Connect MetaMask. Show the address and balance appearing. If on wrong network, demo the auto-switch.

---

### Step 4 — Sidebar: Challenge Levels

**What to show:** The left sidebar with all 5 levels.

**Talking points:**
- The sidebar lists **5 challenge levels**, each targeting a real smart contract vulnerability:
  1. **Reentrancy Attack** (Easy) — The DAO hack, $60M
  2. **Ownership Takeover** (Easy) — Parity Wallet hack
  3. **Delegatecall Exploit** (Medium) — Parity multisig, $150M
  4. **Integer Overflow** (Medium) — BEC Token, $900M market cap
  5. **Force Feeding ETH** (Hard) — Selfdestruct abuse
- Each level shows a **difficulty badge** (green=Easy, yellow=Medium, red=Hard).
- Completed levels get a **green checkmark**.
- Click any level to load its vulnerable contract into the editor.
- The levels are modular — adding a new one requires only a single new TypeScript file.

**Action:** Click through Level 1, Level 3, Level 5 to show the sidebar responding — highlight the active state (cyan left border).

---

### Step 5 — Progress Tracker

**What to show:** The progress section at the top of the sidebar.

**Talking points:**
- Shows **X/5 completed** with a progress bar.
- Progress is **persisted in localStorage** — closing the browser and reopening retains all progress.
- Progress is tracked per wallet address, so different MetaMask accounts have independent progress.

**Action:** Point to the "0/5 completed" and the empty progress bar.

---

### Step 6 — Code Editor (Editor Tab)

**What to show:** Click the **"Editor"** tab in the left panel.

**Talking points:**
- This is the **Monaco Editor** — the exact same editor engine that powers VS Code.
- It runs entirely in the browser with **Solidity syntax highlighting** — keywords, types, functions, modifiers, and comments are all color-coded.
- Each level **pre-loads a vulnerable smart contract** into the editor.
- Users can freely edit the code, write their own attack contracts, or modify the vulnerable contract to understand the vulnerability.
- The editor supports standard shortcuts: Ctrl+Z for undo, Ctrl+F for find, etc.

**Action:** Click into the editor. Show the Solidity code. Make a small edit to show it's fully interactive. Use Ctrl+Z to undo.

---

### Step 7 — Compile, Deploy & Reset Toolbar

**What to show:** The toolbar above the editor.

**Talking points:**
- **Compile** — Parses the Solidity code, extracts the contract name, function signatures, and events. Generates an ABI and bytecode. Compilation results (success/errors/warnings) appear in the Console.
- **Deploy** — Takes the compiled ABI and bytecode, creates an ethers.js ContractFactory, and sends a deployment transaction through MetaMask to Sepolia. The deployed contract address is logged to the console with a clickable Etherscan link.
- **Reset** — Restores the original vulnerable contract code for the current level (useful if you've made edits and want to start fresh).
- After compilation, a **status badge** appears: green "Compiled" on success, or red with error count on failure.

**Action:** Click **Compile**. Show the console output. Show the "Compiled" badge appearing. Click **Reset** to restore original code.

---

### Step 8 — Challenge Panel (Challenge Tab)

**What to show:** Click the **"Challenge"** tab in the left panel.

**Talking points:**
- This is the **mission briefing** for the current level.
- Shows the **level title**, **difficulty badge**, and **category** (e.g., State Management, Access Control).
- The **Description** card explains the vulnerability concept.
- The **Objective** card (cyan glow) tells the user exactly what they need to accomplish to pass the level.
- The **Attack Steps** checklist shows the sequence of actions needed for the exploit.

**Action:** Scroll through the Challenge panel showing each section. Read the objective aloud.

---

### Step 9 — Progressive Hint System

**What to show:** The **Hints** section in the Challenge panel.

**Talking points:**
- Users who are stuck can reveal hints **one at a time** — there are 3 hints per level.
- **Hint 1:** General direction — tells you what area to look at.
- **Hint 2:** Specific pointer — identifies the exact vulnerable pattern.
- **Hint 3:** Near-solution — practically tells you what to do.
- The number of hints used is tracked and affects **leaderboard ranking** — fewer hints = higher rank.
- This progressive system encourages users to try on their own first before seeking help.

**Action:** Click **"Reveal Hint 1"** — show the hint appearing. Click **"Reveal Hint 2"** — show the second hint. Point out the "Reveal Hint 3" button.

---

### Step 10 — Solution & Insights Toggles

**What to show:** The **Show Solution** and **Show Insights** accordion cards.

**Talking points:**
- **Show Solution:** Completely stuck? This reveals the full step-by-step solution explaining exactly how to exploit the vulnerability. It's hidden by default to encourage self-discovery.
- **Show Insights:** After completing a level (or any time via this toggle), users get deep **security education**:
  - Why the vulnerability exists at the EVM level
  - The secure coding pattern that prevents it
  - Real-world incident case study with financial impact
  - Module mapping (Module 3.1 / Module 3.4)
- This "**attack then defend**" pedagogy mirrors how professional security auditors work.

**Action:** Click **"Show Solution"** — show it expanding. Click again to collapse. Click **"Show Insights"** to expand.

---

### Step 11 — Console Output (Console Tab)

**What to show:** Click the **"Console"** tab in the right panel.

**Talking points:**
- A **terminal-style console** that displays all platform activity.
- Messages are **color-coded by type:**
  - **Cyan** — Informational messages
  - **Green** — Successful operations (compilation, deployment)
  - **Red** — Errors and reverts
  - **Yellow** — Warnings and hints
  - **Purple** — Transaction hashes
- Transaction hashes are **clickable links** to Sepolia Etherscan for on-chain verification.
- Each message includes a **timestamp** for tracking the sequence of events.
- The **Clear** button wipes the console. A **blinking cursor** at the bottom gives it an authentic terminal feel.

**Action:** Point out different colored messages. If a tx hash is visible, click it to open Etherscan. Click the Clear button and show the console emptying.

---

### Step 12 — Attack Dashboard (Attack Dashboard Tab)

**What to show:** Click the **"Attack Dashboard"** tab in the right panel.

**Talking points:**
- This is the **guided exploitation interface** — it walks users through each attack step-by-step.
- Each step shows:
  - **Step number** with a visual indicator (gray=pending, cyan=active, green=completed)
  - **Title and description** of what to do
  - **Code snippet** (if applicable) showing the relevant Solidity/exploit code
  - **State change** annotation explaining how the contract's storage changes after this step
- The **"Execute Step"** button advances through the sequence.
- Steps have a **glow effect** — cyan when active, green when completed.
- This guided approach is what differentiates our platform from Ethernaut, which gives no step-by-step guidance.

**Action:** Click **"Execute Step"** to advance through 2-3 steps. Show the step cards changing from pending to active to completed. Point out the code snippets and state change annotations.

---

### Step 13 — Security Insights Panel (Insights Tab)

**What to show:** Click the **"Insights"** tab in the right panel.

**Talking points:**
- This panel provides **structured post-exploitation security education**.
- Three main sections, each in a distinct card:
  1. **Vulnerability Explanation** (red glow) — Deep technical explanation of why the vulnerability exists and how it works at the EVM level.
  2. **Secure Coding Practices** (green glow) — The specific defensive pattern with code examples. For Level 1, this shows the **Checks-Effects-Interactions (CEI)** pattern and **ReentrancyGuard**.
  3. **Real-World Impact** (cyan glow) — Historical incident case study. For Level 1: "The DAO hack, June 2016, $60 million stolen, led to the Ethereum hard fork."
- A **Module Reference** badge maps to academic curriculum:
  - **Module 3.1** — Web Application Vulnerabilities
  - **Module 3.4** — Secure Code Review
- This content is shown after level completion OR via the toggle in the Challenge panel.

**Action:** Scroll through all three insight cards. Read key excerpts aloud. Point out the module mapping badge.

---

### Step 14 — Leaderboard (Leaderboard Tab)

**What to show:** Click the **"Leaderboard"** tab in the left panel.

**Talking points:**
- The leaderboard **ranks users** by:
  1. **Levels completed** (more = higher rank)
  2. **Hints used** (fewer = higher rank) — this is the tiebreaker
- Users are identified by their **truncated wallet address**.
- The **current user's row is highlighted** for easy identification.
- Data is stored in **localStorage** and persists across sessions.
- This gamification element encourages competition and self-reliance (using fewer hints).

**Action:** If a level has been completed, show the leaderboard entry. If not, explain what it would look like.

---

### Step 15 — Level Completion Flow

**What to show:** Go back to the Challenge tab and click **"Mark as Complete"**.

**Talking points:**
- After successfully exploiting a contract, users click **"Mark as Complete"**.
- A **confirmation dialog** appears to prevent accidental completion.
- On confirmation:
  - The sidebar updates with a **green checkmark** on the completed level.
  - The **progress bar** advances.
  - A **leaderboard entry** is created with the wallet address, level, timestamp, and hints used.
  - The Insights panel becomes fully accessible.
- The green **"Level Completed"** banner replaces the complete button.

**Action:** Click "Mark as Complete" → show the confirmation dialog → click "Confirm" → show the sidebar checkmark and progress bar updating.

---

### Step 16 — Interactive Demo Tour

**What to show:** Click the **"Demo Tour"** button in the header.

**Talking points:**
- For first-time users, the platform includes a built-in **interactive guided tour**.
- Clicking "Demo Tour" activates a **spotlight overlay** that highlights each feature one by one.
- A **tooltip** appears next to the highlighted element with a title and description.
- Users navigate with **Next/Back/Skip** buttons.
- The tour **automatically switches tabs** when needed — it switches to the Challenge tab, Attack Dashboard, Insights, and Leaderboard at the appropriate steps.
- A **progress bar** shows how far through the tour you are (step X of 16).
- The tour covers all 16 major features in about 2 minutes.

**Action:** Click the Demo Tour button. Click through 3-4 steps to show the spotlight and tab-switching. Then click "Skip Tour" to exit.

---

## Quick Feature Summary (Cheat Sheet)

| Feature | Location | What It Does |
|---------|----------|-------------|
| Monaco Editor | Left Panel > Editor tab | Write/edit Solidity with syntax highlighting |
| Compile | Editor toolbar | Parse Solidity, generate ABI & bytecode |
| Deploy | Editor toolbar | Deploy contract to Sepolia via MetaMask |
| Reset | Editor toolbar | Restore original challenge contract code |
| Wallet Connect | Header (right) | Connect MetaMask, show address/balance |
| Network Badge | Header (right) | Shows Sepolia (green) or Wrong Network (red) |
| Level Sidebar | Left sidebar | 5 challenge levels with difficulty & completion |
| Progress Bar | Sidebar (top) | X/5 completed, localStorage persisted |
| Challenge Panel | Left Panel > Challenge tab | Level description, objective, attack steps |
| Hints (3-tier) | Challenge tab > Hints card | Progressive hints — fewer used = higher rank |
| Solution Reveal | Challenge tab > Show Solution | Full exploit walkthrough (hidden by default) |
| Console | Right Panel > Console tab | Color-coded terminal with Etherscan tx links |
| Attack Dashboard | Right Panel > Attack Dashboard tab | Step-by-step guided exploit with state changes |
| Security Insights | Right Panel > Insights tab | Vulnerability explanation, secure coding, real-world impact |
| Leaderboard | Left Panel > Leaderboard tab | Rankings by levels completed and hint efficiency |
| Demo Tour | Header > Demo Tour button | Interactive spotlight walkthrough of all features |

---

## Challenge Levels Reference

| # | Name | Difficulty | Vulnerability (SWC) | Real-World Exploit |
|---|------|-----------|---------------------|-------------------|
| 1 | Reentrancy Attack | Easy | Recursive withdraw before state update (SWC-107) | The DAO — $60M (2016) |
| 2 | Ownership Takeover | Easy | Unprotected initialization function (SWC-105) | Parity Wallet hack (2017) |
| 3 | Delegatecall Exploit | Medium | Storage slot collision in proxy pattern (SWC-112) | Parity Multisig — $150M (2017) |
| 4 | Integer Overflow | Medium | Unchecked arithmetic underflow pre-0.8 (SWC-101) | BEC Token — $900M (2018) |
| 5 | Force Feeding ETH | Hard | selfdestruct balance manipulation (SWC-132) | Various DeFi exploits |

---

## Tech Stack Quick Reference

| Technology | Purpose |
|-----------|---------|
| React 19 + TypeScript | UI framework with type safety |
| Vite 8 | Build tool with instant HMR |
| TailwindCSS 4 | Dark-themed utility-first styling |
| Monaco Editor | VS Code engine for Solidity editing |
| ethers.js 6 | MetaMask wallet & contract interaction |
| solc-js | Browser-based Solidity compiler |
| Zustand | State management with localStorage persistence |
| Lucide React | Icon library |

---

## Closing Statement

> Web3 Security Lab demonstrates that smart contract security education doesn't have to be fragmented across multiple tools or intimidating for beginners. By combining code editing, real blockchain deployment, guided exploitation, and structured security education in a single browser-based platform, we make it possible for anyone to learn — by breaking — how the most devastating smart contract vulnerabilities work and how to prevent them.

---

*End of Demo Script*
