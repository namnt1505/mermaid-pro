# Báo cáo lỗi: Sơ đồ mới không hiển thị trong Preview

**Ngày:** 4 tháng 6, 2025

**Người báo cáo:** GitHub Copilot

**Các thành phần bị ảnh hưởng:** `AddDiagramDialog`, `ProjectContext`, `EditorSlice`, `DiagramPreviewPanel`, `DiagramContent`

**Mô tả lỗi:**
Khi người dùng tạo một sơ đồ mới bằng cách sử dụng `AddDiagramDialog`, sơ đồ này được thêm vào `ProjectContext` (quản lý danh sách các sơ đồ). Tuy nhiên, `DiagramPreviewPanel` không hiển thị sơ đồ mới được tạo này. Khung xem trước vẫn trống hoặc hiển thị sơ đồ đã được chọn trước đó.

**Phân tích Nguyên nhân Gốc rễ:**
Vấn đề chính có thể nằm ở sự phối hợp giữa `ProjectContext`, `EditorSlice`, và các thành phần chịu trách nhiệm hiển thị sơ đồ (`DiagramPreviewPanel`, `DiagramContent`). Dựa trên sơ đồ thành phần (`component_diagram.md`):

1.  **`EditorSlice` không được cập nhật:**
    Khi `ProjectContext` thêm một sơ đồ mới, nó cập nhật trạng thái của chính nó (danh sách các sơ đồ). Tuy nhiên, `EditorSlice`, chịu trách nhiệm quản lý *mã/nội dung* của từng sơ đồ riêng lẻ (và được `DiagramContent` đọc), có thể không được cập nhật đồng thời với một mục nhập mới (ví dụ: mã trống) cho sơ đồ mới này. Sơ đồ thành phần cho thấy `EditorSlice ..> LocalStorage : Saves/Loads diagram codes (via diagramsData key)`. Nếu `ProjectContext` chỉ cập nhật siêu dữ liệu dự án mà không khởi tạo hoặc cập nhật `diagramsData` cho sơ đồ mới trong `LocalStorage`, `EditorSlice` sẽ không có thông tin về nội dung của sơ đồ mới.

2.  **Sơ đồ không được chọn để xem trước:**
    Ngay cả khi `EditorSlice` có dữ liệu (hoặc có thể tạo dữ liệu mặc định), `DiagramPreviewPanel` có thể không tự động chọn sơ đồ mới được tạo để hiển thị. Logic lựa chọn sơ đồ hiện tại có thể được quản lý bởi `WorkspaceContext` (như trong `DiagramList ..> WorkspaceContext : Selects diagram`). Nếu `WorkspaceContext` không được cập nhật để chọn sơ đồ mới sau khi nó được tạo, `DiagramPreviewPanel` sẽ tiếp tục hiển thị sơ đồ cũ hoặc không hiển thị gì.

3.  **Thiếu sót trong cập nhật trạng thái lan truyền (Reactivity/Propagation):**
    Có thể có một sự thiếu sót trong chuỗi phản ứng cập nhật trạng thái. `ProjectContext` cập nhật, nhưng cập nhật này có thể không lan truyền một cách hiệu quả để kích hoạt `DiagramPreviewPanel` (thông qua `WorkspaceContext` hoặc các cơ chế khác) để làm mới và hiển thị nội dung của sơ đồ *mới* từ `EditorSlice`.

**Giải pháp đề xuất:**
Giải pháp cần đảm bảo rằng khi một sơ đồ được thêm vào, các bước sau được thực hiện một cách nhất quán:

1.  **Khởi tạo và Cập nhật `EditorSlice` (và `LocalStorage`):**
    *   Khi `AddDiagramDialog` gọi `ProjectContext` để thêm sơ đồ mới, `ProjectContext` không chỉ cập nhật danh sách sơ đồ của mình mà còn phải đảm bảo rằng một mục nhập mới cho sơ đồ này (với mã nguồn ban đầu, ví dụ: một template trống hoặc mặc định) được tạo trong `EditorSlice`.
    *   Điều này có nghĩa là `ProjectContext` cần phải kích hoạt một hành động (action) trong `EditorSlice` để thêm sơ đồ mới, hoặc trực tiếp ghi dữ liệu sơ đồ ban đầu vào `LocalStorage` (dưới khóa `diagramsData`) để `EditorSlice` có thể tải lên.

2.  **Tự động chọn sơ đồ mới:**
    *   Sau khi sơ đồ mới được tạo và thông tin của nó được cập nhật trong `ProjectContext` và `EditorSlice`, `WorkspaceContext` nên được cập nhật để đặt sơ đồ mới này làm sơ đồ hiện tại đang được chọn.
    *   Việc này sẽ đảm bảo rằng cả `DiagramEditor` và `DiagramPreviewPanel` đều nhận được thông tin về sơ đồ mới và hiển thị nó.

3.  **Đảm bảo tính nhất quán và lan truyền của trạng thái:**
    *   Kiểm tra lại cách các thành phần (`DiagramPreviewPanel`, `DiagramContent`, `DiagramEditor`) đăng ký (subscribe) và phản ứng với các thay đổi từ `ProjectContext`, `WorkspaceContext`, và `EditorSlice`.
    *   Đảm bảo rằng khi `WorkspaceContext` thay đổi sơ đồ được chọn, `DiagramPreviewPanel` và các thành phần con của nó sẽ render lại với thông tin từ sơ đồ mới.

Bằng cách thực hiện các thay đổi này, luồng dữ liệu sẽ được đảm bảo từ khi tạo sơ đồ mới cho đến khi nó được hiển thị chính xác trong phần xem trước.
