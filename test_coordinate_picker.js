/**
 * 坐标拾取器 - 独立测试文件
 * 直接运行这个文件测试悬浮窗和坐标拾取功能
 */

"ui";

console.show();

// 测试坐标拾取
function startCoordinatePicker() {
    var lastX, lastY;
    var dragging = false;

    if (!floaty.checkPermission()) {
        toast('请求悬浮窗权限');
        floaty.requestPermission(function(granted) {
            if (granted) {
                doStart();
            } else {
                toast('需要悬浮窗权限');
            }
        });
        return;
    }

    doStart();

    function doStart() {
        threads.start(function() {
            // 使用最简单的布局，直接用一个TextView作为背景
            var window = floaty.window(
                '<vertical bg="#40000000" padding="10" w="140" h="160">' +
                '  <text text="📌\n点击\n拾取" textSize="18sp" textColor="#FF0000" gravity="center" w="120" h="120" gravity="center" cornerRadius="60" bg="#80000000"/>' +
                '</vertical>'
            );

            console.log('窗口创建了');
            console.log('window.getX() = ' + window.getX());

            // 获取容器
            var container = window.getRootView().getChildAt(0);

            container.setOnTouchListener(function(view, event) {
                var action = event.getAction();
                if (action == android.view.MotionEvent.ACTION_DOWN) {
                    lastX = event.getRawX();
                    lastY = event.getRawY();
                    dragging = false;
                    return true;
                } else if (action == android.view.MotionEvent.ACTION_MOVE) {
                    var dx = event.getRawX() - lastX;
                    var dy = event.getRawY() - lastY;
                    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
                        dragging = true;
                    }
                    window.setPosition(
                        window.getX() + dx,
                        window.getY() + dy
                    );
                    lastX = event.getRawX();
                    lastY = event.getRawY();
                    return true;
                } else if (action == android.view.MotionEvent.ACTION_UP) {
                    if (!dragging) {
                        pickCoordinate(window);
                    }
                    return true;
                }
                return false;
            });

            window.setTouchable(true);
            window.setFocusable(false);

            toast('悬浮窗已显示，拖动圆形点击获取坐标');
        });
    }

    function pickCoordinate(window) {
        var windowX = window.getX();
        var windowY = window.getY();
        var windowWidth = window.getWidth();
        var windowHeight = window.getHeight();

        var x = Math.round(windowX + windowWidth / 2);
        var y = Math.round(windowY + windowHeight / 2);

        console.log('Picked: x=' + x + ', y=' + y);

        ui.run(function() {
            resultText.setText('✓ 拾取成功\n坐标: click(' + x + ', ' + y + ');\n已复制到剪贴板');
            setClip('click(' + x + ', ' + y + ');');
            toast('坐标已复制: ' + x + ', ' + y);
            window.close();
        });
    }
}

// UI
ui.layout(
    '<vertical padding="16" gravity="center">' +
    '  <text text="坐标拾取器测试" textSize="24sp" gravity="center" marginBottom="32"/>' +
    '  <button id="btn_start" text="启动坐标拾取" w="*" h="50" marginBottom="16"/>' +
    '  <text id="resultText" text="等待拾取..." textSize="16sp" gravity="center" padding="16" bg="#f0f0f0" w="*"/>' +
    '</vertical>'
);

ui.btn_start.on('click', function() {
    startCoordinatePicker();
});
