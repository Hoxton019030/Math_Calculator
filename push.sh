#!/bin/bash

# 執行 build
npm run build

# 加入變更
git add .

# 使用日期當作 commit message
message=$(date "+%Y-%m-%d commit")

# 提交 commit
git commit -m "$message"

git push
