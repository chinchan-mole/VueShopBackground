<template>
<div>
    <el-button type="primary" @click.native="logout">logout</el-button>
</div>
</template>

<script>
export default {
    data: () => ({}),
    methods: {
        logout: function () {
            window.sessionStorage.removeItem("token"); //删除本站的token,使用clear会清除其他token
            this.$message({
                message: "退出登录成功",
                type: "warning",
            });
            this.$router.push("/login"); //并返回登录界面
        },
    },
};
</script>

<style lang="less" scope>
</style>
