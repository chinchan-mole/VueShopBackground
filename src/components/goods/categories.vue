<template>
<div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>商品管理</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/roles' }">商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 内容区 -->
    <el-card class="box-card">
        <el-row>
            <el-button type="primary" @click="showAddCatForm">添加分类</el-button>
        </el-row>
        <!-- 表格区 使用第三方树形表格插件 -->
        <zk-table :data="cateList" :columns="columns" :selection-type="false" :expand-type="false" :show-index="true" :border="true">
            <!-- 在表格中定义命名的作用域插槽，slot是给插槽命名，slot-scope是获取单个作用域的数据 -->
            <template slot="isok" slot-scope="scope">
                <i :class="scope.row.cat_deleted ? 'el-icon-error' : 'el-icon-success'" :style="scope.row.cat_deleted ? 'color:red' : 'color:green'"></i>
            </template>
            <template slot="level" slot-scope="scope">
                <el-tag v-if="scope.row.cat_level === 0">一级</el-tag>
                <el-tag type="success" v-else-if="scope.row.cat_level === 1">二级</el-tag>
                <el-tag type="warning" v-else>三级</el-tag>
            </template>
            <template slot="handle" slot-scope="scope">
                <el-button type="primary" icon="el-icon-setting" size="small" @click="showEditDialog(scope.row.cat_name,scope.row.cat_id)">编辑</el-button>
                <el-button type="danger" icon="el-icon-delete" size="small" @click="delComfirm(scope.row.cat_name,scope.row.cat_id)">删除</el-button>
            </template>
        </zk-table>
        <!-- 分页区 -->
        <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :page-sizes="[5, 10, 20, 30]" :page-size="cateQueryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="paginationInfo.total">
        </el-pagination>
    </el-card>
    <!-- 添加分类表单 -->
    <el-dialog title="添加商品分类" :visible.sync="addDialogVisible" width="30%" @close="clearAddForm">
        <el-form ref="addCatFormRef" :model="addCatForm" label-width="200px" :rules="addCatFormRules">
            <el-form-item label="分类名称（必填）：" prop="cat_name">
                <el-input v-model="addCatForm.cat_name"></el-input>
            </el-form-item>
            <el-form-item label="父级分类（不选默认一级）：">
                <!-- 注：在级联选择器的props属性中，value为数据源中的哪个属性作为表单组件的值，label是显示哪个属性，children是以父级中哪个属性作为父子之间的嵌套关系，v-model会将选中的表单组件值与谁（数组）双向绑定 -->
                <el-cascader v-model="addCatFathersId" :options="fatherCatList" :props="{ expandTrigger: 'hover', value: 'cat_id', label: 'cat_name', children: 'children', checkStrictly: true}" clearable @change="selectFatherCat"></el-cascader>
            </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
            <el-button @click="addDialogVisible = false ;">取 消</el-button>
            <el-button type="primary" @click="addCate">确 定</el-button>
        </span>
    </el-dialog>
    <!-- 编辑分类表单 -->
    <el-dialog title="编辑分类" :visible.sync="editDialogVisible" width="30%">
        <el-form ref="editFormRef" :model="editCatForm" label-width="150px">
            <el-form-item label="分类名称（必填）：" prop="cat_name">
                <el-input v-model="editCatForm.cat_name"></el-input>
            </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
            <el-button @click="editDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="editCat">确 定</el-button>
        </span>
    </el-dialog>
</div>
</template>

