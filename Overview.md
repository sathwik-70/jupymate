# Tutorial: HomeStead-Haven

HomeStead Haven is an **avant-garde real estate platform** for India, blending an *immersive 3D-inspired user interface* with a **smart AI chat assistant** for personalized property search. It provides a complete experience for **listing, booking, and reviewing luxury homes**, all secured by **robust user authentication** and supported by a flexible data system.


## Visual Overview

```mermaid
flowchart TD
    A0["User Authentication & Authorization
"]
    A1["Property Listing Management
"]
    A2["AI Chat Assistant (HavenHelper)
"]
    A3["Data Persistence & Service Layer
"]
    A4["Global UI Layout & Theming
"]
    A5["Booking & Review System
"]
    A6["UI Design System (Glassmorphism & Framer Motion)
"]
    A0 -- "Authenticates via" --> A3
    A0 -- "Controls listing access for" --> A1
    A1 -- "Persists data via" --> A3
    A2 -- "Retrieves property context ..." --> A3
    A3 -- "Manages data for" --> A5
    A4 -- "Applies styling via" --> A6
    A6 -- "Enhances property display for" --> A1
    A4 -- "Displays user status from" --> A0
    A6 -- "Stylizes components for" --> A2
    A5 -- "Requires authentication for" --> A0
```

## Chapters

1. [UI Design System (Glassmorphism & Framer Motion)
](01_ui_design_system__glassmorphism___framer_motion__.md)
2. [Global UI Layout & Theming
](02_global_ui_layout___theming_.md)
3. [User Authentication & Authorization
](03_user_authentication___authorization_.md)
4. [Property Listing Management
](04_property_listing_management_.md)
5. [AI Chat Assistant (HavenHelper)
](05_ai_chat_assistant__havenhelper__.md)
6. [Booking & Review System
](06_booking___review_system_.md)
7. [Data Persistence & Service Layer
](07_data_persistence___service_layer_.md)

---
