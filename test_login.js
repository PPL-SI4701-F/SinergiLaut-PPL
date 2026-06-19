const { login } = require('./lib/actions/auth.actions');

async function testLogin() {
    const formData = new FormData();
    formData.append('email', 'owner2@example.com');
    formData.append('password', 'Password@2026');
    const result = await login(formData);
    console.log(result);
}

testLogin().catch(console.error);
