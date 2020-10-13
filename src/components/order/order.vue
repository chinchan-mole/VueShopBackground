<template>
<div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>订单管理</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/orders' }">订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card class="box-card">
        <!-- 搜索 -->
        <el-row :gutter="20">
            <el-col :span="8">
                <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="queryInfo.query = ''; queryOrders()">
                    <el-button slot="append" icon="el-icon-search" @click="queryOrders"></el-button>
                </el-input>
            </el-col>
        </el-row>
        <el-table :data="ordersList" style="width: 100%" border stripe>
            <el-table-column type="index" label="No." width="100">
            </el-table-column>
            <el-table-column prop="order_number" label="订单编号">
            </el-table-column>
            <el-table-column prop="order_price" label="订单价格" width="80">
            </el-table-column>
            <el-table-column prop="pay_status" label="是否付款" width="80">
                <template slot-scope="scope">
                    <el-tag type="success" v-if="scope.row.pay_status == 1">已付款</el-tag>
                    <el-tag type="danger" v-else>未付款</el-tag>
                </template>
            </el-table-column>
            <el-table-column prop="is_send" label="是否发货" width="80">
            </el-table-column>
            <el-table-column prop="create_time" label="下单时间" width="180">
            </el-table-column>
            <el-table-column prop="update_time" label="最后修改时间" width="180">
            </el-table-column>
            <el-table-column label="操作" width="120">
                <template>
                    <el-tooltip class="item" effect="light" content="修改收货地址" placement="bottom-start">
                        <el-button type="primary" icon="el-icon-edit" size="small" @click="showEditDialog"></el-button>
                    </el-tooltip>
                    <el-tooltip class="item" effect="light" content="查看物流信息" placement="bottom-start">
                        <el-button type="success" icon="el-icon-location-outline" size="small" @click="showProgress"></el-button>
                    </el-tooltip>
                </template>
            </el-table-column>
        </el-table>
        <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum" :page-sizes="[5, 10, 20, 30]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total">
        </el-pagination>
    </el-card>
    <!-- 修改收货地址 -->
    <el-dialog title="修改地址" :visible.sync="editDialogVisible" width="680px" @close="cleanForm">
        <el-form :model="addressForm" :rules="addressFormRules" ref="addressFormRef" label-width="100px" class="demo-ruleForm">
            <el-form-item label="省-市-区/县">
                <el-select v-model="setProvince" placeholder="请选择省" @change="getCity()" class="setProvince" value-key="item.center">
                    <el-option v-for="item in province" :key="item.center" :label="item.name" :value="item.name">
                    </el-option>
                </el-select>
                <el-select v-model="setCity" placeholder="请选择市" @change="getArea()" class="setProvince" :disabled="disableCity" value-key="item.center">
                    <el-option v-for="item in city" :key="item.center" :label="item.name" :value="item.name">
                    </el-option>
                </el-select>
                <el-select v-model="setArea" placeholder="请选择区/县" class="setProvince" :disabled="disableArea" value-key="item.center" @change="setAddress1">
                    <el-option v-for="item in area" :key="item.center" :label="item.name" :value="item.name">
                    </el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="详细地址" prop="address2">
                <el-input v-model="addressForm.address2"></el-input>
            </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
            <el-button @click="editDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="editAddress">确 定</el-button>
        </span>
    </el-dialog>
    <!-- 查看物流进度 -->
    <el-dialog title="查看物流" :visible.sync="progressDialogVisible" width="40%" @close="progressDialogVisible = false">
        <el-timeline :reverse="true">
            <el-timeline-item v-for="(item, index) in progressData" :key="index" :timestamp="item.time" :type="index == 0 ? 'success' : ''">
                {{item.context}}
            </el-timeline-item>
        </el-timeline>
    </el-dialog>
</div>
</template>

