<template>
<div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>商品管理</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/params' }">分类参数</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card class="box-card">
        <el-alert title="只允许给第三级分类设置相关参数！" type="warning" show-icon :closable="false">
        </el-alert>
        <el-row class="cat_select">
            <el-col>
                <span>选择商品分类：</span>
                <el-cascader :options="cateList" v-model="selectCatId" :props="{ expandTrigger: 'hover', value: 'cat_id', label: 'cat_name', children: 'children',}" @change="handleSelChange">
                </el-cascader>
            </el-col>
        </el-row>
        <el-tabs type="border-card" v-model="activeName" @tab-click="handleTabChange">
            <el-tab-pane label="动态参数" name="many" :disabled="isDisabled">
                <el-button type="primary" size="mini" :disabled="isDisabled" @click="showAddDialog()">添加参数</el-button>
                <el-table :data="manyList" style="width: 100%" border>
                    <!-- element UI 表格的DOM刷新与表格:data属性绑定的主体数据源改变的时间一致，而不同于绑定的对象属性值改变，其中包括展开行，
                    所有表格除了绑定数据源，不要绑定其他对象属性以免出现DOM延迟刷新异常
                    在展开行的作用域插槽内有绑定对象属性且对象属性有更新，则内部DOM直到下拉行的expand-change事件发生才会重渲染DOM
                    如果希望下拉行中的内容即时更新，则应该遍历:data绑定的数据源数组，在遍历过程将绑定属性赋值到数据源数组的每一个对象成员属性中，
                    作用域插槽只需要提取scope即可-->
                    <el-table-column type="expand" label="">
                        <template slot-scope="scope">
                            <el-tag :key="index" v-for="(item,index) in scope.row.attr_vals" closable @close="delParam(scope.row,index)">
                                {{item}}
                            </el-tag>
                            <el-input class="input-new-tag" v-if="scope.row.inputVisible" v-model="scope.row.inputValue" ref="saveTagInput" size="small" @keyup.enter.native="handleInputConfirm(scope.row)" @blur="handleInputConfirm(scope.row)">
                            </el-input>
                            <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                        </template>
                    </el-table-column>
                    <el-table-column type="index" label="No.">
                    </el-table-column>
                    <el-table-column prop="attr_name" label="参数名称">
                    </el-table-column>
                    <el-table-column label="操作">
                        <template slot-scope="scope">
                            <el-button type="primary" icon="el-icon-edit" size="small" @click="showEditDialog(scope.row)">修改</el-button>
                            <el-button type="danger" icon="el-icon-delete" size="small" @click="del(scope.row.attr_id)">删除</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </el-tab-pane>
            <el-tab-pane label="静态属性" name="only" :disabled="isDisabled">
                <el-button type="primary" size="mini" :disabled="isDisabled" @click="showAddDialog()">添加属性</el-button>
                <el-table :data="onlyList" style="width: 100%" border>
                    <el-table-column type="expand" label="">
                        <template slot-scope="scope">
                            <el-tag :key="index" v-for="(item,index) in scope.row.attr_vals" closable @close="delParam(scope.row,index)">
                                {{item}}
                            </el-tag>
                            <el-input class="input-new-tag" v-if="scope.row.inputVisible" v-model="scope.row.inputValue" ref="saveTagInput" size="small" @keyup.enter.native="handleInputConfirm(scope.row)" @blur="handleInputConfirm(scope.row)">
                            </el-input>
                            <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                        </template>
                    </el-table-column>
                    <el-table-column type="index" label="No.">
                    </el-table-column>
                    <el-table-column prop="attr_name" label="属性名称">
                    </el-table-column>
                    <el-table-column label="操作">
                        <template slot-scope="scope">
                            <el-button type="primary" icon="el-icon-edit" size="small" @click="showEditDialog(scope.row)">修改</el-button>
                            <el-button type="danger" icon="el-icon-delete" size="small" @click="del(scope.row.attr_id)">删除</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </el-tab-pane>
        </el-tabs>
    </el-card>
    <!-- 添加属性/参数公用面板 -->
    <el-dialog :title="addFormData.addDialogTitle" :visible.sync="addDialogVisible" width="30%">
        <el-form ref="addFormRef" :model="addFormData" :rules="addFormRules" label-width="150px">
            <el-form-item :label="addFormData.addDialogLabel" prop="attr_name">
                <el-input v-model="addFormData.attr_name"></el-input>
            </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
            <el-button @click="addDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="addRequest">确 定</el-button>
        </span>
    </el-dialog>
    <!-- 修改属性/参数公用面板 -->
    <el-dialog :title="editFormData.editDialogTitle" :visible.sync="editDialogVisible" width="30%">
        <el-form ref="editFormRef" :model="editFormData" :rules="addFormRules" label-width="150px">
            <el-form-item :label="editFormData.editDialogLabel" prop="attr_name">
                <el-input v-model="editFormData.attr_name"></el-input>
            </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
            <el-button @click="editDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="editRequest">确 定</el-button>
        </span>
    </el-dialog>
