/**
 * 测试 AI 对话发送功能
 */

"ui";

var Config = require('./modules/config');
var C = Config.colors;
var I = Config.icons;

ui.layout(
    '<vertical bg="' + C.bg + '">' +
    '  <horizontal bg="' + C.primary + '" padding="20 16">' +
    '    <text text="测试 AI 对话" textSize="22sp" textColor="#FFFFFF" textStyle="bold"/>' +
    '  </horizontal>' +
    '  <scroll layout_weight="1">' +
    '    <vertical id="message_container" padding="16"></vertical>' +
    '  </scroll>' +
    '  <horizontal bg="' + C.card + '" padding="12 16" gravity="center_vertical">' +
    '    <input id="input_message" hint="输入消息..." textSize="15sp" bg="' + C.surface + '" padding="12 16" cornerRadius="20" layout_weight="1"/>' +
    '    <text id="btn_send" text="' + I.upload + '" textSize="24sp" textColor="' + C.primary + '" padding="12" marginLeft="8"/>' +
    '  </horizontal>' +
    '</vertical>'
);

ui.btn_send.on('click', function() {
    var msg = ui.input_message.getText().toString().trim();
    console.log('发送按钮点击，消息内容:', msg);

    if (!msg) {
        toast('请输入消息');
        return;
    }

    toast('消息: ' + msg);
    ui.input_message.setText('');

    // 添加到界面
    var msgView = ui.inflate(
        '<text text="' + msg + '" textSize="14sp" bg="' + C.primary + '" textColor="#FFFFFF" padding="12 16" cornerRadius="16" marginBottom="8"/>'
    );
    ui.message_container.addView(msgView);
});

console.log('测试页面已加载');
