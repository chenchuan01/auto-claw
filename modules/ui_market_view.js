/**
 * UI任务中心模块
 */

var Config = require('./config');
var C = Config.colors;

function UIMarketView(uiManager) {
    this.uiManager = uiManager;
}

UIMarketView.prototype.show = function() {
    var self = this;
    var mgr = this.uiManager;

    ui.layout(
        '<vertical bg="' + C.bg + '">' +
        '  <!-- 标题栏 -->' +
        '  <horizontal bg="' + C.card + '" padding="20 16 16 16" gravity="center_vertical">' +
        '    <text id="btn_back" text="←" textSize="26sp" textColor="' + C.textPrimary + '" padding="4 4 12 4"/>' +
        '    <text text="任务中心" textSize="22sp" textColor="' + C.textPrimary + '" textStyle="bold" layout_weight="1"/>' +
        '    <text id="btn_refresh" text="↻" textSize="24sp" textColor="' + C.textPrimary + '" padding="8 8 8 12"/>' +
        '  </horizontal>' +
        '  <!-- 市场列表 -->' +
        '  <list id="market_list" bg="' + C.bg + '">' +
        '    <vertical margin="12 16 12 16" bg="' + C.card + '" cornerRadius="20" padding="20" w="*">' +
        '      <horizontal gravity="center_vertical">' +
        '        <vertical layout_weight="1">' +
        '          <text id="market_name" text="{{this.name}}" textSize="17sp" textColor="' + C.textPrimary + '" textStyle="bold"/>' +
        '        <text id="market_author" text="○ {{this.author}}" textSize="12sp" textColor="' + C.textHint + '" marginTop="4"/>' +
        '        </vertical>' +
        '        <button id="btn_import" text="↓ 导入" bg="' + C.primary + '" textColor="white" textSize="13sp" cornerRadius="14" h="36" w="68" marginLeft="8" textStyle="bold"/>' +
        '      </horizontal>' +
        '      <text id="market_desc" text="{{this.description}}" textSize="13sp" textColor="' + C.textSecondary + '" marginTop="10" maxLines="2"/>' +
        '      <horizontal marginTop="14">' +
        '        <text id="market_downloads" text="↓ {{this.downloads}}" textSize="12sp" textColor="' + C.textHint + '"/>' +
        '          <text id="market_rating" text="★ {{this.rating}}" textSize="12sp" textColor="' + C.warning + '" layout_weight="1" gravity="right"/>' +
        '      </horizontal>' +
        '    </vertical>' +
        '  </list>' +
        '</vertical>'
    );

    this.loadData();
    ui.btn_back.on('click', function() { mgr.showMainView(); });
    ui.btn_refresh.on('click', function() { self.loadData(); });
    ui.market_list.on('item_click', function(item) { self.showDetail(item); });
    ui.market_list.on('item_bind', function(itemView, itemHolder) {
        itemView.btn_import.on('click', function() { mgr.dialogs.importMarketTask(itemHolder.item); });
    });
};

UIMarketView.prototype.loadData = function() {
    try {
        ui.market_list.setDataSource(this.uiManager.marketService.getMarketTasks());
    } catch (e) {
        toast('加载市场数据失败: ' + e.message);
    }
};

UIMarketView.prototype.showDetail = function(marketTask) {
    var self = this;
    var mgr = this.uiManager;

    ui.layout(
        '<vertical bg="' + C.bg + '">' +
        '  <!-- 标题栏 -->' +
        '  <horizontal bg="' + C.card + '" padding="20 16 16 16" gravity="center_vertical">' +
        '    <text id="btn_back" text="←" textSize="26sp" textColor="' + C.textPrimary + '" padding="4 4 12 4"/>' +
        '    <text text="任务详情" textSize="22sp" textColor="' + C.textPrimary + '" textStyle="bold" layout_weight="1"/>' +
        '  </horizontal>' +
        '  <!-- 内容区域 -->' +
        '  <scroll bg="' + C.bg + '">' +
        '    <vertical padding="20">' +
        '      <!-- 任务信息卡片 -->' +
        '      <vertical bg="' + C.card + '" cornerRadius="20" padding="24">' +
        '        <text text="' + marketTask.name + '" textSize="22sp" textColor="' + C.textPrimary + '" textStyle="bold"/>' +
        '        <text text="○ ' + marketTask.author + '" textSize="13sp" textColor="' + C.textHint + '" marginTop="6"/>' +
        '        <horizontal marginTop="14">' +
        '          <text text="↓ ' + marketTask.downloads + '" textSize="13sp" textColor="' + C.textHint + '"/>' +
        '          <text text="★ ' + marketTask.rating + '" textSize="13sp" textColor="' + C.warning + '" layout_weight="1" gravity="right"/>' +
        '        </horizontal>' +
        '      </vertical>' +
        '      <!-- 任务简介 -->' +
        '      <vertical bg="' + C.card + '" cornerRadius="20" padding="24" marginTop="16">' +
        '        <text text="任务简介" textSize="16sp" textColor="' + C.accent + '" textStyle="bold" marginBottom="12"/>' +
        '        <text text="' + marketTask.description + '" textSize="14sp" textColor="' + C.textPrimary + '"/>' +
        '      </vertical>' +
        '      <!-- 导入按钮 -->' +
        '      <button id="btn_import_task" text="↓ 导入任务" bg="' + C.primary + '" textColor="white" textSize="15sp" cornerRadius="16" h="52" marginTop="24" textStyle="bold"/>' +
        '    </vertical>' +
        '  </scroll>' +
        '</vertical>'
    );

    ui.btn_back.on('click', function() { self.show(); });
    ui.btn_import_task.on('click', function() { mgr.dialogs.importMarketTask(marketTask); });
};

module.exports = UIMarketView;
