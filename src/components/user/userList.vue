<template>
<div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>用户管理</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/users' }">用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 内容区 -->
    <el-card class="box-card">
        <!-- 搜索与添加 -->
        <el-row :gutter="20">
            <el-col :span="8">
                <el-input placeholder="请输入内容" v-model="queryUserParams.query" :clearable="true" @clear="getUserList" @keyup.enter.native="getUserList">
                    <el-button slot="append" icon="el-icon-search" @click.native="getUserList"></el-button>
                </el-input>
            </el-col>
            <el-col :span="2">
                <el-button type="primary" @click="dialogVisible = true">添加用户</el-button>
            </el-col>
        </el-row>
        <!-- 表格区 -->
        <el-table :data="users" border stripe>
            <el-table-column type="index" label="No." width="80">
            </el-table-column>
            <el-table-column prop="username" label="姓名" width="180">
            </el-table-column>
            <el-table-column prop="email" label="邮箱">
            </el-table-column>
            <el-table-column prop="mobile" label="电话">
            </el-table-column>
            <el-table-column prop="role_name" label="角色">
            </el-table-column>
            <el-table-column prop="mgstate" label="状态">
                <!-- 通过作用域插槽分别渲染每行的开关状态，scope.row是每个作用域的形参对象,这个对象是可以用于双向绑定的 -->
                <template slot-scope="scope">
                    <el-switch v-model="scope.row.mg_state" active-color="#13ce66" inactive-color="#ff4949" @change="changeState(scope.row.mg_state, scope.row.id)">
                    </el-switch>
                </template>
            </el-table-column>
            <el-table-column label="操作">
                <template slot-scope="handle">
                    <el-tooltip effect="dark" content="编辑" placement="top-start" :enterable="false">
                        <el-button type="primary" icon="el-icon-edit" circle @click.native="showEditDialog(handle.row)"></el-button>
                    </el-tooltip>
                    <el-tooltip effect="dark" content="删除" placement="top-start" :enterable="false">
                        <el-button type="danger" icon="el-icon-delete" circle @click.native="showDelConfirm(handle.row)"></el-button>
                    </el-tooltip>
                    <el-tooltip effect="dark" content="分配角色" placement="top-start" :enterable="false">
                        <el-button type="warning" icon="el-icon-star-off" circle @click="showRoleForm(handle.row)"></el-button>
                    </el-tooltip>
                </template>
            </el-table-column>
        </el-table>
        <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryUserParams.pagenum" :page-sizes="[2, 5, 10, 20]" :page-size="queryUserParams.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total">
        </el-pagination>
    </el-card>
    <!-- 添加用户表单 -->
    <el-dialog title="添加用户" :visible.sync="dialogVisible" width="50%" @close="addDialogClosed">
        <el-form :model="addUserForm" ref="addUserFormRef" :rules="rules" label-width="130px" label-position="right">
            <el-form-item label="用户名（必填）：" prop="username">
                <el-input v-model="addUserForm.username"></el-input>
            </el-form-item>
            <el-form-item label="密码（必填）：" prop="password">
                <el-input v-model="addUserForm.password" type="password"></el-input>
            </el-form-item>
            <el-form-item label="邮箱（可选）：" prop="email">
                <el-input v-model="addUserForm.email"></el-input>
            </el-form-item>
            <el-form-item label="手机号（可选）：" prop="mobile">
                <el-input v-model="addUserForm.mobile"></el-input>
            </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
            <el-button @click="dialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="addUser">确 定</el-button>
        </span>
    </el-dialog>
    <!-- 修改表单,可共享同一套rules校验规则 -->
    <el-dialog title="修改用户信息" :visible.sync="editDialogVisible" width="50%">
        <el-form :model="editUserForm" ref="editUserFormRef" :rules="rules" label-width="130px" label-position="right">
            <el-form-item label="用户名：" prop="username">
                <el-input v-model="editUserForm.username" :disabled="true"></el-input>
            </el-form-item>
            <el-form-item label="邮箱（可选）：" prop="email">
                <el-input v-model="editUserForm.email"></el-input>
            </el-form-item>
            <el-form-item label="手机号（可选）：" prop="mobile">
                <el-input v-model="editUserForm.mobile"></el-input>
            </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
            <el-button @click="editDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="editUser">确 定</el-button>
        </span>
    </el-dialog>
    <!-- 删除用户确认表单 -->
    <el-dialog title="删除用户" :visible.sync="delDialogVisible" width="30%">
        <span><i class="el-icon-warning"></i>用户删除操作不可逆，请确认是否删除名为"{{delUserName}}"的用户?</span>
        <span slot="footer" class="dialog-footer">
            <el-button @click="delDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="delUser">确 定</el-button>
        </span>
    </el-dialog>
    <!-- 分配角色表单 -->
    <el-dialog title="分配角色" :visible.sync="roleDialogVisible" width="20%" @close="setRoleId = ''">
        <p>用户名：{{setRoleUserForm.username}}</p>
        <p>id：{{setRoleUserForm.id}}</p>
        <p>角色：{{setRoleUserForm.role}}</p>
        <p>角色变更为：
            <el-select v-model="setRoleId" placeholder="请选择">
                <el-option v-for="item in rolesMenu" :key="item.id" :label="item.roleName" :value="item.id">
                </el-option>
            </el-select>
        </p>
        <span slot="footer" class="dialog-footer">
            <el-button @click="roleDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="setRole">确 定</el-button>
        </span>
    </el-dialog>
