/**
 * AI对话 - 坐标拾取功能
 * 处理悬浮窗拾取坐标逻辑
 */

var Config = require('../../core/config');

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
        // 全屏透明背景，不拦截触摸，只有十字准星可拖动
        var window = floaty.window(
            '<frame id="root" bg="#00000000" w="' + device.width + 'px" h="' + device.height + 'px">' +
            '  <frame id="crosshair" w="wrap_content" h="wrap_content" ' +
            '    layout_marginLeft="' + Math.floor((device.width - 64) / 2) + 'px" ' +
            '    layout_marginTop="' + Math.floor((device.height - 64) / 2) + 'px">' +
            '    <frame w="64" h="64" gravity="center">' +
            '      <!-- 透明背景，只显示十字 -->' +
            '      <text text="" w="64" h="64" bg="#00000088" gravity="center" cornerRadius="32"/>' +
            '      <text text="" bg="#FF0000" h="2" w="50" gravity="center"/>' +
            '      <text text="" bg="#FF0000" w="2" h="50" gravity="center"/>' +
            '    </frame>' +
            '  </frame>' +
            '</frame>'
        );

        // 在 AutoX.js 中，XML id 直接作为 window 的属性
        var root = window.root;
        var crosshair = window.crosshair;

        // 记录准星当前位置
        var currentX = Math.floor((device.width - 64) / 2);
        var currentY = Math.floor((device.height - 64) / 2);
        var lastRawX = 0;
        var lastRawY = 0;

        console.log('[coord-picker] init currentX=' + currentX + ' currentY=' + currentY + ' screen=' + device.width + 'x' + device.height);

        // 只让十字准星响应触摸，背景完全不拦截
        crosshair.setOnTouchListener(function(view, event) {
            var action = event.getAction();
            var rawX = event.getRawX();
            var rawY = event.getRawY();

            if (action == android.view.MotionEvent.ACTION_DOWN) {
                lastRawX = rawX;
                lastRawY = rawY;
                self.dragging = false;
                return true;
            } else if (action == android.view.MotionEvent.ACTION_MOVE) {
                var dx = rawX - lastRawX;
                var dy = rawY - lastRawY;
                if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
                    self.dragging = true;
                }
                // 更新准星位置
                currentX += dx;
                currentY += dy;
                // 限制在屏幕范围内
                currentX = Math.max(0, Math.min(currentX, device.width - 64));
                currentY = Math.max(0, Math.min(currentY, device.height - 64));
                // 设置margin来移动准星
                var lp = crosshair.getLayoutParams();
                lp.leftMargin = currentX;
                lp.topMargin = currentY;
                crosshair.setLayoutParams(lp);
                lastRawX = rawX;
                lastRawY = rawY;
                return true;
            } else if (action == android.view.MotionEvent.ACTION_UP) {
                if (!self.dragging) {
                    // 点击拾取：计算中心点坐标
                    var centerX = currentX + 32; // 32 = 64/2
                    var centerY = currentY + 32;
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

        // 关键设置：
        // 1. 窗口可触摸，但只在准星区域拦截
        // 2. 允许穿透，让下面的应用接收触摸事件
        window.setTouchable(true);
        window.setFocusable(false);
        window.setInterceptTouchEvent(false);
        // 窗口固定位置，不移动
        window.setPosition(0, 0);
        self.coordinatePickerWindow = window;

        ui.run(function() {
            toast('拖动十字准星到目标位置，点击准星完成拾取');
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
    // 容错范围：屏幕宽高的 0.8%，约 6~8px（1080p 下约 8px），不超过 10px
    var toleranceX = Math.min(10, Math.round(screenWidth * 0.008));
    var toleranceY = Math.min(10, Math.round(screenHeight * 0.008));

    // 判断目标输入框是对话还是脚本，生成不同格式
    var insertion;
    if (inputView === ui.input_message) {
        // 对话：自然语言描述给 AI 理解，包含比例和绝对坐标
        insertion = '坐标点(xRatio=' + xRatio + ', yRatio=' + yRatio + '),' +
            '当前设备绝对坐标(' + x + ', ' + y + ')，屏幕尺寸' + screenWidth + 'x' + screenHeight;
    } else {
        // 脚本：生成相对坐标点击代码，含容错偏移
        insertion =
            'var x = parseInt(device.width * ' + xRatio + ');\n' +
            'var y = parseInt(device.height * ' + yRatio + ');\n' +
            '// 随机偏移模拟真人点击，容错范围 ±' + toleranceX + 'px\n' +
            'x = x + (Math.random() > 0.5 ? 1 : -1) * parseInt(Math.random() * ' + toleranceX + ');\n' +
            'y = y + (Math.random() > 0.5 ? 1 : -1) * parseInt(Math.random() * ' + toleranceY + ');\n' +
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
            toast('坐标已插入对话框: (' + x + ', ' + y + ') → 比例(' + xRatio + ', ' + yRatio + ')');
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
