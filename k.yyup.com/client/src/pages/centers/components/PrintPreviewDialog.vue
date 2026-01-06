<template>
  <el-dialog
    v-model="dialogVisible"
    :title="title"
    width="1000px"
    :close-on-click-modal="false"
    @close="handleClose"
    class="print-preview-dialog"
  >
    <!-- 打印预览区域 -->
    <div class="print-preview-container" ref="printContentRef">
      <div class="print-content" :class="{ 'preview-mode': !isPrinting }">
        <slot></slot>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handlePrint" :loading="printing">
          <UnifiedIcon name="default" />
          打印
        </el-button>
        <el-button type="success" @click="handleExportPDF" :loading="exporting">
          <UnifiedIcon name="Download" />
          导出PDF
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { Printer, Download } from '@element-plus/icons-vue';

interface Props {
  visible: boolean;
  title?: string;
  filename?: string;
}

interface Emits {
  (e: 'update:visible', value: boolean): void;
}

const props = withDefaults(defineProps<Props>(), {
  title: '打印预览',
  filename: 'document'
});

const emit = defineEmits<Emits>();

const dialogVisible = ref(false);
const printContentRef = ref<HTMLElement>();
const printing = ref(false);
const exporting = ref(false);
const isPrinting = ref(false);

watch(() => props.visible, (val) => {
  dialogVisible.value = val;
});

watch(dialogVisible, (val) => {
  emit('update:visible', val);
});

// 打印功能
const handlePrint = () => {
  if (!printContentRef.value) return;

  printing.value = true;
  isPrinting.value = true;

  // 延迟打印，确保样式应用
  setTimeout(() => {
    try {
      // 保存当前页面内容
      const originalContent = document.body.innerHTML;
      const printContent = printContentRef.value?.innerHTML || '';

      // 替换body内容为打印内容
      document.body.innerHTML = `
        <div class="print-wrapper">
          ${printContent}
        </div>
      `;

      // 触发打印
      window.print();

      // 恢复原内容
      document.body.innerHTML = originalContent;
      
      // 重新初始化Vue（因为innerHTML被替换了）
      window.location.reload();
    } catch (error) {
      console.error('打印失败:', error);
      ElMessage.error('打印失败，请重试');
    } finally {
      printing.value = false;
      isPrinting.value = false;
    }
  }, 100);
};

// 导出PDF功能
const handleExportPDF = async () => {
  if (!printContentRef.value) return;

  exporting.value = true;

  try {
    // 动态加载html2pdf库
    const html2pdf = (await import('html2pdf.js')).default;

    const element = printContentRef.value;
    const opt = {
      margin: [10, 10, 10, 10],
      filename: `${props.filename}_${new Date().toISOString().split('T')[0]}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        letterRendering: true
      },
      jsPDF: {
        unit: 'mm',
        format: 'a4',
        orientation: 'portrait'
      }
    };

    await html2pdf().set(opt).from(element).save();
    ElMessage.success('PDF导出成功');
  } catch (error) {
    console.error('导出PDF失败:', error);
    ElMessage.error('导出PDF失败，请确保已安装html2pdf.js库');
  } finally {
    exporting.value = false;
  }
};

const handleClose = () => {
  dialogVisible.value = false;
};
</script>

<style scoped lang="scss">
.print-preview-dialog {
  :deep(.el-dialog__body) {
    padding: var(--text-2xl);
    background: var(--bg-secondary);
  }
}

.print-preview-container {
  background: white;
  box-shadow: 0 2px var(--text-sm) var(--shadow-light);
  border-radius: var(--spacing-xs);
  overflow: auto;
  max-height: 70vh;
}

.print-content {
  background: white;
  padding: var(--spacing-10xl);
  min-min-height: 60px; height: auto;

  &.preview-mode {
    // 预览模式样式
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--text-sm);
}
</style>

<!-- 打印样式 -->
<style lang="scss">
@media print {
  body * {
    visibility: hidden;
  }

  .print-wrapper,
  .print-wrapper * {
    visibility: visible;
  }

  .print-wrapper {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
  }

  // 隐藏不需要打印的元素
  .no-print,
  .el-dialog__header,
  .el-dialog__footer,
  button,
  .el-button {
    display: none !important;
  }

  // 打印样式优化
  .print-content {
    padding: 20mm;
    font-size: 12pt;
    line-height: 1.6;
    color: #000;
  }

  // 强制分页
  .page-break {
    page-break-after: always;
  }

  // 避免分页时切断内容
  .avoid-break {
    page-break-inside: avoid;
  }

  // 打印时的表格样式
  table {
    width: 100%;
    border-collapse: collapse;
    
    th, td {
      border: var(--border-width-base) solid #000;
      padding: var(--spacing-sm);
      text-align: left;
    }

    th {
      background-color: var(--bg-gray-light);
      font-weight: bold;
    }
  }
}
</style>

