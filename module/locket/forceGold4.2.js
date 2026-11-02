// Lấy User-Agent từ Request
var ua = $request.headers['User-Agent'] || $request.headers['user-agent'] || '';

// Parse JSON từ Response body trả về từ server
var obj = JSON.parse($response.body);

// Kiểm tra xem có phải request từ ứng dụng Locket không (logic gốc kiểm tra qua regex/includes)
if (ua.includes('Locket')) {
    
    // Đảm bảo các object cấu hình tồn tại
    obj['feature_gates'] = obj['feature_gates'] || {};
    obj['upsell_features'] = obj['upsell_features'] || {};

    // 1. MỞ KHÓA TÍNH NĂNG VÀ CẤU HÌNH CAMERA / VIDEO
    Object.assign(obj['feature_gates'], {
        // ... (Kích hoạt hàng loạt feature ẩn của developer)
    });
    
    obj['camera_roll_video_enabled'] = true;
    obj['camera_roll_video_upload_enabled'] = true;
    obj['longer_camera_roll_videos_enabled'] = true;
    obj['camera_roll_video_max_duration'] = 300;
    obj['camera_roll_max_duration'] = 300;
    obj['max_video_duration'] = 300;
    obj['video_max_duration'] = 300;
    obj['gold_max_duration'] = 300;
    obj['video_quality_mbps'] = 10;
    
    // 2. MỞ KHÓA BẠN BÈ VÀ LOCKET GOLD
    obj['max_friends_count'] = 500; // Hoặc một số lượng lớn được set trong script
    obj['friend_limit_mode'] = '0';
    obj['show_friend_limit_on_cam'] = false;
    obj['android_subscribe_gold_button_enabled'] = false; // Ẩn nút mua Gold
    obj['profile_badge_visible'] = true; // Hiện huy hiệu Gold
    
    // 3. THAY ĐỔI CÁC EMOJI, BIỂU TƯỢNG VÀ WIDGET (Dựa trên hàng loạt key cấu hình bên dưới)
    // Script tạo ra một object khổng lồ ghi đè mọi icon mặc định bằng icon premium (như 🤍, 💛, ⚡✨, ☕, 🎮)
    obj['friends_sheet_locket_count_config'] = { /* ... */ };
    obj['friend_locket_count_config'] = { /* ... */ };
    
    // 4. MỞ KHÓA CÁC CHỨC NĂNG ẨN KHÁC
    obj['custom_profile_pics'] = true;
    obj['profile_menu_v2_enabled'] = true;
    obj['beta_features_enabled'] = true;
}

// Đóng gói lại JSON và trả về cho ứng dụng
$done({
    'body': JSON.stringify(obj)
});
