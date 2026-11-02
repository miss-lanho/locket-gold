const version = "1.0"; // Chuỗi phiên bản (có thể khác tùy script gốc)

// Lấy danh sách headers từ request hiện tại
var modifiedHeaders = $request.headers;

// Hàm hỗ trợ để sửa đổi giá trị của Header
function setHeaderValue(headers, headerName, headerValue) {
    // Chuyển tên header về in thường để kiểm tra
    var lowerCaseHeader = headerName.toLowerCase();
    
    // Nếu header (dạng in thường) đã tồn tại, tiến hành ghi đè
    if (lowerCaseHeader in headers) {
        headers[lowerCaseHeader] = headerValue;
    } else {
        // Nếu chưa tồn tại, tạo mới với tên gốc
        headers[headerName] = headerValue;
    }
}

// Xóa nội dung của ETag để ép server trả về dữ liệu mới
setHeaderValue(modifiedHeaders, "X-RevenueCat-ETag", "");

// Trả lại headers đã chỉnh sửa cho app proxy xử lý tiếp
$done({ 'headers': modifiedHeaders });
