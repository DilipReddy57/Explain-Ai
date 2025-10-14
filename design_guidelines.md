{
  "app_identity": {
    "name": "ExplainAI Studio",
    "tagline": "Understand AI/ML papers at your level — with evidence, visuals, and chat.",
    "audience": ["students", "researchers", "educators"],
    "app_type": "AI research paper assistant: upload→explain→visualize→chat→compare"
  },
  "design_personality": {
    "attributes": ["scholarly", "trustworthy", "calm", "modern", "evidence-first"],
    "style_fusion": "Swiss typographic structure + Glassmorphism accents for overlays + Minimal academic palette.",
    "mood": "Clear hierarchy, ample whitespace, restrained color, subtle motion"
  },
  "inspiration_references": {
    "summary": "Pulled patterns from AI-augmented readers and academic dashboards.",
    "search_rounds": 2,
    "sources": [
      {
        "name": "Semantic Scholar – Semantic Reader",
        "url": "https://www.semanticscholar.org/product/semantic-reader",
        "takeaways": [
          "Inline definitions and citation contexts via tooltips",
          "Skim vs deep-dive navigation"
        ]
      },
      {
        "name": "Explainpaper",
        "url": "https://www.explainpaper.com",
        "takeaways": [
          "Highlight to explain",
          "Lay summaries for complex passages"
        ]
      },
      {
        "name": "Miro / Excalidraw / Obsidian Canvas",
        "url": "https://excalidraw.com",
        "takeaways": [
          "Canvas panning/zooming, node linking",
          "Context toolbars on selection"
        ]
      }
    ]
  },
  "typography": {
    "pairing": {
      "display_serif": "EB Garamond",
      "ui_sans": "Figtree"
    },
    "justification": "Academic readability with a humanist serif for headings and a crisp grotesk for UI and body.",
    "imports": {
      "html_head": [
        "<link href=\"https://fonts.googleapis.com/css2?family=EB+Garamond:wght@500;600;700&family=Figtree:wght@400;500;600;700&display=swap\" rel=\"stylesheet\">"
      ]
    },
    "base_application": {
      "tailwind_font_classes": {
        "heading": "font-[\"EB Garamond\",serif]",
        "body": "font-[Figtree,ui-sans-serif,system-ui]"
      },
      "text_scale": {
        "h1": "text-4xl sm:text-5xl lg:text-6xl leading-tight tracking-[-0.01em]",
        "h2": "text-base md:text-lg leading-snug font-semibold",
        "body": "text-sm md:text-base leading-7",
        "small": "text-xs leading-5"
      }
    }
  },
  "color_system": {
    "note": "Avoid purple for AI/chat. Prioritize ocean blue, sage, and peach accents. Maintain WCAG AA.",
    "brand_tokens": {
      "primary": "210 80% 42%", 
      "primary-foreground": "0 0% 100%",
      "accent": "160 16% 42%", 
      "accent-foreground": "0 0% 100%",
      "highlight": "20 92% 68%", 
      "muted": "210 25% 96%",
      "surface": "0 0% 100%",
      "surface-2": "210 20% 98%",
      "border": "214 15% 90%",
      "ring": "210 80% 36%",
      "success": "156 57% 40%",
      "warning": "35 92% 55%",
      "error": "0 72% 50%"
    },
    "css_variables_overrides": "@layer base { :root { --background: 0 0% 100%; --foreground: 210 15% 10%; --card: 0 0% 100%; --card-foreground: 210 15% 12%; --popover: 0 0% 100%; --popover-foreground: 210 15% 12%; --primary: 210 80% 42%; --primary-foreground: 0 0% 100%; --secondary: 210 20% 98%; --secondary-foreground: 210 15% 15%; --muted: 210 25% 96%; --muted-foreground: 215 10% 40%; --accent: 160 16% 42%; --accent-foreground: 0 0% 100%; --destructive: 0 72% 50%; --destructive-foreground: 0 0% 100%; --border: 214 15% 90%; --input: 214 15% 90%; --ring: 210 80% 36%; --chart-1: 210 77% 46%; --chart-2: 160 25% 47%; --chart-3: 27 88% 64%; --chart-4: 200 14% 45%; --chart-5: 12 70% 50%; --radius: 0.625rem; }}",
    "dark_mode_overrides": "@layer base { .dark { --background: 220 17% 8%; --foreground: 0 0% 100%; --card: 220 17% 10%; --card-foreground: 0 0% 100%; --popover: 220 17% 10%; --popover-foreground: 0 0% 100%; --primary: 210 80% 55%; --primary-foreground: 0 0% 100%; --secondary: 220 13% 14%; --secondary-foreground: 0 0% 100%; --muted: 220 13% 14%; --muted-foreground: 216 10% 70%; --accent: 160 20% 40%; --accent-foreground: 0 0% 100%; --destructive: 0 62% 45%; --destructive-foreground: 0 0% 100%; --border: 220 10% 20%; --input: 220 10% 20%; --ring: 210 80% 56%; }}",
    "gradients": [
      {
        "name": "Sea Mist",
        "css": "background: linear-gradient(135deg, hsl(205 80% 98%) 0%, hsl(188 80% 94%) 40%, hsl(160 35% 92%) 100%);",
        "usage": "Hero section background or large section backgrounds only (<=20% viewport)."
      },
      {
        "name": "Peach Fog",
        "css": "background: linear-gradient(120deg, hsl(210 40% 98%) 0%, hsl(27 100% 96%) 50%, hsl(188 100% 96%) 100%);",
        "usage": "Decorative overlays and empty states."
      }
    ],
    "texture": {
      "noise_css": ".noise-overlay { pointer-events:none; position:absolute; inset:0; background-image: url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"120\" height=\"120\" viewBox=\"0 0 120 120\"><filter id=\"n\"><feTurbulence type=\"fractalNoise\" baseFrequency=\"0.9\" numOctaves=\"2\" stitchTiles=\"stitch\"/></filter><rect width=\"100%\" height=\"100%\" filter=\"url(%23n)\" opacity=\"0.02\"/></svg>'); }"
    },
    "gradient_restrictions": {
      "rule": "Never use dark/saturated gradient combos (purple/pink/blue), never exceed 20% viewport, never on text-heavy blocks or small UI elements.",
      "enforcement": "If gradient impacts readability or exceeds 20%, fallback to solid surface colors."
    }
  },
  "icons": {
    "library": "lucide-react",
    "examples": ["Upload", "BookOpen", "GraduationCap", "Beaker", "GitCompare", "MessageSquare"]
  },
  "grid_and_layout": {
    "container": "max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8",
    "columns": {
      "mobile": 4,
      "tablet": 8,
      "desktop": 12
    },
    "patterns": [
      {
        "name": "Split-Screen Upload + Preview",
        "classes": "grid grid-cols-1 lg:grid-cols-2 gap-6 items-start"
      },
      {
        "name": "Bento Grid Explanations",
        "classes": "grid grid-cols-1 md:grid-cols-6 gap-4",
        "cells": {
          "kid": "md:col-span-2",
          "student": "md:col-span-2",
          "researcher": "md:col-span-2",
          "evidence": "md:col-span-3",
          "visuals": "md:col-span-3"
        }
      },
      {
        "name": "Z-Pattern Reading",
        "description": "For long summaries with inline glossary and citations."
      }
    ]
  },
  "key_workflows": {
    "upload": {
      "components": ["Card", "Button", "Progress", "Toast (sonner)", "Dialog (error/info)", "Resizable (for split)"]
    },
    "explanations_tabs": {
      "components": ["Tabs", "Accordion", "Badge", "HoverCard/Popover"],
      "tabs": ["Kid", "Student", "Researcher", "Evidence"]
    },
    "visualization_canvas": {
      "libraries": ["React Flow", "D3.js/Recharts"],
      "components": ["Resizable", "Popover", "Tooltip", "ContextMenu"]
    },
    "chat": {
      "components": ["Card", "ScrollArea", "Textarea", "Button", "Tooltip", "Popover"],
      "note": "Use ocean blue/teal accents; avoid purple."
    },
    "glossary": {
      "components": ["HoverCard", "Popover", "Table"],
      "pattern": "inline definition on click/hover with citation link"
    },
    "comparison": {
      "components": ["Resizable", "Tabs", "Card"],
      "layout": "side-by-side papers with linked scroll and diff badges"
    }
  },
  "components": {
    "shadcn_paths": {
      "button": "/app/frontend/src/components/ui/button.jsx",
      "tabs": "/app/frontend/src/components/ui/tabs.jsx",
      "dialog": "/app/frontend/src/components/ui/dialog.jsx",
      "popover": "/app/frontend/src/components/ui/popover.jsx",
      "accordion": "/app/frontend/src/components/ui/accordion.jsx",
      "card": "/app/frontend/src/components/ui/card.jsx",
      "badge": "/app/frontend/src/components/ui/badge.jsx",
      "progress": "/app/frontend/src/components/ui/progress.jsx",
      "table": "/app/frontend/src/components/ui/table.jsx",
      "hover_card": "/app/frontend/src/components/ui/hover-card.jsx",
      "textarea": "/app/frontend/src/components/ui/textarea.jsx",
      "input": "/app/frontend/src/components/ui/input.jsx",
      "tooltip": "/app/frontend/src/components/ui/tooltip.jsx",
      "resizable": "/app/frontend/src/components/ui/resizable.jsx",
      "calendar": "/app/frontend/src/components/ui/calendar.jsx",
      "sonner_toast": "/app/frontend/src/components/ui/sonner.jsx"
    },
    "new_component_specs": [
      {
        "name": "UploadDropzone",
        "type": "component",
        "file": "src/components/UploadDropzone.js",
        "description": "Drag-drop area with progress and PDF validation.",
        "jsx_scaffold": "import React from 'react'; import {useDropzone} from 'react-dropzone'; import { Card } from './components/ui/card'; import { Button } from './components/ui/button'; import { Upload } from 'lucide-react'; export const UploadDropzone = ({ onFiles }) => { const onDrop = React.useCallback((accepted) => onFiles?.(accepted), [onFiles]); const {getRootProps, getInputProps, isDragActive} = useDropzone({ accept: { 'application/pdf': ['.pdf'] } }); return (<Card className=\"p-6 border-dashed border-2\" {...getRootProps()} data-testid=\"upload-dropzone\"> <input {...getInputProps()} data-testid=\"upload-input\" /> <div className=\"flex items-center justify-between gap-4\"> <div> <p className=\"font-medium\">Upload PDF or arXiv URL</p> <p className=\"text-sm text-muted-foreground\">Drag & drop or click to browse</p> </div> <Button variant=\"secondary\" data-testid=\"browse-files-button\"><Upload className=\"mr-2\"/>Browse</Button> </div> <div className=\"mt-4 text-sm\">{isDragActive ? 'Drop the file here…' : 'PDF only, max 25MB'}</div> </Card> ); };"
      },
      {
        "name": "EvidencePopover",
        "file": "src/components/EvidencePopover.js",
        "description": "Popover with citation snippet and jump-to-source.",
        "jsx_scaffold": "import React from 'react'; import { Popover, PopoverTrigger, PopoverContent } from './components/ui/popover'; import { Button } from './components/ui/button'; export const EvidencePopover = ({ anchor, children }) => (<Popover> <PopoverTrigger asChild> <Button variant=\"ghost\" size=\"sm\" data-testid=\"evidence-popover-trigger\">{anchor}</Button> </PopoverTrigger> <PopoverContent className=\"w-96\" data-testid=\"evidence-popover-content\">{children}</PopoverContent> </Popover>);"
      },n      {
        "name": "GlossaryTerm",
        "file": "src/components/GlossaryTerm.js",
        "description": "Inline term with hover/click definition.",
        "jsx_scaffold": "import React from 'react'; import { HoverCard, HoverCardTrigger, HoverCardContent } from './components/ui/hover-card'; export const GlossaryTerm = ({ term, definition }) => (<HoverCard openDelay={120}> <HoverCardTrigger asChild><span className=\"underline decoration-dotted cursor-help text-primary/90\" data-testid=\"glossary-term\">{term}</span></HoverCardTrigger> <HoverCardContent className=\"max-w-sm\" data-testid=\"glossary-definition\">{definition}</HoverCardContent> </HoverCard>);"
      }
    ]
  },
  "page_skeletons": {
    "home_upload": "import React from 'react'; import { Tabs, TabsList, TabsTrigger, TabsContent } from './components/ui/tabs'; import { Card } from './components/ui/card'; import { Button } from './components/ui/button'; import { UploadDropzone } from './components/UploadDropzone'; export default function Home() { return (<main className=\"min-h-screen bg-[hsl(210_40%_98%)]\"> <section className=\"relative\"> <div className=\"absolute inset-0 -z-10 opacity-90\" style={{background: 'linear-gradient(135deg, hsl(205 80% 98%) 0%, hsl(188 80% 94%) 40%, hsl(160 35% 92%) 100%)'}} aria-hidden /> <div className=\"container mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8 py-10 md:py-14\"> <h1 className=\"font-['EB Garamond'] text-4xl sm:text-5xl lg:text-6xl mb-6\" data-testid=\"hero-title\">ExplainAI Studio</h1> <p className=\"text-sm md:text-base text-muted-foreground max-w-2xl\" data-testid=\"hero-subtitle\">Upload a paper to get multi-level explanations, evidence-backed summaries, visualizations, and an Ask-Paper chat.</p> <div className=\"mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6 items-start\"> <UploadDropzone onFiles={(f)=>console.log(f)} /> <Card className=\"p-6\" data-testid=\"recent-papers\"> <h2 className=\"text-base md:text-lg font-semibold\">Recent Papers</h2> <div className=\"mt-4 text-sm text-muted-foreground\">Empty state</div> </Card> </div> </div> </section> </main> ); }",
    "paper_workspace": "import React from 'react'; import { Tabs, TabsList, TabsTrigger, TabsContent } from './components/ui/tabs'; import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from './components/ui/resizable'; import { Card } from './components/ui/card'; import { Textarea } from './components/ui/textarea'; import { Button } from './components/ui/button'; export default function Workspace() { return (<main className=\"min-h-screen\"> <ResizablePanelGroup direction=\"horizontal\" className=\"h-[calc(100vh-64px)]\"> <ResizablePanel defaultSize={60} minSize={40}> <div className=\"h-full overflow-auto p-4\" data-testid=\"pdf-pane\"> {/* PDF viewer placeholder */} <Card className=\"h-full\" /> </div> </ResizablePanel> <ResizableHandle /> <ResizablePanel defaultSize={40} minSize={30}> <div className=\"h-full p-4 space-y-4\"> <Tabs defaultValue=\"student\" className=\"w-full\"> <TabsList> <TabsTrigger value=\"kid\" data-testid=\"tab-kid\">Kid</TabsTrigger> <TabsTrigger value=\"student\" data-testid=\"tab-student\">Student</TabsTrigger> <TabsTrigger value=\"researcher\" data-testid=\"tab-researcher\">Researcher</TabsTrigger> <TabsTrigger value=\"evidence\" data-testid=\"tab-evidence\">Evidence</TabsTrigger> </TabsList> <TabsContent value=\"kid\" data-testid=\"panel-kid\"><Card className=\"p-4\">Kid-level explanation…</Card></TabsContent> <TabsContent value=\"student\" data-testid=\"panel-student\"><Card className=\"p-4\">Student-level explanation…</Card></TabsContent> <TabsContent value=\"researcher\" data-testid=\"panel-researcher\"><Card className=\"p-4\">Researcher-level notes…</Card></TabsContent> <TabsContent value=\"evidence\" data-testid=\"panel-evidence\"><Card className=\"p-4\">Citations & source snippets…</Card></TabsContent> </Tabs> <Card className=\"p-4 space-y-3\" data-testid=\"chat-card\"> <div className=\"h-48 overflow-y-auto rounded bg-secondary/50 p-3\" data-testid=\"chat-log\">Chat log…</div> <div className=\"flex items-end gap-2\"> <Textarea rows=\"2\" placeholder=\"Ask the paper…\" className=\"flex-1\" data-testid=\"chat-input\"/> <Button data-testid=\"chat-send-button\">Send</Button> </div> </Card> </div> </ResizablePanel> </ResizablePanelGroup> </main> ); }"
  },
  "motion_and_interactions": {
    "micro": [
      "Buttons: subtle bg shade shift and ring emphasis on hover/focus (no transition: all)",
      "Tabs: underline slide-in on active change",
      "Popover/Tooltip: fade+scale in 120ms",
      "PDF highlights: soft glow (shadow-[0_0_0_2px_hsl(var(--ring))]/30) on selected text"
    ],
    "framer_motion": {
      "install": "yarn add framer-motion",
      "example": "import { motion } from 'framer-motion'; <motion.div initial={{opacity:0, y:6}} animate={{opacity:1, y:0}} transition={{duration:0.22}} />"
    }
  },
  "libraries": {
    "install_commands": [
      "yarn add react-dropzone",
      "yarn add reactflow",
      "yarn add recharts d3",
      "yarn add framer-motion",
      "yarn add lucide-react"
    ],
    "usage_snippets": {
      "react_flow_canvas": "import React, { useCallback } from 'react'; import ReactFlow, { Background, Controls, MiniMap, addEdge } from 'reactflow'; import 'reactflow/dist/style.css'; export default function ConceptMap() { const [nodes, setNodes] = React.useState([{ id:'a', position:{x:20,y:20}, data:{ label:'Encoder' } }]); const [edges, setEdges] = React.useState([]); const onConnect = useCallback((params)=> setEdges((eds)=> addEdge(params, eds)), []); return (<div className=\"h-[420px] rounded-lg border bg-card\" data-testid=\"concept-canvas\"><ReactFlow nodes={nodes} edges={edges} onConnect={onConnect}><Background /><Controls /><MiniMap /></ReactFlow></div>); }",
      "recharts_chart": "import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'; export const TrainingCurve = ({ data }) => (<div className=\"h-64\" data-testid=\"chart-training-curve\"><ResponsiveContainer width=\"100%\" height=\"100%\"><LineChart data={data}><XAxis dataKey=\"step\"/><YAxis/><Tooltip/><Line type=\"monotone\" dataKey=\"loss\" stroke=\"hsl(var(--primary))\" strokeWidth={2}/></LineChart></ResponsiveContainer></div>);"
    }
  },
  "accessibility": {
    "contrast": "Maintain AA contrast for text and controls. Use --primary-foreground and --accent-foreground for legibility.",
    "focus": "Visible focus ring using ring-ring and ring-offset-2.",
    "reduced_motion": "Respect prefers-reduced-motion: minimize animations to opacity-only.",
    "hit_targets": ">=44px touch target for buttons and tabs.",
    "keyboard": "All popovers, dialogs, tabs keyboard navigable via Radix primitives."
  },
  "testing": {
    "data_testid_rule": "Every interactive or key information element MUST include a data-testid attribute using kebab-case reflecting role (e.g., upload-dropzone, chat-send-button, evidence-popover-content).",
    "examples": [
      "<Button data-testid=\"upload-submit-button\" />",
      "<div data-testid=\"user-balance-text\">$120</div>",
      "<PopoverContent data-testid=\"citation-popover\" />"
    ]
  },
  "image_urls": [
    {
      "url": "https://images.unsplash.com/photo-1651084077618-e39a16e29546?crop=entropy&cs=srgb&fm=jpg&q=85",
      "description": "Oceanic abstract gradient texture",
      "category": "hero-bg",
      "placement": "Landing hero section background with 10–20% overlay opacity"
    },
    {
      "url": "https://images.unsplash.com/photo-1668853853439-923e013afff1?crop=entropy&cs=srgb&fm=jpg&q=85",
      "description": "Soft sky blur texture",
      "category": "empty-state",
      "placement": "Use inside empty state cards under illustrations"
    },
    {
      "url": "https://images.unsplash.com/photo-1651135093201-11f08d2dedea?crop=entropy&cs=srgb&fm=jpg&q=85",
      "description": "Minimal blue gradient wash",
      "category": "section-divider",
      "placement": "Large section separators with mask-image: linear-gradient for fade"
    }
  ],
  "component_path": {
    "shadcn": "/app/frontend/src/components/ui/",
    "lib_utils": "/app/frontend/src/lib/utils.js",
    "toast": "/app/frontend/src/components/ui/sonner.jsx",
    "index_css": "/app/frontend/src/index.css",
    "app_css": "/app/frontend/src/App.css"
  },
  "styles_snippets": {
    "buttons": {
      "variants": {
        "primary": "bg-primary text-primary-foreground hover:bg-primary/90 rounded-md",
        "secondary": "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        "ghost": "hover:bg-accent hover:text-accent-foreground"
      },
      "shape": "Professional / Corporate (medium radius, flat surface)",
      "focus": "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    },
    "cards": {
      "base": "bg-card text-card-foreground rounded-lg border shadow-sm",
      "glass_variant": "backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-neutral-900/40"
    },
    "tabs": {
      "list": "inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1",
      "trigger": "rounded-md px-3 py-1 text-sm font-medium data-[state=active]:bg-background data-[state=active]:text-foreground"
    }
  },
  "content_patterns": {
    "evidence_block": "Use ordered list with source badges linking to page/line numbers. Provide Popover with 200–350px width for snippet preview.",
    "glossary_inline": "Underline dotted terms; click or hover opens HoverCard with definition and link to occurrences.",
    "citation_callouts": "Superscript [1], [2] buttons with Popover when clicked."
  },
  "states_and_empty": {
    "empty": "Soft gradient background + short guidance text + primary action",
    "loading": "Skeleton components in cards; add aria-busy on containers",
    "error": "Dialog with destructive variant button and retry action"
  },
  "instrumentation": {
    "toasts": "import { Toaster, toast } from './components/ui/sonner'; <Toaster position=\"top-right\" />; toast.success('Uploaded');",
    "logging": "Use console.groupCollapsed with data-testid values to trace interactions in dev"
  },
  "instructions_to_main_agent": {
    "setup": [
      "Add Google Fonts link to public/index.html",
      "Paste color variable overrides into src/index.css under @layer base :root and .dark",
      "Use existing shadcn components from src/components/ui/ exclusively for primitives",
      "Install libraries listed under libraries.install_commands",
      "Ensure all interactive elements include data-testid per testing rules"
    ],
    "build_order": [
      "Home (Upload + Recent)",
      "Workspace (PDF + Tabs + Chat)",
      "Visualization Canvas (React Flow + charts)",
      "Glossary + Evidence Popovers",
      "Comparison (Resizable split)"
    ],
    "accessibility_checks": [
      "Run axe-core in dev",
      "Check prefers-reduced-motion",
      "Verify color contrast for primary/accent on both light/dark"
    ]
  },
  "general_ui_ux_guidelines": "- You must **not** apply universal transition. Eg: `transition: all`. This results in breaking transforms. Always add transitions for specific interactive elements like button, input excluding transforms\n- You must **not** center align the app container, ie do not add `.App { text-align: center; }` in the css file. This disrupts the human natural reading flow of text\n- NEVER: use AI assistant Emoji characters like`🤖🧠💭💡🔮🎯📚🎭🎬🎪🎉🎊🎁🎀🎂🍰🎈🎨🎰💰💵💳🏦💎🪙💸🤑📊📈📉💹🔢🏆🥇 etc for icons. Always use **FontAwesome cdn** or **lucid-react** library already installed in the package.json\n\n **GRADIENT RESTRICTION RULE**\nNEVER use dark/saturated gradient combos (e.g., purple/pink) on any UI element.  Prohibited gradients: blue-500 to purple 600, purple 500 to pink-500, green-500 to blue-500, red to pink etc\nNEVER use dark gradients for logo, testimonial, footer etc\nNEVER let gradients cover more than 20% of the viewport.\nNEVER apply gradients to text-heavy content or reading areas.\nNEVER use gradients on small UI elements (<100px width).\nNEVER stack multiple gradient layers in the same viewport.\n\n**ENFORCEMENT RULE:**\n    • Id gradient area exceeds 20% of viewport OR affects readability, **THEN** use solid colors\n\n**How and where to use:**\n   • Section backgrounds (not content backgrounds)\n   • Hero section header content. Eg: dark to light to dark color\n   • Decorative overlays and accent elements only\n   • Hero section with 2-3 mild color\n   • Gradients creation can be done for any angle say horizontal, vertical or diagonal\n\n- For AI chat, voice application, **do not use purple color. Use color like light green, ocean blue, peach orange etc**\n\n</Font Guidelines>\n\n- Every interaction needs micro-animations - hover states, transitions, parallax effects, and entrance animations. Static = dead. \n   \n- Use 2-3x more spacing than feels comfortable. Cramped designs look cheap.\n\n- Subtle grain textures, noise overlays, custom cursors, selection states, and loading animations: separates good from extraordinary.\n   \n- Before generating UI, infer the visual style from the problem statement (palette, contrast, mood, motion) and immediately instantiate it by setting global design tokens (primary, secondary/accent, background, foreground, ring, state colors), rather than relying on any library defaults. Don't make the background dark as a default step, always understand problem first and define colors accordingly\n    Eg: - if it implies playful/energetic, choose a colorful scheme\n           - if it implies monochrome/minimal, choose a black–white/neutral scheme\n\n**Component Reuse:**\n\t- Prioritize using pre-existing components from src/components/ui when applicable\n\t- Create new components that match the style and conventions of existing components when needed\n\t- Examine existing components to understand the project's component patterns before creating new ones\n\n**IMPORTANT**: Do not use HTML based component like dropdown, calendar, toast etc. You **MUST** always use `/app/frontend/src/components/ui/ ` only as a primary components as these are modern and stylish component\n\n**Best Practices:**\n\t- Use Shadcn/UI as the primary component library for consistency and accessibility\n\t- Import path: ./components/[component-name]\n\n**Export Conventions:**\n\t- Components MUST use named exports (export const ComponentName = ...)\n\t- Pages MUST use default exports (export default function PageName() {...})\n\n**Toasts:**\n  - Use `sonner` for toasts\"\n  - Sonner component are located in `/app/src/components/ui/sonner.tsx`\n\nUse 2–4 color gradients, subtle textures/noise overlays, or CSS-based noise to avoid flat visuals."
}
