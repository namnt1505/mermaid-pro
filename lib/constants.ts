import type { Diagram } from "@/types"
import { v4 as uuidv4 } from "uuid"

export const DEFAULT_MERMAID_CODE = `flowchart TD
  subgraph subGraph0["Hệ thống ứng dụng Mermaid MVP"]
    direction LR
      UC1["Soạn thảo mã Mermaid"]
      UC2["Xem sơ đồ"]
      UC3["Phóng to/Thu nhỏ sơ đồ"]
      UC4["Di chuyển sơ đồ"]
      UC5["Xuất sơ đồ"]
  end
  User["Người dùng"] --> UC1 & UC2 & UC3 & UC4 & UC5
  UC1 -. triggers/updates .-> UC2
   UC1:::usecase
   UC2:::usecase
   UC3:::usecase
   UC4:::usecase
   UC5:::usecase
   User:::actor
  classDef usecase fill:#e1f5fe,stroke:#0288d1,stroke-width:2px,border-radius:10px
  classDef actor fill:#fff3e0,stroke:#ff9800,stroke-width:2px`

export const EXAMPLE_SEQUENCE_DIAGRAM = `sequenceDiagram
  participant User
  participant System
  
  User->>System: Soạn thảo mã Mermaid
  activate System
  System-->>User: Hiển thị giao diện soạn thảo
  deactivate System
  
  User->>System: Xem sơ đồ
  activate System
  System-->>User: Hiển thị sơ đồ
  deactivate System
  
  User->>System: Phóng to/Thu nhỏ sơ đồ
  activate System
  System-->>User: Hiển thị sơ đồ với kích thước mới
  deactivate System`

export const DEFAULT_DIAGRAMS: Diagram[] = [
  {
    id: uuidv4(),
    name: "Use Case Diagram",
    code: DEFAULT_MERMAID_CODE,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    name: "Sequence Diagram",
    code: EXAMPLE_SEQUENCE_DIAGRAM,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

export const DIAGRAM_TEMPLATES = [
  {
    name: "Flowchart",
    code: `flowchart TD
    A[Start] --> B{Is it working?}
    B -->|Yes| C[Great!]
    B -->|No| D[Debug]
    D --> B`,
  },
  {
    name: "Sequence Diagram",
    code: `sequenceDiagram
    Alice->>John: Hello John, how are you?
    John-->>Alice: Great!
    Alice->>John: See you later!`,
  },
  {
    name: "Class Diagram",
    code: `classDiagram
    class Animal {
        +name: string
        +eat(): void
        +sleep(): void
    }
    class Dog {
        +bark(): void
    }
    Animal <|-- Dog`,
  },
  {
    name: "Entity Relationship",
    code: `erDiagram
    CUSTOMER ||--o{ ORDER : places
    ORDER ||--|{ LINE-ITEM : contains
    CUSTOMER }|..|{ DELIVERY-ADDRESS : uses`,
  },
  {
    name: "State Diagram",
    code: `stateDiagram-v2
    [*] --> Still
    Still --> [*]
    Still --> Moving
    Moving --> Still
    Moving --> Crash
    Crash --> [*]`,
  },
]