<script>
export default {
    data() {
        return {
            //查询及列表相关
            queryInfo: {
                query: '',
                pagenum: 1,
                pagesize: 10,
            },
            ordersList: [],
            total: 0,
            editDialogVisible: false,
            addressForm: {
                address1: '',
                address2: '',
            },
            addressFormRules: {
                address2: [{
                    required: true,
                    message: '请填写详细地址！',
                    tigger: 'blur'
                }]
            },
            //省市区县联动
            province: [],
            setProvince: '',
            //
            disableCity: true,
            city: [],
            setCity: '',
            //
            disableArea: true,
            area: [],
            setArea: '',
            //物流
            progressDialogVisible: false,
            progressData: [],
        }
    },
    created() {
        this.queryOrders();
        this.getProvince();
    },
    methods: {
        //查询列表
        async queryOrders() {
            let {
                data: res
            } = await this.$axios.get(`/orders/`, {
                params: this.queryInfo
            });
            if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
            this.$message({
                type: 'success',
                message: res.meta.msg
            });
            res.data.goods.forEach(element => {
                element.create_time = this.timeFormat(element.create_time);
                element.update_time = this.timeFormat(element.update_time);
            })
            this.ordersList = res.data.goods;
            this.total = res.data.total;
        },
        //调用高德API跨域获取城市列表
        async getProvince() {
            let mes = window.location;
            let _baseurl = `//${mes.hostname}:${mes.port}`;
            let {
                data: res
            } = await this.$axios({
                //由于设置了baseUrl，跨域请求需要重写axios的baseURL
                baseURL: _baseurl,
                method: 'get',
                url: '/amap/config/district',
                params: {
                    key: 'c1b41b8aaed225c4bd3a83b8a1c9c08c',
                }
            });
            this.province = res.districts[0].districts;
        },
        //省选择发生变化,清空市+区内容、请求市级内容、解锁市级选择、禁用区县选择
        async getCity() {
            this.setCity = '';
            this.setArea = '';
            let mes = window.location;
            let _baseurl = `//${mes.hostname}:${mes.port}`;
            let {
                data: res
            } = await this.$axios({
                //由于设置了baseUrl，跨域请求需要重写axios的baseURL
                baseURL: _baseurl,
                method: 'get',
                url: '/amap/config/district',
                params: {
                    key: 'c1b41b8aaed225c4bd3a83b8a1c9c08c',
                    keywords: this.setProvince
                }
            });
            this.city = res.districts[0].districts;
            this.disableCity = false;
            this.disableArea = true;
        },
        //市发生变化，请求区/县
        async getArea() {
            this.setArea = '';
            let mes = window.location;
            let _baseurl = `//${mes.hostname}:${mes.port}`;
            let {
                data: res
            } = await this.$axios({
                //由于设置了baseUrl，跨域请求需要重写axios的baseURL
                baseURL: _baseurl,
                method: 'get',
                url: '/amap/config/district',
                params: {
                    key: 'c1b41b8aaed225c4bd3a83b8a1c9c08c',
                    keywords: this.setCity
                }
            });
            this.area = res.districts[0].districts;
            this.disableArea = false;
        },
        //区发生变化，只需要更新address1即可
        setAddress1() {
            this.addressForm.address1 = this.setProvince + this.setCity + this.setArea;
        },
        //时间格式化及补0
        timeFormat(time) {
            let date = new Date(time);
            let year = date.getFullYear();
            let month = this.dateFormat(date.getMonth() + 1);
            let day = this.dateFormat(date.getDate());
            let hour = this.dateFormat(date.getHours());
            let minute = this.dateFormat(date.getMinutes());
            let second = this.dateFormat(date.getSeconds());
            return year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second
        },
        dateFormat(num) {
            return num < 10 ? '0' + num : '' + num;
        },
        //分页
        handleSizeChange(newSize) {
            this.queryInfo.pagesize = newSize;
            this.queryOrders();
        },
        handleCurrentChange(newPage) {
            this.queryInfo.pagenum = newPage;
            this.queryOrders();
        },
        //显示修改地址框,后台没有提供修改接口，这里只做地址联动效果和最终地址拼接
        showEditDialog() {
            this.editDialogVisible = true;
        },
        editAddress() {
            this.$refs.addressFormRef.validate(valid => {
                if (!valid || this.setArea == '') return this.$message.error('请检查地址是否填写完整！')
                this.editDialogVisible = false;
                this.$notify.info({
                    title: '消息',
                    message: `您最终输入的地址是： ${this.addressForm.address1 + '' + this.addressForm.address2}`,
                    duration: 0,
                });
                this.cleanForm();
            });
        },
        cleanForm() {
            this.setProvince = '';
            this.setCity = '';
            this.setArea = '';
            this.addressForm.address1 = '';
            this.addressForm.address2 = '';
            this.disableArea = true;
            this.disableCity = true;
        },
        //显示物流
        async showProgress() {
            let {
                data: res
            } = await this.$axios.get(`/kuaidi/1106975712662`);
            if (res.meta.status !== 200) return this.$message.error(res.meta.message);
            this.$message({
                type: 'success',
                message: res.meta.message
            });
            this.progressData = res.data;
            this.progressDialogVisible = true;
        },
    },
}
</script>

<style lang="less" scoped>
.setProvince {
    margin-right: 20px;
    width: 160px;
}
</style>
