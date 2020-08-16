<template>
  <div>
    <el-select v-model="typeId" @change="typeChange">
      <el-option
        v-for="type in types"
        :key="type.k"
        placeholder="请选择类型"
        :label="type.l"
        :value="type.k"
      />
    </el-select>
    <el-select
      v-model="recId"
      filterable
      remote
      placeholder="请输入关键词"
      :remote-method="remoteMethod"
      :loading="loading"
    >
      <el-option
        v-for="item in list"
        :key="item.query_id"
        :label="item.title"
        :value="item.query_id"
      />
    </el-select>
    <el-button class="filter-item" type="primary" @click="handleFetch">
      获取
    </el-button>
  </div>
</template>

<script>
import { getEnums } from '@/api/common'
import { getProjects } from '@/api/project'
import { getDocs } from '@/api/doc'

export default {
  name: 'RecommendGetItem',
  props: {
    value: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      loading: false,
      types: {},
      typeId: null,
      list: [],
      recId: null
    }
  },
  created() {
    this.getTypes()
  },
  methods: {
    async getTypes() {
      const res = await getEnums('types', 'all')
      this.types = res.data
    },
    async handleFetch() {
      if (!this.recId) {
        this.$message({
          type: 'error',
          message: '请先选择要获取的内容!'
        })
        return
      }
      for (let index = 0; index < this.list.length; index++) {
        if (this.list[index].query_id === this.recId) {
          for (const iKey in this.list[index]) {
            if (iKey !== 'query_id') {
              this.value[iKey] = this.list[index][iKey]
            }
          }
          break
        }
      }
      this.$emit('fetchItem')
    },
    formatProject(project) {
      return {
        query_id: project.id,
        title: project.title,
        area_id: 0,
        description: project.description,
        link: project.url,
        cloud_id: project.cloud_id,
        cloud: project.cloud
      }
    },
    formatDoc(doc) {
      return {
        query_id: doc.id,
        title: doc.title,
        area_id: 0,
        description: doc.description,
        link: doc.url,
        cloud_id: 0,
        cloud: {
          url: ''
        }
      }
    },
    typeChange() {
      this.list = []
    },
    async remoteMethod(query) {
      this.list = []
      if (query !== '') {
        if (this.typeId === this.types.DOC.k) {
          this.loading = true
          const res = await getDocs({
            title: query
          })
          const queryList = res.data
          queryList.forEach(row => {
            this.list.push(this.formatDoc(row))
          })
          this.loading = false
        } else if (this.typeId === this.types.PROJECT.k) {
          this.loading = true
          const res = await getProjects({
            title: query
          })
          const queryList = res.data
          queryList.forEach(row => {
            this.list.push(this.formatProject(row))
          })
          this.loading = false
        }
      }
    }
  }
}
</script>
