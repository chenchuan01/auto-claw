/**
 * UI AI历史对话页面模块
 * 展示所有保存的AI对话历史，支持加载和删除
 */

var Config = require('../core/config');
var HeaderBuilder = require('./header_builder');
var C = Config.colors;
var I = Config.icons;

function UIAIHistory(uiManager) {
    this.uiManager = uiManager;
}

/**
 * 显示历史对话页面
 */
UIAIHistory.prototype.show = function() {
    var self = this;
    var mgr = this.uiManager;
    var conversations = mgr.dataManager.getAIConversations();

    conversations = conversations.filter(function(c) {
        return c.messages && c.messages.length > 0;
    });

    ui.layout(
        '<vertical bg="' + C.bg + '">' +
        HeaderBuilder.buildHeader({
            title: '历史对话',
            leftIcon: I.arrowLeft,
            leftIconId: 'btn_back'
        }) +
        '  <!-- 内容区域 -->' +
        '  <frame layout_weight="1">' +
        '    <scroll id="history_scroll" bg="' + C.bg + '">' +
        '      <vertical id="history_container" padding="12 12">' +
        '      </vertical>' +
        '    </scroll>' +
        '    <!-- 空状态 -->' +
        '    <vertical id="empty_view" visibility="' + (conversations.length === 0 ? 'visible' : 'gone') + '" gravity="center" bg="' + C.bg + '" padding="40">' +
        '      <text text="' + I.history + '" textSize="88sp" textColor="' + C.textHint + '" gravity="center"/>' +
        '      <text text="暂无历史对话" textSize="16sp" textColor="' + C.textHint + '" gravity="center" marginTop="16"/>' +
        '    </vertical>' +
        '  </frame>' +
        '</vertical>'
    );

    // 应用字体
    mgr.fontManager.applyLight(ui.btn_back);
    mgr.fontManager.apply(ui.empty_view.getChildAt(0));

    // 绑定返回事件
    ui.btn_back.on('click', function() {
        back();
        mgr.showAIChat();
    });

    // 渲染对话列表
    this.renderHistoryList(conversations);
};

/**
 * 渲染历史对话列表
 */
UIAIHistory.prototype.renderHistoryList = function(conversations) {
    var self = this;
    var mgr = this.uiManager;
    var container = ui.history_container;

    container.removeAllViews();

    conversations.forEach(function(conv) {
        var date = new Date(conv.createTime);
        var dateStr = date.getFullYear() + '-' +
                    String(date.getMonth() + 1).padStart(2, '0') + '-' +
                    String(date.getDate()).padStart(2, '0') + ' ' +
                    String(date.getHours()).padStart(2, '0') + ':' +
                    String(date.getMinutes()).padStart(2, '0');

        // 消息统计
        var msgCount = conv.messages ? conv.messages.length : 0;
        var userMsgCount = conv.messages ? conv.messages.filter(function(m) { return m.role === 'user'; }).length : 0;

        // 清理标题文本（移除Markdown符号和换行）
        function cleanTitle(str) {
            if (!str) return '新对话';
            // 移除所有代码块标记反引号
            var cleaned = str.replace(/`/g, '');
            // 移除换行，多个空格变一个，保持单行
            cleaned = cleaned.replace(/\s+/g, ' ').trim();
            // 截断过长标题
            if (cleaned.length > 30) {
                cleaned = cleaned.substring(0, 30) + '...';
            }
            return cleaned;
        }

        var cleanedTitle = cleanTitle(conv.title);

        // 在 AutoJs 中，ui.inflate 后可以通过 .<id> 直接访问子view
        // 标题不在XML中设置，动态设置避免XML解析错误
        var xml =
            '<horizontal id="item_container" margin="0 0 0 12" gravity="center_vertical" bg="' + C.card + '" cornerRadius="16" padding="16">' +
            '  <vertical layout_weight="1" padding="0 4">' +
            '    <text id="conv_title" textSize="16sp" textColor="' + C.textPrimary + '" textStyle="bold" singleLine="true"/>' +
            '    <horizontal gravity="center_vertical" marginTop="6">' +
            '      <text text="' + I.calendar + ' ' + dateStr + '" textSize="12sp" textColor="' + C.textHint + '" marginRight="16"/>' +
            '      <text text="' + I.comment + ' ' + userMsgCount + ' 轮对话" textSize="12sp" textColor="' + C.textHint + '"/>' +
            '    </horizontal>' +
            '  </vertical>' +
            '  <text id="btn_delete" text="' + I.xmark + '" textSize="20sp" textColor="' + C.error + '" w="40" h="40" gravity="center"/>' +
            '</horizontal>';

        var item = ui.inflate(xml);
        container.addView(item);

        // 在 AutoJs 中直接通过 . 访问子view
        var itemContainer = item.item_container;
        var deleteBtn = item.btn_delete;
        var convTitle = item.conv_title;
        // 动态设置标题，避免XML解析错误
        convTitle.setText(cleanedTitle);

        // 只对删除按钮应用字体（因为它有X图标），标题是普通文字不需要
        if (deleteBtn) mgr.fontManager.apply(deleteBtn);

        // 点击整个卡片加载对话
        if (itemContainer) {
            itemContainer.on('click', function() {
                // 加载对话到AI聊天页面
                var fullConv = mgr.dataManager.getAIConversationById(conv.id);
                if (fullConv) {
                    mgr.showAIChat();
                    ui.post(function() {
                        mgr.aiChat.loadConversation(fullConv);
                    }, 100);
                }
            });
        }

        // 删除按钮点击
        if (deleteBtn) {
            deleteBtn.on('click', function(event) {
                event.cancelBubble = true;
                dialogs.confirm('删除对话', '确定要删除"' + conv.title + '"吗？', function(confirmed) {
                    if (confirmed) {
                        mgr.dataManager.deleteAIConversation(conv.id);
                        toast('对话已删除');
                        // 刷新列表
                        self.show();
                    }
                });
            });
        }
    });
};

module.exports = UIAIHistory;
