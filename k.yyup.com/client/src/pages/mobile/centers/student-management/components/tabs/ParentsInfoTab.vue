<template>
  <div class="parents-info-tab">
    <div v-if="!student.guardian" class="empty-state">
      <van-empty description="暂无家长信息" />
    </div>

    <div v-else>
      <!-- 主要家长信息 -->
      <van-card class="parent-card">
        <template #thumb>
          <van-image
            :src="student.guardian.avatar || '/default-avatar.png'"
            width="60"
            height="60"
            round
            fit="cover"
          />
        </template>

        <template #title>
          <div class="parent-name">{{ student.guardian.name }}</div>
        </template>

        <template #desc>
          <div class="parent-relation">
            <van-tag type="primary" size="small">
              {{ getRelationshipText(student.guardian.relationship) }}
            </van-tag>
            <span class="occupation">{{ student.guardian.occupation || '未知职业' }}</span>
          </div>
        </template>

        <template #price>
          <div class="contact-info">
            <div class="contact-item">
              <van-icon name="phone-o" size="14" />
              <span>{{ student.guardian.phone || '未填写' }}</span>
              <van-button
                v-if="student.guardian.phone"
                size="mini"
                type="primary"
                @click="makePhoneCall"
              >
                拨打
              </van-button>
            </div>
            <div class="contact-item" v-if="student.guardian.email">
              <van-icon name="envelop-o" size="14" />
              <span>{{ student.guardian.email }}</span>
            </div>
          </div>
        </template>

        <template #footer>
          <div class="action-buttons">
            <van-button size="small" @click="sendMessage">发送消息</van-button>
            <van-button size="small" type="primary" @click="viewContactHistory">
              联系记录
            </van-button>
          </div>
        </template>
      </van-card>

      <!-- 紧急联系人 -->
      <van-cell-group title="紧急联系人" inset v-if="emergencyContact">
        <van-cell title="联系人" :value="emergencyContact.name" />
        <van-cell title="关系" :value="getRelationshipText(emergencyContact.relationship)" />
        <van-cell title="电话" :value="emergencyContact.phone" />
        <van-cell title="工作单位" :value="emergencyContact.workplace || '未填写'" />
      </van-cell-group>

      <!-- 家庭背景 -->
      <van-cell-group title="家庭背景" inset>
        <van-cell title="家庭住址" :value="student.householdAddress || '未填写'" />
        <van-cell title="家庭结构" :value="familyStructure" />
        <van-cell title="教育理念" :value="educationPhilosophy || '未填写'" />
      </van-cell-group>

      <!-- 沟通偏好 -->
      <van-cell-group title="沟通偏好" inset>
        <van-cell title="主要沟通方式" :value="primaryCommunicationMethod" />
        <van-cell title="沟通时间" :value="preferredCommunicationTime || '未指定'" />
        <van-cell title="语言偏好" :value="languagePreference || '中文'" />
      </van-cell-group>

      <!-- 注意事项 -->
      <van-cell-group title="注意事项" inset v-if="specialNotes">
        <van-cell>
          <template #title>
            <div class="special-notes">{{ specialNotes }}</div>
          </template>
        </van-cell>
      </van-cell-group>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { showToast, showConfirmDialog } from 'vant'
import type { Student } from '@/api/modules/student'

interface Props {
  student: Student
}

const props = defineProps<Props>()

// 紧急联系人信息（模拟数据）
const emergencyContact = ref({
  name: '张母',
  relationship: 'MOTHER',
  phone: '139****8888',
  workplace: '某科技公司'
})

const familyStructure = ref('双亲家庭，有一个哥哥')
const educationPhilosophy = ref('注重全面发展，培养创造力')
const primaryCommunicationMethod = ref('微信')
const preferredCommunicationTime = ref('工作日晚上7-9点')
const languagePreference = ref('中文')
const specialNotes = ref('孩子对海鲜过敏，请特别注意饮食')

// 工具函数
const getRelationshipText = (relationship: string) => {
  const relationshipMap: Record<string, string> = {
    FATHER: '父亲',
    MOTHER: '母亲',
    GRANDFATHER: '爷爷',
    GRANDMOTHER: '奶奶',
    MATERNAL_GRANDFATHER: '外公',
    MATERNAL_GRANDMATHER: '外婆',
    OTHER: '其他'
  }
  return relationshipMap[relationship] || relationship
}

// 事件处理
const makePhoneCall = async () => {
  if (!props.student.guardian?.phone) return

  try {
    await showConfirmDialog({
      title: '拨打电话',
      message: `确定要拨打 ${props.student.guardian.phone} 吗？`
    })

    // 在真实应用中，这里会调用系统的拨号功能
    showToast('正在拨打电话...')
    // window.location.href = `tel:${props.student.guardian.phone}`
  } catch (error) {
    // 用户取消
  }
}

const sendMessage = () => {
  showToast('打开消息界面')
  // router.push('/mobile/messages/new')
}

const viewContactHistory = () => {
  showToast('查看联系记录')
  // router.push(`/mobile/student/${props.student.id}/contact-history`)
}
</script>

<style lang="scss" scoped>
.parents-info-tab {
  padding: var(--spacing-md) 0;

  .empty-state {
    padding: 60px 0;
  }

  .parent-card {
    margin: 0 16px 16px;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

    .parent-name {
      font-size: var(--text-base);
      font-weight: 600;
      color: var(--van-text-color);
    }

    .parent-relation {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      margin-top: 8px;

      .occupation {
        font-size: var(--text-sm);
        color: var(--van-text-color-2);
      }
    }

    .contact-info {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-sm);

      .contact-item {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        font-size: var(--text-sm);
        color: var(--van-text-color-2);

        .van-button {
          margin-left: auto;
        }
      }
    }

    .action-buttons {
      display: flex;
      gap: var(--spacing-sm);

      .van-button {
        flex: 1;
      }
    }
  }

  .van-cell-group {
    margin: 0 16px 16px;
  }

  .special-notes {
    white-space: pre-wrap;
    line-height: 1.5;
    color: var(--van-text-color-2);
  }
}

:deep(.van-cell__title) {
  color: var(--van-text-color-2);
  font-weight: 400;
}

:deep(.van-cell__value) {
  color: var(--van-text-color);
  font-weight: 500;
}
</style>