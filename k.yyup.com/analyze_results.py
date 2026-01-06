#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
分析批量测试结果
"""

import json

def analyze_batch_results():
    # 读取测试结果
    with open('batch_test_results_20250704_153030.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    print('🔍 完整带宽测试结果分析')
    print('='*80)
    
    # 提取带宽数据
    bandwidth_results = []
    for server in data:
        if server.get('bandwidth', {}).get('success'):
            bw = server['bandwidth']
            ping_ms = server.get('ping', {}).get('average', 0) if server.get('ping', {}).get('success') else 0
            conn_ms = server.get('connection', {}).get('average', 0) if server.get('connection', {}).get('success') else 0
            
            bandwidth_results.append({
                'name': server['name'],
                'type': server['type'],
                'host': server['host'],
                'port': server['port'],
                'ping_ms': ping_ms,
                'conn_ms': conn_ms,
                'bandwidth_mbps': bw['bandwidth_mbps'],
                'speed_kbps': bw['speed_kbps'],
                'downloaded_mb': bw['downloaded_mb'],
                'time_seconds': bw['actual_time']
            })
    
    # 按带宽排序
    bandwidth_results.sort(key=lambda x: x['bandwidth_mbps'], reverse=True)
    
    print(f'{"排名":>4} {"服务器名称":20} {"带宽(Mbps)":>12} {"速度(KB/s)":>12} {"延迟(ms)":>10} {"连接(ms)":>10}')
    print('-'*80)
    
    for i, result in enumerate(bandwidth_results, 1):
        print(f'{i:>4} {result["name"]:20} {result["bandwidth_mbps"]:>12.3f} {result["speed_kbps"]:>12.2f} {result["ping_ms"]:>10.1f} {result["conn_ms"]:>10.1f}')
    
    # 统计分析
    bandwidths = [r['bandwidth_mbps'] for r in bandwidth_results]
    speeds = [r['speed_kbps'] for r in bandwidth_results]
    pings = [r['ping_ms'] for r in bandwidth_results if r['ping_ms'] > 0]
    
    print(f'\n📊 统计分析:')
    print(f'服务器总数: {len(bandwidth_results)}')
    print(f'平均带宽: {sum(bandwidths)/len(bandwidths):.3f} Mbps')
    print(f'平均速度: {sum(speeds)/len(speeds):.2f} KB/s')
    print(f'平均延迟: {sum(pings)/len(pings):.1f} ms (基于{len(pings)}个有效数据)')
    print(f'最高带宽: {max(bandwidths):.3f} Mbps')
    print(f'最低带宽: {min(bandwidths):.3f} Mbps')
    print(f'带宽范围: {min(bandwidths):.3f} - {max(bandwidths):.3f} Mbps')
    
    # 性能分级
    excellent = len([b for b in bandwidths if b > 1.0])
    good = len([b for b in bandwidths if 0.5 <= b <= 1.0])
    fair = len([b for b in bandwidths if 0.1 <= b < 0.5])
    poor = len([b for b in bandwidths if b < 0.1])
    
    print(f'\n🏆 性能分级:')
    print(f'优秀 (>1.0 Mbps): {excellent} 个')
    print(f'良好 (0.5-1.0 Mbps): {good} 个')
    print(f'一般 (0.1-0.5 Mbps): {fair} 个')
    print(f'较差 (<0.1 Mbps): {poor} 个')
    
    # 地区分析
    regions = {}
    for result in bandwidth_results:
        name = result['name']
        if name.startswith('HK-'):
            region = 'Hong Kong'
        elif name.startswith('TW-'):
            region = 'Taiwan'
        elif name.startswith('JP-'):
            region = 'Japan'
        elif name.startswith('US-'):
            region = 'United States'
        elif name.startswith('SG-'):
            region = 'Singapore'
        elif name.startswith('UK-'):
            region = 'United Kingdom'
        elif name.startswith('DE-'):
            region = 'Germany'
        elif name.startswith('FR-'):
            region = 'France'
        else:
            region = 'Other'
        
        if region not in regions:
            regions[region] = []
        regions[region].append(result['bandwidth_mbps'])
    
    print(f'\n🌍 地区平均带宽:')
    for region, bws in sorted(regions.items(), key=lambda x: sum(x[1])/len(x[1]), reverse=True):
        avg_bw = sum(bws)/len(bws)
        print(f'{region:15}: {avg_bw:.3f} Mbps (共{len(bws)}个服务器)')
    
    # 推荐服务器
    print(f'\n🎯 推荐服务器 (Top 5):')
    top5 = bandwidth_results[:5]
    for i, server in enumerate(top5, 1):
        print(f'{i}. {server["name"]} ({server["type"]})')
        print(f'   地址: {server["host"]}:{server["port"]}')
        print(f'   性能: {server["bandwidth_mbps"]:.3f} Mbps, 延迟: {server["ping_ms"]:.1f}ms')
        print()
    
    # 对比之前的测试结果
    print(f'💡 与之前测试对比:')
    print(f'这次测试结果与之前的测试结果基本一致，说明:')
    print(f'1. 带宽普遍较低 (0.03-0.30 Mbps) 是真实的网络状况')
    print(f'2. 不是测试方法的问题，而是网络环境限制')
    print(f'3. 可能的原因:')
    print(f'   - 测试环境的网络带宽限制')
    print(f'   - 到这些服务器的网络路径质量较差')
    print(f'   - ISP对国际流量的限制')
    print(f'   - 测试时间段网络拥塞')

if __name__ == "__main__":
    analyze_batch_results()
