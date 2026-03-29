import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const USER_DIR = 'c:/Users/louis/OneDrive/Documents/GitHub';

const existingProjects = [
    {
        id: 1,
        title: "Cosmos Clip",
        description: "Advanced clipboard manager with backup encryption and history tracking.",
        status: "Active",
        version: "1.2.2",
        tags: ["Electron", "React", "Utility", "Encryption"],
        path: `${USER_DIR}/cosmos-clip`,
        monitorUrl: "http://localhost:5678",
        ports: [{ label: "App", value: 5678 }],
        departments: [],
        docs: [],
        issues: []
    },
    {
        id: 2,
        title: "DevControl",
        description: "Mission control dashboard for managing development projects.",
        status: "Active",
        version: "0.1.0",
        tags: ["React", "Node.js", "Express", "AI"],
        path: `${USER_DIR}/DevControl`,
        monitorUrl: "http://localhost:7777",
        ports: [{ label: "Dashboard", value: 7777 }, { label: "API", value: 42424 }],
        departments: [],
        docs: [],
        issues: []
    },
    {
        id: 3,
        title: "CosmoWhisper",
        description: "Next-gen voice transcription and command engine.",
        status: "Active",
        version: "1.3.2",
        tags: ["Electron", "React", "AI", "Voice"],
        path: `${USER_DIR}/CosmoWhisper-App`,
        monitorUrl: "http://localhost:5173",
        ports: [
            { label: "Frontend", value: 5173 },
            { label: "Electron", value: 4242 },
            { label: "Overlay", value: 8080 }
        ],
        departments: [],
        docs: [],
        issues: []
    }
];

const newProjects = [
    {
        id: 4,
        title: "Micro Meadow",
        description: "Full stack application with Stripe and Google Cloud integration.",
        status: "Development",
        version: "0.0.0",
        tags: ["React", "Prisma", "PostgreSQL", "Stripe"],
        path: `${USER_DIR}/Micro Meadow`,
        monitorUrl: "http://localhost:3002",
        ports: [{ label: "App", value: 3002 }],
        departments: [],
        docs: [],
        issues: []
    },
    {
        id: 5,
        title: "Caterham Rotary",
        description: "Community website for Caterham Rotary Club.",
        status: "Live",
        version: "1.0.0",
        tags: ["Web", "Community"],
        path: `${USER_DIR}/Caterham Rotary`,
        monitorUrl: "http://localhost:4000",
        ports: [{ label: "Web", value: 4000 }],
        departments: [],
        docs: [],
        issues: []
    },
    {
        id: 6,
        title: "Bunny Fun Run",
        description: "Event management or game application.",
        status: "Development",
        version: "0.0.0",
        tags: ["Game", "Event"],
        path: `${USER_DIR}/bunny fun run`,
        monitorUrl: "http://localhost:3000",
        ports: [{ label: "App", value: 3000 }],
        departments: [],
        docs: [],
        issues: []
    },
    {
        id: 7,
        title: "File Manager",
        description: "Local file management utility.",
        status: "Active",
        version: "1.0.0",
        tags: ["Utility"],
        path: `${USER_DIR}/File Manager`,
        monitorUrl: "",
        ports: [],
        departments: [],
        docs: [],
        issues: []
    },
    {
        id: 8,
        title: "MailChimp",
        description: "Email marketing integration project.",
        status: "Archived",
        version: "1.0.0",
        tags: ["API", "Marketing"],
        path: `${USER_DIR}/MailChimp`,
        monitorUrl: "",
        ports: [],
        departments: [],
        docs: [],
        issues: []
    },
    {
        id: 9,
        title: "Word Search",
        description: "Interactive word search game.",
        status: "Development",
        version: "1.0.0",
        tags: ["Game", "React"],
        path: `${USER_DIR}/Word search`,
        monitorUrl: "",
        ports: [],
        departments: [],
        docs: [],
        issues: []
    }
];

const allProjects = [...existingProjects, ...newProjects];
const serverPath = path.join(__dirname, 'projects.json');
fs.writeFileSync(serverPath, JSON.stringify(allProjects, null, 2));

console.log(`Restored ${allProjects.length} projects to ${serverPath}`);
