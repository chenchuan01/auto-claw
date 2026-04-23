/**
 * AI对话 - 消息渲染模块
 * 处理消息解析和UI渲染
 */

var Config = require('../../core/config');
var BubbleConfig = require('./bubbleConfig');
var CodeHighlighter = require('../../utils/code_highlighter');
var C = Config.colors;
var I = Config.icons;
var BC = BubbleConfig.MESSAGE_BUBBLE_CONFIG;

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
            var bubbleStyle = isUser ? BC.userBubble : BC.aiBubble;
            var bgColor = bubbleStyle.bgColor;
            var textColor = bubbleStyle.textColor;
            var alignment = bubbleStyle.alignment;

            // 创建外层容器（用于消息间隔）
            var outerContainer = ui.inflate(
                '<vertical>' +
                '  <horizontal id="message_wrapper" gravity="' + alignment + '" marginLeft="' + BC.bubbleMarginLeft + '" marginRight="' + BC.bubbleMarginRight + '">' +
                '    <vertical id="content_container" bg="' + bgColor + '" cornerRadius="' + BC.bubbleRadius + '" padding="' + BC.bubblePadding + '" w="' + BC.bubbleWidth + '">' +
                '    </vertical>' +
                '  </horizontal>' +
                '  <View h="' + BC.bubbleMarginBottom + '"/>' +
                '</vertical>'
            );

            var messageWrapper = outerContainer.message_wrapper;
            var contentContainer = messageWrapper.content_container;
            var blocks = parseMarkdownBlocks(msg.content);

            // 用户消息和 AI 消息都支持 Markdown 渲染
            blocks.forEach(function(block) {
                if (block.type === 'text') {
                    if (!block.content.trim()) return;
                    var textView = ui.inflate(
                        '<text textSize="' + BC.textSize + '" textColor="' + textColor + '" lineSpacingExtra="' + BC.lineSpacing + '" textIsSelectable="true" gravity="' + BC.textGravity + '"/>'
                    );
                    self.markdownRenderer.render(textView, block.content, textColor);
                    contentContainer.addView(textView);
                } else if (block.type === 'code') {
                    var lineCount = block.content.split('\n').length;
                    // 根据消息角色选择代码块配色
                    var codeBg, codeHeaderBg, codeFg;
                    if (isUser) {
                        // 用户气泡（蓝色背景）使用深色代码块
                        codeBg = '#1E3A5F';
                        codeHeaderBg = '#2D4A73';
                        codeFg = '#E6F0FF';
                    } else {
                        // AI气泡（浅色背景）使用浅色代码块
                        codeBg = '#F0F4F8';
                        codeHeaderBg = '#E2E8F0';
                        codeFg = '#1A1A2E';
                    }
                    var codeBlock = ui.inflate(
                        '<vertical>' +
                        '  <horizontal id="code_header" bg="' + codeHeaderBg + '" cornerRadius="8" padding="8 10" gravity="center_vertical" marginTop="6" marginBottom="0">' +
                        '    <text id="code_title" text="' + I.code + ' 代码 (' + lineCount + ' 行)" textSize="13sp" textColor="' + codeFg + '" layout_weight="1"/>' +
                        '    <text id="code_toggle" text="' + I.arrowLeft + '" textSize="16sp" textColor="' + codeFg + '"/>' +
                        '  </horizontal>' +
                        '  <vertical id="code_content" bg="' + codeBg + '" cornerRadius="0 0 8 8" padding="12 10" visibility="gone">' +
                        '    <text id="code_text" textSize="12sp" textColor="' + codeFg + '" textIsSelectable="true" gravity="left"/>' +
                        '  </vertical>' +
                        '</vertical>'
                    );

                    // 使用语法高亮渲染代码
                    var highlighter = new CodeHighlighter();
                    highlighter.highlight(codeBlock.code_text, block.content, block.language, isUser);

                    // 默认收起，减少对话篇幅
                    var expanded = false;
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

            container.addView(outerContainer);
        });

        // 滚动到底部
        ui.post(function() {
            var scrollView = ui.message_scroll;
            if (scrollView) {
                scrollView.fullScroll(android.widget.ScrollView.FOCUS_DOWN);
            }
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