</div>
</template>

<script>
export default {
    data () {
        return {
            cateList: [],
            selectCatId: [],
            activeName: 'many',
            // 用两个不同的数组存储动态/静态数据
            manyList: [],
            onlyList: [],
            // 添加共用表单相关属性
            addDialogVisible: false,
            addFormData: {
                addDialogTitle: '',
                addDialogLabel: '',
                attr_name: ''
            },
            addFormRules: {
                attr_name: [{
                    required: true,
                    message: '不能为空！',
                    tigger: 'blur'
                }]
            },
            // 修改公用表单
            editDialogVisible: false,
            editFormData: {
                editDialogTitle: '',
                editDialogLabel: '',
                attr_name: '',
                attr_id: 0
            }
        }
    },
    created () {
        this.getCateList()
    },
    methods: {
        // 请求级联选择器内容
        async getCateList () {
            const {
                data: res
            } = await this.$axios.get('/categories/')
            if (res.meta.status !== 200) return
            this.cateList = res.data
        },
        // 级联选择器选中发生变化（清空列表或发起请求）
        handleSelChange () {
            if (this.selectCatId.length !== 3) {
                this.selectCatId = []
                this.manyList = []
                this.onlyList = []
                return
            }
            this.getParams()
        },
        // Tab页签发生点击切换事件(change事件会自动更新activeName)
        handleTabChange () {
            this.getParams()
        },
        // 获取动态/静态列表内容
        async getParams () {
            const {
                data: res
            } = await this.$axios.get(`/categories/${this.selectCatId[2]}/attributes/`, {
                params: {
                    sel: this.activeName
                }
            })
            if (res.meta.status !== 200) return this.$message.error('获取参数列表失败!')
            // 将字符串切割成数组,并且解决空字符串生成一个数组的bug
            res.data.forEach(element => {
                element.attr_vals = element.attr_vals ? element.attr_vals.split(' ') : []
                // 给数组的每个对象成员（参数列表每行）添加一个独立的控制标签显示隐藏的属性和存放输入内容的属性
                element.inputVisible = false
                element.inputValue = ''
            })
            if (this.activeName === 'many') { this.manyList = res.data } else this.onlyList = res.data
        },
        // 显示添加表单
        showAddDialog () {
            if (this.activeName == 'many') {
                this.addFormData.addDialogTitle = '添加动态参数'
                this.addFormData.addDialogLabel = '动态参数（必填）：'
            } else {
                this.addFormData.addDialogTitle = '添加静态属性'
                this.addFormData.addDialogLabel = '静态属性（必填）：'
            }
            this.addDialogVisible = true
        },
        // 表单预验证通过，根据flag发起添加动态属性或者静态参数的请求
        addRequest () {
            this.$refs.addFormRef.validate(async valid => {
                if (!valid) return
                const {
                    data: res
                } = await this.$axios.post(`/categories/${this.selectCatId[2]}/attributes`, {
                    attr_name: this.addFormData.attr_name,
                    attr_sel: this.activeName
                })
                if (res.meta.status != 201) return this.$message.error(res.meta.msg)
                this.$message({
                    message: res.meta.msg,
                    type: 'success'
                })
                this.addFormData.attr_name = ''
                this.addDialogVisible = false
                this.getParams()
            })
        },
        // 显示编辑页面
        showEditDialog (row) {
            if (this.activeName == 'many') {
                this.editFormData.editDialogTitle = '修改动态参数'
                this.editFormData.editDialogLabel = '动态参数（必填）：'
                this.editFormData.attr_name = row.attr_name
            } else {
                this.editFormData.editDialogTitle = '修改静态属性'
                this.editFormData.editDialogLabel = '静态属性（必填）：'
                this.editFormData.attr_name = row.attr_name
            }
            this.editFormData.attr_id = row.attr_id
            this.editDialogVisible = true
        },
        // 发送编辑请求
        editRequest () {
            this.$refs.editFormRef.validate(async valid => {
                if (!valid) return
                const {
                    data: res
                } = await this.$axios.put(`/categories/${this.selectCatId[2]}/attributes/${this.editFormData.attr_id}`, {
                    attr_name: this.editFormData.attr_name,
                    attr_sel: this.activeName
                })
                if (res.meta.status != 200) return this.$message.error(res.meta.msg)
                this.$message({
                    message: res.meta.msg,
                    type: 'success'
                })
                this.editFormData.attr_name = ''
                this.editDialogVisible = false
                this.getParams()
            })
        },
        // 删除请求
        del (attr_id) {
            this.$messagebox.confirm('请确认删除操作', '删除确认', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(async () => {
                const {
                    data: res
                } = await this.$axios.delete(`/categories/${this.selectCatId[2]}/attributes/${attr_id}`)
                if (res.meta.status != 200) return this.$message.error(res.meta.msg)
                this.$message({
                    type: 'success',
                    message: res.meta.msg
                })
                this.getParams()
            }).catch(() => {
                this.$message({
                    type: 'info',
                    message: '操作取消'
                })
            })
        },
        // 显示新增Tag输入框并获取焦点
        showInput (row) {
            row.inputVisible = true // ⬅该行为并不会立即触发页面重渲染
            // $this.$nextTick(callback)方法的作用：在Vue完成了一次刷新页面DOM元素的行为后（刷新是异步行为），立即执行括号中的回调函数，
            // 此方法可以保证回调函数操作的DOM确实已经渲染在了页面内
            // 在此处，如果回调函数内的代码直接写在方法内，则会导致this.$refs.saveTagInput获取不到input输入框（页面还没有刷新）而报错
            this.$nextTick(() => {
                this.$refs.saveTagInput.$refs.input.focus()
            })
        },
        // 参数TAG修改的核心是操作attr_vals字符串转换而来的数组，
        // 添加操作就是push到数组中并发起一次更新请求（请求中数组会转换为字符串），删除操作就是删除数组中的目标索引成员并发起一次更新请求
        // 修改参数TAG(attr_vals)的请求
        async saveAttrValue (row) {
            const {
                data: res
            } = await this.$axios.put(`categories/${this.selectCatId[2]}/attributes/${row.attr_id}`, {
                attr_name: row.attr_name,
                attr_sel: row.attr_sel,
                attr_vals: row.attr_vals.join(' ')
            })
            if (res.meta.status != 200) return this.$message.error(res.meta.msg)
            this.$message({
                type: 'success',
                message: res.meta.msg
            })
        },
        // 文本框输入结束后事件
        handleInputConfirm (row) {
            if (!row.inputValue.trim()) {
                row.inputVisible = false
                row.inputValue = ''
                return
            }
            row.attr_vals.push(row.inputValue.trim())
            this.saveAttrValue(row)
            row.inputVisible = false
            row.inputValue = ''
        },
        // 删除单个标签
        delParam (row, index) {
            // 删掉数组中的目标并发起修改请求即可
            row.attr_vals.splice(index, 1)
            this.saveAttrValue(row)
        }
    },
    computed: {
        // 控制分页及按钮的开关
        isDisabled () {
            return this.selectCatId.length !== 3
        }
    }
}
</script>

<style lang="less" scoped>
.cat_select {
    margin-top: 20px;

    .el-cascader {
        width: 15%;
    }
}

.el-tag {
    margin: 15px;
}

.button-new-tag {
    margin-left: 15px;
}

.input-new-tag {
    margin-left: 15px;
    width: 150px;
}

.el-tabs {
    margin-top: 20px;
}
</style>
