<template>
  <div>
    <el-link type="primary" @click="dialogVisible=true">{{ value.nickname }}</el-link>

    <el-dialog :visible.sync="dialogVisible" title="用户信息" width="360px">
      <el-form :model="value" label-width="80px">
        <el-form-item label="用户名">
          <div class="form-show-item">{{ value.name }}</div>
        </el-form-item>
        <el-form-item label="昵称">
          <div class="form-show-item">{{ value.nickname }}</div>
        </el-form-item>
        <el-form-item label="手机">
          <div class="form-show-item">{{ value.mobile }}</div>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'ShowUser',
  props: {
    value: {
      type: Object,
      default: function() {
        return {
          name: '',
          nickname: '',
          mobile: ''
        }
      }
    }
  },
  data() {
    return {
      dialogVisible: false
    }
  }
}
</script>
<style lang="scss" scoped>
  .form-show-item{
    text-align: left;
  }
</style>
