# FRMR Marketplace Demo

A Next.js 15 application demonstrating **machine-readable trust centers** — ingest any FRMR-compatible JSON document and render a full trust center UI.

## The Idea

Companies don't need to run their own trust centers. If every cloud service provider publishes a machine-readable document in an open format (like [FedRAMP's FRMR JSON](https://github.com/FedRAMP/docs)), anyone can ingest that document and render their own trust center that looks exactly the way they want.

## Features

- 🔗 **URL-based loading** — enter any FRMR-compatible JSON URL
- 🤖 **Tambo AI integration** — ask questions about trust data (requires API key)
- 📄 **FRMR format support** — KSI, FRR, FRD viewers for FedRAMP documentation
- 🏢 **CSP trust center format** — certifications, security capabilities, policies, subprocessors, pen tests
- 🎨 **Clean, professional UI** — Tailwind CSS with status badges and responsive layout

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your values:

```bash
cp .env.local.example .env.local
```

```
NEXT_PUBLIC_TAMBO_API_KEY=your_tambo_api_key_here
```

The app works without a Tambo API key — AI querying is gracefully disabled.

## Sample Data

A sample CSP trust center JSON is available at `/sample-trust-data.json` (AcmeCorp Cloud Platform), or try the live [FedRAMP FRMR documentation](https://raw.githubusercontent.com/FedRAMP/docs/main/FRMR.documentation.json).

## Tech Stack

- **Next.js 15** with App Router
- **TypeScript**
- **Tailwind CSS**
- **Tambo AI** (`@tambo-ai/react`) for AI-powered querying
- **Zod** for schema validation (extensible)

## Project Structure

```
app/
  page.tsx                    # Home page with URL input
  trust-center/page.tsx       # Trust center viewer
  api/trust-data/route.ts     # Fetch proxy (avoids CORS)
  components/
    TrustCenterHeader.tsx     # Header with provider info & badges
    CertificationsPanel.tsx   # Certification cards grid
    SecurityCapabilitiesPanel.tsx  # Accordion of security controls
    SubprocessorsPanel.tsx    # Subprocessors table
    PoliciesPanel.tsx         # Policy links grid
    PenTestsPanel.tsx         # Pen test results cards
    KSIPanel.tsx              # FedRAMP Key Security Indicators
    FRRPanel.tsx              # FedRAMP Requirements & Recommendations
    FRDPanel.tsx              # FedRAMP Definitions glossary
    TamboChat.tsx             # AI chat sidebar
public/
  sample-trust-data.json      # Sample CSP trust center data
```
