```mermaid
graph TD
    subgraph UserInterface ["Giao diện Người dùng (UI Components)"]
        UI_AppPage["AppPage (app/page.tsx)"]
        UI_ProjectSelector["ProjectSelector"]
        UI_DiagramList["DiagramList"]
        UI_AddDiagramDialog["AddDiagramDialog"]
        UI_RenameDiagramDialog["RenameDiagramDialog"]
        UI_DiagramEditor["DiagramEditor"]
        UI_DiagramPreviewPanel["DiagramPreviewPanel"]
        UI_FlowchartDirectionDropdown["FlowchartDirectionDropdown"]
    end

    subgraph StateManagement ["Quản lý Trạng thái & Context"]
        CTX_Project["ProjectContext"]
        CTX_Workspace["WorkspaceContext"]
        STATE_EditorSlice["EditorSlice (Redux/Zustand)"]
    end

    subgraph StorageAndRendering ["Lưu trữ & Kết xuất"]
        LS["LocalStorage"]
        MJ["MermaidJS"]
    end

    %% User Actions
    User["Người dùng"]

    %% Initialization Flow
    User -- "Mở ứng dụng" --> UI_AppPage
    UI_AppPage -- "Yêu cầu tải dự án" --> CTX_Project
    CTX_Project -- "Đọc danh sách dự án" --> LS
    LS -- "Trả về danh sách dự án" --> CTX_Project
    CTX_Project -- "Cung cấp dự án cho UI" --> UI_ProjectSelector
    CTX_Project -- "Cung cấp sơ đồ của dự án hiện tại" --> UI_DiagramList

    %% Project Operations
    User -- "Tạo/Chọn/Sửa/Xóa Dự án" --> UI_ProjectSelector
    UI_ProjectSelector -- "Thông báo hành động dự án" --> CTX_Project
    CTX_Project -- "Cập nhật danh sách dự án" --> CTX_Project
    CTX_Project -- "Lưu thay đổi dự án" --> LS
    CTX_Project -- "Cập nhật UI (danh sách dự án, sơ đồ)" --> UI_ProjectSelector
    CTX_Project -- "Cập nhật UI (danh sách dự án, sơ đồ)" --> UI_DiagramList


    %% Diagram Listing and Selection
    User -- "Chọn Sơ đồ" --> UI_DiagramList
    UI_DiagramList -- "Thông báo chọn sơ đồ (diagramId)" --> CTX_Workspace
    CTX_Workspace -- "Cập nhật sơ đồ hoạt động (activeDiagramId)" --> STATE_EditorSlice
    STATE_EditorSlice -- "Tải mã & cài đặt cho sơ đồ hoạt động" --> LS
    LS -- "Trả về mã & cài đặt" --> STATE_EditorSlice
    STATE_EditorSlice -- "Cung cấp mã cho" --> UI_DiagramEditor
    STATE_EditorSlice -- "Cung cấp mã & cài đặt cho" --> UI_DiagramPreviewPanel

    %% Diagram Creation/Renaming/Deletion
    User -- "Thêm Sơ đồ" --> UI_AddDiagramDialog
    UI_AddDiagramDialog -- "Thông báo thêm sơ đồ (tên, loại)" --> CTX_Project
    User -- "Đổi tên Sơ đồ" --> UI_RenameDiagramDialog
    UI_RenameDiagramDialog -- "Thông báo đổi tên sơ đồ (diagramId, newName)" --> CTX_Project
    User -- "Xóa Sơ đồ" --> UI_DiagramList
    UI_DiagramList -- "Thông báo xóa sơ đồ (diagramId)" --> CTX_Project

    CTX_Project -- "Cập nhật metadata sơ đồ trong dự án" --> CTX_Project
    CTX_Project -- "Lưu cấu trúc dự án (bao gồm metadata sơ đồ)" --> LS
    %% Khi thêm sơ đồ mới, EditorSlice cũng cần khởi tạo dữ liệu
    CTX_Project -- "Thông báo sơ đồ mới (diagramId)" --> STATE_EditorSlice
    STATE_EditorSlice -- "Khởi tạo & lưu mã/cài đặt mặc định cho sơ đồ mới" --> LS


    %% Diagram Editing
    User -- "Sửa mã Sơ đồ" --> UI_DiagramEditor
    UI_DiagramEditor -- "Gửi mã đã sửa" --> STATE_EditorSlice
    STATE_EditorSlice -- "Cập nhật mã sơ đồ" --> STATE_EditorSlice
    STATE_EditorSlice -- "Lưu mã sơ đồ (diagramsData)" --> LS
    STATE_EditorSlice -- "Thông báo mã thay đổi cho" --> UI_DiagramPreviewPanel %% Để re-render

    %% Diagram Preview and Rendering
    UI_DiagramPreviewPanel -- "Sử dụng mã từ EditorSlice để kết xuất với" --> MJ
    MJ -- "Trả về SVG" --> UI_DiagramPreviewPanel

    %% Diagram Settings (Zoom/Pan/Flowchart Direction)
    User -- "Thay đổi Thu phóng/Pan" --> UI_DiagramPreviewPanel
    UI_DiagramPreviewPanel -- "Gửi thay đổi thu phóng/pan" --> STATE_EditorSlice
    User -- "Thay đổi Hướng Flowchart" --> UI_FlowchartDirectionDropdown
    UI_FlowchartDirectionDropdown -- "Gửi mã sơ đồ đã cập nhật (với hướng mới)" --> STATE_EditorSlice
    STATE_EditorSlice -- "Cập nhật cài đặt/mã sơ đồ" --> STATE_EditorSlice
    STATE_EditorSlice -- "Lưu cài đặt/mã sơ đồ" --> LS


    %% Styling
    classDef ui fill:#D6EAF8,stroke:#333,stroke-width:2px
    classDef state fill:#D1F2EB,stroke:#333,stroke-width:2px
    classDef storage fill:#FDEDEC,stroke:#333,stroke-width:2px
    classDef user fill:#FEF9E7,stroke:#333,stroke-width:2px

    class User user
    class UI_AppPage,UI_ProjectSelector,UI_DiagramList,UI_AddDiagramDialog,UI_RenameDiagramDialog,UI_DiagramEditor,UI_DiagramPreviewPanel,UI_FlowchartDirectionDropdown ui
    class CTX_Project,CTX_Workspace,STATE_EditorSlice state
    class LS,MJ storage
```
