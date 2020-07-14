<template>
  <div class="app-container">
    <el-button type="primary" @click="handleAddTag">
      添加标签
    </el-button>

    <el-table v-loading="listLoading" :data="list" style="width: 100%;margin-top:30px;" border>
      <el-table-column align="center" label="名称">
        <template slot-scope="scope">
          {{ scope.row.name }}
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
      <el-form :model="tag" label-width="160px" label-position="left">
        <el-form-item label="名称">
          <el-input v-model="tag.name" placeholder="名称" />
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
import { getTags, addTag, deleteTag, updateTag } from '@/api/tag'

const defaultTag = {
  name: ''
}

export default {
  name: 'TagList',
  data() {
    return {
      listLoading: true,
      tag: Object.assign({}, defaultTag),
      list: [],
      dialogVisible: false,
      dialogType: 'new'
    }
  },
  created() {
    this.getTags()
  },
  methods: {
    async getTags() {
      this.listLoading = true
      const res = await getTags()
      this.list = res.data
      this.listLoading = false
    },
    handleAddTag() {
      this.tag = Object.assign({}, defaultTag)
      this.dialogType = 'new'
      this.dialogVisible = true
    },
    handleEdit(scope) {
      this.dialogType = 'edit'
      this.dialogVisible = true
      this.tag = deepClone(scope.row)
    },
    handleDelete({ $index, row }) {
      this.$confirm('确定要删除吗', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async() => {
          await deleteTag(row.id)
          this.list.splice($index, 1)
          this.$message({
            type: 'success',
            message: '删除成功!'
          })
        })
        .catch(err => { console.error(err) })
    },
    fields(tag) {
      return {
        name: tag.name
      }
    },
    async confirmSubmit() {
      const isEdit = this.dialogType === 'edit'
      if (isEdit) {
        await updateTag(this.tag.id, this.fields(this.tag))
        for (let index = 0; index < this.list.length; index++) {
          if (this.list[index].id === this.tag.id) {
            this.list.splice(index, 1, Object.assign({}, this.tag))
            break
          }
        }
      } else {
        const { data } = await addTag(this.fields(this.tag))
        this.tag.id = data.id
        this.list.push(this.tag)
      }

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
