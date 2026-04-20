#!/bin/bash
# 批量修复Emoji符号

echo "修复Emoji符号..."

# 修复ui_market_view.js
sed -i 's/text="↻"/text="R"/g' modules/ui_market_view.js

# 修复ui_task_detail.js
sed -i 's/text="▶ 执行任务"/text="> 执行任务"/g' modules/ui_task_detail.js
sed -i 's/text="☰ 查看日志"/text="= 查看日志"/g' modules/ui_task_detail.js
sed -i 's/text="✕ 删除任务"/text="[-] 删除任务"/g' modules/ui_task_detail.js
sed -i "s/setText('▶ 执行任务')/setText('> 执行任务')/g" modules/ui_task_detail.js

# 修复ui_script_editor.js
sed -i 's/text="☰ 片段"/text="= 片段"/g' modules/ui_script_editor.js
sed -i 's/text="↻ 重置"/text="R 重置"/g' modules/ui_script_editor.js
sed -i 's/text="☰ 任务信息"/text="= 任务信息"/g' modules/ui_script_editor.js
sed -i 's/text="▶ 执行任务"/text="> 执行任务"/g' modules/ui_script_editor.js
sed -i 's/text="☰ 查看日志"/text="= 查看日志"/g' modules/ui_script_editor.js
sed -i 's/text="✕ 删除任务"/text="[-] 删除任务"/g' modules/ui_script_editor.js

echo "修复完成!"