<script>
export default {
    data() {
        return {
            //添加商品分类对话框开关
            addDialogVisible: false,
            //分类列表容器
            cateList: [],
            //树形表格列配置文件
            columns: [{
                    label: "分类名称", //列名称
                    prop: 'cat_name', //列显示数据所绑定的数组成员对象的属性名称
                },
                {
                    label: '是否有效',
                    type: 'template', //该列使用自定义模板
                    template: 'isok', //模板使用哪个插槽
                },
                {
                    label: '排序',
                    type: 'template',
                    template: 'level'
                },
                {
                    label: '操作',
                    type: 'template',
                    template: 'handle'
                },
            ],
            //分类列表查询参数设置（影响到分页功能）
            cateQueryInfo: {
                type: 3,
                pagenum: 1,
                pagesize: 5
            },
            // 分页其他数据保存处
            paginationInfo: {
                total: 0,
            },
            //所有分类信息存储位置
            fatherCatList: [],
            //添加分类表单及对应表单规则
            addCatForm: {
                cat_pid: 0,
                cat_name: '',
                cat_level: 0,
            },
            //添加表单中选中父级分类的ID数组
            addCatFathersId: [],
            addCatFormRules: {
                cat_name: [{
                    required: true,
                    message: '名称不得为空！',
                    tigger: 'blur'
                }]
            },
            //编辑分类表单显示开关
            editDialogVisible: false,
            //编辑分类存储
            editCatForm: {
                cat_name: '',
                cat_id: '',
            },
            editCatFormRules: {
                cat_name: [{
                    required: true,
                    message: '名称不得为空！',
                    tigger: 'blur'
                }]
            },
        }
    },
    created() {
        this.getCateList();
    },
    methods: {
        //请求分类树形列表
        async getCateList() {
            let {
                data: res
            } = await this.$axios.get('/categories/', {
                params: this.cateQueryInfo
            });
            this.cateList = res.data.result;
            this.paginationInfo.total = res.data.total;
        },
        //分页的每页展示数量改变的行为
        handleSizeChange(newSize) {
            this.cateQueryInfo.pagesize = newSize;
            this.getCateList();
        },
        //分页的当前页码发生改变的行为
        handleCurrentChange(newPage) {
            this.cateQueryInfo.pagenum = newPage;
            this.getCateList();
        },
        //显示添加分类列表
        async showAddCatForm() {
            let {
                data: res
            } = await this.$axios.get('/categories/', {
                params: {
                    type: 2
                }
            });
            if (res.meta.status !== 200) return;
            this.fatherCatList = res.data;
            this.addDialogVisible = true;
        },
        //添加表单级联选择器选项发生变化的事件
        selectFatherCat() {
            //先根据数组长度确认要添加的是几集分类，然后分情况更新数据
            if (this.addCatFathersId.length === 0) {
                this.addCatForm.cat_pid = 0;
                this.addCatForm.cat_level = 0;
            } else if (this.addCatFathersId.length === 1) {
                this.addCatForm.cat_pid = this.addCatFathersId[0];
                this.addCatForm.cat_level = 1;
            } else {
                this.addCatForm.cat_pid = this.addCatFathersId[1];
                this.addCatForm.cat_level = 2;
            }
        },
        addCate() {
            this.$refs.addCatFormRef.validate(async valid => {
                if (!valid) return;
                let {
                    data: res
                } = await this.$axios.post('/categories/', this.addCatForm);
                if (res.meta.status != 201) return this.$message.error("添加失败!");
                this.$message({
                    message: res.meta.msg,
                    type: "success",
                });
                this.clearAddForm();
                this.addDialogVisible = false;
                this.getCateList();
            })
        },
        //重置添加分类表单
        clearAddForm() {
            this.addCatForm.cat_pid = 0;
            this.addCatForm.cat_name = '';
            this.addCatForm.cat_level = 0;
            this.addCatFathersId = [];
        },
        //删除确认
        delComfirm(cat_name, cat_id) {
            this.$messagebox.confirm('是否删除?', '删除确认', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(async () => {
                let {
                    data: res
                } = await this.$axios.delete(`/categories/${cat_id}`, {
                    cat_name: cat_name
                })
                if (res.meta.status !== 200) return this.$message.error("删除失败!");
                this.getCateList();
                this.$message({
                    type: 'success',
                    message: '删除成功!'
                });
            }).catch(() => {
                this.$message({
                    type: 'info',
                    message: '已取消删除'
                });
            });
        },
        //显示编辑表单并填充数据
        showEditDialog(cat_name, cat_id) {
            this.editCatForm.cat_name = cat_name;
            this.editCatForm.cat_id = cat_id;
            this.editDialogVisible = true;
        },
        //编辑预验证与提交请求,编辑表单无需清空，毕竟点其他的编辑新数据会覆盖旧数据
        editCat() {
            this.$refs.editFormRef.validate(async valid => {
                if (!valid) return;
                let {
                    data: res
                } = await this.$axios.put(`/categories/${this.editCatForm.cat_id}`, {
                    cat_name: this.editCatForm.cat_name
                });
                if (res.meta.status != 200) return this.$message.error('修改失败！');
                this.editDialogVisible = false;
                this.getCateList();
                this.$message({
                    type: 'success',
                    message: res.meta.msg
                });

            })
        }
    },
}
</script>

<style>
.zk-table {
    margin-top: 20px;
}

.el-cascader {
    width: 100%;
}
</style>
