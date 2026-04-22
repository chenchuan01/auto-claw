/**
 * UI任务中心模块
 */

var Config = require('../core/config');
var HeaderBuilder = require('./header_builder');
var xmlEscape = require('../utils/xml_escape');
var C = Config.colors;
var I = Config.icons;

function UIMarketView(uiManager) {
    this.uiManager = uiManager;
}

UIMarketView.prototype.show = function() {
    var self = this;
    var mgr = this.uiManager;

    ui.layout(
        '<vertical bg="' + C.bg + '">' +
        '  <!-- 标题栏 -->' +
        HeaderBuilder.buildHeader({
            title: '任务中心',
            leftIcon: I.arrowLeft,
            leftIconId: 'btn_back',
            rightIcon: I.refresh,
            rightIconId: 'btn_refresh'
        }) +
        '  <!-- 市场列表 -->' +
        '  <list id="market_list" bg="' + C.bg + '" layout_weight="1">' +
        '    <vertical margin="12 16 12 16" bg="' + C.card + '" cornerRadius="20" padding="20" w="*">' +
        '      <horizontal gravity="center_vertical">' +
        '        <vertical layout_weight="1">' +
        '          <text id="market_name" text="{{name}}" textSize="17sp" textColor="' + C.textPrimary + '" textStyle="bold"/>' +
        '          <horizontal id="market_author_row" gravity="center_vertical" marginTop="4">' +
        '            <text id="market_author_icon" text="{{authorIcon}}" textSize="12sp" textColor="' + C.textHint + '" marginRight="4"/>' +
        '            <text id="market_author_name" text="{{author}}" textSize="12sp" textColor="' + C.textHint + '"/>' +
        '          </horizontal>' +
        '        </vertical>' +
        '        <button id="btn_import" text="' + I.download + ' 导入" bg="' + C.primary + '" textColor="#FFFFFF" textSize="13sp" cornerRadius="14" h="36" w="68" marginLeft="8" textStyle="bold"/>' +
        '      </horizontal>' +
        '      <text id="market_desc" text="{{description}}" textSize="13sp" textColor="' + C.textSecondary + '" marginTop="10" maxLines="2"/>' +
        '      <horizontal marginTop="14">' +
        '        <text id="market_downloads" text="' + I.arrowDown + ' {{downloads}}" textSize="12sp" textColor="' + C.textHint + '"/>' +
        '          <text id="market_rating" text="' + I.star + ' {{rating}}" textSize="12sp" textColor="' + C.warning + '" layout_weight="1" gravity="right"/>' +
        '      </horizontal>' +
        '    </vertical>' +
        '  </list>' +
        mgr.buildBottomNav('market') +
        '</vertical>'
    );

    this.loadData();
    mgr.fontManager.apply(ui.btn_back, ui.btn_refresh);
    ui.btn_back.on('click', function() { back(); });
    ui.btn_refresh.on('click', function() {
        // 旋转动画
        var RotateAnimation = android.view.animation.RotateAnimation;
        var Animation = android.view.animation.Animation;
        var rotate = new RotateAnimation(
            0, 360,
            Animation.RELATIVE_TO_SELF, 0.5,
            Animation.RELATIVE_TO_SELF, 0.5
        );
        rotate.setDuration(500);
        ui.btn_refresh.startAnimation(rotate);

        // 刷新数据（后续会从远程获取）
        self.refreshFromRemote();
    });
    ui.market_list.on('item_click', function(item) { self.showDetail(item); });
    ui.market_list.on('item_bind', function(itemView, itemHolder) {
        // 确保应用字体到图标
        if (mgr.fontManager && mgr.fontManager.isLoaded()) {
            mgr.fontManager.apply(itemView.btn_import, itemView.market_author_icon, itemView.market_downloads, itemView.market_rating);
        }
        itemView.btn_import.on('click', function() { mgr.dialogs.importMarketTask(itemHolder.item); });
    });
    mgr.bindBottomNav();
};

UIMarketView.prototype.loadData = function() {
    try {
        var tasks = this.uiManager.marketService.getMarketTasks();
        var tasksWithIcon = [];
        for (var i = 0; i < tasks.length; i++) {
            var t = tasks[i];
            var author = t.author || '系统';
            var authorId = t.authorId || 'system';
            tasksWithIcon.push({
                id: t.id,
                name: t.name,
                author: author,
                authorIcon: authorId === 'system' ? I.robot : I.user,
                description: t.description,
                downloads: t.downloads,
                rating: t.rating
            });
        }
        ui.market_list.setDataSource(tasksWithIcon);
    } catch (e) {
        toast('加载市场数据失败: ' + e.message);
    }
};

/**
 * 从远程刷新任务列表
 */
