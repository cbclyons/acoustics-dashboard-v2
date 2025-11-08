%% CBC Acoustics v2 - Component Map
%% Detailed component breakdown showing module boundaries, dependencies, and public APIs
%% Updated: 2025-11-08

classDiagram
    class App {
        +render() ReactElement
        -Routes configuration
        -AcousticsProvider wrapper
    }

    class AcousticsContext {
        +selectedRoom string
        +selectedPosition string
        +panelConfig PanelConfig
        +currentRT60 Record
        +predictedRT60 Record
        +currentSTI number
        +predictedSTI number
        +totalCost number
        +viewMode string
        +setSelectedRoom(room)
        +updatePanelCount(thickness, count)
        +toggleViewMode()
        +resetPanelConfig()
    }

    class Dashboard {
        +render() ReactElement
        -useAcoustics() hook
        -Displays overview metrics
    }

    class Visualizer {
        +render() ReactElement
        -useAcoustics() hook
        -3D room visualization
    }

    class Frequency {
        +render() ReactElement
        -useAcoustics() hook
        -Frequency analysis
    }

    class Simulator {
        +render() ReactElement
        -useAcoustics() hook
        -Treatment configuration
    }

    class About {
        +render() ReactElement
        -Static content
    }

    class Header {
        +render() ReactElement
        -Navigation links
    }

    class RoomModel3D {
        +render() ReactElement
        +panelConfig PanelConfig
        +viewMode string
        -Canvas setup
        -Three.js scene
    }

    class RT60Comparison {
        +render() ReactElement
        +currentRT60 Record
        +predictedRT60 Record
        -Recharts LineChart
    }

    class FrequencyExplorer {
        +render() ReactElement
        +selectedPosition string
        -Recharts LineChart
        -Frequency response data
    }

    class DegradationHeatmap {
        +render() ReactElement
        +currentSTI number
        +predictedSTI number
        -Position-based heatmap
    }

    class RoomGeometry {
        +render() ReactElement
        +roomData RoomData
        -Dimension display
    }

    class AcousticPanels {
        +render() ReactElement
        +panelConfig PanelConfig
        -Panel visualization
    }

    class MeasurementPositions {
        +render() ReactElement
        +selectedPosition string
        +onPositionChange function
        -Position markers
    }

    class Button {
        +render() ReactElement
        +variant string
        +size string
        +onClick function
    }

    class Card {
        +render() ReactElement
        +children ReactNode
    }

    class Select {
        +render() ReactElement
        +value string
        +onValueChange function
        +options array
    }

    class Slider {
        +render() ReactElement
        +value number
        +onValueChange function
        +min number
        +max number
    }

    class AcousticsLib {
        +calculateRT60WithPanels() Record
        +calculateAverageRT60() number
        +calculateSTIImprovement() number
        +calculatePanelAbsorption() Record
        +calculateDrapeAbsorption() Record
        +calculatePanelCost() number
        +identifyRoomModes() Mode[]
    }

    class DataProcessing {
        +loadFrequencyResponse() FrequencyData
        +processCSVData() MeasurementData
    }

    class Utils {
        +convertFeetToMeters() number
        +exportToPNG() void
        +exportToCSV() void
        +getPositionCoordinates() Position
    }

    class Constants {
        +STUDIO_8 RoomData
        +THE_HUB RoomData
        +TARGET_RT60 number
        +TARGET_STI number
        +MEASUREMENT_POSITIONS Position[]
    }

    %% App relationships
    App --> AcousticsContext : provides
    App --> Dashboard : routes to
    App --> Visualizer : routes to
    App --> Frequency : routes to
    App --> Simulator : routes to
    App --> About : routes to
    App --> Header : includes

    %% Page dependencies on Context
    Dashboard --> AcousticsContext : consumes
    Visualizer --> AcousticsContext : consumes
    Frequency --> AcousticsContext : consumes
    Simulator --> AcousticsContext : consumes

    %% Page dependencies on Visualizations
    Dashboard --> RoomGeometry : renders
    Dashboard --> RT60Comparison : renders
    Dashboard --> MeasurementPositions : renders

    Visualizer --> RoomModel3D : renders
    Visualizer --> AcousticPanels : renders
    Visualizer --> MeasurementPositions : renders

    Frequency --> FrequencyExplorer : renders

    Simulator --> RT60Comparison : renders
    Simulator --> DegradationHeatmap : renders
    Simulator --> Slider : uses
    Simulator --> Select : uses

    %% Visualization dependencies
    RoomModel3D --> AcousticPanels : includes
    RT60Comparison --> DataProcessing : uses
    FrequencyExplorer --> DataProcessing : uses
    DegradationHeatmap --> Constants : uses

    %% UI Component usage
    Dashboard --> Button : uses
    Dashboard --> Card : uses
    Visualizer --> Button : uses
    Frequency --> Select : uses
    Simulator --> Button : uses
    Simulator --> Card : uses

    %% Context dependencies on Business Logic
    AcousticsContext --> AcousticsLib : calls
    AcousticsContext --> Constants : reads

    %% Business Logic dependencies
    AcousticsLib --> Utils : uses
    AcousticsLib --> Constants : reads
    DataProcessing --> Constants : reads
