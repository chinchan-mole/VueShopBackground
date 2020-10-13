<template>
<div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>数据统计</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/reports' }">数据报表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card class="box-card">
        <div id="main" style="width:850px;height:600px;"></div>
    </el-card>
</div>
</template>

<script>
// 在组件中按需引入echarts
import echarts from 'echarts'
// 导入lodash
import _ from 'lodash'
export default {
    data () {
        return {
            // 图表配置项
            options: {
                title: {
                    text: '用户来源'
                },
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'cross',
                        label: {
                            backgroundColor: '#E9EEF3'
                        }
                    }
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '3%',
                    containLabel: true
                },
                xAxis: [{
                    boundaryGap: false
                }],
                yAxis: [{
                    type: 'value'
                }]
            },
            reportData: {}
        }
    },
    mounted () {
        // 渲染echarts的操作必须在mounted周期函数中（因为这时候才有dom,echarts基于dom渲染）
        this.getReport()
    },
    methods: {
        async getReport () {
            const {
                data: res
            } = await this.$axios.get('reports/type/1')
            if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
            this.$message({
                type: 'success',
                message: res.meta.msg
            })
            // 将返回对象与option合并
            const result = _.merge(res.data, this.options)
            var myChart = echarts.init(document.getElementById('main'))
            myChart.setOption(result)
        }
    }
}
</script>

<style lang="less" scoped>

</style>
