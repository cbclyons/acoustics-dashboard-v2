# CBC Acoustics v2 - Wireframes & Architecture Documentation

**Purpose:** Comprehensive Mermaid diagram documentation to inform human developer partners on all aspects of the codebase architecture.

---

## Documentation Structure

This directory contains **versioned** architecture documentation using paired files:
- **`.mermaid.md`** - Pure Mermaid diagram syntax (compatible with mermaid.live)
- **`.notes.md`** - Extended documentation, explanations, and insights

---

## Current Version: v1.0

**Location:** `wireframes/v1.0/`

**Created:** 2025-11-08
**Status:** Production-ready architecture documentation

---

## Available Diagrams

| Diagram | Mermaid File | Notes File | Purpose |
|---------|--------------|------------|---------|
| **Repository Structure** | `repo-structure.mermaid.md` | `repo-structure.notes.md` | Complete directory tree visualization |
| **Architecture Overview** | `architecture-overview.mermaid.md` | `architecture-overview.notes.md` | High-level system design and layers |
| **Component Map** | `component-map.mermaid.md` | `component-map.notes.md` | Detailed component breakdown and dependencies |
| **Data Flow** | `data-flow.mermaid.md` | `data-flow.notes.md` | How data moves through the system |
| **Entry Points** | `entry-points.mermaid.md` | `entry-points.notes.md` | All ways to interact with the codebase |
| **Deployment Infrastructure** | `deployment-infrastructure.mermaid.md` | `deployment-infrastructure.notes.md` | How the code runs in production |

---

## How to Use These Diagrams

### Viewing Mermaid Diagrams

