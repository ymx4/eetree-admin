<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.title" placeholder="标题" style="width: 200px;" class="filter-item" />
      <el-select v-model="listQuery.area_id" style="width: 140px" class="filter-item" @change="handleFilter">
        <el-option label="所有分组" value="-1" />
        <el-option
          v-for="area in areas"
          :key="area.k"
          :label="area.l"
          :value="area.k"
        />
      </el-select>
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button>
      <el-button class="filter-item" type="primary" @click="handleAddRecommend">
        添加
      </el-button>
    </div>

    <el-table v-loading="listLoading" :data="list" style="width: 100%;margin-top:30px;" border>
      <el-table-column align="center" label="标题">
        <template slot-scope="scope">
          {{ scope.row.title }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="分组">
        <template slot-scope="scope">
          {{ scope.row.area_label }}
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
      <el-form :model="recommend" label-width="160px" label-position="left">
        <el-form-item label="标题">
          <el-input v-model="recommend.title" placeholder="标题" />
        </el-form-item>
        <el-form-item label="分组">
          <el-select v-model="recommend.area_id">
            <el-option
              v-for="area in areas"
              :key="area.k"
              :label="area.l"
              :value="area.k"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="图片">
          <Upload v-model="recommend.cloud_id" :cloud="recommend.cloud" />
        </el-form-item>
        <el-form-item label="链接">
          <el-input v-model="recommend.link" placeholder="链接" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="recommend.description"
            type="textarea"
            :rows="2"
            placeholder="描述"
          />
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

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getRecommends" />

  </div>
</template>

<script>
import { deepClone } from '@/utils'
import { getRecommends, addRecommend, deleteRecommend, updateRecommend } from '@/api/recommend'
import { getEnums } from '@/api/common'
import Pagination from '@/components/Pagination'
import Upload from '@/components/Upload/SingleImage'

const defaultRecommend = {
  title: '',
  area_id: 0,
  description: '',
  link: '',
  cloud_id: 0,
  cloud: {
    url: ''
  }
}

export default {
  name: 'RecommendList',
  components: { Pagination, Upload },
  data() {
    return {
      listLoading: true,
      recommend: Object.assign({}, defaultRecommend),
      list: [],
      dialogVisible: false,
      dialogType: 'new',
      total: 0,
      listQuery: {
        page: 1,
        limit: 10,
        title: '',
        area_id: '-1'
      },
      areas: []
    }
  },
  created() {
    this.getRecommends()
    this.getAreas()
  },
  methods: {
    handleFilter() {
      this.listQuery.page = 1
      this.getRecommends()
    },
    async getRecommends() {
      this.listLoading = true
      const res = await getRecommends({
        page: this.listQuery.page,
        title: this.listQuery.title,
        area_id: this.listQuery.area_id
      })
      this.list = res.data
      this.listQuery.page = res.meta.current_page
      this.listQuery.limit = res.meta.per_page
      this.total = res.meta.total
      this.listLoading = false
    },
    async getAreas() {
      const res = await getEnums('recommend.area')
      this.areas = res.data
    },
    handleAddRecommend() {
      this.recommend = deepClone(defaultRecommend)
      this.dialogType = 'new'
      this.dialogVisible = true
    },
    handleEdit(scope) {
      this.dialogType = 'edit'
      this.dialogVisible = true
      this.recommend = deepClone(scope.row)
    },
    handleDelete({ $index, row }) {
      this.$confirm('确定要删除吗', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async() => {
          await deleteRecommend(row.id)
          this.list.splice($index, 1)
          this.$message({
            type: 'success',
            message: '删除成功!'
          })
        })
        .catch(err => { console.error(err) })
    },
    fields(recommend) {
      return {
        title: recommend.title,
        area_id: recommend.area_id,
        description: recommend.description,
        link: recommend.link,
        cloud_id: recommend.cloud_id
      }
    },
    async confirmSubmit() {
      const isEdit = this.dialogType === 'edit'
      if (isEdit) {
        const { data } = await updateRecommend(this.recommend.id, this.fields(this.recommend))
        this.recommend = data
        for (let index = 0; index < this.list.length; index++) {
          if (this.list[index].id === this.recommend.id) {
            this.list.splice(index, 1, Object.assign({}, this.recommend))
            break
          }
        }
      } else {
        const { data } = await addRecommend(this.fields(this.recommend))
        this.recommend = data
        this.list.push(this.recommend)
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
