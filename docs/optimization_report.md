# Báo cáo Tối ưu hóa Thiết kế Ứng dụng

Ngày: 2025-06-04

## 1. Giới thiệu

Báo cáo này dựa trên việc phân tích các sơ đồ thiết kế của ứng dụng (Sơ đồ Thành phần, Sơ đồ Trạng thái và Sơ đồ Luồng Dữ liệu) nhằm xác định các khu vực có thể tối ưu hóa, giảm thiểu sự dư thừa và cải thiện tính nhất quán của hệ thống. Các đề xuất được trình bày dưới dạng các tác vụ cụ thể.

## 2. Các Khu vực Tối ưu hóa và Tác vụ Đề xuất

### 2.1. Hợp nhất `WorkspaceContext`

*   **Hiện trạng:** `WorkspaceContext` hiện tại chủ yếu quản lý `activeDiagramId` và đóng vai trò trung gian giữa `DiagramList` và `EditorSlice`.
*   **Vấn đề/Dư thừa:** Vai trò của `WorkspaceContext` khá hẹp, có thể làm tăng độ phức tạp không cần thiết cho cây component và luồng dữ liệu.
*   **Tác vụ đề xuất:**
    *   **Task 1.1:** Nghiên cứu và xem xét việc hợp nhất trách nhiệm quản lý `activeDiagramId` của `WorkspaceContext` vào `ProjectContext`.
    *   **Task 1.2:** Nếu hợp nhất, cập nhật `DiagramList` để tương tác với `ProjectContext` khi chọn sơ đồ, và `EditorSlice` để lắng nghe thay đổi `activeDiagramId` từ `ProjectContext`.
    *   **Task 1.3:** Cập nhật các sơ đồ liên quan (Sơ đồ Thành phần, Sơ đồ Luồng Dữ liệu) để phản ánh sự thay đổi này nếu được thực hiện.

### 2.2. Thống nhất Luồng Cập nhật Mã Sơ đồ

*   **Hiện trạng:** Có sự khác biệt trong cách mô tả luồng cập nhật mã sơ đồ giữa Sơ đồ Thành phần (`DiagramEditor ..> ProjectContext`) và Sơ đồ Luồng Dữ liệu (`UI_DiagramEditor --> STATE_EditorSlice`).
*   **Vấn đề/Dư thừa:** Sự không nhất quán trong tài liệu thiết kế. Luồng qua `EditorSlice` có vẻ tập trung và hợp lý hơn cho việc quản lý trạng thái của trình soạn thảo.
*   **Tác vụ đề xuất:**
    *   **Task 2.1:** Thống nhất rằng `EditorSlice` là nơi chịu trách nhiệm chính cho việc nhận, cập nhật và lưu trữ mã sơ đồ đang được chỉnh sửa từ `DiagramEditor`.
    *   **Task 2.2:** `ProjectContext` chỉ nên xử lý metadata của sơ đồ (ví dụ: tên, ID, thời gian sửa đổi cuối) và không nên trực tiếp nhận mã sơ đồ từ `DiagramEditor`.
    *   **Task 2.3:** Cập nhật Sơ đồ Thành phần để phản ánh luồng `DiagramEditor ..> EditorSlice` cho việc cập nhật mã.

### 2.3. Đồng bộ hóa Dữ liệu khi Xóa Sơ đồ

*   **Hiện trạng:** `ProjectContext` xử lý việc xóa metadata của sơ đồ và cập nhật `LocalStorage` cho cấu trúc dự án.
*   **Vấn đề/Dư thừa:** Có khả năng dữ liệu mã và cài đặt của sơ đồ (do `EditorSlice` quản lý và lưu trong một khóa khác của `LocalStorage`, ví dụ `diagramsData`) không được dọn dẹp, dẫn đến dữ liệu mồ côi.
*   **Tác vụ đề xuất:**
    *   **Task 3.1:** Thiết kế và triển khai một cơ chế để khi `ProjectContext` xử lý việc xóa một sơ đồ, nó sẽ thông báo hoặc kích hoạt một hành động trong `EditorSlice`.
    *   **Task 3.2:** `EditorSlice` khi nhận được thông báo này, phải xóa tất cả dữ liệu liên quan đến `diagramId` đã bị xóa khỏi `LocalStorage` (ví dụ: từ khóa `diagramsData`).
    *   **Task 3.3:** Cập nhật Sơ đồ Luồng Dữ liệu để thể hiện rõ ràng bước dọn dẹp này.

### 2.4. Đánh giá lại Trạng thái `AnotherProjectSelected`

*   **Hiện trạng:** Sơ đồ Trạng thái có một trạng thái riêng biệt là `AnotherProjectSelected` khi người dùng chuyển đổi giữa các dự án.
*   **Vấn đề/Dư thừa:** Trạng thái này về bản chất vẫn là "một dự án đang được chọn". Việc có trạng thái riêng có thể không cần thiết.
*   **Tác vụ đề xuất:**
    *   **Task 4.1:** Đánh giá việc đơn giản hóa Sơ đồ Trạng thái bằng cách loại bỏ trạng thái `AnotherProjectSelected`.
    *   **Task 4.2:** Nếu loại bỏ, hành động `selectProject()` sẽ chuyển về lại chính trạng thái `ProjectSelected`, với context bên trong (dữ liệu dự án được tải) được cập nhật.
    *   **Task 4.3:** Cập nhật Sơ đồ Trạng thái nếu có thay đổi.

### 2.5. Nguồn Dữ liệu cho `DiagramPreviewPanel`

*   **Hiện trạng:** Sơ đồ Thành phần cho thấy `DiagramPreviewPanel ..> ProjectContext : Reads diagrams`.
*   **Vấn đề/Dư thừa:** Nếu `DiagramPreviewPanel` chỉ cần hiển thị sơ đồ đang hoạt động, và thông tin này (mã, cài đặt) đã được `EditorSlice` cung cấp, việc đọc trực tiếp từ `ProjectContext` có thể là dư thừa cho mục đích này.
*   **Tác vụ đề xuất:**
    *   **Task 5.1:** Xem xét lại liệu `DiagramPreviewPanel` có thực sự cần truy cập toàn bộ danh sách sơ đồ từ `ProjectContext` hay chỉ cần dữ liệu của sơ đồ đang hoạt động từ `EditorSlice`.
    *   **Task 5.2:** Nếu `EditorSlice` đủ cung cấp thông tin, hãy loại bỏ sự phụ thuộc không cần thiết của `DiagramPreviewPanel` vào `ProjectContext` cho việc đọc dữ liệu sơ đồ đang hoạt động.
    *   **Task 5.3:** Cập nhật Sơ đồ Thành phần nếu có thay đổi.

## 3. Kết luận

Việc thực hiện các tác vụ trên sẽ giúp cải thiện cấu trúc, giảm độ phức tạp và tăng tính nhất quán cho ứng dụng. Nên ưu tiên các tác vụ liên quan đến hợp nhất context và đồng bộ hóa dữ liệu để đảm bảo sự ổn định và dễ bảo trì của hệ thống.
