<template>
<div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>权限管理</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/roles' }">角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 内容区 -->
    <el-card class="box-card">
        <el-row>
            <el-button type="primary" @click="dialogVisible = true">添加角色</el-button>
        </el-row>
        <!-- 表格区 stripe是隔行变色 -->
        <el-table :data="roleList" border stripe>
            <!-- 展开列 -->
            <el-table-column type="expand" label=" " width="70px">
                <template slot-scope="scope">
                    <el-row :key="item1.id" v-for="(item1, index1) in scope.row.children" :class="{'bdbottom': true, 'bdtop': isTopCol(index1),'bdleft': true,'bdright': true,'alignItemsCenter': true}">
                        <el-col :span="4">
                            <el-tag type="primary" closable @close="showRemoveRight(scope.row,item1.id)">{{item1.authName}}</el-tag>
                            <i class="el-icon-caret-right"></i>
                        </el-col>
                        <el-col :span="20" :class="{'bdleft': true}">
                            <el-row :key="item2.id" v-for="(item2,index2) in item1.children" :class="[index2 == 0 ? '' : 'bdtop','alignItemsCenter']">
                                <el-col :span="5">
                                    <el-tag type="success" closable @close="showRemoveRight(scope.row,item2.id)">{{item2.authName}}</el-tag>
                                    <i class="el-icon-caret-right"></i>
                                </el-col>
                                <el-col :span="19" :class="{'bdleft': true}">
                                    <el-tag type="warning" :key="item3.id" v-for="(item3) in item2.children" closable @close="showRemoveRight(scope.row,item3.id)">{{item3.authName}}</el-tag>
                                </el-col>
                            </el-row>
                        </el-col>
                    </el-row>
                </template>
            </el-table-column>
            <el-table-column type="index" label="No." width="100px">
            </el-table-column>
            <el-table-column prop="roleName" label="角色名称" width="380px">
            </el-table-column>
            <el-table-column prop="roleDesc" label="角色描述">
            </el-table-column>
            <el-table-column label="操作" width="400px">
                <template slot-scope="handle">
                    <el-tooltip effect="dark" content="编辑角色" placement="top-start" :enterable="false">
                        <el-button type="primary" icon="el-icon-edit" size="medium" @click.native="showEditDialog(handle.row)">编辑</el-button>
                    </el-tooltip>
                    <el-tooltip effect="dark" content="删除角色" placement="top-start" :enterable="false">
                        <el-button type="danger" icon="el-icon-delete" size="medium" @click.native="showDelDialog(handle.row)"> 删除</el-button>
                    </el-tooltip>
                    <el-tooltip effect="dark" content="分配权限" placement="top-start" :enterable="false">
                        <el-button type="warning" icon="el-icon-star-off" size="medium" @click="showSetRightDialog(handle.row)">分配权限</el-button>
                    </el-tooltip>
                </template>
            </el-table-column>
        </el-table>
    </el-card>
    <!-- 添加角色表单 -->
    <el-dialog title="添加角色" :visible.sync="dialogVisible" width="50%" @close="addDialogClosed">
        <el-form :model="addRoleForm" ref="addRoleFormRef" :rules="addRules" label-width="150px" label-position="right">
            <el-form-item label="角色名（必填）：" prop="roleName">
                <el-input v-model="addRoleForm.roleName"></el-input>
            </el-form-item>
            <el-form-item label="描述（可选）：" prop="roleDesc">
                <el-input v-model="addRoleForm.roleDesc"></el-input>
            </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
            <el-button @click="dialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="addRole">确 定</el-button>
        </span>
    </el-dialog>
    <!-- 修改表单 -->
    <el-dialog title="修改角色信息" :visible.sync="editDialogVisible" width="50%">
        <el-form :model="editRoleForm" ref="editRoleFormRef" :rules="editRules" label-width="130px" label-position="right">
            <el-form-item label="id：" prop="id">
                <el-input v-model="editRoleForm.id" :disabled="true"></el-input>
            </el-form-item>
            <el-form-item label="名称（必填）：" prop="roleName">
                <el-input v-model="editRoleForm.roleName"></el-input>
            </el-form-item>
            <el-form-item label="描述（可选）：" prop="roleDesc">
                <el-input v-model="editRoleForm.roleDesc"></el-input>
            </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
            <el-button @click="editDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="editRole">确 定</el-button>
        </span>
    </el-dialog>
    <!-- 删除角色确认表单 -->
    <el-dialog title="删除角色" :visible.sync="delDialogVisible" width="30%">
        <span><i class="el-icon-warning"></i>删除操作不可逆，请确认是否删除角色：“{{delRoleName}}”?</span>
        <span slot="footer" class="dialog-footer">
            <el-button @click="delDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="delRole">确 定</el-button>
        </span>
    </el-dialog>
    <!-- 权限分配表单 -->
    <el-dialog title="权限分配" :visible.sync="setRightDialogVisible" width="50%" @close="clearSetRightForm">
        <el-tree :data="allRights" :props="defaultProps" show-checkbox node-key="id" default-expand-all :default-checked-keys="defChkKeys" ref="treeRef"></el-tree>
        <span slot="footer" class="dialog-footer">
            <el-button @click="clearSetRightForm">取 消</el-button>
            <el-button type="primary" @click="setRight">确 定</el-button>
        </span>
    </el-dialog>
