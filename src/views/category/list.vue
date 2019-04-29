<template>
  <div class="app-container">
    <el-tree
      :data="treeData"
      :props="defaultProps"
      node-key="id"
      default-expand-all
      draggable
      :expand-on-click-node="false"
      @node-drop="handleDrop"
    >
      <span slot-scope="{ node, data }" class="custom-tree-node">
        <span>{{ node.label }}</span>
        <span class="custom-tree-ope">
          <el-button
            type="text"
            @click="() => handleAdd(data)"
          >
            {{ data.id==0?'添加分类':'添加子分类' }}
          </el-button>
          <el-button
            v-if="data.id!=0"
            type="text"
            @click="() => handleEdit(data)"
          >
            编辑
          </el-button>
          <el-button
            v-if="data.id!=0"
            type="text"
            @click="() => handleDelete(node, data)"
          >
            删除
          </el-button>
        </span>
      </span>
    </el-tree>

    <el-dialog :title="textMap[dialogType]" :visible.sync="dialogVisible">
      <el-form ref="form" :model="category" label-position="left" label-width="80px">
        <el-form-item label="名称" prop="name" :rules="[{ required: true, message: '不能为空'},]">
          <el-input v-model="category.name" placeholder="输入分类名称" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click=" dialogVisible= false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">{{ textMap[dialogType] }}</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { addCategory, updateCategory, getCategories, deleteCategory, move } from '@/api/category'
import { unflatten, deepClone } from '@/utils'

const defaultCategory = {
  name: '',
  parent_id: 0
}
export default {
  name: 'CategoryManage',
  data: function() {
    return {
      form: {
        name: '',
        parent_id: 0
      },
      treeData: [],
      textMap: {
        'new': '创建',
        'edit': '编辑'
      },
      defaultProps: {
        label: 'name'
      },
      dialogVisible: false,
      dialogType: 'new',
      category: Object.assign({}, defaultCategory),
      editTreeNode: {}
    }
  },
  created: function() {
    this.getCategories()
  },
  methods: {
    async getCategories() {
      const res = await getCategories()
      const tree = unflatten(res.data)
      const root = [{
        id: 0,
        name: '分类管理',
        children: []
      }]
      root[0].children = tree
      this.treeData = root
    },
    async handleDrop(draggingNode, dropNode, dropType, ev) {
      await move(draggingNode.data.id, dropNode.data.id, dropType)
      this.$message({ message: '操作成功', type: 'success' })
    },
    handleAdd(data) {
      this.editTreeNode = data
      this.category = Object.assign({}, defaultCategory)
      this.category.parent_id = data.id
      this.dialogVisible = true
      this.tempTreeCurrentData = data
      this.dialogType = 'new'
      this.$nextTick(function() {
        this.$refs.form.clearValidate()
      })
    },
    handleEdit(data) {
      this.editTreeNode = data
      this.dialogVisible = true
      this.category = deepClone(data)
      this.dialogType = 'edit'
    },
    handleDelete(node, data) {
      this.$confirm('确定要删除吗', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async() => {
          await deleteCategory(data.id)
          const parent = node.parent
          const children = parent.data.children || parent.data
          const index = children.findIndex(d => d.id === data.id)
          children.splice(index, 1)
          this.$message({
            type: 'success',
            message: '删除成功!'
          })
        }).catch(() => {})
    },
    fields(category) {
      return {
        name: category.name,
        parent_id: category.parent_id
      }
    },
    handleSubmit() {
      this.$refs.form.validate(async(valid) => {
        if (valid) {
          if (this.dialogType === 'edit') {
            await updateCategory(this.category.id, this.fields(this.category))
            this.editTreeNode.name = this.category.name
          } else {
            const { data } = await addCategory(this.fields(this.category))
            this.category.id = data.id
            if (!this.editTreeNode.children) {
              this.$set(this.editTreeNode, 'children', [])
            }
            this.editTreeNode.children.push(this.category)
          }
          this.dialogVisible = false
          this.$notify({
            title: 'Success',
            message: '操作成功',
            type: 'success'
          })
        } else {
          return false
        }
      })
    }
  }
}
</script>

<style>
  .custom-tree-node {
    align-items: center;
    justify-content: space-between;
    font-size: 14px;
    padding-right: 8px;
  }
  .custom-tree-ope {
    padding-left: 100px;
  }
</style>
