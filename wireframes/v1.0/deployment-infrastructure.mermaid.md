%% CBC Acoustics v2 - Deployment Infrastructure
%% How the code runs in production: CI/CD, hosting, CDN, and service dependencies
%% Updated: 2025-11-08

flowchart TB
    subgraph Development["Development & Source Control"]
        Dev["Developer<br/>(Local Machine)"]
        Git["Git Repository<br/>(GitHub)"]
        MainBranch["main branch<br/>(Production)"]
        FeatureBranch["Feature Branches<br/>(Development)"]
    end

    subgraph CICD["CI/CD Pipeline"]
        GitHubActions["GitHub Actions<br/>(Optional CI)"]
        BuildProcess["Build Process:<br/>1. npm install<br/>2. npm run typecheck<br/>3. npm run lint<br/>4. npm test<br/>5. npm run build"]
        BuildArtifacts["Build Artifacts<br/>(dist/ directory)"]
    end

    subgraph CloudflareDeployment["Cloudflare Pages (Recommended)"]
        CFPages["Cloudflare Pages"]
        CFBuild["Cloudflare Build:<br/>- Detects push to main<br/>- Runs npm run build<br/>- Deploys to edge"]
        CFEdge["Cloudflare Edge Network<br/>(300+ locations)"]
        CFCDN["CDN Cache<br/>(Static Assets)"]
        CFDomain["Custom Domain<br/>(e.g., acoustics.cbcradio.ca)"]
        CFPreview["Preview Deployments<br/>(Feature branches)"]
    end

    subgraph VercelDeployment["Vercel (Alternative)"]
        VercelPlatform["Vercel Platform"]
        VercelBuild["Vercel Build:<br/>- Framework: Vite<br/>- Auto-detect config<br/>- Deploy to edge"]
        VercelEdge["Vercel Edge Network"]
        VercelDomain["Custom Domain<br/>(*.vercel.app)"]
        VercelPreview["Preview URLs<br/>(PR deployments)"]
    end

    subgraph ClientAccess["Client Access"]
        Browser["User Browser"]
        DNS["DNS Resolution"]
        HTTPS["HTTPS Request"]
        CDNResponse["CDN Response<br/>(Cached Assets)"]
    end

    subgraph StaticAssets["Static Assets Served"]
        HTMLFile["index.html"]
        JSBundle["JavaScript Bundle<br/>(~424 KB gzipped)"]
        CSSBundle["CSS Bundle<br/>(Tailwind)"]
        DataFiles["CSV Data Files<br/>(measurements/)"]
        Fonts["Fonts & Icons"]
    end

    subgraph MonitoringOptional["Monitoring & Analytics (Optional)"]
        CFAnalytics["Cloudflare Analytics<br/>(Page views, bandwidth)"]
        VercelAnalytics["Vercel Analytics<br/>(Core Web Vitals)"]
        Sentry["Sentry<br/>(Error tracking)"]
        LogRocket["LogRocket<br/>(Session replay)"]
    end

    %% Development flow
    Dev --> Git
    Git --> MainBranch
    Git --> FeatureBranch

    %% CI/CD flow
    MainBranch --> GitHubActions
    GitHubActions --> BuildProcess
    BuildProcess --> BuildArtifacts

    %% Cloudflare deployment
    MainBranch --> CFPages
    CFPages --> CFBuild
    CFBuild --> CFEdge
    CFEdge --> CFCDN
    CFCDN --> CFDomain
    FeatureBranch --> CFPreview

    %% Vercel deployment (alternative)
    MainBranch -.-> VercelPlatform
    VercelPlatform -.-> VercelBuild
    VercelBuild -.-> VercelEdge
    VercelEdge -.-> VercelDomain
    FeatureBranch -.-> VercelPreview

    %% Client access
    Browser --> DNS
    DNS --> HTTPS
    HTTPS --> CFEdge
    CFEdge --> CDNResponse
    CDNResponse --> Browser

    %% Static assets
    CDNResponse --> HTMLFile
    CDNResponse --> JSBundle
    CDNResponse --> CSSBundle
    CDNResponse --> DataFiles
    CDNResponse --> Fonts

    %% Monitoring
    CFEdge -.-> CFAnalytics
    VercelEdge -.-> VercelAnalytics
    Browser -.-> Sentry
    Browser -.-> LogRocket

    classDef dev fill:#e3f2fd,stroke:#1565c0,stroke-width:2px
    classDef cicd fill:#fff3e0,stroke:#ef6c00,stroke-width:2px
    classDef cloudflare fill:#f3e5f5,stroke:#6a1b9a,stroke-width:2px
    classDef vercel fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px
    classDef client fill:#fce4ec,stroke:#c2185b,stroke-width:2px
    classDef assets fill:#e0f2f1,stroke:#00695c,stroke-width:2px
    classDef monitoring fill:#fff8e1,stroke:#f57f17,stroke-width:1px,stroke-dasharray: 5 5

    class Dev,Git,MainBranch,FeatureBranch dev
    class GitHubActions,BuildProcess,BuildArtifacts cicd
    class CFPages,CFBuild,CFEdge,CFCDN,CFDomain,CFPreview cloudflare
    class VercelPlatform,VercelBuild,VercelEdge,VercelDomain,VercelPreview vercel
    class Browser,DNS,HTTPS,CDNResponse client
    class HTMLFile,JSBundle,CSSBundle,DataFiles,Fonts assets
    class CFAnalytics,VercelAnalytics,Sentry,LogRocket monitoring
