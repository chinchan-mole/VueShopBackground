<template>
<div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>权限管理</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/rights' }">权限列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 内容区 -->
    <el-card class="box-card">
        <!-- 表格区 stripe是隔行变色 -->
        <el-table :data="rightList" border stripe>
            <el-table-column type="index" label="No." width="100">
            </el-table-column>
            <el-table-column prop="authName" label="权限名称" width="380">
            </el-table-column>
            <el-table-column prop="path" label="路径">
            </el-table-column>
            <el-table-column prop="level" label="权限等级">
                <!-- 利用作用域插槽和v-if按需展示标签 -->
                <template slot-scope="scope">
                    <el-tag v-if="scope.row.level == 0">一级</el-tag>
                    <el-tag v-else-if="scope.row.level == 1" type="success">二级</el-tag>
                    <el-tag v-else type="warning">三级</el-tag>
                </template>
            </el-table-column>
        </el-table>
    </el-card>
</div>
</template>

<script>
export default {
    data () {
        return {
            rightList: []
        }
    },
    created () {
        this.getRightList()
    },
    methods: {
        async getRightList () {
            const {
                data: res
            } = await this.$axios.get('rights/list')
            if (res.meta.status != 200) return this.$message.error('获取权限列表失败')
            this.rightList = res.data
        }
    }
}
</script>

<style lang="less" scoped>

</style>
