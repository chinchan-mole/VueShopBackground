<template>
<div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>商品管理</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/goods' }">商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 内容区 -->
    <el-card class="box-card">
        <!-- 搜索与添加 -->
        <el-row :gutter="20">
            <el-col :span="8">
                <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="queryInfo.query = ''; queryList()">
                    <el-button slot="append" icon="el-icon-search" @click="queryList"></el-button>
                </el-input>
            </el-col>
            <el-col :span="2">
                <el-button type="primary" @click="goAdd">添加商品</el-button>
            </el-col>
        </el-row>
        <!-- 表格区 -->
        <el-table :data="goodsList" style="width: 100%" border stripe>
            <el-table-column type="index" label="No." width="50">
            </el-table-column>
            <el-table-column prop="goods_name" label="商品名称">
            </el-table-column>
            <el-table-column prop="goods_price" label="商品价格" width="100">
            </el-table-column>
            <el-table-column prop="goods_weight" label="商品重量" width="100">
            </el-table-column>
            <el-table-column prop="add_time" label="创建时间" width="180">
            </el-table-column>
            <el-table-column prop="upd_time" label="最后修改时间" width="180">
            </el-table-column>
            <el-table-column label="操作" width="180">
                <template slot-scope="scope">
                    <el-button type="primary" icon="el-icon-edit" size="small">修改</el-button>
                    <el-button type="danger" icon="el-icon-delete" size="small" @click="delGoods(scope.row)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>
        <el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum" :page-sizes="[5, 10, 20, 30]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total">
        </el-pagination>
    </el-card>
</div>
</template>

<script>
export default {
    data () {
        return {
            // 列表查询参数
            queryInfo: {
                query: '',
                pagenum: 1,
                pagesize: 10
            },
            // 存储获取到的列表数据
            goodsList: [],
            // 分页相关功能数据
            total: 0,
            currentPage: 1
        }
    },
    created () {
        this.queryList()
    },
    methods: {
        async queryList () {
            const {
                data: res
            } = await this.$axios.get('/goods', {
                params: this.queryInfo
            })
            if (res.meta.status != 200) return this.$message.error(res.meta.msg)
            this.$message({
                type: 'success',
                message: res.meta.msg
            })
            this.total = res.data.total
            this.goodsList = res.data.goods
            this.goodsList.forEach(element => {
                element.add_time = this.timeFormat(element.add_time)
                element.upd_time = this.timeFormat(element.upd_time)
            })
        },
        // 时间格式化及补0
        timeFormat (time) {
            const date = new Date(time)
            const year = date.getFullYear()
            const month = this.dateFormat(date.getMonth() + 1)
            const day = this.dateFormat(date.getDate())
            const hour = this.dateFormat(date.getHours())
            const minute = this.dateFormat(date.getMinutes())
            const second = this.dateFormat(date.getSeconds())
            return year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second
        },
        dateFormat (num) {
            return num < 10 ? '0' + num : '' + num
        },
        // 分页操作
        handleCurrentChange (newPage) {
            this.queryInfo.pagenum = newPage
            this.queryList()
        },
        handleSizeChange (newSize) {
            this.queryInfo.pagesize = newSize
            this.queryList()
        },
        // 发生跳转
        goAdd () {
            this.$router.push('/goods/add')
        },
        // 删除商品
        delGoods (row) {
            {
                console.log(row)
                this.$messagebox.confirm('确认删除该商品？', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(async () => {
                    const {
                        data: res
                    } = await this.$axios.delete(`goods/${row.goods_id}`)
                    if (res.meta.status != 200) return this.$message.error(res.meta.msg)
                    this.$message({
                        type: 'success',
                        message: '删除成功!'
                    })
                    this.queryList()
                }).catch(() => {
                    this.$message({
                        type: 'info',
                        message: '已取消删除'
                    })
                })
            }
        }
    }
}
</script>

<style lang="less" scoped>

</style>
