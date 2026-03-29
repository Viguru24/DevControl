# Implementation Plan - UI Overhaul & Feature Expansion

## Overview
Transform DevControl into a professional mission control suite by reorganizing the navigation and adding critical infrastructure management features (Documentation, Security Vault, and dedicated Project Repository).

## User Objectives
- **Dedicated Project Menu**: Move project management from the dashboard to a sidebar-accessible repository.
- **Knowledge Base**: A dedicated area for system documentation and technical guides.
- **Security Sentinel**: A password-protected vault for managing API keys and infrastructure credentials.
- **CosmoWhisper Integration**: Replace the legacy "SimpleWhisper" entry with the latest "CosmoWhisper" project.
- **Aesthetic Refinement**: Maintain high-contrast, premium "neon-midnight" aesthetic across all new interfaces.

## Tasks

### 1. Navigation & Layout Reorganization 🟢
- [x] Create `ProjectListView.jsx` for the comprehensive project repository.
- [x] Create `DocumentationView.jsx` for browsing system markdown files.
- [x] Create `SecurityVault.jsx` for encrypted credential management.
- [x] Update `Layout.jsx` sidebar with "Projects Repository", "Documentation", and "Security Vault" tabs.
- [x] Refactor `App.jsx` to handle the new view states.

### 2. Feature Implementation 🟢
- [x] Implement the Secure Vault lock system.
- [x] Implement the Documentation sync bridge (fetch from `/api/documentation`).
- [x] Implement project filtering and search in the Repository view.
- [x] Refine "Dashboard" to focus purely on high-level metrics and system status (Overview mode).

### 3. Data Integrity 🟢
- [x] Update `server/projects.json` to replace "SimpleWhisper" with "CosmoWhisper".
- [x] Ensure folder paths are correctly normalized to the `louis` user environment.

### 4. Polish & Aesthetics 🟡
- [x] Fix CSS lint compatibility issues (standard properties for `background-clip` and `line-clamp`).
- [ ] Add transition animations between views for a "premium" feel.
- [x] Ensure the "Active Endpoints" section in the sidebar remains synchronized with the backend.

### 3. Integrated Project Control [NEW] 🟢
- **Scope**: Every project node now contains its own dedicated "Secure Area" for credentials (Usernames, Passwords, API Keys).
- **Workflow**:
    - [x] Removed **Standalone Security Vault** from the sidebar.
    - [x] Security is now a primary tab within each project's **Strategy Manager**.
    - [x] Credentials are saved directly to the project's metadata in `projects.json`.

### 4. Global System Settings [NEW] 🟢
- **Purpose**: Centralized control for system-wide protocols and security.
- **Workflow**:
    - [x] **Master Password Protocol**: A single gateway password that unlocks all project-specific vaults.
    - [x] **Encryption Manifest**: A dedicated section within settings that explains the **AES-256** implementation, ensuring the user understands the level of local data protection.
- **Authentication**: Master password setup/reset logic in the backend (using bcrypt for hashing if implemented fully).

### 5. Deep Deletion Protocol 🟢
- **Scope**: Multi-stage deletion for infrastructure nodes.
- **Verification**: Typing project name to confirm "Total Destruction" (recursive folder removal).

## Success Criteria
- Standalone vault is removed.
- Project-level security is intuitive and accessible.
- Global settings allow master password configuration.
- Encryption protocols are clearly documented in the UI.