</div>
</template>

<script>
export default {
    data() {
        return {
            roleList: [],
            allRights: [],
            defaultProps: { //树形结构属性绑定
                label: 'authName', //显示标题（节点看到的字段）绑定数组中对象的authName属性
                children: 'children' //子节点绑定数组对象中的children属性
            },
            defChkKeys: [],
            dialogVisible: false,
            editDialogVisible: false,
            delDialogVisible: false,
            setRightDialogVisible: false,
            addRoleForm: {
                roleName: '',
                roleDesc: '',
            },
            editRoleForm: {
                id: 0,
                roleName: '',
                roleDesc: '',
            },
            addRules: {
                roleName: [{
                    required: true,
                    message: "必须输入名称！",
                    trigger: "blur"
                }, ]
            },
            editRules: {
                roleName: [{
                    required: true,
                    message: "角色名不能为空",
                    tigger: "blur"
                }],

            },
            delRoleId: 0,
            delRoleName: '',
            setRightRoleId: '',
        }
    },
    created() {
        this.getRoleList();
    },
    methods: {
        async getRoleList() {
            let {
                data: res
            } = await this.$axios.get('/roles');
            if (res.meta.status != 200) return this.$message.error("获取列表失败");
            this.roleList = res.data;
        },
        //关闭时清空添加表单
        addDialogClosed() {
            this.addRoleForm.roleName = '';
            this.addRoleForm.roleDesc = '';
        },
        //新增角色预校验与新增操作
        addRole() {
            this.$refs.addRoleFormRef.validate(async valid => {
                if (!valid) return
                //验证通过则发起添加请求
                let {
                    data: res
                } = await this.$axios.post('/roles', this.addRoleForm);
                if (res.meta.status != 201) return this.$message.error("创建失败!");
                this.dialogVisible = false;
                this.getRoleList();
                this.$message({
                    message: res.meta.msg,
                    type: "success",
                });
            })
        },
        //显示修改表单
        showEditDialog(row) {
            this.editRoleForm.id = row.id;
            this.editRoleForm.roleName = row.roleName;
            this.editRoleForm.roleDesc = row.roleDesc;
            this.editDialogVisible = true;
        },
        //修改角色预验证与发起修改请求
        editRole() {
            this.$refs.editRoleFormRef.validate(async valid => {
                if (!valid) return
                //验证通过则发起添加请求
                let {
                    data: res
                } = await this.$axios.put('/roles/' + this.editRoleForm.id, this.editRoleForm);
                if (res.meta.status != 200) return this.$message.error("修改失败!");
                this.editDialogVisible = false;
                this.getRoleList();
                this.$message({
                    message: '操作成功！',
                    type: "success",
                });
            })
        },
        //显示删除确认表单
        showDelDialog(row) {
            this.delRoleId = row.id;
            this.delRoleName = row.roleName;
            this.delDialogVisible = true;
        },
        //确认删除角色请求
        async delRole() {
            let {
                data: res
            } = await this.$axios.delete('/roles/' + this.delRoleId);
            if (res.meta.status != 200) return this.$message.error("删除失败!");
            this.delDialogVisible = false;
            this.getRoleList();
            this.$message({
                message: '删除成功！',
                type: "success",
            });
        },
        //判断是否为第一行
        isTopCol(index) {
            return index === 0;
        },
        //显示权限移除确认框
        showRemoveRight(role, rightId) {
            this.$messagebox.confirm('此操作将永久删除该权限, 是否继续?', '提示', {
                confirmButtonText: '我就是要删',
                cancelButtonText: '还是算了',
                type: 'warning'
            }).then(async () => { //then方法中是点确定后的操作，catch是点击取消的操作
                let {
                    data: res
                } = await this.$axios.delete(`/roles/${role.id}/rights/${rightId}`); //利用模板字符串快速拼接出请求地址
                if (res.meta.status != 200) return this.$message.error("权限移除失败!");
                role.children = res.data; //居然可以通过给形参赋值重新渲染作用域插槽的内容
                this.$message({
                    message: res.meta.msg,
                    type: "success",
                });
            }).catch(() => {
                this.$message({
                    type: 'info',
                    message: '已取消删除'
                });
            });
        },
        //显示当前角色权限分配列表，需要将当前角色通过作用域插槽传递过来，当前角色的children属性就是权限一级节点
        async showSetRightDialog(role) {
            let {
                data: res
            } = await this.$axios.get('/rights/tree/');
            if (res.meta.status != 200) return this.$message.error("出现错误");
            this.allRights = res.data;
            this.getDefChkKeys(role, this.defChkKeys);
            this.setRightRoleId = role.id;
            this.setRightDialogVisible = true;
        },
        //获取当前角色拥有的三级权限
        getDefChkKeys(node, arr) {
            if (!node.children) { //如果当前（对象）节点没有children属性则为三级节点，将节点的id值写入数组,退出递归
                return arr.push(node.id);
            } else node.children.forEach(element => { //如果当前节点有children属性，则遍历该节点的子节点，并将该节点的子节点及数组作为参数递归调用三级权限判断函数
                this.getDefChkKeys(element, arr);
            })
        },
        //清空树形结构表单的默认勾选defChkKeys数组，利用数组的spice方法，从index=0，清理数组长度个成员即可清空
        clearSetRightForm() {
            this.setRightDialogVisible = false;
            this.defChkKeys.splice(0, this.defChkKeys.length);
        },
        //修改权限
        async setRight() { //通过引用this.$refs.引用名 ，获取element标签的实例（标签中已经提前定义引用名 ref="引用名"）后，即可使用ele标签的方法了
            let rids = this.$refs.treeRef.getCheckedKeys().concat(this.$refs.treeRef.getHalfCheckedKeys());
            rids = rids.join(",");
            let {
                data: res
            } = await this.$axios.post(`/roles/${this.setRightRoleId}/rights`, {
                rids: rids
            });
            if (res.meta.status != 200) return this.$message.error("操作出现错误");
            this.$message({
                message: res.meta.msg,
                type: "success",
            });
            this.getRoleList();
            this.setRightDialogVisible = false;
        }
    }
}
</script>

<style lang="less" scoped>
.el-tag {
    margin: 10px;
}

.bdtop {
    border-top: 1px solid #eee;
}

.bdbottom {
    border-bottom: 1px solid #eee;
}

.bdleft {
    border-left: 1px solid #eee;
}

.bdright {
    border-right: 1px solid #eee;
}

.alignItemsCenter {
    display: flex;
    align-items: center;
}
</style>
