#!/usr/bin/env python3
import socket
import time

# 创建UDP socket
sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)

# 绑定到本地地址（重要！）
local_ip = '192.168.1.243'
local_port = 5060

try:
    sock.bind((local_ip, local_port))
    print(f"✅ Socket已绑定到 {local_ip}:{local_port}\n")
except Exception as e:
    print(f"❌ 绑定失败: {e}")
    print("   尝试使用随机端口...\n")
    local_port = 0
    sock.bind((local_ip, local_port))
    local_port = sock.getsockname()[1]
    print(f"✅ Socket已绑定到 {local_ip}:{local_port}\n")

# Kamailio服务器信息
server_ip = '47.94.82.59'
server_port = 5060

# 简单的SIP INVITE消息来测试拨打18611141133
sip_invite = f"""INVITE sip:18611141133@{server_ip} SIP/2.0
Via: SIP/2.0/UDP {local_ip}:{local_port};branch=z9hG4bK-test123
Max-Forwards: 70
From: "Test Caller" <sip:test@{local_ip}>;tag=test456
To: <sip:18611141133@{server_ip}>
Call-ID: test-call-18611141133-{int(time.time())}@{local_ip}
CSeq: 100 INVITE
Contact: <sip:test@{local_ip}:{local_port}>
Content-Type: application/sdp
Content-Length: 0

"""

print(f"Sending INVITE for 18611141133 to {server_ip}:{server_port}")
print("Message:")
print(sip_invite)

# 发送消息
sock.sendto(sip_invite.encode(), (server_ip, server_port))

# 等待多个响应
print("\nWaiting for responses (30 seconds)...\n")
sock.settimeout(2.0)  # 每次等待2秒

response_count = 0
start_time = time.time()

while time.time() - start_time < 30:  # 总共等待30秒
    try:
        data, addr = sock.recvfrom(2048)
        response_count += 1
        print(f"📥 Response #{response_count} from {addr}:")
        print(data.decode())
        print("-" * 60)
    except socket.timeout:
        continue
    except Exception as e:
        print(f"Error receiving: {e}")
        break

if response_count == 0:
    print("❌ No response received within 30 seconds")
else:
    print(f"\n✅ Received {response_count} response(s)")

sock.close()

