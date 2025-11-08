%% CBC Acoustics v2 - Data Flow
%% How data moves through the system from user interaction to visualization
%% Updated: 2025-11-08

sequenceDiagram
    participant User
    participant Browser
    participant Router
    participant Page as Page Component
    participant Context as AcousticsContext
    participant AcLib as Acoustics Library
    participant DataProc as Data Processing
    participant Viz as Visualization Component
    participant Constants

    Note over User,Constants: Application Initialization Flow

    User->>Browser: Navigate to app
    Browser->>Router: Load App.tsx
    Router->>Context: Initialize AcousticsProvider
    Context->>Constants: Load STUDIO_8 data
    Constants-->>Context: Room dimensions, RT60, STI
    Context->>AcLib: Calculate initial metrics
    AcLib-->>Context: Predicted RT60, STI, cost
    Context->>Router: Provide global state
    Router->>Page: Render Dashboard
    Page->>Context: useAcoustics() hook
    Context-->>Page: State & actions
    Page->>Viz: Pass data as props
    Viz-->>User: Display initial dashboard

    Note over User,Constants: User Interaction Flow (Panel Configuration)

    User->>Page: Adjust panel slider
    Page->>Context: updatePanelCount(thickness, count)
    Context->>Context: Update panelConfig state
    Context->>AcLib: calculatePanelAbsorption(panelConfig)
    AcLib-->>Context: Added absorption by frequency
    Context->>AcLib: calculateRT60WithPanels(...)
    AcLib->>Constants: Get current RT60
    Constants-->>AcLib: Baseline RT60 data
    AcLib-->>Context: Predicted RT60
    Context->>AcLib: calculateSTIImprovement(...)
    AcLib-->>Context: Predicted STI
    Context->>AcLib: calculatePanelCost(panelConfig)
    AcLib-->>Context: Total cost
    Context->>Page: Trigger re-render with new state
    Page->>Viz: Pass updated RT60, STI, cost
    Viz-->>User: Display updated predictions

    Note over User,Constants: Navigation Flow

    User->>Page: Click "Visualizer" link
    Page->>Router: Navigate to /visualizer
    Router->>Page: Render Visualizer component
    Page->>Context: useAcoustics() hook
    Context-->>Page: Current state (preserved)
    Page->>Viz: Pass panelConfig, viewMode
    Viz->>Viz: Initialize Three.js scene
    Viz-->>User: Display 3D room

    Note over User,Constants: Frequency Analysis Flow

    User->>Page: Select position "Host B"
    Page->>Context: setSelectedPosition("Host B")
    Context->>Context: Update selectedPosition state
    Context->>Page: Trigger re-render
    Page->>Viz: Pass selectedPosition
    Viz->>DataProc: loadFrequencyResponse("Host B")
    DataProc->>Constants: Get position mapping
    Constants-->>DataProc: CSV file reference
    DataProc->>DataProc: Parse CSV data
    DataProc-->>Viz: Frequency, magnitude, phase arrays
    Viz->>Viz: Generate Recharts LineChart
    Viz-->>User: Display frequency response

    Note over User,Constants: Export Data Flow

    User->>Page: Click "Export PNG"
    Page->>Viz: Trigger export action
    Viz->>Viz: Capture chart canvas
    Viz->>Browser: Download PNG file
    Browser-->>User: Save to downloads

    Note over User,Constants: View Mode Toggle Flow

    User->>Page: Toggle 2D/3D
    Page->>Context: toggleViewMode()
    Context->>Context: Update viewMode state
    Context->>Page: Trigger re-render
    Page->>Viz: Pass viewMode='2D'
    Viz->>Viz: Switch to 2D layout
    Viz-->>User: Display 2D view

    Note over User,Constants: Reset Configuration Flow

    User->>Page: Click "Reset"
    Page->>Context: resetPanelConfig()
    Context->>Context: Set panelConfig to defaults
    Context->>AcLib: Recalculate all metrics
    AcLib-->>Context: Reset predictions
    Context->>Page: Trigger re-render
    Page->>Viz: Pass default panelConfig
    Viz-->>User: Display baseline state
