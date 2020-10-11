<template>
<div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>商品管理</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/goods' }">商品列表</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/goods/add' }">添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 内容区 -->
    <el-card class="box-card">
        <el-alert title="添加商品信息" type="info" show-icon center :closable="false">
        </el-alert>
        <!-- 步骤条 -->
        <el-steps :active="steps - 0" finish-status="success" align-center process-status="finish">
            <el-step title="基本信息"></el-step>
            <el-step title="商品参数"></el-step>
            <el-step title="商品属性"></el-step>
            <el-step title="商品图片"></el-step>
            <el-step title="商品内容"></el-step>
            <el-step title="完成"></el-step>
        </el-steps>
        <!-- 左侧tab栏与整个提交表单 -->
        <el-form ref="addFormRef" :model="addForm" :rules="addFormRules" label-width="120px" label-position="top">
            <el-tabs tab-position="left" v-model="steps" :before-leave="beforeTabLeave" @tab-click="tabClick">
                <el-tab-pane label="基本信息">
                    <el-form-item label="商品名称(必填)" prop="goods_name">
                        <el-input v-model="addForm.goods_name"></el-input>
                    </el-form-item>
                    <el-form-item label="商品价格(必填)" prop="goods_price">
                        <el-input v-model="addForm.goods_price" type="number"></el-input>
                    </el-form-item>
                    <el-form-item label="商品重量(必填)" prop="goods_weight">
                        <el-input v-model="addForm.goods_weight"></el-input>
                    </el-form-item>
                    <el-form-item label="商品数量(必填)" prop="goods_number">
                        <el-input v-model="addForm.goods_number" type="number"></el-input>
                    </el-form-item>
                    <el-form-item label="商品分类(必选)" prop="goods_cat">
                        <el-cascader clearable :options="cateList" v-model="selectCatId" style="width: 300px" :props="{ expandTrigger: 'hover', value: 'cat_id', label: 'cat_name', children: 'children',}" @change="handleSelChange">
                        </el-cascader>
                    </el-form-item>
                </el-tab-pane>
                <el-tab-pane label="商品参数">
                    <el-form-item :label="item1.attr_name" :key="item1.attr_id" v-for="item1 in manyListData">
                        <el-checkbox-group v-model="item1.attr_vals">
                            <el-checkbox :label="item2" :key="index2" v-for="(item2,index2) in item1.attr_vals" border></el-checkbox>
                        </el-checkbox-group>
                    </el-form-item>
                </el-tab-pane>
                <el-tab-pane label="商品属性">
                    <el-form-item :label="item.attr_name" :key="item.attr_id" v-for="item in onlyListData">
                        <el-input v-model="item.attr_vals"></el-input>
                    </el-form-item>
                </el-tab-pane>
                <el-tab-pane label="商品图片">
                    <!-- action图片上传地址 onpreview 预览事件 移除事件  呈现效果（缩略图或者文件列表） ,由于eleui的图片上传不走axios，而后台要求token验证，所以需要单独设置请求头字段-->
                    <el-upload action="http://127.0.0.1:8888/api/private/v1/upload" :on-preview="handlePreview" :on-remove="handleRemove" list-type="picture" :headers="headerObj" :on-success="onSuccess">
                        <el-button size="small" type="primary">添加图片</el-button>
                        <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
                    </el-upload>
                </el-tab-pane>
                <el-tab-pane label="商品内容">
                    <quill-editor ref="myQuillEditor" v-model="addForm.goods_introduce" />
                    <el-button type="primary" @click="addGoods" class="btnAdd">添加商品</el-button>
                </el-tab-pane>
            </el-tabs>
        </el-form>
    </el-card>
    <!-- 图片预览 -->
    <el-dialog title="图片预览" :visible.sync="previewVisible" width="60%" @close="previewVisible = false" center>
        <el-image style="width: 100%; height: 100%" :src="previewUrl" fit="contain"></el-image>
    </el-dialog>
</div>
</template>

