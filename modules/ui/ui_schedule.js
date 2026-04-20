/**
 * 定时任务设置界面
 */

var Config = require('../core/config');
var C = Config.colors;
var I = Config.icons;

function UISchedule(uiManager) {
    this.uiManager = uiManager;
    this.taskId = null;
}

UISchedule.prototype.show = function(taskId) {
    this.taskId = taskId;
    var self = this;
    var task = this.uiManager.dataManager.getTaskById(taskId);
    if (!task) {
        toast('任务不存在');
        this.uiManager.showMainView();
        return;
    }

    var schedule = task.schedule || { enabled: false, time: '09:00', cycle: 'daily' };

    ui.layout(
        '<vertical bg="' + C.bg + '">' +
        '  <horizontal bg="' + C.primary + '" padding="16" gravity="center_vertical">' +
        '    <text id="btn_back" text="' + I.arrowLeft + '" textSize="20sp" textColor="white" padding="8"/>' +
        '    <text text="定时设置" textSize="18sp" textColor="white" layout_weight="1" marginLeft="8"/>' +
        '    <text id="btn_save" text="' + I.check + '" textSize="20sp" textColor="white" padding="8"/>' +
        '  </horizontal>' +
        '  <ScrollView>' +
        '    <vertical padding="16">' +
        '      <card cornerRadius="12" cardElevation="0" cardBackgroundColor="' + C.card + '" margin="0 8">' +
        '        <vertical padding="16">' +
        '          <text text="任务名称" textSize="14sp" textColor="' + C.textSecondary + '"/>' +
        '          <text text="' + task.name + '" textSize="16sp" textColor="' + C.textPrimary + '" marginTop="4"/>' +
        '        </vertical>' +
        '      </card>' +
        '      <card cornerRadius="12" cardElevation="0" cardBackgroundColor="' + C.card + '" margin="0 8" marginTop="16">' +
        '        <vertical padding="16">' +
        '          <horizontal gravity="center_vertical">' +
        '            <text text="启用定时" textSize="16sp" textColor="' + C.textPrimary + '" layout_weight="1"/>' +
        '            <Switch id="switch_enabled" checked="' + schedule.enabled + '"/>' +
        '          </horizontal>' +
        '        </vertical>' +
        '      </card>' +
        '      <card id="card_schedule_config" cornerRadius="12" cardElevation="0" cardBackgroundColor="' + C.card + '" margin="0 8" marginTop="16">' +
        '        <vertical padding="16">' +
        '          <text text="执行时间" textSize="14sp" textColor="' + C.textSecondary + '"/>' +
        '          <horizontal marginTop="8" gravity="center_vertical">' +
        '            <text id="text_time" text="' + schedule.time + '" textSize="24sp" textColor="' + C.primary + '" layout_weight="1"/>' +
        '            <text id="btn_time" text="' + I.clock + '" textSize="20sp" textColor="' + C.primary + '" padding="8"/>' +
        '          </horizontal>' +
        '          <View bg="' + C.divider + '" h="1" marginTop="16"/>' +
        '          <text text="执行周期" textSize="14sp" textColor="' + C.textSecondary + '" marginTop="16"/>' +
        '          <radiogroup id="radio_cycle" marginTop="8">' +
        '            <horizontal gravity="center_vertical" padding="8 12">' +
        '              <text id="radio_icon_daily" text="●" textSize="16sp" textColor="' + C.primary + '" w="24"/>' +
        '              <text text="每天" textSize="16sp" textColor="' + C.textPrimary + '" marginLeft="8"/>' +
        '            </horizontal>' +
        '            <horizontal gravity="center_vertical" padding="8 12">' +
        '              <text id="radio_icon_weekday" text="○" textSize="16sp" textColor="' + C.textHint + '" w="24"/>' +
        '              <text text="工作日（周一至周五）" textSize="16sp" textColor="' + C.textPrimary + '" marginLeft="8"/>' +
        '            </horizontal>' +
        '            <horizontal gravity="center_vertical" padding="8 12">' +
        '              <text id="radio_icon_weekend" text="○" textSize="16sp" textColor="' + C.textHint + '" w="24"/>' +
        '              <text text="周末（周六、周日）" textSize="16sp" textColor="' + C.textPrimary + '" marginLeft="8"/>' +
        '            </horizontal>' +
        '          </radiogroup>' +
        '        </vertical>' +
        '      </card>' +
        '      <card cornerRadius="12" cardElevation="0" cardBackgroundColor="' + C.surface + '" margin="0 8" marginTop="16">' +
        '        <vertical padding="16">' +
        '          <horizontal gravity="center_vertical">' +
        '            <text id="info_icon" text="' + I.info + '" textSize="16sp" textColor="' + C.info + '"/>' +
        '            <text text="说明" textSize="14sp" textColor="' + C.info + '" marginLeft="8" textStyle="bold"/>' +
        '          </horizontal>' +
        '          <text text="• 定时任务将在后台自动执行\n• 请确保应用有后台运行权限\n• 时间精度为分钟级别" textSize="13sp" textColor="' + C.textSecondary + '" marginTop="8"/>' +
        '        </vertical>' +
        '      </card>' +
        '    </vertical>' +
        '  </ScrollView>' +
        '</vertical>'
    );

    this.uiManager.fontManager.apply(ui.btn_back, ui.btn_save, ui.btn_time, ui.info_icon);

    var currentCycle = schedule.cycle || 'daily';
    this.updateCycleUI(currentCycle);

    ui.switch_enabled.on('check', function(checked) {
        ui.card_schedule_config.attr('alpha', checked ? '1.0' : '0.5');
    });

    ui.card_schedule_config.attr('alpha', schedule.enabled ? '1.0' : '0.5');

    ui.btn_back.on('click', function() {
        self.uiManager.showMainView();
    });

    ui.btn_time.on('click', function() {
        if (!ui.switch_enabled.isChecked()) {
            toast('请先启用定时');
            return;
        }
        self.showTimePicker();
    });

    ui.text_time.on('click', function() {
        if (!ui.switch_enabled.isChecked()) {
            toast('请先启用定时');
            return;
        }
        self.showTimePicker();
    });

    var radioItems = [
        { icon: ui.radio_icon_daily, value: 'daily' },
        { icon: ui.radio_icon_weekday, value: 'weekday' },
        { icon: ui.radio_icon_weekend, value: 'weekend' }
    ];

    for (var i = 0; i < radioItems.length; i++) {
        (function(item) {
            item.icon.on('click', function() {
                if (!ui.switch_enabled.isChecked()) {
                    toast('请先启用定时');
                    return;
                }
                currentCycle = item.value;
                self.updateCycleUI(currentCycle);
            });
            item.icon.getParent().on('click', function() {
                if (!ui.switch_enabled.isChecked()) {
                    toast('请先启用定时');
                    return;
                }
                currentCycle = item.value;
                self.updateCycleUI(currentCycle);
            });
        })(radioItems[i]);
    }

    ui.btn_save.on('click', function() {
        var enabled = ui.switch_enabled.isChecked();
        var time = ui.text_time.getText().toString();

        self.uiManager.dataManager.updateTask(self.taskId, {
            schedule: {
                enabled: enabled,
                time: time,
                cycle: currentCycle
            }
        });
        toast('定时设置已保存');
        self.uiManager.showMainView();
    });
};

