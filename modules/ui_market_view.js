/**
 * UI任务市场模块
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
        '  <horizontal bg="' + C.primary + '" padding="12 14" gravity="center_vertical">' +
        '    <text id="btn_back" text="←" textSize="22sp" textColor="#FFFFFF" padding="4 4 12 4"/>' +
        '    <text text="任务市场" textSize="18sp" textColor="#FFFFFF" textStyle="bold" layout_weight="1"/>' +
        '    <text id="btn_refresh" text="↻" textSize="22sp" textColor="#FFFFFF" padding="8"/>' +
        '  </horizontal>' +
        '  <list id="market_list" bg="' + C.bg + '">' +
        '    <vertical margin="12 6 12 6" bg="' + C.card + '" cornerRadius="14" padding="16" w="*">' +
        '      <horizontal gravity="center_vertical">' +
        '        <vertical layout_weight="1">' +
        '          <text id="market_name" text="{{this.name}}" textSize="15sp" textColor="' + C.textPrimary + '" textStyle="bold"/>' +
        '          <text id="market_author" text="{{this.author}}" textSize="11sp" textColor="' + C.textHint + '" marginTop="3"/>' +
        '        </vertical>' +
        '        <button id="btn_import" text="导入" bg="' + C.primary + '" textColor="white" textSize="12sp" cornerRadius="8" h="32" w="60" marginLeft="8"/>' +
        '      </horizontal>' +
        '      <text id="market_desc" text="{{this.description}}" textSize="12sp" textColor="' + C.textSecondary + '" marginTop="8" maxLines="2"/>' +
        '      <horizontal marginTop="10">' +
        '        <text id="market_downloads" text="⬇ {{this.downloads}}" textSize="11sp" textColor="' + C.textHint + '"/>' +
        '        <text id="market_rating" text="★ {{this.rating}}" textSize="11sp" textColor="#F59E0B" layout_weight="1" gravity="right"/>' +
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
        '  <horizontal bg="' + C.primary + '" padding="12 14" gravity="center_vertical">' +
        '    <text id="btn_back" text="←" textSize="22sp" textColor="#FFFFFF" padding="4 4 12 4"/>' +
        '    <text text="任务详情" textSize="18sp" textColor="#FFFFFF" textStyle="bold" layout_weight="1"/>' +
        '  </horizontal>' +
        '  <scroll bg="' + C.bg + '">' +
        '    <vertical padding="16">' +
        '      <vertical bg="' + C.card + '" cornerRadius="14" padding="20">' +
        '        <text text="' + marketTask.name + '" textSize="20sp" textColor="' + C.textPrimary + '" textStyle="bold"/>' +
        '        <text text="作者：' + marketTask.author + '" textSize="12sp" textColor="' + C.textHint + '" marginTop="6"/>' +
        '        <horizontal marginTop="10">' +
        '          <text text="⬇ ' + marketTask.downloads + '" textSize="12sp" textColor="' + C.textHint + '"/>' +
        '          <text text="★ ' + marketTask.rating + '" textSize="12sp" textColor="#F59E0B" layout_weight="1" gravity="right"/>' +
        '        </horizontal>' +
        '      </vertical>' +
        '      <vertical bg="' + C.card + '" cornerRadius="14" padding="20" marginTop="12">' +
        '        <text text="任务简介" textSize="14sp" textColor="' + C.textSecondary + '" textStyle="bold" marginBottom="10"/>' +
        '        <text text="' + marketTask.description + '" textSize="13sp" textColor="' + C.textPrimary + '"/>' +
        '      </vertical>' +
        '      <button id="btn_import_task" text="导入任务" bg="' + C.primary + '" textColor="white" textSize="14sp" cornerRadius="10" h="44" marginTop="16"/>' +
        '    </vertical>' +
        '  </scroll>' +
        '</vertical>'
    );

    ui.btn_back.on('click', function() { self.show(); });
    ui.btn_import_task.on('click', function() { mgr.dialogs.importMarketTask(marketTask); });
};

module.exports = UIMarketView;
