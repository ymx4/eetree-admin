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
import tabPane from './components/TrialReviewTab'

export default {
  name: 'GoodsTrialReview',
  components: { tabPane },
  data() {
    return {
      tabMapOptions: [
        { label: '待审核', key: 'review' },
        { label: '已拒绝', key: 'refuse' }
      ],
      activeName: 'review'
    }
  }
}
</script>

<style scoped>
  .tab-container {
    margin: 30px;
  }
</style>
