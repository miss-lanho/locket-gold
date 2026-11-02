// Khởi tạo mapping kiểm tra User-Agent
const mapping = {
  'Locket': ['locket_gold'] // Tên app và định danh gói Premium tương ứng
};

// Lấy thông tin User-Agent từ request
var ua = $request.headers['User-Agent'] || $request.headers['user-agent'];

// Parse dữ liệu trả về từ server (JSON)
var obj = JSON.parse($response.body);

// Chèn thêm cảnh báo/tên người tạo script vào JSON (Thường thấy ở các script share trên mạng)
obj['Attention'] = "Chúc bạn sử dụng vui vẻ!";

// Dữ liệu giả mạo trạng thái đã đăng ký (Subscription)
var NMS = {
  "expires_date": "2099-10-22T23:59:59Z",
  "original_purchase_date": "2020-10-22T00:00:00Z",
  "purchase_date": "2020-10-22T00:00:00Z",
  "ownership_type": "PURCHASED",
  "store": "apple"
};

// Dữ liệu giả mạo quyền lợi (Entitlement) - Locket Gold
var locketGold = {
  "expires_date": "2099-10-22T23:59:59Z",
  "original_purchase_date": "2020-10-22T00:00:00Z",
  "purchase_date": "2020-10-22T00:00:00Z",
  "ownership_type": "PURCHASED",
  "product_identifier": "locket_gold_pro"
};

// Tìm xem User-Agent hiện tại có nằm trong danh sách mapping không
const match = Object.keys(mapping).find(_0x3ef920 => ua.includes(_0x3ef920));

if (match) {
  let [entitlement, subscription] = mapping[match];
  
  if (subscription) {
    // Nếu có định danh subscription riêng
    locketGold['product_identifier'] = subscription;
    obj['subscriber']['subscriptions'][subscription] = NMS;
  } else {
    // Ghi đè quyền lợi entitlement
    obj['subscriber']['entitlements'][entitlement] = locketGold;
  }
} else {
  // Fallback mặc định nếu không khớp User-Agent
  obj['subscriber']['subscriptions']['locket_gold'] = NMS;
  obj['subscriber']['entitlements']['pro'] = locketGold;
}

// Trả về dữ liệu đã được chỉnh sửa cho ứng dụng
$done({'body': JSON.stringify(obj)});
