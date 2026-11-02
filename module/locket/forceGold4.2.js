// Get the User-Agent header from the request to check if it's the target app (Locket)
var ua = $request.headers['User-Agent'] || $request.headers['user-agent'] || '';

// Parse the JSON body from the original response
var obj = JSON.parse($response.body);

// Check if the request is from Locket based on the User-Agent
if (ua.includes('Locket')) {
    // Ensure 'feature_gates' and 'upsell_features' objects exist
    obj['feature_gates'] = obj['feature_gates'] || {};
    obj['upsell_features'] = obj['upsell_features'] || {};

    // 1. Modify 'feature_gates' to enable various features
    Object.assign(obj['feature_gates'], {
        'camera': true,
        'camera_roll': true,
        'live_photos': true,
        'camera_filter_config': true,
        'camera_roll_preview_enabled': true,
        'camera_roll_video_enabled': true,
        'camera_roll_video_upload_enabled': true,
        'internal_camera_roll_video_upload_enabled': true,
        'longer_camera_roll_videos_enabled': true,
        'camera_roll_video_max_duration': 300,
        'camera_roll_max_duration': 300,
        'camera_roll_duration': 300,
        'max_video_duration': 300,
        'video_max_duration': 300,
        'video_trim_max_duration': 300,
        'trim_max_duration': 300,
        'gold_max_duration': 300,
        'goldMaxDuration': 300,
        'video_quality_mbps': 10,
        'video_sound_enabled': true,
        'microphone_enabled': true,
        'camera_microphone_enabled': true,
        'audio_session_deactivation_enabled': true,
        'zoom_enabled': true,
        'upload_main': false,
        'upload_main_image_quality': 1,
        'upload_main_image_size': 1080,
        'upload_thumbnail_image_quality': 0.8,
        'upload_thumbnail_image_size': 540,
        // ... many more configuration overrides ...
        'overlay_navigator_enabled': true,
        'captions_enabled': true,
        'music_caption_enabled': true,
        'music_caption_song_preview_enabled': true,
        'link_caption_link_enabled': true
    });

    // 2. Modify 'upsell_features' (Likely unlocking Premium/Gold)
    Object.assign(obj['upsell_features'], {
        'android_subscribe_gold_button_enabled': false,
        'profile_badge_visible': true,
        'lunar_new_year_app_icon_enabled': true
    });

    // 3. Modify core app behavior settings
    obj['max_friends_count'] = 500;
    obj['friend_limit_mode'] = '0';
    obj['soft_friend_limit_threshold_count'] = 450;
    obj['show_friend_limit_on_cam'] = false;
    obj['signup_max_friends_count'] = 500;
    obj['celebrity_inbox_limit'] = 1000;
    obj['new_friends_monitoring_enabled'] = true;
    obj['improved_friend_suggestions'] = true;
    obj['show_friend_suggestions_by_default'] = true;
    obj['emoji_friend_suggestions'] = true;
    obj['prompt_contact_permissions_on_search'] = true;
    obj['populate_phone_numbers_from_suggest_friends'] = true;
    obj['hide_friends_enabled'] = true;
    obj['hide_invite_links'] = false;
    obj['hide_skip_contacts'] = true;
    obj['show_all_contacts'] = true;
    obj['show_invite_suggestions'] = true;
    obj['show_no_friends_bottom_sheet'] = false;
    obj['signup_allow_skip_add_friends'] = true;

    // The obfuscated code also contained large configuration objects
    // for things like 'friend_limit_geo_override', 'friends_sheet_locket_count_config',
    // 'friend_locket_count_config', 'overlay_dynamic_captions', etc.
    // These have been simplified in this representation but involve
    // mapping country codes and event triggers to specific UI elements (like emojis).
}

// Re-serialize the modified object back to a JSON string
$done({ 'body': JSON.stringify(obj) });
