@echo off
REM 代理环境变量设置脚本
REM 用于在启动项目时设置代理配置

echo 🔧 设置代理环境变量...

REM 设置HTTP代理
set "HTTP_PROXY=http://127.0.0.1:10809"
set "HTTPS_PROXY=http://127.0.0.1:10809"

REM 设置npm代理
set "npm_config_proxy=http://127.0.0.1:10809"
set "npm_config_https_proxy=http://127.0.0.1:10809"

REM 设置Git代理
set "GIT_HTTP_PROXY=http://127.0.0.1:10809"
set "GIT_HTTPS_PROXY=http://127.0.0.1:10809"

REM 设置Node.js代理
set "NODE_TLS_REJECT_UNAUTHORIZED=0"

REM 设置不使用代理的地址
set "NO_PROXY=localhost,127.0.0.1,::1,k.yyup.cc,sealoshzh.site"
set "npm_config_noproxy=localhost,127.0.0.1,::1,k.yyup.cc,sealoshzh.site"

echo ✅ 代理环境变量设置完成
echo 📋 当前代理配置:
echo    HTTP_PROXY=%HTTP_PROXY%
echo    HTTPS_PROXY=%HTTPS_PROXY%
echo    NO_PROXY=%NO_PROXY%
echo.
