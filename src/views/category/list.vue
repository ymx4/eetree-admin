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
            type="text"
            @click="() => handleMoveDoc(node, data)"
          >
            转移文档
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
      <el-form ref="categoryForm" :model="category" label-position="left" label-width="80px">
        <el-form-item label="名称" prop="name" :rules="[{ required: true, message: '不能为空'},]">
          <el-input v-model="category.name" placeholder="输入分类名称" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click=" dialogVisible= false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">{{ textMap[dialogType] }}</el-button>
      </span>
    </el-dialog>

    <el-dialog :visible.sync="moveDocDialogVisible" title="文档转移">
      <el-form ref="moveDocForm" :model="moveDocDest" label-width="80px" label-position="left">
        <el-form-item label="目标分类" prop="id" :rules="[{ required: true, message: '不能为空'},]">
          <el-select v-model="moveDocDest.id" placeholder="请选择">
            <el-option
              v-for="category in moveDocCategories"
              :key="category.value"
              :label="category.label"
              :value="category.value"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <div style="text-align:right;">
        <el-button type="danger" @click="moveDocDialogVisible=false">
          取消
        </el-button>
        <el-button type="primary" @click="confirmMoveDoc">
          提交
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { addCategory, updateCategory, getCategories, deleteCategory, move } from '@/api/category'
import { moveDocs } from '@/api/doc'
import { unflatten, deepClone, selectOptions } from '@/utils'

const defaultCategory = {
  name: '',
  parent_id: 0
}
export default {
  name: 'CategoryManage',
  data: function() {
    return {
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
      editTreeNode: {},
      moveDocSrc: 0,
      moveDocDialogVisible: false,
      moveDocCategories: [],
      moveDocDest: {
        id: ''
      }
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
      this.moveDocCategories = selectOptions(tree, 'name', 'id')
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
        this.$refs.categoryForm.clearValidate()
      })
    },
    handleEdit(data) {
      this.editTreeNode = data
      this.dialogVisible = true
      this.category = deepClone(data)
      this.dialogType = 'edit'
    },
    handleMoveDoc(node, data) {
      this.moveDocSrc = data.id
      this.moveDocDest.id = ''
      this.moveDocDialogVisible = true
    },
    async confirmMoveDoc() {
      this.$refs.moveDocForm.validate(async(valid) => {
        if (valid) {
          this.$confirm('确定要把该分类下的文档全部转移到目标分类中吗', '警告', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          })
            .then(async() => {
              await moveDocs(this.moveDocSrc, this.moveDocDest.id)
              this.$message({ message: '操作成功', type: 'success' })
              this.moveDocDialogVisible = false
            })
        } else {
          return false
        }
      })
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
      this.$refs.categoryForm.validate(async(valid) => {
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
