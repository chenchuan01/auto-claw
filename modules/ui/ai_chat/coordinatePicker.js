/**
 * AI对话 - 坐标拾取功能
 * 处理悬浮窗拾取坐标逻辑
 */

var Config = require('../../config');

/**
 * 启动坐标拾取
 */
function startCoordinatePicker(self, callback) {
    var mgr = self.uiManager;

    if (self.isPickingCoordinate) {
        toast('坐标拾取已经在运行了');
        return;
    }

    // 保存回调
    self.pickCallback = callback;
    self.isPickingCoordinate = true;

    // 在新线程创建悬浮窗
    threads.start(function() {
        // 布局：全屏背景 + 可拖动的十字准星
        var window = floaty.window(
            '<frame id="root" bg="#00000001" w="' + device.width + 'px" h="' + device.height + 'px">' +
            '  <frame id="crosshair" w="wrap_content" h="wrap_content" ' +
            '    layout_marginLeft="' + Math.floor((device.width - 48) / 2) + 'px" ' +
            '    layout_marginTop="' + Math.floor((device.height - 48) / 2) + 'px">' +
            '    <frame w="48" h="48" gravity="center">' +
            '      <text text="" w="48" h="48" bg="#00000088" gravity="center" cornerRadius="24"/>' +
            '      <text text="" bg="#FF0000AA" h="2" w="40" gravity="center"/>' +
            '      <text text="" bg="#FF0000AA" w="2" h="40" gravity="center"/>' +
            '      <text text="" w="4" h="4" bg="#FF0000AA" gravity="center" cornerRadius="2"/>' +
            '    </frame>' +
            '    <text text="点击拾取" textSize="9sp" textColor="#FFFFFF" bg="#80000000" padding="2 1" gravity="center" cornerRadius="3" marginTop="1"/>' +
            '  </frame>' +
            '</frame>'
        );

        // 在 AutoX.js 中，XML id 直接作为 window 的属性
        var root = window.root;
        var crosshair = window.crosshair;

        // 记录准星当前位置
        var currentX = Math.floor((device.width - 48) / 2);
        var currentY = Math.floor((device.height - 48) / 2);
        var lastRawX = 0;
        var lastRawY = 0;

        console.log('[coord-picker] init currentX=' + currentX + ' currentY=' + currentY + ' screen=' + device.width + 'x' + device.height);

        // 全屏触摸监听 - 整个屏幕都可以拖动
        root.setOnTouchListener(function(view, event) {
            var action = event.getAction();
            var rawX = event.getRawX();
            var rawY = event.getRawY();

            if (action == android.view.MotionEvent.ACTION_DOWN) {
                lastRawX = rawX;
                lastRawY = rawY;
                self.dragging = false;
                console.log('[coord-picker] DOWN at ' + rawX + ',' + rawY);
                return true;
            } else if (action == android.view.MotionEvent.ACTION_MOVE) {
                var dx = rawX - lastRawX;
                var dy = rawY - lastRawY;
                if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
                    self.dragging = true;
                }
                // 更新准星位置
                currentX += dx;
                currentY += dy;
                // 限制在屏幕范围内
                currentX = Math.max(0, Math.min(currentX, device.width - 48));
                currentY = Math.max(0, Math.min(currentY, device.height - 48));
                // 设置margin来移动准星
                var lp = crosshair.getLayoutParams();
                lp.leftMargin = currentX;
                lp.topMargin = currentY;
                crosshair.setLayoutParams(lp);
                console.log('[coord-picker] MOVE to ' + currentX + ',' + currentY);
                lastRawX = rawX;
                lastRawY = rawY;
                return true;
            } else if (action == android.view.MotionEvent.ACTION_UP) {
                console.log('[coord-picker] UP dragging=' + self.dragging);
                if (!self.dragging) {
                    // 点击拾取：计算中心点坐标
                    var centerX = currentX + 24; // 24 = 48/2
                    var centerY = currentY + 24;
                    console.log('[coord-picker] PICK at ' + centerX + ',' + centerY);
                    // 调用回调
                    ui.run(function() {
                        self.pickCallback(centerX, centerY);
                        stopCoordinatePicker(self, window);
                    });
                }
                return true;
            }
            return false;
        });

        window.setTouchable(true);
        window.setFocusable(false);
        // 窗口固定位置，不移动，只移动准星
        window.setPosition(0, 0);
        self.coordinatePickerWindow = window;

        ui.run(function() {
            toast('按住拖动到目标位置，松开点击拾取坐标');
        });
    });
}

/**
 * 停止坐标拾取
 */
function stopCoordinatePicker(self, window) {
    if (window) {
        window.close();
    }
    if (self.coordinatePickerWindow) {
        self.coordinatePickerWindow.close();
        self.coordinatePickerWindow = null;
    }
    self.isPickingCoordinate = false;
    self.pickCallback = null;
    self.dragging = false;
    ui.run(function() {
        toast('坐标拾取已结束');
    });
}

/**
 * 插入坐标到输入框
 */
function insertCoordinateToInput(x, y, inputView, ui) {
    var screenWidth = device.width;
    var screenHeight = device.height;
    var xRatio = (x / screenWidth).toFixed(4);
    var yRatio = (y / screenHeight).toFixed(4);

    // 判断目标输入框是对话还是脚本，生成不同格式
    var insertion;
    if (inputView === ui.input_message) {
        // 对话：自然语言描述给 AI 理解
        insertion = '坐标点(' + xRatio + ', ' + yRatio + ')，也就是屏幕位置(' + x + ', ' + y + ')';
    } else {
        // 脚本：生成可执行代码
        insertion =
            'var x = parseInt(device.width * ' + xRatio + ');\n' +
            'var y = parseInt(device.height * ' + yRatio + ');\n' +
            '// 添加±2像素随机偏移增加容错\n' +
            'x = x + random(-2, 2);\n' +
            'y = y + random(-2, 2);\n' +
            'click(x, y);';
    }

    try {
        var editable = inputView.getEditableText();
        var selectionStart = inputView.getSelectionStart();
        var selectionEnd = inputView.getSelectionEnd();

        if (editable != null) {
            // 在光标位置插入
            editable.replace(selectionStart, selectionEnd, insertion);
            // 光标移到插入内容后
            inputView.setSelection(selectionStart + insertion.length);
        } else {
            // fallback: 整个替换
            var currentText = '';
            var textObj = inputView.getText();
            if (textObj) {
                currentText = textObj.toString();
            }
            var newText = currentText.substring(0, selectionStart) + insertion + currentText.substring(selectionEnd);
            inputView.setText(newText);
            inputView.setSelection(selectionStart + insertion.length);
        }

        if (inputView === ui.input_message) {
            toast('坐标已插入到对话输入框: (' + x + ', ' + y + ')');
            // 自动弹出输入法
            setTimeout(function() {
                var imm = context.getSystemService(android.view.inputmethod.InputMethodManager);
                imm.showSoftInput(inputView, 0);
            }, 200);
        } else {
            toast('坐标已插入: 相对(' + xRatio + ', ' + yRatio + ')');
            // 需要调用者更新行号
        }
    } catch(e) {
        console.error('插入坐标失败:', e);
        toast('坐标获取成功，请手动复制');
        setClip(insertion);
    }
}

module.exports = {
    startCoordinatePicker: startCoordinatePicker,
    stopCoordinatePicker: stopCoordinatePicker,
    insertCoordinateToInput: insertCoordinateToInput
};
