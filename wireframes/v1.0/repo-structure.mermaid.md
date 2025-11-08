%% CBC Acoustics v2 - Repository Structure
%% Complete directory tree visualization showing all project directories and key configuration files
%% Updated: 2025-11-08

graph TB
    Root["/cbc-acoustics-v2<br/>(Project Root)"]

    subgraph Configuration["Configuration Files"]
        Root --> Package["package.json<br/>(Dependencies & Scripts)"]
        Root --> TS["tsconfig.json<br/>(TypeScript Config)"]
        Root --> Vite["vite.config.ts<br/>(Build Tool Config)"]
        Root --> Tailwind["tailwind.config.js<br/>(CSS Framework)"]
        Root --> ESLint["eslint.config.js<br/>(Code Linting)"]
        Root --> Prettier[".prettierrc<br/>(Code Formatting)"]
        Root --> Git[".gitignore<br/>(Git Exclusions)"]
        Root --> ClaudeIgnore[".claudeignore<br/>(Claude Context Exclusions)"]
        Root --> HTML["index.html<br/>(Entry HTML)"]
    end

    subgraph Documentation["Documentation"]
        Root --> README["README.md<br/>(Project Overview)"]
        Root --> CLAUDE["CLAUDE.md<br/>(Dev Guidelines)"]
        Root --> Docs["docs/"]
        Docs --> ACU["acu/<br/>(Sprint Docs)"]
        ACU --> ACU001["ACU001 Project Vision.md"]
        ACU --> ACU002["ACU002 Sprint 1 Setup.md"]
        ACU --> ACU003["ACU003 Sprint 2 Architecture.md"]
        ACU --> ACU004["ACU004 Sprint 3 Core Components.md"]
        ACU --> ACU005["ACU005 Sprint 4 Polish.md"]
        ACU --> ACU006["ACU006 Sprint 3 Completion Report.md"]
        ACU --> ACU007["ACU007 Sprint 4 Completion Report.md"]
        ACU --> INDEX["INDEX.md"]
        Docs --> Deploy["DEPLOYMENT.md<br/>(Deployment Guide)"]
    end

    subgraph SourceCode["Source Code (src/)"]
        Root --> Src["src/"]

        Src --> Main["main.tsx<br/>(React Entry Point)"]
        Src --> App["App.tsx<br/>(Root Component & Routing)"]

        subgraph Pages["Pages"]
            Src --> PagesDir["pages/"]
            PagesDir --> Dashboard["Dashboard.tsx<br/>(Main Dashboard)"]
            PagesDir --> Visualizer["Visualizer.tsx<br/>(3D Room View)"]
            PagesDir --> Frequency["Frequency.tsx<br/>(Frequency Analysis)"]
            PagesDir --> Simulator["Simulator.tsx<br/>(Treatment Simulator)"]
            PagesDir --> About["About.tsx<br/>(About Page)"]
        end

        subgraph Components["Components"]
            Src --> CompDir["components/"]
            CompDir --> Layout["layout/"]
            Layout --> Header["Header.tsx"]
            Layout --> PageLayout["PageLayout.tsx"]

            CompDir --> UI["ui/"]
            UI --> Button["button.tsx"]
            UI --> Card["card.tsx"]
            UI --> Select["select.tsx"]
            UI --> Slider["slider.tsx"]
            UI --> Label["label.tsx"]
            UI --> UIIndex["index.ts"]

            CompDir --> Viz["visualizations/"]
            Viz --> RoomGeometry["RoomGeometry.tsx<br/>(Room Dimensions)"]
            Viz --> RoomModel3D["RoomModel3D.tsx<br/>(3D Visualization)"]
            Viz --> Heatmap["DegradationHeatmap.tsx<br/>(STI Heatmap)"]
            Viz --> Panels["AcousticPanels.tsx<br/>(Panel Visualization)"]
            Viz --> Positions["MeasurementPositions.tsx<br/>(Position Markers)"]
            Viz --> RT60["RT60Comparison.tsx<br/>(RT60 Charts)"]
            Viz --> FreqExplorer["FrequencyExplorer.tsx<br/>(Frequency Charts)"]
        end

        subgraph Context["State Management"]
            Src --> CtxDir["context/"]
            CtxDir --> AcousticsCtx["AcousticsContext.tsx<br/>(Global State & Logic)"]
        end

        subgraph Library["Library Code"]
            Src --> Lib["lib/"]

            Lib --> Acoustics["acoustics/<br/>(Calculation Modules)"]
            Acoustics --> RT60Lib["rt60.ts<br/>(RT60 Calculations)"]
            Acoustics --> STI["sti.ts<br/>(STI Calculations)"]
            Acoustics --> Modes["modes.ts<br/>(Modal Analysis)"]
            Acoustics --> Absorption["absorption.ts<br/>(Absorption Coefficients)"]
            Acoustics --> AcIndex["index.ts"]

            Lib --> Data["data/<br/>(Data Processing)"]
            Data --> FreqResp["frequencyResponse.ts<br/>(Frequency Data)"]

            Lib --> Utils["utils/<br/>(Helper Functions)"]
            Utils --> Constants["constants.ts<br/>(Room Data & Constants)"]
            Utils --> Positions2["positions.ts<br/>(Position Utilities)"]
            Utils --> Conversions["conversions.ts<br/>(Unit Conversions)"]
            Utils --> Export["export.ts<br/>(Export Utilities)"]
            Utils --> CN["cn.ts<br/>(Classname Helper)"]
        end

        Src --> Styles["styles/<br/>(Global Styles)"]
        Styles --> Globals["globals.css"]
    end

    subgraph DataFiles["Data Files"]
        Root --> DataDir["data/"]
        DataDir --> Measurements["measurements/<br/>(Real Acoustic Data)"]
        Measurements --> CSVFiles["*.csv<br/>(July 15, 2025 Smaart Data)"]
    end

    subgraph Testing["Testing"]
        Root --> Tests["tests/"]
        Tests --> Unit["unit/"]
        Unit --> UnitAcoustics["acoustics/<br/>(Acoustics Tests)"]
    end

    subgraph ClaudeConfig["Claude Code Config"]
        Root --> ClaudeDir[".claude/"]
        ClaudeDir --> ClaudeContext["context/<br/>(Distilled Knowledge)"]
    end

    classDef config fill:#e1f5ff,stroke:#0277bd,stroke-width:2px
    classDef docs fill:#fff3e0,stroke:#ef6c00,stroke-width:2px
    classDef source fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px
    classDef data fill:#f3e5f5,stroke:#6a1b9a,stroke-width:2px
    classDef test fill:#fce4ec,stroke:#c2185b,stroke-width:2px

    class Package,TS,Vite,Tailwind,ESLint,Prettier,Git,ClaudeIgnore,HTML config
    class README,CLAUDE,Docs,ACU,Deploy,ACU001,ACU002,ACU003,ACU004,ACU005,ACU006,ACU007,INDEX docs
    class Src,Main,App,PagesDir,CompDir,Lib,CtxDir,Styles source
    class DataDir,Measurements,CSVFiles data
    class Tests,Unit,UnitAcoustics test
