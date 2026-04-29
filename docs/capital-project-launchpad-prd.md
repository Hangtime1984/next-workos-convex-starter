# Capital Project Launchpad PRD

## 1. Overview

Capital Project Launchpad is a standalone SaaS application for construction owners who need to choose a project delivery method and generate a matching procurement package.

The product combines two skill domains:

- [Project Delivery Advisor](/Users/marcusturner/Documents/COAA%20Information/project-delivery-advisor.skill)
- [Construction RFP/RFQ Generator](/Users/marcusturner/Documents/COAA%20Information/construction-rfp-generator.skill)

The app helps an owner move from early project definition to a defensible delivery recommendation, then into a draft RFQ/RFP, scoring matrix, interview rubric, or selection committee packet.

## 2. Product Goal

Enable construction owners to make better early project setup decisions by turning project characteristics, owner constraints, risk tolerance, market context, and procurement needs into structured recommendations and draft procurement documents.

## 3. Target Users

- Owner's representatives
- Capital project managers
- Procurement directors
- Public and private institutional owners
- Selection committee coordinators
- Facilities and capital planning leaders

## 4. Primary Problem

Owners often choose delivery methods and procurement strategies inconsistently. This can lead to unclear risk allocation, weak solicitations, poor evaluation criteria, uneven scoring, and project setup mistakes that are expensive to correct later.

## 5. MVP Success Criteria

A user can:

- Create a project.
- Complete a structured project intake.
- Generate a delivery method recommendation.
- Review scoring rationale, risks, and alternative methods.
- Accept or override the recommended delivery method.
- Generate a draft RFQ/RFP package.
- Generate a scoring matrix.
- Mark generated outputs as draft, reviewed, approved, or archived.
- Export approved outputs as Markdown or printable HTML.

## 6. Tech Stack

Stack:

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS v4
- shadcn/Radix UI
- Convex for database, realtime data, document state, and generated-output records
- WorkOS AuthKit for authentication, organizations, roles, and permissions
- Vercel for hosting and previews

## 7. Auth, Tenancy, And Roles

WorkOS is the source of truth for identity, organizations, and role claims.

Tenant model:

- WorkOS organization equals customer tenant.
- Convex workspace mirrors the active WorkOS organization.
- Users can only access records for their active organization.

Roles:

- `owner`: full access, including approval/archive and admin settings.
- `admin`: can approve/archive generated outputs and manage team workflows.
- `member`: can create projects, edit intake, generate drafts, and mark drafts reviewed.

## 8. AI Behavior

AI is a drafting and recommendation layer.

AI may generate:

- Delivery method recommendations
- Risk summaries
- Alternative method comparisons
- Procurement package drafts
- Scoring matrices
- Interview rubrics
- Selection committee materials

AI must not:

- Finalize outputs automatically
- Approve documents
- Overwrite approved records
- Claim legal compliance

All AI-generated content must be reviewed by a human before approval.

## 9. Core Workflow

1. User signs in.
2. User selects or creates a workspace.
3. User creates a project.
4. User completes project intake.
5. App generates delivery method recommendation.
6. User reviews rationale, scores, risks, and alternatives.
7. User accepts or overrides delivery method.
8. User selects procurement document type.
9. App generates procurement package.
10. User reviews and edits generated sections.
11. User marks output reviewed.
12. Admin or owner approves output.
13. User exports approved materials.

## 10. Project Intake Requirements

Required intake fields:

- Project name
- Project type
- Facility type
- Estimated construction budget
- Project size
- Target completion date or schedule urgency
- Scope definition status
- Owner type
- In-house construction management capability
- Top project priority
- Risk tolerance
- Statutory procurement constraints
- Local market conditions

Optional intake fields:

- Phasing requirements
- Previous delivery method experience
- Desired owner involvement
- Change order sensitivity
- Claims/litigation sensitivity
- Labor requirements
- Sustainability requirements
- BIM requirements
- Bonding/insurance requirements
- Number of firms to shortlist
- Stipend requirements for shortlisted firms

## 11. Delivery Recommendation Requirements

Supported delivery methods:

- Design-Bid-Build
- CMAR / CM-GC
- Design-Build
- Integrated Project Delivery
- Multi-Prime

