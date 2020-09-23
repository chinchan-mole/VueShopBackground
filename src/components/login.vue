<template>
<div class="login_container">
    <div class="login_box">
        <div class="avatar">
            <img src="../assets/logo.png" alt />
        </div>
        <el-form class="login_form" :model="form" :rules="rules" label-width="90px" hide-requied-aterisk="false">
            <el-form-item label="Username:" prop="username">
                <el-input placeholder="Please input username" prefix-icon="iconfont icon-user" v-model="form.username"></el-input>
            </el-form-item>
            <el-form-item label="Password:" prop="password">
                <el-input type="password" placeholder="Please input password" prefix-icon="iconfont icon-3702mima" v-model="form.password" @keyup.enter.native="login"></el-input>
            </el-form-item>
            <el-form-item class="btns">
                <el-button type="primary" @click.native="login">Login</el-button>
                <el-button type="info" @click.native="reset">Reset</el-button>
            </el-form-item>
        </el-form>
    </div>
</div>
</template>

<script>
export default {
    data() {
        return {
            form: {
                username: "admin",
                password: "123456",
            },
            rules: {
                username: [{
                        required: true,
                        message: "请输入用户名！",
                        trigger: "blur"
                    },
                    {
                        min: 5,
                        max: 12,
                        message: "用户名长度在5-12位之间",
                        trigger: "blur"
                    },
                ],
                password: [{
                        required: true,
                        message: "请输入密码！",
                        trigger: "blur"
                    },
                    {
                        min: 6,
                        message: "密码长度至少为6位",
                        trigger: "blur"
                    },
                ],
            },
        }
    },
    methods: {
        reset: function () {
            this.form.username = "";
            this.form.password = "";
        },
        check: function () {
            return this.form.username.length >= 5 &&
                this.form.username.length <= 12 &&
                this.form.password.length >= 6 ?
                true :
                false;
        },
        login: async function () {
            if (this.check()) {
                let {
                    data: res
                } = await this.$axios.post("/login", this.form);
                if (res.meta.status != 200) return this.$message.error("登录失败");
                window.sessionStorage.setItem("token", res.data.token); //保存token至会话存储
                this.$message({
                    message: "登录成功",
                    type: "success",
                });
                window.sessionStorage.setItem('username',this.form.username);//用户名放置在会话存储中
                this.$router.push('/home'); //登录后发生路由跳转
            }
        },
    },
};
</script>

<style lang="less" scoped>
.login_container {
    background-color: #2b4b6b;
    height: 100%;

    .login_box {
        position: absolute;
        left: 50%;
        top: 50%;
        width: 450px;
        height: 300px;
        transform: translate(-50%, -50%);
        background-color: #fff;
        border-radius: 3px;

        .avatar {
            position: absolute;
            left: 50%;
            transform: translate(-50%, -50%);
            height: 130px;
            width: 130px;
            padding: 10px;
            border: 1px solid #eee;
            border-radius: 50%;
            background-color: #fff;

            img {
                width: 100%;
                height: 100%;
                border: 1px solid #eee;
                border-radius: 50%;
                background-color: #eee;
            }
        }

        .login_form {
            box-sizing: border-box;
            position: absolute;
            width: 100%;
            bottom: 0;
            padding: 0 20px 0 10px;

            .btns {
                position: relative;
                left: 50%;
                transform: translate(-190px);

                button {
                    margin-right: 70px;
                }
            }
        }
    }
}
</style>
