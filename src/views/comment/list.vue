<template>
  <div class="tab-container">
    <el-tabs v-model="activeName" style="margin-top:15px;" type="border-card">
      <el-tab-pane v-for="item in tabMapOptions" :key="item.key" :label="item.label" :name="item.key">
        <keep-alive>
          <tab-pane v-if="activeName==item.key" :status="item.key" />
        </keep-alive>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import tabPane from './components/TabPane'

export default {
  name: 'CommentList',
  components: { tabPane },
  data() {
    return {
      tabMapOptions: [
        { label: '文档', key: 'doc' },
        { label: '项目', key: 'project' }
      ],
      activeName: 'doc'
    }
  }
}
</script>

<style scoped>
  .tab-container {
    margin: 30px;
  }
</style>
