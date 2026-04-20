/**
 * AI对话 - 消息渲染模块
 * 处理消息解析和UI渲染
 */

var Config = require('../../config');
var C = Config.colors;
var I = Config.icons;

/**
 * 解析 Markdown 分块，区分文本段落和代码块
 */
function parseMarkdownBlocks(markdown) {
    var lines = markdown.split('\n');
    var blocks = [];
    var currentText = [];
    var inCode = false;
    var currentCode = [];
    var currentLang = '';

    for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        var trimmed = line.trim();

        if (trimmed.startsWith('```')) {
            if (inCode) {
                // 结束代码块
                blocks.push({
                    type: 'code',
                    language: currentLang,
                    content: currentCode.join('\n')
                });
                currentCode = [];
                currentLang = '';
                inCode = false;
            } else {
                // 开始新代码块
                if (currentText.length > 0) {
                    blocks.push({
                        type: 'text',
                        content: currentText.join('\n')
                    });
                    currentText = [];
                }
                currentLang = trimmed.slice(3).trim();
                inCode = true;
            }
            continue;
        }

        if (inCode) {
            currentCode.push(line);
        } else {
            currentText.push(line);
        }
    }

    // 处理剩余文本
    if (currentText.length > 0) {
        blocks.push({
            type: 'text',
            content: currentText.join('\n')
        });
    }

    return blocks;
}

/**
 * 渲染所有消息到容器
 */
function renderMessages(self) {
    var container = ui.message_container;
    var C = Config.colors;

    ui.run(function() {
        container.removeAllViews();

        self.messages.forEach(function(msg) {
            var isUser = msg.role === 'user';
            var bgColor = isUser ? C.primary : C.card;
            var textColor = isUser ? '#FFFFFF' : C.textPrimary;
            var alignment = isUser ? 'right' : 'left';
            var marginLeft = isUser ? '60' : '0';
            var marginRight = isUser ? '0' : '60';

            // 创建消息容器
            var messageContainer = ui.inflate(
                '<horizontal gravity="' + alignment + '" marginBottom="28">' +
                '  <vertical id="content_container" bg="' + bgColor + '" cornerRadius="16" padding="12 16" marginLeft="' + marginLeft + '" marginRight="' + marginRight + '" maxWidth="*">' +
                '  </vertical>' +
                '</horizontal>'
            );

            var contentContainer = messageContainer.content_container;
            var blocks = parseMarkdownBlocks(msg.content);

            // 用户消息：整个放在一个 TextView（不需要折叠）
            if (isUser) {
                var textView = ui.inflate(
                    '<text id="msg_text" textSize="14sp" textColor="' + textColor + '" lineSpacingExtra="4" textIsSelectable="true"/>'
                );
                textView.setText(msg.content);
                contentContainer.addView(textView);
                container.addView(messageContainer);
                return;
            }

            // AI 消息：分段渲染，代码块可折叠
            blocks.forEach(function(block) {
                if (block.type === 'text') {
                    if (!block.content.trim()) return;
                    var textView = ui.inflate(
                        '<text textSize="14sp" textColor="' + textColor + '" lineSpacingExtra="4" textIsSelectable="true"/>'
                    );
                    self.markdownRenderer.render(textView, block.content, textColor);
                    contentContainer.addView(textView);
                } else if (block.type === 'code') {
                    var lineCount = block.content.split('\n').length;
                    var codeBlock = ui.inflate(
                        '<vertical>' +
                        '  <horizontal id="code_header" bg="' + C.surface + '" cornerRadius="8" padding="8 10" gravity="center_vertical" marginTop="6" marginBottom="4">' +
                        '    <text id="code_title" text="' + I.code + ' 代码 (' + lineCount + ' 行)" textSize="13sp" textColor="' + C.textPrimary + '" layout_weight="1"/>' +
                        '    <text id="code_toggle" text="' + I.arrowDown + '" textSize="16sp" textColor="' + C.textSecondary + '"/>' +
                        '  </horizontal>' +
                        '  <vertical id="code_content" bg="' + C.surface + '" cornerRadius="8" padding="10" visibility="visible">' +
                        '    <text id="code_text" textSize="12sp" textColor="' + C.textPrimary + '" textIsSelectable="true"/>' +
                        '  </vertical>' +
                        '</vertical>'
                    );
                    codeBlock.code_text.setText(block.content);
                    // 默认展开
                    var expanded = true;
                    codeBlock.code_header.on('click', function() {
                        expanded = !expanded;
                        if (expanded) {
                            codeBlock.code_content.attr('visibility', 'visible');
                            codeBlock.code_toggle.setText(I.arrowDown);
                        } else {
                            codeBlock.code_content.attr('visibility', 'gone');
                            codeBlock.code_toggle.setText(I.arrowLeft);
                        }
                        // 应用字体到图标
                        self.uiManager.fontManager.apply(codeBlock.code_toggle, codeBlock.code_title);
                    });
                    // 应用字体
                    self.uiManager.fontManager.apply(codeBlock.code_toggle, codeBlock.code_title);
                    contentContainer.addView(codeBlock);
                }
            });

            container.addView(messageContainer);
        });

        // 滚动到底部
        ui.post(function() {
            ui.message_scroll.fullScroll(android.widget.ScrollView.FOCUS_DOWN);
        }, 100);
    });
}

/**
 * 添加欢迎消息
 */
function addWelcomeMessage(self) {
    var welcomeText = '你好！我是 AutoX.js 开发助手。\n\n' +
        '我会通过对话逐步帮你生成自动化脚本：\n' +
        '1️⃣ 告诉我你想自动化什么任务\n' +
        '2️⃣ 我会询问具体细节\n' +
        '3️⃣ 生成初步脚本代码\n' +
        '4️⃣ 根据你的反馈优化\n' +
        '5️⃣ 完成后可保存为本地任务\n\n' +
        '请告诉我，你想做什么自动化任务？';

    self.addMessage('assistant', welcomeText);
}

module.exports = {
    parseMarkdownBlocks: parseMarkdownBlocks,
    renderMessages: renderMessages,
    addWelcomeMessage: addWelcomeMessage
};