**Option 1: Online Viewer (Recommended)**
1. Go to [mermaid.live](https://mermaid.live)
2. Copy contents of any `.mermaid.md` file
3. Paste into editor
4. Diagram renders automatically

**Option 2: VS Code Extension**
1. Install extension: "Markdown Preview Mermaid Support"
2. Open `.mermaid.md` file
3. Use preview pane (Cmd+Shift+V / Ctrl+Shift+V)

**Option 3: GitHub Rendering**
- GitHub automatically renders Mermaid in markdown files
- View directly in repository browser

---

### Reading the Notes Files

Each `.notes.md` file provides:
- **Overview** - Context and purpose of the diagram
- **Detailed Explanations** - Deep dive into each component/section
- **Key Decisions** - Architectural rationale and trade-offs
- **Common Workflows** - How to perform common tasks
- **Technical Debt** - Known limitations and future improvements
- **Related Diagrams** - Cross-references to other documentation

**Recommended Reading Order:**
1. `repo-structure.notes.md` - Understand file organization
2. `architecture-overview.notes.md` - Grasp system design
3. `component-map.notes.md` - Learn component relationships
4. `data-flow.notes.md` - Follow data transformations
5. `entry-points.notes.md` - Understand initialization
6. `deployment-infrastructure.notes.md` - Learn deployment process

---

## Diagram Types Used

### Graph (graph TB / flowchart TD)
**Used for:**
- Repository structure
- Architecture layers
- Data flows
- Deployment pipelines

**Features:**
- Directional arrows
- Subgraphs for grouping
- Color-coded nodes

---

### Class Diagram (classDiagram)
**Used for:**
- Component map
- Module boundaries
- Public APIs

**Features:**
- Class definitions with methods/properties
- Inheritance and composition relationships
- Dependency arrows

---

### Sequence Diagram (sequenceDiagram)
**Used for:**
- Data flow scenarios
- User interaction flows
- Request/response cycles

**Features:**
- Time-based vertical flow
- Actor interactions
- Annotations for context

---

## File Naming Convention

**Pattern:** `{topic}.{type}.md`

**Examples:**
- `repo-structure.mermaid.md` - Mermaid diagram for repository structure
- `repo-structure.notes.md` - Extended notes for repository structure

**Why This Approach?**
- **Pure Mermaid Files:** Compatible with visualizers (no markdown fences)
- **Separate Notes:** Rich documentation without cluttering diagrams
- **Version Control:** Easy to diff and track changes
- **Reusability:** Mermaid files can be embedded elsewhere

---

## Versioning Strategy

### Version Folder Structure
```
wireframes/
├── README.md          (This file)
├── v1.0/              (Current version)
│   ├── *.mermaid.md
│   └── *.notes.md
└── v2.0/              (Future iterations)
```

### When to Create a New Version
- Major architectural changes (new layers, frameworks)
- Significant component restructuring
- Addition of new systems (database, API, authentication)
- Sprint milestones requiring documentation update

### Version History
- **v1.0** (2025-11-08) - Initial production-ready architecture documentation

---

## For Human Developers: Quick Start

### New to the Project?
**Start here:**
1. Read `repo-structure.notes.md` - Understand where everything is
2. Read `architecture-overview.notes.md` - Grasp the big picture
3. Read `entry-points.notes.md` - Learn how to run the app

### Making Changes?
**Reference these:**
- `component-map.notes.md` - Understand component dependencies
- `data-flow.notes.md` - See how data moves through the system

### Deploying?
**Read:**
- `deployment-infrastructure.notes.md` - Full deployment guide

---

## For Claude Code: Maintenance

### Updating Diagrams
When making significant architectural changes:
1. Create new version folder (e.g., `v1.1/`)
2. Copy existing diagrams as starting point
3. Update Mermaid syntax for changes
4. Update corresponding notes files
5. Document changes in version history above

### Adding New Diagrams
If adding new diagram types (e.g., database schema, auth flows):
1. Create paired files: `{topic}.mermaid.md` + `{topic}.notes.md`
2. Follow existing format conventions
3. Update this README with new diagram in table
4. Cross-reference in related notes files

---

## Related Documentation

**Sprint Documents:**
- `docs/acu/ACU001 Project Vision.md` - Project context
- `docs/acu/ACU003 Sprint 2 Architecture.md` - Architectural decisions
- `docs/acu/ACU006 Sprint 3 Completion Report.md` - Implementation details

**Project Files:**
- `CLAUDE.md` - Development guidelines
- `README.md` - Project overview
- `docs/DEPLOYMENT.md` - Deployment runbook

---

## Diagram Quality Standards

### Mermaid Files (.mermaid.md)
- ✅ Pure Mermaid syntax (no markdown fences)
- ✅ Blank line after %% comments before diagram type
- ✅ Descriptive node labels with `<br/>` for multi-line
- ✅ Subgraphs for logical grouping
- ✅ Color-coded nodes via classDef
- ✅ Clear directional arrows
- ✅ Legend/notes in %% comments at top

### Notes Files (.notes.md)
- ✅ Clear section headings
- ✅ Code examples where applicable
- ✅ Cross-references to related diagrams
- ✅ Architectural rationale documented
- ✅ Common workflows explained
- ✅ Technical debt acknowledged
- ✅ Last updated date included

---

## Export Options

### PNG Export (for presentations)
1. Open `.mermaid.md` in mermaid.live
2. Click "PNG" button
3. Save to `wireframes/v1.0/exports/`

### SVG Export (for high-res documentation)
1. Open `.mermaid.md` in mermaid.live
2. Click "SVG" button
3. Save to `wireframes/v1.0/exports/`

### Markdown Embedding
```markdown
# Architecture Overview

\`\`\`mermaid
<paste contents of .mermaid.md>
\`\`\`
```

---

## Contributing

**When adding/updating wireframes:**
1. Follow naming conventions
2. Maintain paired file structure (mermaid + notes)
3. Update this README if adding new diagram types
4. Version appropriately (patch vs major changes)
5. Cross-reference related diagrams
6. Document architectural decisions

---

## Contact

**Maintained By:** Claude Code (Autonomous)
**Project Owner:** Chris Lyons
**Last Updated:** 2025-11-08
**Current Version:** v1.0

---

**For questions about specific diagrams, consult the corresponding `.notes.md` file.**
