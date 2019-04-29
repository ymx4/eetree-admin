<template>
  <div class="app-container">
    <div class="filter-container">
      <el-button class="filter-item save-button" type="primary" icon="el-icon-save" @click="handleSave">保存</el-button>
    </div>
    <el-tree :data="treeData" :props="props" node-key="id" default-expand-all :expand-on-click-node="false" @node-click="handleNodeClick">
      <span slot-scope="{ node, data }" style="width: 60%">
        <strong>{{ node.label }}</strong>
        <code style="color: aqua;padding-left: 20px">uri </code>
        <span style="float: right;">
          <el-button type="text" size="mini" @click="() => append(data)">添加分类</el-button>
          <el-button v-if="data.id!=0" type="text" size="mini" @click="() => edit(data)">编辑分类</el-button>
          <el-button v-if="data.id!=0" type="text" size="mini" @click="() => moveUp(data)">上移</el-button>
          <el-button v-if="data.id!=0" type="text" size="mini" @click="() => moveDown(data)">下移</el-button>
          <el-button v-if="data.id!=0" type="text" size="mini" @click="() => remove(node, data)">删除分类</el-button>
        </span>
      </span>
    </el-tree>

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogVisible">
      <el-form ref="form" :model="form" label-position="top" label-width="80px">
        <el-form-item v-if="form.id != ''" label="ID" prop="id">
          <el-input v-model="form.id" :disabled="true" />
        </el-form-item>
        <el-form-item label="名称" prop="title" :rules="[{ required: true, message: '不能为空'},]">
          <el-input v-model="form.title" placeholder="输入分类名称" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click=" dialogVisible= false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">{{ textMap[dialogStatus] }}</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { add, edit, list, del, moveDown, moveUp } from '@/api/category'
import { unflatten } from '@/utils/index'
export default {
  name: 'CategoryManage',
  data: function() {
    return {
      form: {
        id: '',
        title: '',
        parent_id: 0
      },
      treeData: [],
      textMap: {
        'create': '创建',
        'update': '更新'
      },
      props: {
        label: 'title'
      },
      dialogVisible: false,
      dialogStatus: '',
      tempTreeCurrentData: {},
      tempTreeCurrentNode: {}
    }
  },
  created: function() {
    this.list()
  },
  methods: {
    list: function() {
      return list().then((res) => {
        const tree = unflatten(res.data)
        const root = [{
          id: 0,
          title: 'ROOT',
          children: []
        }]
        root[0].children = tree
        this.treeData = root
        // this.$set(this.treeData[0], 'children', tree)
      })
    },
    handleSave: function() {
      this.list()
    },
    append(data) {
      this.dialogVisible = true
      this.tempTreeCurrentData = data
      this.clearFormData()
      this.dialogStatus = 'create'
    },
    edit(data) {
      this.dialogVisible = true
      this.tempTreeCurrentData = data
      this.form = Object.assign({}, data)
      this.dialogStatus = 'update'
    },
    remove(node, data) {
      this.$confirm('确定要删除吗', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        del(data.id).then((res) => {
          const affected = res.data
          if (affected) {
            this.list()
            this.$message({ message: '操作成功', type: 'success' })
          } else {
            this.$message({ message: '操作失败', type: 'error' })
          }
        })
      }).catch(() => {})
    },
    moveUp: function(data) {
      moveUp(data.id).then(res => {
        if (res.data) {
          this.list()
          this.$message({ message: '操作成功', type: 'success' })
        } else {
          this.$message({ message: '操作失败', type: 'error' })
        }
      })
    },
    moveDown: function(data) {
      moveDown(data.id).then(res => {
        if (res.data) {
          this.list()
          this.$message({ message: '操作成功', type: 'success' })
        } else {
          this.$message({ message: '操作失败', type: 'error' })
        }
      })
    },
    removeTreeItem(treeData, data) {
      for (let i = 0; i < treeData.length; i++) {
        const td = treeData[i]
        if (parseInt(td.id) === parseInt(data.id)) {
          treeData.splice(i, 1)
        } else {
          this.removeTreeItem(td.children, data)
        }
      }
    },
    handleSubmit: function() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          if (this.dialogStatus === 'create') {
            this.form.parent_id = this.tempTreeCurrentData.id
            add(this.form).then((res) => {
              const inserted = res.data
              if (inserted) {
                this.dialogVisible = false
                const data = this.tempTreeCurrentData
                this.form.id = inserted
                const newChild = Object.assign({}, this.form)
                if (!data.children) {
                  this.$set(data, 'children', [])
                }
                data.children.push(newChild)
                this.$message({ message: '操作成功', type: 'success' })
              } else {
                this.$message({ message: '操作失败', type: 'error' })
              }
            })
          } else {
            edit(this.tempTreeCurrentData.id, this.form).then((res) => {
              const affected = res.data
              if (affected) {
                this.dialogVisible = false
                this.tempTreeCurrentData.id = this.form.id
                this.tempTreeCurrentData.title = this.form.title
                this.clearFormData()
                this.$message({ message: '操作成功', type: 'success' })
              } else {
                this.$message({ message: '操作失败', type: 'error' })
              }
            })
          }
        } else {
          return false
        }
      })
    },
    clearFormData() {
      this.form = {
        id: '',
        title: '',
        parent_id: 0
      }
    },
    handleNodeClick(data) {
      // console.log(data);
    }
  }
}
</script>

<style scoped>
  .filter-container {
    height: 50px;
  }
  .save-button{
    float: right;
  }

  .el-select {
    display: block;
  }
</style>
