# SSL证书配置

## 证书文件放置说明

请将从ZeroSSL下载的证书文件按以下命名放置到此目录：

1. **private.key** - 私钥文件
2. **certificate.crt** - 证书文件  
3. **ca_bundle.crt** - CA证书链文件（可选）

## 从ZeroSSL下载的文件对应关系

ZeroSSL提供的ZIP文件通常包含：
- `private.key` → 直接使用
- `certificate.crt` → 直接使用
- `ca_bundle.crt` → 直接使用

## 文件权限设置

```bash
chmod 600 private.key
chmod 644 certificate.crt
chmod 644 ca_bundle.crt
```

## 验证证书

```bash
openssl x509 -in certificate.crt -text -noout
```

## 注意事项

- 证书有效期为90天，需要定期更新
- 私钥文件请妥善保管，不要泄露
- 证书文件存在时，服务器将自动启用HTTPS模式
- 如果证书文件不存在，服务器将以HTTP模式运行