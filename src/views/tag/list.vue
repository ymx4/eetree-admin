<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.title" placeholder="名称" style="width: 200px;" class="filter-item" />
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button>
      <el-button class="filter-item" type="primary" @click="handleAddTag">
        添加
      </el-button>
    </div>

    <el-table v-loading="listLoading" :data="list" style="width: 100%;margin-top:30px;" border>
      <el-table-column align="center" label="名称">
        <template slot-scope="scope">
          {{ scope.row.name }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="类型">
        <template slot-scope="scope">
          {{ scope.row.type_label }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="归类标签">
        <template slot-scope="scope">
          {{ scope.row.ptag.id > 0 ? scope.row.ptag.name : '' }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作">
        <template slot-scope="scope">
          <el-button type="primary" size="small" @click="handleEdit(scope)">
            编辑
          </el-button>
          <el-button v-if="scope.row.type==0" type="primary" size="small" @click="handleMerge(scope)">
            归类
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
        <el-form-item label="类型">
          <el-select v-model="tag.type">
            <el-option
              v-for="tagType in tagTypes"
              :key="tagType.k"
              :label="tagType.l"
              :value="tagType.k"
            />
          </el-select>
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

    <el-dialog :visible.sync="dialogMergeVisible" title="归类">
      <el-form ref="mergeForm" :model="mergeTag" label-width="160px" label-position="left">
        <el-form-item label="归类到" prop="ptag" :rules="mergeRules">
          <el-select
            v-model="mergeTag.ptag"
            value-key="id"
            style="width:100%;"
            filterable
            default-first-option
            remote
            :loading="mergeLoading"
            :remote-method="getMergeTags"
            placeholder="请输入标签名"
          >
            <el-option
              v-for="item in tagOptions"
              :key="item.id"
              :label="item.name"
              :value="item"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <div style="text-align:right;">
        <el-button type="danger" @click="dialogMergeVisible=false">
          取消
        </el-button>
        <el-button type="primary" @click="confirmMerge">
          提交
        </el-button>
      </div>
    </el-dialog>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getTags" />

  </div>
</template>

<script>
import { deepClone } from '@/utils'
import { getTags, addTag, deleteTag, updateTag, mergeTag } from '@/api/tag'
import { getEnums } from '@/api/common'
import Pagination from '@/components/Pagination'

const defaultTag = {
  name: '',
  ptag: {
    id: 0
  }
}

export default {
  name: 'TagList',
  components: { Pagination },
  data() {
    const checkMerge = (rule, value, callback) => {
      if (!value.id || !Number.isInteger(value.id) || value.id <= 0) {
        return callback(new Error('请输入标签名'))
      } else {
        callback()
      }
    }
    return {
      listLoading: true,
      tag: Object.assign({}, defaultTag),
      list: [],
      tagTypes: [],
      dialogVisible: false,
      dialogType: 'new',
      dialogMergeVisible: false,
      mergeTag: Object.assign({}, defaultTag),
      mergeLoading: false,
      tagOptions: [],
      total: 0,
      listQuery: {
        page: 1,
        limit: 10,
        title: ''
      },
      mergeRules: [{ validator: checkMerge, trigger: 'blur' }]
    }
  },
  created() {
    this.getTagTypes()
    this.getTags()
  },
  methods: {
    handleFilter() {
      this.listQuery.page = 1
      this.getTags()
    },
    async getTagTypes() {
      const res = await getEnums('tag.types')
      this.tagTypes = res.data
    },
    async getTags() {
      this.listLoading = true
      const res = await getTags({
        page: this.listQuery.page,
        title: this.listQuery.title
      })
      this.list = res.data
      this.listQuery.page = res.meta.current_page
      this.listQuery.limit = res.meta.per_page
      this.total = res.meta.total
      this.listLoading = false
    },
    async getMergeTags(query) {
      this.mergeLoading = true
      const res = await getTags({
        page: 1,
        title: query,
        ptag: 0
      })
      this.tagOptions = res.data
      this.mergeLoading = false
    },
    handleAddTag() {
      this.tag = deepClone(defaultTag)
      this.dialogType = 'new'
      this.dialogVisible = true
    },
    handleEdit(scope) {
      this.dialogType = 'edit'
      this.dialogVisible = true
      this.tag = deepClone(scope.row)
    },
    handleMerge(scope) {
      this.dialogMergeVisible = true
      this.mergeTag = deepClone(scope.row)
    },
    confirmMerge() {
      this.$refs.mergeForm.validate(async(valid) => {
        if (valid) {
          await mergeTag(this.mergeTag.id, {
            pid: this.mergeTag.ptag.id
          })
          for (let index = 0; index < this.list.length; index++) {
            if (this.list[index].id === this.mergeTag.id) {
              this.list.splice(index, 1, Object.assign({}, this.mergeTag))
              break
            }
          }
          this.dialogMergeVisible = false
        } else {
          return false
        }
      })
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
        name: tag.name,
        type: tag.type
      }
    },
    async confirmSubmit() {
      const isEdit = this.dialogType === 'edit'
      if (isEdit) {
        const { data } = await updateTag(this.tag.id, this.fields(this.tag))
        this.tag = data
        for (let index = 0; index < this.list.length; index++) {
          if (this.list[index].id === this.tag.id) {
            this.list.splice(index, 1, Object.assign({}, this.tag))
            break
          }
        }
      } else {
        const { data } = await addTag(this.fields(this.tag))
        this.tag = data
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
