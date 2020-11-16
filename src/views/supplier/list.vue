<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.title" placeholder="名称" style="width: 200px;" class="filter-item" />
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button>
      <el-button class="filter-item" type="primary" @click="handleAddSupplier">
        添加
      </el-button>
    </div>

    <el-table v-loading="listLoading" :data="list" style="width: 100%;margin-top:30px;" border>
      <el-table-column align="center" label="名称">
        <template slot-scope="scope">
          {{ scope.row.name }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="LOGO">
        <template slot-scope="scope">
          <img style="max-width:100px;" :src="scope.row.cloud.url">
        </template>
      </el-table-column>
      <el-table-column align="center" label="链接">
        <template slot-scope="scope">
          {{ scope.row.link }}
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
      <el-form :model="supplier" label-width="160px" label-position="left">
        <el-form-item label="名称">
          <el-input v-model="supplier.name" placeholder="名称" />
        </el-form-item>
        <el-form-item label="LOGO">
          <Upload v-model="supplier.cloud_id" :cloud="supplier.cloud" :crop-opt="cropOpt" />
        </el-form-item>
        <el-form-item label="链接">
          <el-input v-model="supplier.link" placeholder="链接" />
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

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getSuppliers" />

  </div>
</template>

<script>
import { deepClone } from '@/utils'
import { getSuppliers, addSupplier, deleteSupplier, updateSupplier } from '@/api/supplier'
import Pagination from '@/components/Pagination'
import Upload from '@/components/Upload/Crop'

const defaultSupplier = {
  name: '',
  link: '',
  cloud_id: 0,
  cloud: {
    url: ''
  }
}

export default {
  name: 'SupplierList',
  components: { Pagination, Upload },
  data() {
    return {
      listLoading: true,
      supplier: Object.assign({}, defaultSupplier),
      list: [],
      dialogVisible: false,
      dialogType: 'new',
      total: 0,
      listQuery: {
        page: 1,
        limit: 10,
        title: ''
      },
      cropOpt: {
        width: 150,
        height: 150
      }
    }
  },
  created() {
    this.getSuppliers()
  },
  methods: {
    handleFilter() {
      this.listQuery.page = 1
      this.getSuppliers()
    },
    async getSuppliers() {
      this.listLoading = true
      const res = await getSuppliers({
        page: this.listQuery.page,
        title: this.listQuery.title
      })
      this.list = res.data
      this.listQuery.page = res.meta.current_page
      this.listQuery.limit = res.meta.per_page
      this.total = res.meta.total
      this.listLoading = false
    },
    handleAddSupplier() {
      this.supplier = deepClone(defaultSupplier)
      this.dialogType = 'new'
      this.dialogVisible = true
    },
    handleEdit(scope) {
      this.dialogType = 'edit'
      this.dialogVisible = true
      this.supplier = deepClone(scope.row)
    },
    handleDelete({ $index, row }) {
      this.$confirm('确定要删除吗', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async() => {
          await deleteSupplier(row.id)
          this.list.splice($index, 1)
          this.$message({
            type: 'success',
            message: '删除成功!'
          })
        })
        .catch(err => { console.error(err) })
    },
    fields(supplier) {
      return {
        name: supplier.name,
        link: supplier.link,
        cloud_id: supplier.cloud_id
      }
    },
    async confirmSubmit() {
      const isEdit = this.dialogType === 'edit'
      if (isEdit) {
        await updateSupplier(this.supplier.id, this.fields(this.supplier))
        for (let index = 0; index < this.list.length; index++) {
          if (this.list[index].id === this.supplier.id) {
            this.list.splice(index, 1, Object.assign({}, this.supplier))
            break
          }
        }
      } else {
        const { data } = await addSupplier(this.fields(this.supplier))
        this.supplier.id = data.id
        this.list.push(this.supplier)
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
