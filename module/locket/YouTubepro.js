// ==========================================
// PHẦN LOGIC YOUTUBE ENHANCE (ĐÃ ĐƯỢC DEOBFUSCATE)
// ==========================================

const App = Environment.getInstance("YouTube"); // Khởi tạo môi trường (Surge/QuanX/Loon)

// --- LỚP CƠ SỞ CHO CÁC MODULE ---
class YouTubeBase {
    constructor(msgType, name) {
        this.name = name;
        this.msgType = msgType;
        this.version = "1.0";
        this.whiteNo = [];
        this.blackNo = [];
        this.whiteEml = [];
        this.blackEml = ["inline_injection_entrypoint_layout.eml"];
        this.argument = this.decodeArgument();
        
        App.isDebug = Boolean(this.argument.debug);
        App.debug(this.name);
        
        // Đọc cấu hình lưu trữ
        let savedConfig = App.getJSON("YouTubeAdvertiseInfo");
        if (savedConfig?.version === this.version) {
            Object.assign(this, savedConfig);
        }
    }

    decodeArgument() {
        let defaultArgs = {
            lyricLang: "off",
            captionLang: "off",
            blockUpload: true,
            blockImmersive: true,
            blockShorts: false,
            debug: false
        };
        return App.decodeParams(defaultArgs);
    }

    // Đọc dữ liệu nhị phân (Protobuf)
    fromBinary(bodyBytes) {
        if (bodyBytes instanceof Uint8Array) {
            this.message = this.msgType.fromBinary(bodyBytes);
            return this;
        }
        App.log("YouTube can not get binaryBody");
        App.exit();
        return this;
    }

    toBinary() {
        return this.msgType.toBinary(this.message);
    }
}

// --- MODULE 1: XỬ LÝ TRANG CHỦ (BROWSE) ---
class BrowseHandler extends YouTubeBase {
    async pure() {
        // Duyệt tìm và xoá bài đăng quảng cáo
        this.iterate(this.message, "richItemContents", (item) => {
            let contents = item.richItemContents;
            if (!Array.isArray(contents)) return false;
            
            for (let i = contents.length - 1; i >= 0; i--) {
                if (this.isAdvertise(contents[i])) {
                    contents.splice(i, 1);
                    this.needProcess = true;
                }
            }
        });
        await this.translate();
        return this;
    }
    
    isAdvertise(item) {
        // Logic kiểm tra ID hoặc layout eml để xác định quảng cáo
        let unknownField = this.listUnknownFields(item)[0];
        return unknownField ? this.handleFieldNo(unknownField) : this.handleFieldEml(item);
    }
}

// --- MODULE 2: XỬ LÝ TRÌNH PHÁT VIDEO (PLAYER) ---
class PlayerHandler extends YouTubeBase {
    async pure() {
        this.removeAd();
        this.addPremiumAbility();
        this.addTranslateCaption();
        this.needProcess = true;
        return this;
    }

    removeAd() {
        // Xoá các mảng chứa quảng cáo chèn trong video
        if (this.message.adPlacements?.length) this.message.adPlacements.length = 0;
        if (this.message.adSlots?.length) this.message.adSlots.length = 0;
        delete this.message?.playbackTracking?.pageadViewthroughconversion;
    }

    addPremiumAbility() {
        // Mở khoá Hình trong hình (PiP)
        this.message.playabilityStatus.pictureInPictureRender = PictureInPictureSupportedRenderer.create({
            pictureInPictureAbility: { active: true, f4: 0, f6: 0, f8: 1 }
        });
        // Mở khoá Phát trong nền (Background Play)
        this.message.playabilityStatus.backgroundPlayerRender = BackgroundSupportedRenderer.create({
            backgroundAbility: { active: true }
        });
    }
}

// --- MODULE 3: XỬ LÝ YOUTUBE SHORTS ---
class ShortsHandler extends YouTubeBase {
    async pure() {
        let entries = this.message.entries;
        if (entries?.length) {
            for (let i = entries.length - 1; i >= 0; i--) {
                // Xoá các short có gắn nút overlay quảng cáo
                if (!entries[i].command?.reelWatchEndpoint?.overlay) {
                    entries.splice(i, 1);
                    this.needProcess = true;
                }
            }
        }
        return this;
    }
}

// --- MODULE 4: XỬ LÝ THANH MENU DƯỚI (GUIDE) ---
class GuideHandler extends YouTubeBase {
    async pure() {
        // Ẩn các nút không mong muốn ở thanh menu dưới
        let blockList = ["SPunlimited"];
        if (this.argument.blockUpload) blockList.push("FEuploads"); // Ẩn nút Dấu cộng (Upload)
        if (this.argument.blockImmersive) blockList.push("FEmusic_immersive");
        if (this.argument.blockShorts) blockList.push("FEshorts"); // Ẩn nút Shorts
        
        this.iterate(this.message, "rendererItems", (item) => {
            for (let i = item.rendererItems.length - 1; i >= 0; i--) {
                let id = item.rendererItems[i]?.iconRender?.browseId ?? item.rendererItems[i]?.labelRender?.browseId;
                if (id && blockList.includes(id)) {
                    item.rendererItems.splice(i, 1);
                    this.needProcess = true;
                }
            }
        });
        return this;
    }
}

// --- BỘ ĐỊNH TUYẾN (ROUTER) VÀ KHỞI CHẠY ---
const RouterMap = new Map([
    ["browse", BrowseHandler],
    ["next", BrowseHandler], // Sử dụng chung logic của Browse
    ["player", PlayerHandler],
    ["search", BrowseHandler],
    ["reel_watch_sequence", ShortsHandler],
    ["guide", GuideHandler],
    ["get_setting", SettingHandler],
    ["get_watch", WatchHandler]
]);

function getHandler(url) {
    for (let [path, HandlerClass] of RouterMap.entries()) {
        if (url.includes(path)) return new HandlerClass();
    }
    return null;
}

async function main() {
    let handler = getHandler(App.request.url);
    if (handler) {
        let bodyBytes = App.response.bodyBytes;
        
        App.timeStart("fromBinary");
        handler.fromBinary(bodyBytes);
        App.timeEnd("fromBinary");
        
        App.timeStart("modify");
        await handler.pure();
        App.timeEnd("modify");
        
        handler.done(); // Trả kết quả đã chỉnh sửa về cho App
    } else {
        App.msg("YouTube Enhance", "Script cần cập nhật", "Tài nguyên bên ngoài -> Cập nhật tất cả");
        App.exit();
    }
}

main().catch(error => {
    console.log(error.message);
    App.exit();
});