UISchedule.prototype.updateCycleUI = function(selectedCycle) {
    var items = [
        { icon: ui.radio_icon_daily, value: 'daily' },
        { icon: ui.radio_icon_weekday, value: 'weekday' },
        { icon: ui.radio_icon_weekend, value: 'weekend' }
    ];

    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        if (item.value === selectedCycle) {
            item.icon.setText('●');
            item.icon.setTextColor(android.graphics.Color.parseColor(C.primary));
        } else {
            item.icon.setText('○');
            item.icon.setTextColor(android.graphics.Color.parseColor(C.textHint));
        }
    }
};

UISchedule.prototype.showTimePicker = function() {
    var currentTime = ui.text_time.getText().toString();
    dialogs.rawInput('请输入执行时间（格式：HH:MM，如 09:30）', currentTime, function(input) {
        if (!input) return;
        if (/^\d{2}:\d{2}$/.test(input)) {
            var parts = input.split(':');
            var h = parseInt(parts[0]);
            var m = parseInt(parts[1]);
            if (h >= 0 && h <= 23 && m >= 0 && m <= 59) {
                ui.text_time.setText(input);
                return;
            }
        }
        toast('时间格式错误，请输入 HH:MM 格式（如 09:30）');
    });
};

module.exports = UISchedule;