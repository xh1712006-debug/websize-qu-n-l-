# Skill: Quản Lý Đồ Án Tốt Nghiệp

Tài liệu này đóng vai trò là "kỹ năng" và hướng dẫn phát triển cho hệ thống Quản lý Đồ án Tốt nghiệp.

## 🏗 Kiến Trúc Hệ Thống (MVC)

Dự án tuân thủ kiến trúc **Model-View-Controller**:

-   **Models (`src/app/models`)**: Định nghĩa schema cho MongoDB (Sử dụng Mongoose).
    -   `student.js`: Thông tin sinh viên, trạng thái đồ án.
    -   `teacher.js`: Thông tin giáo viên.
    -   `project.js`: Thông tin chi tiết đồ án.
-   **Controllers (`src/app/controller`)**: Xử lý logic nghiệp vụ.
    -   Được phân chia theo vai trò: `admin`, `teacher`, `student`, `accounts`.
-   **Views (`src/resources/views`)**: Giao diện Handlebars (.hbs).
-   **Routes (`src/routes`)**: Điều hướng yêu cầu đến đúng controller.

## 🎨 Hệ Thống Layout & Giao Diện

Hệ thống sử dụng đa layout để phục vụ các vai trò khác nhau:

-   `layouts/student/main.hbs`: Layout chính cho giao diện sinh viên.
-   `layouts/teacher/main.hbs`: Layout chính cho giao diện giáo viên.
-   `layouts/microsoft/main.hbs`: Layout cho luồng đăng nhập/đăng ký Microsoft.

**Lưu ý khi thêm View mới:**
Luôn chỉ định layout tương ứng trong hàm `res.render()`:
```javascript
res.render('path/to/view', { layout: 'teacher/main' });
```

## 🔐 Phân Quyền & Session

-   Hệ thống sử dụng `express-session` lưu trữ trong MongoDB.
-   Dựa vào `req.session.student`, `req.session.teacher` hoặc `req.session.admin` để xác định vai trò người dùng.
-   Mật khẩu được lưu trữ trực tiếp (cần cân nhắc mã hóa bcrypt trong tương lai).

## 💡 Quy Trình Thêm Tính Năng Mới

1.  **Model**: Tạo hoặc cập nhật schema trong `src/app/models`.
2.  **Controller**: Tạo class controller trong `src/app/controller/[role]`.
3.  **Route**: Khai báo route trong `src/routes/[role]` và kết nối vào `src/routes/index.js`.
4.  **View**: Tạo file `.hbs` trong `src/resources/views` sử dụng đúng layout.

## 🛠 Lưu Ý Kỹ Thuật

-   **Database**: Kết nối đến MongoDB tại `mongodb://127.0.0.1:27017/student`.
-   **Static Files**: CSS, JS, Images được phục vụ từ thư mục `src/public`.
-   **File Storage**: Các file upload được lưu tại thư mục `upload/file` và truy cập qua route `/uploads`.

---
*Tài liệu này được tạo tự động để hỗ trợ phát triển và duy trì tính nhất quán cho dự án.*
