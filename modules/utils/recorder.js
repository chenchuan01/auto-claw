/**
 * 脚本录制模块
 * 监听用户点击操作，生成可执行脚本
 */

var Config = require('./config');

function Recorder(dataManager) {
    this.dataManager = dataManager;
    this.recording = false;
    this.events = [];
    this.overlayWindow = null;
    this.listener = null;
}

Recorder.prototype.start = function() {
    var self = this;
    if (this.recording) return;

    this.recording = true;
    this.events = [];

    // 显示悬浮录制状态条
    this.overlayWindow = floaty.window(
        '<frame gravity="center" bg="#CC000000" w="auto" h="auto">' +
        '  <horizontal padding="12 8" gravity="center_vertical">' +
        '    <text text="● 录制中" textSize="14sp" textColor="#FF4444" id="rec_label"/>' +
        '    <button id="btn_stop" text="停止" textSize="12sp" textColor="#FFFFFF" ' +
        '      style="Widget.AppCompat.Button.Borderless" marginLeft="8"/>' +
        '  </horizontal>' +
        '</frame>'
    );

    // 定位到屏幕顶部居中
    this.overlayWindow.setPosition(
        (device.width - 200) / 2,
        device.statusBarHeight + 8
    );

    // 绑定停止按钮
    this.overlayWindow.btn_stop.on('click', function() {
        ui.run(function() { self.stop(true); });
    });

    // 注册触摸监听
    this.listener = events.on('toast', function() {}); // 占位，实际用 gesture 监听
    events.observeToast();

    // 监听屏幕点击
    this.listener = events.on('gesture', function(gesture) {
        if (!self.recording) return;
        var points = gesture.points;
        if (!points || points.length === 0) return;
        var p = points[0];
        self.events.push({ type: 'click', x: Math.round(p.x), y: Math.round(p.y), time: Date.now() });
    });

    // 回到 Home 界面让用户操作
    home();
};

Recorder.prototype.stop = function(savePrompt) {
    if (!this.recording) return;
    this.recording = false;

    if (this.listener) {
        try { events.removeListener('gesture', this.listener); } catch (e) {}
        this.listener = null;
    }

    if (this.overlayWindow) {
        try { this.overlayWindow.close(); } catch (e) {}
        this.overlayWindow = null;
    }

    if (savePrompt) {
        this._promptSave();
    }
};

Recorder.prototype._promptSave = function() {
    var self = this;
    if (this.events.length === 0) {
        toast('未录制到任何操作');
        return;
    }

    var script = this._buildScript();

    dialogs.rawInput('保存录制脚本', '请输入任务名称：', '录制任务_' + new Date().toLocaleDateString(), function(name) {
        if (!name || !name.trim()) return;
        dialogs.rawInput('任务描述', '请输入任务描述（可选）：', '由录制生成', function(desc) {
            self.dataManager.addTask({
                name: name.trim(),
                description: desc ? desc.trim() : '由录制生成',
                script: script
            });
            toast('录制脚本已保存为任务：' + name.trim());
        });
    });
};

Recorder.prototype._buildScript = function() {
    if (this.events.length === 0) return '// 无录制操作';

    var lines = ['// 由录制生成 - ' + new Date().toLocaleString()];
    var prevTime = this.events[0].time;

    for (var i = 0; i < this.events.length; i++) {
        var e = this.events[i];
        var delay = i === 0 ? 0 : (e.time - prevTime);
        prevTime = e.time;

        if (delay > 100) {
            lines.push('sleep(' + delay + ');');
        }
        if (e.type === 'click') {
            lines.push('click(' + e.x + ', ' + e.y + ');');
        }
    }

    return lines.join('\n');
};

Recorder.prototype.isRecording = function() {
    return this.recording;
};

module.exports = Recorder;