<script>
import _ from "lodash"
export default {
    data() {
        return {
            //步骤进度
            steps: '0',
            //表单私有数据
            addForm: {
                goods_name: '',
                goods_cat: '',
                goods_price: 0,
                goods_number: 0,
                goods_weight: 0,
                goods_introduce: '',
                pics: [], //图片路径是个数组，因为一个商品可能有多个图片，每个数组成员就是一个图片的地址
                attrs: []
            },
            //表单验证规则
            addFormRules: {
                goods_name: [{
                    required: true,
                    message: '名称不能为空！',
                    tigger: 'blur'
                }],
                goods_price: [{
                    required: true,
                    message: '价格不能为空！',
                    tigger: 'blur'
                }],
                goods_weight: [{
                    required: true,
                    message: '重量不能为空！',
                    tigger: 'blur'
                }],
                goods_number: [{
                    required: true,
                    message: '数量不能为空！',
                    tigger: 'blur'
                }],
                goods_cat: [{
                    required: true,
                    message: '必须选择分类',
                    tigger: 'blur'
                }],
            },
            //级联选择器数据存储
            cateList: [],
            //级联选择器的选中id数组
            selectCatId: [],
            //存储请求到的三级动态静态分类信息
            manyListData: [],
            onlyListData: [],
            //图片上传请求添加携带token头
            headerObj: {
                Authorization: window.sessionStorage.getItem('token')
            },
            previewVisible: false,
            previewUrl: '',
        }
    },
    created() {
        this.getCateList();
    },
    methods: {
        //请求级联选择器内容
        async getCateList() {
            let {
                data: res
            } = await this.$axios.get('/categories/');
            if (res.meta.status !== 200) return;
            this.cateList = res.data;
        },
        //级联选择器选中发生变化
        handleSelChange() {
            if (this.selectCatId.length !== 3) {
                this.selectCatId = [];
            }
            this.addForm.goods_cat = this.selectCatId.join(',');
        },
        beforeTabLeave(activeName, oldActiveName) {
            if (oldActiveName === '0' && this.addForm.goods_cat.length === 0) {
                this.$message.error('请先选择分类再去其他页面');
                return false
            }
            return true
        },
        //点击分页获取动态参数与静态属性
        async tabClick() {
            //如果跳转进了参数页面则发起获取动态参数请求
            if (this.steps === '1') {
                //这里直接取级联选择器数组的最后一项this.selectCatId[2]即为三级分类的id
                let {
                    data: res
                } = await this.$axios.get(`categories/${this.selectCatId[2]}/attributes`, {
                    params: {
                        sel: 'many'
                    }
                });
                if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
                this.$message({
                    type: 'success',
                    message: res.meta.msg
                });
                //让非空字符串变数组，空字符串变空数组
                res.data.forEach(element => {
                    if (element.attr_vals !== '') element.attr_vals = element.attr_vals.split(' ')
                    else element.attr_vals = []
                })
                this.manyListData = res.data;
                console.log(this.manyListData);
            }
            //如果跳转进了属性页面则发起获取静态属性请求
            if (this.steps === '2') {
                let {
                    data: res2
                } = await this.$axios.get(`categories/${this.selectCatId[2]}/attributes`, {
                    params: {
                        sel: 'only'
                    }
                });
                if (res2.meta.status !== 200) return this.$message.error(res2.meta.msg);
                this.$message({
                    type: 'success',
                    message: res2.meta.msg
                });
                this.onlyListData = res2.data;
            }
        },
        //图片预览
        handlePreview(file) {
            this.previewUrl = file.response.data.url;
            this.previewVisible = true;
        },
        //删除图片
        handleRemove(file) {
            //1.获取删除图片的临时路径
            const tmpPath = file.response.data.tmp_path;
            //2.在数组中查到该路径对应的索引值并删掉该成员同时退出遍历
            this.addForm.pics.forEach((element, index) => {
                if (element.pic === tmpPath) {
                    this.addForm.pics.splice(index, 1);
                    return
                }
            })
        },
        //一张图片上传成功后的操作
        onSuccess(res) {
            if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
            this.$message({
                type: 'success',
                message: res.meta.msg
            });
            this.addForm.pics.push({
                pic: res.data.tmp_path
            });
        },
        //添加商品
        async addGoods() {
            this.$refs.addFormRef.validate(async valid => {
                if (!valid) return this.$message.error('请检查必填项目是否填写完毕');
                //发起请求前的预处理 1.深拷贝原来的表单数据对象，所有的预处理操作以及最后提交只基于该拷贝对象,将操作与私有数据隔离  2.attr动静态参数的处理 
                let form = _.cloneDeep(this.addForm);
                let manyAttrData = [];
                let onlyAttrData = [];
                //动态参数预处理
                this.manyListData.forEach(element => {
                    manyAttrData.push({
                        attr_id: element.attr_id,
                        attr_value: element.attr_vals.join(' ')
                    })
                });
                //静态参数预处理
                this.onlyListData.forEach(element => {
                    onlyAttrData.push({
                        attr_id: element.attr_id,
                        attr_value: element.attr_vals
                    })
                });
                //参数数组合并
                form.attrs = [...onlyAttrData, ...manyAttrData];
                console.log(form);
                //发起请求
                let {
                    data: res
                } = await this.$axios.post(`goods`, form);
                if (res.meta.status != 201) return this.$message.error(res.meta.msg);
                this.steps = '6';
                this.$notify({
                    title: '商品创建成功',
                    message: `3秒后返回商品列表页面`,
                    type: 'success',
                    duration: 3000,
                    onClose: () => {
                        this.$router.push('/goods/');
                    }
                });
            })
        }
    },
}
</script>

<style lang="less" scoped>
.el-step {
    margin: 20px 0;

    .el-step__title {
        font-size: 14px;
    }
}

.el-input {
    margin-bottom: 20px
}

.el-checkbox {
    margin-left: 0 !important;
}

.btnAdd {
    margin-top: 20px;
}
</style>
