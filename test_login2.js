const { login } = require('./lib/actions/auth.actions');
require('dotenv').config({ path: '.env.test.local' });

async function testLogin() {
    const formData = new FormData();
    formData.append('email', 'owner2@example.com');
    formData.append('password', 'Password@2026');
    // Call login with e2e testing enabled in env, but no cookie available
    const result = await login(formData);
    console.log(result);
}

testLogin().catch(console.error);
