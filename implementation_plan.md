# Chuyển đổi luồng đăng ký đồ án từ Admin sang Student & Teacher

Luồng nghiệp vụ hiện tại cho phép sinh viên (Student) chỉ chọn đồ án có sẵn, và quản trị viên (Admin) sẽ xét duyệt hoặc tạo đồ án.
Yêu cầu mới đưa luồng đăng ký đồ án về việc sinh viên làm form đề xuất yêu cầu, sau đó giáo viên (Teacher) duyệt tạo đồ án.

## User Review Required

> [!WARNING]
> Mình đã lên kế hoạch để thay đổi luồng này theo như bạn yêu cầu. Tuy nhiên, sự thay đổi này làm thay đổi luồng hiện tại. Bạn hãy xem kỹ các bước dưới đây và xác nhận xem mình hiểu đúng ý bạn chưa nhé. Nếu ok thì mình sẽ bắt đầu code.

## Proposed Changes

### Student (Sinh viên)
Thay đổi thanh "Tap3" và tính năng chọn đồ án thành đăng ký đề xuất đồ án mới:
- Cập nhật **thanh tab 3** trên điều hướng sidebar của sinh viên. Nếu sinh viên chưa có đồ án thì sẽ hiển thị nút "Đăng ký đồ án".
- Tạo form đăng ký mới ở view sinh viên: Gồm list chọn **Tên giáo viên** (lấy từ dữ liệu Teacher) và ô nhập **Tên đồ án muốn đăng ký/yêu cầu**.
- Tạo API `POST /student/addproject`: Sinh viên sẽ tạo đề xuất đồ án, thông tin đề xuất (gồm studentId, teacherId, tên đồ án) sẽ chờ giáo viên duyệt. Nó sẽ lưu tạm vào bảng `Project` với trạng thái riêng hoặc dùng trường `statuss: 'request'`.

### Teacher (Giáo viên)
Thêm khả năng tạo đồ án từ đăng ký của sinh viên:
- Thêm menu/tab **"Đăng ký đồ án" (Yêu cầu đăng ký)** trong hệ thống của giáo viên.
- Tại đây sẽ hiển thị danh sách các sinh viên đã gửi form yêu cầu (gồm Tên sinh viên, Tên đồ án mong muốn).
- Thêm nút **Duyệt tạo đồ án**. Khi giáo viên bấm nút này, đồ án sẽ được tạo cho sinh viên và được set trạng thái `approved`.

### Admin (Quản trị viên)
Xoá tính năng duyệt/đăng ký cho sinh viên bên Admin:
- Xóa các logic liên quan đến Admin duyệt đồ án cho sinh viên hiện tại, để phần xử lý hoàn toàn cho Teacher theo luồng mới.

## Open Questions

> [!IMPORTANT]
> 1. Form đăng ký đồ án của sinh viên chỉ cần "Tên giáo viên" và "Tên đồ án" là đủ để gửi đăng ký đúng không, có cần thêm mô tả gì không?
> 2. Quản trị viên (Admin) có cần xem được danh sách đồ án không, hay chỉ cần xóa quyền duyệt/thêm đăng ký của Admin?

## Verification Plan

### Manual Verification
- Đăng nhập Sinh viên, bấm "Đăng ký đồ án" và submit form.
- Đăng nhập Giáo viên tương ứng, xem list yêu cầu đồ án và duyệt tạo.
- Đăng nhập lại sinh viên để kiểm tra đồ án đã tạo chưa và đúng thông tin không.
