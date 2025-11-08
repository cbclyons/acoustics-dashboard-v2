%% CBC Acoustics v2 - Architecture Overview
%% High-level system design showing architectural layers and component interactions
%% Updated: 2025-11-08

graph TB
    subgraph Browser["Browser Environment"]
        subgraph Presentation["Presentation Layer"]
            Router["React Router<br/>(Navigation)"]
            Pages["Page Components<br/>(Dashboard, Visualizer, etc.)"]
            UI["UI Components<br/>(Buttons, Cards, Sliders)"]
        end

        subgraph Visualization["Visualization Layer"]
            ThreeJS["Three.js / R3F<br/>(3D Room Rendering)"]
            Recharts["Recharts<br/>(2D Charts & Graphs)"]
            VizComponents["Visualization Components<br/>(RT60, Frequency, Heatmaps)"]
        end

        subgraph StateManagement["State Management"]
            Context["AcousticsContext<br/>(Global State)"]
            Hooks["React Hooks<br/>(useState, useEffect, etc.)"]
        end

        subgraph BusinessLogic["Business Logic Layer"]
            AcousticsLib["Acoustics Module<br/>(RT60, STI, Modes)"]
            DataProcessing["Data Processing<br/>(Frequency Response)"]
            Utils["Utilities<br/>(Conversions, Positions, Export)"]
        end

        subgraph DataLayer["Data Layer"]
            Constants["Constants<br/>(Room Data, Target Specs)"]
            MeasurementData["Measurement Data<br/>(Static CSV Imports)"]
        end
    end

    subgraph ExternalDeps["External Dependencies"]
        React["React 18<br/>(UI Framework)"]
        TailwindCSS["Tailwind CSS<br/>(Styling)"]
        TypeScript["TypeScript<br/>(Type Safety)"]
    end

    subgraph BuildTools["Build & Development Tools"]
        Vite["Vite<br/>(Dev Server & Bundler)"]
        ESLint["ESLint<br/>(Linting)"]
        Vitest["Vitest<br/>(Testing)"]
    end

    subgraph DeploymentTarget["Deployment Targets"]
        CloudflarePages["Cloudflare Pages<br/>(Recommended)"]
        Vercel["Vercel<br/>(Alternative)"]
    end

    %% User Flow
    User([User]) --> Browser

    %% Presentation Layer Connections
    Router --> Pages
    Pages --> UI
    Pages --> VizComponents

    %% Visualization Connections
    VizComponents --> ThreeJS
    VizComponents --> Recharts
    VizComponents --> Context

    %% State Management Connections
    Pages --> Context
    Context --> Hooks
    Context --> AcousticsLib

    %% Business Logic Connections
    AcousticsLib --> Utils
    AcousticsLib --> Constants
    DataProcessing --> MeasurementData
    Context --> DataProcessing

    %% External Dependencies
    React -.-> Pages
    React -.-> UI
    React -.-> Context
    TailwindCSS -.-> UI
    TailwindCSS -.-> Pages
    TypeScript -.-> AcousticsLib
    TypeScript -.-> Context

    %% Build Tools
    Vite -.-> Browser
    ESLint -.-> Browser
    Vitest -.-> AcousticsLib

    %% Deployment
    Vite --> CloudflarePages
    Vite --> Vercel

    classDef presentation fill:#e3f2fd,stroke:#1565c0,stroke-width:2px
    classDef visualization fill:#f3e5f5,stroke:#6a1b9a,stroke-width:2px
    classDef state fill:#fff3e0,stroke:#ef6c00,stroke-width:2px
    classDef logic fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px
    classDef data fill:#fce4ec,stroke:#c2185b,stroke-width:2px
    classDef external fill:#f5f5f5,stroke:#616161,stroke-width:1px,stroke-dasharray: 5 5
    classDef tools fill:#fff8e1,stroke:#f57f17,stroke-width:1px,stroke-dasharray: 5 5

    class Router,Pages,UI presentation
    class ThreeJS,Recharts,VizComponents visualization
    class Context,Hooks state
    class AcousticsLib,DataProcessing,Utils logic
    class Constants,MeasurementData data
    class React,TailwindCSS,TypeScript external
    class Vite,ESLint,Vitest,CloudflarePages,Vercel tools
