<template>
  <div class="app-container">
    <el-button type="primary" @click="handleAddPlatform">
      添加平台
    </el-button>

    <el-table v-loading="listLoading" :data="list" style="width: 100%;margin-top:30px;" border>
      <el-table-column align="center" label="名称">
        <template slot-scope="scope">
          {{ scope.row.name }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="排序">
        <template slot-scope="scope">
          {{ scope.row.order }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作">
        <template slot-scope="scope">
          <el-button type="primary" size="small" @click="handleEdit(scope)">
            编辑
          </el-button>
          <el-button type="danger" size="small" @click="handleDelete(scope)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog :visible.sync="dialogVisible" :title="dialogType==='edit'?'编辑':'添加'">
      <el-form :model="platform" label-width="160px" label-position="left">
        <el-form-item label="名称">
          <el-input v-model="platform.name" placeholder="名称" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input v-model="platform.order" placeholder="排序" />
        </el-form-item>
      </el-form>
      <div style="text-align:right;">
        <el-button type="danger" @click="dialogVisible=false">
          取消
        </el-button>
        <el-button type="primary" @click="confirmSubmit">
          提交
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { deepClone } from '@/utils'
import { getPlatforms, addPlatform, deletePlatform, updatePlatform } from '@/api/platform'

const defaultPlatform = {
  name: '',
  order: 0
}

export default {
  name: 'PlatformList',
  data() {
    return {
      listLoading: true,
      platform: Object.assign({}, defaultPlatform),
      list: [],
      dialogVisible: false,
      dialogType: 'new'
    }
  },
  created() {
    this.getPlatforms()
  },
  methods: {
    async getPlatforms() {
      this.listLoading = true
      const res = await getPlatforms()
      this.list = res.data
      this.listLoading = false
    },
    handleAddPlatform() {
      this.platform = Object.assign({}, defaultPlatform)
      this.dialogType = 'new'
      this.dialogVisible = true
    },
    handleEdit(scope) {
      this.dialogType = 'edit'
      this.dialogVisible = true
      this.platform = deepClone(scope.row)
    },
    handleDelete({ $index, row }) {
      this.$confirm('确定要删除吗', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async() => {
          await deletePlatform(row.id)
          this.list.splice($index, 1)
          this.$message({
            type: 'success',
            message: '删除成功!'
          })
        })
        .catch(err => { console.error(err) })
    },
    fields(platform) {
      return {
        name: platform.name,
        order: platform.order
      }
    },
    async confirmSubmit() {
      const isEdit = this.dialogType === 'edit'
      if (isEdit) {
        await updatePlatform(this.platform.id, this.fields(this.platform))
        for (let index = 0; index < this.list.length; index++) {
          if (this.list[index].id === this.platform.id) {
            this.list.splice(index, 1, Object.assign({}, this.platform))
            break
          }
        }
      } else {
        const { data } = await addPlatform(this.fields(this.platform))
        this.platform.id = data.id
        this.list.push(this.platform)
      }
      this.list.sort(function(a, b) {
        let sort = a.order - b.order
        if (sort === 0) {
          sort = a.id - b.id
        }
        return sort
      })

      this.dialogVisible = false
      this.$notify({
        title: 'Success',
        message: '操作成功',
        type: 'success'
      })
    }
  }
}
</script>