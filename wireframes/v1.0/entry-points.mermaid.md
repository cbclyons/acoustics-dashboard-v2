%% CBC Acoustics v2 - Entry Points
%% All ways to interact with the codebase: application initialization, routes, scripts
%% Updated: 2025-11-08

flowchart TD
    subgraph BrowserEntry["Browser Entry Points"]
        URL["User Navigates to URL<br/>(https://app.domain.com)"]
        IndexHTML["index.html<br/>(Entry HTML)"]
        MainTSX["main.tsx<br/>(React Entry)"]
        AppTSX["App.tsx<br/>(Root Component)"]
    end

    subgraph RoutingEntry["Routing Entry Points"]
        RootRoute["/  (Root Route)<br/>→ Dashboard"]
        VisualizerRoute["/visualizer<br/>→ Visualizer"]
        FrequencyRoute["/frequency<br/>→ Frequency Explorer"]
        SimulatorRoute["/simulator<br/>→ Treatment Simulator"]
        AboutRoute["/about<br/>→ About Page"]
    end

    subgraph StateEntry["State Initialization"]
        ContextInit["AcousticsProvider<br/>(Initialize Context)"]
        DefaultState["Default State:<br/>- Studio 8<br/>- Host C position<br/>- Default panels<br/>- 3D view"]
        Calculate["Calculate Initial Metrics:<br/>- Current RT60<br/>- Predicted RT60<br/>- STI values<br/>- Total cost"]
    end

    subgraph DevelopmentEntry["Development Entry Points"]
        DevServer["npm run dev<br/>(Vite Dev Server)"]
        TestRunner["npm test<br/>(Vitest Runner)"]
        Linter["npm run lint<br/>(ESLint)"]
        Typecheck["npm run typecheck<br/>(TypeScript Check)"]
        Format["npm run format<br/>(Prettier)"]
    end

    subgraph BuildEntry["Build Entry Points"]
        BuildProd["npm run build<br/>(Production Build)"]
        Preview["npm run preview<br/>(Preview Build)"]
        TypeScriptCompile["tsc<br/>(Compile TypeScript)"]
        ViteBuild["vite build<br/>(Bundle & Optimize)"]
        DistFolder["dist/<br/>(Build Output)"]
    end

    subgraph TestingEntry["Testing Entry Points"]
        UnitTests["tests/unit/<br/>(Unit Tests)"]
        CoverageTest["npm run test:coverage<br/>(Coverage Report)"]
        UITest["npm run test:ui<br/>(Vitest UI)"]
    end

    subgraph DataEntry["Data Entry Points"]
        CSVFiles["data/measurements/*.csv<br/>(Measurement Data)"]
        ConstantsFile["lib/utils/constants.ts<br/>(Room Configurations)"]
        FreqData["lib/data/frequencyResponse.ts<br/>(Data Loader)"]
    end

    %% Browser flow
    URL --> IndexHTML
    IndexHTML --> MainTSX
    MainTSX --> AppTSX
    AppTSX --> ContextInit
    ContextInit --> DefaultState
    DefaultState --> Calculate

    %% Routing
    AppTSX --> RootRoute
    AppTSX --> VisualizerRoute
    AppTSX --> FrequencyRoute
    AppTSX --> SimulatorRoute
    AppTSX --> AboutRoute

    %% Development flows
    DevServer --> MainTSX
    TestRunner --> UnitTests
    Linter -.-> AppTSX
    Typecheck -.-> AppTSX
    Format -.-> AppTSX

    %% Build flows
    BuildProd --> TypeScriptCompile
    TypeScriptCompile --> ViteBuild
    ViteBuild --> DistFolder
    Preview --> DistFolder

    %% Testing flows
    UnitTests --> TestRunner
    CoverageTest --> UnitTests
    UITest --> UnitTests

    %% Data flows
    Calculate --> ConstantsFile
    FrequencyRoute --> FreqData
    FreqData --> CSVFiles

    classDef browser fill:#e3f2fd,stroke:#1565c0,stroke-width:2px
    classDef routing fill:#f3e5f5,stroke:#6a1b9a,stroke-width:2px
    classDef state fill:#fff3e0,stroke:#ef6c00,stroke-width:2px
    classDef dev fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px
    classDef build fill:#fce4ec,stroke:#c2185b,stroke-width:2px
    classDef test fill:#fff8e1,stroke:#f57f17,stroke-width:2px
    classDef data fill:#e0f2f1,stroke:#00695c,stroke-width:2px

    class URL,IndexHTML,MainTSX,AppTSX browser
    class RootRoute,VisualizerRoute,FrequencyRoute,SimulatorRoute,AboutRoute routing
    class ContextInit,DefaultState,Calculate state
    class DevServer,TestRunner,Linter,Typecheck,Format dev
    class BuildProd,Preview,TypeScriptCompile,ViteBuild,DistFolder build
    class UnitTests,CoverageTest,UITest test
    class CSVFiles,ConstantsFile,FreqData data
