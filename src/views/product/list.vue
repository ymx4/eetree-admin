<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.title" placeholder="名称" style="width: 200px;" class="filter-item" />
      <el-select v-model="listQuery.searchType" style="width: 140px" class="filter-item" @change="handleFilter">
        <el-option label="所有类型" value="all" />
        <el-option
          v-for="productType in productTypes"
          :key="productType.k"
          :label="productType.l"
          :value="productType.k"
        />
      </el-select>
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button>
      <el-button class="filter-item" type="primary" @click="handleAddProduct">
        添加
      </el-button>
    </div>

    <el-table v-loading="listLoading" :data="list" style="width: 100%;margin-top:30px;" border>
      <el-table-column align="center" label="名称">
        <template slot-scope="scope">
          {{ scope.row.name }}
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
      <el-form :model="product" label-width="160px" label-position="left">
        <el-form-item label="名称">
          <el-input v-model="product.name" placeholder="名称" />
        </el-form-item>
        <el-form-item label="图片">
          <Upload v-model="product.cloud_id" :cloud="product.cloud" :crop-opt="cropOpt" />
        </el-form-item>
        <el-form-item label="厂商">
          <el-select v-model="product.supplier_id" filterable :filter-method="getSuppliers">
            <el-option
              v-for="supplier in suppliers"
              :key="supplier.id"
              :label="supplier.name"
              :value="supplier.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="product.type">
            <el-option
              v-for="productType in productTypes"
              :key="productType.k"
              :label="productType.l"
              :value="productType.k"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="简介">
          <el-input
            v-model="product.description"
            type="textarea"
            :rows="2"
            placeholder="简介"
          />
        </el-form-item>
        <el-form-item label="链接">
          <el-input v-model="product.link" placeholder="链接" />
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

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getProducts" />

  </div>
</template>

<script>
import { deepClone } from '@/utils'
import { getProducts, addProduct, deleteProduct, updateProduct } from '@/api/product'
import { getSuppliers } from '@/api/supplier'
import { getEnums } from '@/api/common'
import Pagination from '@/components/Pagination'
import Upload from '@/components/Upload/Crop'

const defaultProduct = {
  name: '',
  supplier_id: 0,
  type: 0,
  description: '',
  link: '',
  cloud_id: 0,
  cloud: {
    url: ''
  }
}

export default {
  name: 'ProductList',
  components: { Pagination, Upload },
  data() {
    return {
      listLoading: true,
      product: Object.assign({}, defaultProduct),
      list: [],
      productTypes: [],
      suppliers: [],
      supplierReset: true,
      dialogVisible: false,
      dialogType: 'new',
      total: 0,
      listQuery: {
        page: 1,
        limit: 10,
        title: '',
        searchType: 'all'
      },
      cropOpt: {
        width: 150,
        height: 150
      }
    }
  },
  created() {
    this.getProducts()
    this.getProductTypes()
    this.getSuppliers()
  },
  methods: {
    handleFilter() {
      this.listQuery.page = 1
      this.getProducts()
    },
    async getProducts() {
      this.listLoading = true
      const res = await getProducts({
        page: this.listQuery.page,
        title: this.listQuery.title,
        sType: this.listQuery.searchType
      })
      this.list = res.data
      this.listQuery.page = res.meta.current_page
      this.listQuery.limit = res.meta.per_page
      this.total = res.meta.total
      this.listLoading = false
    },
    async getProductTypes() {
      const res = await getEnums('product.types')
      this.productTypes = res.data
    },
    async getSuppliers(title) {
      if (!title && !this.supplierReset) {
        return
      }
      const res = await getSuppliers({ title })
      this.suppliers = res.data
      if (title) {
        this.supplierReset = true
      } else {
        this.supplierReset = false
        this.suppliers.unshift({ id: 0, name: '无' })
      }
    },
    handleAddProduct() {
      this.product = deepClone(defaultProduct)
      this.dialogType = 'new'
      this.getSuppliers()
      this.dialogVisible = true
    },
    handleEdit(scope) {
      this.dialogType = 'edit'
      this.getSuppliers()
      this.product = deepClone(scope.row)
      this.dialogVisible = true
    },
    handleDelete({ $index, row }) {
      this.$confirm('确定要删除吗', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async() => {
          await deleteProduct(row.id)
          this.list.splice($index, 1)
          this.$message({
            type: 'success',
            message: '删除成功!'
          })
        })
        .catch(err => { console.error(err) })
    },
    fields(product) {
      return {
        name: product.name,
        supplier_id: product.supplier_id,
        type: product.type,
        description: product.description,
        link: product.link,
        cloud_id: product.cloud_id
      }
    },
    async confirmSubmit() {
      const isEdit = this.dialogType === 'edit'
      if (isEdit) {
        await updateProduct(this.product.id, this.fields(this.product))
        for (let index = 0; index < this.list.length; index++) {
          if (this.list[index].id === this.product.id) {
            this.list.splice(index, 1, Object.assign({}, this.product))
            break
          }
        }
      } else {
        const { data } = await addProduct(this.fields(this.product))
        this.product.id = data.id
        this.list.push(this.product)
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
