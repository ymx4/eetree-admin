<template>
  <div>
    <el-select v-model="typeId" @change="typeChange">
      <el-option label="请选择" :value="-1" />
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
        :key="item.obj_id"
        :label="item.title"
        :value="item.obj_id"
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
import { stripTags } from '@/utils'

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
    this.getTypes().then(ret => {
      this.typeId = this.value.obj_type
    })
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
        if (this.list[index].obj_id === this.recId) {
          for (const iKey in this.list[index]) {
            if (iKey === 'description') {
              this.value[iKey] = stripTags(this.list[index][iKey])
            } else {
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
        obj_type: this.types.PROJECT.k,
        obj_id: project.id,
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
        obj_type: this.types.DOC.k,
        obj_id: doc.id,
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
      if (this.typeId === -1) {
        this.value.obj_type = -1
        this.value.obj_id = 0
      }
    },
    async remoteMethod(query) {
      this.list = []
      if (query !== '') {
        if (this.typeId === this.types.DOC.k) {
          this.loading = true
          const res = await getDocs({
            title: query,
            publish: 1
          })
          const queryList = res.data
          queryList.forEach(row => {
            this.list.push(this.formatDoc(row))
          })
          this.loading = false
        } else if (this.typeId === this.types.PROJECT.k) {
          this.loading = true
          const res = await getProjects({
            title: query,
            publish: 1
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
