#!/bin/bash

# 中国路由代理绕过配置脚本
# 用于配置代理环境变量，让中国域名和IP段不使用代理

echo "🇨🇳 配置中国路由代理绕过..."

# 中国顶级域名
CHINA_DOMAINS="*.cn,*.com.cn,*.net.cn,*.org.cn,*.gov.cn,*.edu.cn,*.mil.cn,*.ac.cn"
CHINA_DOMAINS="$CHINA_DOMAINS,*.中国,*.公司,*.网络"

# 知名中国服务域名
CHINA_SERVICES="*.baidu.com,*.qq.com,*.weixin.qq.com,*.tencent.com,*.taobao.com,*.tmall.com"
CHINA_SERVICES="$CHINA_SERVICES,*.alipay.com,*.alibaba.com,*.aliyun.com,*.alicdn.com"
CHINA_SERVICES="$CHINA_SERVICES,*.weibo.com,*.sina.com,*.sohu.com,*.163.com,*.126.com"
CHINA_SERVICES="$CHINA_SERVICES,*.netease.com,*.bilibili.com,*.douyin.com,*.bytedance.com"
CHINA_SERVICES="$CHINA_SERVICES,*.xiaomi.com,*.huawei.com,*.oppo.com,*.vivo.com"
CHINA_SERVICES="$CHINA_SERVICES,*.jd.com,*.pinduoduo.com,*.meituan.com,*.dianping.com"
CHINA_SERVICES="$CHINA_SERVICES,*.ctrip.com,*.qunar.com,*.360.cn,*.sogou.com"

# 特殊需要绕过的域名（包括您的AI服务）
SPECIAL_DOMAINS="*.sealos.run,aiproxy.hzh.sealos.run"

# 本地地址
LOCAL_ADDRESSES="localhost,127.0.0.1,::1,0.0.0.0"

# 中国主要IP段（部分重要的）
CHINA_IP_RANGES="10.0.0.0/8,172.16.0.0/12,192.168.0.0/16"
CHINA_IP_RANGES="$CHINA_IP_RANGES,1.0.0.0/8,14.0.0.0/8,27.0.0.0/8,36.0.0.0/8"
CHINA_IP_RANGES="$CHINA_IP_RANGES,39.0.0.0/8,42.0.0.0/8,49.0.0.0/8,58.0.0.0/8"
CHINA_IP_RANGES="$CHINA_IP_RANGES,59.0.0.0/8,60.0.0.0/8,61.0.0.0/8,101.0.0.0/8"
CHINA_IP_RANGES="$CHINA_IP_RANGES,103.0.0.0/8,106.0.0.0/8,110.0.0.0/8,111.0.0.0/8"
CHINA_IP_RANGES="$CHINA_IP_RANGES,112.0.0.0/8,113.0.0.0/8,114.0.0.0/8,115.0.0.0/8"
CHINA_IP_RANGES="$CHINA_IP_RANGES,116.0.0.0/8,117.0.0.0/8,118.0.0.0/8,119.0.0.0/8"
CHINA_IP_RANGES="$CHINA_IP_RANGES,120.0.0.0/8,121.0.0.0/8,122.0.0.0/8,123.0.0.0/8"
CHINA_IP_RANGES="$CHINA_IP_RANGES,124.0.0.0/8,125.0.0.0/8,140.0.0.0/8,144.0.0.0/8"
CHINA_IP_RANGES="$CHINA_IP_RANGES,150.0.0.0/8,153.0.0.0/8,171.0.0.0/8,175.0.0.0/8"
CHINA_IP_RANGES="$CHINA_IP_RANGES,180.0.0.0/8,182.0.0.0/8,183.0.0.0/8,202.0.0.0/8"
CHINA_IP_RANGES="$CHINA_IP_RANGES,203.0.0.0/8,210.0.0.0/8,211.0.0.0/8,218.0.0.0/8"
CHINA_IP_RANGES="$CHINA_IP_RANGES,219.0.0.0/8,220.0.0.0/8,221.0.0.0/8,222.0.0.0/8"
CHINA_IP_RANGES="$CHINA_IP_RANGES,223.0.0.0/8"

# 合并所有配置
NO_PROXY_CONFIG="$LOCAL_ADDRESSES,$CHINA_DOMAINS,$CHINA_SERVICES,$SPECIAL_DOMAINS,$CHINA_IP_RANGES"

echo "📝 生成的NO_PROXY配置："
echo "$NO_PROXY_CONFIG"

echo ""
echo "🔧 应用配置..."
export NO_PROXY="$NO_PROXY_CONFIG"
export no_proxy="$NO_PROXY_CONFIG"

echo "✅ 配置完成！"
echo ""
echo "📋 如需永久配置，请将以下内容添加到 ~/.bashrc 或 ~/.profile："
echo "export NO_PROXY='$NO_PROXY_CONFIG'"
echo "export no_proxy='$NO_PROXY_CONFIG'"
echo ""
echo "🧪 测试配置是否生效："
echo "echo \$NO_PROXY"

# 保存到环境配置文件
ENV_FILE="/home/devbox/.china-proxy-bypass"
echo "export NO_PROXY='$NO_PROXY_CONFIG'" > "$ENV_FILE"
echo "export no_proxy='$NO_PROXY_CONFIG'" >> "$ENV_FILE"
echo "📁 配置已保存到: $ENV_FILE"
echo "💡 可以使用 source $ENV_FILE 来加载配置"