</div>
</template>

<script>
export default {
    data() {
        //自定义手机号、邮箱校验规则（）
        var checkEmail = (rule, value, cb) => {
            const emailReg = /[\w!#$%&'*+/=?^_`{|}~-]+(?:\.[\w!#$%&'*+/=?^_`{|}~-]+)*@(?:[\w](?:[\w-]*[\w])?\.)+[\w](?:[\w-]*[\w])?/;
            //校验通过，直接返回调用回调函数cb退出校验，不通过则利用回调函数报错
            if (emailReg.test(value) || value == '') return cb()
            cb(new Error("请输入合法的邮箱"))
        };
        var checkMobile = (rule, value, cb) => {
            const mobileReg = /^1([358][0-9]|4[579]|66|7[0135678]|9[89])[0-9]{8}$/;
            if (mobileReg.test(value) || value == '') return cb()
            cb(new Error("请输入合法的手机号码"))
        };
        return {
            total: 0,
            queryUserParams: {
                query: '',
                pagenum: 1,
                pagesize: 5,
            },
            users: [],
            dialogVisible: false,
            editDialogVisible: false,
            delDialogVisible: false,
            roleDialogVisible: false,
            rolesMenu: [],
            setRoleId: '',
            addUserForm: {
                username: '',
                password: '',
                email: '',
                mobile: '',
            },
            editUserForm: {
                id: 0,
                username: '',
                email: '',
                mobile: '',
            },
            delUserName: '',
            delUserId: 0,
            setRoleUserForm: {
                username: '',
                id: 0,
                role: '',
            },
            rules: {
                username: [{
                        required: true,
                        message: "必须输入用户名！",
                        trigger: "blur"
                    },
                    {
                        min: 5,
                        max: 12,
                        message: "用户名长度需要在5-12位之间",
                        trigger: "blur"
                    },
                ],
                password: [{
                        required: true,
                        message: "必须输入密码！",
                        trigger: "blur"
                    },
                    {
                        min: 6,
                        message: "密码长度至少为6位",
                        trigger: "blur"
                    },
                ],
                email: [{
                    validator: checkEmail,
                    required: false,
                    trigger: "blur"
                }],
                mobile: [{
                    validator: checkMobile,
                    required: false,
                    trigger: "blur"
                }],
            },
        }
    },
    created: async function () {
        this.getUserList();
    },
    methods: {
        //获取用户列表+用户名查询用户+清空查询框
        getUserList: async function () {
            let {
                data: res
            } = await this.$axios.get('/users', {
                params: this.queryUserParams
            });
            if (res.meta.status != 200) return this.$message.error("用户列表获取失败");
            this.users = res.data.users;
            this.total = res.data.total;
        },
        //每页显示条数发生改变的事件
        handleSizeChange: function (newSize) {
            this.queryUserParams.pagesize = newSize;
            this.getUserList();
        },
        //页码发生改变的事件
        handleCurrentChange: function (newPagenum) {
            this.queryUserParams.pagenum = newPagenum;
            this.getUserList();
        },
        //修改用户状态
        changeState: async function (state, id) {
            let {
                data: res
            } = await this.$axios.put('/users/' + id + '/state/' + state);
            if (res.meta.status != 200) return this.$message.error("状态修改失败");
            this.$message({
                message: res.meta.msg,
                type: "success",
            });
        },
        //清空添加表单
        addDialogClosed() {
            this.$refs.addUserFormRef.resetFields();
        },
        //添加新用户
        addUser() {
            this.$refs.addUserFormRef.validate(async valid => {
                if (!valid) return
                //验证通过则发起添加请求
                let {
                    data: res
                } = await this.$axios.post('/users', this.addUserForm);
                if (res.meta.status != 201) return this.$message.error("新增操作失败!");
                this.dialogVisible = false;
                this.getUserList();
                this.$message({
                    message: res.meta.msg,
                    type: "success",
                });
            })
        },
        //显示编辑用户对话框并填充内容
        showEditDialog(row) {
            this.editUserForm.username = row.username;
            this.editUserForm.email = row.email;
            this.editUserForm.mobile = row.mobile;
            this.editUserForm.id = row.id;
            this.editDialogVisible = true;
        },
        //编辑的预验证及发起请求
        editUser() {
            this.$refs.editUserFormRef.validate(async valid => {
                if (!valid) return
                //预验证通过则发起添加请求
                let {
                    data: res
                } = await this.$axios.put('/users/' + this.editUserForm.id, {
                    id: this.editUserForm.id,
                    email: this.editUserForm.email,
                    mobile: this.editUserForm.mobile,
                });
                if (res.meta.status != 200) return this.$message.error(res.meta.msg);
                this.editDialogVisible = false;
                this.getUserList();
                this.$message({
                    message: res.meta.msg,
                    type: "success",
                });
            });
        },
        //显示删除用户弹出框
        showDelConfirm(row) {
            this.delUserName = row.username;
            this.delUserId = row.id;
            this.delDialogVisible = true;
        },
        //确认用户删除
        async delUser() {
            let {
                data: res
            } = await this.$axios.delete('/users/' + this.delUserId, {
                params: {
                    id: this.delUserId
                }
            });
            if (res.meta.status != 200) return this.$message.error("删除失败!");
            this.delDialogVisible = false;
            this.$message({
                message: res.meta.msg,
                type: "success",
            });
            this.getUserList();
        },
        //显示用户角色分配表单并获取用户的角色ID
        async showRoleForm(row) {
            this.setRoleUserForm.id = row.id;
            this.setRoleUserForm.username = row.username;
            this.setRoleUserForm.role = row.role_name;
            let {
                data: res
            } = await this.$axios.get('/roles');
            if (res.meta.status !== 200) return;
            this.rolesMenu = res.data;
            this.roleDialogVisible = true;
        },
        //分配角色请求
        async setRole() {
            if(!this.setRoleId) return this.$message.error('请选择要分配的身份！');
            let {
                data: res
            } = await this.$axios.put(`/users/${this.setRoleUserForm.id}/role`, {
                rid: this.setRoleId
            });
            if (res.meta.status !== 200) return;
            this.$message({
                message: res.meta.msg,
                type: "success",
            });
            this.getUserList();
            this.roleDialogVisible = false;
        }
    }
};
</script>

<style lang="less" scoped>
</style>
