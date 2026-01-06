#!/usr/bin/env python3
"""
测试Kamailio SIP服务器连接
"""

import socket
import time

# SIP服务器配置
SIP_SERVER = "47.94.82.59"
SIP_PORT = 5060
LOCAL_IP = "192.168.1.243"  # 当前服务器IP
LOCAL_PORT = 5060

# 生成SIP OPTIONS消息（用于测试服务器是否响应）
def generate_sip_options():
    call_id = f"test-{int(time.time())}"
    
    sip_message = f"""OPTIONS sip:{SIP_SERVER} SIP/2.0
Via: SIP/2.0/UDP {LOCAL_IP}:{LOCAL_PORT};branch=z9hG4bK-{call_id}
Max-Forwards: 70
From: <sip:test@{LOCAL_IP}>;tag=tag-{call_id}
To: <sip:{SIP_SERVER}>
Call-ID: {call_id}@{LOCAL_IP}
CSeq: 1 OPTIONS
Contact: <sip:test@{LOCAL_IP}:{LOCAL_PORT}>
Content-Length: 0

"""
    return sip_message.replace('\n', '\r\n')

# 生成SIP INVITE消息（用于测试呼叫）
def generate_sip_invite(phone_number):
    call_id = f"call-{int(time.time())}"
    
    sip_message = f"""INVITE sip:{phone_number}@{SIP_SERVER} SIP/2.0
Via: SIP/2.0/UDP {LOCAL_IP}:{LOCAL_PORT};branch=z9hG4bK-{call_id}
Max-Forwards: 70
From: "测试用户" <sip:test@{LOCAL_IP}>;tag=tag-{call_id}
To: <sip:{phone_number}@{SIP_SERVER}>
Call-ID: {call_id}@{LOCAL_IP}
CSeq: 100 INVITE
Contact: <sip:test@{LOCAL_IP}:{LOCAL_PORT}>
Content-Type: application/sdp
Content-Length: 0

"""
    return sip_message.replace('\n', '\r\n')

def test_sip_server():
    print("=" * 60)
    print("🧪 测试Kamailio SIP服务器")
    print("=" * 60)
    print()
    
    # 1. 测试网络连通性
    print(f"📡 1. 测试网络连通性: {SIP_SERVER}")
    try:
        import subprocess
        result = subprocess.run(['ping', '-c', '3', SIP_SERVER], 
                              capture_output=True, text=True, timeout=10)
        if result.returncode == 0:
            print("   ✅ 网络连通正常")
        else:
            print("   ❌ 网络不通")
            return
    except Exception as e:
        print(f"   ⚠️  无法测试网络: {e}")
    print()
    
    # 2. 测试UDP端口
    print(f"📡 2. 测试UDP端口: {SIP_SERVER}:{SIP_PORT}")
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        sock.settimeout(5)
        sock.bind(('', 0))  # 绑定到任意可用端口
        
        # 发送OPTIONS消息
        options_msg = generate_sip_options()
        print(f"   📤 发送SIP OPTIONS消息...")
        print(f"   消息长度: {len(options_msg)} 字节")
        
        sock.sendto(options_msg.encode(), (SIP_SERVER, SIP_PORT))
        print("   ✅ 消息已发送")
        
        # 等待响应
        print("   ⏳ 等待服务器响应（5秒超时）...")
        try:
            data, addr = sock.recvfrom(4096)
            print(f"   ✅ 收到响应！来自: {addr}")
            print(f"   响应内容:")
            print("   " + "-" * 50)
            response = data.decode('utf-8', errors='ignore')
            for line in response.split('\r\n')[:10]:  # 只显示前10行
                print(f"   {line}")
            print("   " + "-" * 50)
            print()
            print("   🎉 SIP服务器正常运行！")
            
        except socket.timeout:
            print("   ⚠️  超时：5秒内未收到响应")
            print("   可能原因:")
            print("      - SIP服务器未运行")
            print("      - 防火墙阻止UDP 5060端口")
            print("      - 服务器配置问题")
            
        sock.close()
        
    except Exception as e:
        print(f"   ❌ 测试失败: {e}")
    print()
    
    # 3. 显示配置信息
    print("📋 3. 当前配置信息:")
    print(f"   SIP服务器: {SIP_SERVER}:{SIP_PORT}")
    print(f"   本地IP: {LOCAL_IP}")
    print(f"   本地端口: {LOCAL_PORT}")
    print()
    
    # 4. 测试INVITE消息（可选）
    print("📞 4. 测试INVITE消息格式:")
    invite_msg = generate_sip_invite("18611141133")
    print("   消息内容:")
    print("   " + "-" * 50)
    for line in invite_msg.split('\r\n')[:15]:
        print(f"   {line}")
    print("   " + "-" * 50)
    print()
    
    print("=" * 60)
    print("测试完成")
    print("=" * 60)

if __name__ == "__main__":
    test_sip_server()