UIMarketView.prototype.refreshFromRemote = function() {
    var self = this;
    var mgr = this.uiManager;

    // TODO: 后续实现远程获取
    // 目前先刷新本地数据
    console.log('[MarketView] 刷新任务列表（远程功能待实现）');

    // 异步执行，避免阻塞 UI
    threads.start(function() {
        try {
            // TODO: 调用远程服务
            // var remoteService = new RemoteMarketService();
            // var synced = remoteService.syncToLocal(mgr.marketService);
            // if (synced) {
            //     ui.post(function() {
            //         self.loadData();
            //         toast('已更新任务列表');
            //     });
            // } else {
            //     ui.post(function() {
            //         toast('任务列表已是最新');
            //     });
            // }

            // 暂时只刷新本地数据
            ui.post(function() {
                self.loadData();
                toast('已刷新任务列表');
            });

        } catch (e) {
            console.error('[MarketView] 刷新失败:', e.message);
            ui.post(function() {
                toast('刷新失败: ' + e.message);
            });
        }
    });
};

UIMarketView.prototype.showDetail = function(marketTask) {
    var self = this;
    var mgr = this.uiManager;

    // 获取完整任务数据（含 script 字段）
    var fullTask = mgr.marketService.getTaskDetail(marketTask.id);
    if (fullTask) marketTask = fullTask;

    // 代码默认展开
    var codeExpanded = true;

    ui.layout(
        '<vertical bg="' + C.bg + '">' +
        '  <!-- 标题栏 -->' +
        HeaderBuilder.buildHeader({
            title: '任务详情',
            leftIcon: I.arrowLeft,
            leftIconId: 'btn_back2'
        }) +
        '  <!-- 内容区域 -->' +
        '  <scroll bg="' + C.bg + '">' +
        '    <vertical padding="20">' +
        '      <!-- 任务信息卡片 -->' +
        '      <vertical bg="' + C.card + '" cornerRadius="20" padding="24">' +
        '        <text text="' + marketTask.name + '" textSize="22sp" textColor="' + C.textPrimary + '" textStyle="bold"/>' +
        '        <text id="detail_author" text="' + (marketTask.authorId === 'system' ? I.robot + ' ' : I.user + ' ') + marketTask.author + '" textSize="13sp" textColor="' + C.textHint + '" marginTop="6"/>' +
        '        <horizontal marginTop="14">' +
        '          <text id="detail_downloads" text="' + I.arrowDown + ' ' + marketTask.downloads + '" textSize="13sp" textColor="' + C.textHint + '"/>' +
        '          <text id="detail_rating" text="' + I.star + ' ' + marketTask.rating + '" textSize="13sp" textColor="' + C.warning + '" layout_weight="1" gravity="right"/>' +
        '        </horizontal>' +
        '      </vertical>' +
        '      <!-- 任务简介 -->' +
        '      <vertical bg="' + C.card + '" cornerRadius="20" padding="24" marginTop="16">' +
        '        <text text="任务简介" textSize="16sp" textColor="' + C.accent + '" textStyle="bold" marginBottom="12"/>' +
        '        <text text="' + marketTask.description + '" textSize="14sp" textColor="' + C.textPrimary + '"/>' +
        '      </vertical>' +
        '      <!-- 脚本代码预览 -->' +
        '      <vertical id="code_card" bg="' + C.card + '" cornerRadius="20" padding="24" marginTop="16">' +
        '        <horizontal id="code_header" gravity="center_vertical" marginBottom="12">' +
        '          <text text="任务脚本" textSize="16sp" textColor="' + C.accent + '" textStyle="bold" layout_weight="1"/>' +
        '          <text id="code_toggle" text="' + I.arrowUp + '" textSize="20sp" textColor="' + C.textHint + '"/>' +
        '        </horizontal>' +
        '        <vertical id="code_content" visibility="visible">' +
        '          <text id="code_text" textSize="12sp" textColor="' + C.textPrimary + '" fontFamily="monospace" lineSpacingExtra="3"/>' +
        '        </vertical>' +
        '      </vertical>' +
        '      <!-- 导入按钮 -->' +
        '      <button id="btn_import_task" text="' + I.download + ' 导入任务" bg="' + C.primary + '" textColor="#FFFFFF" textSize="15sp" cornerRadius="16" h="52" marginTop="24" textStyle="bold"/>' +
        '    </vertical>' +
        '  </scroll>' +
        '</vertical>'
    );

    ui.btn_back2.on('click', function() { back(); });
    ui.btn_import_task.on('click', function() { mgr.dialogs.importMarketTask(marketTask); });

    // 动态设置脚本内容（避免XML转义问题）
    ui.code_text.setText(marketTask.script || '暂无脚本');

    // 代码展开/折叠切换
    ui.code_header.on('click', function() {
        codeExpanded = !codeExpanded;
        if (codeExpanded) {
            ui.code_content.attr('visibility', 'visible');
            ui.code_toggle.setText(I.arrowUp);
        } else {
            ui.code_content.attr('visibility', 'gone');
            ui.code_toggle.setText(I.arrowDown);
        }
        mgr.fontManager.apply(ui.code_toggle);
    });

    // 为作者、下载数和星级图标应用字体
    mgr.fontManager.apply(ui.btn_back2, ui.btn_import_task, ui.detail_author, ui.detail_downloads, ui.detail_rating, ui.code_header, ui.code_toggle);
};

module.exports = UIMarketView;