Recommendation output must include:

- Primary recommendation
- Why this method fits
- Scoring by decision dimension
- Key risks
- Alternative method worth considering
- Recommended procurement approach
- Next steps

Scoring dimensions:

- Cost certainty
- Schedule speed
- Design control
- Risk transfer
- Owner capability
- Market fit
- Statutory fit
- Scope definition fit
- Collaboration need
- Change order sensitivity

## 12. Procurement Generator Requirements

Supported document types:

- RFQ
- RFP
- Scoring matrix
- Interview rubric
- Selection committee packet

Supported selection approaches:

- QBS
- Best Value
- Low Bid

Generated package must include:

- Project overview
- Scope summary
- Delivery method
- Procurement schedule
- Eligibility requirements
- Submission instructions
- Response requirements
- Evaluation criteria
- Interview process
- Scoring matrix
- Selection committee guidance
- Compliance notes
- Next-step checklist

## 13. Primary Routes

- `/app`
- `/w/[slug]/projects`
- `/w/[slug]/projects/[projectSlug]/intake`
- `/w/[slug]/projects/[projectSlug]/delivery`
- `/w/[slug]/projects/[projectSlug]/procurement`
- `/w/[slug]/projects/[projectSlug]/exports`

## 14. Data Model

Core tables:

- `projects`
- `projectProfiles`
- `deliveryAnalyses`
- `procurementPackages`
- `generationEvents`

### projectProfiles

Stores project intake data.

Fields:

- `projectId`
- `organizationId`
- `projectType`
- `facilityType`
- `budgetRange`
- `projectSize`
- `schedulePressure`
- `scopeDefinition`
- `phasingNeeds`
- `ownerType`
- `ownerCapability`
- `deliveryExperience`
- `ownerInvolvementPreference`
- `topPriority`
- `riskTolerance`
- `changeOrderSensitivity`
- `statutoryConstraints`
- `marketConditions`
- `laborRequirements`
- `sustainabilityRequirements`
- `bimRequirements`
- `updatedByUserId`
- `updatedAt`

### deliveryAnalyses

Stores generated delivery recommendations.

Fields:

- `projectId`
- `organizationId`
- `scoringSummary`
- `recommendation`
- `rationale`
- `risks`
- `alternative`
- `procurementApproach`
- `nextSteps`
- `status`
- `createdByUserId`
- `updatedAt`

### procurementPackages

Stores generated procurement outputs.

Fields:

- `projectId`
- `organizationId`
- `documentType`
- `deliveryMethod`
- `selectionApproach`
- `sections`
- `scoringMatrix`
- `status`
- `createdByUserId`
- `updatedAt`

### generationEvents

Stores audit trail for generated content.

Fields:

- `organizationId`
- `projectId`
- `promptType`
- `sourceRecord`
- `generatedContentSummary`
- `userId`
- `createdAt`

## 15. Output Statuses

Generated outputs use:

- `draft`
- `reviewed`
- `approved`
- `archived`

Approved outputs are immutable. Users may duplicate an approved output into a new draft.

## 16. Acceptance Criteria

- Users can save and resume project intake.
- Only active organization members can access project data.
- Delivery recommendation cannot be generated until required intake fields exist.
- User can override recommended delivery method before procurement generation.
- Procurement package includes all required sections.
- Approved outputs cannot be edited directly.
- Approved outputs can be duplicated into a new draft.
- Markdown and printable HTML exports are available for approved outputs.

## 17. MVP Non-Goals

- No DOCX export.
- No PDF export.
- No XLSX export.
- No automated legal compliance guarantee.
- No autonomous AI approval.
- No Procore or Autodesk integration.
- No email notification workflows.

## 18. Test Plan

Unit tests:

- Org isolation
- Role-based permissions
- Required-field validation
- Delivery scoring helper behavior
- Status transitions
- Approved-record locking

Integration tests:

- Create project
- Save project intake
- Generate delivery recommendation
- Generate procurement package
- Review output
- Approve output
- Duplicate approved output into draft
- Export approved output

Playwright smoke tests:

- Marketing page renders
- `/app` redirects when signed out
- Project list route is protected
- Core intake route loads when authenticated
- Procurement route loads when authenticated
- Admin actions are role-gated
